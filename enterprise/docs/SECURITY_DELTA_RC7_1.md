# Security hardening delta — RC7.1 STAGE (19 Nov 2026)

RC7.1 is an **isolated patch to RC7**. It is NOT production-certified.

- For remote PostgreSQL, `sslmode=verify-full` is now mandatory. The permissive `sslmode=require` path is accepted only for loopback; TLS certificate verification is never bypassed. Local `sslmode=disable` remains confined to loopback.
- Parse `RemoteAddr` with `net.SplitHostPort`, including IPv6; no forwarded header is trusted. Keep the process-local 6 attempts/10 min limiter for stage, but distributed brute-force protection remains a production release blocker.
- Strict application/json media-type check; reject cross-site Fetch Metadata when Origin is missing; correctly map MaxBytesReader errors to HTTP 413.
- File archive bounded to 20 documents, 64 MiB cumulative uncompressed, and 21 ZIP entries. Duplicate evidence and activity IDs are rejected. Upload checks document quota under the claim row lock.
- `PBKDF2` still does NOT satisfy the Argon2id release gate. Custom PostgreSQL wire client remains experimental; neither cloud PostgreSQL integration nor Windows execution has been tested.

**Reject production deployment.** Re-run all Go tests, race detector, vet, malformed requests, browser E2E, real PostgreSQL isolation, and independent security review first.
