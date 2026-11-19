package main

import (
	"archive/zip"
	"bytes"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestPackageRoundTrip(t *testing.T) {
	base := filepath.Join("..", "..", "tests")
	dest := filepath.Join(t.TempDir(), "export.zip")
	if err := createPackage(filepath.Join(base, "synthetic_rc6.json"), filepath.Join(base, "fixtures"), dest); err != nil {
		t.Fatal(err)
	}
	n, err := verifyPackage(dest)
	if err != nil || n != 1 {
		t.Fatalf("verify: n=%d err=%v", n, err)
	}
	// Existing output is never overwritten.
	if err := createPackage(filepath.Join(base, "synthetic_rc6.json"), filepath.Join(base, "fixtures"), dest); err == nil {
		t.Fatal("overwrote output")
	}
}
func TestRejectMissingOrAlteredOriginal(t *testing.T) {
	base := filepath.Join("..", "..", "tests")
	dest := filepath.Join(t.TempDir(), "export.zip")
	empty := t.TempDir()
	if err := createPackage(filepath.Join(base, "synthetic_rc6.json"), empty, dest); err == nil {
		t.Fatal("accepted missing evidence")
	}
	if err := os.WriteFile(filepath.Join(empty, "factura-SINTETICA.txt"), []byte("FALSO"), 0600); err != nil {
		t.Fatal(err)
	}
	if err := createPackage(filepath.Join(base, "synthetic_rc6.json"), empty, dest); err == nil {
		t.Fatal("accepted altered evidence")
	}
}
func TestRejectManipulatedZipDocumentAndTraversal(t *testing.T) {
	base := filepath.Join("..", "..", "tests")
	orig := filepath.Join(t.TempDir(), "original.zip")
	if err := createPackage(filepath.Join(base, "synthetic_rc6.json"), filepath.Join(base, "fixtures"), orig); err != nil {
		t.Fatal(err)
	}
	reader, err := zip.OpenReader(orig)
	if err != nil {
		t.Fatal(err)
	}
	defer reader.Close()
	for _, mutation := range []string{"tamper", "traversal", "extra"} {
		dest := filepath.Join(t.TempDir(), mutation+".zip")
		file, err := os.Create(dest)
		if err != nil {
			t.Fatal(err)
		}
		out := zip.NewWriter(file)
		for _, f := range reader.File {
			rc, err := f.Open()
			if err != nil {
				t.Fatal(err)
			}
			b, err := io.ReadAll(rc)
			rc.Close()
			if err != nil {
				t.Fatal(err)
			}
			if mutation == "tamper" && strings.HasPrefix(f.Name, "evidence/") {
				b = bytes.Repeat([]byte("A"), len(b))
			}
			writer, err := out.Create(f.Name)
			if err != nil {
				t.Fatal(err)
			}
			if _, err = writer.Write(b); err != nil {
				t.Fatal(err)
			}
		}
		if mutation == "traversal" {
			wr, _ := out.Create("../malicious.txt")
			wr.Write([]byte("bad"))
		}
		if mutation == "extra" {
			wr, _ := out.Create("unexpected.txt")
			wr.Write([]byte("bad"))
		}
		if err := out.Close(); err != nil {
			t.Fatal(err)
		}
		file.Close()
		if _, err := verifyPackage(dest); err == nil {
			t.Fatalf("accepted %s", mutation)
		}
	}
}
