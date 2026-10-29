# Fase 12 — Formularios sin confirmaciones falsas

- Se retiraron los mensajes públicos de simulación.
- Si los endpoints siguen vacíos, **NO se envía**, **NO se borra el formulario** y se informa claramente al visitante.
- La confirmación solo aparece después de una respuesta HTTP correcta y JSON `{"ok":true}` del backend.
- Se mantienen los adjuntos y las validaciones existentes.

## Para completar el envío real

1. Desplegar `backend/` en un servidor PHP con HTTPS y almacenamiento persistente. GitHub Pages no ejecuta PHP.
2. Configurar `backend/config/config.php` (partiendo del ejemplo), remitente de correo, destino, permisos y CORS para el dominio público. Nunca publicar secretos.
3. Configurar `COTIZACION_ENDPOINT` y `RECLAMACION_ENDPOINT` en `assets/js/animations.js` con URLs HTTPS reales.
4. Probar cotización con y sin adjuntos, rechazo de archivos, notificación por correo y recepción de reclamaciones, incluidos errores de red y validación.
5. Verificar que el correo de notificación se entregue realmente y que los reclamos se registren de forma persistente.

**Estado:** Se eliminó el falso éxito; la recepción real sigue pendiente de infraestructura y pruebas.
