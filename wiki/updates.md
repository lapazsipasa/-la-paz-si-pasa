# Updates

## 2026-11-20 · boletín y catálogo: URL nuevas, endurecimiento y revisiones cerradas

**Estado:** entrega en la rama `feat/boletin-catalogo-fcp` (28 commits sobre `lapazsipasa/main`). **Sin push, sin PR y sin desplegar.** Producción sigue en el sitio FSE de 2026-11-09. Qué cambió hoy: [changelog](changelog.md). Revisiones y sus pendientes: [revisiones independientes](specs/boletin-catalogo-fcp/revisiones-independientes.md).

- Catálogo en `/productores/`, historias en `/historias/<slug>/` y `/paissana/` retirado (`1e799ea`).
- Admin en lenguaje llano; la crónica ya no pide el «Título» (`a0c2b63`).
- API REST cerrada sin sesión y endurecimiento de WordPress, Apache, PHP y CI (`3b2941d`, `ff6445d`).
- Accesibilidad AA y caché de página al publicar (`239dcc9`).
- Revisiones independientes 1 a 9 con su estado. La 10 está en curso.

**Pendiente antes del PR:**
- Pruebas: cerrar T1 a T6 de la [revisión 8](specs/boletin-catalogo-fcp/revisiones-independientes.md#8-pruebas-automáticas). Hay 12 archivos modificados y 2 nuevos en `apps/wp-fse/tests/e2e/` sin commit. `navegacion.mjs` y `rest.mjs` no corren en CI.
- `apps/wp-fse/bin/check`, `seo.mjs` y el resto de suites: sin resultado registrado. TODO: confirmar.
- Integrar y probar The SEO Framework (elegido por William) para título, descripción e imagen por página. Sin probar.
- Regenerar las bases visuales (`baseline/`).
- Manual del editor: borrador en `wiki/manual-editor.md` (sin commit; faltan capturas y confirmar en pantalla lo marcado). Después, Google Doc y usuario Editor. Sin clave en el repo.
- Staging (`st.lapazsipasa.com`, TODO: confirmar que está arriba), PR y deploy.

**Bloqueo:** aprobación de William para push, PR y deploy. Del Fondo: autorización de los datos de 12 personas en el seed, corrección del registro «Llaneridad Gourmet», video de Asocafé, datos de la persona externa, si el boletín deja de decir «interno», y las noticias reales. Del servidor: panel de administración con HTTPS y puerto cerrado, límite de intentos de login, respaldos y rotación de claves ([lista completa](specs/boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor)).

**Siguiente paso:** cerrar las pruebas (T1 a T6) y correr `bin/check`. Después, integrar el plugin de SEO y preparar el staging.

## 2026-11-20 · boletín y catálogo PaisSana: construido en la rama

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
