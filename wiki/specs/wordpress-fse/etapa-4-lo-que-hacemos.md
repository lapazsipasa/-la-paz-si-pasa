# Etapa 4: sección «Lo que hacemos»

Estado: **hecha** (verificada: `bin/check` y su prueba e2e en verde) · aprobada el 2026-11-08 · spec principal: [wordpress-fse.md](../wordpress-fse.md)

## Objetivo

Que los editores carguen y ordenen las **subcuentas** (logos) y las **noticias** (título, enlace externo, fecha) desde WordPress, y cambien la URL del banner de prensa, con la sección viéndose y funcionando igual que en Astro.

## Qué se construye

### 1. Contenido

| Pieza | Cómo |
|---|---|
| CPT `subcuenta` y `noticia` | Ya existen en `scf-json/` y van horneados en la imagen desde la etapa 2. No se tocan |
| Seed de subcuentas | Se agrega la sección `subcuentas` a `seed/contenido.json`, con las 23 de `adapters/mocks.ts` (nombre, logo y orden). Los 23 PNG de `src/assets/subcuentas/` se copian a `seed/media/subcuentas/`. `seed.php` las crea con `menu_order`, porque el adapter las ordena así |
| Noticias | **No hay contenido real**: los mocks apuntan a `example.com` y algunos títulos son lorem ipsum. El bloque queda listo y se prueba con noticias de ejemplo cargadas por wp-cli en local, **no en el seed**, para que no lleguen a producción. TODO: que el cliente entregue las noticias reales |
| URL del banner | Campo `noticias_cta_url` de Inicio, el mismo grupo que la imagen del hero. Si está vacío, usa `https://fcp.gov.co/sala-de-prensa/`, como hoy |

### 2. Bloque `lapaz/lo-que-hacemos`

Agrupa los 5 componentes de Astro, igual que el `LoQueHacemos.astro` padre:

| Componente | Cómo se pasa |
|---|---|
| `LoQueHacemos` (títulos y grilla) | Marcado y copy fijos traducibles |
| `LoQueHacemosTextoDestacado` | Copy fijo (sus props por defecto), traducible |
| `LoQueHacemosSubcuentas` | `WP_Query` de `subcuenta` por `menu_order`. Logos con `wp_get_attachment_image` (srcset y lazy). JS de scroll (±180 px) copiado a `view.js` |
| `LoQueHacemosBannerCta` | `<picture>` con 3 anchos (1440/960/640) generados una vez en WebP desde `hacemos/noticias-banner@3x.png`, con el mismo encoder y la misma calidad que Astro (aprendizaje 5 de la etapa 3) |
| `LoQueHacemosNoticiasTimeline` | Lógica de servidor pasada a PHP en `inc/blocks.php`: agrupar por año, máximo 3 por año, años de mayor a menor. `fecha` sale del campo SCF o de la fecha de la entrada, como `toIsoDate`. JS de las flechas ▲▼ copiado a `view.js` |

- **CSS:** con `bin/astro-css-to-block.mjs` sobre los 5 componentes. Las clases que chocaban (`.timeline`, también usada por AudioPlayer) quedan aisladas bajo `.wp-block-lapaz-lo-que-hacemos`.
- **JS:** un solo `view.js` para el bloque, con los dos scripts. Cada uno se limita a su propio contenedor y no usa ids.
- **Plantilla:** `front-page.html` agrega el bloque después de Retratos, dentro de `main.lapaz-home`.

## Reparto

| Quién | Qué |
|---|---|
| **Claude** | seed de subcuentas, bloque completo (PHP, CSS y JS), helpers, assets del banner, plantilla y smoke de carga |
| **Codex** | `tests/e2e/lo-que-hacemos.mjs` (scroll de subcuentas, grupos por año con 3 como máximo y en orden, flechas del timeline, enlace del banner, enlaces de noticias externos), bases visuales con Astro leyendo este WordPress, `bin/check`, workflow (seed de subcuentas y noticias de ejemplo en CI) |
| **AGY** | revisión independiente del bloque frente a los 5 componentes de Astro, solo lectura |

## Fuera de alcance

- Contenido real de noticias (lo entrega el cliente).
- Enlaces en las subcuentas: la cotización dice "sin links".
- Actualidad (videos): va en la etapa siguiente.

## Definición de hecho

1. La sección se ve igual que en Astro con los mismos datos (menos de 1 % de diferencia, según Codex).
2. Un editor agrega, reordena (`menu_order`) o quita una subcuenta, y agrega una noticia o cambia su fecha o la URL del banner, sin desplegar.
3. Las pruebas de Codex y `bin/check` están en verde.
4. El seed de subcuentas corre en local y en CI, y es idempotente.
5. Esta página documenta el resultado y los aprendizajes.

Estimación: 1 día de desarrollo.

## Construcción (2026-11-08)

- **Seed:** sección `subcuentas` en `contenido.json` (23, sacadas de `mocks.ts`) con sus logos en `seed/media/subcuentas/`. `seed.php` ahora devuelve el ID en `upsert()` y fija `menu_order`. Se carga con `SEED_SOLO=subcuentas`.
- **Bloque `lapaz/lo-que-hacemos`:**
  - CSS de los 5 componentes con `bin/astro-css-to-block.mjs`;
  - `view.js` con los dos scripts, cada uno limitado a su contenedor;
  - banner en WebP de 1440, 960 y 640 px (103, 51 y 25 KB) con la calidad de Astro.
- **Datos (`inc/blocks.php`):**
  - `lapaz_get_subcuentas()` por `menu_order`, omite las que no tienen logo;
  - `lapaz_get_noticias()` ordena de la más reciente a la más antigua y omite las que no tienen URL;
  - `lapaz_fecha_iso()` acepta `Ymd` y `Y-m-d`;
  - `lapaz_noticias_por_anio()` deja 3 por año como máximo, con los años en orden descendente;
  - `lapaz_noticias_cta_url()` usa la sala de prensa por defecto.
- **Smoke:** las 23 subcuentas salen en orden. Con 6 noticias de ejemplo (4 de 2026 y 2 de 2025), se muestran 3 + 2. Sin errores de PHP.
- **Noticias de ejemplo:** solo en local y en CI, creadas con wp-cli. No van en el seed.

**Nota:** `inc/blocks.php` tiene 277 líneas y el límite es 300. En la próxima etapa se divide por sección (`inc/portada.php`, `inc/lo-que-hacemos.php`…), siguiendo la regla de tamaño.

## Revisión independiente (AGY, solo lectura)

| # | Hallazgo | Prioridad | Decisión |
|---|---|---|---|
| 1 | El scroll del timeline saltaba al fondo en el primer clic: `.timeline__list` no tenía `position`, así que `offsetTop` se medía desde la página. **El mismo bug estaba en Astro** | Alta | Corregido: `position: relative` en la lista |
| 2 | Una noticia sin fecha válida creaba un año vacío | Media | Corregido: solo se agrupan años de 4 dígitos |
| 3 | `lapaz_fecha_iso()` rechazaba fechas con hora; `toIsoDate()` de Astro las aceptaba | Media | Corregido: acepta el prefijo `YYYY-MM-DD` |
| 4 | Una noticia sin URL no se muestra (en Astro salía con enlace vacío) | Baja | **Se mantiene:** un enlace roto es peor que no mostrarla |
| 5 | Sin subcuentas o sin noticias quedaban flechas sin nada que mover | Baja | Corregido: no se pintan |
| 6 | El scroll suave no respetaba `prefers-reduced-motion` | Baja | Corregido |
| 7 | `aria-label` en un `div` sin rol | Baja | Corregido: `role="group"` |
