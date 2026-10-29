# Fase 11 — Galería automática por carpeta

## Incluido en esta entrega
- Worker seguro para consultar Cloudinary Search API por `asset_folder`.
- Obtiene fotografías y videos, ordenados por fecha de carga; no requiere etiquetas.
- Caché de 120 segundos, CORS restringido y credenciales únicamente en secretos del Worker.
- Web preparada para consumir el Worker. **No está activado hasta desplegarlo y configurar su URL.**
- Hasta entonces la web mantiene la galería actual por etiqueta como respaldo.

## Activación pendiente (una sola vez)
1. Crear una cuenta/proyecto de Cloudflare Workers y desplegar el contenido de `cloudinary-worker/` (por ejemplo mediante Wrangler).
2. En configuración del Worker > Variables and Secrets, añadir como **Secret** `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`, obtenidos de Cloudinary. **Nunca compartirlos por chat ni subirlos a GitHub**.
3. Comprobar que la URL pública del Worker devuelve `resources` con las 6 fotos y, si los hay, videos.
4. Editar `assets/js/proyectos-cloudinary.js`: establecer `GALLERY_API` a la URL exacta del Worker.
5. Publicar el sitio una vez en GitHub Pages. Desde ese momento, nuevas fotos/videos cargados en `GRUPO_JHT_INGENIERIA/PROYECTOS` aparecerán tras refrescar la web y vencer la caché (~2 minutos, salvo otras cachés).

## Notas
- Cloudinary Search API puede estar sujeta a límites del plan; el Worker utiliza caché para reducir consultas.
- El Worker consulta hasta 2.000 recursos por petición; `truncated: true` indica que haría falta paginación para más.
- Si Cloudinary utiliza un modo de carpetas distinto, comprobar que `asset_folder` coincida con la carpeta visible en Media Library.
- No se ha desplegado ni probado con credenciales reales; faltan esos pasos para confirmar funcionamiento extremo a extremo.
