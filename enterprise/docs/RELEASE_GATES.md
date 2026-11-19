# Puertas de aceptación · RC7 STAGE · 2026-11-19

| Gate | Exigencia | Estado al crear el paquete |
|---|---|---|
| G0 | Inventario RC6 y código aislado | Cumplido: RC6 copiado sin sustitución del original |
| G1 | Compilación Go sin dependencias externas | PASS local (reproducible con Go 1.23) |
| G2 | Lógica determinista, eventos, ZIP y adversarios unitarios | PASS local — consultar tests y resultados |
| G3 | Migraciones PostgreSQL con instancia real | BLOQUEADO: PostgreSQL no disponible en este entorno |
| G4 | Sesión auténtica, expiración, CSRF, roles, A/B y persistencia tras reinicio | NO ACREDITADO en servidor PostgreSQL real |
| G5 | Subida real, recuperación de documentos binarios y comparación de hashes tras reinicio | NO ACREDITADO E2E |
| G6 | Navegador completo y accesibilidad | BLOQUEADO: Chromium rechaza navegación a localhost por política de administrador |
| G7 | Seguridad, Argon2id, cliente PostgreSQL mantenido, antibruteforce distribuido, TLS verificado, backup/restore, privacidad y revisión humana | NO SUPERADO |
| G8 | React/TypeScript/Vite frontend objetivo | PENDIENTE; interfaz temporal nativa HTML/JS |
| G9 | Preproducción aislada Cloudflare/Vercel, credenciales con permisos mínimos, monitorización y acta de aceptación | NO EJECUTADO |
| PRODUCCIÓN | Necesita G1–G9 completos | **PROHIBIDA** |

No confundir un test del paquete de bytes, un test con servidor simulado o un resultado de `go test` con pruebas reales PostgreSQL autenticadas. No hay anclaje blockchain distribuido ni certificación de créditos.
