package ledger

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestExactCalculation(t *testing.T) {
	cases := []struct{ q, f, kg, ton string }{{"1000", "2.5", "2500.000000000", "2.500000000"}, {"500", "0.2", "100.000000000", "0.100000000"}, {"0.000000001", "0.000000001", "0.000000000", "0.000000000"}}
	for _, tc := range cases {
		kg, ton, e := Calc(tc.q, tc.f)
		if e != nil || kg != tc.kg || ton != tc.ton {
			t.Errorf("Calc(%q,%q)=(%q,%q,%v)", tc.q, tc.f, kg, ton, e)
		}
	}
}
func TestExactRejects(t *testing.T) {
	for _, v := range []string{"-1", "NaN", "Infinity", "1e10", "1,5", "01", "1.1234567890", "1; DROP TABLE users", "", "+1"} {
		if _, e := Exact(v); e == nil {
			t.Errorf("accepted %q", v)
		}
	}
}
func TestHashPassword(t *testing.T) {
	h, e := HashPassword("ValidLongPassword_01")
	if e != nil || !CheckPassword("ValidLongPassword_01", h) || CheckPassword("anotherpassword", h) {
		t.Fatal("password hashing or verification incorrect")
	}
	if _, e = HashPassword("short"); e == nil {
		t.Fatal("weak password accepted")
	}
}
func TestEventsTampering(t *testing.T) {
	claim := UUID()
	actor := UUID()
	events := []Event{NewEvent(1, claim, actor, "CREATE", map[string]string{"title": "sample"}, "GENESIS")}
	events = append(events, NewEvent(2, claim, actor, "LINK", map[string]string{"evidence": "abc"}, events[0].Hash))
	if e := Verify(events); e != nil {
		t.Fatal(e)
	}
	altered := append([]Event(nil), events...)
	altered[1].Payload = json.RawMessage(`{"evidence":"changed"}`)
	if Verify(altered) == nil {
		t.Fatal("undetected tampering")
	}
	altered = append([]Event(nil), events[1], events[0])
	if Verify(altered) == nil {
		t.Fatal("undetected reorder")
	}
	if Verify(events[1:]) == nil {
		t.Fatal("undetected deletion")
	}
}
func TestUUIDUniquenessFormat(t *testing.T) {
	seen := map[string]bool{}
	for i := 0; i < 100; i++ {
		s := UUID()
		if len(s) != 36 || !strings.Contains(s, "-") || seen[s] {
			t.Fatalf("bad UUID %q", s)
		}
		seen[s] = true
	}
}
func TestTokenEntropyShape(t *testing.T) {
	if a, b := Token(), Token(); len(a) != 64 || len(b) != 64 || a == b {
		t.Fatal("invalid tokens")
	}
}
