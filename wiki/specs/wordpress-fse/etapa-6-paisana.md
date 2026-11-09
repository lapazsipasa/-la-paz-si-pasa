# Etapa 6: Proyectos destacados (PaisSana)

Estado: **hecha** (verificada: `bin/check` y su prueba e2e en verde) · 2026-11-08 · spec principal: [wordpress-fse.md](../wordpress-fse.md)

## Objetivo

Que la página Proyectos destacados quede completa en WordPress y sea editable: cifras y regiones desde la página; relatos de audio, videos y ferias desde sus menús. Debe verse y funcionar igual que en Astro.

## Bloques (en el orden de `proyectos-destacados.astro`)

| Bloque | Componentes de Astro | Datos | Notas |
|---|---|---|---|
| `lapaz/paisana-hero` | ProyectosNav + PaisSanaHero | **3 cifras editables** (`cifra_N_valor` y `cifra_N_texto`). Vacías, usan los valores actuales | El wrapper es `.paisana-header`, como en la página de Astro |
| `lapaz/paisana-mapa` | PaisSanaMapaIntro + PaisSanaMapaCarrusel + RegionTabBtn | **Regiones editables:** total y departamentos (un `NOMBRE: número` por línea) por región. Id, nombre, color y mapa quedan fijos (son diseño) | Los paneles usan `data-region` en lugar de `id`, así el JS queda acotado al bloque. Se agregó `aria-selected` a las pestañas |
| `lapaz/paisana-audios` | PaisSanaAudioPlayer | CPT `audio_relato` por `orden` | Hooks `data-audio` en lugar de los `id` fijos de Astro (`#playPauseBtn`…) |
| `lapaz/paisana-productores` | PaisSanaProductoresVideos | Videos con la etiqueta PaisSana (`inc/videos.php`) | **Plyr 3.7.8 servido desde el tema** (`assets/vendor/plyr/`, con licencia), con su sprite de íconos local (`iconUrl`): ya no se usa cdn.plyr.io. Se monta al acercarse a la pantalla, como en Astro |
| `lapaz/paisana-ferias` | PaisSanaFeriasIntro + Acordeon + FeriaItem + `feriaVideos.ts` | CPT `feria` por `orden`, galería y repetidor de videos (con el esquema viejo de respaldo) | Acordeón nativo con `<details name>`, sin el JS que sobraba. El lightbox `<dialog>` vive dentro del bloque, así su CSS queda bajo el prefijo. Los listeners están en el bloque, no en `document` |

## Modelo de contenido nuevo

- **`apps/wp-fse/scf-json/group_proyectos.json`:** son grupos **propios del sitio FSE**. Se cargan desde `wp-content/scf-json-lapaz` y no se mezclan con los JSON que comparte el headless. Tiene dos pestañas en el editor: Datos relevantes y Regiones del mapa. Los valores por defecto son los actuales.
- **Ubicación:** el filtro `lapaz_grupos_por_pagina` (en `lapaz-core`) muestra `group_home` solo en Inicio y `group_proyectos` solo en la página con slug `proyectos-destacados`. Verificado con `acf_get_field_groups`.

## Assets (generados una vez, con la misma calidad que Astro)

Están en `assets/img/paisana/`:
- logo, flor, íconos, tucán y paisaje (SVG copiados);
- foto del hero (600 y 1200);
- retrato (500 y 1000);
- fondo del mapa (600×500, recortado como lo hace Astro);
- 5 mapas a 650 px;
- ilustración de ferias (400 y 800).

Se descartaron las variantes 2× de los mapas y del fondo, porque pesaban de 250 a 880 KB, y se dejó 1× como Astro.

## Smoke

| Bloque | Resultado |
|---|---|
| Cifras | 450 / 3.402 / 168 |
| Mapa | 5 pestañas y 5 paneles, con los totales 61/120/152/93/42 y departamentos con cero a la izquierda |
| Audios | 15 relatos con archivo |
| Productores | 6 videos, con URL igual a `playerUrl()` de Astro |
| Ferias | 15, una abierta, 87 fotos y 34 videos |

Sin errores de PHP.

## Tamaños (regla de `bin/check`)

- **CSS de ferias:** pasaba de 400 líneas, así que se dividió en `intro.css` + `style.css`; `block.json` acepta varios archivos en `style`.
- **Datos de ferias:** pasaron a `inc/ferias.php`.
- Ningún archivo `inc/*.php` pasa de 200 líneas.

## Pendiente (Codex / AGY)

- **Codex**, una prueba e2e por bloque:
  - pestañas del mapa (`aria-selected`, panel visible);
  - audio (siguiente y anterior circulares, metadatos, deshabilitado sin archivo);
  - Plyr se monta al hacer scroll y no pide nada a cdn.plyr.io;
  - ferias: una sola abierta, el carrusel de videos y su contador, el lightbox (abre y cierra con Esc) y el video que se detiene al cerrar la feria;
  - cifras y regiones editadas con wp-cli que se reflejan.

  Además: bases visuales contra Astro, `bin/check` y el workflow (seed de `audio_relatos` y `ferias`).
- **AGY:** revisión de solo lectura de los 5 bloques frente a sus componentes.

## Revisión independiente (AGY, solo lectura)

| # | Hallazgo | Prioridad | Decisión |
|---|---|---|---|
| 1 | El `origin` de YouTube quedaría codificado dos veces en `lapaz_player_url()` | Alta | **Falso positivo.** `add_query_arg()` llama a `build_query()` con `urlencode=false` (verificado en `wp-includes/functions.php`), y el HTML real trae `origin=http%3A%2F%2Flocalhost%3A8090`, codificado una sola vez |
| 2 | El lightbox abría la miniatura del srcset y se veía pixelada (Astro usaba 1536) | Media | Corregido: `data-full-src` con el tamaño `1536x1536` |
| 3 | `aria-selected` en botones sin `role="tab"` no es ARIA válido | Media | Corregido: son botones de alternar, con `aria-pressed` |
| 4 | El botón de audio no cambiaba su `aria-label` al reproducir | Baja | Corregido: alterna «Reproducir audio» y «Pausar audio» |
| 5 | La URL del audio solo se leía si SCF devolvía un arreglo | Baja | Corregido: `lapaz_file_url()` acepta arreglo, ID o URL |

**Aprendizaje:** los hallazgos de una revisión automática se verifican contra el código antes de aplicarlos. Este falso positivo, de prioridad alta, habría roto el control de Plyr.
