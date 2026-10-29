# Histórico: integración antigua de reclamaciones con Formspree

**Este documento describe una integración anterior y no corresponde al flujo actual. No reactives esta ruta para el Libro de Reclamaciones.**

El flujo actual previsto es: formulario público → Cloudflare Turnstile → Worker de JHT → D1. El archivo `assets/js/animations.js` bloquea el envío si no está configurada la integración segura; no debe utilizarse Formspree como alternativa automática para reclamaciones.

El endpoint histórico que se menciona más abajo se conserva únicamente como referencia de cambios anteriores. No lo uses para enviar datos personales ni para declarar operativo el Libro de Reclamaciones.

Antes de recibir reclamaciones reales, completa `PUBLICACION-GITHUB-CLOUDFLARE.md` y `CHECKLIST-PUBLICACION.md`.
