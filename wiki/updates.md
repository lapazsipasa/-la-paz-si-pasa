# Updates

## 2026-11-23 · dev probado y CSP sin violaciones

**Estado:** rama `feat/boletin-catalogo-fcp`, [PR #2](https://github.com/lapazsipasa/-la-paz-si-pasa/pull/2) abierto contra `frontend`. Dev corre `cf74458`. Sin merge ni deploy a producción.

**Hecho hoy:**
- CSP: `'wasm-unsafe-eval'` en `script-src` (`cf74458`). Era la única violación en dev, por el router de la Interactivity API en `/productores/`. Tras el cambio, 0 violaciones en 9 rutas a 360 y 1440 px, incluido un video de YouTube en Plyr.
- Dev: `bin/check` en verde; recorrido de rutas, cabeceras y archivos sensibles; suites de solo lectura en verde (125 comprobaciones).
- Revisión 45 (AGY, 11 PDF): sin hallazgos altos ni medios. `c75b944` llegó después de esa revisión (TODO: verificar si hace falta revisarlo).
- Wiki: CSP y dev al día en despliegue, PR, revisiones, changelog e índice.

**Siguiente paso:** repetir en local, sobre `cf74458`, las 13 suites que escriben con wp-cli.

**Bloqueo:** ninguno técnico. Decisiones de William: pasar CSP a modo activo (tras confirmarlo en staging o producción), merge del PR y aprobación de staging.

## 2026-11-21 · PR abierto

**Estado:** rama subida y [PR #2](https://github.com/lapazsipasa/-la-paz-si-pasa/pull/2) abierto contra `main`, con los 49 commits (sin aplastar, por decisión de William, para que la historia documente el trabajo). Antes de subir, la rama se reaplicó sobre `main` y los datos de operación que llevaban cuatro commits antiguos se cambiaron por marcadores en cada commit; ninguno los contiene. `main` ya los tenía en su historia anterior: se mitigan en el servidor.

**Siguiente paso:** CI del PR en verde, revisión y merge sin squash; luego staging con el [guion](specs/boletin-catalogo-fcp/plan-staging.md) (antes, `WP_ENVIRONMENT_TYPE=staging`).

**Pendiente de William:** merge, aprobación de staging y producción, subir el manual a Drive, usuario Editor, pendientes del servidor y nota al Fondo.

## 2026-11-21 · cierre de la rama: corrida final, manual con láminas y revisiones

**Estado:** rama `feat/boletin-catalogo-fcp`, 48 commits sobre `lapazsipasa/main`. Árbol limpio. **Sin push, sin PR y sin desplegar.** Detalle por commit: [changelog](changelog.md). Cifras y descripción del PR: [prs/boletin-catalogo-fcp](prs/boletin-catalogo-fcp.md).

**Hecho hoy:**
- Pantallas de edición con el plugin de SEO: `TypeError` en `lapaz_tsf_imagen()` corregido en `c3f7c11`. Ninguna suite abría una pantalla de edición con sesión, por eso estaba todo en verde.
- `admin.mjs` reforzada en `2eeeb72`: 20 comprobaciones, incluido el guardado real por HTTP de un boletín borrador con sesión de Editor (título, campo y título de SEO se guardan; redirección y `noindex` no).
- Manual del editor terminado en su forma nueva (`0a529d3`, `7bb554f`): cada formulario con una lámina emparejada (pantalla de WordPress y componente del sitio, con los mismos números); 13 láminas, 72 pares campo → elemento y 5 capturas. Las imágenes y los documentos no viven en el repo.
- Corrida final sobre `7bb554f`, con la imagen local reconstruida y árbol limpio: `bin/check` 17 pasos en verde; 18 suites e2e con salida 0, 965 comprobaciones.
- Revisiones 36 (control visual de las 31 imágenes del manual: retocadas) y 38 (segunda pasada visual: todas sirven; sin erratas en el texto).
- Veredicto del revisor (revisión 35): lista para abrir el PR con squash merge, sin bloqueantes.

**Hecho después (`221a33c`):**
- Revisión 39 (lectura completa del manual maquetado, hecha por un subagente revisor porque AGY había perdido su sesión): sus ajustes aplicados. Explicación «Cómo leer las láminas» tras el índice, apartado de quitar o reordenar secciones antes de llenar, paso de publicar en la historia, portada de Inicio reducida a su imagen del sitio. El documento quedó en 46 páginas (Word y PDF).
- Herramientas para regenerar el manual en el repo: `apps/wp-fse/tools/manual/` (mapa campo → elemento del sitio, generador de láminas numeradas y maquetador). El texto sale de [manual-editor](manual-editor.md); imágenes y documentos fuera del repo.

**Revisión 40** (manual maquetado final y herramientas): AGY la terminó pero quedó esperando permiso para escribir el informe, así que la hizo un subagente revisor, igual que la 25 y la 39. Veredicto: listo con 4 cambios necesarios, aplicados: un círculo tapado en la lámina del productor; el generador de láminas se niega a correr contra un sitio que no sea el local; borra el usuario temporal y los borradores aunque se interrumpa; y el README dice que antes hay que cargar el contenido de ejemplo. También los opcionales: marcadores y título del PDF, lámina de Cifras recortada. El manual queda en 43 páginas.

**Pendiente de William:**
- Subir el Word a su Drive como documento de Google (`raw/manual-editor/`, fuera del repo).
- Aprobación para push, staging y PR.

**Siguiente paso:** aprobación para staging y PR. El guion de staging está en [plan-staging](specs/boletin-catalogo-fcp/plan-staging.md).

**Bloqueo:** falta la aprobación de William para push, PR, staging y deploy. Pendientes del servidor y del Fondo en [revisiones independientes](specs/boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor).

## 2026-11-20 (cierre de sesión) · dónde quedó y qué sigue

> Superado el 2026-11-21: canónica y PHPCS hechos (`1d4e1b2`), revisión 25 repetida por AGY. Lo de abajo es el registro del momento.

**Estado:** rama `feat/boletin-catalogo-fcp`, 38 commits sobre `lapazsipasa/main`. **Sin push, sin PR y sin desplegar**: falta la aprobación de William. El sitio local quedó reconstruido con la imagen nueva y el plugin de SEO activo.

**Hecho hoy:**
- Correcciones de las revisiones independientes 10, 12, 17, 19, 21 y 22, y limpieza del seed (revisión 18) y de sobras (revisión 23).
- Plugin The SEO Framework integrado en la imagen, el arranque y el tema, con el SEO del tema como respaldo. Detalle en [seo-plugin](specs/boletin-catalogo-fcp/seo-plugin.md).
- Guardas de `lapaz-setup` para el despliegue (revisión 15).
- Manual del editor revisado, nota para el Fondo y borrador del PR.

**Verificado en local con la imagen reconstruida:** `seguridad.mjs` 64 de 64, `seo.mjs` 280, `navegacion.mjs` 181. `bin/check` en verde salvo PHPCS.

**Pendiente inmediato (lo primero al retomar):**
1. `boletin.mjs` e `historia.mjs` fallan en la canónica de la entrada: en local todo va con `noindex` y el plugin no imprime canónica en páginas `noindex` (sí en `/boletin/` e `/historias/`). Pasar esas comprobaciones al modo de producción, como hace `seo.mjs`.
2. PHPCS: `apps/wordpress/themes/lapaz/inc/boletin.php:57`, comentario sin descripción corta.
3. Corrida final de `bin/check` y de todas las suites; `catalogo`, `rest`, `historia`, `boletin` y `lo-que-hacemos` no se han vuelto a correr con el plugin activo.
4. **Hecho (2026-11-21):** documentación del plugin. Entradas 21 a 25 en `revisiones-independientes.md`, nota de estado en `revision-seo-enlaces.md`, borrador de `prs/boletin-catalogo-fcp.md` al día, y `changelog`, `features`, `despliegue-fse` y `manual-editor` revisados contra el código.
5. Revisión 25 (ajustes de SEO): la hizo un revisor independiente porque AGY agotó su cuota. Repetirla con AGY.
6. Manual del editor: capturas y paso a documento de Google.

**Bloqueo:** aprobación de William para staging y PR; pendientes del servidor y del Fondo en [revisiones independientes](specs/boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor).

## 2026-11-20 · boletín y catálogo: pruebas, accesibilidad y 17 revisiones

> Superado el mismo día: el estado actual está en el cierre de sesión de arriba (38 commits; el plugin de SEO y las guardas de `lapaz-setup` ya están commiteados en `2f13b6b`). Lo de abajo es el registro del momento.

**Estado:** entrega construida en la rama `feat/boletin-catalogo-fcp` (**34 commits** sobre `lapazsipasa/main`, el último `35b50b3`). **Sin push, sin PR y sin desplegar.** Producción sigue en el sitio FSE de 2026-11-09. Detalle por commit: [changelog](changelog.md). Estado de las revisiones y pendientes: [revisiones independientes](specs/boletin-catalogo-fcp/revisiones-independientes.md).

- URLs definitivas (`/productores/`, `/historias/`, `/boletin/`), API REST cerrada y endurecimiento de WordPress, Apache, PHP y CI (`3b2941d`, `1e799ea`, `ff6445d`, `f0f5f67`).
- Accesibilidad AA, división de CSS (`editorial.css` + `lectura.css`), lightbox `<dialog>` y vaciado de caché en `lapaz-core.php` (`239dcc9`, `1d87a5b`, `35b50b3`).
- Suites e2e commiteadas y en CI (`9bb6c80`, `e78e2f1`).
- Revisiones independientes 1 a 10, 12, 13 y 15 a 19 hechas (17 informes). 11, 14 y 20 fueron tareas de redacción. La 21 está en curso.
- Sin commit (en curso): manual del editor v2, guardas de `lapaz-setup` (revisiones 15 y 19), integración de The SEO Framework (revisión 16) y limpieza de `historia-asocafe.json` (revisión 18).

**Pruebas (estado hoy, en local):** en verde `navegacion` 181, `catalogo` 58, `boletin` 56, `historia` 43, `rest` 22 y `lo-que-hacemos` 24. `seguridad` 54 de 64 hasta reconstruir la imagen. `bin/check` completo y `seo.mjs` sin correr tras los últimos cambios.

**Pendiente antes del PR:**
- Verificar y commitear los cambios de `lapaz-setup` (revisión 19) y la limpieza de `historia-asocafe.json` (revisión 18).
- Correr `apps/wp-fse/bin/check`, reconstruir la imagen local y pasar `seguridad.mjs` (64/64) y `seo.mjs`.
- Integración de The SEO Framework: en curso, sin commit. Decidir si entra en este PR o en uno aparte.
- Capturas y puntos `[CONFIRMAR EN PANTALLA]` de [`manual-editor.md`](manual-editor.md), Google Doc y usuario Editor.
- Aplastar el historial anterior a `ff6445d` antes de hacer `git push` a un remoto público.
- Revisar y commitear la wiki sincronizada.

**Bloqueo:** aprobación de William para push, PR y deploy. Pendientes del Fondo y del servidor: [lista única](specs/boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor).

**Siguiente paso:** con la aprobación de William, cerrar los pendientes de arriba, correr `bin/check`, `seguridad.mjs` y `seo.mjs` con la imagen reconstruida, y abrir el PR contra `main` para probar en staging.

## 2026-11-20 · boletín y catálogo PaisSana: construido en la rama

> Superado el mismo día: el plugin de SEO quedó integrado y commiteado (`2f13b6b`). Ver los bloques de arriba.

**Estado:** construido y con commits en `feat/boletin-catalogo-fcp` (22 commits sobre `lapazsipasa/main`, el último `8347916`). **Sin push, sin PR y sin desplegar:** nada sale a producción hasta que William lo apruebe. Producción sigue en el sitio FSE de 2026-11-09. Bloques, menú y accesos en el [changelog](changelog.md).

**Pendiente antes del PR:**
- SEO: pasar a The SEO Framework para que el editor cambie título, descripción e imagen por página. Sin probar ni integrar.
- Ajustes de los formularios del admin (en curso).
- Correr `apps/wp-fse/bin/check` y la suite `seo.mjs`. TODO: confirmar resultado.
- Regenerar las bases visuales.
- Manual para la persona externa y su usuario Editor (sin clave en el repo).
- Staging (`st.lapazsipasa.com`), PR y deploy. Pasos en [despliegue-fse.md](despliegue-fse.md#despliegue-de-boletín-y-catálogo-paissana).

**Bloqueo:** aprobación de William para push, PR y deploy. Del Fondo: video de Asocafé, datos de la persona externa, si el boletín deja de decir «interno» y limpiar las noticias de ejemplo.

**Siguiente paso:** integrar y probar The SEO Framework en local; luego `bin/check`, `seo.mjs` y las bases visuales.

## 2026-11-19 · boletín y catálogo PaisSana

**Estado:** diseño documentado, sin código. Rama `feat/boletin-catalogo-fcp`, sin commits. [Spec](specs/boletin-catalogo-fcp.md), [boletín](specs/boletin-catalogo-fcp/boletin-estructura.md), [catálogo e historia del mes](specs/boletin-catalogo-fcp/paissana-catalogo.md) y [decisiones](decisions/boletin-catalogo-fcp.md). Insumos del Fondo en `raw/`, fuera de git.

**Decidido con William:** boletín como formulario por secciones (4 moldes), buscador del catálogo nativo en el servidor, una historia PaisSana por mes, y contenido inicial en el seed.

**Bloqueo:** aprobación del diseño. Del Fondo: video Asocafé, datos de la persona externa y si el boletín sigue llamándose «interno».

**Siguiente paso:** aprobar y ejecutar la etapa 0 (`raw/` en `.gitignore`) y la 1 (modelo).

## 2026-11-09 · producción en FSE

**Estado:** `lapazsipasa.com` ya sirve el sitio WordPress FSE desde el servidor nuevo (`<IP_PRODUCCION>`), con Let's Encrypt, contenido del seed y WP Super Cache. Se usó el mismo compose `MonoRepo` del headless, con la ruta `./apps/wp-fse/compose.yaml` y rama `main` (`v2.0.0`). El headless + Astro sigue en el servidor viejo, sin DNS, como respaldo. Detalle en [despliegue-fse.md](despliegue-fse.md#producción-desde-2026-11-09).

**Pendiente:** Redeploy para `www`, correo real de ACME, borrar `cms.lapazsipasa.com` del DNS, limpiar variables duplicadas, respaldos programados, endurecimiento del panel (ver el registro privado de operación), noticias reales.

**Siguiente paso:** staging en `st.lapazsipasa.com`.

## 2026-11-08 · etapas 3 a 7.5 (sin commit)

**Estado:** las dos páginas (`/` y `/proyectos-destacados`) están completas en WordPress. Etapas 0 a 7.5 construidas en `apps/wp-fse/` y el tema `lapaz`, rama `feat/wordpress-fse`. Los cambios de las etapas 3 a 7.5 **no tienen commit**: esperan el verde de Codex (pruebas e2e y `bin/check`). Probado en local: `lapaz-importar` con el headless local (15 retratos, 9 videos, 15 ferias, 15 audios, 4 noticias, 112 MB de uploads); 0 URLs viejas. Detalle por etapa en el [changelog](changelog.md) y en la [guía de despliegue](despliegue-fse.md).

**Bloqueos y pendientes:**
- Noticias reales: las entrega el cliente. Sin ellas, el seed no trae noticias. TODO: confirmar si las 4 noticias del headless local son de prueba.
- `ProyectosNav`: tres botones con `href="#"`, en el headless (`components/ProyectosNav.astro`) y en el bloque `lapaz/paisana-hero` del FSE.
- Pendientes de operación del servidor (respaldos y panel): en el registro privado de operación, no en el repo.

**Siguiente paso:** con el verde de Codex y la aprobación de William, commit y push a `lapazsipasa/-la-paz-si-pasa` (remoto `lapazsipasa`), y staging en el servidor nuevo (etapa 8, requiere aprobación). El headless sigue en producción hasta el final.

## 2026-11-08 · migración FSE

**Estado:** se aprobó la prueba de migración a tema de bloques ([spec](specs/wordpress-fse.md)), en la rama `feat/wordpress-fse`. Las etapas 0 y 1 están hechas: WordPress nuevo en `apps/wp-fse/` (puerto 8090, listo para Dokploy) y navbar configurable desde *Editor del sitio → Navegación*, igual al de Astro. `frontend` ya está alineada con `main` (`dcc8af3`). El headless sigue intacto.

También quedó hecha la etapa 1.5 (calidad determinista): `apps/wp-fse/bin/check` en verde, con E2E y visual del navbar y CI. Las skills oficiales de WordPress están instaladas.

**Bloqueo:** ninguno. Falta el contenido real de las noticias.

Etapa 2 hecha: la sección Retratos («La Paz Sí Pasa» + slider) se edita desde WordPress y se ve igual que en Astro (0,01 % de diferencia). Aprendizajes en [etapa-2-retratos.md](specs/wordpress-fse/etapa-2-retratos.md#aprendizajes).

**Siguiente paso:** etapa 3 (hero y footer). Antes, aprobar su documento.

## 2026-11-08

**Estado:** PR #3 (parches PHP 8.3.36 y Node 22.23.4) está mergeado: `origin/main` tiene el squash `dcc8af3`. `origin/frontend` (rama por defecto en GitHub) va un commit atrás, sin `dcc8af3`. La rama local `fix/parches-php2shell-node` tiene el commit original `a7ef6a6`, con el mismo cambio y otro SHA. No hay PRs abiertos.

**Bloqueo:** ninguno confirmado. TODO: confirmar que el despliegue de producción usa la imagen con las bases parchadas.

**Siguiente paso:** alinear `frontend` con `main` y decidir si `wiki/` se versiona (ver nota abajo).

Pendiente antes de producción, según el código:

- Retirar el fallback a mocks en `adapters/index.ts` (marcado `ponytail`) cuando WordPress tenga todo publicado.
- `components/ProyectosNav.astro`: tres botones con `href="#"`.
- `adapters/mocks.ts`: `audioUrl` vacío hasta subir los MP3 a la biblioteca de WordPress; enlace de video repetido en el CSV (video 3).
- Checklist de contenido y QA en `docs/contenidos-qa.md` (local). Ojo: parte está desactualizada. Hero, menú, subcuentas, noticias, videos, audios y ferias ya están conectados a WordPress.

Nota: `wiki/` no está en `.gitignore`, pero el repo es público y `docs/` sí se ignora. Si se versiona, revisar que no quede información interna.
