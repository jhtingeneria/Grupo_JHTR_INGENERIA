# Galería automática JHT — configuración pendiente en Cloudinary

La sección `/proyectos/` ahora incorpora una galería que consulta dos listas públicas:

- `https://res.cloudinary.com/o6pcvfxm/image/list/jht_proyectos_publicados.json`
- `https://res.cloudinary.com/o6pcvfxm/video/list/jht_proyectos_publicados.json`

## Publicar archivos

1. Sube fotos y videos a la carpeta `GRUPO_JHT_INGENIERIA/PROYECTOS`.
2. Agrega la etiqueta exacta `jht_proyectos_publicados` a **cada archivo que quieras mostrar**. La carpeta por sí sola no activa la galería.
3. En Cloudinary habilita **Resource List** (listas públicas por etiqueta) en la configuración de seguridad si tu cuenta lo permite. Esta configuración puede estar deshabilitada por defecto. Consulta los controles actuales en tu consola.
4. Abre los dos enlaces anteriores en el navegador: deben responder JSON con `resources` en vez de 401/403/404. Si no es posible habilitar las listas públicas, habrá que utilizar un backend/serverless con credenciales guardadas en el servidor, nunca en GitHub Pages.
5. Publica el ZIP actualizado en tu hosting y abre `/proyectos/`.

La galería carga hasta 12 tarjetas inicialmente, filtra imágenes/videos, abre una vista ampliada y ofrece `Ver más proyectos`. Cada visita consulta las listas, por lo que los nuevos archivos etiquetados se incorporan sin republicar el código, sujeto a la caché de Cloudinary. El orden se basa en `created_at` cuando el listado lo proporciona.

**Limitación:** las listas públicas de Cloudinary no son una solución de paginación ilimitada garantizada. Si el catálogo supera el máximo que devuelve ese endpoint, usa un backend con paginación. No se ha verificado en línea que las listas estén habilitadas ni que existan recursos etiquetados. No mostrar datos privados o de clientes sin permiso.
