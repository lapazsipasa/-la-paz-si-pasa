# PaisSana: catálogo, buscador e historia del mes

Estado: **construido en la rama `feat/boletin-catalogo-fcp`** (2026-11-19 a 2026-11-20), sin desplegar. Avance por etapa en [boletin-catalogo-fcp](../boletin-catalogo-fcp.md#estado-por-etapa-2026-11-20). Diseño de origen: 2026-11-19.

## Objetivo

Que cualquier visitante encuentre productores PaisSana por nombre, producto, territorio o categoría, con las herramientas nativas de WordPress y la mejor respuesta posible. Y que el Fondo mantenga los productores y la historia del mes desde el admin.

## Qué hace el prototipo del Fondo

Se revisó `raw/Catalogo PaisSana Asocafe/index.html`.

- Trae los 316 productores en un JSON de 53 KB dentro de la página y filtra en el navegador.
- Busca texto en nombre, departamento, municipio y productos. Distingue tildes: «cafe» no encuentra «Café».
- Filtros: departamento (28), tiempo de operación (4) y categorías (10, varias a la vez; basta que coincida una).
- Muestra 36 tarjetas y un botón «Ver más».
- «Cómo se distribuye el registro»: barras por departamento (las 15 primeras) y por categoría, que al pulsarlas filtran.
- Tres cifras en el hero: productores, departamentos, categorías.
- Cada tarjeta muestra nombre, municipio y departamento, productos, categorías y etnia.
- No muestra la población atendida ni el enlace, aunque están en los datos.

## Datos

| Dato | Valor |
|---|---|
| Productores | 316, sin nombres repetidos |
| Municipios distintos | 138 |
| Productos por productor | 1,9 en promedio, máximo 3 |
| Categorías por productor | máximo 4 |
| Con enlace | 226, pero el campo viene sucio: usuarios de Instagram sin URL, texto libre, «n» |

## Diseño

### Modelo

Tipo de contenido **`productor`**. El título es el nombre. No tiene página propia (`publicly_queryable: false`) y no entra al buscador general del sitio.

Todo lo que se filtra es una **taxonomía nativa**:

| Taxonomía | Términos | Se usa para |
|---|---|---|
| `departamento` | 28 | filtro, tarjeta, barras |
| `categoria_productor` | 10 | filtro (varias), tarjeta, barras |
| `tiempo_operacion` | 4 | filtro |
| `etnia` | 5 | etiqueta en la tarjeta |
| `poblacion` | 21 | solo en el admin: el prototipo no la muestra |

Campos SCF: `municipio` (texto), `productos` (uno por línea) y `enlace` (texto; se guarda como viene y no se muestra hasta limpiarlo).

Las taxonomías y el tipo se declaran en `scf-json/` (`post_type_productor.json`, `taxonomy_*.json`, `group_productor.json`).

Por qué taxonomías y no campos: WordPress las guarda en tablas con índice, filtra por ellas sin consultas lentas sobre `postmeta`, mantiene solo el conteo de cada término, y da gratis el filtro en el listado del admin.

### Búsqueda de texto

La búsqueda nativa de WordPress (`s` en `WP_Query`) mira título, extracto y contenido. No mira campos ni nombres de términos.

Para que «Planadas» o «cacao» encuentren productores sin SQL a mano, cada productor guarda al salvarse un **texto de búsqueda** en `post_content`: municipio, departamento, categorías y productos. El editor no lo ve ni lo escribe. Lo genera el MU-plugin `apps/wp-fse/mu-plugins/lapaz-catalogo.php`: engancha `wp_after_insert_post`, `set_object_terms` y `acf/save_post`, encola el productor y lo indexa en `shutdown`, cuando campos y términos ya están escritos. El seed pasa por el mismo camino.

La búsqueda queda como una consulta nativa: `s` limitado a título y contenido con `search_columns`.

Ventaja sobre el prototipo: la base de datos compara sin distinguir tildes ni mayúsculas, así que «cafe» encuentra «Café». Se comprueba con una prueba, porque depende de la colación de la tabla.

### La consulta

Un bloque dinámico **`lapaz/catalogo`** lee los filtros de la URL y hace **una sola** `WP_Query`:

- `post_type: productor`, orden por título;
- `s` con el texto, si tiene 2 caracteres o más;
- `tax_query`: los filtros se suman con AND entre taxonomías, y dentro de categoría basta una (operador `IN`), igual que el prototipo;
- 36 por tanda.

Parámetros de la URL: `buscar`, `departamento`, `categoria` (varias), `tiempo`, `ver` (cuántas tarjetas). No se usa `s`, porque WordPress lo tomaría como búsqueda general y cargaría otra plantilla.

Ejemplo: `/paissana/?buscar=cafe&departamento=cauca&categoria[]=alimentos-y-bebidas#explorar`

«Ver más» es un enlace a la misma URL con `ver=72`, luego `108`. Funciona sin JavaScript y el estado queda en la URL.

Las tres cifras del hero y las barras de distribución salen del **conteo nativo de cada término** (`get_terms`), sin consultas propias. Cada barra es un enlace al filtro.

### Interfaz

1. **Base sin JavaScript:** un `<form method="get">` con el campo de búsqueda, los dos selectores y las categorías como casillas. El servidor devuelve la página ya filtrada. Sirve con JavaScript apagado y para buscadores.
2. **Mejora con la Interactivity API de WordPress:** la zona de resultados es una región del router (`data-wp-router-region`). Al escribir (con espera de 300 ms), cambiar un selector o pulsar una categoría, una barra o «Ver más», `actions.navigate()` pide la URL nueva y reemplaza solo esa región, sin recargar. El router guarda en memoria las páginas ya visitadas durante la sesión y permite precargar con `actions.prefetch()`.
3. Accesibilidad: etiquetas en cada control, conteo de resultados en una región `aria-live`, y mensaje cuando no hay resultados.

### Rendimiento

| Medida | Efecto |
|---|---|
| HTML desde el servidor | sin JSON de 53 KB ni pintado en el navegador; la primera tanda ya viene lista |
| Taxonomías con índice | filtros sin `meta_query` |
| Una consulta por petición, 36 filas | costo constante aunque el registro crezca |
| Conteos nativos de términos | cifras y barras sin consultas adicionales |
| Router de la Interactivity API | cambia solo la región; caché en memoria por URL y precarga |
| Caché de página (WP Super Cache) | `/paissana/` sin filtros se sirve desde caché, como el resto del sitio |
| CSS y JS solo en `/paissana` | el resto del sitio no carga nada del catálogo |

**Costo real:** cada combinación nueva de filtros es una petición a WordPress. El TTFB medido sin caché en el servidor es de 220 a 280 ms. Para 316 productores el filtrado en el navegador sería más inmediato; se eligió el nativo por URLs propias, funcionamiento sin JavaScript y por usar la búsqueda de WordPress ([decisión 2](../../decisions/boletin-catalogo-fcp.md)).

### Seguridad

- Todo parámetro se limpia (`sanitize_text_field`). Los filtros solo aceptan slugs de términos que existen.
- `ver` tiene tope: el total de productores.
- La búsqueda de texto libre **no se guarda en la caché de página**: cualquiera podría llenar el disco con búsquedas inventadas. Se excluye `buscar=` en la configuración de WP Super Cache (`lapaz-setup`).
- Toda salida va escapada.

### Carga inicial

`apps/wordpress/seed/productores.json`: los 316 productores con los índices del archivo del Fondo convertidos a texto. `seed.php` crea los términos y los productores. Es idempotente por título: no hay nombres repetidos.

## Historia del mes

El «PaisSano destacado» cambia cada mes. Tipo de contenido **`historia`**, una entrada por historia:

| Grupo | Campos |
|---|---|
| Presentación | organización, lugar, resumen, foto, 3 cifras (número y texto) |
| Ficha | repetidor de dato y valor (organización, territorio, producto…) |
| Video | YouTube o archivo MP4, y foto de portada. Mismo criterio que el tipo `video` del sitio |
| Crónica | el molde **Artículo** del [boletín](boletin-estructura.md#modelo), reutilizado, más la nota de fuente |
| Galería | campo galería de SCF; pie y crédito salen de la leyenda de cada imagen |

- `/paissana` muestra la historia más reciente en la tarjeta «PaisSano destacado».
- Cada historia tiene su URL: `/paissana/historias/asocafe/`. Las anteriores siguen publicadas.
- Bloque `lapaz/historia` para la página de la historia. La ampliación de fotos reutiliza el lightbox que ya tiene `lapaz/paisana-ferias`.
- La historia de Asocafé va al seed (`seed/historia-asocafe.json`, fotos en `seed/media/`).

## Página `/paissana`

Página normal de WordPress con plantilla `page-paissana.html`: hero con las tres cifras, tarjeta de la historia del mes, bloque `lapaz/catalogo` y barras de distribución. El botón **PAISSANA** de `lapaz/paisana-hero` apunta aquí.

## Criterios de hecho

- [ ] Con JavaScript apagado, buscar y filtrar funciona con el formulario.
- [ ] Con JavaScript, filtrar no recarga la página y la URL cambia.
- [ ] Abrir una URL con filtros muestra esos resultados (se puede compartir).
- [ ] Los conteos por departamento y categoría coinciden con `productores.json`.
- [ ] «cafe» encuentra productores con «Café».
- [ ] Buscar un municipio («Planadas») encuentra sus productores.
- [ ] Un Editor agrega un productor y aparece en el catálogo y en los conteos.
- [ ] Publicar una historia nueva cambia el destacado de `/paissana`; la anterior sigue en su URL.
- [ ] Query Monitor: una consulta de productores por petición, sin consultas lentas.

## Por confirmar

- **Al construir (primera tarea de la etapa):** que un módulo ES sin compilar funcione como `viewScriptModule` con `supports.interactivity`. La documentación solo describe el caso con `wp-scripts`; el tema no tiene build ([decisión 4 de arquitectura](../../decisions/wordpress-fse-arquitectura.md)). Si no funciona, el plan B es 25 líneas de JS propio (`fetch` de la URL y reemplazo de la región), con el mismo servidor.
- **En staging:** que WP Super Cache sirva `/paissana/` desde caché, excluya `buscar=` y se vacíe al guardar un productor.
- **Con el Fondo:** el video de Asocafé y si se limpia el campo de enlaces para mostrarlo.

## Fuera de alcance

- Página propia por productor.
- Tolerancia a errores de escritura y sinónimos. Si hace falta, se evalúa un plugin de búsqueda.
- Mapa de productores.

## Referencias

- [`WP_Query`](https://developer.wordpress.org/reference/classes/wp_query/): `s`, `search_columns` (desde 6.2) y `tax_query` (`relation`, operador `IN`).
- [Router de la Interactivity API](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-interactivity-router/): regiones, `navigate`, `prefetch`, caché de páginas.
- [Navegación en el cliente](https://developer.wordpress.org/block-editor/reference-guides/interactivity-api/core-concepts/client-side-navigation/): el bloque declara `supports.interactivity`.
- [Metadatos de bloque](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/): `viewScriptModule` (desde 6.5).
- [Bloque Query Loop](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-theme/core-block-query/): usa el mismo router. En el WordPress local (7.1.3) no hay un bloque nativo de filtros por taxonomía para el visitante; se revisó la lista de bloques registrados.
- [WP Super Cache](https://wordpress.org/plugins/wp-super-cache/): URLs con parámetros y borrado al modificar entradas.
