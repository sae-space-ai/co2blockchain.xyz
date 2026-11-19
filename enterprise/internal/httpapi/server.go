package httpapi

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"net"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"co2evidence/enterprise/internal/ledger"
	"co2evidence/enterprise/internal/pg"
)

var errForbidden = errors.New("forbidden")
var errNotFound = errors.New("not found")
var errInvalid = errors.New("invalid input")
var errConflict = errors.New("conflict")
var errTooLarge = errors.New("payload too large")

type Server struct {
	DB            pg.Client
	Origin        string
	limitsMu      sync.Mutex
	loginAttempts map[string][]time.Time
}
type Identity struct {
	UserID   string `json:"id"`
	Email    string `json:"email"`
	CSRFHash string `json:"-"`
	Role     string `json:"-"`
}

func New(databaseURL, origin string) *Server {
	return &Server{DB: pg.Client{URL: databaseURL}, Origin: strings.TrimSuffix(origin, "/"), loginAttempts: map[string][]time.Time{}}
}
func (s *Server) Router() http.Handler {
	m := http.NewServeMux()
	m.HandleFunc("GET /api/health", s.health)
	m.HandleFunc("GET /api/ready", s.ready)
	m.HandleFunc("POST /api/v1/auth/login", s.login)
	m.HandleFunc("GET /api/v1/auth/me", s.withAuth(s.me, false))
	m.HandleFunc("POST /api/v1/auth/logout", s.withAuth(s.logout, true))
	m.HandleFunc("GET /api/v1/organizations", s.withAuth(s.listOrgs, false))
	m.HandleFunc("POST /api/v1/organizations", s.withAuth(s.createOrg, true))
	m.HandleFunc("POST /api/v1/organizations/{org}/members", s.withAuth(s.addMember, true))
	m.HandleFunc("GET /api/v1/projects", s.withAuth(s.listProjects, false))
	m.HandleFunc("POST /api/v1/projects", s.withAuth(s.createProject, true))
	m.HandleFunc("GET /api/v1/activities", s.withAuth(s.listActivities, false))
	m.HandleFunc("POST /api/v1/activities", s.withAuth(s.createActivity, true))
	m.HandleFunc("GET /api/v1/claims", s.withAuth(s.listClaims, false))
	m.HandleFunc("POST /api/v1/claims", s.withAuth(s.createClaim, true))
	m.HandleFunc("GET /api/v1/claims/{id}", s.withAuth(s.getClaim, false))
	m.HandleFunc("POST /api/v1/claims/{id}/activities", s.withAuth(s.linkActivity, true))
	m.HandleFunc("POST /api/v1/claims/{id}/evidence", s.withAuth(s.uploadEvidence, true))
	m.HandleFunc("GET /api/v1/claims/{id}/events", s.withAuth(s.listEvents, false))
	m.HandleFunc("GET /api/v1/claims/{id}/verify", s.withAuth(s.verifyClaim, false))
	m.HandleFunc("GET /api/v1/claims/{id}/export", s.withAuth(s.exportClaim, false))
	m.HandleFunc("POST /api/v1/claims/{id}/state", s.withAuth(s.changeState, true))
	m.HandleFunc("GET /api/v1/evidence/{id}/download", s.withAuth(s.downloadEvidence, false))
	m.Handle("/", http.FileServer(http.Dir("web")))
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("Content-Security-Policy", "default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'")
		m.ServeHTTP(w, r)
	})
}
func respond(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
func fail(w http.ResponseWriter, e error) {
	code := http.StatusInternalServerError
	message := "internal service error"
	switch {
	case errors.Is(e, errInvalid):
		code = 400
		message = e.Error()
	case errors.Is(e, errForbidden):
		code = 403
		message = "permission denied"
	case errors.Is(e, errNotFound):
		code = 404
		message = "not found"
	case errors.Is(e, errConflict):
		code = 409
		message = "conflict"
	case errors.Is(e, errTooLarge):
		code = http.StatusRequestEntityTooLarge
		message = "payload exceeds permitted size"
	default:
		var maxErr *http.MaxBytesError
		if errors.As(e, &maxErr) {
			code = http.StatusRequestEntityTooLarge
			message = "payload exceeds permitted size"
		} else {
			log.Printf("co2-stage request failed: %T", e)
		}
	}
	respond(w, code, map[string]string{"error": message})
}
func readJSON(r *http.Request, out any) error {
	mediaType, _, mediaErr := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if mediaErr != nil || mediaType != "application/json" {
		return fmt.Errorf("%w: application/json required", errInvalid)
	}
	dec := json.NewDecoder(io.LimitReader(r.Body, 32*1024+1))
	dec.DisallowUnknownFields()
	if e := dec.Decode(out); e != nil {
		return fmt.Errorf("%w: malformed JSON", errInvalid)
	}
	var extra any
	if e := dec.Decode(&extra); e != io.EOF {
		return fmt.Errorf("%w: extra data", errInvalid)
	}
	return nil
}
func validID(s string) bool {
	if len(s) != 36 {
		return false
	}
	for i, c := range s {
		if i == 8 || i == 13 || i == 18 || i == 23 {
			if c != '-' {
				return false
			}
		} else if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f')) {
			return false
		}
	}
	return true
}
func (s *Server) db(ctx context.Context) (*pg.Conn, error) {
	if s.DB.URL == "" {
		return nil, errors.New("POSTGRES_URL not configured")
	}
	return s.DB.Connect(ctx)
}
func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	respond(w, 200, map[string]any{"service": "co2-evidence-ledger", "stage": "RC7.1", "process": "running", "databaseReady": false, "meaning": "process liveness only; check /api/ready for persistence"})
}
func (s *Server) ready(w http.ResponseWriter, r *http.Request) {
	c, e := s.db(r.Context())
	if e != nil {
		respond(w, 503, map[string]any{"ready": false, "reason": "database unavailable"})
		return
	}
	defer c.Close()
	rows, e := c.Query(r.Context(), "SELECT 1 AS ok FROM schema_migrations LIMIT 1")
	if e != nil || len(rows) == 0 {
		respond(w, 503, map[string]any{"ready": false, "reason": "migrations not applied"})
		return
	}
	respond(w, 200, map[string]any{"ready": true, "database": "PostgreSQL"})
}
func (s *Server) secureCookie(r *http.Request) bool {
	return r.TLS != nil || strings.HasPrefix(s.Origin, "https://")
}
func (s *Server) originOK(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		// A Fetch Metadata cross-site request remains forbidden even if Origin
		// was removed by a proxy or browser extension.
		return !strings.EqualFold(r.Header.Get("Sec-Fetch-Site"), "cross-site")
	}
	u, e := url.Parse(origin)
	if e != nil || u.Host == "" {
		return false
	}
	if s.Origin != "" {
		return strings.EqualFold(strings.TrimSuffix(origin, "/"), s.Origin)
	}
	return strings.EqualFold(u.Host, r.Host) && (u.Scheme == "https" || ((u.Scheme == "http") && (strings.HasPrefix(r.Host, "127.0.0.1:") || strings.HasPrefix(r.Host, "localhost:"))))
}
func (s *Server) setCookie(w http.ResponseWriter, r *http.Request, name, value string, httpOnly bool, ttl int) {
	http.SetCookie(w, &http.Cookie{Name: name, Value: value, Path: "/", Secure: s.secureCookie(r), HttpOnly: httpOnly, SameSite: http.SameSiteStrictMode, MaxAge: ttl})
}
func (s *Server) withAuth(handler func(http.ResponseWriter, *http.Request, *pg.Conn, Identity) error, mutation bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !s.originOK(r) {
			respond(w, 403, map[string]string{"error": "origin rejected"})
			return
		}
		c, e := s.db(r.Context())
		if e != nil {
			respond(w, 503, map[string]string{"error": "database unavailable"})
			return
		}
		defer c.Close()
		cookie, e := r.Cookie("co2_session")
		if e != nil || len(cookie.Value) != 64 {
			respond(w, 401, map[string]string{"error": "authentication required"})
			return
		}
		rows, e := c.Query(r.Context(), `SELECT users.id::text AS id,users.email AS email,sessions.csrf_sha256 AS csrf
   FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_sha256=$1 AND sessions.revoked_at IS NULL AND sessions.expires_at>now()`, ledger.SHA([]byte(cookie.Value)))
		if e != nil {
			fail(w, e)
			return
		}
		if len(rows) != 1 {
			respond(w, 401, map[string]string{"error": "invalid or expired session"})
			return
		}
		user := Identity{UserID: rows[0].Str("id"), Email: rows[0].Str("email"), CSRFHash: rows[0].Str("csrf")}
		if mutation {
			csrf, e := r.Cookie("co2_csrf")
			if e != nil || len(csrf.Value) != 64 || r.Header.Get("X-CSRF-Token") != csrf.Value || subtle.ConstantTimeCompare([]byte(ledger.SHA([]byte(csrf.Value))), []byte(user.CSRFHash)) != 1 {
				respond(w, 403, map[string]string{"error": "CSRF token invalid"})
				return
			}
		}
		if e = handler(w, r, c, user); e != nil {
			fail(w, e)
		}
	}
}
func clientIP(remote string) string {
	host, _, err := net.SplitHostPort(remote)
	if err != nil {
		return "unknown" // Fail closed on malformed addresses.
	}
	ip := net.ParseIP(host)
	if ip == nil {
		return "unknown"
	}
	return ip.String()
}
func (s *Server) allowLogin(ip string) bool {
	s.limitsMu.Lock()
	defer s.limitsMu.Unlock()
	now := time.Now()
	// Bound in-process rate limiter memory; never take client-supplied X-Forwarded-For.
	if len(s.loginAttempts) >= 4096 {
		for key, timestamps := range s.loginAttempts {
			active := false
			for _, ts := range timestamps {
				if now.Sub(ts) < 10*time.Minute {
					active = true
					break
				}
			}
			if !active {
				delete(s.loginAttempts, key)
			}
		}
		if len(s.loginAttempts) >= 4096 && len(s.loginAttempts[ip]) == 0 {
			return false
		}
	}
	past := s.loginAttempts[ip]
	ok := past[:0]
	for _, t := range past {
		if now.Sub(t) < 10*time.Minute {
			ok = append(ok, t)
		}
	}
	if len(ok) >= 6 {
		s.loginAttempts[ip] = ok
		return false
	}
	s.loginAttempts[ip] = append(ok, now)
	return true
}
func (s *Server) login(w http.ResponseWriter, r *http.Request) {
	if !s.originOK(r) {
		respond(w, 403, map[string]string{"error": "origin rejected"})
		return
	}
	ip := clientIP(r.RemoteAddr)
	if !s.allowLogin(ip) {
		respond(w, 429, map[string]string{"error": "too many login attempts"})
		return
	}
	var in struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if e := readJSON(r, &in); e != nil {
		fail(w, e)
		return
	}
	if len(in.Email) > 255 || len(in.Password) > 1024 {
		respond(w, 400, map[string]string{"error": "invalid credentials"})
		return
	}
	c, e := s.db(r.Context())
	if e != nil {
		respond(w, 503, map[string]string{"error": "database unavailable"})
		return
	}
	defer c.Close()
	rows, e := c.Query(r.Context(), "SELECT id::text AS id,password_hash FROM users WHERE email=$1", strings.ToLower(strings.TrimSpace(in.Email)))
	if e != nil {
		fail(w, e)
		return
	}
	if len(rows) != 1 || !ledger.CheckPassword(in.Password, rows[0].Str("password_hash")) {
		respond(w, 401, map[string]string{"error": "invalid credentials"})
		return
	}
	sid, csrf := ledger.Token(), ledger.Token()
	e = c.Exec(r.Context(), "INSERT INTO sessions(id,user_id,token_sha256,csrf_sha256,expires_at) VALUES($1,$2,$3,$4,now()+interval '8 hours')", ledger.UUID(), rows[0].Str("id"), ledger.SHA([]byte(sid)), ledger.SHA([]byte(csrf)))
	if e != nil {
		fail(w, e)
		return
	}
	s.setCookie(w, r, "co2_session", sid, true, 8*3600)
	s.setCookie(w, r, "co2_csrf", csrf, false, 8*3600)
	respond(w, 200, map[string]any{"authenticated": true, "id": rows[0].Str("id"), "disclaimer": "Internal review is not external certification"})
}
func (s *Server) logout(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	cookie, _ := r.Cookie("co2_session")
	if err := c.Exec(r.Context(), "UPDATE sessions SET revoked_at=now() WHERE token_sha256=$1 AND user_id=$2", ledger.SHA([]byte(cookie.Value)), u.UserID); err != nil {
		return err
	}
	s.setCookie(w, r, "co2_session", "", true, -1)
	s.setCookie(w, r, "co2_csrf", "", false, -1)
	respond(w, 200, map[string]bool{"loggedOut": true})
	return nil
}
func (s *Server) me(w http.ResponseWriter, r *http.Request, c *pg.Conn, u Identity) error {
	rows, e := c.Query(r.Context(), "SELECT memberships.org_id::text AS org_id,organizations.name AS name,role FROM memberships JOIN organizations ON organizations.id=memberships.org_id WHERE user_id=$1 ORDER BY name", u.UserID)
	if e != nil {
		return e
	}
	orgs := make([]map[string]string, 0, len(rows))
	for _, row := range rows {
		orgs = append(orgs, map[string]string{"id": row.Str("org_id"), "name": row.Str("name"), "role": row.Str("role")})
	}
	respond(w, 200, map[string]any{"user": u, "organizations": orgs})
	return nil
}
func membership(ctx context.Context, c *pg.Conn, org, user string, write bool) (string, error) {
	if !validID(org) {
		return "", errInvalid
	}
	rows, e := c.Query(ctx, "SELECT role FROM memberships WHERE org_id=$1 AND user_id=$2", org, user)
	if e != nil {
		return "", e
	}
	if len(rows) == 0 {
		return "", errNotFound
	}
	role := rows[0].Str("role")
	if write && role == "viewer" {
		return "", errForbidden
	}
	return role, nil
}
func audit(ctx context.Context, c *pg.Conn, org, actor, action, subject string) error {
	return c.Exec(ctx, "INSERT INTO audit_events(id,org_id,actor_id,action,subject_id) VALUES($1,$2,$3,$4,$5)", ledger.UUID(), org, actor, action, subject)
}
