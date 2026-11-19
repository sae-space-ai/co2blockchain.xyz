package pack

import (
	"archive/zip"
	"bytes"
	"io"
	"testing"
	"time"

	"co2evidence/enterprise/internal/ledger"
)

func fixture() (Manifest, map[string][]byte) {
	cl, org, act := ledger.UUID(), ledger.UUID(), ledger.UUID()
	e := ledger.NewEvent(1, cl, act, "CLAIM_CREATED", map[string]string{"title": "Sintético", "status": "DRAFT"}, "GENESIS")
	data := []byte("FACTURA EXCLUSIVAMENTE SINTETICA\n")
	id := ledger.UUID()
	p := "documents/" + id + ".bin"
	return Manifest{Version: "co2-enterprise-archive-v1", ClaimID: cl, OrgID: org, ClaimStatus: "DRAFT", Title: "Sintético", GeneratedAt: time.Now().UTC().Format(time.RFC3339), Events: []ledger.Event{e, ledger.NewEvent(2, cl, act, "EVIDENCE_LINKED", map[string]any{"id": id, "sha256": ledger.SHA(data), "bytes": len(data), "name": "factura.txt"}, e.Hash)}, Evidence: []File{{ID: id, Name: "factura.txt", Mime: "text/plain", Size: len(data), SHA256: ledger.SHA(data), Path: p}}, ExternalAnchor: false, Disclaimer: Disclaimer}, map[string][]byte{p: data}
}
func TestBuildRoundTrip(t *testing.T) {
	m, docs := fixture()
	z, e := Build(m, docs)
	if e != nil {
		t.Fatal(e)
	}
	v, e := VerifyArchive(z)
	if e != nil {
		t.Fatal(e)
	}
	if v.ClaimID != m.ClaimID {
		t.Fatal("claim ID changed")
	}
}
func TestRejectMismatchedEvidence(t *testing.T) {
	m, docs := fixture()
	for k := range docs {
		docs[k] = []byte("tampered")
	}
	if _, e := Build(m, docs); e == nil {
		t.Fatal("accepted altered input")
	}
}
func TestRejectModifiedArchive(t *testing.T) {
	m, docs := fixture()
	z, e := Build(m, docs)
	if e != nil {
		t.Fatal(e)
	}
	r, e := zip.NewReader(bytes.NewReader(z), int64(len(z)))
	if e != nil {
		t.Fatal(e)
	}
	var b bytes.Buffer
	w := zip.NewWriter(&b)
	for _, f := range r.File {
		out, e := w.Create(f.Name)
		if e != nil {
			t.Fatal(e)
		}
		in, _ := f.Open()
		body, _ := io.ReadAll(in)
		in.Close()
		if f.Name != "manifest.json" {
			body = []byte("forged bytes")
		}
		out.Write(body)
	}
	w.Close()
	if _, e = VerifyArchive(b.Bytes()); e == nil {
		t.Fatal("accepted manipulated ZIP")
	}
}
func TestRejectBadEventAndTraversal(t *testing.T) {
	m, docs := fixture()
	m.Events[0].Hash = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
	if _, e := Build(m, docs); e == nil {
		t.Fatal("accepted tampered event")
	}
	m, docs = fixture()
	m.Evidence[0].Path = "../evil.txt"
	if _, e := Build(m, docs); e == nil {
		t.Fatal("accepted path traversal")
	}
}
func TestRejectExtraEntry(t *testing.T) {
	m, docs := fixture()
	z, e := Build(m, docs)
	if e != nil {
		t.Fatal(e)
	}
	rr, _ := zip.NewReader(bytes.NewReader(z), int64(len(z)))
	var b bytes.Buffer
	ww := zip.NewWriter(&b)
	for _, f := range rr.File {
		w, _ := ww.Create(f.Name)
		r, _ := f.Open()
		io.Copy(w, r)
		r.Close()
	}
	w, _ := ww.Create("extra.txt")
	w.Write([]byte("unexpected"))
	ww.Close()
	if _, e := VerifyArchive(b.Bytes()); e == nil {
		t.Fatal("accepted unknown entry")
	}
}
