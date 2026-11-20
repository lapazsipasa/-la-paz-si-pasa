# Boletín: estructura y alimentación mensual

Estado: **diseño, pendiente de aprobación** · 2026-11-19 · parte de [boletin-catalogo-fcp](../boletin-catalogo-fcp.md)

## Objetivo

Que una persona del Fondo publique cada edición de *Caminos de Transformación* llenando un formulario en WordPress, sin tocar diseño y sin desarrollador.

## Qué trae el patrón del Fondo

Se revisó `raw/Boletin-FCP-Caminos-de-Transformacion/index.html` (edición 02). Una edición tiene tres partes.

**1. Datos de la edición.** Número, periodo, portada (titular, sumario, firma, foto y crédito) y créditos de fotografía.

**2. Piezas que se repiten de otra parte.** El índice de 8 tarjetas, la barra de secciones, la numeración 01–08, los enlaces «Volver al índice» y el pie repiten lo que ya dice cada sección. En el HTML están escritas a mano dos veces.

**3. Ocho secciones, pero solo cuatro moldes:**

| Molde | Secciones que lo usan (edición 02) | Contenido |
|---|---|---|
| **Artículo** | 01 En portada, 03 Historias que transforman, 04 Obras que conectan, 05 Paz productiva, 07 Actualidad | rótulo, título, bajada, cuerpo con subtítulos y cita, 1 a 3 fotos con crédito, foto panorámica de apertura (opcional), ficha de datos (opcional) |
| **Cifras** | 02 El Fondo en cifras | lista de cifras (número y texto, la primera destacada) y una nota |
| **Tarjetas** | 06 Alianzas | lista de tarjetas (etiqueta, título, texto, monto y nota del monto, color) |
| **Agenda** | 08 La agenda | lista de hitos (cuándo, título, texto) |

Todas las secciones comparten cabecera: nombre («Obras que conectan») y antetítulo («Programa de Inversiones Prioritarias…»).

## Diseño

### Modelo

Tipo de contenido **`boletin`**: una entrada por edición. Los campos son de SCF, como en Ferias y Retratos.

| Grupo | Campos |
|---|---|
| Edición | número, periodo (texto: «Octubre – Noviembre 2026»), texto de «En esta edición», créditos de fotografía |
| Portada | titular, sumario, firma (nombre y cargo), foto, crédito |
| Secciones | campo de **contenido flexible**: una fila por sección, y cada fila elige uno de los 4 moldes |

Campos comunes a toda sección: nombre, antetítulo, y para el índice: título, resumen e imagen. Si la imagen del índice queda vacía, se usa la primera foto de la sección.

Campos por molde:

- **Artículo:** rótulo y su color, título, bajada, cuerpo (editor de texto con negrita, enlace, subtítulo y cita), fotos (repetidor: imagen, formato alto o panorámico, crédito), foto de apertura con crédito, ficha (título, texto y repetidor de datos: cifra y descripción), y la opción «fotos a la izquierda».
- **Cifras:** repetidor de cifras (número, texto) y nota.
- **Tarjetas:** repetidor (etiqueta, título, texto, monto, nota del monto, color).
- **Agenda:** repetidor de hitos (cuándo, título, texto).

