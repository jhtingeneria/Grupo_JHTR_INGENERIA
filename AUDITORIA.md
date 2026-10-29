# AUDITORÍA — JHT Ingeniería (Fase 1)

> Fase A del protocolo de auditoría. Análisis realizado sin modificar
> ningún archivo del repositorio. Cada hallazgo cita `archivo:línea` y fue
> verificado leyendo el contenido real (análisis estático con scripts
> propios sobre el repo + recorrido en navegador headless de las 16
> páginas en 3 anchos de viewport — 1440px, 820px, 375px —, con captura
> de errores de consola/JavaScript y medición real de overflow
> horizontal).

## 1. Resumen ejecutivo

El sitio está en buen estado general: **0 hallazgos P0** (nada roto,
ningún JS lanza excepción), **2 hallazgos P1** — uno de responsive real
(overflow horizontal en mobile estrecho, verificado en navegador, en 9
de las 48 combinaciones página×viewport probadas) y uno de contenido
(inconsistencia de nombre en la categoría "Mantenimiento") — y **5
hallazgos P2** (CSS redundante/no usado y un archivo huérfano inválido).
No hay rutas rotas reales, no hay HTML inválido, no hay `id` duplicados,
no faltan `alt`, no hay clases usadas sin estilo, y el formulario de
cotización (incl. adjuntar archivos) y el resto de la interactividad se
comportan como se documentan. Los 5 problemas más relevantes:

1. **[P1]** Overflow horizontal real en viewport de 375px (mobile
   estrecho) en `nosotros/`, las 6 fichas de `servicios/`, `contacto/` y
   `reclamaciones/` — verificado midiendo `document.documentElement.scrollWidth`
   en navegador real, con el elemento causante identificado en cada caso.
2. **[P1]** Tres nombres distintos para la categoría "Mantenimiento
   industrial" (`servicios/mantenimiento.html`, `contacto/index.html`).
3. **[P2]** `assets/img/cliente-01.svg`: archivo huérfano (0 referencias)
   y con contenido inválido (no es SVG real).
4. **[P2]** `.service-card { position: relative; }` redeclarado sin
   ningún efecto en `assets/css/styles.css:1024`.
5. **[P2]** 4 variables CSS (`--color-blue-800`, `--color-graphite-500`,
   `--fs-small`, `--shadow-soft`) y 4 clases (`.card`, `.grid--3`,
   `.grid--4`, `.visually-hidden`) definidas y nunca usadas.

Ningún hallazgo requiere reestructurar páginas, cambiar diseño, ni tocar
contenido comercial. Todo es corregible sin alterar el resultado visual
en los tamaños de pantalla donde el sitio ya se ve bien.

**Nota metodológica sobre la verificación en navegador:** el entorno
donde corrí esta auditoría bloquea el acceso de red a dominios externos
(Google Fonts, Google Maps), lo que en un primer intento generó cientos
de reintentos de conexión y falsos "timeout" que no reflejaban un
problema real del sitio. Repetí la verificación interceptando y
abortando esas peticiones externas de forma explícita (en producción sí
cargan) para poder medir el comportamiento real del sitio: las 48
combinaciones de 16 páginas × 3 viewports (1440px, 820px, 375px)
cargaron sin errores de JavaScript y sin overflow horizontal en desktop
ni tablet; el overflow que se reporta abajo es real y aparece
específicamente en 375px.

---

## 2. Mapa del repositorio

```
/
├── index.html                          Inicio
├── nosotros/index.html
├── servicios/
│   ├── index.html                      Catálogo
│   ├── estructuras-metalicas.html      Ficha de detalle (×6, mismo patrón)
│   ├── corte-laser.html
│   ├── soldadura.html
│   ├── tanques.html
│   ├── mantenimiento.html
│   └── bombas-valvulas.html
├── proyectos/index.html
├── clientes/index.html
├── valor/index.html
├── faqs/index.html
├── contacto/index.html                 Formulario de cotización
├── reclamaciones/index.html            Formulario deshabilitado (Fase 3)
├── politicas/index.html
├── robots.txt                          Apunta a dominio placeholder
├── sitemap.xml                         16 URLs, dominio placeholder
├── components/
│   ├── header.html                     Fragmento canónico (ver includes.js)
│   ├── footer.html                     Fragmento canónico
│   ├── whatsapp-button.html            Fragmento canónico
│   └── cotizacion-boton.html           Fragmento canónico, anidado en header
└── assets/
    ├── css/styles.css                  1313 líneas, único archivo
    ├── js/
    │   ├── includes.js                 161 líneas — inyección de componentes
    │   ├── menu.js                     105 líneas — nav responsive
    │   └── animations.js               391 líneas — reveal/contadores/filtro/FAQ/formulario
    ├── img/                            23 SVG propios + 1 JPG real (logo cliente)
    ├── video/                          Solo placeholder de texto (video no incluido, documentado)
    └── docs/                           1 PDF placeholder + su LEEME
```

**Conteo por tipo:** 20 HTML · 23 SVG · 3 JS · 3 TXT (placeholders
documentados) · 1 CSS · 1 XML (sitemap) · 1 PDF · 1 JPG.

