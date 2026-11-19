// Package pack defines independently verifiable evidence archives. They are self-contained,
// NOT externally time-stamped, signed or protected against complete malicious reconstruction.
package pack

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path"
	"strings"

	"co2evidence/enterprise/internal/ledger"
)

type File struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Mime   string `json:"mime"`
	Size   int    `json:"size"`
	SHA256 string `json:"sha256"`
	Path   string `json:"path"`
}
type Manifest struct {
	Version        string              `json:"version"`
	ClaimID        string              `json:"claimId"`
	OrgID          string              `json:"orgId"`
	ClaimStatus    string              `json:"status"`
	Title          string              `json:"title"`
	GeneratedAt    string              `json:"generatedAt"`
	Events         []ledger.Event      `json:"events"`
	Activities     []map[string]string `json:"activities"`
	Evidence       []File              `json:"evidence"`
	ExternalAnchor bool                `json:"externalAnchor"`
	Disclaimer     string              `json:"disclaimer"`
}

const Disclaimer = "Self-contained hash chain; neither certified emissions nor proof of independent verification, source authenticity, or trusted timestamp."
const MaxEvidenceFiles = 20
const MaxArchiveBytes = 64 * 1024 * 1024

func validate(m Manifest) error {
	if m.Version != "co2-enterprise-archive-v1" || m.ClaimID == "" || m.OrgID == "" || m.ExternalAnchor || m.Disclaimer == "" {
		return errors.New("invalid manifest identity or unsupported claim of external anchor")
	}
	if len(m.Events) == 0 {
		return errors.New("missing event chain")
	}
	if len(m.Evidence) > MaxEvidenceFiles {
		return errors.New("too many documents in one package")
	}
	if e := ledger.Verify(m.Events); e != nil {
		return e
	}
	for _, ev := range m.Events {
		if ev.ClaimID != m.ClaimID {
			return errors.New("event from different claim")
		}
	}
	ids := map[string]bool{}
	evidenceIDs := map[string]bool{}
	for _, v := range m.Evidence {
		if v.Size < 1 || v.Size > 3*1024*1024 || len(v.SHA256) != 64 || v.Path != "documents/"+v.ID+".bin" || !safePath(v.Path) || ids[v.Path] || evidenceIDs[v.ID] {
			return errors.New("invalid evidence descriptor")
		}
		ids[v.Path] = true
		evidenceIDs[v.ID] = true
	}
	return VerifyRelations(m)
}
func safePath(v string) bool {
	return v != "" && v == path.Clean(v) && !strings.HasPrefix(v, "/") && !strings.Contains(v, "\\") && !strings.Contains(v, "../") && !strings.Contains(v, "..\\")
}
func VerifyArchive(content []byte) (Manifest, error) {
	var m Manifest
	if len(content) > MaxArchiveBytes {
		return m, errors.New("archive exceeds maximum")
	}
	z, e := zip.NewReader(bytes.NewReader(content), int64(len(content)))
	if e != nil {
		return m, e
	}
	if len(z.File) > MaxEvidenceFiles+1 {
		return m, errors.New("ZIP contains too many entries")
	}
	found := map[string]*zip.File{}
	var totalUncompressed uint64
	for _, f := range z.File {
		if f.UncompressedSize64 > MaxArchiveBytes || totalUncompressed > MaxArchiveBytes-f.UncompressedSize64 {
			return m, errors.New("ZIP exceeds uncompressed size ceiling")
		}
		totalUncompressed += f.UncompressedSize64
		if !safePath(f.Name) || f.FileInfo().IsDir() || f.Mode()&os.ModeSymlink != 0 || f.UncompressedSize64 > 4*1024*1024 || found[f.Name] != nil {
			return m, errors.New("unsafe, duplicate, or oversize ZIP entry")
		}
		found[f.Name] = f
	}
	mf, ok := found["manifest.json"]
	if !ok {
		return m, errors.New("manifest missing")
	}
	reader, e := mf.Open()
	if e != nil {
		return m, e
	}
	mb, e := io.ReadAll(io.LimitReader(reader, 1<<20))
	reader.Close()
	if e != nil {
		return m, e
	}
	if e = json.Unmarshal(mb, &m); e != nil {
		return m, e
	}
	if e = validate(m); e != nil {
		return m, e
	}
	if len(found) != len(m.Evidence)+1 {
		return m, errors.New("unexpected ZIP entries")
	}
	for _, meta := range m.Evidence {
		item, ok := found[meta.Path]
		if !ok {
			return m, fmt.Errorf("missing evidence %s", meta.ID)
		}
		r, e := item.Open()
		if e != nil {
			return m, e
		}
		b, e := io.ReadAll(io.LimitReader(r, 3*1024*1024+1))
		r.Close()
		if e != nil {
			return m, e
		}
		if len(b) != meta.Size || ledger.SHA(b) != meta.SHA256 {
			return m, fmt.Errorf("evidence %s hash or length differs", meta.ID)
		}
	}
	return m, nil
}
func Build(m Manifest, documents map[string][]byte) ([]byte, error) {
	if e := validate(m); e != nil {
		return nil, e
	}
	if len(documents) != len(m.Evidence) {
		return nil, errors.New("evidence cardinality mismatch")
	}
	var b bytes.Buffer
	z := zip.NewWriter(&b)
	mb, e := json.MarshalIndent(m, "", "  ")
	if e != nil {
		return nil, e
	}
	f, e := z.Create("manifest.json")
	if e != nil {
		return nil, e
	}
	if _, e = f.Write(mb); e != nil {
		return nil, e
	}
	for _, item := range m.Evidence {
		data, ok := documents[item.Path]
		if !ok || len(data) != item.Size || ledger.SHA(data) != item.SHA256 {
			return nil, errors.New("evidence missing or hash invalid")
		}
		f, e = z.Create(item.Path)
		if e != nil {
			return nil, e
		}
		if _, e = f.Write(data); e != nil {
			return nil, e
		}
	}
	if e = z.Close(); e != nil {
		return nil, e
	}
	return b.Bytes(), nil
}

