<?php
/**
 * ARCHIVO: backend/lib/Validador.php
 * QUÉ HACE: Helpers de validación y saneo de los campos que llegan por
 * $_POST desde los formularios de contacto/cotización y reclamaciones.
 * La validación "de verdad" (required, type=email, etc.) ya la hace el
 * navegador (ver checkValidity() en assets/js/animations.js); esto es la
 * segunda capa, del lado del servidor, que nunca debe faltar porque
 * $_POST puede llegar de cualquier cliente HTTP, no solo del formulario.
 */

final class Validador
{
    public static function texto(array $datos, string $campo, int $maxLargo = 500): string
    {
        $valor = trim((string)($datos[$campo] ?? ''));
        $valor = strip_tags($valor);
        return mb_substr($valor, 0, $maxLargo);
    }

    public static function requerido(string $valor, string $campo): void
    {
        if ($valor === '') {
            Respuesta::error("El campo \"$campo\" es obligatorio.", 422);
        }
    }

    public static function email(string $valor): string
    {
        $valor = trim($valor);
        if ($valor !== '' && !filter_var($valor, FILTER_VALIDATE_EMAIL)) {
            Respuesta::error('El correo electrónico no es válido.', 422);
        }
        return $valor;
    }

    // Campo "honeypot": un input oculto por CSS que un humano nunca llena
    // pero que la mayoría de bots de spam sí completan automáticamente.
    // Si viene con contenido, se responde éxito falso (para no delatar el
    // mecanismo al bot) sin procesar ni notificar nada.
    public static function esBot(array $datos, string $campoHoneypot = 'sitio_web'): bool
    {
        return trim((string)($datos[$campoHoneypot] ?? '')) !== '';
    }
}
