package httpapi

import (
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"co2evidence/enterprise/internal/ledger"
	"co2evidence/enterprise/internal/pg"
)

func (s *Server) listOrgs(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	return s.me(w, r, c, u)
}
func (s *Server) createOrg(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	var in struct {
		Name string `json:"name"`
	}
	if e := readJSON(r, &in); e != nil {
		return e
	}
	in.Name = strings.TrimSpace(in.Name)
	if len(in.Name) < 2 || len(in.Name) > 160 {
		return fmt.Errorf("%w: organization name 2..160", errInvalid)
	}
	id := ledger.UUID()
	if e := c.Begin(r.Context()); e != nil {
		return e
	}
	defer c.Rollback(r.Context())
	if e := c.Exec(r.Context(), "INSERT INTO organizations(id,name) VALUES($1,$2)", id, in.Name); e != nil {
		return e
	}
	if e := c.Exec(r.Context(), "INSERT INTO memberships(org_id,user_id,role) VALUES($1,$2,'owner')", id, u.UserID); e != nil {
		return e
	}
	if e := audit(r.Context(), c, id, u.UserID, "organization_created", id); e != nil {
		return e
	}
	if e := c.Commit(r.Context()); e != nil {
		return e
	}
	respond(w, 201, map[string]string{"id": id, "name": in.Name, "role": "owner"})
	return nil
}
func (s *Server) addMember(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	org := r.PathValue("org")
	role, e := membership(r.Context(), c, org, u.UserID, true)
	if e != nil {
		return e
	}
	if role != "owner" {
		return errForbidden
	}
	var in struct {
		Email string `json:"email"`
		Role  string `json:"role"`
	}
	if e := readJSON(r, &in); e != nil {
		return e
	}
	if in.Role != "owner" && in.Role != "reviewer" && in.Role != "viewer" {
		return fmt.Errorf("%w: invalid role", errInvalid)
	}
	in.Email = strings.ToLower(strings.TrimSpace(in.Email))
	if len(in.Email) < 5 || len(in.Email) > 255 || !strings.Contains(in.Email, "@") {
		return fmt.Errorf("%w: invalid email", errInvalid)
	}
	rows, e := c.Query(r.Context(), "SELECT id::text AS id FROM users WHERE email=$1", in.Email)
	if e != nil {
		return e
	}
	if len(rows) == 0 {
		return fmt.Errorf("%w: user must be bootstrapped before adding", errInvalid)
	}
	id := rows[0].Str("id")
	if id == u.UserID && in.Role != "owner" {
		return errForbidden
	}
	if e := c.Begin(r.Context()); e != nil {
		return e
	}
	defer c.Rollback(r.Context())
	if e := c.Exec(r.Context(), "INSERT INTO memberships(org_id,user_id,role) VALUES($1,$2,$3) ON CONFLICT(org_id,user_id) DO UPDATE SET role=EXCLUDED.role", org, id, in.Role); e != nil {
		return e
	}
	if e := audit(r.Context(), c, org, u.UserID, "member_role_set", id); e != nil {
		return e
	}
	if e := c.Commit(r.Context()); e != nil {
		return e
	}
	respond(w, 200, map[string]string{"userId": id, "role": in.Role})
	return nil
}
func (s *Server) listProjects(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	org := r.URL.Query().Get("org")
	if _, e := membership(r.Context(), c, org, u.UserID, false); e != nil {
		return e
	}
	rows, e := c.Query(r.Context(), "SELECT id::text AS id,name,notes,created_at::text FROM projects WHERE org_id=$1 ORDER BY created_at DESC LIMIT 200", org)
	if e != nil {
		return e
	}
	out := make([]map[string]string, 0, len(rows))
	for _, x := range rows {
		out = append(out, map[string]string{"id": x.Str("id"), "name": x.Str("name"), "notes": x.Str("notes")})
	}
	respond(w, 200, map[string]any{"projects": out})
	return nil
}
func (s *Server) createProject(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	var in struct {
		Org   string `json:"org"`
		Name  string `json:"name"`
		Notes string `json:"notes"`
	}
	if e := readJSON(r, &in); e != nil {
		return e
	}
	if _, e := membership(r.Context(), c, in.Org, u.UserID, true); e != nil {
		return e
	}
	in.Name = strings.TrimSpace(in.Name)
	if len(in.Name) < 2 || len(in.Name) > 160 || len(in.Notes) > 1500 {
		return fmt.Errorf("%w: invalid project fields", errInvalid)
	}
	id := ledger.UUID()
	if e := c.Begin(r.Context()); e != nil {
		return e
	}
	defer c.Rollback(r.Context())
	if e := c.Exec(r.Context(), "INSERT INTO projects(id,org_id,name,notes) VALUES($1,$2,$3,$4)", id, in.Org, in.Name, in.Notes); e != nil {
		return e
	}
	if e := audit(r.Context(), c, in.Org, u.UserID, "project_created", id); e != nil {
		return e
	}
	if e := c.Commit(r.Context()); e != nil {
		return e
	}
	respond(w, 201, map[string]string{"id": id, "name": in.Name})
	return nil
}
func validProject(r *http.Request, c *pg.Conn, org, project string) error {
	if !validID(project) {
		return errInvalid
	}
	rows, e := c.Query(r.Context(), "SELECT id FROM projects WHERE id=$1 AND org_id=$2", project, org)
	if e != nil {
		return e
	}
	if len(rows) != 1 {
		return errNotFound
	}
	return nil
}

