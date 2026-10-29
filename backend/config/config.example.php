<?php
/**
 * ARCHIVO: backend/config/config.example.php
 * QUÉ HACE: Plantilla de configuración del backend. Copiar este archivo a
 * "config.php" (mismo directorio) y completar los valores reales — ese
 * archivo NUNCA se sube al repositorio (ver backend/.gitignore) porque
 * contiene credenciales.
 *
 * CÓMO SE USA: cada script en backend/api/*.php hace
 * require __DIR__ . '/../config/config.php'; y lee la constante CONFIG.
 */

return [

    // Correo al que llegan las notificaciones de nuevas cotizaciones y
    // reclamos. Puede ser una lista separada por comas.
    'correo_notificaciones' => 'jhtingeneria@gmail.com',

    // Remitente con el que el servidor envía los correos (debe existir en
    // el dominio del hosting para que no lo marquen como spam).
    'correo_remitente' => 'no-responder@jht-ingenieria.pe',

    // SMTP opcional: si 'smtp.host' está vacío se usa la función mail()
    // nativa de PHP (suficiente en la mayoría de hostings compartidos,
    // ej. SiteGround). Completar solo si mail() no entrega correos.
    'smtp' => [
        'host' => '',
        'puerto' => 587,
        'usuario' => '',
        'clave' => '',
        'seguridad' => 'tls', // 'tls' | 'ssl'
    ],

    // Cloudinary: usado por backend/api/cloudinary-upload.php para subir
    // videos/imágenes desde el servidor (nunca exponer el API Secret en
    // el HTML/JS público). Cloud name, API Key y API Secret están en el
    // dashboard de Cloudinary → Settings → API Keys.
    'cloudinary' => [
        'cloud_name' => '',
        'api_key' => '',
        'api_secret' => '',
        // Carpeta dentro de Cloudinary donde se organizan las subidas.
        'carpeta' => 'GRUPO_JHT_INGENIERIA/PROYECTOS',
    ],

    // Límites de subida de archivos (deben ser coherentes con los límites
    // ya validados en el navegador — ver COTIZACION_MAX_ARCHIVOS y
    // COTIZACION_MAX_PESO_MB en assets/js/animations.js).
    'archivos' => [
        'max_archivos' => 3,
        'max_peso_mb' => 10,
        'extensiones_permitidas' => ['pdf', 'dxf', 'dwg', 'step', 'stp', 'igs', 'iges'],
    ],

    // Clave secreta usada solo para nombrar carpetas de subida de forma
    // no adivinable (no es una clave de seguridad crítica).
    'sal_almacenamiento' => 'CAMBIAR-ESTA-CADENA-POR-UNA-PROPIA',

    // Token que hay que enviar en el campo "token" al llamar a
    // backend/api/cloudinary-upload.php (subida manual de videos/brochure
    // desde un formulario interno, NO desde el sitio público). Generar
    // uno propio largo y aleatorio, ej. con `openssl rand -hex 32`.
    'token_admin' => 'CAMBIAR-ESTE-TOKEN-POR-UNO-PROPIO',

    // Dominios desde los que se permite llamar a esta API por fetch()
    // (CORS). Necesario mientras el frontend (GitHub Pages) y este backend
    // PHP (que GitHub Pages NO puede ejecutar) viven en dominios distintos.
    // Agregar aquí el origen real del sitio publicado en GitHub Pages
    // y, cuando exista, el dominio definitivo. "http://localhost:*" ayuda
    // a probar el formulario en local antes de desplegar.
    'origenes_permitidos' => [
        'http://localhost:8080',
        'https://jhtingeneria.github.io',
    ],

];
