# Boletín y catálogo PaisSana

**Estado:** construido en la rama `feat/boletin-catalogo-fcp` (34 commits, del 2026-11-19 al 2026-11-20). **Sin push, PR ni deploy:** pendiente de aprobación de William.
**Repo:** `apps/wordpress/themes/lapaz/`, `apps/wp-fse/scf-json/`, `apps/wp-fse/`, `apps/wordpress/seed/` · rama `feat/boletin-catalogo-fcp` · inicio 2026-11-19

## Objetivo

Que el equipo del Fondo Colombia en Paz pueda publicar en La Paz Sí Pasa cada edición del boletín *Caminos de Transformación* y mantener el catálogo de productores PaisSana desde WordPress, con el estilo del sitio y sin desarrollador.

## Ya existente

Revisado `features.md`: extiende el sitio FSE. Ya hay Proyectos destacados con bloques `paisana-*` y la etiqueta PaisSana en los videos. No existe una página propia de PaisSana. El botón **PAISSANA** del bloque `lapaz/paisana-hero` apunta a `#`.

El tema ya carga **Komet** y **Monique Round**, las mismas fuentes que el Fondo dejó pendientes en sus paquetes. Los paquetes usan Fredoka y Mulish de Google Fonts como reemplazo: eso se descarta.

## Insumos

Están en `raw/` (fuera de git, ver tarea 0):

| Paquete | Contenido |
|---|---|
| `Boletin-FCP-Caminos-de-Transformacion/` | Edición 02 (oct–nov 2026) con 8 secciones: Portada, El Fondo en cifras, Historias que transforman, Obras que conectan, Paz productiva, Alianzas, Actualidad, Agenda. Trae 11 fotos y el escudo FCP. |
| `Catalogo PaisSana Asocafe/` | Vista Catálogo (destacado, explorador con filtros, distribución) y vista Asocafé (video, crónica, galería). Trae `productores.json` con 316 productores y 16 imágenes. Falta el video `asocafe.mp4`. |

La estructura y los textos se respetan. El HTML, el CSS y las fuentes de los paquetes no se copian.

## Alcance

El diseño de cada parte está en su documento:

- [Boletín: estructura y alimentación mensual](boletin-catalogo-fcp/boletin-estructura.md)
- [PaisSana: catálogo, buscador e historia del mes](boletin-catalogo-fcp/paissana-catalogo.md)
- [Decisiones](../decisions/boletin-catalogo-fcp.md)

### 0. Base

- Agregar `raw/` a `.gitignore`. Es material interno y el repo es público.

### 1. Boletín

- Tipo `boletin`, una entrada por edición. Las secciones son un campo de contenido flexible de SCF con 4 moldes: artículo, cifras, tarjetas y agenda.
- Una edición nueva abre con las 8 secciones de siempre, vacías. Se pueden quitar, reordenar o agregar.
- El índice, la numeración, la barra de secciones y el pie se generan solos.
- Bloque `lapaz/boletin` con el estilo del sitio. `/boletin/` muestra la edición más reciente y enlaza a las anteriores.
- Ítem «Boletín» en el menú principal, desde *Editor del sitio → Navegación*.

### 2. PaisSana