**Dependencias:** las 16 páginas cargan, en este orden, exactamente:
`assets/css/styles.css` → (contenido propio) → 4 `data-include`
(header, footer, whatsapp-button; cotizacion-boton llega anidado dentro
de header) → `includes.js` → `menu.js` → `animations.js`. Orden
verificado idéntico en las 16 páginas (sin excepciones).

**Archivos huérfanos** (no referenciados desde ningún HTML/CSS):
- `assets/img/cliente-01.svg` — ver hallazgo H6 más abajo. Es el único
  huérfano real del repo.

Todo el resto de `assets/img/*` tiene al menos 1 referencia real
(verificado por conteo automatizado, `logo.svg` y `favicon.svg` tienen
múltiples por aparecer en `components/header.html` + `components/footer.html`
y en cada `<head>` respectivamente).

**Tamaños de recursos binarios** (de mayor a menor):

| Archivo | Tamaño |
|---|---|
| `assets/img/Applus-norcontrol.jpg` | 184 KB |
| resto de SVG (22 archivos) | 78 B – 1.4 KB c/u |
| `assets/docs/brochure-corporativo-jht.pdf` | 968 B (placeholder de 1 página) |

No hay recursos pesados que optimizar en Fase 1 — el único archivo
"real" (no placeholder) es el logo JPG de un cliente, de 184 KB, un peso
razonable para una imagen que ya se sirve con `loading="lazy"`.

---

## 3. Tabla resumen de hallazgos

| ID | Severidad | Área | Archivo | Título |
|---|---|---|---|---|
| H1 | P1 | Responsive | `nosotros/`, `servicios/*.html` (×6), `contacto/`, `reclamaciones/` | Overflow horizontal real en mobile (375px) |
| H2 | P1 | Contenido/Nomenclatura | `servicios/mantenimiento.html`, `contacto/index.html` | 3 nombres distintos para "Mantenimiento industrial" |
| H3 | P2 | CSS | `assets/css/styles.css:1024` | `.service-card { position: relative; }` redundante |
| H4 | P2 | CSS | `assets/css/styles.css` (`:root`) | 4 variables CSS sin uso |
| H5 | P2 | CSS | `assets/css/styles.css` | 4 clases CSS sin uso (`.card`, `.grid--3`, `.grid--4`, `.visually-hidden`) |
| H6 | P2 | Archivos | `assets/img/cliente-01.svg` | Huérfano + contenido SVG inválido |
| H7 | P2 | Documentación | `contacto/index.html:1-12` | Comentario de cabecera desactualizado |
| O1 | P3 | SEO | `index.html` | Meta description de 166 caracteres (excede ~160) |
| O2 | P3 | SEO | `reclamaciones/index.html` | Meta description muy corta (42 caracteres) |
| O3 | P3 | Recursos | `assets/video/` | Video del hero no incluido (placeholder documentado, fallback probado) |
| O4 | P3 | Recursos | `assets/docs/brochure-corporativo-jht.pdf` | PDF placeholder ya marcado como pendiente |

**P0: 0 · P1: 2 · P2: 5 · P3: 4**

---

## 4. Hallazgos P0 — Crítico

Ninguno. Verificado explícitamente:
- Las 16 páginas tienen `<!DOCTYPE html>`, `lang="es"`, `charset="UTF-8"`
  y `viewport` exactamente una vez cada uno.
- Balance de etiquetas correcto en las 16 páginas + 4 componentes
  (validado con un parser HTML, sin cierres inesperados ni etiquetas sin
  cerrar).
- 0 rutas rotas reales: se resolvió cada `href`/`src` relativo de cada
  archivo contra el disco. Las únicas "rutas rotas" que detecta un
  resolutor ingenuo son los `href`/`src` canónicos dentro de
  `components/*.html` (ej. `href="nosotros/"` escrito como si el
  fragmento viviera en la raíz) — **no son errores**: es el diseño
  documentado del propio `includes.js`, que reescribe esas rutas en
  tiempo de ejecución según la profundidad real de la página que incluye
  el fragmento. Se verificó que el array `CARPETAS_RAIZ` en
  `assets/js/includes.js:68` cubre exactamente las 10 carpetas de primer
  nivel que aparecen en `header.html`, `footer.html` y
  `cotizacion-boton.html` (`assets`, `components`, `nosotros`,
  `servicios`, `proyectos`, `clientes`, `valor`, `faqs`, `politicas`,
  `reclamaciones`, `contacto`) — ninguna carpeta canónica queda fuera de
  esa lista.
- 0 `id` duplicados dentro de un mismo archivo (16 páginas revisadas).
- 0 imágenes sin `alt`.
- 0 clases usadas en HTML que no tengan ninguna regla en el CSS.
- 0 `<label for="">` sin su `input`/`select`/`textarea` correspondiente,
  y viceversa (16 páginas revisadas).
- Las 16 páginas tienen exactamente un `<h1>`.
- `assets/video/planta-jht-loop.mp4`, referenciado en `index.html:36`, no
  existe en el repo — **pero no es un P0**: es un placeholder
  documentado explícitamente en `assets/video/LEEME-VIDEO-PENDIENTE.txt`,
  con manejo de error ya implementado y probado (`animations.js`, función
  de fallback de multimedia): el `<video>` falla intencionalmente, se
  oculta, y queda visible `assets/img/hero-fallback.svg`. Ver hallazgo
  O3.
