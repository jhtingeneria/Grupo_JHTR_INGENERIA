# Fase 17 — Cotizaciones en GitHub Pages

**Destinatario:** jhtingeneria@gmail.com

## Lo que está hecho
- El formulario conserva los datos si no se puede enviar.
- El error se muestra junto al formulario en lugar de una ventana emergente.
- El botón se deshabilita mientras se procesa el envío para evitar duplicados.
- La confirmación solo aparece cuando el endpoint HTTPS devuelve JSON con `ok: true`.
- El frontend permite configurar un endpoint HTTPS sin editar `animations.js`.

## Lo que falta para activar envío real
1. Crear una cuenta en un servicio de formularios compatible con archivos adjuntos (por ejemplo, Formspree; revisar requisitos y precio vigente de archivos).
2. Crear un formulario cuyo destinatario verificado sea `jhtingeneria@gmail.com`.
3. Obtener la URL HTTPS real del formulario y agregarla **antes de** `assets/js/animations.js` en la página Contacto:

```html
<script>window.JHT_CONFIG = { cotizacionesEndpoint: 'https://formspree.io/f/ID_REAL' };</script>
```

4. Hacer una prueba real y confirmar la llegada del mensaje y adjuntos a Gmail.
5. Si el proveedor no soporta adjuntos en el plan elegido, no activar ese proveedor para el formulario actual sin resolver primero los adjuntos.

**Advertencia:** esta fase NO activa el envío por sí sola. No inventar un ID de formulario. El Libro de Reclamaciones requiere un flujo independiente y comprobante de registro, no basta un correo simple.
