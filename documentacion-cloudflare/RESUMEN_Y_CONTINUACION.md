# GRUPO JHT INGENIERÍA SAC — Estado al 28/10/2026

## Sitio y servicios (resumen histórico; verificar contra el panel actual antes de cambiar producción)
- GitHub: https://github.com/jhtingeneria/Grupo_JHTR_INGENERIA.git
- Sitio: https://jhtingeneria.github.io/Grupo_JHTR_INGENERIA/
- Galería Cloudinary: cloud `o6pcvfxm`, carpeta `GRUPO_JHT_INGENIERIA/PROYECTOS`, seis imágenes Proyecto_1 a Proyecto_6. Worker de galería: https://super-glitter-48af.jhtingeneria.workers.dev/proyectos. Usa Cloudinary Search API por `asset_folder`.
- Formspree cotizaciones: https://formspree.io/f/xrppqnnv (probado).
- Formspree reclamaciones: https://formspree.io/f/mrppkzbj (endpoint histórico; el flujo actual de reclamaciones se bloquea de forma segura y no debe usar Formspree como fallback).
- API reclamaciones: https://jht-reclamaciones-api.jhtingeneria.workers.dev
- D1: `jht-libro-reclamaciones`, binding `DB`.
- Secrets de Worker: `JHT_TEST_KEY`, `TURNSTILE_SECRET_KEY`. Nunca compartir sus valores ni subirlos a GitHub.
- Turnstile: widget `JHT-Libro-Reclamaciones`, host `jhtingeneria.github.io`, modo Administrado. La Site Key de producción debe verificarse y copiarse desde el panel; no se incluye en este ZIP.

## Pruebas realizadas en el entorno histórico (no equivalen a una prueba de producción actual)
- GET /salud: `{"servicio":"JHT Libro de Reclamaciones","base_datos":"conectada","modo":"pruebas","turnstile":"configurado"}`.
- POST /reclamaciones con header X-JHT-Test-Key registró JHT-2026-000001 (Reclamo) y JHT-2026-000002 (Queja).
- GET /constancias/JHT-2026-000002 con clave de pruebas devolvió el expediente.
- Consulta SQL verificó JHT-2026-000001 en D1.
- `PRAGMA table_info(reclamaciones)` verificó las 13 columnas.
- Trigger `trg_jht_codigo_reclamacion` creado y confirmado mediante sqlite_master.
- No se ha probado aún un token Turnstile real desde la web ni la integración pública completa.

## Pendientes prioritarios
1. Obtener Site Key pública de Turnstile y los archivos actuales del sitio para integrarlos preservando el diseño.
2. Probar flujo real navegador -> Turnstile -> Worker -> D1.
3. Reforzar seguridad: rate limiting, prevención de duplicados/reintentos, control de origen y acceso, validaciones, tratamiento de datos personales y seguridad de logs.
4. Constancia PDF descargable y envío de confirmación al consumidor.
5. Revisar cumplimiento peruano del Libro de Reclamaciones y protección de datos antes de producción.
6. Pruebas integrales responsive, Cloudinary, Formspree y formularios; preparar un único ZIP final para GitHub.

## Advertencias
- Los archivos aquí son una reconstrucción del último código compartido en la conversación; no son una exportación verificada del Worker desplegado.
- El SQL describe la estructura conocida y no debe ejecutarse nuevamente a ciegas en producción.
- `/salud` informa bindings configurados, no hace una prueba real de D1 ni verifica un token Turnstile.
- El Worker aún permite el modo de pruebas con secreto y no está listo para uso público definitivo.
- El código de Cloudinary y los archivos HTML/CSS/JS del sitio no están incluidos porque no se dispone de sus fuentes en esta conversación.
