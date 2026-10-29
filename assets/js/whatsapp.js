/**
 * ARCHIVO: assets/js/whatsapp.js
 * QUÉ HACE: Lógica del widget flotante de WhatsApp (components/whatsapp-button.html):
 * abrir/cerrar el panel, elegir asesor, elegir servicio, y armar el enlace
 * wa.me con el mensaje "Buen dia, podría cotizarme servicios de [SERVICIO]".
 *
 * DÓNDE SE COLOCA: se enlaza después de includes.js (necesita que el
 * fragmento del widget ya exista en el DOM), en cualquier orden respecto
 * de menu.js y animations.js.
 */
(function () {
  'use strict';

  function inicializarWhatsapp() {
    var widget = document.querySelector('.whatsapp-widget');
    var toggle = document.getElementById('whatsapp-toggle');
    var panel = document.getElementById('whatsapp-panel');
    var closeBtn = document.getElementById('whatsapp-close');
    var backBtn = document.getElementById('whatsapp-back');
    var advisorButtons = document.querySelectorAll('.whatsapp-advisor');
    var serviceSelect = document.getElementById('whatsapp-service-select');
    var sendLink = document.getElementById('whatsapp-send');
    var stepAsesor = document.querySelector('[data-whatsapp-step="asesor"]');
    var stepServicio = document.querySelector('[data-whatsapp-step="servicio"]');

    if (!widget || !toggle || !panel) {
      console.warn('[whatsapp.js] No se encontró el widget de WhatsApp; ¿se cargó components/whatsapp-button.html?');
      return;
    }

    var asesorSeleccionado = null;

    function abrirPanel() {
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    }

    function cerrarPanel() {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }

    function mostrarPasoAsesor() {
      stepAsesor.hidden = false;
      stepServicio.hidden = true;
      asesorSeleccionado = null;
      serviceSelect.value = '';
      actualizarEnlace();
    }

    function mostrarPasoServicio() {
      stepAsesor.hidden = true;
      stepServicio.hidden = false;
    }

    function actualizarEnlace() {
      var servicio = serviceSelect.value;
      if (!asesorSeleccionado || !servicio) {
        sendLink.setAttribute('aria-disabled', 'true');
        sendLink.setAttribute('href', '#');
        return;
      }
      var mensaje = 'Buen dia, podría cotizarme servicios de ' + servicio;
      var url = 'https://wa.me/' + asesorSeleccionado + '?text=' + encodeURIComponent(mensaje);
      sendLink.setAttribute('aria-disabled', 'false');
      sendLink.setAttribute('href', url);
    }

    toggle.addEventListener('click', function () {
      if (panel.hidden) abrirPanel(); else cerrarPanel();
    });

    if (closeBtn) closeBtn.addEventListener('click', cerrarPanel);
    if (backBtn) backBtn.addEventListener('click', mostrarPasoAsesor);

    advisorButtons.forEach(function (boton) {
      boton.addEventListener('click', function () {
        asesorSeleccionado = boton.getAttribute('data-advisor-phone');
        mostrarPasoServicio();
        actualizarEnlace();
      });
    });

    serviceSelect.addEventListener('change', actualizarEnlace);

    sendLink.addEventListener('click', function (evento) {
      if (sendLink.getAttribute('aria-disabled') === 'true') {
        evento.preventDefault();
      }
    });

    document.addEventListener('click', function (evento) {
      if (!panel.hidden && !widget.contains(evento.target)) {
        cerrarPanel();
      }
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && !panel.hidden) {
        cerrarPanel();
        toggle.focus();
      }
    });
  }

  window.addEventListener('includes:loaded', inicializarWhatsapp);
})();
