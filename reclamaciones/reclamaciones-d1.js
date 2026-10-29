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

  // Constancia visible en pantalla + botón para imprimir o guardar como PDF (sin costo, usa el navegador).
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function mostrarConstancia(c) {
    var caja = document.getElementById('jht-constancia');
    if (!caja) return;
    var fecha = c.fecha_registro_lima || c.fecha_registro || '';
    caja.textContent = '';

    var titulo = document.createElement('h3');
    titulo.textContent = 'Constancia de recepción';
    caja.appendChild(titulo);

    [
      ['N° de reclamo', c.codigo],
      ['Tipo', c.tipo_reclamo],
      ['Fecha y hora (Lima)', fecha],
      ['Consumidor', c.nombre],
      ['Correo de contacto', c.email]
    ].forEach(function (par) {
      var p = document.createElement('p');
      var b = document.createElement('strong');
      b.textContent = par[0] + ': ';
      p.appendChild(b);
      p.appendChild(document.createTextNode(par[1] || '-'));
      caja.appendChild(p);
    });

    var aviso = document.createElement('p');
    aviso.textContent = 'Guarde este código. Puede imprimir o guardar esta constancia como PDF.';
    caja.appendChild(aviso);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--secondary btn--sm';
    btn.textContent = 'Imprimir / guardar PDF';
    btn.addEventListener('click', function () { imprimirConstancia(c, fecha); });
    caja.appendChild(btn);

    caja.hidden = false;
    caja.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function imprimirConstancia(c, fecha) {
    var w = window.open('', '_blank');
    if (!w) { mostrar('Su navegador bloqueó la ventana. Permita las ventanas emergentes e inténtelo de nuevo.'); return; }
    var filas = [
      ['N° de reclamo', c.codigo], ['Tipo', c.tipo_reclamo], ['Fecha y hora (Lima)', fecha],
      ['Nombre', c.nombre], ['Documento', c.documento], ['Domicilio', c.domicilio],
      ['Correo', c.email], ['Teléfono', c.telefono], ['Servicio', c.servicio],
      ['Monto reclamado', c.monto_reclamado], ['Detalle', c.detalle], ['Pedido del consumidor', c.pedido]
    ].map(function (f) { return '<tr><th>' + esc(f[0]) + '</th><td>' + esc(f[1] || '-') + '</td></tr>'; }).join('');
    w.document.write('<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Constancia ' + esc(c.codigo) + '</title>' +
      '<style>body{font-family:Arial,sans-serif;margin:32px;color:#111}h1{font-size:20px}h2{font-size:16px;margin-top:0}' +
      'table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:8px;text-align:left;vertical-align:top;white-space:pre-wrap}' +
      'th{width:30%;background:#eee}</style></head><body>' +
      '<h1>GRUPO JHT INGENIERÍA SAC</h1><h2>Libro de Reclamaciones — Constancia de recepción</h2>' +
      '<table>' + filas + '</table>' +
      '<p style="margin-top:16px;font-size:12px">Esta constancia acredita la recepción del registro. Conserve el código para cualquier consulta.</p>' +
      '</body></html>');
    w.document.close();
    w.focus();
    w.print();
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
      domicilio: String(campos.get('domicilio') || ''),
      email: String(campos.get('email') || ''),
      telefono: String(campos.get('telefono') || ''),
      servicio: String(campos.get('servicio') || ''),
      monto_reclamado: String(campos.get('monto_reclamado') || ''),
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
      mostrar('Su reclamo fue registrado correctamente.');
      mostrarConstancia(c);
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