El molde Artículo es un grupo de campos aparte que se reutiliza con el campo *clone* de SCF. Lo usa también la crónica de las [historias PaisSana](paissana-catalogo.md#historia-del-mes).

### Lo que sale solo

Nadie lo escribe y no se puede desincronizar:

- numeración 01…N según el orden de las filas;
- índice «En esta edición» y barra de secciones, con sus anclas;
- «Volver al índice» en cada sección;
- fondo alterno de las secciones y primer párrafo destacado (entradilla);
- pie con número, periodo y créditos;
- lista de ediciones anteriores.

### Edición nueva

Al pulsar *Boletines → Añadir edición*, el formulario abre con las **8 secciones de siempre ya creadas y vacías**, en su orden y con su molde y nombre. Se pueden quitar, reordenar o agregar. Un mes con 6 secciones o con dos artículos en «Historias» no necesita desarrollador.

Se hace con un valor inicial del campo flexible para entradas nuevas (filtro `acf/load_value`), no con una plantilla de bloques.

### Flujo de cada mes

1. *Boletines → Añadir edición*. Escribir número y periodo.
2. Llenar la portada.
3. Llenar cada sección: textos, fotos desde la biblioteca de medios, y filas de cifras, tarjetas o hitos.
4. *Vista previa* para revisar.
5. *Publicar*, o programar la fecha. `/boletin/` pasa a mostrar la edición nueva y la anterior queda en «Ediciones anteriores».

### Direcciones

| URL | Qué muestra |
|---|---|
| `/boletin/` | la edición más reciente publicada (es a donde lleva el menú) |
| `/boletin/edicion-02/` | una edición concreta, permanente |

`/boletin/` declara como canónica la URL de la edición que muestra, para no duplicar contenido ante buscadores.

### Cómo se pinta

- Un bloque dinámico **`lapaz/boletin`** (`block.json` + `render.php` + `style.css`), en las plantillas `single-boletin.html` y `archive-boletin.html`. Es el patrón del tema: los datos en SCF y el bloque los pinta ([decisión 4 de arquitectura](../../decisions/wordpress-fse-arquitectura.md)).
- `render.php` conserva los **nombres de clase del prototipo** (`sec-head`, `articulo`, `cifras-grid`, `tarjeta`, `hito`…). Ese es el contrato con quien porte el CSS.
- El CSS del prototipo se porta a `style.css` con los tokens de `theme.json`: Komet y Monique Round en lugar de Fredoka y Mulish, y la paleta del sitio en lugar de las variables propias. Sin Google Fonts.
- No necesita JavaScript: anclas nativas y barra fija con CSS.
- Va dentro del header y el footer del sitio. La barra superior y el pie del prototipo se reducen a una franja con número y periodo, y a los créditos.

### Carga de la edición 02

Va al seed, como el resto del contenido: `apps/wordpress/seed/boletin-02.json` y las 11 fotos en `seed/media/`. `seed.php` aprende a escribir un campo flexible (filas con `acf_fl_layout`).

## Criterios de hecho

- [ ] Un Editor crea una edición desde cero con el manual, sin ayuda, y la publica.
- [ ] Quitar una sección renumera las demás y actualiza índice y barra.
- [ ] Agregar una séptima cifra o una quinta tarjeta no rompe la rejilla a 360, 850 y 1440 px.
- [ ] `/boletin/` muestra la edición nueva justo después de publicarla, también con la caché de página activa.
- [ ] La edición 02 cargada por el seed coincide en texto con el HTML del Fondo.
- [ ] Sin peticiones a Google Fonts.

## Fuera de alcance

- Botón «duplicar edición». Se agrega si el equipo lo pide: la edición nueva ya abre con las secciones listas.
- Envío por correo, PDF descargable y suscripción.
- Moldes nuevos (video, galería) hasta que una edición los necesite.

## Por confirmar

- **Con el Fondo:** el prototipo dice «Boletín interno». Al publicarse en un sitio abierto, ¿se quita «interno»? Mientras tanto, el rótulo es un campo editable.
- **Al construir:** que la vista previa de WordPress muestre cambios de campos SCF sin guardar. Si no lo hace, el manual indica guardar borrador antes de previsualizar.
- **Al construir:** que la caché de página se vacíe al publicar. La página del plugin dice que los archivos en caché se borran cuando se modifican entradas; se comprueba en staging con el criterio de arriba.

## Referencias

- Tipos de campo disponibles: verificado en el WordPress local (SCF 6.9.8) con `acf_get_field_types()`: `flexible_content`, `repeater`, `clone`, `gallery`, `wysiwyg`.
- [`register_post_type()`](https://developer.wordpress.org/reference/functions/register_post_type/) y [plantillas de bloques](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-templates/): la alternativa descartada (patrones con `contentOnly`). Ver [decisión 1](../../decisions/boletin-catalogo-fcp.md).
- [WP Super Cache](https://wordpress.org/plugins/wp-super-cache/): borrado de caché al modificar entradas.
