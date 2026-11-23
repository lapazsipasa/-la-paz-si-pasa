# Contrato entre piezas: boletín, catálogo e historias

Estado: **vigente** · actualizado 2026-11-20 (construido en la rama `feat/boletin-catalogo-fcp`, sin desplegar) · parte de [boletin-catalogo-fcp](../boletin-catalogo-fcp.md)

Lo que cada pieza puede dar por hecho de las demás. La fuente de verdad de los campos son los JSON de `apps/wp-fse/scf-json/`.

## Regla de estilo

Las secciones nuevas mantienen el estilo del sitio actual: colores, tipografías, escala, botones, contenedores. El prototipo del Fondo aporta solo estructura, retícula y contenido.

Criterio visual que dio William el 2026-11-19, al ver la primera versión del boletín:

- **Monique Round** solo en destacados cortos en mayúsculas: nombre de sección, numeración, etiquetas y botones, en Regular (400). No funciona en títulos grandes ni en minúsculas. El tema carga Regular y Bold (700); el Bold lo usan los encabezados de las páginas que ya existían.
- **Títulos y subtítulos** en Komet Heavy (800), o Bold (700) en jerarquías menores. Komet Black (900) no se usa.
- **Priman los fondos oscuros** (el azul del sitio) con texto blanco, para que el celeste destaque como acento.
- **Pocos colores a la vez.** Verde y naranja solo como acento puntual, nunca compitiendo con celeste y azul en un mismo bloque.
- Las páginas que ya existían (`/` y `/proyectos-destacados/`) no cambian.

## Modelo

Los JSON van en `apps/wp-fse/scf-json/` y no en `apps/wordpress/scf-json/`: son exclusivos del sitio FSE y el headless no los necesita.

| Tipo | URL | Campos |
|---|---|---|
| `boletin` | `/boletin/` (archivo) y `/boletin/<slug>/` | `group_boletin.json` |
| `productor` | sin URL | `group_productor.json` y 5 taxonomías |
| `historia` | `/historias/<slug>/` (archivo en `/historias/`) | `group_historia.json` |

Taxonomías de `productor`, todas sin URL ni `query_var`: `departamento`, `categoria_productor`, `tiempo_operacion`, `etnia`, `poblacion`.

### `boletin`

- Edición: `numero`, `periodo`, `rotulo`, `indice_intro`, `creditos_foto` (un nombre por línea).
- Portada: `portada_titular`, `portada_sumario`, `portada_firma_nombre`, `portada_firma_cargo`, `portada_foto`, `portada_credito`.
- `secciones`: contenido flexible. `get_field( 'secciones' )` devuelve una lista de filas; cada fila trae `acf_fc_layout` con el molde.

Campos de toda fila: `nombre`, `antetitulo`, `indice_titulo`, `indice_imagen`, `indice_resumen`.

| Molde (`acf_fc_layout`) | Campos propios |
|---|---|
| `articulo` | los del molde Artículo, en la misma fila |
| `cifras` | `cifras` (filas: `numero`, `texto`), `nota` |
| `tarjetas` | `tarjetas` (filas: `etiqueta`, `color` azul/naranja/verde, `titulo`, `texto` con un párrafo por línea, `monto`, `monto_nota`) |
| `agenda` | `hitos` (filas: `cuando`, `titulo`, `texto`) |

### Molde Artículo (`group_articulo.json`)

`rotulo`, `rotulo_color` (azul/verde), `titulo`, `bajada`, `entradilla`, `cuerpo` (HTML del editor: `p`, `h3`, `blockquote` con frase y autor en dos párrafos), `apertura`, `apertura_credito`, `fotos` (filas: `imagen`, `formato` alto/panorama, `credito`; máximo 3), `ficha_titulo`, `ficha_texto`, `ficha_datos` (filas: `cifra`, `texto`), `ficha_clara`, `fotos_izquierda`.

- En el boletín se clona dentro de la fila (sin prefijo).
- Orden de la columna de medios: primera foto, ficha, demás fotos.
- La ficha se pinta solo si tiene título.

### `historia`

`lugar`, `antetitulo`, `resumen`, `foto`, `cifras` (filas: `numero`, `texto`; máximo 3), `portada_foto`, `portada_titulo`, `portada_subtitulo`, `ficha` (filas: `dato`, `valor`), `video_fuente` (ninguno/youtube/archivo/enlace), `video_youtube`, `video_archivo`, `video_enlace`, `video_poster`, `video_antetitulo`, `cronica_antetitulo`, `cronica` (grupo propio con `bajada`, `entradilla`, `cuerpo`, `fotos` y `ficha_datos`, sin clonar el molde Artículo), `cronica_fuente`, `galeria`.

En la galería, el pie de cada foto es la leyenda del adjunto y el crédito es su descripción.

### `productor`

`municipio`, `productos` (uno por línea), `enlace` (no se muestra). `post_content` guarda el texto de búsqueda generado al guardar.

Todos los campos de imagen y archivo devuelven el ID del adjunto.

## Bloques

| Bloque | Dónde | Qué pinta |
|---|---|---|
| `lapaz/boletin` | `single-boletin.html`, `archive-boletin.html` | una edición completa |
| `lapaz/boletin-destacado` | `front-page.html` | tarjeta del último boletín (acceso) |
| `lapaz/catalogo-portada` | `page-productores.html` | hero con las tres cifras |
| `lapaz/catalogo` | `page-productores.html` | buscador, resultados y distribución |
| `lapaz/catalogo-banner` | `front-page.html`, `page-proyectos-destacados.html` | banner de acceso al catálogo (no va en `/productores/`) |
| `lapaz/historia-destacada` | `page-productores.html`, `front-page.html`, `page-proyectos-destacados.html` | tarjeta de la historia más reciente. Atributo `enlaceCatalogo` (booleano): muestra el enlace al catálogo; en Inicio y Proyectos destacados va sin él |
| `lapaz/historia` | `single-historia.html`, `archive-historia.html` | una historia completa (en `/historias/`, la más reciente y «Otras historias») |
| `lapaz/guia-estilos` | `page-guia-de-estilos.html` | guía de estilos viva; la página solo existe en local |

