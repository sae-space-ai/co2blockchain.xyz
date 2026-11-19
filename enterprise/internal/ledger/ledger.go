package ledger

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"regexp"
	"strconv"
	"strings"
	"time"
)

func UUID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[:4], b[4:6], b[6:8], b[8:10], b[10:])
}
func Token() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b)
}
func SHA(b []byte) string          { h := sha256.Sum256(b); return hex.EncodeToString(h[:]) }
func SecureEqual(a, b string) bool { return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1 }
func PBKDF2(pass string, salt []byte, iterations int) []byte { // HMAC-SHA256 password derivation, explicit STAGE policy (not Argon2id)
	mac := hmac.New(sha256.New, []byte(pass))
	mac.Write(salt)
	mac.Write([]byte{0, 0, 0, 1})
	u := mac.Sum(nil)
	out := append([]byte(nil), u...)
	for i := 1; i < iterations; i++ {
		mac = hmac.New(sha256.New, []byte(pass))
		mac.Write(u)
		u = mac.Sum(nil)
		for j := range out {
			out[j] ^= u[j]
		}
	}
	return out
}

const Iterations = 310000

func HashPassword(pass string) (string, error) {
	if len(pass) < 14 || len(pass) > 1024 {
		return "", errors.New("password must be 14-1024 characters")
	}
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	return fmt.Sprintf("pbkdf2-sha256$%d$%s$%s", Iterations, hex.EncodeToString(salt), hex.EncodeToString(PBKDF2(pass, salt, Iterations))), nil
}
func CheckPassword(pass, encoded string) bool {
	p := strings.Split(encoded, "$")
	if len(p) != 4 || p[0] != "pbkdf2-sha256" {
		return false
	}
	n, err := strconv.Atoi(p[1])
	if err != nil || n < 100000 || n > 1000000 {
		return false
	}
	salt, err := hex.DecodeString(p[2])
	if err != nil || len(salt) != 16 {
		return false
	}
	hash, err := hex.DecodeString(p[3])
	if err != nil || len(hash) != 32 {
		return false
	}
	return subtle.ConstantTimeCompare(PBKDF2(pass, salt, n), hash) == 1
}

var decimal = regexp.MustCompile(`^(0|[1-9][0-9]{0,15})(\.[0-9]{1,9})?$`)

func Exact(v string) (*big.Rat, error) {
	if !decimal.MatchString(v) {
		return nil, errors.New("decimal must be nonnegative, <=16 integer digits and <=9 fractional digits")
	}
	r, ok := new(big.Rat).SetString(v)
	if !ok {
		return nil, errors.New("invalid decimal")
	}
	return r, nil
}
func Calc(quantity, factor string) (string, string, error) {
	q, e := Exact(quantity)
	if e != nil {
		return "", "", e
	}
	f, e := Exact(factor)
	if e != nil {
		return "", "", e
	}
	kg := new(big.Rat).Mul(q, f)
	ton := new(big.Rat).Quo(kg, big.NewRat(1000, 1))
	return kg.FloatString(9), ton.FloatString(9), nil
}

// Unit and scope are checked separately. Factors must be supplied and sourced by the user.
func ValidUnit(u string) bool {
	switch u {
	case "kWh", "MWh", "litro", "m3", "kg", "t":
		return true
	}
	return false
}
func ValidScope(s string) bool { return s == "1" || s == "2" }

// Canonical v1 events encode a stable, typed sequence, not a mutable map.
type Event struct {
	Sequence int64           `json:"sequence"`
	ID       string          `json:"id"`
	ClaimID  string          `json:"claimId"`
	ActorID  string          `json:"actorId"`
	Time     string          `json:"time"`
	Type     string          `json:"type"`
	Payload  json.RawMessage `json:"payload"`
	Previous string          `json:"previousHash"`
	Hash     string          `json:"hash"`
}

func Canonical(e Event) []byte {
	v := struct {
		Version  int             `json:"version"`
		Sequence int64           `json:"sequence"`
		ID       string          `json:"id"`
		ClaimID  string          `json:"claimId"`
		ActorID  string          `json:"actorId"`
		Time     string          `json:"time"`
		Type     string          `json:"type"`
		Payload  json.RawMessage `json:"payload"`
		Previous string          `json:"previousHash"`
	}{1, e.Sequence, e.ID, e.ClaimID, e.ActorID, e.Time, e.Type, e.Payload, e.Previous}
	b, _ := json.Marshal(v)
	return b
}
func NewEvent(seq int64, claim, actor, kind string, payload any, previous string) Event {
	data, _ := json.Marshal(payload)
	e := Event{Sequence: seq, ID: UUID(), ClaimID: claim, ActorID: actor, Time: time.Now().UTC().Format(time.RFC3339Nano), Type: kind, Payload: data, Previous: previous}
	e.Hash = SHA(Canonical(e))
	return e
}
func Verify(events []Event) error {
	prev := "GENESIS"
	for i, e := range events {
		if e.Sequence != int64(i+1) || e.Previous != prev || e.Hash != SHA(Canonical(e)) {
			return fmt.Errorf("event %d failed chain validation", i+1)
		}
		prev = e.Hash
	}
	return nil
}
