# Etapa 5: sección «Actualidad» (videos)

Estado: **hecha** (verificada: `bin/check` y su prueba e2e en verde) · 2026-11-08 · spec principal: [wordpress-fse.md](../wordpress-fse.md)

## Objetivo

Que los editores carguen videos (YouTube o MP4 subido) con título, descripción, miniatura y etiquetas, y que la galería de la portada (destacado + carrusel «Ver más») funcione igual que en Astro.

## Qué se construyó

| Pieza | Cómo |
|---|---|
| Datos | `inc/videos.php`, port a PHP de `adapters/youtube.js` y `mapVideo.ts`: `lapaz_youtube_id()` (mismos hosts y rutas), `lapaz_video_source()` (primero YouTube, luego MP4; si no hay ninguno, "no-disponible"), `lapaz_get_videos()` (fecha, de la más reciente a la más antigua; la miniatura del campo manda sobre la de YouTube; las etiquetas aceptan texto o `{name}`) y `lapaz_video_thumb()`. Se reutiliza en Productores PaisSana |
| Seed | Ya existía: `SEED_SOLO=videos` carga 9 videos de YouTube |
| Bloque `lapaz/actualidad` | Mismo marcado y clases de `ActualidadGaleria.astro`. Las cards guardan sus datos en `data-*`, y las etiquetas van como JSON escapado (`wp_json_encode` + `esc_attr`) |
| CSS | Con `bin/astro-css-to-block.mjs`. Los `::view-transition-*` quedan **sin prefijo**, porque cuelgan de la raíz del documento. El convertidor ahora los respeta |
| JS | Port del script con tres cambios. **Sin los estilos inline** que Astro necesitaba por el aislamiento de estilos: aquí el CSS del bloque ya alcanza a lo que crea el JS. **Corrige el bug de `?autoplay=1`**: `conAutoplay()` usa `&` si la URL ya trae `?`. Y `replaceChildren` en lugar de `innerHTML = ''`. Se mantienen View Transitions y la precarga de la miniatura |
| Rendimiento | Las miniaturas de YouTube van lazy, también la del destacado, que en Astro era `eager` aunque queda lejos del inicio de la página. El iframe solo se crea al pulsar play |
| Plantilla | `front-page.html`: Retratos → Lo que hacemos → Actualidad. **La portada ya tiene todas sus secciones** |

**Mantenimiento:** `inc/blocks.php` se dividió por sección (`portada.php`, `retratos.php`, `lo-que-hacemos.php`, `videos.php`). Ninguno pasa de 130 líneas.

## Hallazgo durante la construcción

- **`view.asset.php` con `filemtime()` emitía un warning** si `view.js` todavía no existía (por ejemplo, mientras se creaba el bloque). El warning rompía los headers de cualquier página del admin. Los 4 `view.asset.php` ahora revisan que el archivo exista.

## Smoke

9 cards en el carrusel. Destacado «Cacaoma | Manaure, Cesar» con `youtube-nocookie.com/embed/…`. Sin errores de PHP.

## Pendiente (Codex / AGY)

- **Codex:** `tests/e2e/actualidad.mjs`, que pruebe:
  - play: crea el iframe con `autoplay=1` y un solo `?`;
  - card: cambia el destacado (título, descripción, etiquetas y miniatura) y marca `li[data-activo]`;
  - las flechas mueven el carrusel;
  - con un solo video no hay carrusel.

  Además: la base visual contra Astro, la excepción `::view-transition-*` en la regla de prefijo de `bin/check`, y en el workflow el seed de videos y el paso de prueba.
- **AGY:** revisión de solo lectura del bloque frente a `ActualidadGaleria.astro`, `youtube.js` y `mapVideo.ts`.

## Revisión independiente (AGY, solo lectura)

| # | Hallazgo | Prioridad | Decisión |
|---|---|---|---|
| 1 | Si la miniatura del video se borraba de la biblioteca, no se usaba la de YouTube | Media | Corregido: una miniatura que ya no existe cuenta como vacía |
| 2 | `JSON.parse( data-tags ?? '[]' )` falla con un atributo vacío | Media | Corregido con `\|\| '[]'`. No pasa con el HTML actual, que siempre escribe un arreglo JSON, pero el JS ya no depende de eso |
| 3 | Sin videos, quedaba un botón «Reproducir » sin título | Baja | Corregido: sin destacado no hay botón |
| 4 | Una URL de YouTube pegada con espacios no se reconocía (`new URL()` de Astro sí los quitaba) | Baja | Corregido: `trim()` antes de `wp_parse_url()` |
| 5 | El scroll suave no respetaba `prefers-reduced-motion` | Baja | Corregido |