Las páginas interiores nuevas (`/boletin/`, `/productores/`, `/historias/`) usan `lapaz/hero` con la clase `is-style-compacto` (hero compacto). `/productores/` lleva además la clase `paisana-page--catalogo` en la página.

## Marcado

Cada `render.php` conserva las clases y la anidación del prototipo dentro de su `<div class="wp-block-lapaz-…">`, con estos cambios:

**Comunes**

- No hay `topbar` ni `footer` del prototipo: el sitio ya tiene los suyos.
- Títulos de tarjetas, hitos y ficha: `h3`.
- Sin estilos en línea. Fondo de sección: clase `papel`. Foto panorámica de apertura: `figure.apertura`.
- Los `id` son solo anclas. El CSS selecciona por clase.

**Boletín**

- Franja: `div.franja > div.wrap > span.rotulo + span.meta`.
- `div.portada`, `nav.nav`, `section.indice` con `a.tema`, como el prototipo.
- Cada sección: `section.seccion`, más `cifras` o `agenda` según el molde y `papel` en las alternas. Anclas: `seccion-1`, `seccion-2`…
- Artículo: `div.articulo` (con `invertido` si `fotos_izquierda`), `div.cuerpo` con `.rotulo-seccion` (más `verde` o `azul`), `.titulo-art`, `.bajada`, `.entradilla` y el HTML del cuerpo sin clases. `div.media` con `figure` (`img.alto` o `img.panorama`, `figcaption.credito`) y `div.ficha` (más `clara`).
- Pie: `div.pie > div.wrap > div.pie-datos + div.creditos`.
- Ediciones anteriores: `section.anteriores > div.wrap > h2 + ul > li > a`.

**Catálogo**

- `form.filtros` (método GET) con `label.busca > input[type=search]`, dos `select` y `button.btn.buscar`.
- Categorías: `div.chips > label.chip > input[type=checkbox] + span`.
- Con JavaScript, la raíz del bloque recibe `js-activo`. Mientras navega, el contenedor de resultados recibe `cargando`.
- `p.conteo`, `div.grid > article.card` (`h3`, `.ubic`, `ul > li`, `.tags > .tag`, `.tag.et`), `div.vacio`, `a.btn.mas`.
- Distribución: `section.distribucion.papel` con `.dist`, `.barras` y `a.barra` (`.nm`, `.pista > .fill` con el ancho en línea, `.v`). Activa: `on`.

**Historia**

- `.volver-top`, `.port-prod` (`.sobre`, `.et`, `h1`, `.sub`), `dl.ficha-tec`.
- Video: `.video-wrap` con `img.poster` y `button.play` o `a.play` (`.circ`, `.txt`).
- Crónica: `.cronica > .texto` (`.bajada`, `.entradilla`, cuerpo sin clases, `.fuente`) y `aside` (`figure`, `dl.ficha-tec.una-columna`).
- Galería: `.galeria > figure > button > img` y `figcaption` con `.credito`. `.lightbox` (`.cerrar`, `img`, `p`), visible con `on`.

## Catálogo: parámetros de la URL

| Parámetro | Valor |
|---|---|
| `buscar` | texto; se usa con 2 caracteres o más |
| `departamento` | slug de un término |
| `categoria[]` | slugs; basta que coincida uno |
| `tiempo` | slug de un término |
| `ver` | cuántas tarjetas; 36 por defecto, en pasos de 36 |

## Archivos por pieza

Rutas del tema relativas a `apps/wordpress/themes/lapaz/`.

| Pieza | Archivos |
|---|---|
| Modelo | `apps/wp-fse/scf-json/` |
| Boletín | `blocks/boletin/` y `blocks/boletin-destacado/` (menos los `.css`), `inc/boletin.php`, `templates/single-boletin.html`, `templates/archive-boletin.html`, `inc/seo.php` |
| Catálogo | `blocks/catalogo/` y `blocks/catalogo-portada/` (menos los `.css`), `inc/catalogo.php`, `templates/page-productores.html`, `blocks/paisana-hero/render.php`, `apps/wp-fse/mu-plugins/lapaz-catalogo.php` |
| Historia | `blocks/historia/` y `blocks/historia-destacada/` (menos los `.css`), `inc/historia.php`, `templates/single-historia.html`, `templates/archive-historia.html` |
| Accesos | `blocks/catalogo-banner/`, `blocks/boletin-destacado/`, `inc/accesos.php`, `templates/front-page.html`, `templates/page-proyectos-destacados.html` |
| Navegación | `inc/navegacion.php` (estado activo del menú), `wp_navigation` en `apps/wp-fse/docker/lapaz-setup` |
| CSS | los `.css` de los bloques, y las hojas compartidas `assets/css/editorial.css` y `assets/css/lectura.css` (registradas en `inc/blocks.php`) |
| Guía de estilos | `blocks/guia-estilos/`, `inc/guia-estilos.php`, `inc/guia-estilos-contraste.php`, `templates/page-guia-de-estilos.html` |
| Seed | `apps/wordpress/seed/` |
| Pruebas | `apps/wp-fse/tests/e2e/` |
| Integración | `functions.php` (carga `inc/*.php`), `apps/wp-fse/docker/lapaz-setup`, `apps/wp-fse/compose.override.yaml`, `wiki/` |
