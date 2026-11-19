# CO2 Evidence Ledger — RC7.1 Enterprise STAGE

**Seguridad incremental.** RC7.1 añade comprobación estricta de TLS remoto, límites de archivos y ZIP, rechazo de solicitudes de origen inadecuado y pruebas adversarias. Véase `docs/SECURITY_DELTA_RC7_1.md` y el informe `docs/QA_RC7_1_2026-11-19.md`. No modificar ni desplegar `main`.


**NO PRODUCCIÓN.** Fuente empresarial Go + PostgreSQL; React/TypeScript definitivo y pruebas E2E contra servidor auténtico pendientes.

## Entregables ejecutables

- `cmd/server`: API HTTP v1, cookies de sesión HttpOnly/SameSite, CSRF, aislamiento por organización, documentos binarios y ZIP
- `cmd/bootstrap`: alta de usuario por CLI, sin ruta pública de registros
- `cmd/verify-package`: validador offline independiente de ZIP de evidencias (detecta alteración y entradas peligrosas)
- `cmd/create-fixture`: expediente sintético completo con factor inventado y etiqueta inequívoca
- `internal/ledger`: decimal exacto racional, SHA-256 y cadena por declaración
- `internal/pg`: cliente protocolo PostgreSQL v3 ligero para STAGE; cifrado TLS, SCRAM, consultas con parámetros. **Se sustituirá por driver mantenido antes de producir**
- `internal/schema/migrations/001_init.sql`: migración versionada, huella y transacción
- `web`: interfaz HTML accesible básica, sin pagos ni datos falsos
- `docs`: constitución, puertas y QA

## Primera ejecución local (Windows PowerShell con Go 1.23 y PostgreSQL 17)

1. Extrae el ZIP y abre una terminal en `enterprise`. Si utilizas Docker Desktop, establece primero una contraseña aleatoria en `CO2_STAGE_DB_PASSWORD` y ejecuta `docker compose up -d postgres_stage`. **La configuración Docker no ha sido ensayada en esta sesión.**
2. Define `POSTGRES_URL` apuntando EXCLUSIVAMENTE al PostgreSQL de prueba, por ejemplo `postgres://co2_stage_user:<CLAVE_LOCAL>@127.0.0.1:55432/co2_stage?sslmode=disable`. Nunca uses la contraseña de producción. Solo se permite `sslmode=disable` en loopback.
3. Ejecuta `go run ./cmd/server -migrate`. El esquema se crea con huella inmutable para la versión de la migración.
4. Define una dirección de correo y una contraseña aleatoria de al menos 14 caracteres en `BOOTSTRAP_EMAIL` y `BOOTSTRAP_PASSWORD` solo durante el alta; ejecuta `go run ./cmd/bootstrap`. Limpia del entorno la contraseña inmediatamente después.
5. Ejecuta `go run ./cmd/server -listen 127.0.0.1:8080` y abre `http://127.0.0.1:8080`.
6. Inicia sesión. Da de alta una organización y proyecto, un factor **sintético con fuente documentada**, una actividad, una declaración DRAFT, vincula la actividad, sube un TXT sintético y exporta el ZIP.
7. Comprueba el ZIP mediante `go run ./cmd/verify-package ruta/expediente.zip`. Reinicia el servidor y confirma que todo continúa accesible desde PostgreSQL.
8. Para una revisión independiente se necesita al menos un segundo usuario creado por CLI y asignado a la organización en `POST /api/v1/organizations/{id}/members`, con rol reviewer; la revisión no puede hacerla quien creó el expediente.

El formulario inicial muestra `GET /api/ready`. Si no existe PostgreSQL auténtico, devuelve HTTP 503 y no permite guardar datos.

## Pruebas reproducibles sin PostgreSQL

En una terminal Linux/macOS: `bash scripts/check.sh`. En Windows PowerShell: `go test ./...`; `go vet ./...`; `go run ./cmd/create-fixture tests/synthetic_enterprise.zip`; `go run ./cmd/verify-package tests/synthetic_enterprise.zip`.

`go test ./...` valida cómputos y lógica; NO ejecuta un PostgreSQL genuino. `scripts/check.sh` compila y genera un ZIP sintético verificable, no acta de producción.

## Arquitectura y límites

Las escrituras son transaccionales. Las consultas van parametrizadas y comprueban la pertenencia a organización. Los documentos (máx. 3 MiB) se guardan en PostgreSQL BYTEA, no en navegador. Los eventos concatenan hash previo y contenido canónico e incorporan referencias de actividad y documento; la cadena no es inmutable ante un DBA con privilegios completos. El factor es declarado por el usuario y no equivale a un factor oficial. La revisión humana es interna.

PBKDF2 es un mecanismo temporal conservador y no cumple la exigencia de Argon2id del diseño objetivo. El cliente PostgreSQL experimental no ha pasado auditoría externa. La UI es HTML/JS temporal, no React. No hay firma digital, sello cualificado ni cadena pública, ni backup remoto ni certificado RGPD. No usar datos reales o sensibles, no promocionar a producción.

Para la matriz de aceptación, véase `docs/RELEASE_GATES.md`.
