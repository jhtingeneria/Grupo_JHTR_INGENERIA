/*
 * GRUPO JHT INGENIERÍA SAC
 * Worker de referencia para el Libro de Reclamaciones.
 * Requiere binding D1 DB y secreto TURNSTILE_SECRET_KEY.
 * Rutas: GET /salud, POST /reclamaciones, GET /constancias/CODIGO (solo pruebas).
 * El bypass con JHT_TEST_KEY solo se permite en desarrollo y si se habilita expresamente.
 */
const ORIGEN_PRODUCCION = "https://jhtingeneria.github.io";
const HOSTNAME_PRODUCCION = "jhtingeneria.github.io";

// ---- Correo (Resend). Un fallo de correo NUNCA debe impedir el registro. ----
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// D1 guarda datetime('now') en UTC ("YYYY-MM-DD HH:MM:SS"); se muestra en hora de Lima.
function fechaLima(fecha) {
  const d = new Date(String(fecha || "").replace(" ", "T") + "Z");
  return isNaN(d) ? String(fecha || "") : d.toLocaleString("es-PE", { timeZone: "America/Lima" });
}

async function enviarCorreo(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM || !to) return;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, html })
    });
    if (!r.ok) console.error("Correo no enviado, HTTP", r.status);
  } catch (e) {
    console.error("Error enviando correo:", e && e.message);
  }
}

function resumenHtml(c) {
  return `<h2>${esc(c.tipo_reclamo)} N° ${esc(c.codigo)}</h2>
<p><b>Fecha y hora (Lima):</b> ${esc(c.fecha_registro_lima)}</p>
<p><b>Nombre:</b> ${esc(c.nombre)}<br><b>Documento:</b> ${esc(c.documento)}<br><b>Domicilio:</b> ${esc(c.domicilio || "-")}<br><b>Correo:</b> ${esc(c.email)}<br><b>Teléfono:</b> ${esc(c.telefono || "-")}</p>
<p><b>Servicio:</b> ${esc(c.servicio || "-")}<br><b>Monto reclamado:</b> ${esc(c.monto_reclamado || "-")}</p>
<p><b>Detalle:</b><br>${esc(c.detalle).replace(/\n/g, "<br>")}</p>
<p><b>Pedido del consumidor:</b><br>${esc(c.pedido).replace(/\n/g, "<br>")}</p>
<p><b>Estado:</b> ${esc(c.estado)}</p>`;
}

