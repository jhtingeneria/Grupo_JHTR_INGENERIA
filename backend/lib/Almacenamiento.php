<?php
/**
 * ARCHIVO: backend/lib/Almacenamiento.php
 * QUÉ HACE: Guarda los archivos adjuntos del formulario de cotización
 * (planos DXF/DWG/STEP/IGES, PDF) en backend/storage/uploads/, validando
 * extensión y peso del lado del servidor (la validación del navegador en
 * assets/js/animations.js es solo la primera capa, no la única).
 */

final class Almacenamiento
{
    /**
     * @return array Lista de rutas relativas guardadas (para el correo de notificación).
     */
    public static function guardarAdjuntos(array $archivos): array
    {
        $config = Config::obtener();
        $limites = $config['archivos'];
        $sal = $config['sal_almacenamiento'] ?? 'jht';

        if (empty($archivos['name'][0] ?? null)) {
            return [];
        }

        $cantidad = count($archivos['name']);
        if ($cantidad > $limites['max_archivos']) {
            Respuesta::error('Se enviaron más archivos de los permitidos (máximo ' . $limites['max_archivos'] . ').', 422);
        }

        $carpetaDestino = __DIR__ . '/../storage/uploads/' . date('Y-m') . '/' . substr(hash('sha256', $sal . uniqid('', true)), 0, 12);
        $rutasGuardadas = [];

        for ($i = 0; $i < $cantidad; $i++) {
            if (($archivos['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                continue; // campo opcional vacío
            }
            if ($archivos['error'][$i] !== UPLOAD_ERR_OK) {
                Respuesta::error('Error al recibir el archivo "' . $archivos['name'][$i] . '".', 422);
            }

            $nombreOriginal = $archivos['name'][$i];
            $extension = strtolower(pathinfo($nombreOriginal, PATHINFO_EXTENSION));
            if (!in_array($extension, $limites['extensiones_permitidas'], true)) {
                Respuesta::error('El archivo "' . $nombreOriginal . '" no tiene un formato permitido.', 422);
            }

            $pesoMaximoBytes = $limites['max_peso_mb'] * 1024 * 1024;
            if ($archivos['size'][$i] > $pesoMaximoBytes) {
                Respuesta::error('El archivo "' . $nombreOriginal . '" supera el peso máximo de ' . $limites['max_peso_mb'] . ' MB.', 422);
            }

            if (!is_dir($carpetaDestino) && !mkdir($carpetaDestino, 0750, true) && !is_dir($carpetaDestino)) {
                Respuesta::error('No se pudo preparar el almacenamiento de archivos en el servidor.', 500);
            }

            $nombreSeguro = date('His') . '_' . preg_replace('/[^a-zA-Z0-9._-]/', '_', $nombreOriginal);
            $rutaDestino = $carpetaDestino . '/' . $nombreSeguro;

            if (!move_uploaded_file($archivos['tmp_name'][$i], $rutaDestino)) {
                Respuesta::error('No se pudo guardar el archivo "' . $nombreOriginal . '" en el servidor.', 500);
            }

            $rutasGuardadas[] = str_replace(__DIR__ . '/../', '', $rutaDestino);
        }

        return $rutasGuardadas;
    }
}
