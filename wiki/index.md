# La Paz Sí Pasa

## Qué es

Sitio público de La Paz Sí Pasa (https://lapazsipasa.com/). Muestra retratos de los territorios, las subcuentas y noticias del fondo, la galería de actualidad, la página de proyectos destacados (PaisSana: mapa, audios, ferias y productores), el boletín *Caminos de Transformación* y la historia del mes (en producción desde 2026-11-23). El catálogo de productores está listo pero oculto hasta que el Fondo lo autorice. El equipo edita el contenido en WordPress.

## Estado: producción

- **Producción (desde 2026-11-09):** sitio WordPress FSE, con el tema de bloques `lapaz` (`apps/wordpress/themes/lapaz/`). WordPress pinta todas las páginas; no hay Astro en el camino. Código de despliegue en `apps/wp-fse/`. Detalle en [despliegue-fse.md](despliegue-fse.md).
- **Respaldo:** headless (WordPress + API REST) con frontend en Astro. Sigue en el servidor viejo, sin tráfico, hasta la limpieza final.
- **Boletín e historia del mes:** [boletín y catálogo PaisSana](specs/boletin-catalogo-fcp.md), en producción desde 2026-11-23 (PR #2, squash `a0c3802` en `main`). Boletín en `/boletin/` (Edición 02) e historia en `/historias/` (Asocafé). Detalle en [despliegue-fse.md](despliegue-fse.md#despliegue-de-boletín-y-catálogo-paissana).
- **Catálogo PaisSana (`/productores/`):** en producción desde 2026-11-23 con **300 productores**. Quedan en borrador 16 fichas hasta que responda el Fondo: las 12 con nombre de persona natural (7 con etnia o condición de víctima) y 4 con erratas de origen. Cuando el Fondo autorice o corrija, se publican desde *Productores* en WordPress ([procedimiento](despliegue-fse.md#publicar-el-catálogo-cuando-el-fondo-autorice)).
  - Estado (2026-11-23): manual general y 10 manuales por tipo; revisiones independientes hasta la 45 (sin hallazgos altos ni medios); producción probada con el recorrido, el sitemap, las cabeceras, la API y la consola CSP sin violaciones (7 rutas). Las suites que escriben con wp-cli no se corrieron en producción (TODO: verificar qué se corrió en staging).

## Stack

- **CMS (producción):** WordPress 7.1 sobre PHP 8.3 (Apache), tema de bloques `lapaz`, Secure Custom Fields (SCF) para CPT y campos. Código en `apps/wp-fse/`; tema y definiciones en `apps/wordpress/themes/lapaz/` y `apps/wp-fse/scf-json/`.
- **Frontend de respaldo:** Astro 7 en SSR (`@astrojs/node`), TypeScript. Código en `apps/frontend/`.
- **CMS del headless:** WordPress con SCF. Código en `apps/wordpress/`; sus definiciones viven en `apps/wordpress/scf-json/`, que comparten el headless y el FSE.
- **Base de datos:** MariaDB 11.
- **Contenedores:** Docker. `apps/wp-fse/compose.yaml` en Dokploy (producción); `docker-compose.yml` local y `compose.prod.yaml` del headless.
- **Versiones fijas:** Node 22.23.4 (`docker/astro/Dockerfile`) y WordPress 7.1.3 con PHP 8.3 (`docker/wordpress/Dockerfile`). Confirmado el 2026-11-08: la imagen `wordpress:7.1.3-php8.3-apache` corre PHP 8.3.36 (se vio en la cabecera `X-Powered-By` antes de ocultarla).

## Arquitectura

- **Sitio FSE:** WordPress pinta las plantillas (`templates/`) con bloques `lapaz/*`. Los datos viven en SCF. Reglas en [buenas-practicas-wordpress.md](buenas-practicas-wordpress.md) y [decisiones](decisions/wordpress-fse-arquitectura.md).
- **Headless (respaldo):**

```text
Componente Astro (props tipadas)
  -> adapters/index.ts          (getHome, getRetratos, getVideos, ...)
  -> adapters/wordpress/        (client, endpoints, mappers)
  -> WordPress REST             (/wp-json/wp/v2/<rest_base>, /headless/v1/site)
```

- Los contratos del headless viven en `adapters/contracts/`. Si WordPress no responde o un CPT viene vacío, `withFallback` usa `adapters/mocks.ts`. Cada bloque informa su fuente con `?debug-content=1`.
- Caché de página en memoria (`lib/pageCache.ts`), vaciada con `POST /api/revalidate` y el header de secreto (headless).
- Documentación interna (`docs/`): no está versionada. Se consulta en la copia local.

## Entorno de desarrollo

[entorno-desarrollo.md](entorno-desarrollo.md): servicios locales (8090 FSE, 8080 headless, 4321 Astro), agentes (Claude orquesta con subagentes Sonnet/Opus; AGY revisa en solo lectura), skills, calidad y secretos.

## Especificaciones y guías

- [Migración FSE: spec, etapas e inventario](specs/wordpress-fse.md) (etapas construidas; producción desde 2026-11-09)
- [Boletín y catálogo PaisSana](specs/boletin-catalogo-fcp.md): [contrato entre piezas](specs/boletin-catalogo-fcp/contrato.md), [boletín](specs/boletin-catalogo-fcp/boletin-estructura.md), [catálogo e historia](specs/boletin-catalogo-fcp/paissana-catalogo.md), [accesos](specs/boletin-catalogo-fcp/accesos-paginas-existentes.md), [revisiones independientes y pendientes](specs/boletin-catalogo-fcp/revisiones-independientes.md), [nota para el Fondo](specs/boletin-catalogo-fcp/nota-para-el-fondo.md), [integración de SEO](specs/boletin-catalogo-fcp/seo-plugin.md) y [PR #2](prs/boletin-catalogo-fcp.md)
- [Guion de pruebas de staging](specs/boletin-catalogo-fcp/plan-staging.md): 11 bloques con pasos, resultado esperado y criterio de salida a producción
- [Manual del editor](manual-editor.md): guía paso a paso para publicar boletines, historias y productores en WordPress
- [Navegación del sitio](navegacion.md): mapa, problemas y decisiones de William (2026-11-19)
- [Guía de estilos](guia-de-estilos.md): reglas visuales del sitio
- [Despliegue en Dokploy, servidores y `lapaz-importar`](despliegue-fse.md)
- [Buenas prácticas y kit](buenas-practicas-wordpress.md)
- [Decisiones de arquitectura](decisions/wordpress-fse-arquitectura.md) y [decisiones del boletín y el catálogo](decisions/boletin-catalogo-fcp.md)

## Contenido y medios

- `apps/wordpress/seed/`: 102 fotos (ferias y retratos), 15 audios m4a y 43 enlaces de YouTube. `seed.php` carga 54 entradas (retratos, videos, ferias, audios) más 23 subcuentas. Para el sitio FSE también carga 316 productores, la edición 02 del boletín y la historia de Asocafé.
- Faltan en el seed: noticias (sin contenido real).
- Lo subido en producción vive solo en el servidor. Antes de cualquier cambio, respaldar la base y `uploads` (ver [despliegue-fse.md](despliegue-fse.md)).

## Enlaces

- [Features](features.md) · [Updates](updates.md) · [Changelog](changelog.md) · [Enlaces](enlaces.md) · [Navegación](navegacion.md)
- [AGENTS.md](../AGENTS.md): comandos y reglas para asistentes.
