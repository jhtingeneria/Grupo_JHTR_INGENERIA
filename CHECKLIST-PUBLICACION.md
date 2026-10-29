# Lista de verificación antes de publicar

## GitHub Pages
- [ ] Revisar `git status` y confirmar que no hay `.dev.vars`, `.env`, `backend/config/config.php`, tokens ni datos de prueba.
- [ ] Publicar los archivos del sitio en la raíz del repositorio que usa GitHub Pages.
- [ ] Comprobar rutas relativas, imágenes, CSS, navegación y móvil.

## Turnstile y Worker
- [ ] Site Key real de producción en `reclamaciones/index.html` (no la clave de prueba).
- [ ] El hostname `jhtingeneria.github.io` está permitido en el widget Turnstile.
- [ ] El Worker de producción tiene el secreto `TURNSTILE_SECRET_KEY` y binding D1 de producción.
- [ ] `ENVIRONMENT=production`, `ALLOWED_ORIGINS=https://jhtingeneria.github.io` y `TURNSTILE_EXPECTED_HOSTNAME=jhtingeneria.github.io`.
- [ ] No habilitar `ENABLE_TEST_BYPASS` en producción.
- [ ] El endpoint `/salud` comprueba una consulta real a D1.
- [ ] Una prueba controlada confirma respuesta 201, código generado por el trigger y un solo registro en D1.
- [ ] Probar errores de Turnstile, CORS, expiración del token y doble clic.

## Datos y obligaciones
- [ ] No utilizar datos personales reales en pruebas.
- [ ] Verificar requisitos legales vigentes, aviso de privacidad, conservación de expedientes, plazos de atención y constancia antes de anunciar el libro como oficial.
- [ ] Confirmar notificaciones y proceso de atención; no asumir que un código técnico equivale por sí solo a una constancia legal.
