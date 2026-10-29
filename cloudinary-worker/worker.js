// Cloudflare Worker para galería automática de JHT.
// Variables secretas (NO incluir en GitHub): CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.
// Variable pública: ALLOWED_ORIGIN = https://jhtingeneria.github.io
const CLOUD = 'o6pcvfxm';
const FOLDER = 'GRUPO_JHT_INGENIERIA/PROYECTOS';
const MAX_PAGES = 20; // 20 x 100 archivos por solicitud; ajustar si la galería crece.

export default {
  async fetch(request, env, ctx) {
    const origin = env.ALLOWED_ORIGIN || 'https://jhtingeneria.github.io';
    const cors = { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600' };
    const url = new URL(request.url);
    if (url.pathname !== '/proyectos') return new Response(JSON.stringify({error:'No encontrado'}), {status:404,headers:cors});
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
    if (request.method !== 'GET') return new Response(JSON.stringify({error:'Método no permitido'}), {status:405,headers:{...cors,Allow:'GET, OPTIONS'}});
    if (!env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) return new Response(JSON.stringify({error:'Servicio no configurado'}), {status:503,headers:cors});
    const cache = caches.default;
    // La galería tiene una sola respuesta; no generar entradas de caché por parámetros arbitrarios.
    const cacheKey = new Request(url.origin + '/proyectos', {method:'GET'});
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
    try {
      const auth = btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);
      const resources = [];
      let cursor;
      for (let page=0; page<MAX_PAGES; page++) {
        const body = {expression: `asset_folder="${FOLDER}" AND (resource_type=image OR resource_type=video)`, max_results:100, sort_by:[{created_at:'desc'}]};
        if (cursor) body.next_cursor = cursor;
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/resources/search`, {
          method:'POST', headers:{'Authorization':`Basic ${auth}`,'Content-Type':'application/json'}, body:JSON.stringify(body)
        });
        if (!response.ok) throw new Error(`Cloudinary HTTP ${response.status}`);
        const result = await response.json();
        resources.push(...(result.resources || []).filter(item => ['image','video'].includes(item.resource_type)).map(item => ({
          public_id:item.public_id, resource_type:item.resource_type, format:item.format,
          version:item.version, created_at:item.created_at, display_name:item.display_name,
          secure_url:item.secure_url
        })));
        cursor = result.next_cursor;
        if (!cursor) break;
      }
      const output = new Response(JSON.stringify({resources, truncated:Boolean(cursor)}), {status:200,headers:cors});
      ctx.waitUntil(cache.put(cacheKey, output.clone()));
      return output;
    } catch (e) {
      return new Response(JSON.stringify({error:'No fue posible consultar la galería'}), {status:502,headers:{...cors,'Cache-Control':'no-store'}});
    }
  }
};
