/*
 * GRUPO JHT INGENIERÍA SAC — integración pública de reclamaciones.
 * Solo usa la Site Key pública en el navegador. La Secret Key nunca va aquí.
 * Si falta configuración, el formulario queda bloqueado (fail-closed); no usa Formspree.
 */
(function () {
  'use strict';

  var formulario = document.getElementById('form-reclamacion');
  if (!formulario) return;

  var config = window.JHT_RECLAMACIONES || {};
  var contenedor = document.getElementById('jht-turnstile');
  var estado = document.getElementById('jht-estado-reclamacion');
  var boton = formulario.querySelector('button[type="submit"]');
  var enviando = false;
  var widgetId = null;
  var intentos = 0;

  function mostrar(mensaje) {
    if (estado) estado.textContent = mensaje;
  }

  function habilitarBoton(habilitar) {
    if (boton) boton.disabled = !habilitar || enviando;
  }

  function clavePublicaValida(valor) {
    return typeof valor === 'string' &&
      valor.trim() !== '' &&
      !valor.startsWith('REEMPLAZAR_') &&
      !valor.startsWith('1x00000000000000000000AA');
  }

  function apiValida(valor) {
    if (typeof valor !== 'string' || !valor.trim()) return false;
    try {
      var url = new URL(valor);
      return url.protocol === 'https:' ||
        (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname));
    } catch (_) {
      return false;
    }
  }

  // No habilitar el formulario hasta configurar una Site Key real y la API.
  if (!clavePublicaValida(config.siteKey) || !apiValida(config.api) || !contenedor) {
    habilitarBoton(false);
    mostrar('El formulario está temporalmente deshabilitado mientras se completa la configuración segura. No se ha enviado ningún registro.');
    formulario.addEventListener('submit', function (evento) {
      evento.preventDefault();
      mostrar('El formulario no está habilitado. No se ha enviado ningún registro.');
    });
    return;
  }

  function iniciarTurnstile() {
    if (!window.turnstile || typeof window.turnstile.render !== 'function') {
      if (++intentos < 80) {
        window.setTimeout(iniciarTurnstile, 250);
      } else {
        habilitarBoton(false);
        mostrar('No se pudo cargar la verificación de seguridad. Actualiza la página e inténtalo más tarde.');
      }
      return;
    }

    try {
      widgetId = window.turnstile.render(contenedor, {
        sitekey: config.siteKey,
        callback: function () {
          if (!enviando) habilitarBoton(true);
          mostrar('Verificación completada. Ya puedes enviar el formulario.');
        },
        'expired-callback': function () {
          habilitarBoton(false);
          mostrar('La verificación caducó. Complétala nuevamente.');
        },
        'error-callback': function () {
          habilitarBoton(false);
          mostrar('No se pudo completar la verificación de seguridad. Actualiza la página e inténtalo nuevamente.');
        }
      });
    } catch (error) {
      console.error('[reclamaciones-d1] No se pudo inicializar Turnstile.');
      habilitarBoton(false);
      mostrar('No se pudo iniciar la verificación de seguridad. El formulario permanece deshabilitado.');
    }
  }

  habilitarBoton(false);
  iniciarTurnstile();

  formulario.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    if (enviando) return;
    if (!formulario.checkValidity()) {
      formulario.reportValidity();
      return;
    }

    var campoSenal = formulario.elements.sitio_web;
    if (campoSenal && campoSenal.value.trim()) {
      mostrar('No se pudo procesar la solicitud.');
      return;
    }

    if (widgetId === null || !window.turnstile) {
      habilitarBoton(false);
      mostrar('La verificación de seguridad aún no está lista.');
      return;
    }

    var token = window.turnstile.getResponse(widgetId);
    if (!token) {
      habilitarBoton(false);
      mostrar('Completa la verificación de seguridad antes de enviar.');
      return;
    }

    var campos = new FormData(formulario);
    var datos = {
      tipo_reclamo: String(campos.get('tipo_reclamo') || ''),
      nombre: String(campos.get('nombre') || ''),
      documento: String(campos.get('documento') || ''),
      email: String(campos.get('email') || ''),
      telefono: String(campos.get('telefono') || ''),
      servicio: String(campos.get('servicio') || ''),
      detalle: String(campos.get('detalle') || ''),
      pedido: String(campos.get('pedido') || ''),
      turnstileToken: token
    };

    enviando = true;
    habilitarBoton(false);
    if (boton) boton.textContent = 'Registrando...';
    mostrar('Registrando tu solicitud de forma segura...');

    try {
      var respuesta = await fetch(config.api.replace(/\/+$/, '') + '/reclamaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
        cache: 'no-store',
        credentials: 'omit'
      });

      var resultado = await respuesta.json().catch(function () { return {}; });
      if (!respuesta.ok || !resultado.constancia || !resultado.constancia.codigo) {
        throw new Error(resultado.error || 'No se recibió confirmación del registro.');
      }

      var c = resultado.constancia;
      mostrar('Solicitud registrada. Código: ' + c.codigo +
        '. Fecha de registro: ' + (c.fecha_registro || 'confirmada por el servidor') +
        '. Guarda el código para futuras consultas.');
      formulario.reset();
    } catch (error) {
      console.error('[reclamaciones-d1] No se pudo confirmar el registro:', error.message);
      mostrar('No se pudo confirmar el registro. No reenvíes repetidamente; primero verifica el estado con JHT Ingeniería.');
    } finally {
      enviando = false;
      if (boton) boton.textContent = 'Enviar reclamo';
      // El botón seguirá deshabilitado hasta que Turnstile emita un token nuevo.
      habilitarBoton(false);
      if (window.turnstile && widgetId !== null) {
        try { window.turnstile.reset(widgetId); } catch (_) {}
      }
    }
  });
})();