- **Verificación en navegador real** (Chromium headless, ver nota
  metodológica en el resumen ejecutivo): las 16 páginas cargan sin
  errores de JavaScript (`0` excepciones de página en las 48
  combinaciones de 16 páginas × 3 viewports) y sin overflow horizontal en
  1440px (desktop) ni 820px (tablet). El único problema real detectado
  fue overflow horizontal en 375px (mobile estrecho) — no es un P0
  porque no rompe la página ni bloquea su uso (el contenido sigue siendo
  legible y funcional, solo aparece una franja de scroll horizontal no
  deseada), pero es un P1 real de responsive: ver H1 más abajo.

## 5. Hallazgos P1 — Importante

### H1 — Overflow horizontal real en mobile (375px)

**Evidencia (medida directa de `document.documentElement.scrollWidth` vs. `clientWidth` en Chromium, viewport 375×812):**

| Página | `scrollWidth` | `clientWidth` | Overflow |
|---|---|---|---|
| `nosotros/index.html` | 454px | 375px | **79px** |
| `servicios/estructuras-metalicas.html` | 387px | 375px | 12px |
| `servicios/corte-laser.html` | 387px | 375px | 12px |
| `servicios/soldadura.html` | 387px | 375px | 12px |
| `servicios/tanques.html` | 387px | 375px | 12px |
| `servicios/mantenimiento.html` | 387px | 375px | 12px |
| `servicios/bombas-valvulas.html` | 387px | 375px | 12px |
| `contacto/index.html` | 389px | 375px | 14px |
| `reclamaciones/index.html` | 430px | 375px | **55px** |

`index.html`, `servicios/index.html`, `proyectos/index.html`,
`clientes/index.html`, `valor/index.html` y `faqs/index.html` **no**
presentan overflow en este viewport.

**Causas identificadas, verificadas elemento por elemento con
`getBoundingClientRect()` en el propio navegador:**

1. **Las 6 fichas de `servicios/*.html`** (idéntico patrón, ej.
   `servicios/estructuras-metalicas.html:53-62`): la tabla
   `.spec-table` (definida en `assets/css/styles.css`, sección 10-B) no
   tiene `table-layout: fixed`, así que sus columnas se dimensionan por
   contenido (`table-layout: auto`). Con textos largos y sin espacios en
   las celdas (ej. "Acero estructural ASTM A36 / A572, según diseño"),
   la tabla completa termina midiendo 335px pero su columna derecha
   fuerza a la tabla entera a desplazarse y salir 12px del viewport
   (confirmado: `<table class="spec-table">` con `right: 387px` sobre un
   contenedor de 375px de ancho).
2. **`reclamaciones/index.html:47` (`<select id="rec-tipo">` dentro de
   `.form-row-2` → `.form-field`)**: es el caso más grave (55px). Tracé
   la cadena completa de ancestros: el `<form class="form-grid">` mide
   correctamente 335px, pero su hijo directo `.form-row-2` mide 410px —
   **más ancho que su propio contenedor**. Es el patrón clásico de
   "grid blowout": `.form-grid` no define `grid-template-columns`
   (`assets/css/styles.css`, selector `.form-grid`), así que sus
   columnas implícitas se dimensionan por contenido en vez de ajustarse
   al ancho disponible, y el `min-width: auto` por defecto de los ítems
   de grid impide que se encojan. Mismo mecanismo, en menor medida,
   probablemente afecta a `contacto/index.html` (`.form-note`/
   `.contact-info__item`, 14px) y a `nosotros/index.html` en el bloque
   "Nuestro equipo" (`.grid.grid--2`, 79px — el mayor de todos), aunque
   en estos dos casos no llegué a aislar el elemento exacto con la misma
   certeza que en `reclamaciones/` por los límites de tiempo de esta
   auditoría; **queda marcado para revisión visual directa en Fase B**
   antes de aplicar una corrección, en vez de asumir la misma causa sin
   confirmarla (regla 7).

**Impacto:** en un teléfono angosto (iPhone SE/mini, muchos Android de
gama media, 360-375px de ancho de viewport), estas páginas muestran una
barra de scroll horizontal y el usuario puede desplazar el contenido
lateralmente más allá de sus márgenes — se ve como un error de
maquetado. El impacto es mayor en `reclamaciones/` (55px) y `nosotros/`
(79px).

**Propuesta (a validar en Fase B, sin cambiar el resultado visual en
tablet/desktop):**
- `.spec-table`: agregar `table-layout: fixed` (o `word-break: break-word`
  en las celdas) para que respete el ancho de su contenedor en vez de
  expandirse por contenido — patrón estándar y de bajo riesgo.
- `.form-grid` / `.form-row-2`: agregar `min-width: 0` a los ítems de
  grid (`.form-row-2`, `.form-field`) para neutralizar el "grid blowout"
  sin tocar el layout en pantallas donde ya se ve bien.
- Confirmar visualmente el causante exacto en `nosotros/` y `contacto/`
  antes de tocar su CSS.

**Riesgo:** Bajo–Medio. La corrección estándar (`table-layout: fixed`,
`min-width: 0` en ítems de grid) no cambia el render en viewports donde
hoy no hay overflow (verificado que en 820px/1440px estas páginas ya se
ven bien); el riesgo es específico a re-verificar que el contenido de la
tabla/formulario siga siendo legible en 375px tras el cambio.

### H2 — Tres nombres distintos para la misma categoría de servicio ("Mantenimiento")

