# Publicación de JHT Ingeniería en GitHub Pages y Cloudflare

## Estado de esta copia

El sitio está preparado como fuente estática para GitHub Pages. **La recepción pública de reclamaciones no está activada todavía**: el formulario permanece bloqueado hasta sustituir el marcador por la Site Key real de producción y verificar el Worker y D1. No usar claves de prueba en el sitio publicado. Subir el repositorio no despliega ni configura el Worker de Cloudflare.

## Qué credenciales se necesitan y dónde obtenerlas

### 1. Cloudflare Turnstile

- **Site Key (pública):** Cloudflare Dashboard → Turnstile → widget de producción `JHT-Libro-Reclamaciones`. Configura como hostname permitido `jhtingeneria.github.io` (sin `https://` ni rutas). Esta clave puede estar en `reclamaciones/index.html`.
- **Secret Key (privada):** en el mismo widget de Turnstile. No se crea manualmente ni se publica en GitHub. Guárdala como secreto del Worker de producción llamado `TURNSTILE_SECRET_KEY` en Cloudflare → Workers & Pages → `jht-reclamaciones-api` → Settings → Variables and Secrets.
- Para pruebas locales, usa un widget/credenciales de prueba por separado y guarda el secreto únicamente en `pruebas-worker-reclamaciones/.dev.vars`. Nunca reutilices la clave de prueba en producción.

### 2. Cloudinary (galería de proyectos)

- `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` se obtienen en Cloudinary Console → Settings → API Keys.
- Son secretos del Worker `jht-proyectos`; configúralos como secretos de Cloudflare, no en `worker.js`, HTML ni JavaScript público. El `cloud_name` (`o6pcvfxm`) no es una contraseña.
- `ALLOWED_ORIGIN` es una variable de configuración pública, no una clave.

### 3. Formspree

Los identificadores de formularios que aparecen en URLs de Formspree no son contraseñas. En esta copia, el Libro de Reclamaciones ya no usa Formspree como alternativa silenciosa. El formulario de cotizaciones conserva su configuración existente; comprueba el panel de Formspree antes de publicar si debe seguir activo.

### 4. Backend PHP opcional

`backend/config/config.example.php` es una plantilla. Si se usa ese backend, copia la plantilla a `backend/config/config.php` en el servidor y rellena allí SMTP, Cloudinary, `sal_almacenamiento` y `token_admin`. **No subas `config.php`**. Los valores `CAMBIAR-...` son marcadores y deben sustituirse por valores aleatorios propios antes de habilitar el endpoint administrativo. GitHub Pages por sí solo no ejecuta PHP.

## Antes de activar producción

1. En `reclamaciones/index.html`, sustituye `REEMPLAZAR_CON_SITE_KEY_PUBLICA` por la **Site Key de producción**, nunca por la Secret Key.
2. Confirma que `api` apunta a `https://jht-reclamaciones-api.jhtingeneria.workers.dev`.
3. En el Worker de producción, configura el secreto `TURNSTILE_SECRET_KEY`, el binding D1 real, `ENVIRONMENT=production`, `ALLOWED_ORIGINS=https://jhtingeneria.github.io` y `TURNSTILE_EXPECTED_HOSTNAME=jhtingeneria.github.io`. No uses el `database_id` ficticio de pruebas locales. Asegúrate de que `ENABLE_TEST_BYPASS` no esté habilitado en producción.
4. Ejecuta pruebas locales con la carpeta `pruebas-worker-reclamaciones` y la base local. No uses `--remote` durante esas pruebas.
5. Antes de recibir reclamaciones reales, valida que la API registra en D1, devuelve un código de constancia, maneja errores sin duplicar envíos y que el procedimiento cumple los requisitos legales aplicables en Perú. Esta guía no constituye una certificación legal.
6. Publica el sitio estático en GitHub Pages y verifica la URL, los recursos relativos, CORS y el envío desde el dominio publicado.

## Archivos que no se deben subir

El `.gitignore` excluye `.dev.vars`, `.env*`, `backend/config/config.php`, el estado local de Wrangler, `node_modules` y la carpeta local `pruebas-worker-reclamaciones`. Revisa `git status` antes de hacer commit.


## Condiciones que siguen requiriendo acción en el panel de Cloudflare

- Insertar la Site Key pública real del widget de producción en `reclamaciones/index.html`. La clave no se puede inferir del nombre del widget y no está incluida en el ZIP.
- Configurar `TURNSTILE_SECRET_KEY` como secreto del Worker; nunca copiarlo al repositorio.
- Verificar que el Worker desplegado use la lógica endurecida de `documentacion-cloudflare/jht-reclamaciones-api.js`. Editar el archivo local o subirlo a GitHub no actualiza automáticamente Cloudflare Workers.
- Probar el flujo navegador → Turnstile → Worker → D1 en el hostname público antes de habilitar la recepción real.
