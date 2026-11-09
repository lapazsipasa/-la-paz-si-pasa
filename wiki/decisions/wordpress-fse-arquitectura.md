# Decisión: arquitectura del tema FSE

Fecha: 2026-11-08 · Decide: William Moreno · Contexto: [spec wordpress-fse](../specs/wordpress-fse.md)

Estas decisiones son caras de revertir. Cada una dice qué se decidió, por qué y qué la haría cambiar.

## 1. Prueba en un WordPress nuevo, en paralelo al headless

- **Qué:** `apps/wp-fse/` es un proyecto de compose aparte (`name: lapaz-fse`, puerto 8090, volúmenes propios). El headless, Astro y producción no se tocan hasta el cambio a producción (etapa 8).
- **Por qué:** es una prueba de concepto y no se puede perder lo que ya funciona.
- **Cambiaría si** la prueba se aprueba. Entonces este stack pasa a ser el de producción. El headless se retira recién en la etapa 9, con aprobación explícita de William (ver decisión 7).

## 2. Un solo compose y una sola imagen para local y Dokploy

- **Qué:**
  - `compose.yaml` es el de producción: sin puertos, con volúmenes con nombre y healthchecks.
  - `compose.override.yaml` es solo local (puerto y bind mount del tema), y Dokploy no lo lee.
  - El tema, y después los plugins con versión fija y el mu-plugin, van horneados en la imagen. El entrypoint los copia al volumen.
- **Por qué:** es la lección de `f261ba3`. Los bind mounts quedaban colgando en cada deploy de Dokploy y fallaban sin avisar. Así, cambiar el código cambia la imagen y Dokploy recrea el contenedor.

## 3. Menú con el bloque nativo `core/navigation`

- **Qué:** los menús se guardan como `wp_navigation` y se editan en el Editor del sitio. El CSS de Nav, NavMenu y NavMenuDesktop se reutiliza sobre las clases nativas, y su JS se descarta.
- **Por qué:**
  - es lo que recomienda la documentación oficial para temas de bloques;
  - es el único camino en que el editor cambia el menú sin desarrollo;
  - el JS nativo ya resuelve foco, Esc y bloqueo del scroll.
- **Cambiaría si** el diseño no se logra con CSS. La alternativa es el bloque `lapaz/nav`, que lee el mismo `wp_navigation`.

## 4. Bloques dentro del tema, solo PHP y sin build

- **Qué:**
  - Cada componente pasa a `blocks/<nombre>/` con `block.json`, `render.php` y `style.css`, más `view.js` si tiene JS.
  - Se registran en un ciclo con `register_block_type()` y `supports.autoRegister` (WP 7.0+), así que no hacen falta editor JS ni `@wordpress/scripts`.
  - El contenido se edita en los CPT y en los campos SCF, no dentro del bloque.
- **Por qué:**
  - son bloques exclusivos de este sitio, y meterlos en el tema deja una pieza menos que desplegar;
  - sin build no hay toolchain de Node que mantener;
  - `autoRegister` muestra el bloque en el editor con vista previa del servidor.
- **Límites conocidos:**
  - `autoRegister` no admite InnerBlocks ni controles de media;
  - `uses_context` (`postId`) no llega en los re-renders del editor (Gutenberg #78619). Los bloques leen la portada o la página por slug, no por contexto.
- **Cambiaría si** un bloque necesita edición rica en el editor. En ese caso se agrega `editorScript` con los globals `wp.*`, todavía sin build.

## 5. JS vanilla con `viewScript`, sin Interactivity API

- **Qué:** el `<script>` de cada componente se copia a `view.js`. `astro:page-load` pasa a ejecución directa (`viewScript` se carga con `defer` y solo donde está el bloque) y se quitan los tipos de TypeScript.
- **Por qué:**
  - el JS ya es vanilla y está probado;
  - la Interactivity API obliga a reescribirlo todo con directivas `data-wp-*` y no aporta nada aquí.
- **Cambiaría si** varios bloques necesitan compartir estado entre sí.

## 6. Repeaters y galerías con `get_field()` en `render.php`

- **Qué:** los campos SCF se leen en PHP. Block Bindings solo se usará, si acaso, para valores simples.
- **Por qué:** los campos repeater y gallery de SCF declaran `bindings => false`, así que no se pueden enlazar.

## 7. El headless sigue en pie hasta el final

- **Qué:** `apps/frontend/`, `docker/astro/`, el stack headless (`docker-compose.yml` y `compose.prod.yaml` de la raíz) y sus mu-plugins **no se retiran** hasta que el sitio FSE esté en producción y William lo apruebe explícitamente. Staging y el cambio de dominio se hacen con el headless funcionando en paralelo, como respaldo.
- **Por qué:** decisión de William (2026-11-08). Si algo falla después del cambio, se vuelve al headless moviendo el dominio otra vez.
- **Cambiaría si** William da por cerrada la migración. Recién ahí se ejecuta la etapa de limpieza.