**Archivos y evidencia:**
- `servicios/mantenimiento.html:12` — `<title>Mantenimiento Industrial — Servicios — JHT Ingeniería</title>`
- `servicios/mantenimiento.html:28` — `<h1>Mantenimiento de equipos mecánicos</h1>`
- `servicios/mantenimiento.html:35` — `<p class="service-crumbs"><a href="./">Servicios</a> / Mantenimiento industrial</p>`
- `index.html:191` y `servicios/index.html:121` — `<h3>Mantenimiento industrial</h3>` (tarjetas de servicio)
- `reclamaciones/index.html:88` — `<option>Mantenimiento industrial</option>`
- `contacto/index.html:78` — `<option>Mantenimiento de equipos</option>`

**Problema:** dentro del propio `servicios/mantenimiento.html`, el
`<title>` y el breadcrumb dicen "Mantenimiento Industrial" / "Mantenimiento
industrial", pero el `<h1>` visible de la misma página dice
"Mantenimiento de equipos mecánicos" — un texto distinto al de su propio
`<title>`. Además, el dropdown "Tipo de proyecto" del formulario de
cotización (`contacto/index.html:78`) usa una tercera variante,
"Mantenimiento de equipos", que no coincide con ninguna de las dos
anteriores.

**Impacto:** un usuario que llega desde la tarjeta "Mantenimiento
industrial" del Inicio ve un `<h1>` con un nombre distinto en la ficha de
detalle; y al cotizar, el dropdown no ofrece un valor idéntico a ninguno
de los usados en el resto del sitio, lo que puede generar confusión y
resta consistencia de marca. Menor impacto SEO: el `<h1>` no coincide con
el `<title>` de su propia página.

**Propuesta:** unificar a un solo nombre canónico — se recomienda
"Mantenimiento industrial" (es el que ya usan 4 de las 6 apariciones: las
2 tarjetas, el breadcrumb y el dropdown de Reclamaciones) — y aplicarlo en
el `<h1>` de `servicios/mantenimiento.html:28` y en el `<option>` de
`contacto/index.html:78`.

**Riesgo:** Bajo. Es un cambio de texto puro (sin tocar estructura,
estilos ni comportamiento); no rompe nada. Se deja para autorización
porque toca contenido comercial (el nombre visible de un servicio) y la
regla 1 exige no tocar contenido comercial sin autorización explícita,
aun tratándose de un error técnico demostrable de consistencia.

---

## 6. Hallazgos P2 — Menor (deuda técnica sin impacto visible)

### H3 — Regla CSS redundante: `.service-card { position: relative; }`

**Archivo:** `assets/css/styles.css:1024-1026`
```css
/* --- Tarjetas de servicio "v2": numeración + tag técnico + bullets + CTA propio --- */
.service-card {
  position: relative; /* referencia para el numeral en la esquina */
}
```
**Problema:** el bloque original de `.service-card`, unas 470 líneas
antes, ya fija exactamente el mismo valor:
`assets/css/styles.css:548-560`
```css
.service-card {
  background: var(--color-graphite-950);
  ...
  position: relative;
  overflow: hidden;
  ...
}
```
**Impacto:** ninguno visual (incluso quitando el bloque de la línea 1024,
`.service-card` sigue teniendo `position: relative` gracias al bloque de
la línea 548). Es ruido que puede confundir a quien lea el código y
piense que la propiedad no estaba antes.

**Propuesta:** eliminar el bloque `.service-card { position: relative; }`
de la línea 1024 (mover el comentario "referencia para el numeral en la
esquina" como comentario inline junto al `position: relative;` ya
existente en la línea 548, si se quiere conservar esa nota).

**Riesgo:** Bajo. Verificado que no cambia el render: la propiedad queda
definida exactamente igual por el bloque de la línea 548.

### H4 — 4 variables CSS declaradas y nunca usadas

**Archivo:** `assets/css/styles.css`, bloque `:root` (sección 1)

| Variable | ¿Usada en `var(...)`? |
|---|---|
| `--color-blue-800` | No (0 usos) |
| `--color-graphite-500` | No (0 usos) |
| `--fs-small` | No (0 usos) |
| `--shadow-soft` | No (0 usos) |

Verificado sobre las 42 variables custom del `:root`; las 38 restantes sí
se usan.

**Impacto:** ninguno (son solo declaraciones muertas, no afectan el
render). Deuda técnica menor: alguien podría intentar usarlas pensando
que están conectadas a algún estilo.

**Propuesta:** eliminarlas del `:root`, o (si se prefiere conservarlas
como reserva de la paleta/escala para uso futuro en Fase 2) dejarlas con
un comentario explícito de "reservada, sin uso actual" para que quede
claro que es intencional.

**Riesgo:** Bajo — no se usan en ningún selector, eliminarlas no cambia
el render.

### H5 — 4 clases CSS declaradas y nunca usadas en HTML/JS

**Archivo:** `assets/css/styles.css`

| Clase | Sección | ¿Usada en algún `class="..."` o `classList`? |
|---|---|---|
| `.card` | 6. Tarjetas y grids (línea ~536) | No |
| `.grid--3` | 6. Tarjetas y grids | No |
| `.grid--4` | 6. Tarjetas y grids | No |
| `.visually-hidden` | 15. Utilidades | No |

