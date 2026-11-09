# Spec: sitio en WordPress con tema de bloques (FSE)

Estado: **etapas 0–7.5 hechas (bin/check y 12 suites e2e en verde); siguiente: staging (etapa 8)** · rama `feat/wordpress-fse` · inicio 2026-11-08

## Objetivo

Que los editores de La Paz Sí Pasa puedan editar todo el contenido del sitio desde WordPress sin depender de desarrollo.

## Alcance

- Un tema de bloques `lapaz` (`apps/wordpress/themes/lapaz/`) que pinta el sitio desde WordPress, sin Astro ni API REST de por medio.
- Un componente de Astro equivale a un bloque dinámico (`block.json` + `render.php` + `style.css` + `view.js` opcional), reutilizando el HTML, el CSS y el JS existentes. Solo se reescribe lo que en PHP queda más simple o más correcto.
- Se reutilizan los CPT y los campos SCF de `apps/wordpress/scf-json/` y el seed de `apps/wordpress/seed/`.
- Pasan a ser editables las cifras del hero PaisSana y las 5 regiones del mapa (decisión del 2026-11-08). El resto del copy queda fijo, como dice la cotización.
- Despliegue en Dokploy con un solo compose y una sola imagen para local y producción.

## Fuera de alcance

- Cambios de diseño. El sitio debe verse igual que hoy.
- Volver editable todo el copy fijo (intro, footer, textos de sección).
- Tocar el stack headless o Astro mientras dure la prueba. Se retiran en la etapa 8.
- Interactivity API: el JS existente es vanilla y basta con `viewScript`.

## Criterios de hecho (de todo el proyecto)

