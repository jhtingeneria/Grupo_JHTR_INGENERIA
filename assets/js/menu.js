/**
 * ARCHIVO: assets/js/menu.js
 * QUÉ HACE: Lógica del header y la navegación responsive: abrir/cerrar el
 * menú móvil, cerrar al hacer click en un enlace o en el fondo oscuro,
 * marcar el enlace de la página actual como activo, y ocultar/mostrar el
 * header al hacer scroll (se oculta al bajar, reaparece al subir).
 *
 * DÓNDE SE COLOCA: se enlaza después de includes.js (necesita que el
 * header ya exista en el DOM) y antes de animations.js.
 *
 * QUÉ ARCHIVOS MODIFICA/AFECTA: opera sobre el markup de
 * components/header.html (clases .site-header, .nav-toggle, .main-nav,
 * .main-nav__backdrop) y usa las clases .is-open / .is-scrolled / .is-hidden
 * definidas en assets/css/styles.css.
 */
(function () {
  'use strict';

  function inicializarMenu() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.querySelector('.main-nav');
    var backdrop = document.querySelector('.main-nav__backdrop');

    if (!header || !toggle || !nav) {
      console.warn('[menu.js] No se encontró el header/nav; ¿se cargó components/header.html?');
      return;
    }

    function abrirMenu() {
      nav.classList.add('is-open');
      toggle.classList.add('is-active');
      if (backdrop) backdrop.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }

    function cerrarMenu() {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-active');
      if (backdrop) backdrop.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var abierto = nav.classList.contains('is-open');
      if (abierto) cerrarMenu(); else abrirMenu();
    });

    if (backdrop) backdrop.addEventListener('click', cerrarMenu);

    nav.querySelectorAll('a').forEach(function (enlace) {
      enlace.addEventListener('click', cerrarMenu);
    });

    // Resalta el enlace correspondiente a la página actual comparando el
    // pathname ya resuelto por el navegador (enlace.href, no el atributo
    // crudo): los enlaces del menú son rutas relativas normales, y el
    // navegador ya les aplicó el prefijo "../" que haga falta al
    // calcular enlace.href, así que comparar el atributo tal cual (antes
    // de resolver) daría un falso negativo en cuanto el sitio viva bajo
    // una subruta (p. ej. GitHub Pages "usuario.github.io/repo/").
    var rutaActual = window.location.pathname.replace(/index\.html$/, '');
    nav.querySelectorAll('a[href]').forEach(function (enlace) {
      var rutaEnlace = new URL(enlace.href).pathname.replace(/index\.html$/, '');
      if (rutaEnlace === rutaActual) {
        enlace.classList.add('is-active');
      }
    });

    // Ocultar header al bajar, mostrarlo al subir; siempre visible en el tope.
    var ultimoScrollY = window.scrollY;
    var umbral = 12;

    window.addEventListener('scroll', function () {
      var actual = window.scrollY;

      header.classList.toggle('is-scrolled', actual > umbral);

      if (nav.classList.contains('is-open')) {
        ultimoScrollY = actual;
        return; // no ocultar el header con el menú móvil abierto
      }

      if (actual > ultimoScrollY && actual > header.offsetHeight) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      ultimoScrollY = actual;
    }, { passive: true });
  }

  // El header se inyecta vía includes.js (fetch asíncrono), así que
  // esperamos su evento en vez de DOMContentLoaded directamente. Si
  // includes.js no está presente en la página (poco probable), se intenta
  // igual tras DOMContentLoaded como red de seguridad. El selector usa
  // "termina con" ($=) porque el atributo data-include puede traer 0 o
  // más "../" según la profundidad de la página (ej. "components/header.html"
  // en index.html, "../components/header.html" en el resto).
  if (document.querySelector('[data-include$="components/header.html"]')) {
    window.addEventListener('includes:loaded', inicializarMenu);
  } else {
    document.addEventListener('DOMContentLoaded', inicializarMenu);
  }
})();
