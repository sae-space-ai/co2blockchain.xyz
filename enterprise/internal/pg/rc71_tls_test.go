package pg

import (
	"context"
	"strings"
	"testing"
)

func TestRC71RemoteTLSFailsClosed(t *testing.T) {
	for _, mode := range []string{"require", "disable"} {
		_, err := (Client{URL: "postgres://stage:secret@db.example.invalid/co2_stage?sslmode=" + mode}).Connect(context.Background())
		if err == nil {
			t.Fatal("remote TLS unsafe connection unexpectedly accepted")
		}
		if mode == "require" && !strings.Contains(err.Error(), "verify-full") {
			t.Errorf("expected full certificate check requirement: %s", err)
		}
		if mode == "disable" && !strings.Contains(err.Error(), "unencrypted") {
			t.Errorf("expected remote plaintext rejection: %s", err)
		}
	}
}