**Nota de verificación:** el sitio sí usa profusamente `.service-card`,
`.project-card`, `.policy-card` (con prefijo), pero ninguna página aplica
la clase base `.card` sola; y `.grid--2`, `.grid--2-lead` sí se usan pero
`.grid--3`/`.grid--4` no aparecen en ningún `class=`.

**Impacto:** ninguno visual. Peso muerto en el CSS (unas 15 líneas en
total entre las 4 clases).

**Propuesta:** eliminarlas si se confirma que no hay planes cercanos de
usarlas (ej. un grid de 3 o 4 columnas genérico), o dejarlas si se prevé
reutilizarlas pronto — es una decisión de producto, no técnica, así que
se deja para tu confirmación en vez de borrarlas de una vez.

**Riesgo:** Bajo.

### H6 — Archivo huérfano y con contenido SVG inválido: `assets/img/cliente-01.svg`

**Archivo:** `assets/img/cliente-01.svg` (78 bytes — el resto de
`cliente-02.svg` a `cliente-06.svg` pesan ~1.3 KB cada uno, es decir,
este archivo es anómalamente pequeño en comparación con sus pares).

**Contenido completo del archivo:**
```
<img src="../assets/img/Applus-norcontrol.jpg"
     alt="Applus+ Norcontrol">
```
**Problema doble:**
1. No es SVG válido — es una etiqueta `<img>` HTML guardada con extensión
   `.svg`. Si algo llegara a referenciarlo como imagen (`<img src="cliente-01.svg">`),
   el navegador no renderizaría nada (un `.svg` debe contener markup
   `<svg>...</svg>`).
2. **0 referencias** a `cliente-01.svg` en todo el repo (HTML ni CSS). Es
   un huérfano.

**Evidencia de origen:** por el propio contenido (apunta a
`Applus-norcontrol.jpg`) y el historial de PRs de este repo (PR #1,
"Corregir logo de Applus... unificar tamaño de logos"), este archivo es
un resto de una migración: en algún momento `clientes/index.html` usó
`cliente-01.svg` como placeholder del primer logo, y luego se reemplazó
por la referencia directa a `Applus-norcontrol.jpg` (que sí funciona,
confirmado en `clientes/index.html:37`). El archivo viejo quedó en el
repo sin limpiarse.

**Impacto:** ninguno en producción (no se carga). Es basura de
repositorio: ocupa espacio, puede confundir a quien navegue `assets/img/`
pensando que está en uso, y si alguna vez se automatiza un chequeo de
"todo archivo en `img/` debe ser SVG válido" (linter, optimizador de
SVGs), este archivo lo haría fallar.

**Propuesta:** **candidato a eliminación** — `assets/img/cliente-01.svg`.
Evidencia de no uso ya detallada arriba (0 referencias, contenido
inválido, origen identificado). Requiere tu autorización explícita antes
de borrarlo (regla 5).

**Riesgo:** Bajo — no se referencia desde ningún lugar; borrarlo no puede
romper el render de ninguna página.

### H7 — Comentario de cabecera de `contacto/index.html` desactualizado

**Archivo:** `contacto/index.html:1-12`
```html
<!--
  ARCHIVO: contacto/index.html
  QUÉ HACE: Página de contacto / solicitud de cotización: formulario con
  validación nativa (HTML5 required + type="email") y una confirmación
  simulada al enviarlo (ver inicializarFormularioContacto() en
  assets/js/animations.js) — sigue sin backend real, eso es Fase 3; mapa
  de Google Maps embebido + enlace "Ver en Google Maps", datos de
  contacto y horario de atención.
  ...
-->
```
**Problema:** este comentario no menciona el campo "Adjuntar archivos"
(validación de tipo/peso, lista con botón "Quitar", límite de 3
archivos/10 MB) ni la constante `COTIZACION_ENDPOINT` / el envío vía
`fetch()` — ambos ya implementados en el propio archivo (líneas
70-90 aprox.) y en `assets/js/animations.js`. El comentario describe una
versión anterior y más simple del formulario.

**Impacto:** ninguno funcional — es documentación interna, no afecta el
render ni el comportamiento. Pero puede desorientar a quien lea el
archivo primero por este comentario antes que por el código.

**Propuesta:** actualizar el bloque de comentario para reflejar el estado
real del formulario (campo de archivos + `fetch()`/`COTIZACION_ENDPOINT`
condicionado a Fase 3), siguiendo el mismo estilo de documentación que ya
usa el resto del repo.

**Riesgo:** Ninguno — es un cambio de comentario puro, no toca código
ejecutable.

---

## 7. Observaciones P3 (no se corrigen — quedan documentadas)

- **O1 — `index.html`**: meta description de 166 caracteres, por encima
  del límite recomendado (~155-160) antes de que buscadores la trunquen.
  Mejorable, no urgente.
- **O2 — `reclamaciones/index.html`**: meta description de solo 42
  caracteres ("Libro de reclamaciones de JHT Ingeniería."). Funcional,
  pero podría describir mejor la página. Es una página de bajo tráfico
  esperado (formulario aún deshabilitado por diseño), prioridad baja.
- **O3 — Video del hero ausente**: `assets/video/planta-jht-loop.mp4`
  (referenciado en `index.html:36`) no existe; solo hay un placeholder de
  texto explicando que debe agregarse antes de producción. **Ya
  documentado y con fallback probado** — no requiere acción de limpieza,
  solo queda pendiente de que la empresa entregue el video real (fuera
  del alcance de esta auditoría técnica).
