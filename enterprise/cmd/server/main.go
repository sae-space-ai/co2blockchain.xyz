package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"co2evidence/enterprise/internal/httpapi"
	"co2evidence/enterprise/internal/pg"
	"co2evidence/enterprise/internal/schema"
)

func main() {
	listen := flag.String("listen", "127.0.0.1:8080", "listen address, localhost by default")
	migrate := flag.Bool("migrate", false, "apply schema migrations and exit")
	flag.Parse()
	database := os.Getenv("POSTGRES_URL")
	if database == "" {
		log.Fatal("POSTGRES_URL not set (no fallthrough to simulated persistence)")
	}
	if *migrate {
		ctx, cancel := context.WithTimeout(context.Background(), 90*time.Second)
		defer cancel()
		c, e := (pg.Client{URL: database}).Connect(ctx)
		if e != nil {
			log.Fatal("database unavailable: ", e)
		}
		defer c.Close()
		if e = schema.Apply(ctx, c); e != nil {
			log.Fatal("migration failed: ", e)
		}
		log.Println("schema migrations applied; no application started")
		return
	}
	origin := os.Getenv("PUBLIC_ORIGIN")
	if origin == "" {
		origin = "http://" + *listen
	}
	if !(strings.HasPrefix(origin, "https://") || strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "http://127.0.0.1:")) {
		log.Fatal("PUBLIC_ORIGIN must be HTTPS or local loopback")
	}
	if !strings.HasPrefix(*listen, "127.0.0.1:") && !strings.HasPrefix(*listen, "localhost:") && !strings.HasPrefix(*listen, "[::1]:") && os.Getenv("EXPLICIT_STAGE_REMOTE_LISTEN") != "I_ACCEPT_NO_PRODUCTION" {
		log.Fatal("nonlocal listen forbidden without explicit stage flag")
	}
	srv := &http.Server{Addr: *listen, Handler: httpapi.New(database, origin).Router(), ReadHeaderTimeout: 8 * time.Second, ReadTimeout: 20 * time.Second, WriteTimeout: 35 * time.Second, IdleTimeout: 40 * time.Second, MaxHeaderBytes: 16384}
	log.Printf("CO2 Evidence Ledger RC7.1 STAGE listening on %s; check /api/ready for actual storage", *listen)
	log.Fatal(srv.ListenAndServe())
}
