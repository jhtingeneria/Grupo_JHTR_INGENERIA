# Fase 15 — Resiliencia de la galería y revisión técnica

## Cambios realizados
- La galería consulta el Worker por carpeta cuando su URL esté configurada; si ese servicio falla, intenta las listas públicas por etiqueta como respaldo.
- Acepta versiones numéricas de Cloudinary que lleguen como número o cadena.
- El Worker evita crear múltiples entradas de caché por parámetros de consulta y devuelve 405 para métodos no permitidos.
- Se conservan las mejoras de las fases anteriores, sin cambiar el logo ni los contactos.

## Pendientes que requieren configuración externa
1. Desplegar el Worker en Cloudflare y añadir los secretos de Cloudinary (nunca al repositorio).
2. Configurar `GALLERY_API` con la URL real del Worker en `assets/js/proyectos-cloudinary.js`.
3. Conectar un servicio de recepción y correo para cotizaciones a `jhtingeneria@gmail.com` y probar un envío real.
4. Implementar y probar recepción real del Libro de Reclamaciones.
5. Pruebas completas en navegadores/dispositivos y publicación final en GitHub Pages.

**No se ha desplegado ni se ha comprobado un envío real de correo.**
