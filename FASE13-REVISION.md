# Fase 13 — Preparación con GitHub Pages

- Configuración de ejemplo PHP: correo de notificaciones **jhtingeneria@gmail.com**.
- Origen permitido de ejemplo: **https://jhtingeneria.github.io** (el navegador envía el origen, no la ruta del repositorio).
- Carpeta Cloudinary de ejemplo: **GRUPO_JHT_INGENIERIA/PROYECTOS**.
- Retirados atributos de fase del botón de cotización y del formulario de contacto.
- Corregidos comentarios internos que describían incorrectamente un envío simulado.
- Retirados archivos de brochure y recordatorios pendientes que no son necesarios para el sitio.

## Lo que NO está activado

- Los formularios **no envían correos** mientras los endpoints sigan vacíos.
- El PHP de `backend/` **no se ejecuta en GitHub Pages**. No se deben subir claves ni `config.php` privado.
- El Cloudflare Worker necesita despliegue y credenciales en secretos antes de usar la galería sin etiquetas.
- No se ha realizado una prueba real de recepción de correo ni despliegue.

## Próxima decisión

Elegir un servicio de formularios con soporte de adjuntos y recepción a Gmail, o desplegar backend seguro, y hacer una prueba extremo a extremo antes de habilitar el mensaje de éxito.
