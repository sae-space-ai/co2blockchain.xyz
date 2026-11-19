package pg

import (
	"bufio"
	"bytes"
	"context"
	"encoding/binary"
	"io"
	"net"
	"strings"
	"testing"
)

func sendBackend(c net.Conn, kind byte, body []byte) error {
	h := make([]byte, 5)
	h[0] = kind
	binary.BigEndian.PutUint32(h[1:], uint32(len(body)+4))
	if _, e := c.Write(h); e != nil {
		return e
	}
	_, e := c.Write(body)
	return e
}
func readFrontend(r *bufio.Reader) (byte, []byte, error) {
	h := make([]byte, 5)
	if _, e := io.ReadFull(r, h); e != nil {
		return 0, nil, e
	}
	n := binary.BigEndian.Uint32(h[1:])
	if n > 1<<20 || n < 4 {
		return 0, nil, io.ErrUnexpectedEOF
	}
	b := make([]byte, n-4)
	_, e := io.ReadFull(r, b)
	return h[0], b, e
}
func TestExtendedQueryKeepsParametersSeparate(t *testing.T) {
	client, server := net.Pipe()
	defer client.Close()
	defer server.Close()
	p := &Conn{conn: client, r: bufio.NewReader(client)}
	injection := "x'); DROP TABLE evidence; --"
	ch := make(chan error, 1)
	go func() {
		r := bufio.NewReader(server)
		var parseSQL, bindPayload string
		for i := 0; i < 5; i++ {
			typ, b, e := readFrontend(r)
			if e != nil {
				ch <- e
				return
			}
			if i == 0 && typ != 'P' {
				ch <- io.ErrUnexpectedEOF
				return
			}
			if typ == 'P' {
				parseSQL = string(b)
			}
			if typ == 'B' {
				bindPayload = string(b)
			}
		}
		if !strings.Contains(parseSQL, "$1") || strings.Contains(parseSQL, "DROP TABLE") || !strings.Contains(bindPayload, injection) {
			ch <- io.ErrUnexpectedEOF
			return
		}
		b := new(bytes.Buffer)
		binary.Write(b, binary.BigEndian, uint16(2))
		for _, name := range []string{"id", "value"} {
			strz(b, name)
			binary.Write(b, binary.BigEndian, uint32(0))
			binary.Write(b, binary.BigEndian, uint16(0))
			binary.Write(b, binary.BigEndian, uint32(25))
			binary.Write(b, binary.BigEndian, uint16(65535))
			binary.Write(b, binary.BigEndian, uint32(0xffffffff))
			binary.Write(b, binary.BigEndian, uint16(0))
		}
		if e := sendBackend(server, 'T', b.Bytes()); e != nil {
			ch <- e
			return
		}
		row := new(bytes.Buffer)
		binary.Write(row, binary.BigEndian, uint16(2))
		for _, v := range []string{"one", "matched"} {
			binary.Write(row, binary.BigEndian, uint32(len(v)))
			row.WriteString(v)
		}
		if e := sendBackend(server, 'D', row.Bytes()); e != nil {
			ch <- e
			return
		}
		sendBackend(server, 'C', []byte("SELECT 1\x00"))
		sendBackend(server, 'Z', []byte{'I'})
		ch <- nil
	}()
	rows, e := p.Query(context.Background(), "SELECT id,value FROM records WHERE name=$1", injection)
	if e != nil {
		t.Fatal(e)
	}
	if len(rows) != 1 || rows[0].Str("value") != "matched" {
		t.Fatalf("incorrect rows %+v", rows)
	}
	if e := <-ch; e != nil {
		t.Fatal(e)
	}
}
func TestMalformedResponseRejected(t *testing.T) {
	a, b := net.Pipe()
	defer a.Close()
	defer b.Close()
	p := &Conn{conn: a, r: bufio.NewReader(a)}
	go func() {
		r := bufio.NewReader(b)
		for i := 0; i < 5; i++ {
			_, _, _ = readFrontend(r)
		}
		sendBackend(b, 'D', []byte{0})
	}()
	if _, e := p.Query(context.Background(), "SELECT 1"); e == nil {
		t.Fatal("truncated row accepted")
	}
}
func TestDerivation(t *testing.T) {
	salted := derive([]byte("password"), []byte("salt"), 1)
	if len(salted) != 32 {
		t.Fatal("wrong SCRAM/PBKDF2 length")
	}
	a := derive([]byte("password"), []byte("salt"), 4096)
	b := derive([]byte("password"), []byte("salt"), 4096)
	if !bytes.Equal(a, b) {
		t.Fatal("nondeterministic PBKDF2")
	}
}
