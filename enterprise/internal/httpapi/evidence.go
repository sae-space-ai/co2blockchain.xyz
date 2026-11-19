package httpapi

import (
	"encoding/hex"
	"fmt"
	"io"
	"mime"
	"net/http"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"co2evidence/enterprise/internal/ledger"
	"co2evidence/enterprise/internal/pack"
	"co2evidence/enterprise/internal/pg"
)

const maxEvidence = 3 * 1024 * 1024

var illegalFilename = regexp.MustCompile(`[^a-zA-Z0-9._-]+`)

func filename(name string) string {
	name = filepath.Base(strings.ReplaceAll(name, "\\", "/"))
	name = illegalFilename.ReplaceAllString(name, "_")
	if name == "" || name == "." || name == ".." {
		name = "document"
	}
	if len(name) > 120 {
		name = name[:120]
	}
	return name
}
func acceptContent(name string, b []byte) (string, error) {
	if len(b) == 0 || len(b) > maxEvidence {
		return "", fmt.Errorf("%w: file must be between 1 byte and 3 MiB", errInvalid)
	}
	ext := strings.ToLower(filepath.Ext(name))
	detected := http.DetectContentType(b)
	switch ext {
	case ".pdf":
		if strings.HasPrefix(string(b), "%PDF-") {
			return "application/pdf", nil
		}
	case ".png":
		if strings.HasPrefix(string(b), "\x89PNG\r\n\x1a\n") {
			return "image/png", nil
		}
	case ".jpg", ".jpeg":
		if len(b) >= 3 && b[0] == 0xff && b[1] == 0xd8 && b[2] == 0xff {
			return "image/jpeg", nil
		}
	case ".csv", ".txt":
		if utf8.Valid(b) && !strings.ContainsRune(string(b), 0) && !strings.Contains(strings.ToLower(string(b[:min(len(b), 200)])), "<script") {
			if ext == ".csv" {
				return "text/csv", nil
			}
			return "text/plain", nil
		}
	}
	return "", fmt.Errorf("%w: unsupported or mismatched document type (%s)", errInvalid, detected)
}
func claimEvidence(r *http.Request, c *pg.Conn, cl Claim, withContent bool) ([]pack.File, error) {
	sql := `SELECT evidence.id::text AS id,name,mime,size_bytes::text AS size,sha256 FROM evidence JOIN claim_evidence ON claim_evidence.evidence_id=evidence.id WHERE claim_evidence.claim_id=$1 AND evidence.org_id=$2 AND evidence.project_id=$3 ORDER BY evidence.id`
	rows, e := c.Query(r.Context(), sql, cl.ID, cl.Org, cl.Project)
	if e != nil {
		return nil, e
	}
	out := make([]pack.File, 0, len(rows))
	for _, x := range rows {
		n, e := strconv.Atoi(x.Str("size"))
		if e != nil {
			return nil, e
		}
		id := x.Str("id")
		out = append(out, pack.File{ID: id, Name: x.Str("name"), Mime: x.Str("mime"), Size: n, SHA256: x.Str("sha256"), Path: "documents/" + id + ".bin"})
	}
	return out, nil
}
func (s *Server) uploadEvidence(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	cl, _, e := loadClaim(r, c, u, r.PathValue("id"), true)
	if e != nil {
		return e
	}
	if cl.Status != "DRAFT" {
		return errConflict
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxEvidence+16384)
	mr, e := r.MultipartReader()
	if e != nil {
		return fmt.Errorf("%w: multipart/form-data required", errInvalid)
	}
	part, e := mr.NextPart()
	if e != nil {
		return fmt.Errorf("%w: missing file", errInvalid)
	}
	if part.FormName() != "file" || part.FileName() == "" {
		return errInvalid
	}
	original := filename(part.FileName())
	data, e := io.ReadAll(io.LimitReader(part, maxEvidence+1))
	if e != nil {
		return e
	}
	mimeType, e := acceptContent(original, data)
	if e != nil {
		return e
	}
	if next, e := mr.NextPart(); e != io.EOF || next != nil {
		return fmt.Errorf("%w: only one file field allowed", errInvalid)
	}
	sha := ledger.SHA(data)
	dups, e := c.Query(r.Context(), "SELECT id FROM evidence WHERE org_id=$1 AND sha256=$2 LIMIT 1", cl.Org, sha)
	if e != nil {
		return e
	}
	duplicate := len(dups) != 0
	id := ledger.UUID()
	if e := c.Begin(r.Context()); e != nil {
		return e
	}
	defer c.Rollback(r.Context())
	if e := lockClaim(r.Context(), c, cl.ID); e != nil {
		return e
	}
	status, e := c.Query(r.Context(), "SELECT status FROM claims WHERE id=$1", cl.ID)
	if e != nil {
		return e
	}
	if len(status) != 1 || status[0].Str("status") != "DRAFT" {
		return errConflict
	}
	if e := c.Exec(r.Context(), "INSERT INTO evidence(id,org_id,project_id,uploaded_by,name,mime,size_bytes,sha256,content) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)", id, cl.Org, cl.Project, u.UserID, original, mimeType, len(data), sha, data); e != nil {
		return e
	}
	if e := c.Exec(r.Context(), "INSERT INTO claim_evidence(claim_id,evidence_id) VALUES($1,$2)", cl.ID, id); e != nil {
		return e
	}
	if e := appendEvent(r.Context(), c, cl.ID, u.UserID, "EVIDENCE_LINKED", map[string]any{"id": id, "sha256": sha, "bytes": len(data), "name": original}); e != nil {
		return e
	}
	if e := audit(r.Context(), c, cl.Org, u.UserID, "evidence_uploaded", id); e != nil {
		return e
	}
	if e := c.Commit(r.Context()); e != nil {
		return e
	}
	respond(w, 201, map[string]any{"id": id, "sha256": sha, "bytes": len(data), "duplicateBytesWithinOrganization": duplicate, "trust": "hash equality only; not authenticity"})
	return nil
}
func (s *Server) downloadEvidence(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	id := r.PathValue("id")
	if !validID(id) {
		return errInvalid
	}
	rows, e := c.Query(r.Context(), `SELECT evidence.name,evidence.mime,evidence.sha256,encode(evidence.content,'hex') AS content_hex FROM evidence JOIN memberships ON memberships.org_id=evidence.org_id WHERE evidence.id=$1 AND memberships.user_id=$2`, id, u.UserID)
	if e != nil {
		return e
	}
	if len(rows) == 0 {
		return errNotFound
	}
	row := rows[0]
	data, e := hex.DecodeString(row.Str("content_hex"))
	if e != nil {
		return e
	}
	if ledger.SHA(data) != row.Str("sha256") {
		return errConflict
	}
	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", mime.FormatMediaType("attachment", map[string]string{"filename": filename(row.Str("name"))}))
	w.Header().Set("Content-Length", strconv.Itoa(len(data)))
	w.WriteHeader(200)
	_, e = w.Write(data)
	return e
}
func (s *Server) verifyClaim(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	cl, _, e := loadClaim(r, c, u, r.PathValue("id"), false)
	if e != nil {
		return e
	}
	events, e := queryEvents(r, c, cl)
	if e != nil {
		return e
	}
	chainErr := ledger.Verify(events)
	docs, e := claimEvidence(r, c, cl, false)
	if e != nil {
		return e
	}
	bad := []string{}
	for _, v := range docs {
		rows, e := c.Query(r.Context(), "SELECT encode(content,'hex') AS hex FROM evidence WHERE id=$1 AND org_id=$2", v.ID, cl.Org)
		if e != nil {
			return e
		}
		if len(rows) != 1 {
			bad = append(bad, v.ID)
			continue
		}
		b, e := hex.DecodeString(rows[0].Str("hex"))
		if e != nil {
			return e
		}
		if len(b) != v.Size || ledger.SHA(b) != v.SHA256 {
			bad = append(bad, v.ID)
		}
	}
	activities, e := claimActivities(r, c, cl)
	if e != nil {
		return e
	}
	refErr := pack.VerifyRelations(pack.Manifest{Version: "co2-enterprise-archive-v1", ClaimID: cl.ID, OrgID: cl.Org, ClaimStatus: cl.Status, Title: cl.Title, Events: events, Activities: activities, Evidence: docs, Disclaimer: pack.Disclaimer})
	respond(w, 200, map[string]any{"chainOK": chainErr == nil, "evidenceOK": len(bad) == 0, "referencesOK": refErr == nil, "badEvidence": bad, "events": len(events), "evidence": len(docs), "externalAnchor": false, "certification": false})
	return nil
}
func (s *Server) exportClaim(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	cl, _, e := loadClaim(r, c, u, r.PathValue("id"), false)
	if e != nil {
		return e
	}
	events, e := queryEvents(r, c, cl)
	if e != nil {
		return e
	}
	if e := ledger.Verify(events); e != nil {
		return errConflict
	}
	docs, e := claimEvidence(r, c, cl, false)
	if e != nil {
		return e
	}
	activities, e := claimActivities(r, c, cl)
	if e != nil {
		return e
	}
	contents := map[string][]byte{}
	for _, v := range docs {
		rows, e := c.Query(r.Context(), "SELECT encode(content,'hex') AS content_hex FROM evidence WHERE id=$1 AND org_id=$2", v.ID, cl.Org)
		if e != nil {
			return e
		}
		if len(rows) != 1 {
			return errConflict
		}
		data, e := hex.DecodeString(rows[0].Str("content_hex"))
		if e != nil {
			return e
		}
		if len(data) != v.Size || ledger.SHA(data) != v.SHA256 {
			return errConflict
		}
		contents[v.Path] = data
	}
	m := pack.Manifest{Version: "co2-enterprise-archive-v1", ClaimID: cl.ID, OrgID: cl.Org, ClaimStatus: cl.Status, Title: cl.Title, GeneratedAt: time.Now().UTC().Format(time.RFC3339), Events: events, Activities: activities, Evidence: docs, ExternalAnchor: false, Disclaimer: pack.Disclaimer}
	archive, e := pack.Build(m, contents)
	if e != nil {
		return e
	}
	if _, e = pack.VerifyArchive(archive); e != nil {
		return e
	}
	w.Header().Set("Content-Type", "application/zip")
	w.Header().Set("Content-Disposition", `attachment; filename="co2-evidence-expediente.zip"`)
	w.Header().Set("Content-Length", strconv.Itoa(len(archive)))
	w.WriteHeader(200)
	_, e = w.Write(archive)
	return e
}
