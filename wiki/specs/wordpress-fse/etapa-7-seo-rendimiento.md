# Etapa 7: SEO y rendimiento

Estado: **hecha** (verificada: `bin/check` y su prueba e2e en verde) · 2026-11-08 · spec principal: [wordpress-fse.md](../wordpress-fse.md)

## Qué se construyó (`inc/seo.php`, port del `<head>` de `BaseLayout.astro`)

| Pieza | Cómo |
|---|---|
| Título | `document_title_parts` + separador `\|`. Portada: «La Paz Sí Pasa \| Fondo Colombia en Paz». Páginas: «Página \| La Paz Sí Pasa». Proyectos destacados: «PaisSana, proyectos destacados \| …». 404: «Página no encontrada \| …». Todo igual que en Astro |
| Descripción | **El extracto de la página**, editable (se activó `excerpt` en páginas). Sin extracto, los textos de Astro: portada, Proyectos destacados y 404 |
| Open Graph y Twitter | og:type/site_name/locale/url/title/description/image (1200×630 con alt), y `twitter:card summary_large_image`. La imagen es `og.jpg` del tema |
| canonical | Lo imprime el core (`rel_canonical`) en páginas |
| Íconos | `favicon.svg` y `apple-touch-icon.png` del tema, **solo si no hay "Ícono del sitio" en Ajustes**: el editor puede reemplazarlo |
| Sitemap | `/wp-sitemap.xml` solo con páginas (Inicio y Proyectos destacados). Sin usuarios, taxonomías ni entradas. Los CPT ya estaban fuera desde la etapa 2 |
| robots | **`noindex, nofollow` fuera de producción** (`wp_get_environment_type() !== 'production'`): un staging indexado le compite al sitio real. En producción queda indexable |
| Imágenes | `image_editor_output_format`: los JPEG que se suben generan sus tamaños en **WebP** |
| `<head>` liviano | Sin script ni CSS de emojis del core |
| Limpieza de la instalación | `lapaz-setup` borra "Hello world" y "Sample page", y desactiva los plugins que trae la imagen y no se usan (`ai`, los proveedores de IA, `hello`, `akismet`). AI se describe a sí mismo como experimental |

Ya existían de etapas anteriores: precarga del hero (LCP) y de Komet 300, CSS y JS por bloque solo donde se usan, `viewScript` diferido, imágenes con width y height, lazy fuera del primer pantallazo, y Plyr y fuentes desde el propio dominio.

## Limpieza de WordPress (mu-plugin `lapaz-limpieza.php` + imagen)

Primero se hizo el inventario de lo que WordPress imprime en cada página. Se quitó todo lo que el sitio no usa:

| Qué | Antes | Después |
|---|---|---|
| `global-styles` inline: el core imprimía sus presets por defecto (paleta, degradados, duotono, tamaños, espaciados, sombras, proporciones) aunque `theme.json` los ocultara | 17,5 KB por página | **9,5 KB** (`wp_theme_json_data_default`) |
| `<head>`: `generator` (versión de WP), RSD/EditURI, shortlink, `api.w.org`, oEmbed, feeds RSS; header `Link` | presentes | eliminados |
| HTML de la portada | 125 KB | 116 KB |
| XML-RPC | respondía 200 (WordPress lo "desactiva", pero PHP corría igual) | **403 en Apache** (`docker/apache/zz-lapaz-seguridad.conf`) |
| Versión en cabeceras | `Apache/2.4.69 (Debian)` y `X-Powered-By: PHP/8.3.36` | `Server: Apache`, sin `X-Powered-By` |
| Feeds `/feed/` | activos | 301 al inicio (no hay blog) |
| Comentarios y pingbacks | activos | desactivados en todos los tipos de contenido y como opción por defecto |
| Admin | Entradas, Comentarios, noticias de WordPress, borrador rápido, panel de bienvenida | ocultos: el editor solo ve lo que se usa |
| Plugins `ai`, proveedores de IA, `hello` y `akismet`; temas Twenty* | instalados en el volumen | **borrados** por `lapaz-setup` (desactivados igual se quedaban en disco y había que actualizarlos) |

**Se queda a propósito:**
- el JS de `core/navigation` (overlay del menú);
- el skip-link (accesibilidad);
- `wp-block-library` (4 KB de estilos base de los bloques);
- la API REST, porque la usa el editor de bloques.

**Hallazgo:** el `security.conf` de Debian se carga después de cualquier `.conf` propio y fija `ServerTokens OS`. Por eso el archivo propio se llama `zz-…`.

## Revisión de seguridad (2026-11-08)

Se revisaron el tema, los mu-plugins y la imagen.

**Hallazgos corregidos:**

| # | Hallazgo | Riesgo | Arreglo | Verificado |
|---|---|---|---|---|
| 1 | `/wp-json/wp/v2/users` y `?author=N` revelaban los usuarios (el admin se llama `admin`) | Alto | `lapaz-seguridad.php`: el endpoint solo para usuarios con sesión; archivos de autor con 301 al inicio | 404 / 301 |
| 2 | Un `.php` en `wp-content/uploads` se ejecutaría | Alto | Apache: `Require all denied` para php/phtml/phar en uploads | 403 |
| 3 | Un admin comprometido podía instalar plugins | Medio | `DISALLOW_FILE_MODS` solo en producción: allí todo viene en la imagen | activo con `WP_ENVIRONMENT_TYPE=production` |
| 4 | Sin cabeceras de seguridad | Medio | `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` (con `a2enmod headers`) | presentes |
| 5 | `render.php` y los patrones se podían pedir por URL; el error mostraba rutas | Bajo | `defined( 'ABSPATH' ) \|\| exit;` en todos | respuesta vacía |
| 6 | Las definiciones de campos `scf-json*` se podían descargar | Bajo | Apache: denegado | 403 |
| 7 | `og:url` repetía la query string de la petición en páginas no singulares | Bajo, ya escapado | URL limpia (`home_url( '/' )`) | — |

