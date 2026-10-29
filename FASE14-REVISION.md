# Fase 14 — Actualización de galería y limpieza

- La galería consulta Cloudinary cada 90 segundos mientras la pestaña está visible.
- Vuelve a consultar al regresar a la pestaña.
- Mantiene los proyectos visibles si hay un error temporal de conexión.
- No interrumpe el visor de fotografías o videos abierto.
- Se retiraron comentarios obsoletos sobre fases y simulaciones.

## Límites y activaciones pendientes

- **Sin etiquetas:** sigue requiriendo desplegar el Worker y configurar sus secretos.
- **Cotizaciones a Gmail:** el formulario todavía no envía correos desde GitHub Pages; requiere un servicio real y pruebas de recepción.
- **Publicación:** estos cambios están preparados en ZIP; no se han desplegado en GitHub Pages.
