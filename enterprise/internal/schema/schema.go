package schema

import (
	"context"
	"crypto/sha256"
	"embed"
	"encoding/hex"
	"fmt"
	"strings"

	"co2evidence/enterprise/internal/pg"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

func Apply(ctx context.Context, conn *pg.Conn) error {
	if err := conn.Begin(ctx); err != nil {
		return err
	}
	committed := false
	defer func() {
		if !committed {
			_ = conn.Rollback(ctx)
		}
	}()
	if err := conn.Exec(ctx, "SELECT pg_advisory_xact_lock(68241721)"); err != nil {
		return err
	}
	files, err := migrationFiles.ReadDir("migrations")
	if err != nil {
		return err
	}
	for _, f := range files {
		if !strings.HasSuffix(f.Name(), ".sql") {
			continue
		}
		body, err := migrationFiles.ReadFile("migrations/" + f.Name())
		if err != nil {
			return err
		}
		sum := sha256.Sum256(body)
		sha := hex.EncodeToString(sum[:])
		if err := conn.Exec(ctx, "CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY, sha256 TEXT NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())"); err != nil {
			return err
		}
		rows, err := conn.Query(ctx, "SELECT sha256 FROM schema_migrations WHERE version=$1", f.Name())
		if err != nil {
			return err
		}
		if len(rows) > 0 {
			if rows[0].Str("sha256") != sha {
				return fmt.Errorf("migration %s hash changed", f.Name())
			}
			continue
		}
		for _, stmt := range strings.Split(string(body), ";\n") {
			stmt = strings.TrimSpace(stmt)
			if stmt == "" {
				continue
			}
			if err := conn.Exec(ctx, stmt); err != nil {
				return fmt.Errorf("migration %s failed: %w", f.Name(), err)
			}
		}
		if err := conn.Exec(ctx, "INSERT INTO schema_migrations(version,sha256) VALUES($1,$2)", f.Name(), sha); err != nil {
			return err
		}
	}
	if err := conn.Commit(ctx); err != nil {
		return err
	}
	committed = true
	return nil
}