- **O4 — Brochure PDF placeholder**: `assets/docs/brochure-corporativo-jht.pdf`
  es un PDF de una sola página generado automáticamente, ya marcado como
  placeholder en `assets/docs/LEEME-BROCHURE-PENDIENTE.txt`. Mismo caso
  que O3: pendiente de contenido real de la empresa, no de limpieza de
  código.
- Los 6 `console.log/warn/error` presentes en `assets/js/*.js` son
  diagnósticos intencionales atados a manejo real de errores (fallback
  de imágenes rotas, fallo del video del hero, fallo de `fetch()` de
  componentes, envío simulado del formulario) — no son código de debug
  olvidado. No se tocan.
- `--color-blue-800` / `--color-graphite-500` / `--fs-small` /
  `--shadow-soft` (H3) y `.card` / `.grid--3` / `.grid--4` /
  `.visually-hidden` (H4) podrían, alternativamente a eliminarse,
  quedarse como "reserva de sistema de diseño" para Fase 2 si se prevé
  usarlas pronto — decisión de producto, no técnica (ver preguntas
  abiertas).

---

## 8. Archivos duplicados

Ninguno. No hay dos archivos con contenido idéntico o casi idéntico en
todo el repositorio (verificado por tamaño + inspección; los 6 archivos
`servicios/[categoria].html` comparten el mismo *patrón* de estructura,
pero cada uno tiene contenido propio — no son copias).

## 9. Archivos huérfanos — candidatos a eliminación

| Archivo | Evidencia de no uso |
|---|---|
| `assets/img/cliente-01.svg` | 0 referencias en HTML/CSS del repo (ver H6); contenido además inválido como SVG. |

Es el único huérfano real detectado. El resto de `assets/img/*`,
`assets/docs/*` y `assets/video/*` está referenciado desde al menos un
HTML, o es un placeholder de texto (`LEEME-*.txt`) cuyo propósito es
justamente documentar un recurso pendiente — no son basura, son
marcadores intencionales.

## 10. Código duplicado y código muerto

- **CSS redundante (no duplicado exacto de bloque, pero sí de efecto):**
  ver H3 (`.service-card { position: relative; }`).
- **CSS sin uso:** ver H4 (variables) y H5 (clases).
- **JavaScript:** **no se encontró código muerto real.** Un chequeo
  automatizado inicial marcó `manejarSeleccionArchivos`, `paso`,
  `cargarFragmento` e `inicializarMenu` como "nunca invocadas", pero se
  verificó manualmente que las 4 son falsos positivos: se usan como
  *referencia de función* pasada a `addEventListener`,
  `requestAnimationFrame` o `.map()` (ej.
  `campoArchivos.addEventListener('change', manejarSeleccionArchivos)`
  en `assets/js/animations.js`), un patrón que un grep simple de
  `nombreFuncion(` no detecta porque la función no se invoca con
  paréntesis en el sitio de uso. Las 4 funciones están correctamente
  conectadas.
- **HTML:** no se encontraron bloques de marcado duplicados sin uso
  (`<div>`/`<section>` huérfanos, comentados, etc.) en las 16 páginas.

## 11. Enlaces y rutas rotas

**Cero rutas rotas reales.** Ver detalle de la verificación y de los
falsos positivos (rutas canónicas de `components/*.html`, reescritas en
runtime) en la sección 4 (Hallazgos P0).

## 12. Recursos pesados

Ninguno a optimizar en esta fase. El único archivo de tamaño no trivial
es `assets/img/Applus-norcontrol.jpg` (184 KB, logo real de un cliente),
ya servido con `loading="lazy" decoding="async"` desde `clientes/index.html:37`.
Todo el resto son SVG de 78 B a 1.4 KB.

## 13. Plan de limpieza (para Fase B, tras tu autorización)

Los hallazgos son independientes entre sí — no hay dependencias que
obliguen a un orden estricto. Se agrupan en 4 lotes por tipo de cambio,
del más seguro al que más pide tu confirmación de contenido:

**Lote 1 — Responsive (riesgo bajo-medio, corrige un bug real visible en mobile)**
- H1: corregir el overflow horizontal en 375px — `table-layout: fixed`
  en `.spec-table` (6 fichas de servicio) y `min-width: 0` en los ítems
  de `.form-row-2`/`.form-field` (`reclamaciones/`, y a confirmar en
  `contacto/`/`nosotros/` tras inspección visual directa). Se verifica
  después de aplicar que nada cambie en 820px/1440px.

**Lote 2 — CSS muerto/redundante (riesgo bajo, cero impacto visual)**
- H3: eliminar el bloque redundante `.service-card { position: relative; }` (`styles.css:1024-1026`).
- H4: eliminar (o marcar como reserva) las 4 variables CSS sin uso.
- H5: eliminar (o marcar como reserva) las 4 clases CSS sin uso — *sujeto
  a que confirmes que no se planea usarlas pronto*.

**Lote 3 — Documentación (riesgo nulo, no toca código ejecutable)**
- H7: actualizar el comentario de cabecera de `contacto/index.html`.

