#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
node tests/test_rc6.cjs
go test ./...
go vet ./...
go run ./cmd/verify-rc6 -json tests/synthetic_rc6.json
go run ./cmd/package-rc6 -verify tests/expediente_sintetico_RC6.zip
if go run ./cmd/verify-rc6 tests/synthetic_tampered_rc6.json >/dev/null 2>&1; then
  echo 'ERROR: el verificador aceptó la prueba manipulada' >&2
  exit 1
fi
echo 'OK: suite local aprobada, prueba adversaria rechazada. Producción NO AUTORIZADA.'
