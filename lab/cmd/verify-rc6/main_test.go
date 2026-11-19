package main

import (
	"example.com/co2-evidence-ledger-stage/internal/ledgercheck"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestValidFixture(t *testing.T) {
	p := filepath.Join("..", "..", "tests", "synthetic_rc6.json")
	b, e := os.ReadFile(p)
	if e != nil {
		t.Fatal(e)
	}
	r := ledgercheck.Check(b)
	if !r.OK {
		t.Fatalf("fixture rejected: %s", r.Error)
	}
	if r.Events != 7 || r.Records != 7 || r.ExternalAnchor {
		t.Fatalf("bad report: %+v", r)
	}
}
func TestTamperedFixture(t *testing.T) {
	p := filepath.Join("..", "..", "tests", "synthetic_tampered_rc6.json")
	b, e := os.ReadFile(p)
	if e != nil {
		t.Fatal(e)
	}
	r := ledgercheck.Check(b)
	if r.OK || !strings.Contains(r.Error, "instantánea") {
		t.Fatalf("expected tamper rejection, got %+v", r)
	}
}
func TestInvalidAndOversize(t *testing.T) {
	for _, b := range [][]byte{[]byte("null"), []byte("{}"), []byte("[1]"), []byte(strings.Repeat("x", 4*1024*1024+1))} {
		if ledgercheck.Check(b).OK {
			t.Fatalf("accepted invalid input")
		}
	}
}
