<?php
/**
 * ARCHIVO: backend/lib/Cloudinary.php
 * QUÉ HACE: Sube un archivo a Cloudinary desde el servidor usando el API
 * Key + API Secret guardados en backend/config/config.php (nunca en el
 * HTML/JS público). Implementa la subida firmada de la API REST de
 * Cloudinary a mano, con cURL puro — sin el SDK oficial, para no
 * depender de Composer y poder correr en cualquier hosting con PHP.
 * Referencia: https://cloudinary.com/documentation/upload_images#authenticated_requests
 */

final class Cloudinary
{
    /**
     * @param string $rutaArchivo   Ruta local del archivo a subir (ej. $_FILES[...]['tmp_name']).
     * @param string $nombreOriginal Nombre original del archivo (solo para el Content-Type/registro).
     * @param string $tipoRecurso   'image' | 'video' | 'raw' | 'auto'.
     */
    public static function subirArchivo(string $rutaArchivo, string $nombreOriginal, string $tipoRecurso = 'auto'): array
    {
        $config = Config::obtener()['cloudinary'] ?? [];
        if (empty($config['cloud_name']) || empty($config['api_key']) || empty($config['api_secret'])) {
            Respuesta::error('Cloudinary no está configurado en el servidor (backend/config/config.php).', 500);
        }

        // Solo los parámetros que se envían (además de file/api_key/signature)
        // entran en la firma, ordenados alfabéticamente y unidos con "&".
        $parametrosAFirmar = [
            'folder' => $config['carpeta'] ?: 'jht-ingenieria',
            'timestamp' => time(),
        ];
        ksort($parametrosAFirmar);
        $cadena = '';
        foreach ($parametrosAFirmar as $clave => $valor) {
            $cadena .= ($cadena === '' ? '' : '&') . "$clave=$valor";
        }
        $firma = sha1($cadena . $config['api_secret']);

        $url = "https://api.cloudinary.com/v1_1/{$config['cloud_name']}/{$tipoRecurso}/upload";

        $campos = $parametrosAFirmar;
        $campos['file'] = new CURLFile($rutaArchivo, mime_content_type($rutaArchivo) ?: 'application/octet-stream', $nombreOriginal);
        $campos['api_key'] = $config['api_key'];
        $campos['signature'] = $firma;

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $campos,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 180,
        ]);
        $respuesta = curl_exec($ch);
        $errorCurl = curl_error($ch);
        curl_close($ch);

        if ($respuesta === false) {
            Respuesta::error('No se pudo conectar con Cloudinary: ' . $errorCurl, 502);
        }

        $datos = json_decode($respuesta, true);
        if (!is_array($datos) || !isset($datos['secure_url'])) {
            $mensaje = $datos['error']['message'] ?? 'respuesta inesperada de Cloudinary';
            Respuesta::error('Cloudinary rechazó el archivo: ' . $mensaje, 502);
        }

        return $datos;
    }
}
