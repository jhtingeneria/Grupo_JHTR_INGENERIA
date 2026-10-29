<?php
/**
 * ARCHIVO: backend/api/cloudinary-upload.php
 * QUÉ HACE: Endpoint de uso interno/administrativo (NO llamado desde el
 * sitio público) para subir un archivo (video de un servicio, brochure,
 * logo de cliente, foto de proyecto) a Cloudinary usando las credenciales
 * guardadas en el servidor (backend/config/config.php). Requiere el
 * campo "token" con el valor de 'token_admin' en config.php.
 *
 * CÓMO SE USA (ejemplo con curl, reemplazando TOKEN y el archivo):
 *   curl -F "token=TOKEN" -F "tipo=video" -F "archivo=@torno-cnc.mp4" \
 *        https://tu-dominio.com/backend/api/cloudinary-upload.php
 *
 * La respuesta JSON trae "secure_url": esa es la URL que se pega en el
 * <source src="..."> de las tarjetas de servicio (ver los comentarios
 * "PENDIENTE: reemplazar la URL de Cloudinary" en index.html y
 * servicios/index.html).
 */

require_once __DIR__ . '/../lib/Bootstrap.php';
require_once __DIR__ . '/../lib/Cloudinary.php';

$config = Config::obtener();
$token = $_POST['token'] ?? '';
$tokenValido = $config['token_admin'] ?? '';

if ($tokenValido === '' || $tokenValido === 'CAMBIAR-ESTE-TOKEN-POR-UNO-PROPIO' || !hash_equals($tokenValido, $token)) {
    Respuesta::error('Token inválido o no configurado.', 403);
}

if (empty($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
    Respuesta::error('No se recibió ningún archivo en el campo "archivo".', 422);
}

$tipoRecurso = Validador::texto($_POST, 'tipo', 10) ?: 'auto'; // 'image' | 'video' | 'raw' | 'auto'

$resultado = Cloudinary::subirArchivo(
    $_FILES['archivo']['tmp_name'],
    $_FILES['archivo']['name'],
    $tipoRecurso
);

Respuesta::ok([
    'secure_url' => $resultado['secure_url'],
    'public_id' => $resultado['public_id'] ?? null,
    'resource_type' => $resultado['resource_type'] ?? null,
]);
