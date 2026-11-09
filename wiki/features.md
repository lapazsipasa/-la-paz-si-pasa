# Features

Capacidades entregadas. Lee esto antes de proponer una nueva.

## Home (`/`)

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

## En la rama feat/wordpress-fse (no en producción)

Lo que el editor puede cambiar, sin desarrollo, en el sitio de bloques (`apps/wp-fse/`). Producción sigue siendo el headless de arriba hasta el cambio de dominio (etapa 8).

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