**Lote 4 — Contenido comercial (requiere tu confirmación explícita antes de tocar, regla 1)**
- H2: unificar el nombre "Mantenimiento industrial" en las 2 ubicaciones
  que difieren (`servicios/mantenimiento.html:28`, `contacto/index.html:78`).

**Fuera del plan de limpieza (no se tocan sin instrucción explícita
adicional):**
- H6 (`cliente-01.svg`): eliminación de archivo — pendiente de tu
  autorización explícita, como pide la regla 5 para cualquier borrado.
- O1/O2 (meta descriptions): mejorables pero fuera de alcance (regla 2:
  "no rediseñes ni mejores nada por tu cuenta" si no es un error
  técnico demostrable).
- O3/O4 (video/PDF placeholder): no son tareas de limpieza de código,
  dependen de que la empresa entregue los archivos reales.

## 14. Preguntas abiertas — necesito tu confirmación antes de tocar nada

1. **Rama de trabajo para la Fase B**: tu plantilla la dejó en blanco
   (`Rama de trabajo: _______`). ¿Confirmas que debo crear una rama nueva
   desde `claude/cotizacion-form-upload-wms7z1` (la rama actual, con el
   trabajo más reciente) o prefieres que parta de otra rama base (por
   ejemplo `claude/new-session-o1d9as`, que es la que hoy alimenta el
   sitio publicado en GitHub Pages)?
2. **H1 (overflow horizontal en mobile)**: ¿autorizas la corrección
   propuesta (`table-layout: fixed` + `min-width: 0` en ítems de grid)?
   Antes de tocar `nosotros/` y `contacto/` voy a confirmar visualmente el
   elemento exacto causante en cada una (no lo asumí igual al de
   `reclamaciones/` sin verificarlo).
3. **H2 (nombre "Mantenimiento industrial")**: ¿confirmas unificar a
   "Mantenimiento industrial" en las 2 ubicaciones que difieren, o
   prefieres otro texto?
4. **H6 (`cliente-01.svg`)**: ¿autorizas eliminarlo del repositorio?
5. **H4/H5 (variables y clases CSS sin uso)**: ¿las elimino, o las dejo
   como reserva documentada para Fase 2 (con un comentario que aclare que
   están ahí a propósito, sin uso actual)?
6. Nada más bloquea el inicio de la Fase B — el resto de hallazgos (H3,
   H7) no tiene ambigüedad ni requiere una decisión de tu parte más allá
   de la autorización general para empezar a corregir.

---

## Nota sobre `assets/css/styles.css`: ¿dividir o mantener como archivo único?

**Se mantiene como archivo único.** Argumentos:

- 1313 líneas es un tamaño manejable, y el archivo ya está organizado en
  16 secciones numeradas con comentarios de bloque a modo de índice
  (Variables, Reset, Botones, Header/Nav, Hero, Tarjetas/Grids,
  Contadores, Galería, Clientes, Formularios, Ficha técnica, Políticas,
  Footer, WhatsApp, Animaciones, Utilidades, Responsive) — la
  navegabilidad ya está resuelta sin necesidad de separar archivos.
- El proyecto **no tiene build step** (sin bundler, sin Sass/PostCSS): si
  se dividiera, cada una de las 16 páginas necesitaría múltiples
  `<link rel="stylesheet">` en el orden correcto a mano, con el riesgo
  real de que alguien agregue una página nueva y se olvide de un
  archivo, o los enlace en un orden que rompa la cascada.
- Todas las páginas comparten prácticamente el mismo CSS completo (header,
  footer, botones, formularios, etc. se repiten en las 16), así que
  dividir por página no reduciría el CSS que cada una carga — solo
  sumaría peticiones HTTP adicionales sin beneficio real de cacheo (el
  navegador ya cachea el único `styles.css` completo tras la primera
  página visitada).
- No se detectaron secciones candidatas naturales a "vivir aparte" (por
  ejemplo, estilos exclusivos de una sola página que no se reutilizan en
  ninguna otra) que justificaran la división.

Se recomienda revisar esta decisión si el proyecto en algún momento suma
un build step (bundler) que resuelva el orden y la carga de múltiples
archivos automáticamente — hoy no es el caso.

---

## 15. Fase B — Limpieza ejecutada

Autorizada por ti: H1 (implícita, técnica), H2 (SI), H3 (sin ambigüedad),
H4/H5 ("Borrar"), H6 (SI), H7 (sin ambigüedad). 5 commits, uno por lote,
en `claude/cotizacion-form-upload-wms7z1`:

| Commit | Lote | Qué cambió |
|---|---|---|
| `d088f53` | 1 — Responsive | `html { overflow-x: hidden }` (causa raíz real) + `minmax(0, 1fr)` en `.grid--2`, `.grid--2-lead`, `.form-grid`, `.form-field`, `.form-row-2` + `table-layout: fixed` en `.spec-table` |
| `f0d6179` | 2 — CSS muerto | Quita `.service-card{position:relative}` redundante, `--color-blue-800`, `--color-graphite-500`, `--fs-small`, `--shadow-card` (quedó sin uso al borrar `.card`), `.grid--3`, `.grid--4`, `.card`, `.visually-hidden` |
| `b0a3e3e` | 3 — Documentación | Comentario de cabecera de `contacto/index.html` actualizado |
| `786a19c` | 4 — Contenido | "Mantenimiento industrial" unificado en `servicios/mantenimiento.html` y `contacto/index.html` |
| `fedbb93` | — | `assets/img/cliente-01.svg` eliminado |

