# Actualización del proyecto JHT — 28/10/2026

## Qué se modificó
- Se conservó el diseño, la galería Cloudinary, el Worker de Cloudinary y el formulario de cotizaciones.
- Se añadió `assets/js/reclamaciones-d1.js` para enviar reclamaciones al Worker de D1 con Turnstile.
- Se añadió el contenedor Turnstile y la configuración pública en `reclamaciones/index.html`.
- Se exige el campo `pedido`, obligatorio para el Worker.
- Mientras la Site Key permanezca como `REEMPLAZAR_CON_SITE_KEY_PUBLICA`, el formulario queda bloqueado de forma segura; no se envía a Formspree ni se registra en D1.
- Se adjunta el Worker de reclamaciones y SQL en `documentacion-cloudflare/` como referencia; no son necesarios para GitHub Pages.

## Para activar el envío a D1
1. Abrir `reclamaciones/index.html` y sustituir **solo** `REEMPLAZAR_CON_SITE_KEY_PUBLICA` por la Site Key real de Turnstile.
2. Verificar en Cloudflare Turnstile que `jhtingeneria.github.io` esté autorizado.
3. Confirmar en Cloudflare Worker las variables secretas `TURNSTILE_SECRET_KEY` y `JHT_TEST_KEY`, y binding D1 `DB`.
4. Probar en entorno de pruebas un envío y confirmar código correlativo en D1. No habilitar recepción pública hasta verificar el flujo completo.
5. El Worker de `documentacion-cloudflare/` es una fuente de referencia endurecida; no reemplaza automáticamente el Worker desplegado. Comparar y probar antes de actualizar producción.

## Pendiente antes de afirmar cumplimiento legal
Revisar requisitos vigentes de Perú para el Libro de Reclamaciones, campos obligatorios, hoja/constancia, plazos, privacidad y procedimientos de atención; implementar PDF y notificaciones; prevenir duplicados ante fallos de red; revisar controles de abuso y la autenticación administrativa. El acuse mostrado es técnico, no constancia legal validada.

## Importante
No agregar `TURNSTILE_SECRET_KEY`, `JHT_TEST_KEY`, credenciales Cloudinary ni otros secretos al repositorio. La carpeta `documentacion-cloudflare` contiene código de referencia y SQL, no secretos.
