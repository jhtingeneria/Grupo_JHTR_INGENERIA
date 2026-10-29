<?php
/**
 * ARCHIVO: backend/lib/Bootstrap.php
 * QUÉ HACE: Arranque común de cada endpoint en backend/api/*.php:
 * - Habilita CORS solo para los orígenes listados en config.php
 *   ('origenes_permitidos'), necesario porque el frontend (Netlify) y
 *   este backend PHP pueden vivir en dominios distintos (Netlify no
 *   ejecuta PHP).
 * - Responde a la petición preflight OPTIONS que el navegador puede
 *   enviar antes del POST real.
 * - Oculta errores de PHP en la respuesta (los registra en el log del
 *   servidor) para no filtrar rutas/config si algo falla.
 */

require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Respuesta.php';
require_once __DIR__ . '/Validador.php';

ini_set('display_errors', '0');
error_reporting(E_ALL);

$config = Config::obtener();
$origenSolicitante = $_SERVER['HTTP_ORIGIN'] ?? '';
$origenesPermitidos = $config['origenes_permitidos'] ?? [];

if ($origenSolicitante !== '' && in_array($origenSolicitante, $origenesPermitidos, true)) {
    header('Access-Control-Allow-Origin: ' . $origenSolicitante);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    Respuesta::error('Método no permitido.', 405);
}
