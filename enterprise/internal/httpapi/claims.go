package httpapi

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"co2evidence/enterprise/internal/ledger"
	"co2evidence/enterprise/internal/pg"
)

type Claim struct {
	ID        string `json:"id"`
	Org       string `json:"org"`
	Project   string `json:"project"`
	Title     string `json:"title"`
	Status    string `json:"status"`
	CreatedBy string `json:"createdBy"`
}

func loadClaim(r *http.Request, c *pg.Conn, u Identity, id string, write bool) (Claim, string, error) {
	if !validID(id) {
		return Claim{}, "", errInvalid
	}
	rows, e := c.Query(r.Context(), "SELECT id::text AS id,org_id::text AS org,project_id::text AS project,title,status,created_by::text AS created_by FROM claims WHERE id=$1", id)
	if e != nil {
		return Claim{}, "", e
	}
	if len(rows) != 1 {
		return Claim{}, "", errNotFound
	}
	v := rows[0]
	claim := Claim{ID: v.Str("id"), Org: v.Str("org"), Project: v.Str("project"), Title: v.Str("title"), Status: v.Str("status"), CreatedBy: v.Str("created_by")}
	role, e := membership(r.Context(), c, claim.Org, u.UserID, write)
	return claim, role, e
}
func appendEvent(ctx context.Context, c *pg.Conn, claim, actor, kind string, payload any) error {
	// All callers must hold claim row lock within a transaction before appending.
	rows, e := c.Query(ctx, "SELECT sequence,event_hash FROM claim_events WHERE claim_id=$1 ORDER BY sequence DESC LIMIT 1", claim)
	if e != nil {
		return e
	}
	seq := int64(1)
	prev := "GENESIS"
	if len(rows) > 0 {
		last, e := strconv.ParseInt(rows[0].Str("sequence"), 10, 64)
		if e != nil {
			return e
		}
		seq = last + 1
		prev = rows[0].Str("event_hash")
	}
	ev := ledger.NewEvent(seq, claim, actor, kind, payload, prev)
	return c.Exec(ctx, "INSERT INTO claim_events(claim_id,sequence,event_id,actor_id,event_time,kind,payload_text,previous_hash,event_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)", claim, ev.Sequence, ev.ID, actor, ev.Time, kind, string(ev.Payload), prev, ev.Hash)
}
func lockClaim(ctx context.Context, c *pg.Conn, claim string) error {
	rows, e := c.Query(ctx, "SELECT id FROM claims WHERE id=$1 FOR UPDATE", claim)
	if e != nil {
		return e
	}
	if len(rows) != 1 {
		return errNotFound
	}
	return nil
}
func (s *Server) createClaim(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	var in struct {
		Org     string `json:"org"`
		Project string `json:"project"`
		Title   string `json:"title"`
	}
	if e := readJSON(r, &in); e != nil {
		return e
	}
	if _, e := membership(r.Context(), c, in.Org, u.UserID, true); e != nil {
		return e
	}
	if e := validProject(r, c, in.Org, in.Project); e != nil {
		return e
	}
	in.Title = strings.TrimSpace(in.Title)
	if len(in.Title) < 2 || len(in.Title) > 180 {
		return fmt.Errorf("%w: invalid claim title", errInvalid)
	}
	id := ledger.UUID()
	if e := c.Begin(r.Context()); e != nil {
		return e
	}
	defer c.Rollback(r.Context())
	if e := c.Exec(r.Context(), "INSERT INTO claims(id,org_id,project_id,title,status,created_by) VALUES($1,$2,$3,$4,'DRAFT',$5)", id, in.Org, in.Project, in.Title, u.UserID); e != nil {
		return e
	}
	if e := lockClaim(r.Context(), c, id); e != nil {
		return e
	}
	if e := appendEvent(r.Context(), c, id, u.UserID, "CLAIM_CREATED", map[string]any{"title": in.Title, "status": "DRAFT"}); e != nil {
		return e
	}
	if e := audit(r.Context(), c, in.Org, u.UserID, "claim_created", id); e != nil {
		return e
	}
	if e := c.Commit(r.Context()); e != nil {
		return e
	}
	respond(w, 201, Claim{ID: id, Org: in.Org, Project: in.Project, Title: in.Title, Status: "DRAFT", CreatedBy: u.UserID})
	return nil
}
func (s *Server) listClaims(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	org := r.URL.Query().Get("org")
	if _, e := membership(r.Context(), c, org, u.UserID, false); e != nil {
		return e
	}
	rows, e := c.Query(r.Context(), "SELECT id::text AS id,org_id::text AS org,project_id::text AS project,title,status,created_by::text AS created_by FROM claims WHERE org_id=$1 ORDER BY created_at DESC LIMIT 200", org)
	if e != nil {
		return e
	}
	out := make([]Claim, 0, len(rows))
	for _, v := range rows {
		out = append(out, Claim{ID: v.Str("id"), Org: v.Str("org"), Project: v.Str("project"), Title: v.Str("title"), Status: v.Str("status"), CreatedBy: v.Str("created_by")})
	}
	respond(w, 200, map[string]any{"claims": out})
	return nil
}
func (s *Server) getClaim(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	cl, _, e := loadClaim(r, c, u, r.PathValue("id"), false)
	if e != nil {
		return e
	}
	a, e := claimActivities(r, c, cl)
	if e != nil {
		return e
	}
	documents, e := claimEvidence(r, c, cl, false)
	if e != nil {
		return e
	}
	respond(w, 200, map[string]any{"claim": cl, "activities": a, "evidence": documents, "disclaimer": "Internal review does not constitute external verification"})
	return nil
}
func (s *Server) linkActivity(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	cl, _, e := loadClaim(r, c, u, r.PathValue("id"), true)
	if e != nil {
		return e
	}
	if cl.Status != "DRAFT" {
		return errConflict
	}
	var in struct {
		Activity string `json:"activity"`
	}
	if e := readJSON(r, &in); e != nil {
		return e
	}
	if !validID(in.Activity) {
		return errInvalid
	}
	if e := c.Begin(r.Context()); e != nil {
		return e
	}
	defer c.Rollback(r.Context())
	if e := lockClaim(r.Context(), c, cl.ID); e != nil {
		return e
	}
	current, e := c.Query(r.Context(), "SELECT status FROM claims WHERE id=$1", cl.ID)
	if e != nil {
		return e
	}
	if len(current) != 1 || current[0].Str("status") != "DRAFT" {
		return errConflict
	}
	rows, e := c.Query(r.Context(), "SELECT id FROM activities WHERE id=$1 AND project_id=$2 AND org_id=$3", in.Activity, cl.Project, cl.Org)
	if e != nil {
		return e
	}
	if len(rows) == 0 {
		return errNotFound
	}
	rows, e = c.Query(r.Context(), "INSERT INTO claim_activities(claim_id,activity_id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING activity_id", cl.ID, in.Activity)
	if e != nil {
		return e
	}
	linked := len(rows) > 0
	if linked {
		records, e := claimActivities(r, c, cl)
		if e != nil {
			return e
		}
		var digest string
		for _, record := range records {
			if record["id"] == in.Activity {
				b, _ := json.Marshal(record)
				digest = ledger.SHA(b)
				break
			}
		}
		if digest == "" {
			return errConflict
		}
		if e := appendEvent(r.Context(), c, cl.ID, u.UserID, "ACTIVITY_LINKED", map[string]string{"activityId": in.Activity, "recordSHA256": digest}); e != nil {
			return e
		}
		if e := audit(r.Context(), c, cl.Org, u.UserID, "activity_linked", cl.ID); e != nil {
			return e
		}
	}
	if e := c.Commit(r.Context()); e != nil {
		return e
	}
	respond(w, 200, map[string]bool{"linked": linked})
	return nil
}
func (s *Server) changeState(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	cl, role, e := loadClaim(r, c, u, r.PathValue("id"), true)
	if e != nil {
		return e
	}
	var in struct {
		Status string `json:"status"`
		Note   string `json:"note"`
	}
	if e := readJSON(r, &in); e != nil {
		return e
	}
	if len(in.Note) > 900 {
		return fmt.Errorf("%w: note too long", errInvalid)
	}
	allowed := (cl.Status == "DRAFT" && in.Status == "READY_FOR_REVIEW") || (cl.Status == "READY_FOR_REVIEW" && (in.Status == "REVIEWED_INTERNAL" || in.Status == "REJECTED_INTERNAL"))
	if !allowed {
		return errConflict
	}
	if in.Status != "READY_FOR_REVIEW" {
		if (role != "reviewer" && role != "owner") || u.UserID == cl.CreatedBy {
			return errForbidden
		}
	}
	if e := c.Begin(r.Context()); e != nil {
		return e
	}
	defer c.Rollback(r.Context())
	if e := lockClaim(r.Context(), c, cl.ID); e != nil {
		return e
	}
	rows, e := c.Query(r.Context(), "SELECT status FROM claims WHERE id=$1", cl.ID)
	if e != nil {
		return e
	}
	if len(rows) != 1 || rows[0].Str("status") != cl.Status {
		return errConflict
	}
	if in.Status == "READY_FOR_REVIEW" {
		a, e := c.Query(r.Context(), "SELECT activity_id FROM claim_activities WHERE claim_id=$1 LIMIT 1", cl.ID)
		if e != nil {
			return e
		}
		d, e := c.Query(r.Context(), "SELECT evidence_id FROM claim_evidence WHERE claim_id=$1 LIMIT 1", cl.ID)
		if e != nil {
			return e
		}
		if len(a) == 0 || len(d) == 0 {
			return fmt.Errorf("%w: one linked activity and evidence are required", errInvalid)
		}
	}
	if e := c.Exec(r.Context(), "UPDATE claims SET status=$1 WHERE id=$2", in.Status, cl.ID); e != nil {
		return e
	}
	if e := appendEvent(r.Context(), c, cl.ID, u.UserID, "STATUS_CHANGED", map[string]string{"from": cl.Status, "to": in.Status, "note": in.Note}); e != nil {
		return e
	}
	if e := audit(r.Context(), c, cl.Org, u.UserID, "claim_status_changed", cl.ID); e != nil {
		return e
	}
	if e := c.Commit(r.Context()); e != nil {
		return e
	}
	respond(w, 200, map[string]string{"status": in.Status, "trust": "internal workflow only"})
	return nil
}
func claimActivities(r *http.Request, c *pg.Conn, cl Claim) ([]map[string]string, error) {
	rows, e := c.Query(r.Context(), `SELECT activities.id::text AS id,period,activity_type,quantity,unit,factor,factor_source,scope,kg_co2e,t_co2e FROM activities JOIN claim_activities ON claim_activities.activity_id=activities.id WHERE claim_activities.claim_id=$1 AND activities.project_id=$2 AND activities.org_id=$3 ORDER BY activities.id`, cl.ID, cl.Project, cl.Org)
	if e != nil {
		return nil, e
	}
	out := make([]map[string]string, 0, len(rows))
	for _, x := range rows {
		v := map[string]string{}
		for _, k := range []string{"id", "period", "activity_type", "quantity", "unit", "factor", "factor_source", "scope", "kg_co2e", "t_co2e"} {
			v[k] = x.Str(k)
		}
		out = append(out, v)
	}
	return out, nil
}
func queryEvents(r *http.Request, c *pg.Conn, cl Claim) ([]ledger.Event, error) {
	rows, e := c.Query(r.Context(), "SELECT sequence,event_id::text AS id,actor_id::text AS actor,event_time,kind,payload_text,previous_hash,event_hash FROM claim_events WHERE claim_id=$1 ORDER BY sequence", cl.ID)
	if e != nil {
		return nil, e
	}
	out := make([]ledger.Event, 0, len(rows))
	for _, v := range rows {
		seq, e := strconv.ParseInt(v.Str("sequence"), 10, 64)
		if e != nil {
			return nil, e
		}
		payload := json.RawMessage(v.Str("payload_text"))
		if !json.Valid(payload) {
			return nil, errConflict
		}
		out = append(out, ledger.Event{Sequence: seq, ID: v.Str("id"), ClaimID: cl.ID, ActorID: v.Str("actor"), Time: v.Str("event_time"), Type: v.Str("kind"), Payload: payload, Previous: v.Str("previous_hash"), Hash: v.Str("event_hash")})
	}
	return out, nil
}
func (s *Server) listEvents(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	cl, _, e := loadClaim(r, c, u, r.PathValue("id"), false)
	if e != nil {
		return e
	}
	events, e := queryEvents(r, c, cl)
	if e != nil {
		return e
	}
	respond(w, 200, map[string]any{"events": events, "chainVerified": ledger.Verify(events) == nil, "externalAnchor": false})
	return nil
}
