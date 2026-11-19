// Package pg is a deliberately small PostgreSQL v3 wire client for this isolated stage.
// It supports TLS, SCRAM-SHA-256 and parameterized extended queries. It is NOT a production-
// reviewed replacement for a maintained driver such as pgx; migration to pgx is a release gate.
package pg

import (
	"bufio"
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/md5"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"crypto/tls"
	"encoding/base64"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"net"
	"net/url"
	"strconv"
	"strings"
	"time"
)

type Row map[string][]byte

func (r Row) Str(k string) string { return string(r[k]) }

type Client struct{ URL string }
type Conn struct {
	conn       net.Conn
	r          *bufio.Reader
	user, pass string
	secret     []byte
	ready      bool
}

func (c Client) Connect(ctx context.Context) (*Conn, error) {
	u, e := url.Parse(c.URL)
	if e != nil || u == nil || !(u.Scheme == "postgres" || u.Scheme == "postgresql") {
		return nil, errors.New("POSTGRES_URL requires postgres:// URL")
	}
	host := u.Hostname()
	if host == "" {
		return nil, errors.New("postgres hostname required")
	}
	port := u.Port()
	if port == "" {
		port = "5432"
	}
	user := u.User.Username()
	pass, _ := u.User.Password()
	if user == "" || pass == "" {
		return nil, errors.New("database credentials missing")
	}
	dbname := strings.TrimPrefix(u.EscapedPath(), "/")
	if dbname == "" {
		return nil, errors.New("database name required")
	}
	dbname, e = url.PathUnescape(dbname)
	if e != nil {
		return nil, e
	}
	sslmode := u.Query().Get("sslmode")
	if sslmode == "" {
		sslmode = "require"
	}
	if sslmode != "disable" && sslmode != "require" && sslmode != "verify-full" {
		return nil, errors.New("unsupported sslmode")
	}
	if sslmode == "disable" && host != "localhost" && host != "127.0.0.1" && host != "::1" {
		return nil, errors.New("unencrypted postgres forbidden outside localhost")
	}
	nc, e := (&net.Dialer{Timeout: 6 * time.Second}).DialContext(ctx, "tcp", net.JoinHostPort(host, port))
	if e != nil {
		return nil, e
	}
	deadline := time.Now().Add(12 * time.Second)
	if d, ok := ctx.Deadline(); ok && d.Before(deadline) {
		deadline = d
	}
	_ = nc.SetDeadline(deadline)
	if sslmode != "disable" {
		req := make([]byte, 8)
		binary.BigEndian.PutUint32(req[:4], 8)
		binary.BigEndian.PutUint32(req[4:], 80877103)
		if _, e = nc.Write(req); e != nil {
			nc.Close()
			return nil, e
		}
		response := make([]byte, 1)
		if _, e = io.ReadFull(nc, response); e != nil {
			nc.Close()
			return nil, e
		}
		if response[0] != 'S' {
			nc.Close()
			return nil, errors.New("postgres rejected TLS")
		}
		t := tls.Client(nc, &tls.Config{ServerName: host, MinVersion: tls.VersionTLS12, InsecureSkipVerify: sslmode == "require"})
		if e = t.HandshakeContext(ctx); e != nil {
			nc.Close()
			return nil, e
		}
		nc = t
	}
	conn := &Conn{conn: nc, r: bufio.NewReader(nc), user: user, pass: pass}
	startup := new(bytes.Buffer)
	binary.Write(startup, binary.BigEndian, uint32(196608))
	strz(startup, "user")
	strz(startup, user)
	strz(startup, "database")
	strz(startup, dbname)
	strz(startup, "application_name")
	strz(startup, "co2evidence-stage")
	startup.WriteByte(0)
	h := new(bytes.Buffer)
	binary.Write(h, binary.BigEndian, uint32(startup.Len()+4))
	h.Write(startup.Bytes())
	if _, e = nc.Write(h.Bytes()); e != nil {
		nc.Close()
		return nil, e
	}
	if e = conn.authenticate(); e != nil {
		nc.Close()
		return nil, e
	}
	_ = nc.SetDeadline(time.Time{})
	return conn, nil
}
func strz(b *bytes.Buffer, s string) { b.WriteString(s); b.WriteByte(0) }
func (p *Conn) send(typ byte, b []byte) error {
	if len(b) > 12*1024*1024 {
		return errors.New("postgres message too large")
	}
	buf := make([]byte, 5+len(b))
	buf[0] = typ
	binary.BigEndian.PutUint32(buf[1:], uint32(len(b)+4))
	copy(buf[5:], b)
	_, e := p.conn.Write(buf)
	return e
}
func (p *Conn) read() (byte, []byte, error) {
	h := make([]byte, 5)
	if _, e := io.ReadFull(p.r, h); e != nil {
		return 0, nil, e
	}
	n := binary.BigEndian.Uint32(h[1:])
	if n < 4 || n > 12*1024*1024 {
		return 0, nil, errors.New("invalid postgres message length")
	}
	data := make([]byte, n-4)
	_, e := io.ReadFull(p.r, data)
	return h[0], data, e
}
func cstr(data []byte) (string, []byte, error) {
	i := bytes.IndexByte(data, 0)
	if i < 0 {
		return "", nil, errors.New("missing NUL")
	}
	return string(data[:i]), data[i+1:], nil
}
func pgError(b []byte) error {
	var fields []string
	for len(b) > 0 && b[0] != 0 {
		code := b[0]
		b = b[1:]
		s, rest, e := cstr(b)
		if e != nil {
			return e
		}
		if code == 'M' || code == 'C' {
			fields = append(fields, s)
		}
		b = rest
	}
	return errors.New("postgres: " + strings.Join(fields, " | "))
}
func (p *Conn) authenticate() error {
	var authMessage, expectedSig string
	var didSCRAM bool
	for {
		typ, body, e := p.read()
		if e != nil {
			return e
		}
		switch typ {
		case 'R':
			if len(body) < 4 {
				return errors.New("postgres auth too short")
			}
			kind := binary.BigEndian.Uint32(body[:4])
			body = body[4:]
			switch kind {
			case 0:
			case 3: // PasswordMessage cleartext, only used in local test or after TLS
				if _, ok := p.conn.(*tls.Conn); !ok {
					return errors.New("cleartext auth requires TLS")
				}
				var b bytes.Buffer
				strz(&b, p.pass)
				if e = p.send('p', b.Bytes()); e != nil {
					return e
				}
			case 5:
				if len(body) != 4 {
					return errors.New("bad MD5 salt")
				}
				h := md5.Sum([]byte(p.pass + p.user))
				h2 := md5.Sum(append([]byte(hex.EncodeToString(h[:])), body...))
				if e = p.send('p', append([]byte("md5"+hex.EncodeToString(h2[:])), 0)); e != nil {
					return e
				}
			case 10:
				if !bytes.Contains(body, []byte("SCRAM-SHA-256\x00")) {
					return errors.New("SCRAM-SHA-256 not offered")
				}
				nonce := make([]byte, 18)
				if _, e = rand.Read(nonce); e != nil {
					return e
				}
				clientNonce := base64.RawStdEncoding.EncodeToString(nonce)
				bare := "n=,r=" + clientNonce
				clientFirst := "n,," + bare
				p.secret = []byte(bare)
				var b bytes.Buffer
				strz(&b, "SCRAM-SHA-256")
				binary.Write(&b, binary.BigEndian, uint32(len(clientFirst)))
				b.WriteString(clientFirst)
				if e = p.send('p', b.Bytes()); e != nil {
					return e
				}
			case 11:
				first := string(body)
				parts := map[string]string{}
				for _, segment := range strings.Split(first, ",") {
					if len(segment) > 2 && segment[1] == '=' {
						parts[segment[:1]] = segment[2:]
					}
				}
				r, s, i := parts["r"], parts["s"], parts["i"]
				bare := string(p.secret)
				prefix := strings.TrimPrefix(bare, "n=,r=")
				if !strings.HasPrefix(r, prefix) || len(r) <= len(prefix) {
					return errors.New("SCRAM nonce mismatch")
				}
				salt, e := base64.StdEncoding.DecodeString(s)
				if e != nil {
					return e
				}
				rounds, e := strconv.Atoi(i)
				if e != nil || rounds < 4096 || rounds > 200000 {
					return errors.New("SCRAM iteration rejected")
				}
				salted := derive([]byte(p.pass), salt, rounds)
				clientKey := mac(salted, []byte("Client Key"))
				stored := sha256.Sum256(clientKey)
				finalNoProof := "c=biws,r=" + r
				authMessage = bare + "," + first + "," + finalNoProof
				sig := mac(stored[:], []byte(authMessage))
				proof := make([]byte, len(clientKey))
				for j := range proof {
					proof[j] = clientKey[j] ^ sig[j]
				}
				serverKey := mac(salted, []byte("Server Key"))
				expectedSig = base64.StdEncoding.EncodeToString(mac(serverKey, []byte(authMessage)))
				reply := finalNoProof + ",p=" + base64.StdEncoding.EncodeToString(proof)
				if e = p.send('p', []byte(reply)); e != nil {
					return e
				}
				didSCRAM = true
			case 12:
				if !didSCRAM || !strings.HasPrefix(string(body), "v=") || subtle.ConstantTimeCompare([]byte(strings.TrimPrefix(string(body), "v=")), []byte(expectedSig)) != 1 {
					return errors.New("SCRAM server signature invalid")
				}
			default:
				return fmt.Errorf("unsupported postgres authentication %d", kind)
			}
		case 'E':
			return pgError(body)
		case 'Z':
			return nil
		case 'S', 'K', 'N': // parameter status, backend key, notice
		default:
			return fmt.Errorf("unexpected startup message %q", typ)
		}
	}
}
func mac(key, b []byte) []byte { h := hmac.New(sha256.New, key); h.Write(b); return h.Sum(nil) }
func derive(password, salt []byte, rounds int) []byte {
	h := hmac.New(sha256.New, password)
	h.Write(salt)
	h.Write([]byte{0, 0, 0, 1})
	u := h.Sum(nil)
	out := append([]byte(nil), u...)
	for i := 1; i < rounds; i++ {
		u = mac(password, u)
		for j := range out {
			out[j] ^= u[j]
		}
	}
	return out
}
func (p *Conn) Close() error { return p.conn.Close() }

