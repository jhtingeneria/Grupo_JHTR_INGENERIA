# Fase 18 — Formspree conectado

- Endpoint de cotizaciones: https://formspree.io/f/xrppqnnv
- Correo previsto en la cuenta de Formspree: jhtingeneria@gmail.com (comprobar destinatario y notificaciones dentro de Formspree).
- El formulario envía con `fetch`, `FormData` y `Accept: application/json`, y solo confirma éxito si la respuesta HTTP y el JSON indican éxito.
- Los archivos adjuntos quedan bloqueados preventivamente hasta verificar el soporte de adjuntos del plan; no se simula su recepción.
- El Libro de Reclamaciones sigue pendiente de una solución independiente.
- **No se ha realizado un envío real de prueba ni comprobado la llegada a Gmail.**
- Antes de publicar, probar una cotización con datos autorizados y verificar el registro en el panel de Formspree y el aviso por correo.
