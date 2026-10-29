<?php
/**
 * ARCHIVO: backend/api/reclamaciones.php
 * QUÉ HACE: Recibe el POST del Libro de Reclamaciones (reclamaciones/index.html,
 * #form-reclamacion): valida los campos, registra el reclamo en
 * backend/storage/reclamaciones/ (un archivo .jsonl, una línea por
 * reclamo — libro de reclamaciones simple sin base de datos) y envía un
 * correo de notificación.
 * DÓNDE SE CONECTA: assets/js/animations.js → RECLAMACION_ENDPOINT debe
 * apuntar a la URL pública de este archivo.
 */

require_once __DIR__ . '/../lib/Bootstrap.php';
require_once __DIR__ . '/../lib/Correo.php';

if (Validador::esBot($_POST)) {
    Respuesta::ok();
}

$tipoReclamo = Validador::texto($_POST, 'tipo_reclamo', 20);
$fecha = Validador::texto($_POST, 'fecha', 20);
$nombre = Validador::texto($_POST, 'nombre', 150);
$documento = Validador::texto($_POST, 'documento', 30);
$email = Validador::email(Validador::texto($_POST, 'email', 150));
$telefono = Validador::texto($_POST, 'telefono', 40);
$servicio = Validador::texto($_POST, 'servicio', 100);
$detalle = Validador::texto($_POST, 'detalle', 4000);
$pedido = Validador::texto($_POST, 'pedido', 2000);

Validador::requerido($tipoReclamo, 'Tipo de documento');
Validador::requerido($nombre, 'Nombres y apellidos');
Validador::requerido($documento, 'N.º de documento');
Validador::requerido($email, 'Correo electrónico');
Validador::requerido($detalle, 'Descripción del reclamo o queja');

$registro = [
    'fecha_registro' => date('c'),
    'tipo_reclamo' => $tipoReclamo,
    'fecha' => $fecha,
    'nombre' => $nombre,
    'documento' => $documento,
    'email' => $email,
    'telefono' => $telefono,
    'servicio' => $servicio,
    'detalle' => $detalle,
    'pedido' => $pedido,
];

$carpetaLog = __DIR__ . '/../storage/reclamaciones';
if (!is_dir($carpetaLog)) {
    mkdir($carpetaLog, 0750, true);
}
$archivoLog = $carpetaLog . '/' . date('Y') . '.jsonl';
file_put_contents($archivoLog, json_encode($registro, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);

$cuerpo = "Nuevo registro en el Libro de Reclamaciones — jht-ingenieria.pe\n\n"
    . "Tipo: $tipoReclamo\n"
    . "Fecha indicada: $fecha\n"
    . "Nombre: $nombre\n"
    . "Documento: $documento\n"
    . "Correo: $email\n"
    . "Teléfono: $telefono\n"
    . "Servicio relacionado: $servicio\n\n"
    . "Detalle:\n$detalle\n\n"
    . "Pedido del consumidor:\n$pedido\n";

Correo::enviar('Nuevo ' . strtolower($tipoReclamo ?: 'reclamo') . ' — Libro de Reclamaciones', $cuerpo);

Respuesta::ok(['mensaje' => 'Reclamo registrado correctamente.']);
