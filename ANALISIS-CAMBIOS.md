# Análisis de las dos copias del proyecto

## Qué cambió entre `GRUPO_JHT_INGENERÍA_anterior.zip` y `GRUPO_JHT_LISTO_PARA_GITHUB.zip`

- La copia más reciente incluye `.gitignore` y documentación de publicación en GitHub Pages/Cloudflare.
- `assets/js/animations.js` fue cambiado para no enviar las reclamaciones a Formspree como alternativa automática.
- En `reclamaciones/index.html`, la Site Key está como marcador `REEMPLAZAR_CON_SITE_KEY_PUBLICA`.
- Por eso la versión reciente muestra que el formulario está deshabilitado. Es un bloqueo intencional, no un fallo visual: evita recibir datos por una ruta no verificada.
- La versión anterior tenía una integración activa con Formspree para reclamaciones. Eso explica el correo “New form submission”. Ese correo solo demostraba que Formspree aceptó el envío; no demostraba un registro en D1 ni una constancia oficial.

## Correcciones incluidas en esta copia

- El botón del Libro de Reclamaciones empieza deshabilitado y solo se habilita cuando Turnstile entrega un token válido.
- El frontend rechaza la Site Key de prueba conocida y mantiene el formulario bloqueado si falta una Site Key de producción o una URL de API válida.
- Se elimina el fallback silencioso a Formspree para reclamaciones.
- El Worker de referencia usa orígenes y hostname configurables.
- El bypass `X-JHT-Test-Key` solo puede funcionar en desarrollo si `ENABLE_TEST_BYPASS=true`; no puede omitir Turnstile en producción.
- El endpoint `/salud` realiza una consulta real `SELECT 1` a D1.
- El Worker solo imprime los campos de diagnóstico `success`, `hostname` y `error-codes` en modo desarrollo; nunca registra el token ni el secreto.
- Se agregan instrucciones y checklist de publicación.

## Lo que no se puede finalizar solo editando el ZIP

1. No se incluye la Site Key real de producción porque debe copiarse desde el panel del widget Turnstile de JHT.
2. La Secret Key debe configurarse como secreto dentro del Worker de Cloudflare, no dentro de GitHub.
3. La fuente del Worker en `documentacion-cloudflare/` no actualiza el Worker desplegado automáticamente.
4. El Worker real, su binding D1 de producción, el hostname de Turnstile y CORS deben comprobarse en Cloudflare.
5. La prueba integral de producción y la revisión de requisitos legales de Perú siguen pendientes.

Por tanto, esta copia está preparada para publicarse como sitio estático, pero el formulario permanece cerrado de forma segura hasta completar los pasos de Cloudflare y validar el flujo de extremo a extremo.