export default {
  async fetch(request, env, ctx) {
    // Identificar la ruta y el origen de la solicitud.
    const url = new URL(request.url);
    const ruta = url.pathname.replace(/\/+$/, "") || "/";
    const origen = request.headers.get("Origin");
    const origenesPermitidos = (env.ALLOWED_ORIGINS || ORIGEN_PRODUCCION)
      .split(",")
      .map((valor) => valor.trim())
      .filter(Boolean);
    const origenPermitido = Boolean(origen) && origenesPermitidos.includes(origen);
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    };
    if (origenPermitido) {
      headers["Access-Control-Allow-Origin"] = origen;
      headers["Vary"] = "Origin";
    }
    const responder = (datos, estado = 200) => new Response(JSON.stringify(datos), { status: estado, headers });

    // Responder al preflight del formulario público.
    if (request.method === "OPTIONS") {
      if (!origenPermitido) return responder({ error: "Origen no permitido" }, 403);
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origen,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "600",
          "Vary": "Origin"
        }
      });
    }
    if (!env.DB) return responder({ error: "Base de datos no configurada" }, 503);

    // El estado comprueba una consulta real a D1, no solo la existencia del binding.
    if (request.method === "GET" && ruta === "/salud") {
      try {
        await env.DB.prepare("SELECT 1 AS ok").first();
        return responder({
          servicio: "JHT Libro de Reclamaciones",
          base_datos: "conectada",
          modo: env.ENVIRONMENT === "development" ? "desarrollo" : "produccion",
          turnstile: env.TURNSTILE_SECRET_KEY ? "configurado" : "no configurado"
        });
      } catch (error) {
        console.error("Error comprobando D1:", error);
        return responder({ error: "No se pudo comprobar la base de datos" }, 503);
      }
    }

    // Bypass de pruebas: desactivado en producción incluso si existe JHT_TEST_KEY.
    const clavePrueba = request.headers.get("X-JHT-Test-Key");
    const bypassPruebasHabilitado =
      env.ENVIRONMENT === "development" &&
      env.ENABLE_TEST_BYPASS === "true";
    const pruebaAutorizada =
      bypassPruebasHabilitado &&
      Boolean(env.JHT_TEST_KEY) &&
      Boolean(clavePrueba) &&
      clavePrueba === env.JHT_TEST_KEY;

    if (request.method === "POST" && ruta === "/reclamaciones") {
      let datos;
      try {
        // Rechazar cuerpos demasiado grandes o JSON inválido.
        const cuerpo = await request.text();
        if (new TextEncoder().encode(cuerpo).length > 20000) return responder({ error: "Solicitud demasiado grande" }, 413);
        datos = JSON.parse(cuerpo);
        if (!datos || typeof datos !== "object" || Array.isArray(datos)) return responder({ error: "Formato de datos inválido" }, 400);
      } catch {
        return responder({ error: "El cuerpo debe contener JSON válido" }, 400);
      }

      // Las solicitudes sin clave de pruebas deben superar Turnstile.
      if (!pruebaAutorizada) {
        if (!env.TURNSTILE_SECRET_KEY) return responder({ error: "Turnstile no configurado" }, 503);
        if (!origenPermitido) return responder({ error: "Origen no permitido" }, 403);
        const token = datos.turnstileToken;
        if (typeof token !== "string" || !token || token.length > 2048) return responder({ error: "Verificación Turnstile requerida" }, 400);
        try {
          // Validar el token mediante el servicio oficial de Cloudflare.
          const formulario = new URLSearchParams();
          formulario.set("secret", env.TURNSTILE_SECRET_KEY);
          formulario.set("response", token);
          const ip = request.headers.get("CF-Connecting-IP");
          if (ip) formulario.set("remoteip", ip);
          const verificacion = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formulario.toString()
          });
          if (!verificacion.ok) throw new Error("Servicio de verificación no disponible");
          const resultado = await verificacion.json();
          const hostnameEsperado = env.TURNSTILE_EXPECTED_HOSTNAME || HOSTNAME_PRODUCCION;
          if (env.ENVIRONMENT === "development") {
            // Solo datos de diagnóstico; nunca registrar la clave secreta ni el token.
            console.log("Resultado de Turnstile:", JSON.stringify({
              success: resultado.success,
              hostname: resultado.hostname,
              "error-codes": resultado["error-codes"]
            }));
          }
          if (resultado.success !== true || resultado.hostname !== hostnameEsperado) {
            return responder({ error: "Verificación Turnstile fallida" }, 403);
          }
        } catch (error) {
          console.error("Error de verificación Turnstile:", error);
          return responder({ error: "No se pudo verificar Turnstile" }, 503);
        }
      }

      // Validar y normalizar los datos de la reclamación.
      const obligatorios = ["tipo_reclamo", "nombre", "documento", "domicilio", "email", "detalle", "pedido"];
      for (const campo of obligatorios) {
        if (typeof datos[campo] !== "string" || !datos[campo].trim()) return responder({ error: "Campo obligatorio inválido: " + campo }, 400);
      }
      if (datos.tipo_reclamo !== "Reclamo" && datos.tipo_reclamo !== "Queja") return responder({ error: "El tipo debe ser Reclamo o Queja" }, 400);
      const limpio = {};
      for (const campo of obligatorios) limpio[campo] = datos[campo].trim();
      for (const campo of ["telefono", "servicio", "monto_reclamado"]) {
        if (datos[campo] !== undefined && datos[campo] !== null && typeof datos[campo] !== "string") return responder({ error: "Campo inválido: " + campo }, 400);
        limpio[campo] = typeof datos[campo] === "string" ? datos[campo].trim() : "";
      }
      const limites = { nombre: 150, documento: 30, domicilio: 250, email: 254, telefono: 30, servicio: 200, monto_reclamado: 40, detalle: 5000, pedido: 5000 };
      for (const [campo, limite] of Object.entries(limites)) {
        if (limpio[campo].length > limite) return responder({ error: "El campo " + campo + " supera " + limite + " caracteres" }, 400);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio.email)) return responder({ error: "Correo electrónico inválido" }, 400);

      try {
        // D1 asigna el ID y el trigger genera el código en la inserción.
        const registro = await env.DB.prepare(`
          INSERT INTO reclamaciones (tipo_reclamo, nombre, documento, domicilio, email, telefono, servicio, monto_reclamado, detalle, pedido, estado)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')
        `).bind(limpio.tipo_reclamo, limpio.nombre, limpio.documento, limpio.domicilio, limpio.email, limpio.telefono, limpio.servicio, limpio.monto_reclamado, limpio.detalle, limpio.pedido).run();
        const id = registro.meta?.last_row_id;
        if (!registro.success || !id) throw new Error("No se obtuvo el identificador del expediente");
        const constancia = await env.DB.prepare(`
          SELECT codigo, fecha_registro, tipo_reclamo, nombre, documento, domicilio, email, telefono, servicio, monto_reclamado, detalle, pedido, estado
          FROM reclamaciones WHERE id = ?
        `).bind(id).first();
        if (!constancia || !constancia.codigo) throw new Error("No se recuperó el código del expediente");
        constancia.fecha_registro_lima = fechaLima(constancia.fecha_registro);

        // El reclamo ya está guardado; los correos van en segundo plano.
        const cuerpo = resumenHtml(constancia);
        const tareas = [];
        if (env.MAIL_EMPRESA) {
          tareas.push(enviarCorreo(env, {
            to: env.MAIL_EMPRESA,
            subject: `Nueva reclamación ${constancia.codigo}`,
            html: `<p>Se registró una nueva reclamación.</p>${cuerpo}`
          }));
        }
        // Constancia al cliente: activar solo con dominio verificado (MAIL_CLIENTE_ENABLED="true").
        if (env.MAIL_CLIENTE_ENABLED === "true") {
          tareas.push(enviarCorreo(env, {
            to: constancia.email,
            subject: `Hemos recibido su ${constancia.tipo_reclamo.toLowerCase()} N° ${constancia.codigo}`,
            html: `<p>Hemos recibido su ${esc(constancia.tipo_reclamo.toLowerCase())} N° <b>${esc(constancia.codigo)}</b>. Conserve este mensaje como constancia.</p>${cuerpo}`
          }));
        }
        if (tareas.length) ctx.waitUntil(Promise.all(tareas));

        return responder({ mensaje: "Reclamación registrada correctamente", constancia }, 201);
      } catch (error) {
        console.error("Error al registrar reclamación:", error);
        return responder({ error: "No se pudo completar el registro. Verifique su estado antes de reintentar." }, 500);
      }
    }

    // Consulta privada de constancias; nunca exponer sin autorización.
    if (request.method === "GET" && ruta.startsWith("/constancias/")) {
      if (!pruebaAutorizada) return responder({ error: "Acceso no autorizado" }, 401);
      let codigo;
      try { codigo = decodeURIComponent(ruta.slice("/constancias/".length)); }
      catch { return responder({ error: "Código inválido" }, 400); }
      if (!/^JHT-\d{4}-\d{6,}$/.test(codigo)) return responder({ error: "Código inválido" }, 400);
      try {
        const expediente = await env.DB.prepare(`
          SELECT codigo, fecha_registro, tipo_reclamo, nombre, documento, domicilio, email, telefono, servicio, monto_reclamado, detalle, pedido, estado
          FROM reclamaciones WHERE codigo = ?
        `).bind(codigo).first();
        if (!expediente) return responder({ error: "Expediente no encontrado" }, 404);
        return responder({ empresa: "GRUPO JHT INGENIERÍA SAC", documento: "Constancia de recepción - Prueba", constancia: expediente });
      } catch (error) {
        console.error("Error al consultar constancia:", error);
        return responder({ error: "No se pudo consultar la constancia" }, 500);
      }
    }
    return responder({ error: "Ruta no encontrada" }, 404);
  }
};
