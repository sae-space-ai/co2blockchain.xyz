package httpapi

import (
	"bytes"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRC71MediaTypeStrict(t *testing.T) {
	cases := []struct {
		mime  string
		valid bool
	}{
		{"application/json", true},
		{"application/json; charset=utf-8", true},
		{"application/jsonp", false},
		{"application/json;charset=broken@bad", false},
		{"text/plain", false},
	}
	for _, tc := range cases {
		r := httptest.NewRequest(http.MethodPost, "/api", bytes.NewBufferString(`{"name":"test"}`))
		r.Header.Set("Content-Type", tc.mime)
		var v struct {
			Name string `json:"name"`
		}
		err := readJSON(r, &v)
		if (err == nil) != tc.valid {
			t.Errorf("content type %q error=%v", tc.mime, err)
		}
	}
}

func TestRC71IPv6ClientIPsIndependent(t *testing.T) {
	if clientIP("[2001:db8::1]:65535") != "2001:db8::1" {
		t.Fatal("IPv6 remote address collapsed")
	}
	if clientIP("[2001:db8::2]:12345") != "2001:db8::2" {
		t.Fatal("second IPv6 failed")
	}
	if clientIP("192.0.2.42:567") != "192.0.2.42" {
		t.Fatal("IPv4 parsing failed")
	}
	if clientIP("bad-user-controlled-ip") != "unknown" {
		t.Fatal("malformed remote should fail closed")
	}
	s := New("", "http://localhost:8080")
	for i := 0; i < 6; i++ {
		if !s.allowLogin("2001:db8::1") {
			t.Fatalf("denied too early: %d", i)
		}
	}
	if s.allowLogin("2001:db8::1") {
		t.Fatal("rate limiter did not stop 7th request")
	}
	if !s.allowLogin("2001:db8::2") {
		t.Fatal("independent IPv6 source was blocked")
	}
}
func TestRC71CrossSiteFetchMetadataNoOrigin(t *testing.T) {
	s := New("", "https://stage.example.org")
	r := httptest.NewRequest("POST", "https://stage.example.org/api/v1/auth/login", bytes.NewBufferString(`{}`))
	r.Header.Set("Sec-Fetch-Site", "cross-site")
	w := httptest.NewRecorder()
	s.Router().ServeHTTP(w, r)
	if w.Code != 403 {
		t.Fatalf("cross-site without Origin accepted: %d", w.Code)
	}
}
func TestRC71OverLimitResponds413(t *testing.T) {
	for _, err := range []error{errTooLarge, &http.MaxBytesError{Limit: 3 * 1024 * 1024}, errors.Join(errors.New("reading body"), &http.MaxBytesError{Limit: 50})} {
		w := httptest.NewRecorder()
		fail(w, err)
		if w.Code != http.StatusRequestEntityTooLarge {
			t.Fatalf("expected 413, got %d (%v)", w.Code, err)
		}
	}
	if _, err := acceptContent("evidence.txt", make([]byte, maxEvidence+1)); !errors.Is(err, errTooLarge) {
		t.Fatalf("oversized accepted or error %v", err)
	}
}
