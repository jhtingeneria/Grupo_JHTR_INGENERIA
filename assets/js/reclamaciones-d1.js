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

  // ==PDF-INICIO==
  // Generador de PDF mínimo, sin librerías ni costo. Solo texto, Helvetica, varias páginas.
  function pdfTexto(valor) {
    var s = String(valor == null ? '' : valor)
      .replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-').replace(/\u2026/g, '...').replace(/\r/g, '');
    var o = '';
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c === 10) o += '\n';
      else if (c < 32 || (c >= 127 && c <= 159) || c > 255) o += (c === 9 ? ' ' : '?');
      else o += s.charAt(i);
    }
    return o;
  }

  function pdfEscapar(s) {
    return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  function pdfEnvolver(texto, max) {
    var lineas = [];
    pdfTexto(texto).split('\n').forEach(function (parrafo) {
      var linea = '';
      parrafo.split(' ').forEach(function (palabra) {
        while (palabra.length > max) {
          if (linea) { lineas.push(linea); linea = ''; }
          lineas.push(palabra.slice(0, max));
          palabra = palabra.slice(max);
        }
        if (linea && (linea + ' ' + palabra).length > max) { lineas.push(linea); linea = palabra; }
        else linea = linea ? linea + ' ' + palabra : palabra;
      });
      lineas.push(linea);
    });
    return lineas;
  }

  // bloques: [{ t: 'texto', n: tamaño, b: negrita(bool), s: espacio previo }]
  function pdfConstruir(bloques) {
    var MARGEN = 50, ALTO = 842, LIMITE_INFERIOR = 60;
    var paginas = [[]], y = ALTO - MARGEN;
    bloques.forEach(function (bl) {
      var max = Math.floor(495 / (bl.n * 0.55));
      var interlineado = Math.round(bl.n * 1.4);
      y -= (bl.s || 0);
      pdfEnvolver(bl.t, max).forEach(function (linea) {
        if (y < LIMITE_INFERIOR) { paginas.push([]); y = ALTO - MARGEN; }
        paginas[paginas.length - 1].push('BT /' + (bl.b ? 'F2' : 'F1') + ' ' + bl.n + ' Tf 1 0 0 1 ' + MARGEN + ' ' + y + ' Tm (' + pdfEscapar(linea) + ') Tj ET');
        y -= interlineado;
      });
    });

    var out = '%PDF-1.4\n', offsets = [];
    function agregar(n, cuerpo) { offsets[n] = out.length; out += n + ' 0 obj\n' + cuerpo + '\nendobj\n'; }
    var kids = paginas.map(function (_, i) { return (5 + 2 * i) + ' 0 R'; }).join(' ');
    agregar(1, '<< /Type /Catalog /Pages 2 0 R >>');
    agregar(2, '<< /Type /Pages /Kids [' + kids + '] /Count ' + paginas.length + ' >>');
    agregar(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    agregar(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    paginas.forEach(function (ops, i) {
      var flujo = ops.join('\n');
      agregar(5 + 2 * i, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ' + (6 + 2 * i) + ' 0 R >>');
      agregar(6 + 2 * i, '<< /Length ' + flujo.length + ' >>\nstream\n' + flujo + '\nendstream');
    });
    var total = 4 + 2 * paginas.length, xref = out.length;
    out += 'xref\n0 ' + (total + 1) + '\n0000000000 65535 f \n';
    for (var n = 1; n <= total; n++) out += ('0000000000' + offsets[n]).slice(-10) + ' 00000 n \n';
    out += 'trailer\n<< /Size ' + (total + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';

    var bytes = new Uint8Array(out.length);
    for (var k = 0; k < out.length; k++) bytes[k] = out.charCodeAt(k) & 255;
    return bytes;
  }

  function pdfConstancia(c, fecha) {
    var bloques = [
      { t: 'GRUPO JHT INGENIERIA SAC', n: 16, b: true },
      { t: 'Libro de Reclamaciones - Constancia de recepcion', n: 12, b: true, s: 4 },
      { t: 'N° de reclamo: ' + (c.codigo || '-'), n: 14, b: true, s: 14 },
      { t: 'Fecha y hora de registro (Lima): ' + (fecha || '-'), n: 11, s: 6 }
    ];
    [
      ['Tipo', c.tipo_reclamo], ['Nombres y apellidos', c.nombre], ['Documento', c.documento],
      ['Domicilio', c.domicilio], ['Correo electronico', c.email], ['Telefono', c.telefono],
      ['Servicio relacionado', c.servicio], ['Monto reclamado', c.monto_reclamado],
      ['Detalle del reclamo o queja', c.detalle], ['Pedido del consumidor', c.pedido]
    ].forEach(function (f) {
      bloques.push({ t: f[0], n: 11, b: true, s: 10 });
      bloques.push({ t: f[1] || '-', n: 11 });
    });
    bloques.push({ t: 'Esta constancia acredita la recepcion del registro. Conserve el codigo para cualquier consulta.', n: 9, s: 18 });
    return pdfConstruir(bloques);
  }
  // ==PDF-FIN==

  function descargarConstancia(c, fecha) {
    var bytes = pdfConstancia(c, fecha);
    var blob = new Blob([bytes], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'Constancia-' + String(c.codigo || 'reclamo').replace(/[^A-Za-z0-9_-]/g, '') + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
  }

  // Constancia visible en pantalla + descarga automática del PDF (con botón de respaldo).
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
    aviso.textContent = 'Guarde este código. Se descargó una constancia en PDF; si no se descargó, use el botón.';
    caja.appendChild(aviso);

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn--secondary btn--sm';
    btn.textContent = 'Descargar constancia (PDF)';
    btn.addEventListener('click', function () { descargarConstancia(c, fecha); });
    caja.appendChild(btn);

    caja.hidden = false;
    caja.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try { descargarConstancia(c, fecha); }
    catch (e) { console.error('[reclamaciones-d1] No se pudo generar el PDF automáticamente.'); }
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
      mostrar('¡Su reclamo ha sido registrado correctamente! GRUPO JHT INGENIERÍA SAC revisará su solicitud y emitirá una respuesta dentro del plazo legal aplicable. Guarde su código de registro y descargue su constancia en PDF.');
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
