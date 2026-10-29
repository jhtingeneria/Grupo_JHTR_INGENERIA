<?php
/**
 * ARCHIVO: backend/lib/Respuesta.php
 * QUÉ HACE: Helpers para responder JSON de forma consistente desde
 * cualquier endpoint en backend/api/*.php.
 */

final class Respuesta
{
    public static function json(array $datos, int $codigoHttp = 200): void
    {
        http_response_code($codigoHttp);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($datos, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function ok(array $datos = []): void
    {
        self::json(array_merge(['ok' => true], $datos), 200);
    }

    public static function error(string $mensaje, int $codigoHttp = 400): void
    {
        self::json(['ok' => false, 'error' => $mensaje], $codigoHttp);
    }
}
