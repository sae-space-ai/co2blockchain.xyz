#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo '[1/6] Go tests'
go test ./... -count=1
echo '[2/6] Go vet'
go vet ./...
echo '[3/6] Race detector'
go test -race ./...
echo '[4/6] Build server and independent verifier'
go build -o /tmp/co2-stage-server ./cmd/server
go build -o /tmp/co2-stage-verify ./cmd/verify-package
echo '[5/6] JavaScript syntax'
node --check web/app.js
echo '[6/6] Synthetic ZIP and independent verification'
go run ./cmd/create-fixture tests/synthetic_enterprise.zip
go run ./cmd/verify-package tests/synthetic_enterprise.zip
echo 'LAB STAGE checks passed. Real PostgreSQL + browser E2E still required.'
