# CO2 Evidence Ledger — RC6 STAGE

**Versión local consolidada e inspeccionable; NO APTA PARA PRODUCCIÓN.** Fecha 19/11/2026.

## Uso inmediato en Windows, macOS y Linux

1. Abrir `CO2_Evidence_Ledger_RC6_STAGE.html` en un navegador moderno mediante doble clic. No necesita instalar nada ni conectarse a internet.
2. Registrar un proyecto, factores de emisión con fuente/año/unidad, actividades y sus referencias. Los datos se guardan en el navegador del mismo equipo.
3. En **Exportación y seguridad**, usar **Verificar cadena local SHA-256** y descargar la copia RC6 en JSON.
4. Para comprobación externa del JSON en Windows, ejecutar desde PowerShell `./Verify_RC6_Windows.exe -json CO2Blockchain_EvidenceLab_RC6.json` (desde el directorio donde estén ambos archivos). En Linux: `./verify-rc6-linux -json exportacion.json`. El verificador comprueba *solo* la integridad autocontenida de los metadatos.
5. Para cargar una copia RC5, elegir su JSON en el control de restauración: se realizará migración explícita, con advertencia de origen no acreditado; no se atribuyen pruebas históricas.

**Atención:** no se almacenan los archivos originales de evidencias, solo sus SHA-256. Conservarlos externamente. No introducir información sensible o de terceros. La comparación de emisiones entre periodos no acredita causalidad ni cumplimiento de metodologías.

## Validación reproducible del código fuente

Requisitos de desarrollo: Node.js 22 o superior y Go 1.23 o superior. Sin dependencias de npm, sin descarga de paquetes y sin servidor remoto.

```sh
node tests/test_rc6.cjs
go test ./...
go run ./cmd/verify-rc6 -json tests/synthetic_rc6.json
go run ./cmd/package-rc6 -verify tests/expediente_sintetico_RC6.zip
```

Para empaquetar un expediente que **incluya los bytes reales** de evidencias, colocar los archivos originales referenciados por sus nombres en una carpeta local `originales/` y ejecutar en PowerShell:

```powershell
./Pack_RC6_Windows.exe -ledger CO2Blockchain_EvidenceLab_RC6.json -documents ./originales -out expediente_RC6.zip
./Pack_RC6_Windows.exe -verify expediente_RC6.zip
```

**Condiciones:** cada documento debe conservar exactamente nombre, tamaño y SHA-256 con los que se registró. Formatos admitidos: PDF/PNG/JPG/JPEG/CSV/TXT, 3 MiB por archivo. No se sobrescriben paquetes existentes. El verificador de ZIP detecta sustituciones, ausencias y rutas manipuladas; no demuestra validez externa de los documentos.

Se incluyen dos fixtures *TEST* claramente ficticios: uno consistente y otro deliberadamente manipulado. Comprobar el negativo:

```sh
go run ./cmd/verify-rc6 tests/synthetic_tampered_rc6.json
# debe devolver código distinto de cero.
```

Más detalles: `docs/PRODUCT_CONSTITUTION.md` y `docs/QA_REPORT_2026-11-19.md`.

## Repositorio, integración y límites

Origen de la rama GitHub aislada: `sae-space-ai/co2blockchain.xyz` / `feat/co2-evidence-ledger-rc6-stage-20261119`. No se ha modificado la aplicación anterior de compraventa ni la rama `main`. La RC6 no es el backend Go/PostgreSQL especificado en Fase 00: es un laboratorio autónomo y la herramienta de comprobación Go es independiente; no existe API de servidor.

**Gate de producción: BLOQUEADO** hasta cumplir completamente la matriz de aceptación.
