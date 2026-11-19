# Constitución operativa — CO2 Evidence Ledger (RC6 STAGE)

Estado: **prototipo autónomo de laboratorio**, no certificado, no apto para producción ni uso con información sensible. Fecha: 2026-11-19.

1. **Identidad.** Herramienta B2B de contabilidad de actividades y emisiones, factores, escenarios contrafactuales, referencias documentales y huellas de integridad. La prueba se distingue del dato declarado y del hecho medido.
2. **Prohibiciones.** No comprar, vender, emitir, transferir ni retirar créditos de carbono; no presentar hashes como certificaciones, ni afirmar blockchain, inmutabilidad o verificación independiente inexistentes.
3. **Fuente de verdad.** Los factores proceden del usuario y deben citarse y contextualizarse. Los ejemplos sintéticos no son observaciones reales ni coeficientes oficiales.
4. **Modelo de confianza RC6.** Los registros, instantáneas y eventos encadenados permiten detectar cambios accidentales o no recalculados en una copia local. Cualquier administrador del navegador puede rehacer todos los hashes. No existe anclaje de confianza externo, firma acreditada ni sello temporal de tercero.
5. **Datos.** Esta RC6 usa exclusivamente localStorage: no existe cuenta, control de acceso, multi-tenant, persistencia servidor ni retención garantizada. No utilizar datos de clientes ni expedientes sensibles.
6. **Exportación.** Las copias JSON contienen metadatos y huellas, no los bytes de la evidencia. CSV compatible con Excel; no es XLSX. PDF mediante impresión del navegador; no genera PDF de servidor.
7. **Migración.** Los registros RC5 pueden migrarse explícitamente como legado. La nueva cadena refleja el momento de importación y no acredita el historial anterior. Una RC6 inválida nunca debe sobrescribir datos locales mediante importación.
8. **Política de publicación.** Está prohibido promocionar el laboratorio actual a producción mientras falten backend persistente, autenticación, control de pertenencia organizativa, E2E real, pruebas de restauración, seguridad y un acta de aceptación verificable.
9. **Arquitectura objetivo fase 00.** Conforme a la orden previa, React/TypeScript/Vite + API Go versionada + PostgreSQL y documentos duraderos, autenticación de servidor con controles defensivos, expediente ZIP verificable de documentos, roles y aislamiento de organizaciones. Esta RC6 es solo un paso intermedio y NO implementa esa arquitectura.
10. **Control de cambios.** Desarrollo exclusivamente en rama aislada; no merge, despliegue, credenciales ni datos de producción sin aceptación tras pruebas.
