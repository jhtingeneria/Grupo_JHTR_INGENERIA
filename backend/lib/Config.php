<?php
/**
 * ARCHIVO: backend/lib/Config.php
 * QUÉ HACE: Carga backend/config/config.php (creado a partir de
 * config.example.php) y falla con un mensaje claro si todavía no existe,
 * en vez de un error genérico de PHP.
 */

final class Config
{
    private static ?array $datos = null;

    public static function obtener(): array
    {
        if (self::$datos !== null) {
            return self::$datos;
        }

        $ruta = __DIR__ . '/../config/config.php';
        if (!is_file($ruta)) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'ok' => false,
                'error' => 'El backend no está configurado: falta backend/config/config.php. ' .
                    'Copia backend/config/config.example.php a config.php y completa los datos reales.',
            ]);
            exit;
        }

        self::$datos = require $ruta;
        return self::$datos;
    }
}