var periodRE = regexp.MustCompile(`^20[0-9]{2}-(0[1-9]|1[0-2])$`)

func (s *Server) listActivities(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	org := r.URL.Query().Get("org")
	project := r.URL.Query().Get("project")
	if _, e := membership(r.Context(), c, org, u.UserID, false); e != nil {
		return e
	}
	if e := validProject(r, c, org, project); e != nil {
		return e
	}
	rows, e := c.Query(r.Context(), "SELECT id::text AS id,period,activity_type,quantity,unit,factor,factor_source,scope,kg_co2e,t_co2e FROM activities WHERE project_id=$1 AND org_id=$2 ORDER BY created_at DESC LIMIT 250", project, org)
	if e != nil {
		return e
	}
	out := make([]map[string]string, 0, len(rows))
	for _, v := range rows {
		item := map[string]string{}
		for _, key := range []string{"id", "period", "activity_type", "quantity", "unit", "factor", "factor_source", "scope", "kg_co2e", "t_co2e"} {
			item[key] = v.Str(key)
		}
		out = append(out, item)
	}
	respond(w, 200, map[string]any{"activities": out})
	return nil
}

type ActivityInput struct {
	Org          string `json:"org"`
	Project      string `json:"project"`
	Period       string `json:"period"`
	Type         string `json:"type"`
	Scope        string `json:"scope"`
	Quantity     string `json:"quantity"`
	Unit         string `json:"unit"`
	Factor       string `json:"factor"`
	FactorUnit   string `json:"factorUnit"`
	FactorSource string `json:"factorSource"`
	FactorYear   int    `json:"factorYear"`
	Methodology  string `json:"methodology"`
}

func CheckActivity(in ActivityInput) (string, string, error) {
	if !periodRE.MatchString(in.Period) {
		return "", "", fmt.Errorf("%w: period must be YYYY-MM", errInvalid)
	}
	if _, err := time.Parse("2006-01", in.Period); err != nil {
		return "", "", fmt.Errorf("%w: invalid period", errInvalid)
	}
	if !ledger.ValidUnit(in.Unit) || in.FactorUnit != in.Unit || !ledger.ValidScope(in.Scope) {
		return "", "", fmt.Errorf("%w: incompatible unit/scope", errInvalid)
	}
	if in.Type != "diesel" && in.Type != "gasoline" && in.Type != "natural_gas" && in.Type != "electricity" {
		return "", "", fmt.Errorf("%w: invalid activity type", errInvalid)
	}
	if in.Type == "electricity" {
		if in.Unit != "kWh" && in.Unit != "MWh" {
			return "", "", fmt.Errorf("%w: electricity must use kWh/MWh", errInvalid)
		}
		if in.Scope != "2" || (in.Methodology != "location-based" && in.Methodology != "market-based") {
			return "", "", fmt.Errorf("%w: electricity requires scope 2 and method", errInvalid)
		}
	} else if in.Scope != "1" {
		return "", "", fmt.Errorf("%w: direct fuels require scope 1", errInvalid)
	}
	if (in.Type == "diesel" || in.Type == "gasoline") && in.Unit != "litro" {
		return "", "", fmt.Errorf("%w: liquid fuels must use litres", errInvalid)
	}
	if in.Type == "natural_gas" && in.Unit != "m3" && in.Unit != "kWh" && in.Unit != "MWh" {
		return "", "", fmt.Errorf("%w: natural gas units invalid", errInvalid)
	}
	if len(strings.TrimSpace(in.FactorSource)) < 5 || len(in.FactorSource) > 500 || in.FactorYear < 1900 || in.FactorYear > 2100 || len(in.Methodology) > 80 {
		return "", "", fmt.Errorf("%w: factor documentation required", errInvalid)
	}
	kg, ton, e := ledger.Calc(in.Quantity, in.Factor)
	if e != nil {
		return "", "", fmt.Errorf("%w: %v", errInvalid, e)
	}
	return kg, ton, nil
}
func (s *Server) createActivity(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	var in ActivityInput
	if e := readJSON(r, &in); e != nil {
		return e
	}
	if _, e := membership(r.Context(), c, in.Org, u.UserID, true); e != nil {
		return e
	}
	if e := validProject(r, c, in.Org, in.Project); e != nil {
		return e
	}
	kg, ton, e := CheckActivity(in)
	if e != nil {
		return e
	}
	id := ledger.UUID()
	if e := c.Begin(r.Context()); e != nil {
		return e
	}
	defer c.Rollback(r.Context())
	if e := c.Exec(r.Context(), `INSERT INTO activities(id,org_id,project_id,period,activity_type,scope,quantity,unit,factor,factor_unit,factor_source,factor_year,methodology,kg_co2e,t_co2e) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`, id, in.Org, in.Project, in.Period, in.Type, in.Scope, in.Quantity, in.Unit, in.Factor, in.FactorUnit, in.FactorSource, in.FactorYear, in.Methodology, kg, ton); e != nil {
		return e
	}
	if e := audit(r.Context(), c, in.Org, u.UserID, "activity_created", id); e != nil {
		return e
	}
	if e := c.Commit(r.Context()); e != nil {
		return e
	}
	respond(w, 201, map[string]string{"id": id, "kgCO2e": kg, "tCO2e": ton, "status": "user-supplied factor; not independently validated"})
	return nil
}
