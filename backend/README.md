# Backend PHP — JHT Ingeniería

Backend en PHP puro (sin Composer ni dependencias externas, para poder
correr en cualquier hosting con PHP 7.4+ y `curl`/`fileinfo` habilitados
— incluido hosting compartido tipo SiteGround). Atiende:

- `api/cotizacion.php` — formulario de contacto/cotización (`contacto/index.html`).
- `api/reclamaciones.php` — Libro de Reclamaciones (`reclamaciones/index.html`).
- `api/cloudinary-upload.php` — subida administrativa de archivos (videos de
  servicios, brochure, fotos de proyectos, logos de clientes) a Cloudinary.

## ⚠️ Importante: este backend NO corre en Netlify

Netlify solo sirve archivos estáticos (HTML/CSS/JS) y, como mucho, funciones
serverless en Node/Go/Rust — **no ejecuta PHP**. Mientras el sitio esté
publicado en Netlify:

- Los formularios de contacto y reclamaciones seguirán en modo simulado
  (igual que ahora) hasta que `COTIZACION_ENDPOINT` / `RECLAMACION_ENDPOINT`
  en `assets/js/animations.js` apunten a una URL real.
- Este backend debe desplegarse en un hosting con PHP (SiteGround, el
  destino final, u otro mientras tanto) como un sitio/subdominio aparte,
  por ejemplo `https://api.jht-ingenieria.pe/backend/...`.
- Como el frontend (Netlify) y el backend (hosting PHP) quedan en dominios
  distintos, hay que habilitar CORS: agregar la URL exacta de Netlify (y
  luego la del dominio definitivo) a `origenes_permitidos` en
  `config/config.php`.

Cuando el sitio se mude por completo a SiteGround, frontend y backend
pueden convivir en el mismo dominio y ese paso de CORS deja de ser
necesario (aunque no molesta dejarlo).

## Puesta en marcha

1. Subir toda la carpeta `backend/` al hosting con PHP (junto con el
   resto del sitio, o como subdominio aparte).
2. Copiar `config/config.example.php` a `config/config.php` y completar:
   - `correo_notificaciones` / `correo_remitente`.
   - `cloudinary.cloud_name`, `cloudinary.api_key`, `cloudinary.api_secret`
     (dashboard de Cloudinary → Settings → API Keys). **Nunca** poner
     estos datos en archivos del frontend (HTML/JS) — por eso viven solo
     en `config.php`, que está en `.gitignore` y no se sube al repositorio.
   - `token_admin`: un token propio largo (ej. `openssl rand -hex 32`)
     para poder usar `api/cloudinary-upload.php`.
   - `origenes_permitidos`: la(s) URL(s) reales desde donde se va a
     llamar a la API (Netlify, y luego el dominio definitivo).
3. Verificar permisos de escritura del servidor sobre `backend/storage/`
   (necesarios para guardar adjuntos de cotizaciones y el registro de
   reclamaciones).
4. En `assets/js/animations.js`, completar:
   ```js
   var COTIZACION_ENDPOINT = 'https://tu-dominio-o-subdominio/backend/api/cotizacion.php';
   var RECLAMACION_ENDPOINT = 'https://tu-dominio-o-subdominio/backend/api/reclamaciones.php';
   ```
5. Los 6 videos de fondo de las tarjetas de servicio ya están en
   Cloudinary (cuenta "iqmsqomd") y sus URLs ya están pegadas en los
   `<source src="...">` de `index.html` y `servicios/index.html`. Para
   material nuevo (brochure, fotos de proyectos, logos de clientes) usar
   `api/cloudinary-upload.php` (ver el comentario de ese archivo para el
   ejemplo con `curl`) y pegar el `secure_url` devuelto donde corresponda.

## Pendiente: subida a Google Drive

Se pidió también poder subir archivos a Google Drive. No se implementó en
esta fase porque requiere credenciales que solo el cliente puede generar:
un proyecto en Google Cloud Console, una cuenta de servicio (o credenciales
OAuth) con la API de Drive habilitada, y el ID de la carpeta de Drive
compartida con esa cuenta de servicio. Con esos tres datos se puede sumar
un `backend/lib/GoogleDrive.php` análogo a `Cloudinary.php` (firma de
peticiones REST a `https://www.googleapis.com/upload/drive/v3/files`, sin
SDK). Avisar cuando estén disponibles esas credenciales para implementarlo.

## Nada de esto corre aún

En este repositorio `config/config.php` no existe (solo el `.example`), así
que **todos los endpoints responden error 500 hasta que alguien con acceso
al hosting complete ese archivo con datos reales**. Es intencional: evita
que credenciales de prueba queden commiteadas.
