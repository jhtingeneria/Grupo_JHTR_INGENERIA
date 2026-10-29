<?php
/**
 * ARCHIVO: backend/api/cotizacion.php
 * QUÉ HACE: Recibe el POST del formulario de cotización/contacto
 * (contacto/index.html, #form-cotizacion, ver inicializarFormularioContacto()
 * en assets/js/animations.js): valida los campos, guarda los archivos
 * adjuntos en backend/storage/uploads/ y envía un correo de notificación.
 * DÓNDE SE CONECTA: assets/js/animations.js → COTIZACION_ENDPOINT debe
 * apuntar a la URL pública de este archivo.
 */

require_once __DIR__ . '/../lib/Bootstrap.php';
require_once __DIR__ . '/../lib/Almacenamiento.php';
require_once __DIR__ . '/../lib/Correo.php';

if (Validador::esBot($_POST)) {
    Respuesta::ok(); // "éxito" falso para no delatar el honeypot a bots
}

$nombre = Validador::texto($_POST, 'nombre', 150);
$empresa = Validador::texto($_POST, 'empresa', 150);
$email = Validador::email(Validador::texto($_POST, 'email', 150));
$telefono = Validador::texto($_POST, 'telefono', 40);
$tipoProyecto = Validador::texto($_POST, 'tipo_proyecto', 100);
$descripcion = Validador::texto($_POST, 'descripcion', 4000);
$urgente = !empty($_POST['urgente']);

Validador::requerido($nombre, 'Nombre completo');
Validador::requerido($empresa, 'Empresa');
Validador::requerido($email, 'Correo electrónico');
Validador::requerido($telefono, 'Teléfono de contacto');
Validador::requerido($tipoProyecto, 'Tipo de proyecto');
Validador::requerido($descripcion, 'Descripción del requerimiento');

$rutasAdjuntos = Almacenamiento::guardarAdjuntos($_FILES['archivos'] ?? []);

$cuerpo = "Nueva solicitud de cotización desde jht-ingenieria.pe\n\n"
    . "Nombre: $nombre\n"
    . "Empresa: $empresa\n"
    . "Correo: $email\n"
    . "Teléfono: $telefono\n"
    . "Tipo de proyecto: $tipoProyecto\n"
    . "Urgente: " . ($urgente ? 'Sí' : 'No') . "\n\n"
    . "Descripción:\n$descripcion\n\n"
    . (empty($rutasAdjuntos)
        ? "Sin archivos adjuntos.\n"
        : "Archivos adjuntos (en el servidor):\n- " . implode("\n- ", $rutasAdjuntos) . "\n");

Correo::enviar('Nueva cotización: ' . $tipoProyecto . ' — ' . $empresa, $cuerpo);

Respuesta::ok(['mensaje' => 'Solicitud registrada correctamente.']);
