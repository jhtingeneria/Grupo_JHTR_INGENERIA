# GRUPO JHT INGENIERÍA SAC — sitio web

Sitio estático para GitHub Pages. La galería y los formularios dependen de servicios externos.

## Estado de publicación

- Las páginas estáticas están preparadas para publicarse en GitHub Pages.
- El formulario del Libro de Reclamaciones permanece **deshabilitado de forma segura** hasta configurar la Site Key real de producción y verificar la API de Cloudflare.
- Subir este repositorio **no despliega** el Worker ni crea/actualiza la base D1.
- No se ha certificado el cumplimiento legal del Libro de Reclamaciones. Antes de recibir datos reales, revisar los requisitos vigentes aplicables en Perú.

## Antes de habilitar reclamaciones

1. Lee `PUBLICACION-GITHUB-CLOUDFLARE.md`.
2. En `reclamaciones/index.html`, sustituye `REEMPLAZAR_CON_SITE_KEY_PUBLICA` por la **Site Key pública de producción** del widget Turnstile `JHT-Libro-Reclamaciones`. No uses la clave de prueba.
3. En Cloudflare Workers, configura el secreto `TURNSTILE_SECRET_KEY`, el binding D1 de producción y las variables `ENVIRONMENT=production`, `ALLOWED_ORIGINS=https://jhtingeneria.github.io` y `TURNSTILE_EXPECTED_HOSTNAME=jhtingeneria.github.io`.
4. Verifica que el Worker desplegado use la versión actualizada de `documentacion-cloudflare/jht-reclamaciones-api.js`. Los cambios de ese archivo no se publican automáticamente por GitHub Pages.
5. Prueba navegador → Turnstile → Worker → D1 en el dominio publicado antes de habilitar la recepción real.

## Seguridad del repositorio

- Nunca subas `.dev.vars`, `.env`, `backend/config/config.php`, claves secretas, tokens, ni datos reales de reclamantes.
- El `.gitignore` excluye archivos de secretos, estado local de Wrangler, dependencias y `pruebas-worker-reclamaciones/`.
- `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` van como secretos del Worker de Cloudinary, no en HTML o JavaScript público.
- `JHT_TEST_KEY` no debe permitir bypass en producción. El Worker de referencia solo lo acepta si `ENVIRONMENT=development` y `ENABLE_TEST_BYPASS=true`.

## Publicación del sitio estático

Publica el contenido de esta carpeta en la raíz del repositorio configurado para GitHub Pages. No publiques la carpeta local `pruebas-worker-reclamaciones` ni `.dev.vars`.
