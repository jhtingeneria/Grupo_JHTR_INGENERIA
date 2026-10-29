# Fase 9 — Limpieza de contenido público y corrección de galería

## Realizado
- Retiradas cifras no confirmadas de portada (años, toneladas, proyectos y clientes).
- Retirados datos de planta no verificados (superficie y equipamiento).
- Retirados avisos internos y mensajes de fase en Contacto.
- Retirados enlaces sociales sin URL real y brochure PDF provisional del pie de página.
- Redacción pública de Clientes y Proyectos sin notas de desarrollo ni marcas inventadas.
- Corregida la galería: Cloudinary `image/list/...json` devuelve `public_id`, `version`, `format` sin `secure_url`; ahora se genera URL de entrega pública válida.
- Se mantienen los seis videos de Servicios y los datos de contacto oficiales.

## Pendiente / importante
- La galería sigue usando etiqueta `jht_proyectos_publicados`; la automatización sin etiquetas por carpeta requiere backend externo con credenciales privadas y despliegue. No está implementada.
- El acceso a lista de videos puede devolver 404 si aún no hay videos etiquetados; no debe impedir mostrar fotos.
- Revisar en navegador real la galería y los formularios antes de publicar.
- El brochure provisional sigue archivado en assets/docs pero no se enlaza públicamente.
- Revisar el contenido de Políticas, FAQ y fichas técnicas con responsables antes de dar por oficiales afirmaciones técnicas o certificaciones.