- Página nueva `/productores/` (catálogo). El botón PAISSANA de `lapaz/paisana-hero` apunta a ella. (Antes se planeó `/paissana/`; ver la [decisión del 2026-11-20](../navegacion.md#ajuste-del-2026-11-20-url-propias-para-productores-e-historias).)
- Tipo `productor` con taxonomías nativas (departamento, categoría, tiempo de operación, etnia, población) y campos SCF (municipio, productos, enlace).
- Bloque `lapaz/catalogo`: búsqueda y filtros en el servidor con `WP_Query`, cada filtro con su URL, y navegación sin recargar con la Interactivity API de WordPress.
- Tipo `historia` para el «PaisSano destacado»: una entrada por mes con ficha, video, crónica y galería. Cada una tiene URL propia, `/historias/<slug>/`. `/productores/` y el archivo `/historias/` muestran la más reciente.

### 3. Contenido inicial

- La edición 02, los 316 productores y la historia de Asocafé entran al seed (`apps/wordpress/seed/`), que es la vía de las demás secciones. Después, el equipo los mantiene desde el admin.

### 4. Manual para la persona externa

- Google Doc en el Drive de William. Explica cómo entrar, publicar una edición del boletín, publicar la historia del mes, agregar o editar productores y qué no tocar.
- Usuario propio con rol **Editor**, no administrador. La clave se envía por otro canal y nunca va al repo ni a la wiki.

## No-alcance

- Volver editable el diseño (colores, tipografía, composición de los moldes).
- Migrar ediciones anteriores del boletín. Solo entra la edición 02.
- Formularios, suscripción al boletín o envío por correo.
- Página propia por productor, mapa de productores y tolerancia a errores de escritura en la búsqueda.
- Las páginas de Programa Colombia Sostenible y PPIP. Sus botones siguen en `#`.

## Criterios de aceptación

Los de cada parte están en su documento. Los de toda la feature:

- [ ] `/boletin/` muestra la edición 02 completa con Komet, Monique Round y la paleta de `theme.json`, sin Google Fonts, a 360, 850 y 1440 px.
- [x] El menú principal tiene «Boletín» y lleva a `/boletin/`. Construido en `2d5d049`; comprobar en staging.
- [ ] Un usuario Editor publica una edición nueva y una historia nueva sin ayuda, siguiendo el manual.
- [ ] `/productores/` muestra el catálogo con los 316 productores. La búsqueda y los filtros funcionan con y sin JavaScript, y el botón PAISSANA de Proyectos destacados lleva ahí. Probar en staging.
- [ ] Un Editor agrega, edita o despublica un productor y el catálogo se actualiza.
- [ ] El seed es idempotente: correrlo dos veces deja 316 productores, una edición y una historia.
- [ ] `apps/wp-fse/bin/check` en verde, con e2e de los bloques nuevos.
- [ ] El manual está en Drive y el usuario Editor existe en producción, con la clave entregada aparte.

## Etapas y agentes

Cada etapa necesita aprobación antes de construirse. Las reglas de delegación están en [entorno-desarrollo](../entorno-desarrollo.md#agentes): una sola ventana de Orca, paneles divididos, un brief por agente con archivos asignados que no se solapan, y solo el Claude principal hace commit. Los agentes no hacen push ni levantan o bajan docker.

Reparto (indicación de William, 2026-11-19): el Claude principal **solo orquesta**; el desarrollo y las pruebas van a subagentes Sonnet y Opus; la revisión a AGY. **Codex y Grok ya no se usan** (Grok no llegó a entregar ningún archivo; su CSS pasó a subagentes Sonnet).

Rutas: los JSON del sitio FSE están en `apps/wp-fse/scf-json/` (no en `apps/wordpress/scf-json/`, que es del headless); `seed/` en `apps/wordpress/seed/`; `blocks/`, `inc/` y `templates/` en el tema `apps/wordpress/themes/lapaz/`; el MU-plugin del catálogo en `apps/wp-fse/mu-plugins/lapaz-catalogo.php`; `tests/` en `apps/wp-fse/tests/e2e/`.

| # | Etapa | Quién | Archivos | Depende de |
|---|---|---|---|---|
| 0 | Base: `raw/` en `.gitignore` y commit de la documentación | Claude | `.gitignore`, `wiki/` | — |
| 1 | Modelo: tipos `boletin`, `productor` e `historia`, taxonomías, grupos de campos (incluido el molde Artículo compartido) y [contrato](boletin-catalogo-fcp/contrato.md) | Claude | `apps/wp-fse/scf-json/` | 0 |
| 2a | Boletín: bloque `lapaz/boletin`, plantillas, valor inicial de una edición nueva | subagente Sonnet | `blocks/boletin/{block.json,render.php}`, `inc/boletin.php`, `templates/*boletin*` | 1 |
| 2b | CSS de los cinco bloques, con el estilo del sitio actual | subagentes Sonnet | `blocks/*/*.css` | contrato de 1 |
| 3a | Catálogo: prueba del módulo ES sin build, bloque `lapaz/catalogo`, texto de búsqueda, página `/productores/`, enlace del botón PAISSANA | subagente Opus | `blocks/catalogo/{block.json,render.php,view.js}`, `inc/catalogo.php`, `templates/page-productores.html`, `blocks/paisana-hero/render.php` | 1 |
| 4 | Historia del mes: bloque `lapaz/historia` y tarjeta del destacado | subagente Sonnet | `blocks/historia/{block.json,render.php,view.js}`, `inc/historia.php` | 1 |
| 5 | Seed: productores a texto legible, transcripción de la edición 02 y de la historia de Asocafé, y `seed.php` con taxonomías y campos flexibles | subagente Sonnet | `seed/` | 1 |
| 6 | Pruebas: e2e `boletin.mjs`, `catalogo.mjs` e `historia.mjs`, idempotencia del seed, `bin/check` | subagente Sonnet | `tests/e2e/` | escribe contra los criterios desde 1 y corre al cerrar 2 a 5 |
| 7 | Revisión independiente: buenas prácticas, accesibilidad, seguridad de los parámetros, que no haya secretos en el diff | **AGY** (solo lectura) | informe en el scratchpad | 2 a 5 |
| 8 | Manual: borrador y Google Doc con capturas en el Drive de William | subagente Sonnet, Claude | scratchpad, Drive | 2 a 5 |
| 9 | PR, staging, merge y deploy; seed en producción y usuario Editor | Claude, con aprobación | — | 6 en verde, 7 sin bloqueos |

En paralelo:
1. **Ola A:** Claude hace 1 y publica el contrato. Luego, a la vez: subagentes en 2a, 2b, 3a, 4 y 5, y otro escribe las pruebas de 6.
2. **Ola B:** el subagente de pruebas corre las suites y `bin/check`, AGY revisa (7) y un subagente escribe el borrador del manual (8).
3. **Ola C:** Claude hace el Google Doc y la etapa 9.

## Estado por etapa (2026-11-20)

Evidencia: commits de la rama (`git log lapazsipasa/main..HEAD`). Lo que no tiene commit figura como pendiente.

| # | Etapa | Estado | Commits | Pendiente |
|---|---|---|---|---|
| 0 | Base: `raw/` en `.gitignore` | hecha | `4ebb073` | — |
| 1 | Modelo: tipos, taxonomías y grupos | hecha | `87fa755` | — |
| 2a | Boletín: bloque `lapaz/boletin`, plantillas, 8 secciones iniciales | hecha | `40af34e`, `667cf01`, `e6eb811`, `e152e69`, `a0c2b63` | — |
| 2b | CSS de los bloques, tokens y hojas `editorial.css` + `lectura.css` | hecha | `1fc1301`, `00c7eaf`, `afa96b4`, `239dcc9`, `1d87a5b`, `35b50b3` | — |
| 3a | Catálogo: `lapaz/catalogo`, `/productores/`, búsqueda, botón PAISSANA | hecha | `854b66a`, `1e799ea` | Probar en staging. TODO: confirmar Lighthouse |
| 4 | Historia del mes: `lapaz/historia`, `lapaz/historia-destacada`, `/historias/` | hecha | `d423dc1`, `1e799ea`, `a0c2b63` | Probar en staging |
| 5 | Seed: 316 productores, edición 02, historia de Asocafé | hecha | `69ae2a0` | Carga por secciones en staging (ver [despliegue](../despliegue-fse.md#despliegue-de-boletín-y-catálogo-paissana)) |
| 6 | Pruebas: suites e2e `boletin`, `catalogo`, `historia`, `navegacion`, `rest`; CI | en rama; en verde el 2026-11-20 (`seguridad` 64 de 64 con la imagen reconstruida) | `c710ccf`, `cd68174`, `afa96b4`, `239dcc9`, `9bb6c80`, `e78e2f1`, `35b50b3` | Cerrar `bin/check`, `seguridad.mjs` (con la imagen reconstruida) y `seo.mjs`; ver [revisión 8](boletin-catalogo-fcp/revisiones-independientes.md#8-pruebas-automáticas) |
| 7 | Revisión independiente (AGY) | 23 revisiones y 4 tareas de redacción; la 28 en curso | `667cf01`, `e6eb811`, `e152e69`, `a0c2b63`, `3b2941d`, `ff6445d`, `239dcc9`, `f0f5f67`, `1d87a5b`, `e78e2f1`, `35b50b3` | Ver [revisiones independientes](boletin-catalogo-fcp/revisiones-independientes.md) |
| 8 | Manual para la persona externa | v3 con láminas emparejadas (13 parejas, 5 capturas) y texto final | `3e08f05` (v1), `2b7fe49` (v2), `0a529d3` y `7bb554f` (v3) | En curso: lectura completa del maquetado (revisión 39). El dueño lo sube a su Drive como documento de Google. Usuario Editor pendiente de datos del Fondo |
| 9 | PR, staging, merge, deploy, seed en producción y usuario Editor | pendiente | — | Aprobación de William |

Extras de la rama, fuera de la lista original:

| Tarea | Estado | Commits |
|---|---|---|
| R1 responsive | hecha | `afa96b4` |
| R2 SEO y enlaces (propuesta) | documentada; plugin de SEO pendiente; parte resuelta (ver su [nota](boletin-catalogo-fcp/revision-seo-enlaces.md)) | `dcd0a81` |
| R3 navegación (propuesta) | aplicada en parte: menú, hero compacto, accesos y URL nuevas | `dcd0a81`, `2d5d049`, `0f25dc8`, `1e799ea` |
| R4 accesos en Inicio y Proyectos destacados | hecha | `872a85a`, `8347916` |
| Guía de estilos viva (solo local) | hecha | `f0de368` |
| Endurecimiento (API REST, Apache, PHP, CI, wiki sin datos de servidor) | hecho en el repo; pendiente en el servidor | `3b2941d`, `ff6445d` |
| Accesibilidad AA y rendimiento | hecha | `239dcc9` |

## Pendientes para cerrar

Lo que falta para pedir el PR. Nada de esto sale a producción sin aprobación de William.

- **Del repo y del trabajo:** cerrar las pruebas (T1 a T6), correr `bin/check` y `seo.mjs`, integrar The SEO Framework (elegido por William; sin probar), regenerar las bases visuales, manual del editor y su usuario Editor.
- **De decisión, del Fondo o del servidor:** [lista completa](boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor).
- **Para probar en staging:** [lista completa](boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-probar-en-staging).

## Revisiones y navegación (pedidas por William el 2026-11-19)

Nada de esto ni de lo anterior sale a producción hasta que William lo apruebe: sin push, PR ni deploy.

| # | Tarea | Quién | Entregable | Depende de |
|---|---|---|---|---|
| R1 | Revisión de responsive de las páginas nuevas y del menú con el enlace «Boletín», con sus arreglos de CSS | subagente Sonnet | [revision-responsive.md](boletin-catalogo-fcp/revision-responsive.md) | CSS unificado |
| R2 | Revisión general de SEO, URLs y enlaces de todo el sitio | subagente Sonnet | [revision-seo-enlaces.md](boletin-catalogo-fcp/revision-seo-enlaces.md) | — |
| R3 | Estructura del sitio y navegación: mapa actual, problemas y propuesta | subagente Opus | [navegacion.md](../navegacion.md) | — |
| R4 | Accesos desde las páginas existentes (`/` y `/proyectos-destacados/`) a boletín, catálogo e historias: dónde van los banners o botones, y su construcción en local | subagente Sonnet | [accesos-paginas-existentes.md](boletin-catalogo-fcp/accesos-paginas-existentes.md) | R3 |

- R1 a R3 corren a la vez. R2 y R3 solo leen y proponen; los cambios que propongan se aplican después, con aprobación.
- R4 espera a R3, porque dónde van los accesos depende de la navegación propuesta. Sus cambios tocan páginas que ya existían: van en commits aparte y con capturas de antes y después.
- La guía de estilos del sitio está en [guia-de-estilos.md](../guia-de-estilos.md).

## Flujo de ramas y GitHub

1. Rama `feat/boletin-catalogo-fcp`, creada desde `feat/wordpress-fse`. Lleva 34 commits sobre `lapazsipasa/main` (a 2026-11-20).
2. Un commit por etapa. Push a `lapazsipasa` (`lapazsipasa/-la-paz-si-pasa`, cuenta del cliente, de la que sale producción; `kashipu` es colaborador con escritura, sin admin). `origin` (`kashipu/la-paz-si-pasa`) es la copia personal de William.
3. PR contra `main` con enlace a esta spec. Revisión del Fondo en staging (`st.lapazsipasa.com`, TODO: confirmar que está arriba).
4. Squash merge con `bin/check` en verde y aprobación de William. Dokploy despliega `main`.
5. Después del deploy, en producción: correr `lapaz-setup` y el seed (carga los productores, la edición 02 y la historia) y crear el usuario Editor. El seed viaja con git, pero hay que correrlo: el deploy no carga contenido solo.

## Pendientes del Fondo

Ver la lista única en [revisiones independientes](boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor) y el borrador listo para enviar en [nota para el Fondo](boletin-catalogo-fcp/nota-para-el-fondo.md).

## Decisiones que abre

[decisions/boletin-catalogo-fcp.md](../decisions/boletin-catalogo-fcp.md): formulario por secciones para el boletín, catálogo en el servidor con taxonomías nativas, Interactivity API solo en el catálogo, y contenido inicial en el seed.
