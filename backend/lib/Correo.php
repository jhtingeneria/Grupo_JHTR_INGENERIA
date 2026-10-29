<?php
/**
 * ARCHIVO: backend/lib/Correo.php
 * QUÉ HACE: Envía la notificación por correo de una nueva cotización o
 * reclamo. Usa mail() nativa de PHP (funciona en la mayoría de hostings
 * compartidos, ej. SiteGround, sin dependencias externas). Si en
 * config.php se completan los datos de 'smtp', hostings donde mail() no
 * entrega correos pueden conectar ahí un cliente SMTP (ej. PHPMailer vía
 * Composer) — el método enviar() es el único punto a reemplazar.
 */

final class Correo
{
    public static function enviar(string $asunto, string $cuerpoTexto): bool
    {
        $config = Config::obtener();
        $destinatarios = $config['correo_notificaciones'] ?? '';
        $remitente = $config['correo_remitente'] ?? '';

        if ($destinatarios === '' || $remitente === '') {
            error_log('[backend/lib/Correo.php] Falta correo_notificaciones o correo_remitente en config.php; no se envía correo.');
            return false;
        }

        $cabeceras = [
            'From' => $remitente,
            'Reply-To' => $remitente,
            'Content-Type' => 'text/plain; charset=UTF-8',
        ];
        $cabecerasTexto = '';
        foreach ($cabeceras as $nombre => $valor) {
            $cabecerasTexto .= "$nombre: $valor\r\n";
        }

        $asuntoCodificado = '=?UTF-8?B?' . base64_encode($asunto) . '?=';

        $enviado = @mail($destinatarios, $asuntoCodificado, $cuerpoTexto, $cabecerasTexto);
        if (!$enviado) {
            error_log('[backend/lib/Correo.php] mail() devolvió false al notificar: ' . $asunto);
        }
        return $enviado;
    }
}
