// verify-rc6 verifies a self-contained CO2 Evidence Lab RC6 JSON export.
// It does not attest data provenance, timestamp or external immutability.
package ledgercheck

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"reflect"
	"time"
)

const maxInput = 4 * 1024 * 1024

var collections = []string{"projects", "factors", "activities", "scenarios", "evidences"}

type Event struct {
	ID             string `json:"id"`
	TS             string `json:"ts"`
	Action         string `json:"action"`
	Entity         string `json:"entity"`
	RecordID       string `json:"recordId"`
	Prev           string `json:"prev"`
	RecordHash     string `json:"recordHash"`
	RecordSnapshot string `json:"recordSnapshot"`
	Hash           string `json:"hash"`
}

type EventInput struct {
	ID         string `json:"id"`
	TS         string `json:"ts"`
	Action     string `json:"action"`
	Entity     string `json:"entity"`
	RecordID   string `json:"recordId"`
	Prev       string `json:"prev"`
	RecordHash string `json:"recordHash"`
}

type Report struct {
	OK             bool   `json:"ok"`
	Version        string `json:"version"`
	Events         int    `json:"events"`
	Records        int    `json:"records"`
	Head           string `json:"head"`
	Error          string `json:"error,omitempty"`
	ExternalAnchor bool   `json:"externalAnchor"`
	Note           string `json:"note"`
}

func digest(s string) string { h := sha256.Sum256([]byte(s)); return hex.EncodeToString(h[:]) }
func jsonSemantic(b []byte) (any, error) {
	dec := json.NewDecoder(bytes.NewReader(b))
	dec.UseNumber()
	var a any
	if err := dec.Decode(&a); err != nil {
		return nil, err
	}
	var extra any
	if err := dec.Decode(&extra); err != io.EOF {
		return nil, fmt.Errorf("trailing or invalid data")
	}
	return a, nil
}
func Check(input []byte) Report {
	r := Report{Version: "co2-evidence-rc6", ExternalAnchor: false, Note: "Integridad autocontenida de metadatos exclusivamente; no acredita origen, fecha, validez, documentos ni blockchain."}
	reject := func(s string) Report { r.Error = s; return r }
	if len(input) > maxInput {
		return reject("archivo supera 4 MiB")
	}
	var root map[string]json.RawMessage
	if err := json.Unmarshal(input, &root); err != nil || root == nil {
		return reject("JSON de nivel superior inválido")
	}
	var version string
	if err := json.Unmarshal(root["version"], &version); err != nil || version != r.Version {
		return reject("versión distinta de RC6")
	}
	registry := map[string]json.RawMessage{}
	for _, name := range collections {
		var arr []json.RawMessage
		if err := json.Unmarshal(root[name], &arr); err != nil || arr == nil {
			return reject("colección ausente o inválida: " + name)
		}
		if len(arr) > 20000 {
			return reject("colección excede 20000 registros")
		}
		seen := map[string]bool{}
		for _, raw := range arr {
			var obj map[string]json.RawMessage
			if err := json.Unmarshal(raw, &obj); err != nil || obj == nil {
				return reject("registro inválido: " + name)
			}
			var id string
			if err := json.Unmarshal(obj["id"], &id); err != nil || id == "" || len(id) > 120 || seen[id] {
				return reject("ID inválido o repetido en " + name)
			}
			seen[id] = true
			registry[name+":"+id] = raw
		}
	}
	r.Records = len(registry)
	var events []Event
	if err := json.Unmarshal(root["events"], &events); err != nil || events == nil {
		return reject("eventos ausentes o inválidos")
	}
	if len(events) > 20000 {
		return reject("demasiados eventos")
	}
	prev := "GENESIS"
	encountered := map[string]bool{}
	eventIDs := map[string]bool{}
	for i, e := range events {
		at := fmt.Sprintf("evento %d: ", i+1)
		if e.ID == "" || eventIDs[e.ID] {
			return reject(at + "ID de evento inválido o repetido")
		}
		eventIDs[e.ID] = true
		if e.Action != "create" {
			return reject(at + "acción no permitida")
		}
		nameAllowed := false
		for _, c := range collections {
			if c == e.Entity {
				nameAllowed = true
			}
		}
		if !nameAllowed {
			return reject(at + "colección desconocida")
		}
		if _, err := time.Parse(time.RFC3339Nano, e.TS); err != nil {
			return reject(at + "fecha inválida")
		}
		k := e.Entity + ":" + e.RecordID
		current, exists := registry[k]
		if !exists || encountered[k] {
			return reject(at + "registro inexistente o evento duplicado")
		}
		encountered[k] = true
		if digest(e.RecordSnapshot) != e.RecordHash {
			return reject(at + "snapshot/hash no coinciden")
		}
		snap, err := jsonSemantic([]byte(e.RecordSnapshot))
		if err != nil {
			return reject(at + "snapshot JSON inválida")
		}
		stored, err := jsonSemantic(current)
		if err != nil {
			return reject(at + "registro JSON inválido")
		}
		if !reflect.DeepEqual(snap, stored) {
			return reject(at + "metadatos actuales difieren de la instantánea")
		}
		if e.Prev != prev {
			return reject(at + "enlace al evento anterior incorrecto")
		}
		msg, _ := json.Marshal(EventInput{ID: e.ID, TS: e.TS, Action: e.Action, Entity: e.Entity, RecordID: e.RecordID, Prev: e.Prev, RecordHash: e.RecordHash})
		if digest(string(msg)) != e.Hash {
			return reject(at + "SHA-256 del evento incorrecto")
		}
		prev = e.Hash
	}
	if len(encountered) != len(registry) {
		return reject("existen registros sin evento")
	}
	r.OK = true
	r.Head = prev
	r.Records = len(registry)
	r.Events = len(events)
	return r
}
