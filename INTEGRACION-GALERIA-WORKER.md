# Integración de la galería automática — JHT

## Cambio realizado

- `assets/js/proyectos-cloudinary.js`: se configuró `GALLERY_API` con `https://super-glitter-48af.jhtingeneria.workers.dev/proyectos`.
- `cloudinary-worker/worker.js`: se alineó la ruta de ejemplo del repositorio con `/proyectos`, para evitar discrepancias con el Worker desplegado. **No es necesario volver a desplegar el Worker que ya funciona.**
- Se conservaron filtros, visor, paginación de la interfaz, actualización periódica y respaldo por lista pública.

## Comportamiento

La página `/proyectos/` consulta el Worker y muestra los recursos devueltos. Los nuevos archivos subidos a la carpeta `GRUPO_JHT_INGENIERIA/PROYECTOS` se reflejan cuando expiran las cachés y la página vuelve a consultar el servicio. No requiere etiquetas manuales para el flujo principal.

## Pruebas pendientes

1. Abrir la página local usando un servidor HTTP (por ejemplo, Live Server) y revisar la sección Proyectos.
2. Confirmar que se visualizan seis fotografías y que el visor abre correctamente.
3. Subir una imagen de prueba a la carpeta PROYECTOS y verificar su aparición tras la actualización.
4. Probar videos y visualización móvil.
5. Revisar el resto de funcionalidades antes del ZIP final de producción.

**Seguridad:** nunca incluir API Key o API Secret en el repositorio.
