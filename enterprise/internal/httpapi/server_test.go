package httpapi

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestActivityChecks(t *testing.T) {
	ok := ActivityInput{Period: "2026-11", Type: "electricity", Scope: "2", Quantity: "1000", Unit: "kWh", Factor: "0.2", FactorUnit: "kWh", FactorSource: "SYNTHETIC ONLY", FactorYear: 2026, Methodology: "location-based"}
	kg, tco, e := CheckActivity(ok)
	if e != nil || kg != "200.000000000" || tco != "0.200000000" {
		t.Fatalf("%s %s %v", kg, tco, e)
	}
	bad := ok
	bad.Factor = "NaN"
	if _, _, e = CheckActivity(bad); e == nil {
		t.Fatal("accepted NaN")
	}
	bad = ok
	bad.Scope = "1"
	if _, _, e = CheckActivity(bad); e == nil {
		t.Fatal("wrong scope")
	}
	bad = ok
	bad.FactorUnit = "litro"
	if _, _, e = CheckActivity(bad); e == nil {
		t.Fatal("wrong unit")
	}
	bad = ok
	bad.Period = "2026-13"
	if _, _, e = CheckActivity(bad); e == nil {
		t.Fatal("wrong period")
	}
	bad = ok
	bad.FactorSource = ""
	if _, _, e = CheckActivity(bad); e == nil {
		t.Fatal("missing source")
	}
}
func TestUnsafeContent(t *testing.T) {
	for _, name := range []string{"x.html", "invoice.exe", "x.pdf"} {
		if _, e := acceptContent(name, []byte("<html><script>foo</script></html>")); e == nil {
			t.Errorf("accepted %s", name)
		}
	}
	if _, e := acceptContent("a.txt", []byte("synthetic example text")); e != nil {
		t.Fatal(e)
	}
	if _, e := acceptContent("a.txt", []byte{0, 1, 2}); e == nil {
		t.Fatal("accepted binary as txt")
	}
}
func TestLivenessIsNotReadiness(t *testing.T) {
	s := New("", "http://localhost:8080")
	r := httptest.NewRequest("GET", "http://localhost:8080/api/health", nil)
	w := httptest.NewRecorder()
	s.Router().ServeHTTP(w, r)
	if w.Code != 200 || !bytes.Contains(w.Body.Bytes(), []byte("liveness")) {
		t.Fatalf("liveness wrong: %d %s", w.Code, w.Body.String())
	}
	r = httptest.NewRequest("GET", "http://localhost:8080/api/ready", nil)
	w = httptest.NewRecorder()
	s.Router().ServeHTTP(w, r)
	if w.Code != 503 {
		t.Fatalf("ready falsely returns %d", w.Code)
	}
}
func TestNoFalseWritesWithoutStorage(t *testing.T) {
	s := New("", "http://localhost:8080")
	r := httptest.NewRequest("POST", "http://localhost:8080/api/v1/organizations", bytes.NewReader([]byte(`{"name":"fake"}`)))
	r.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	s.Router().ServeHTTP(w, r)
	if w.Code != 503 {
		t.Fatalf("mutation without DB falsely returned %d", w.Code)
	}
}
func TestRejectCrossOrigin(t *testing.T) {
	s := New("", "https://stage.example.org")
	r := httptest.NewRequest("POST", "https://stage.example.org/api/v1/auth/login", bytes.NewReader([]byte(`{}`)))
	r.Header.Set("Origin", "https://evil.example.org")
	w := httptest.NewRecorder()
	s.Router().ServeHTTP(w, r)
	if w.Code != 403 {
		t.Fatalf("cross-origin accepted: %d", w.Code)
	}
}
func TestReadJSONStrict(t *testing.T) {
	r := httptest.NewRequest("POST", "http://localhost/api", bytes.NewReader([]byte(`{"name":"ok","role":"admin"}`)))
	r.Header.Set("Content-Type", "application/json")
	var v struct {
		Name string `json:"name"`
	}
	if e := readJSON(r, &v); e == nil {
		t.Fatal("unknown field accepted")
	}
}
func TestFilenameSafety(t *testing.T) {
	if v := filename("../../secret/<script>.pdf"); bytes.Contains([]byte(v), []byte("/")) || bytes.Contains([]byte(v), []byte("<")) {
		t.Fatalf("unsafe filename %s", v)
	}
}

var _ http.Handler = New("", "").Router()
