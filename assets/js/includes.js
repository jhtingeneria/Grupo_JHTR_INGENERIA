/**
 * ARCHIVO: assets/js/includes.js
 * QUÉ HACE: Carga los fragmentos reutilizables (components/header.html,
 * footer.html, whatsapp-button.html, cotizacion-boton.html) dentro de los
 * contenedores <div data-include="..."> que cada página declara, usando
 * fetch(). Así el header/footer/botones existen en un solo archivo fuente
 * y se reutilizan en todas las páginas del sitio (Fase 1: solo maquetado,
 * sin backend).
 *
 * DÓNDE SE COLOCA: se enlaza ANTES que menu.js y animations.js en cada
 * página, porque esos dos scripts operan sobre el header/nav/botón que
 * este archivo inyecta en el DOM.
 *
 * RUTAS RELATIVAS SIN "/" INICIAL (nada de rutas absolutas ni de <base>):
 * el proyecto debe poder publicarse tanto en la raíz de un dominio propio
 * (SiteGround) como dentro de una subcarpeta (GitHub Pages, ej.
 * "usuario.github.io/CLAUDE-CODE-JHT/"), sin editar nada al cambiar de
 * hosting. Por eso cada página escribe su propio data-include con la
 * profundidad correcta ya resuelta a mano (ej. index.html usa
 * data-include="components/header.html"; una página a un nivel de
 * profundidad, como nosotros/index.html o servicios/tanques.html, usa
 * data-include="../components/header.html").
 *
 * PERO los fragmentos (header.html, footer.html, cotizacion-boton.html)
 * son UN SOLO archivo compartido por páginas de distinta profundidad, así
 * que sus enlaces internos (a nosotros/, servicios/, assets/img/logo.svg,
 * etc.) están escritos en forma "canónica", como si el fragmento viviera
 * en la raíz del sitio (sin ningún "../"). Este script es quien corrige
 * eso: toma el prefijo "../" (uno, ninguno, o los que hagan falta) del
 * propio valor de data-include con el que se pidió el fragmento —ese
 * valor ya es correcto porque lo escribió la página que lo incluye— y se
 * lo aplica a las rutas internas del HTML recién descargado ANTES de
 * insertarlo en el DOM. Así un mismo components/header.html sirve para
 * cualquier profundidad sin mantener copias duplicadas ni depender de una
 * etiqueta <base> (que además no sirve para esto: <base href="/algo/">
 * no afecta a las rutas que ya empiezan con "/", y una ruta relativa fija
 * no puede ser correcta a la vez para profundidad 0 y profundidad 1).
 *
 * INCLUDES ANIDADOS: un fragmento puede a su vez contener otro
 * data-include (ej. components/header.html incluye adentro a
 * components/cotizacion-boton.html, en forma canónica también). Por eso
 * la corrección de prefijo se aplica también al propio atributo
 * data-include dentro del HTML descargado, y la carga se hace en rondas:
 * después de resolver una tanda de contenedores, se vuelve a buscar si
 * aparecieron contenedores nuevos (ya con el prefijo correcto grabado en
 * su atributo) dentro del HTML recién inyectado, hasta que no queden
 * pendientes.
 *
 * Dispara el evento "includes:loaded" en window cuando termina, para que
 * animations.js y menu.js puedan engancharse recién ahí (los elementos
 * inyectados no existen antes de ese evento).
 *
 * NOTA DE DESARROLLO: fetch() de archivos locales requiere servir el sitio
 * con un servidor HTTP (ej. `npx serve`, Live Server, etc.). Abrir los
 * archivos directamente con file:// bloquea la petición por CORS; por eso
 * se controla el error y se muestra un aviso claro en consola en vez de
 * dejar el header/footer vacíos sin explicación.
 */