1. `/` y `/proyectos-destacados` se ven igual que en Astro a 360, 850 y 1440 px.
2. Todas las interacciones de hoy funcionan: ver el [inventario de componentes](#componentes).
3. Un usuario con rol de editor cambia retratos, noticias, videos, audios, ferias, cifras, regiones, el menú y la imagen del hero sin desplegar.
4. LCP, CLS y TTFB en móvil iguales o mejores que con Astro. Cada página carga solo el CSS y el JS de sus bloques.
5. El sitio es indexable (sin `noindex`), con un sitemap sin los CPT, y OG/canonical como hoy.
6. Despliega en Dokploy con `compose.yaml` y un solo comando idempotente de setup.

## Etapas

Cada etapa tiene su documento en [`wordpress-fse/`](wordpress-fse/), que se escribe al empezarla, y necesita aprobación antes de construirse.

| # | Etapa | Estado | Documento |
|---|---|---|---|
| 0 | Documentación, kit y WordPress en cero (`apps/wp-fse/`) | hecha | este archivo + [buenas prácticas](../buenas-practicas-wordpress.md) |
| 1 | Prueba de concepto: navbar con `core/navigation` | hecha | [etapa-1-navbar.md](wordpress-fse/etapa-1-navbar.md) |
| 1.5 | Calidad determinista: `bin/check`, E2E y visual, CI | hecha | [etapa-1-5-calidad.md](wordpress-fse/etapa-1-5-calidad.md) |
| 2 | Retratos («La Paz Sí Pasa» + slider), SCF y `lapaz-core` en la imagen | hecha | [etapa-2-retratos.md](wordpress-fse/etapa-2-retratos.md) |
| 3 | Hero (editable), footer y plantillas (portada Inicio, proyectos-destacados, 404) | hecha | [etapa-3-hero-footer.md](wordpress-fse/etapa-3-hero-footer.md) |
| 4 | Lo que hacemos: subcuentas, noticias por año, banner | hecha | [etapa-4-lo-que-hacemos.md](wordpress-fse/etapa-4-lo-que-hacemos.md) |
| 5 | Actualidad: videos, destacado y carrusel | hecha | [etapa-5-actualidad.md](wordpress-fse/etapa-5-actualidad.md) |
| 6 | Proyectos destacados (PaisSana): 5 bloques; cifras y regiones editables | hecha | [etapa-6-paisana.md](wordpress-fse/etapa-6-paisana.md) |
| 7 | SEO, rendimiento, limpieza de WordPress y seguridad | hecha | [etapa-7-seo-rendimiento.md](wordpress-fse/etapa-7-seo-rendimiento.md) |
| 7.5 | Operación: SMTP, `lapaz-setup --seed`, `lapaz-importar` (contenido de producción), guía de Dokploy | hecha | [despliegue-fse.md](../despliegue-fse.md) |
| 8 | Staging en el servidor nuevo y cambio a producción | pendiente (aprobación) | [despliegue-fse.md](../despliegue-fse.md) |
| 9 | Limpieza: retirar `apps/frontend/`, `docker/astro/`, los mu-plugins headless y los docs viejos. **Solo al final, con aprobación explícita de William** ([decisión 7](../decisions/wordpress-fse-arquitectura.md#7-el-headless-sigue-en-pie-hasta-el-final)) | pendiente | — |

## Inventario (2026-11-08)

### Medios

| Material | Dónde | Cantidad |
|---|---|---|
| Fotos de ferias | `apps/wordpress/seed/media/ferias/<fecha-slug>/` | 15 ferias, ~6 jpg cada una |
| Fotos de retratos | `apps/wordpress/seed/media/retratos/{01-pss,02-pcs,03-kfw}/` | 15 jpg |
| Audios de Corazón del campo | `apps/wordpress/seed/media/audio/` | 15 m4a |
| Videos | enlaces en `apps/wordpress/seed/contenido.json` | 43 enlaces de YouTube; no hay mp4 |
| Imágenes de diseño | `apps/frontend/src/assets/` | 46 png, 15 svg (28 MB de origen) |
| Fuentes, favicon, OG, hero | `apps/frontend/public/` | 7 woff2, `og.jpg` 1200×630, hero 640/960/1200 |

El seed (`seed.php`, idempotente) carga 77 entradas: 15 retratos, 9 videos, 15 ferias, 15 audios y, desde la etapa 4, 23 subcuentas con sus logos.

**Faltantes:**
- Las noticias no están en el seed: las de los mocks apuntan a `example.com`, así que falta contenido real del cliente. En local y en CI se crean 6 noticias de ejemplo con wp-cli, que nunca llegan al seed. (Las subcuentas entraron al seed en la etapa 4.)
- Lo que se haya subido directamente en producción vive solo en el servidor: hay que hacer respaldo de la base y de `uploads` antes de la etapa 7.

### Componentes

25 componentes, unas 4.700 líneas. 11 tienen JS, y todo es vanilla. Lo único que depende de Astro es `astro:page-load`, la sintaxis de TypeScript, `astro:assets`, `set:html` y `class:list`.

| Página | Bloques previstos (componentes que agrupan) |
|---|---|
| Layout | `core/navigation` (Nav, NavMenu, NavMenuDesktop) · `lapaz/footer` (Footer) |
| Home | `lapaz/hero` · `lapaz/retratos` (RetratosPaz, IntroText, RetratosPazSlider) · `lapaz/lo-que-hacemos` (TextoDestacado, Subcuentas, BannerCta, NoticiasTimeline) · `lapaz/actualidad` (ActualidadGaleria) |
| Proyectos destacados | `lapaz/paisana-hero` (ProyectosNav, PaisSanaHero) · `lapaz/paisana-mapa` (MapaIntro, MapaCarrusel, RegionTabBtn) · `lapaz/paisana-audios` · `lapaz/paisana-productores` · `lapaz/paisana-ferias` (FeriasIntro, Acordeon, FeriaItem) |

JS por tamaño, en líneas aproximadas:

| Componente | Líneas | Nota |
|---|---|---|
| ActualidadGaleria | 140 | |
| AudioPlayer | 100 | |
| FeriaItem + `feriaVideos.ts` | 107 | |
| ProductoresVideos | 80 | Plyr cargado desde CDN |
| Nav | 25 | se reemplaza por `core/navigation` |
| RetratosSlider | 20 | |
| MapaCarrusel | 20 | |
| NoticiasTimeline | 15 | |
| FeriasAcordeon | 12 | sobra: `<details name>` ya lo resuelve de forma nativa |
| Subcuentas | 10 | |
| Footer | 3 | |

**Riesgos de portar:**
- Sin el aislamiento de estilos de Astro chocan las clases `.nav`/`.nav__list`, `.nav-list`, `.hero-*`, `.timeline`, `.tab-btn` y `.active`. Hay que ponerles prefijo de bloque.
- AudioPlayer y MapaCarrusel buscan elementos por id fijo, así que solo admiten una instancia por página.
- Hay lógica de servidor que pasa a PHP:
  - agrupar noticias por año, como máximo 3 por año;
  - `playerUrl()`;
  - `formatearDuracion()`;
  - filtrar los videos con el tag PaisSana;
  - `videoSource()` de `adapters/youtube.js`;
  - el mapper de ferias.
- Las pruebas de `apps/frontend/test/` son la especificación de esos ports.
- Bug conocido: ActualidadGaleria agrega `?autoplay=1` sin revisar si la URL ya trae `?`.

### WordPress

**CPT** (todos con `show_in_rest`, sin archivo y sin editor):

| CPT | REST base |
|---|---|
| `retrato` | `retrato` |
| `subcuenta` | `subcuenta` |
| `noticia` | `noticia` |
| `video` | `video` |
| `audio_relato` | `audio-relato` |
| `feria` | `feria` |

**Grupos SCF:** uno por CPT, más `group_home` (`hero_imagen`, `noticias_cta_url`). Hoy `group_home` aplica a todas las páginas; hay que acotarlo a la portada. Ferias usa galería y repeater de videos.

**mu-plugins en el paso a FSE:**

| mu-plugin | Qué pasa |
|---|---|
| `headless-redirect.php` | Se borra. Hoy hace 301 a Astro y pone `noindex`, y eso bloquea la migración |
| `headless-cache.php` | Se borra |
| `headless-core.php` | Se recorta: se quedan el tope de 1500 px y la ruta de los JSON de SCF |
| `headless-smtp.php` | Se queda |

**Plugins:** solo SCF, hoy instalado a mano. Se fijará su versión dentro de la imagen.

### Rendimiento a conservar

- **Hero:** imagen LCP en jpg con srcset 640/960/1200, `fetchpriority=high` y sin lazy.
- **Imágenes:** WebP en 320/640/960 y `<picture>` con breakpoints 360/849. Para los medios del CMS, el tamaño `1536x1536`.
- **Fuentes:** woff2 locales con `swap` y overrides de métricas.
- **Caché:** `max-age=60, s-maxage=300, stale-while-revalidate=600`. En WordPress se decide en la etapa 6 según la medición (WP Super Cache como candidato).
- **YouTube:** con `youtube-nocookie`. Audio con `preload=metadata`.

## Decisiones

- [Arquitectura del tema FSE](../decisions/wordpress-fse-arquitectura.md)
- [Buenas prácticas y kit](../buenas-practicas-wordpress.md)
