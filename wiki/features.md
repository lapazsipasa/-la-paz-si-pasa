# Features

Capacidades entregadas. Lee esto antes de proponer una nueva.

Hay dos sitios con el mismo contenido: el **sitio FSE** (WordPress con tema de bloques, en producción desde 2026-11-09) y el **headless + Astro** (respaldo en el servidor viejo, sin tráfico). Las secciones de abajo describen el headless; la sección [FSE en producción](#vigentes-en-producción-sitio-fse-desde-2026-11-09) describe lo que sirve hoy.

## Respaldo: headless + Astro (servidor viejo)

### Home (`/`)

- Hero desde la página WordPress con slug `home`.
- Retratos de la Paz: slider desde el CPT `retrato`.
- Lo que hacemos: subcuentas (CPT `subcuenta`), línea de noticias (CPT `noticia`) y banner CTA con URL editable.
- Actualidad: galería de videos (CPT `video`), con YouTube o MP4 y tags.

## Proyectos destacados (`/proyectos-destacados`)

- Hero, intro y mapa de regiones con carrusel de PaisSana.
- Reproductor de audios "Corazón del campo" (CPT `audio_relato`).
- Ferias (CPT `feria`): acordeón, galería fotográfica con lightbox y carrusel de varios videos. El video se detiene al cerrar la pestaña o cambiar de slide.
- Productores PaisSana con videos.

## Transversal

- Menú primary desde WordPress (`headless/v1/site`), con fallback al menú de código.
- Footer con copy institucional (fijo en código).
- SEO: metadatos para compartir, favicon, `sitemap.xml` y `robots.txt`.
- Caché de página y revalidación con `POST /api/revalidate` (requiere secreto).
- Diagnóstico de fuente por bloque con `?debug-content=1`. TODO: decidir si se oculta en producción; hoy también responde allí.

## Vigentes en producción (sitio FSE, desde 2026-11-09)

Lo que el editor puede cambiar, sin desarrollo, en el sitio de bloques (`apps/wp-fse/`). Fuente: [despliegue-fse.md](despliegue-fse.md#producción-desde-2026-11-09).

- **Menú:** *Editor del sitio → Navegación*. Mismo menú que hoy, editable.
- **Hero:** foto de la portada, campo «Imagen del hero» al editar Inicio. Si se quita, vuelve la foto por defecto.
- **Retratos:** CPT `retrato` (foto, descripción, proyecto, lugar) y su orden.
- **Subcuentas:** CPT `subcuenta`. El orden lo da `menu_order`. Sin logo, no se muestra.
- **Noticias:** CPT `noticia` (título, enlace externo, fecha). Se muestran hasta 3 por año. Sin enlace, no se muestra.
- **Banner de prensa:** campo «URL del banner» en Inicio. Vacío, usa la sala de prensa de FCP.
- **Actualidad:** CPT `video` (YouTube o MP4, título, descripción, miniatura, etiquetas).
- **Proyectos destacados:** cifras del hero (3) y regiones del mapa (total y departamentos) en el grupo de datos de la página. Nombres, colores y mapas son diseño y no se editan.
- **Relatos de audio:** CPT `audio_relato`, por `orden`.
- **Ferias:** CPT `feria`, por `orden`, con galería y videos.
- **Productores:** videos con la etiqueta PaisSana.
- **Descripción para buscadores:** el extracto de la página. Sin extracto, usa el texto por defecto.

## En la rama feat/boletin-catalogo-fcp (no en producción)

Construido y con commits, sin push ni PR. Detalle en la [spec](specs/boletin-catalogo-fcp.md) y el [changelog](changelog.md).

- **Boletín mensual:** tipo `boletin`. Una edición nueva trae 8 secciones vacías (artículo, cifras, tarjetas o agenda). Se publica en `/boletin/`; las ediciones anteriores quedan en «Otras ediciones».
- **Historia del mes:** tipo `historia`, una por mes con ficha, video, crónica y galería. Cada una tiene su URL, `/historias/<slug>/`. `/productores/`, la tarjeta de Inicio y la de Proyectos destacados muestran la más reciente. `/historias/` (archivo) muestra la más reciente y, debajo, «Otras historias».
- **Catálogo de productores:** tipo `productor` con departamento, categoría, tiempo de operación, etnia y población. `/productores/` busca y filtra (con y sin JavaScript), con 316 productores de carga inicial.
- **Menú:** «Boletín» en el menú principal, orden nuevo y estado activo por sección. Los dos botones de programa quedan en gris.
- **Accesos:** tarjetas de último boletín e historia, y banner del catálogo, en Inicio y Proyectos destacados.
- **Guía de estilos:** `/guia-de-estilos/` solo existe en local. `lapaz-setup` la crea únicamente con `WP_ENVIRONMENT_TYPE=local`, y el bloque no pinta nada en producción. Comprobar en staging que da 404.
- **SEO editable por entrada:** The SEO Framework (`autodescription` 5.2.1, commit `2f13b6b`) añade la caja **Ajustes de SEO** (en español `es_CO`) en páginas, boletines e historias para cambiar título, descripción e imagen para compartir; el sitemap pasa a `/sitemap.xml` (con 301 desde `/wp-sitemap.xml`). Si se desactiva el plugin, el tema retoma su SEO de respaldo (`inc/seo.php`).