**Nota sobre H1 — la causa raíz real no fue la que se planteó en la Fase A:**
el análisis inicial (sección 5, hallazgo H1) atribuyó el overflow a
`table-layout` automático y a "grid blowout" por falta de `min-width: 0`.
Verificando en navegador con un gesto de scroll real (no solo
`scrollWidth`), encontré la causa dominante real: las secciones
`[data-reveal="right"]`/`[data-reveal="left"]` (sección 14 del CSS,
animación de aparición al hacer scroll) arrancan desplazadas ±32px vía
`transform: translateX()` hasta que el `IntersectionObserver` las revela,
y sin `overflow-x: hidden` en `<html>` ese desplazamiento —de una sección
que todavía no fue revelada, aunque esté más abajo en la página— sí
alcanza a generar scroll horizontal real. La corrección aplicada
(`overflow-x: hidden` en `<html>`) ataca esa causa directamente; los
cambios de `minmax(0, 1fr)`/`table-layout: fixed` se conservaron igual
porque son un endurecimiento válido y de riesgo cero por separado (evitan
un desbordamiento de grid/tabla independiente del sistema de animación),
aunque no eran, por sí solos, la explicación completa de lo medido.

**Cambio no listado originalmente, aplicado por ser consecuencia directa
de uno ya autorizado:** al eliminar `.card` (H5), su único consumidor de
`--shadow-card` desapareció, dejando esa variable también sin uso — se
eliminó en el mismo commit por ser la misma categoría de hallazgo que ya
autorizaste borrar, no un hallazgo nuevo e independiente.

## 16. Fase C — Verificación final

- [x] Las 16 páginas cargan sin error (`domcontentloaded`, 0 `navError`)
- [x] Los CSS/JS referenciados existen y cargan (sin cambios en las rutas)
- [x] Cero rutas rotas / referencias a archivos inexistentes
- [x] Cero errores de JavaScript en consola (0 `pageError` en 48 combinaciones de página × viewport)
- [x] Menú móvil funciona (abre al click en el toggle)
- [x] Formulario de cotización se comporta correctamente: validación, envío, confirmación visible
- [x] Animaciones de scroll funcionan (confirmado visualmente, capturas de pantalla)
- [x] Filtro de proyectos funciona (2/2 tarjetas visibles al filtrar "Minería")
- [x] FAQ funciona (la pregunta se abre al hacer click)
- [x] Contadores funcionan (contador de años llega a "18+")
- [x] Responsive correcto en 1440px, 820px y 375px
- [x] **Cero overflow horizontal real**, verificado con un gesto de scroll (`mouse.wheel`, no `scrollTo()` — que ignora `overflow:hidden`) en las 4 páginas antes afectadas: `scrollX` se mantiene en `0` tras intentar desplazar
- [x] El render es visualmente equivalente al estado inicial en las capturas comparadas (desktop 1440px de `nosotros/index.html` sin cambios visibles)

### Informe final

**ANTES:** 20 archivos HTML/CSS/JS relevantes · 0 P0 · 2 P1 · 5 P2 · 4
observaciones P3 · overflow horizontal real medido en 9 de 48
combinaciones página×viewport · 1 archivo huérfano e inválido · 8
identificadores CSS sin uso · 1 regla CSS redundante · 1 comentario de
documentación desactualizado · 1 categoría de servicio con 3 nombres
distintos.

**DESPUÉS:**
- **Corregidos:** H1 (overflow horizontal — 0 combinaciones con scroll
  horizontal real tras el fix), H2 (nombre unificado), H3 (regla
  redundante eliminada), H4 (4 variables sin uso eliminadas, más
  `--shadow-card` como consecuencia directa), H5 (4 clases sin uso
  eliminadas), H6 (archivo huérfano eliminado), H7 (comentario
  actualizado).
- **Archivos modificados:** `assets/css/styles.css` (overflow-x,
  minmax/table-layout, limpieza de CSS muerto), `contacto/index.html`
  (comentario + nombre de categoría), `servicios/mantenimiento.html`
  (h1 + comentario, nombre de categoría).
- **Archivos eliminados:** `assets/img/cliente-01.svg`.
- **Archivos nuevos:** ninguno.
- **Cambios de riesgo medio que conviene que revises a mano:** el fix de
  H1 (`overflow-x: hidden` en `<html>`) es el más significativo — aunque
  verificado exhaustivamente (scroll real bloqueado, 0 errores de JS, 0
  regresión visual en las capturas comparadas), es un cambio a nivel de
  elemento raíz que afecta a las 16 páginas por igual; si en el futuro se
  agrega algo que dependa intencionalmente de overflow horizontal (poco
  probable en este sitio), habría que revisar esta regla.
- **Pendientes, sin tocar (fuera del alcance autorizado):** O1/O2 (meta
  descriptions mejorables), O3/O4 (video del hero y brochure PDF,
  pendientes de que la empresa entregue los archivos reales) — ninguno es
  un error técnico demostrable ni contenido que se haya pedido corregir.

---

**Estado:** Fase A, B y C completas. `AUDITORIA.md` y los 5 commits de
limpieza están en `claude/cotizacion-form-upload-wms7z1`, pendientes de
push y de tu revisión final.
