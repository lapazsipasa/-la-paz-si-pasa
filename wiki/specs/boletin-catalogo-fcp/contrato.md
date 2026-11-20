# Contrato entre piezas: boletín, catálogo e historias

Estado: **vigente** · 2026-11-19 · parte de [boletin-catalogo-fcp](../boletin-catalogo-fcp.md)

Lo que cada pieza puede dar por hecho de las demás. La fuente de verdad de los campos son los JSON de `apps/wp-fse/scf-json/`.

## Regla de estilo

Las secciones nuevas mantienen el estilo del sitio actual: colores, tipografías, escala, botones, contenedores. El prototipo del Fondo aporta solo estructura, retícula y contenido.

## Modelo

Los JSON van en `apps/wp-fse/scf-json/` y no en `apps/wordpress/scf-json/`: son exclusivos del sitio FSE y el headless no los necesita.

| Tipo | URL | Campos |
|---|---|---|
| `boletin` | `/boletin/` (archivo) y `/boletin/<slug>/` | `group_boletin.json` |
| `productor` | sin URL | `group_productor.json` y 5 taxonomías |
| `historia` | `/paissana/historias/<slug>/` | `group_historia.json` |

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

`rotulo`, `rotulo_color` (naranja/verde/azul), `titulo`, `bajada`, `entradilla`, `cuerpo` (HTML del editor: `p`, `h3`, `blockquote` con frase y autor en dos párrafos), `apertura`, `apertura_credito`, `fotos` (filas: `imagen`, `formato` alto/panorama, `credito`; máximo 3), `ficha_titulo`, `ficha_texto`, `ficha_datos` (filas: `cifra`, `texto`), `ficha_clara`, `fotos_izquierda`.

- En el boletín se clona dentro de la fila (sin prefijo).
- En la historia se clona como grupo: `get_field( 'cronica' )` devuelve un array con esas mismas claves.
- Orden de la columna de medios: primera foto, ficha, demás fotos.
- La ficha se pinta solo si tiene título.

### `historia`

`lugar`, `antetitulo`, `resumen`, `foto`, `cifras` (filas: `numero`, `texto`; máximo 3), `portada_foto`, `portada_titulo`, `portada_subtitulo`, `ficha` (filas: `dato`, `valor`), `video_fuente` (ninguno/youtube/archivo/enlace), `video_youtube`, `video_archivo`, `video_enlace`, `video_poster`, `video_antetitulo`, `cronica_antetitulo`, `cronica` (molde Artículo), `cronica_fuente`, `galeria`.

En la galería, el pie de cada foto es la leyenda del adjunto y el crédito es su descripción.

### `productor`

`municipio`, `productos` (uno por línea), `enlace` (no se muestra). `post_content` guarda el texto de búsqueda generado al guardar.

Todos los campos de imagen y archivo devuelven el ID del adjunto.

## Bloques

| Bloque | Dónde | Qué pinta |
|---|---|---|
| `lapaz/boletin` | `single-boletin.html`, `archive-boletin.html` | una edición completa |
| `lapaz/catalogo-portada` | `page-paissana.html` | hero con las tres cifras |
| `lapaz/historia-destacada` | `page-paissana.html` | tarjeta de la historia más reciente |
| `lapaz/catalogo` | `page-paissana.html` | buscador, resultados y distribución |
| `lapaz/historia` | `single-historia.html` | una historia completa |

## Marcado

Cada `render.php` conserva las clases y la anidación del prototipo dentro de su `<div class="wp-block-lapaz-…">`, con estos cambios:

**Comunes**

- No hay `topbar` ni `footer` del prototipo: el sitio ya tiene los suyos.
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
- `p.conteo`, `div.grid > article.card` (`h4`, `.ubic`, `ul > li`, `.tags > .tag`, `.tag.et`), `div.vacio`, `a.btn.mas`.
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
| Boletín | `blocks/boletin/` (menos los `.css`), `inc/boletin.php`, `templates/single-boletin.html`, `templates/archive-boletin.html`, `inc/seo.php` |
| Catálogo | `blocks/catalogo/` y `blocks/catalogo-portada/` (menos los `.css`), `inc/catalogo.php`, `templates/page-paissana.html`, `blocks/paisana-hero/render.php`, `apps/wp-fse/mu-plugins/lapaz-catalogo.php` |
| Historia | `blocks/historia/` y `blocks/historia-destacada/` (menos los `.css`), `inc/historia.php`, `templates/single-historia.html` |
| CSS | los `.css` de los cinco bloques |
| Seed | `apps/wordpress/seed/` |
| Pruebas | `apps/wp-fse/tests/e2e/` |
| Integración | `functions.php`, `apps/wp-fse/docker/lapaz-setup`, `apps/wp-fse/compose.override.yaml`, `wiki/` |
