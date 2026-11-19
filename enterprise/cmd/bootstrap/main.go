package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"co2evidence/enterprise/internal/ledger"
	"co2evidence/enterprise/internal/pg"
)

func main() {
	db := os.Getenv("POSTGRES_URL")
	email := strings.ToLower(strings.TrimSpace(os.Getenv("BOOTSTRAP_EMAIL")))
	pass := os.Getenv("BOOTSTRAP_PASSWORD")
	if db == "" || len(email) < 5 || !strings.Contains(email, "@") || pass == "" {
		log.Fatal("POSTGRES_URL, BOOTSTRAP_EMAIL, BOOTSTRAP_PASSWORD required (stage only; never commit secrets)")
	}
	hash, e := ledger.HashPassword(pass)
	if e != nil {
		log.Fatal(e)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	c, e := (pg.Client{URL: db}).Connect(ctx)
	if e != nil {
		log.Fatal("database unavailable: ", e)
	}
	defer c.Close()
	id := ledger.UUID()
	if e = c.Exec(ctx, "INSERT INTO users(id,email,password_hash) VALUES($1,$2,$3)", id, email, hash); e != nil {
		log.Fatal("user creation rejected; existing identity is not overwritten: ", e)
	}
	fmt.Println("Bootstrapped user:", id, " (no organization created; create it through authenticated API)")
}