// VerifyRelations binds the claim's published data to the event chain. It cannot
// stop a privileged administrator from reconstructing both the data and hashes.
func VerifyRelations(m Manifest) error {
	if len(m.Events) == 0 || m.Events[0].Type != "CLAIM_CREATED" {
		return errors.New("initial claim event absent")
	}
	initial := map[string]string{}
	if e := json.Unmarshal(m.Events[0].Payload, &initial); e != nil || initial["title"] != m.Title || initial["status"] != "DRAFT" {
		return errors.New("claim creation snapshot disagrees with manifest")
	}
	docs := map[string]File{}
	for _, f := range m.Evidence {
		docs[f.ID] = f
	}
	activities := map[string]string{}
	for _, a := range m.Activities {
		if a["id"] == "" {
			return errors.New("activity ID missing")
		}
		if _, exists := activities[a["id"]]; exists {
			return errors.New("duplicate activity ID")
		}
		b, e := json.Marshal(a)
		if e != nil {
			return e
		}
		activities[a["id"]] = ledger.SHA(b)
	}
	foundDocs := map[string]bool{}
	foundActs := map[string]bool{}
	status := "DRAFT"
	for _, e := range m.Events[1:] {
		switch e.Type {
		case "ACTIVITY_LINKED":
			var v struct {
				ActivityID   string `json:"activityId"`
				RecordSHA256 string `json:"recordSHA256"`
			}
			if json.Unmarshal(e.Payload, &v) != nil || v.ActivityID == "" || activities[v.ActivityID] != v.RecordSHA256 || foundActs[v.ActivityID] {
				return errors.New("activity differs from signed local snapshot")
			}
			foundActs[v.ActivityID] = true
		case "EVIDENCE_LINKED":
			var v struct {
				ID     string `json:"id"`
				SHA256 string `json:"sha256"`
				Bytes  int    `json:"bytes"`
				Name   string `json:"name"`
			}
			if json.Unmarshal(e.Payload, &v) != nil {
				return errors.New("bad evidence event")
			}
			d, ok := docs[v.ID]
			if !ok || d.SHA256 != v.SHA256 || d.Size != v.Bytes || d.Name != v.Name || foundDocs[v.ID] {
				return errors.New("evidence differs from local event snapshot")
			}
			foundDocs[v.ID] = true
		case "STATUS_CHANGED":
			var v struct {
				From string `json:"from"`
				To   string `json:"to"`
			}
			if json.Unmarshal(e.Payload, &v) != nil || v.From != status {
				return errors.New("invalid claim status history")
			}
			if !((v.From == "DRAFT" && v.To == "READY_FOR_REVIEW") || (v.From == "READY_FOR_REVIEW" && (v.To == "REVIEWED_INTERNAL" || v.To == "REJECTED_INTERNAL"))) {
				return errors.New("invalid state transition")
			}
			if v.To == "READY_FOR_REVIEW" && (len(foundActs) == 0 || len(foundDocs) == 0) {
				return errors.New("review without linked activity and evidence")
			}
			status = v.To
		default:
			return fmt.Errorf("unknown claim event kind %s", e.Type)
		}
	}
	if status != m.ClaimStatus || len(foundDocs) != len(docs) || len(foundActs) != len(activities) {
		return errors.New("manifest and event chronology disagree")
	}
	return nil
}
