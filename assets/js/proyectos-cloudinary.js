/* Galería JHT: endpoint seguro por carpeta cuando se configure; lista pública etiquetada como respaldo. Nunca poner secretos aquí. */
(() => {
  'use strict';
  const CLOUD = 'o6pcvfxm';
  const TAG = 'jht_proyectos_publicados';
  const PAGE_SIZE = 12;
  // Endpoint público del Worker que consulta la carpeta PROYECTOS de Cloudinary.
  // Las credenciales privadas permanecen exclusivamente en los Secrets de Cloudflare.
  const GALLERY_API = 'https://super-glitter-48af.jhtingeneria.workers.dev/proyectos';
  const grid = document.getElementById('jht-gallery-grid');
  if (!grid) return;
  const status = document.getElementById('jht-gallery-status');
  const count = document.getElementById('jht-gallery-count');
  const more = document.getElementById('jht-gallery-more');
  const dialog = document.getElementById('jht-gallery-dialog');
  const viewer = dialog.querySelector('.jht-gallery-viewer');
  const filters = [...document.querySelectorAll('.jht-gallery-filter')];
  let items = [], filter = 'all', shown = PAGE_SIZE;
  let refreshInProgress = false;
  let pendingRender = false;
  const REFRESH_INTERVAL_MS = 90000; // Consulta periódica mientras la pestaña esté visible.
  const safeUrl = (url) => {
    try { const u = new URL(url); return u.protocol === 'https:' && u.hostname === 'res.cloudinary.com' && u.pathname.startsWith('/' + CLOUD + '/') ? u.href : ''; }
    catch { return ''; }
  };
  const resourceUrl = (item) => {
    if (item.secure_url) return safeUrl(item.secure_url);
    if (!item.public_id || !['image', 'video'].includes(item.resource_type)) return '';
    const id = item.public_id.split('/').map(encodeURIComponent).join('/');
    const version = Number.isSafeInteger(Number(item.version)) && Number(item.version) > 0 ? `v${Number(item.version)}/` : '';
    const format = /^[a-z0-9]{2,5}$/i.test(item.format || '') ? `.${item.format}` : '';
    return safeUrl(`https://res.cloudinary.com/${CLOUD}/${item.resource_type}/upload/${version}${id}${format}`);
  };
  const titleFor = item => (item.display_name || item.public_id?.split('/').pop() || 'Proyecto JHT').replace(/[_-]+/g, ' ').trim();
  const imageVariant = (url) => url.replace('/image/upload/', '/image/upload/f_auto,q_auto,w_800/');
  const videoPoster = (url) => url.replace('/video/upload/', '/video/upload/so_1,f_jpg,q_auto,w_800/').replace(/\.[^.?#]+(?:\?.*)?$/, '.jpg');
  function filtered() { return items.filter(item => filter === 'all' || item.resource_type === filter); }
  function openItem(item) {
    viewer.replaceChildren();
    const url = resourceUrl(item);
    if (!url) return;
    const media = document.createElement(item.resource_type === 'video' ? 'video' : 'img');
    if (item.resource_type === 'video') { media.controls = true; media.autoplay = true; media.playsInline = true; media.preload = 'metadata'; }
    else media.alt = titleFor(item);
    media.src = url;
    viewer.append(media);
    const title = document.createElement('p'); title.textContent = titleFor(item); viewer.append(title);
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  }
  function card(item) {
    const el = document.createElement('button'); el.type = 'button'; el.className = 'jht-gallery-card';
    const media = document.createElement('img');
    media.loading = 'lazy'; media.decoding = 'async'; media.alt = titleFor(item);
    const url = resourceUrl(item);
    if (!url) return el;
    media.src = item.resource_type === 'video' ? videoPoster(url) : imageVariant(url);
    const body = document.createElement('span'); body.className = 'jht-gallery-card-body';
    const kind = document.createElement('small'); kind.textContent = item.resource_type === 'video' ? '▶ VIDEO' : 'FOTOGRAFÍA';
    const name = document.createElement('strong'); name.textContent = titleFor(item);
    body.append(kind, name); el.append(media, body); el.addEventListener('click', () => openItem(item));
    return el;
  }
  function render() {
    const subset = filtered(); grid.replaceChildren(...subset.slice(0, shown).map(card));
    count.textContent = `${subset.length} archivo${subset.length === 1 ? '' : 's'}`;
    more.hidden = subset.length <= shown;
    status.textContent = subset.length ? '' : 'Todavía no hay proyectos publicados en esta categoría.';
  }
  filters.forEach(btn => btn.addEventListener('click', () => {
    filter = btn.dataset.filter; shown = PAGE_SIZE;
    filters.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); }); render();
  }));
  more.addEventListener('click', () => { shown += PAGE_SIZE; render(); });
  dialog.querySelector('.jht-gallery-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    const v = viewer.querySelector('video');
    if (v) v.pause();
    if (pendingRender) { pendingRender = false; render(); }
  });
  async function getList(type) {
    const url = `https://res.cloudinary.com/${CLOUD}/${type}/list/${TAG}.json`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${type}: HTTP ${response.status}`);
    const data = await response.json();
    return (Array.isArray(data.resources) ? data.resources : []).map(item => ({ ...item, resource_type: type }));
  }
  async function getGallery() {
    if (GALLERY_API) {
      try {
        const response = await fetch(GALLERY_API, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Galería: HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data.resources)) throw new Error('Formato de galería inválido');
        return data.resources;
      } catch (error) {
        console.warn('[JHT Proyectos] Servicio por carpeta no disponible; consultando listas públicas.', error);
      }
    }
    const results = await Promise.allSettled([getList('image'), getList('video')]);
    if (results.every(r => r.status === 'rejected')) throw new Error('No hay listas públicas disponibles');
    return results.filter(r => r.status === 'fulfilled').flatMap(r => r.value);
  }
  async function refreshGallery() {
    if (refreshInProgress || document.hidden) return;
    refreshInProgress = true;
    try {
      const resources = await getGallery();
      const seen = new Set();
      const next = resources.filter(r => {
        if (!r || !r.public_id || !['image','video'].includes(r.resource_type) || !resourceUrl(r)) return false;
        const key = `${r.resource_type}:${r.public_id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).sort((a,b) => Date.parse(b.created_at || 0) - Date.parse(a.created_at || 0));
      // No reemplazar la galería mientras el visitante está viendo una imagen o video.
      const changed = JSON.stringify(next.map(r => [r.resource_type,r.public_id,r.version])) !==
        JSON.stringify(items.map(r => [r.resource_type,r.public_id,r.version]));
      if (changed) {
        items = next;
        if (dialog.open) pendingRender = true;
        else render();
      }
      if (!items.length) render();
    } catch (error) {
      // Una caída temporal de Cloudinary no borra proyectos que ya estaban cargados.
      if (!items.length) {
        status.textContent = 'No fue posible cargar los proyectos. Inténtalo nuevamente más tarde.';
        count.textContent = '';
      }
      console.warn('[JHT Proyectos] No se pudo actualizar la galería:', error);
    } finally {
      refreshInProgress = false;
    }
  }
  refreshGallery();
  setInterval(refreshGallery, REFRESH_INTERVAL_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshGallery(); });
  // La actualización pendiente se procesa al cerrar el visor, sin interrumpir al visitante.
})();