// Query sends all parameter values as text and uses the PostgreSQL extended protocol.
// Parameters are never SQL-interpolated. []byte values are passed as BYTEA hex text.
func (p *Conn) Query(ctx context.Context, sql string, args ...any) ([]Row, error) {
	deadline := time.Now().Add(15 * time.Second)
	if d, ok := ctx.Deadline(); ok && d.Before(deadline) {
		deadline = d
	}
	_ = p.conn.SetDeadline(deadline)
	defer p.conn.SetDeadline(time.Time{})
	if strings.IndexByte(sql, 0) >= 0 {
		return nil, errors.New("NUL in SQL")
	}
	parse := new(bytes.Buffer)
	strz(parse, "")
	strz(parse, sql)
	binary.Write(parse, binary.BigEndian, uint16(0))
	if e := p.send('P', parse.Bytes()); e != nil {
		return nil, e
	}
	bind := new(bytes.Buffer)
	strz(bind, "")
	strz(bind, "")
	binary.Write(bind, binary.BigEndian, uint16(0))
	if len(args) > 32767 {
		return nil, errors.New("too many SQL parameters")
	}
	binary.Write(bind, binary.BigEndian, uint16(len(args)))
	for _, x := range args {
		if x == nil {
			binary.Write(bind, binary.BigEndian, int32(-1))
			continue
		}
		var value string
		switch v := x.(type) {
		case []byte:
			value = "\\x" + hex.EncodeToString(v)
		case string:
			value = v
		case bool:
			if v {
				value = "true"
			} else {
				value = "false"
			}
		case int:
			value = strconv.Itoa(v)
		case int64:
			value = strconv.FormatInt(v, 10)
		case float64:
			value = strconv.FormatFloat(v, 'g', -1, 64)
		default:
			return nil, fmt.Errorf("unsupported SQL arg %T", x)
		}
		binary.Write(bind, binary.BigEndian, int32(len(value)))
		bind.WriteString(value)
	}
	binary.Write(bind, binary.BigEndian, uint16(0))
	if e := p.send('B', bind.Bytes()); e != nil {
		return nil, e
	}
	if e := p.send('D', []byte{'P', 0}); e != nil {
		return nil, e
	}
	execute := make([]byte, 5)
	if e := p.send('E', execute); e != nil {
		return nil, e
	}
	if e := p.send('S', nil); e != nil {
		return nil, e
	}
	var names []string
	var result []Row
	var queryErr error
	for {
		typ, b, e := p.read()
		if e != nil {
			return nil, e
		}
		switch typ {
		case 'T':
			if len(b) < 2 {
				return nil, errors.New("bad RowDescription")
			}
			count := int(binary.BigEndian.Uint16(b[:2]))
			b = b[2:]
			names = names[:0]
			for i := 0; i < count; i++ {
				name, rest, err := cstr(b)
				if err != nil || len(rest) < 18 {
					return nil, errors.New("bad RowDescription column")
				}
				names = append(names, name)
				b = rest[18:]
			}
		case 'D':
			if len(b) < 2 {
				return nil, errors.New("bad DataRow")
			}
			n := int(binary.BigEndian.Uint16(b[:2]))
			b = b[2:]
			if n != len(names) {
				return nil, errors.New("row field mismatch")
			}
			row := Row{}
			for _, name := range names {
				if len(b) < 4 {
					return nil, errors.New("truncated DataRow")
				}
				l := int32(binary.BigEndian.Uint32(b[:4]))
				b = b[4:]
				if l < 0 {
					row[name] = nil
					continue
				}
				if l > int32(len(b)) {
					return nil, errors.New("bad column length")
				}
				row[name] = append([]byte(nil), b[:l]...)
				b = b[l:]
			}
			result = append(result, row)
		case 'E':
			queryErr = pgError(b)
		case 'Z':
			return result, queryErr
		case '1', '2', '3', 't', 'n', 'C', 'I', 'N':
		default:
			return nil, fmt.Errorf("unexpected query response %q", typ)
		}
	}
}
func (p *Conn) Exec(ctx context.Context, sql string, args ...any) error {
	_, e := p.Query(ctx, sql, args...)
	return e
}
func (p *Conn) Begin(ctx context.Context) error    { return p.Exec(ctx, "BEGIN") }
func (p *Conn) Commit(ctx context.Context) error   { return p.Exec(ctx, "COMMIT") }
func (p *Conn) Rollback(ctx context.Context) error { return p.Exec(ctx, "ROLLBACK") }
