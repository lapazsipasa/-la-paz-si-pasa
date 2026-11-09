# Buenas prácticas: tema de bloques de WordPress

Checklist para construir el tema `lapaz` (WP 7.1, PHP 8.3, SCF, Dokploy). Está basada en la documentación oficial, consultada el 2026-11-08. Cada regla enlaza a su fuente. Contexto: [spec wordpress-fse](specs/wordpress-fse.md) · [decisiones](decisions/wordpress-fse-arquitectura.md).

## 1. Estructura del tema

- Lo mínimo para ser tema de bloques: `style.css` (cabecera) y `templates/index.html`. Además se esperan `theme.json`, `parts/` y `patterns/`. [Theme structure](https://developer.wordpress.org/themes/core-concepts/theme-structure/)
- Cabecera de `style.css` con Theme Name, Description, Version, Author, Text Domain `lapaz`, Requires at least, Tested up to, Requires PHP y License. [Main stylesheet](https://developer.wordpress.org/themes/core-concepts/main-stylesheet/)
- Prefijo `lapaz_` en funciones, opciones y handles. Nada global sin prefijo (lo revisa PHPCS).

## 2. theme.json primero

- `"version": 3` y `"$schema": "https://schemas.wp.org/trunk/theme.json"`. [theme.json v3](https://developer.wordpress.org/block-editor/reference-guides/theme-json-reference/theme-json-living/)
- Colores, fuentes, espaciados y anchos se definen como presets. El CSS consume `var(--wp--preset--…)`. En `assets/css/base.css`, los tokens heredados de Astro son alias de esos presets, así cada valor vive en un solo lugar.
- **Fuentes locales:** `fontFace` con `src: "file:./assets/fonts/…"`. Acepta `ascentOverride`, `descentOverride` y `lineGapOverride`. El `fontDisplay` por defecto es `fallback`, así que se declara `swap` explícitamente. WordPress no precarga fuentes; la principal se precarga a mano en `wp_head`.
- **Espaciados con slugs fijos:** `spacingSizes`, con `spacingScale.steps: 0` para desactivar la escala generada.
- `settings.custom` genera `--wp--custom--<clave>`.
- **Plantillas propias de página:** `customTemplates: [{ name, title, postTypes }]`. La regla «Page Template» de SCF las reconoce.

## 3. Bloques dinámicos

- Cada bloque vive en `blocks/<nombre>/` con `block.json`, `render.php` y `style.css`, más `view.js` si tiene JS. [Registration](https://developer.wordpress.org/block-editor/getting-started/fundamentals/registration-of-a-block/)
- **Registro sin build:** un ciclo de `register_block_type( __DIR__ . '/blocks/<nombre>' )` en `init`. El manifiesto (`wp_register_block_types_from_metadata_collection`) solo conviene con `@wordpress/scripts`.
- **Solo PHP en el editor:** `"supports": { "autoRegister": true }` (WP 7.0+) muestra el bloque en el editor sin JS. [PHP-only blocks](https://make.wordpress.org/core/2026/03/03/php-only-block-registration/)
  - No admite InnerBlocks, controles de media ni rich text.
  - `postId` del contexto no llega en los re-renders del editor (Gutenberg #78619).
- **`render.php`:**
  - el elemento raíz lleva `get_block_wrapper_attributes()`;
  - el archivo se carga en cada instancia, así que no se declaran funciones dentro (van en `inc/helpers.php`).
- **JS:** `viewScript` (`file:./view.js`). Se carga con `defer` y solo donde está el bloque. `viewScriptModule` solo se usa con Interactivity API, que aquí no se usa. [Block metadata](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/)
- **CSS por bloque:** `style` (editor y sitio) o `viewStyle` (solo sitio). En temas de bloques se carga solo en las páginas que tienen el bloque, y si pesa menos de 40 KB va inline.
- **Bloques core** (como `core/navigation`): `wp_enqueue_block_style( 'core/navigation', [ handle, src, path ] )`. Su JS extra se encola desde el filtro `render_block_<bloque>`.
- **Clases que core copia a elementos internos:** `core/navigation` repite `className` en su `<ul>`. Los selectores se acotan al elemento (`nav.lapaz-nav-desktop`) y no se usan clases utilitarias como `container--wide` en el bloque.

## 4. Seguridad e i18n

- **Todo lo que se imprime se escapa** según el tipo: `esc_html`, `esc_attr`, `esc_url`, o `wp_kses_post` para HTML de confianza. [Escaping](https://developer.wordpress.org/apis/security/escaping/)
- **Textos traducibles:** van en PHP con el text domain `lapaz`. Las plantillas `.html` no admiten `__()`, así que el copy fijo va en patrones PHP (`patterns/`), que se insertan con `<!-- wp:pattern {"slug":"lapaz/…"} /-->`. [Patterns](https://developer.wordpress.org/themes/features/block-patterns/)
- **PHPCS con WPCS 3**, que revisa solo PHP:

  ```bash
  docker run --rm -v "$PWD":/app -w /app/apps/wp-fse composer:2 sh -c "composer install && vendor/bin/phpcs"
  ```

## 5. Contenido (SCF)

- CPT y campos se definen en JSON versionado (`apps/wordpress/scf-json/`), nunca solo desde el admin. Patrón: estándar Retratos de `docs/contenidos-qa.md`.
- **Leer campos:**
  - repeater y gallery: `get_field()` en `render.php`, porque no admiten Block Bindings;
  - valores simples: también pueden ir por Block Bindings (fuente `acf/field`). [SCF bindings](https://github.com/WordPress/secure-custom-fields/blob/trunk/includes/Blocks/Bindings.php)
- **CPT sin URL propia:** `public: false`, `publicly_queryable: false`, `show_ui: true`, `show_in_rest: true` (lo necesita el editor), `rewrite: false`. Con eso salen del sitemap y siguen disponibles para `WP_Query`. [register_post_type](https://developer.wordpress.org/reference/functions/register_post_type/)

## 6. Rendimiento y SEO

- **Imágenes:** `wp_get_attachment_image()` genera srcset, `decoding=async` y `loading`/`fetchpriority` según su posición. Para el hero se pasa `fetchpriority => high` y nunca `lazy`. [Loading optimization](https://developer.wordpress.org/reference/functions/wp_get_loading_optimization_attributes/)
- **WebP:** filtro `image_editor_output_format` (`image/jpeg` → `image/webp`) o el plugin Modern Image Formats.
- **Speculative loading:** viene activo en core desde 6.8. Se ajusta con `wp_speculation_rules_configuration`.
- **SEO:**
  - sitemap de core; se filtra con `wp_sitemaps_post_types`;
  - robots con `wp_robots`;
  - el sitio público no lleva `noindex` (en el headless sí, por `headless-redirect.php`).
- **Caché de página:** se decide en la etapa 6 según la medición. Candidato: WP Super Cache en modo simple, con `wp-content` en volumen.

## 7. Despliegue en Dokploy

- **Un solo `compose.yaml` para producción:** sin `ports`, con volúmenes con nombre, healthchecks y límites de memoria. Lo local va en `compose.override.yaml`, que Dokploy no lee porque usa la ruta explícita del compose.
- **Código horneado en la imagen y datos en volúmenes:** tema, plugins fijos y mu-plugins van en la imagen (`/opt/wp-content`) y el entrypoint los copia al volumen al arrancar. Así se evita el fallo silencioso de los bind mounts (`f261ba3`).
- **Versiones fijas** en imágenes, wp-cli (con sha256) y plugins.
- **Secretos solo en las variables de Dokploy.** `.env.example` sin valores reales, y `.env` ignorado.
- **Un solo comando de setup idempotente:**

  ```bash
  docker compose exec -u www-data cms lapaz-setup
  ```

- **Detrás del proxy:** `HTTPS` desde `X-Forwarded-Proto`, y `FORCE_SSL_ADMIN` solo con URL https.
- **Respaldos** de la base y del volumen con la función de backups de Dokploy.

## 8. Calidad determinista

- **Regla:** sin `apps/wp-fse/bin/check` en verde no se cierra una etapa ni se abre un PR. La CI lo repite.
- **Las reglas se endurecen, nunca se relajan para que pase un cambio.** Si una regla estorba, se discute y se documenta la excepción en el archivo de configuración, con el porqué.
- **Los tests tienen que poder fallar.** Antes de dar por buena una regla nueva, se rompe a propósito y se confirma que falla. Para la lógica (etapa 4), mutation testing con Infection.
- **Archivos pequeños:** cuando un archivo pasa el límite de líneas, se divide. No se sube el límite.

### Lecciones que ya son regla (etapa 2)

- **Prueba visual con los mismos datos:** Astro apuntado al WordPress FSE (`WORDPRESS_URL=http://localhost:8090`) antes de capturar bases.
- **Cada `viewScript` lleva `view.asset.php`** con `filemtime()` como versión.
- **Datos de SCF siempre por los helpers tipados** de `inc/blocks.php`, nunca `get_field()` suelto en `render.php`.
- **Cambios a los CPT compartidos con el headless** se hacen por filtro en `lapaz-core.php`, no en `scf-json/`.
- **Un solo agente corre `bin/check` a la vez.**
- **Lo que WordPress trae y el sitio no usa se quita en `lapaz-limpieza.php`, no en el tema:** metadatos de descubrimiento, comentarios, feeds, XML-RPC y presets por defecto de `theme.json`. Antes de quitar algo, se hace el inventario de lo que imprime la página.
- **Plugins y temas que no se usan se borran, no se desactivan.**
- **Seguridad en capas:** lo que puede bloquearse antes de WordPress va en la imagen (Apache: uploads sin PHP, xmlrpc, scf-json, cabeceras; wp-config: `DISALLOW_FILE_EDIT` y `DISALLOW_FILE_MODS` en producción). Lo que depende de WordPress va en `lapaz-seguridad.php` (sin enumeración de usuarios).
- **Todo `render.php` y todo patrón empiezan con `defined( 'ABSPATH' ) || exit;`.**
- **No se expone ninguna versión:** ni la de WordPress en el `<head>`, ni la de Apache ni la de PHP en las cabeceras.

## 9. Kit de desarrollo

| Herramienta | Uso | Estado |
|---|---|---|
| wp-cli dentro de la imagen (`docker compose exec -u www-data cms wp …`) | setup, menús, contenido | en uso |
| Query Monitor | errores de PHP, consultas, assets por página | solo en local (`lapaz-setup`) |
| Create Block Theme | pasar al tema lo editado en el Editor del sitio. Probado hasta 6.9, así que hay que vigilarlo | solo en local |
| `apps/wp-fse/bin/check` | 13 capas de análisis estático; ver la [etapa 1.5](specs/wordpress-fse/etapa-1-5-calidad.md) | en uso, también en CI |
| `tests/e2e/navbar.mjs` (CDP) | comportamiento y comparación de píxeles con Astro | en uso |
| Skills oficiales `WordPress/agent-skills` (wp-block-development, wp-block-themes, wp-performance, wp-wpcli-and-ops, wp-project-triage) | guía para agentes | instaladas en `.claude/skills/` (no versionado) |

Se descartaron, según lo investigado: mcp-adapter (anterior a 1.0), Playground MCP, wp-env (duplica Docker), Debug Bar y el plugin de Studio de Automattic.