**Revisado sin hallazgos:**
- **Escapes:** todas las salidas pasan por `esc_html`, `esc_attr` o `esc_url`. Cada `phpcs:ignore` es de una función del core que ya escapa (`get_block_wrapper_attributes`, `wp_get_attachment_image`), de `lapaz_video_thumb()`, que escapa por dentro, o de SVG fijos.
- **JS:** `innerHTML` solo con SVG constantes; el contenido dinámico va con `textContent`.
- **URLs de video:** pasan por `esc_url`, que descarta `javascript:`, y los IDs de YouTube se validan con un regex.
- **Datos:** el JSON de `data-relatos` va escapado y solo se pinta contenido publicado.
- **Formularios:** no hay formularios propios (no hacen falta nonces).

**Pendiente, se decide en staging o con el cliente:**
- **Usuario admin:** que no se llame `admin` en producción (`WP_ADMIN_USER` en las variables de Dokploy).
- **Límite de intentos de login:** middleware de rate limit de Traefik en Dokploy o un plugin con versión fija.
- **HSTS:** lo pone Traefik, que termina el TLS.
- **CSP:** necesita una política a medida para el editor de bloques y los embeds de YouTube. Se puede empezar en `Content-Security-Policy-Report-Only`.

## Caché de página: decisión

- **Medición local, sin caché:** TTFB de 50–80 ms en `/` y `/proyectos-destacados/`.
- **Decisión:** no se agrega un plugin de caché ahora. Se mide el TTFB en el servidor de staging (Dokploy, etapa 8). Si pasa de unos 200 ms, se agrega **WP Super Cache** en modo simple, con versión fija en la imagen y `wp-content/cache` en el volumen. Es lo que recomienda [buenas prácticas](../../buenas-practicas-wordpress.md#6-rendimiento-y-seo).

## Smoke

| Verificación | Resultado |
|---|---|
| Títulos | Correctos en `/` y `/proyectos-destacados/` |
| Etiquetas | description, og y twitter presentes |
| canonical | Una sola etiqueta |
| Sitemap | 2 URLs |
| Emojis | 0 referencias |
| robots | `noindex, nofollow` en local |

## Pendiente (Codex)

- `tests/e2e/seo.mjs`, que pruebe:
  - título, description, og y twitter por página;
  - el extracto de una página reemplaza la description;
  - una sola etiqueta canonical;
  - el sitemap solo con páginas;
  - noindex fuera de producción;
  - favicon presente;
  - sin emojis.
- Con `compose.yaml` y `WP_ENVIRONMENT_TYPE=production`: sin noindex.
- `bin/check`.

## Lighthouse en el staging (2026-11-09, móvil, mediana de 3 corridas)

| Página | Antes | Después | Qué se hizo |
|---|---|---|---|
| Portada | 82 (1 corrida) | **91–98** | Todo el CSS incrustado (antes había hojas externas que bloqueaban el render: el hero se descargaba en 0,3 s y tardaba 1,8 s más en pintarse), `preconnect` a `i.ytimg.com`, banner a la medida, la primera foto de Retratos sin `fetchpriority` alto (competía con el hero) |
| Proyectos destacados | — | **88–91** | Lo mismo, más `content-visibility: auto` en las secciones bajo el primer pantallazo (1.000+ nodos; las ferias quedan a unos 10.000 px) |

- **Accesibilidad 94–96, Best Practices 96–100.** CLS 0 y TBT 0 en todas las corridas.
- **SEO 69 es esperado en staging:** la única falla es `is-crawlable`, por el `noindex` puesto a propósito. En producción desaparece.
- **Variación:** la red y el servidor hacen que el puntaje varíe ±7 entre corridas. Por eso se mide la mediana de 3, y nunca contra `astro dev`.

**Pendiente:**
- ~~Caché de página~~ **hecho (2026-11-09):** WP Super Cache 3.1.5, con versión fija y sha256 en la imagen.
  - **Cuándo está activa:** solo con `WP_CACHE=true` (en Dokploy). En local y en CI queda apagada, porque las pruebas editan contenido.
  - **Configuración:** `lapaz-setup` lo activa en modo simple (PHP, sin tocar `.htaccess`), sin caché para usuarios con sesión y con `wp_cache_slash_check=1`. `WP_CACHE` y `WPCACHEHOME` se definen en el compose, así el plugin no edita `wp-config.php`.
  - **Medido en local:** TTFB de 50–65 ms a **1–2 ms**. Al editar un retrato, la caché se vacía y la página se regenera.
  - **Hallazgo:** sin `wp_cache_slash_check=1` solo la portada salía de caché. El plugin ajusta esa opción al guardar su panel, que aquí no se usa.
- **Contraste del título «Actualidad»** sobre el fondo rosa: falla WCAG AA. **Decisión de William (2026-11-09): no se cambia**, se respeta el diseño.
- **Fondo de papel de Retratos en móvil:** se estira (`object-fit: fill`), igual que en Astro. Hace bajar Best Practices.
