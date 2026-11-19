package pack

import (
	"archive/zip"
	"bytes"
	"fmt"
	"os"
	"strings"
	"testing"
)

func TestRC71RejectMoreThan20Documents(t *testing.T) {
	m, docs := fixture()
	for len(m.Evidence) < MaxEvidenceFiles+1 {
		f := m.Evidence[0]
		f.ID = fmt.Sprintf("id-%d", len(m.Evidence))
		f.Path = "documents/" + f.ID + ".bin"
		m.Evidence = append(m.Evidence, f)
		docs[f.Path] = docs[m.Evidence[0].Path]
	}
	if _, err := Build(m, docs); err == nil || !strings.Contains(err.Error(), "too many documents") {
		t.Fatalf("document limit not enforced: %v", err)
	}
}
func TestRC71RejectTooManyZipEntries(t *testing.T) {
	var b bytes.Buffer
	w := zip.NewWriter(&b)
	for i := 0; i < MaxEvidenceFiles+2; i++ {
		f, err := w.Create(fmt.Sprintf("documents/%d.bin", i))
		if err != nil {
			t.Fatal(err)
		}
		f.Write([]byte("x"))
	}
	if err := w.Close(); err != nil {
		t.Fatal(err)
	}
	if _, err := VerifyArchive(b.Bytes()); err == nil || !strings.Contains(err.Error(), "too many entries") {
		t.Fatalf("ZIP entry limit bypass: %v", err)
	}
}
func TestRC71RejectZipSymlink(t *testing.T) {
	var b bytes.Buffer
	z := zip.NewWriter(&b)
	h := &zip.FileHeader{Name: "manifest.json", Method: zip.Store}
	h.SetMode(os.ModeSymlink | 0777)
	f, err := z.CreateHeader(h)
	if err != nil {
		t.Fatal(err)
	}
	f.Write([]byte("etc/passwd"))
	z.Close()
	if _, err := VerifyArchive(b.Bytes()); err == nil || !strings.Contains(err.Error(), "unsafe") {
		t.Fatalf("ZIP symlink accepted: %v", err)
	}
}
func TestRC71RejectZipUncompressedBomb(t *testing.T) {
	var b bytes.Buffer
	z := zip.NewWriter(&b)
	block := make([]byte, 4*1024*1024)
	for i := 0; i < 17; i++ {
		f, err := z.Create(fmt.Sprintf("documents/%d.bin", i))
		if err != nil {
			t.Fatal(err)
		}
		if _, err := f.Write(block); err != nil {
			t.Fatal(err)
		}
	}
	z.Close()
	if _, err := VerifyArchive(b.Bytes()); err == nil || !strings.Contains(err.Error(), "uncompressed") {
		t.Fatalf("ZIP bomb accepted: %v", err)
	}
}
func TestRC71RejectDuplicateActivities(t *testing.T) {
	m, _ := fixture()
	activity := map[string]string{"id": "a", "period": "2026-11", "factor": "0.2"}
	m.Activities = []map[string]string{activity, activity}
	if err := VerifyRelations(m); err == nil || !strings.Contains(err.Error(), "duplicate activity") {
		t.Fatalf("duplicate activity not rejected: %v", err)
	}
}
