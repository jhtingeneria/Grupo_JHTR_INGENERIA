# Fase 16 — Galería: estabilidad y control de calidad

## Cambios realizados
- Evita duplicar fotografías o videos cuando Cloudinary devuelve entradas repetidas.
- Si llegan proyectos nuevos mientras el visitante mira una foto/video ampliado, se aplaza el redibujado hasta cerrar el visor.
- Mantiene la consulta automática de la galería y el respaldo por etiqueta existentes.

## Pendientes reales (no declararlos terminados)
1. Desplegar el Worker de Cloudflare y añadir sus secretos directamente en Cloudflare; configurar su URL en `assets/js/proyectos-cloudinary.js`.
2. Comprobar con nuevas fotos/videos en la carpeta PROYECTOS que se publican sin etiqueta.
3. Conectar y probar el receptor real de cotizaciones hacia jhtingeneria@gmail.com; GitHub Pages no ejecuta PHP.
4. Configurar y verificar la recepción real del Libro de Reclamaciones.
5. Pruebas en dispositivos y publicación final.

No se incluyeron credenciales ni se desplegaron servicios externos.