(function () {
  'use strict';

  var CONTAINERS_SELECTOR = '[data-include]';

  // Nombres de carpeta de primer nivel del sitio: son los únicos prefijos
  // de ruta "canónica" que puede traer un fragmento compartido y que este
  // script sabe corregir. Si se agrega una sección nueva al sitio, hay
  // que sumarla aquí también.
  var CARPETAS_RAIZ = ['assets', 'components', 'nosotros', 'servicios', 'proyectos', 'clientes', 'valor', 'faqs', 'politicas', 'reclamaciones', 'contacto'];

  // Extrae, del propio valor de data-include, cuántos "../" tiene al
  // inicio. Ese número es la profundidad real desde la que se pidió el
  // fragmento (la página que lo incluye ya lo escribió correctamente).
  function calcularPrefijo(rutaFragmento) {
    var partes = rutaFragmento.split('/');
    var subidas = 0;
    for (var i = 0; i < partes.length && partes[i] === '..'; i++) {
      subidas++;
    }
    return '../'.repeat(subidas);
  }

  // Reescribe, dentro del HTML de un fragmento, los atributos
  // href/src/data-include que apuntan a una carpeta raíz del sitio (o el
  // enlace vacío href="" que representa "Inicio"), anteponiéndoles el
  // prefijo de profundidad calculado para ESTA inclusión en particular.
  function aplicarPrefijo(html, prefijo) {
    if (!prefijo) return html; // profundidad 0: el fragmento ya está correcto tal cual

    var patronCarpetas = new RegExp(
      '(href|src|data-include)="(' + CARPETAS_RAIZ.join('|') + ')/',
      'g'
    );
    html = html.replace(patronCarpetas, '$1="' + prefijo + '$2/');

    // Caso especial: el enlace de "Inicio" se escribe como href="" en los
    // fragmentos canónicos (equivale a "esta misma carpeta" en
    // profundidad 0); en profundidad >0 debe apuntar hacia arriba, que es
    // exactamente lo que ya representa el propio prefijo (ej. "../").
    html = html.replace(/href=""/g, 'href="' + prefijo + '"');

    return html;
  }

  function cargarFragmento(contenedor) {
    var ruta = contenedor.getAttribute('data-include');
    var prefijo = calcularPrefijo(ruta);

    return fetch(ruta)
      .then(function (respuesta) {
        if (!respuesta.ok) {
          throw new Error('HTTP ' + respuesta.status + ' al pedir ' + ruta);
        }
        return respuesta.text();
      })
      .then(function (html) {
        contenedor.innerHTML = aplicarPrefijo(html, prefijo);
        contenedor.setAttribute('data-include-status', 'ok');
      })
      .catch(function (error) {
        // Fallback controlado: no rompemos el layout, solo dejamos el
        // contenedor vacío marcado y avisamos en consola con el motivo
        // más probable (falta servir el sitio por HTTP).
        contenedor.setAttribute('data-include-status', 'error');
        console.error(
          '[includes.js] No se pudo cargar el componente "' + ruta + '". ' +
          'Verifica que el sitio se esté sirviendo por HTTP (no file://) ' +
          'y que la ruta exista. Detalle:', error
        );
      });
  }

  function contenedoresPendientes() {
    return Array.prototype.slice.call(
      document.querySelectorAll(CONTAINERS_SELECTOR + ':not([data-include-status])')
    );
  }

  function cargarRonda() {
    var pendientes = contenedoresPendientes();
    if (pendientes.length === 0) {
      return Promise.resolve();
    }
    return Promise.all(pendientes.map(cargarFragmento)).then(cargarRonda);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (contenedoresPendientes().length === 0) {
      return;
    }

    cargarRonda().then(function () {
      // Año de copyright del footer: un <script> inyectado vía innerHTML
      // no se ejecuta solo, así que este detalle se resuelve aquí en vez
      // de dentro de components/footer.html.
      document.querySelectorAll('[data-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
      });
      window.dispatchEvent(new CustomEvent('includes:loaded'));
    });
  });
})();
