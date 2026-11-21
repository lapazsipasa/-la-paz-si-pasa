> **Versión del 2026-11-21.** Cada formulario va con su lámina: la pantalla de WordPress y el componente del sitio que modifica, con los mismos números. Las imágenes no viven en el repo: van en el documento que se entrega al Fondo (Word y PDF, generados desde este texto). Las claves de acceso nunca van aquí. Si cambias este texto, regenera el Word y el PDF (`apps/wp-fse/tools/manual/README.md`) y actualiza esta fecha.

# Manual del editor — La Paz Sí Pasa

**Boletín Caminos de Transformación, historias PaisSana y catálogo de productores**

Versión del 21 de noviembre de 2026

Las claves de acceso se entregan por otro canal.

---

## Índice

1. Entrar al administrador y orientarte
2. Publicar una edición del boletín, paso a paso
3. Escribir bien y preparar fotos
4. Revisar y publicar
5. Publicar la historia del mes (PaisSano destacado)
6. Mantener el catálogo de productores PaisSana
7. Lo que NO debes tocar (y por qué)
8. Problemas frecuentes y qué hacer
9. Lista de comprobación mensual
10. Buscadores y redes (SEO) y a quién acudir
11. Resumen en una hoja

**Cómo leer las láminas de este manual:** cada formulario se explica con tres piezas seguidas: primero **En WordPress** (la pantalla donde escribes), después **En el sitio** (dónde aparece lo que escribiste en la página pública) y por último una **tabla** que dice qué campo es cada número. El círculo con un número lleva el mismo número en las dos imágenes y en la tabla: el ① de WordPress es el ① del sitio. Los números empiezan de nuevo en cada lámina. Los círculos son naranjas y azules por turnos solo para distinguir cuadros vecinos; el color no significa nada. Si una imagen es muy larga, sigue en la página siguiente y su pie lo indica («1 de 3», «2 de 3»…).

---

## 1. Entrar al administrador y orientarte

### Cómo iniciar sesión

1. Abre tu navegador y entra a la dirección del sitio (la misma que usas para ver la web) seguida de `/wp-admin`.
2. Escribe tu **Nombre de usuario o dirección de correo** y tu **Contraseña** (las claves de acceso se entregan por otro canal).
3. Haz clic en **Acceder**.

> **Imagen** `captura-01-inicio-sesion.png`: Pantalla de inicio de sesión de WordPress en la dirección del sitio seguida de /wp-admin.

Si alguna vez olvidas tu contraseña, haz clic en **¿Olvidaste tu contraseña?** en esa misma pantalla y recibirás un correo para crear una nueva. También puedes cambiar tu clave en cualquier momento desde **Perfil** en el menú lateral.

### Qué menú vas a usar

Al entrar verás una barra oscura a la izquierda. Con tu cuenta de **Editor** puedes crear, editar y publicar contenido y subir fotos. No necesitas entrar a ajustes ni instalar complementos (eso solo lo hace un Administrador). Verás más entradas en el menú (Noticias, Retratos, Ferias, Videos…); no las necesitas para el boletín, las historias ni el catálogo.

| Menú lateral | Para qué sirve | Dónde aparece en el sitio |
| --- | --- | --- |
| **Boletines** | Publicar cada edición de *Caminos de Transformación*. | En `/boletin/` (siempre la más reciente), en `/boletin/edicion-XX/` y en la tarjeta **Último boletín** en **Inicio**. |
| **Historias PaisSana** | Publicar la historia del mes (sección **PaisSano destacado**). | En `/historias/` (la más reciente y debajo **Otras historias**), en `/historias/<nombre>/`, y como tarjeta **Historia del mes** en **Inicio**, **Proyectos destacados** y **Productores** (`/productores/`). |
| **Productores** | Agregar, corregir o retirar productores del catálogo PaisSana. | En el catálogo `/productores/`, sus cifras, su buscador y las barras de distribución. |
| **Medios** | Ver o subir fotos y archivos de video a la biblioteca. | En cualquier boletín o historia donde los elijas. |

> **Imagen** `captura-02-menu-lateral.png`: Menú lateral de WordPress con las secciones Boletines, Historias PaisSana, Productores y Medios.

---

## 2. Publicar una edición del boletín, paso a paso

Cada edición del boletín es una entrada independiente. El sitio arma solo las tarjetas del índice «En esta edición», la numeración de las secciones (`01`, `02`, `03`…), la barra superior de secciones y la lista de **Otras ediciones** al final.

### Paso 1: Crear la edición y ponerle título

1. En el menú lateral haz clic en **Boletines** y luego en **Añadir edición**.
2. En el campo superior del título (verás el texto guía *Edición 03*), escribe el nombre corto de la edición. Por ejemplo: `Edición 02`.
3. Este título **no** es el titular grande de la portada: define la dirección web de la edición (`/boletin/edicion-02/`) y el nombre que aparecerá en **Otras ediciones**.

### Paso 2: Llenar la pestaña Edición

En esta pestaña defines los datos generales de la edición: número, periodo, franja superior, introducción del índice y créditos fotográficos del pie.

Cada lámina tiene tres piezas con los mismos números: la imagen de WordPress, la imagen del sitio y la tabla (ver «Cómo leer las láminas» al comienzo).

> **Imagen** `lamina-01-boletin-edicion-wordpress.png`: Pestaña «Edición» del boletín en WordPress con los campos numerados del 1 al 5.

> **Imagen** `lamina-01-boletin-edicion-sitio.png`: Franja superior, introducción del índice y pie del boletín donde aparecen los campos 1 a 5.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Número de edición** *(obligatorio)* | Franja superior (`EDICIÓN 02`), pie del boletín, tarjeta de Inicio y título de la pestaña del navegador. |
| ② | **Periodo** *(obligatorio)* | Junto al número en la franja superior, en el pie, en **Otras ediciones** y en la tarjeta de Inicio. |
| ③ | **Texto de la franja superior** | Lado izquierdo de la cinta superior del boletín. |
| ④ | **Texto de «En esta edición»** | Párrafo introductorio debajo del encabezado «En esta edición». |
| ⑤ | **Créditos de fotografía** | Columna derecha del pie del boletín, bajo el rótulo automático «Fotografía». |

**Consejos:** en ① escribe solo el número (`2`; el sitio muestra `02`), en ② escribe el rango de meses (ej.: `Octubre – Noviembre 2026`), en ③ puedes dejar el texto por defecto y en ⑤ escribe **un nombre por línea**, sin anteponer «Fotografía:».

### Paso 3: Llenar la pestaña Portada

Aquí armas la cabecera principal del boletín: titular, sumario, firma de portada, fotografía principal y crédito.

> **Imagen** `lamina-02-boletin-portada-wordpress.png`: Pestaña «Portada» del boletín en WordPress con los campos numerados del 1 al 6.

> **Imagen** `lamina-02-boletin-portada-sitio.png`: Portada de la edición en el sitio público con los elementos 1 a 6.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Titular** *(obligatorio)* | Titular principal de la portada del boletín (y en la tarjeta de Inicio). |
| ② | **Sumario** | Párrafo bajo el titular de portada (también alimenta Inicio y buscadores). |
| ③ | **Protagonista o autor** | En negrita debajo del sumario en la portada. |
| ④ | **Cargo o descripción** | Debajo del nombre del protagonista o autor. |
| ⑤ | **Foto de portada** *(obligatorio)* | Fotografía principal a la derecha de la portada (también en Inicio y al compartir). |
| ⑥ | **Crédito de la foto** | Pie pequeño debajo de la foto de portada. |

**Consejos:** ③ y ④ son opcionales; en ⑤ elige una foto horizontal y llena su **Texto alternativo** (cómo, en la sección 3); en ⑥ sí escribe `Fotografía: Nombre Apellido`.

### Cómo se reutiliza esta portada en Inicio

En cuanto publicas, la tarjeta **Último boletín** de **Inicio** se actualiza sola. En la imagen, ① es el **Titular**, ② el **Sumario** (se recorta a 30 palabras: pon la idea principal al comienzo) y ③ la **Foto de portada**, los tres de la pestaña **Portada**; el número y el periodo salen de la pestaña **Edición**.

> **Imagen** `lamina-03-boletin-destacado-sitio.png`: Tarjeta «Último boletín» en la página de Inicio con los elementos 1 a 3.

### Paso 4: Llenar la pestaña Secciones

Al crear una edición nueva, WordPress ya te entrega **las 8 secciones estándar listas y vacías**, en su orden habitual:

1. *En portada* (**Artículo**)
2. *El Fondo en cifras* (**Cifras**)
3. *Historias que transforman* (**Artículo**)
4. *Obras que conectan* (**Artículo**)
5. *Paz productiva* (**Artículo**)
6. *Alianzas* (**Tarjetas**)
7. *Actualidad* (**Artículo**)
8. *La agenda* (**Agenda**)

### Cómo quitar, reordenar o añadir secciones

Antes de llenar nada, decide qué secciones usarás esta edición y borra ya las que no.

- **Quitar una sección:** pasa el cursor por el borde derecho de la barra de la sección y haz clic en el botón **−** (quitar fila). **Importante:** si una edición va a tener menos de 8 secciones, **borra las filas que no vas a usar**. Si dejas una fila vacía, al intentar publicar verás «Validación fallida» porque tiene campos obligatorios sin llenar.
- **Reordenar:** arrastra una sección desde el número a la izquierda de su barra y suéltala donde quieras. La numeración (`01`, `02`…) se ajusta sola.
- **Añadir una nueva:** haz clic en **Añadir sección** al final de la lista y elige el molde (**Artículo**, **Cifras**, **Tarjetas** o **Agenda**).

### Campos comunes de todas las secciones

Haz clic en la barra de una sección para abrirla. Los cuatro moldes (**Artículo**, **Cifras**, **Tarjetas** y **Agenda**) empiezan con los mismos cinco campos que arman la barra superior, la tarjeta del índice «En esta edición» y la cabecera de la sección.

> **Imagen** `lamina-04-boletin-secciones-indice-wordpress.png`: Campos comunes al abrir una sección en la pestaña «Secciones» (1 a 5).

> **Imagen** `lamina-04-boletin-secciones-indice-sitio.png`: Barra superior, tarjeta del índice «En esta edición» y cabecera de sección (1 a 5).

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Nombre de la sección** *(obligatorio)* | En la barra superior, en la tarjeta del índice y como título grande de la sección. |
| ② | **Subtítulo de la sección** | Línea corta debajo del nombre en la cabecera de la sección. |
| ③ | **Índice: título** | Título enlazado dentro de la tarjeta de «En esta edición». |
| ④ | **Índice: imagen** | Foto horizontal de la tarjeta en «En esta edición» (recomendada 16:10). |
| ⑤ | **Índice: resumen** | Texto breve de la tarjeta en «En esta edición». |

**Consejos:** ③ es obligatorio en Cifras, Tarjetas y Agenda (en Artículo, si queda vacío, usa el **Título** del artículo); en ④, si queda vacío en Artículo toma la primera foto del artículo, pero en los demás moldes conviene subir una foto horizontal.

### Molde Artículo

Para pegar el texto, los subtítulos y las citas sigue las reglas de la sección 3.

Usa este molde para entrevistas, reportajes, perfiles o notas largas con texto, fotos laterales y recuadro de datos opcional.

> **Imagen** `lamina-05-boletin-molde-articulo-wordpress.png`: Campos del molde «Artículo» en WordPress numerados del 1 al 8.

> **Imagen** `lamina-05-boletin-molde-articulo-sitio.png`: Sección de tipo Artículo en el boletín con los elementos 1 a 8.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Etiqueta superior** | Rótulo corto sobre el titular del artículo (su campo vecino **Color de la etiqueta** cambia entre Azul y Verde). |
| ② | **Título** *(obligatorio)* | Titular del artículo (también respaldo de **Índice: título**). |
| ③ | **Resumen bajo el título** | Dos o tres líneas en negrita justo debajo del titular. |
| ④ | **Primer párrafo destacado** | Párrafo de apertura en letra un poco más grande (opcional). |
| ⑤ | **Texto del artículo** | Cuerpo principal con párrafos, subtítulos y citas. |
| ⑥ | **Foto de apertura** | Foto horizontal a todo el ancho, encima del artículo (con su campo vecino **Crédito de la foto de apertura** al pie). |
| ⑦ | **Fotos** | Columna lateral de 1 a 3 fotos (la primera va arriba de la ficha y las demás debajo). |
| ⑧ | **Ficha: título** | Recuadro de datos en la columna lateral, junto con **Ficha: texto**, **Ficha: datos** y **Ficha con fondo claro**. |

**Consejos:** en ⑦ llena **Imagen**, **Formato** (**Vertical** o **Panorámica**) y **Crédito**, y usa el interruptor **Fotos a la izquierda** si quieres alternar la columna al lado izquierdo. En ⑧, si dejas **Ficha: título** vacío, el recuadro no se muestra.

### Molde Cifras

Usa este molde para mostrar indicadores destacados en tarjetas numéricas con una nota explicativa al pie.

> **Imagen** `lamina-06-boletin-molde-cifras-wordpress.png`: Campos del molde «Cifras» en WordPress numerados del 1 al 3.

> **Imagen** `lamina-06-boletin-molde-cifras-sitio.png`: Rejilla de indicadores del molde «Cifras» en el boletín (1 a 3).

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Número** *(obligatorio, dentro de Cifras)* | Cifra grande de cada tarjeta. |
| ② | **Texto** *(obligatorio, dentro de Cifras)* | Explicación corta debajo del número. |
| ③ | **Nota** | Párrafo aclaratorio al pie de toda la rejilla de cifras. |

**Consejo:** la **primera fila** del repetidor **Cifras** se destaca sola en azul y tamaño más grande; ③ es opcional y sirve para indicar la fuente o el periodo de corte.

### Molde Tarjetas

Usa este molde para presentar alianzas, convenios o proyectos en tarjetas con borde superior de color y monto opcional.

> **Imagen** `lamina-07-boletin-molde-tarjetas-wordpress.png`: Campos de una fila del molde «Tarjetas» en WordPress numerados del 1 al 6.

> **Imagen** `lamina-07-boletin-molde-tarjetas-sitio.png`: Rejilla de tarjetas en el boletín con los elementos 1 a 6.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Etiqueta** | Rótulo corto en la parte superior de la tarjeta. |
| ② | **Color** | Color del filete superior de la tarjeta (**Azul**, **Naranja** o **Verde**). |
| ③ | **Título** *(obligatorio)* | Título de la tarjeta. |
| ④ | **Texto** | Cuerpo de la tarjeta (un párrafo por línea). |
| ⑤ | **Monto** | Cifra destacada al pie de la tarjeta (opcional). |
| ⑥ | **Nota del monto** | Aclaración pequeña debajo del monto. |

**Consejo:** escribe un párrafo por línea en ④; ⑥ solo se muestra si ⑤ (**Monto**) tiene contenido.

### Molde Agenda

Usa este molde para listar hitos, fases o próximos eventos en forma de línea de tiempo.

> **Imagen** `lamina-08-boletin-molde-agenda-wordpress.png`: Campos de un hito del molde «Agenda» en WordPress numerados del 1 al 3.

> **Imagen** `lamina-08-boletin-molde-agenda-sitio.png`: Línea de tiempo de la sección «La agenda» en el boletín (1 a 3).

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Cuándo** | Fecha o etapa sobre cada hito. |
| ② | **Título** *(obligatorio)* | Título principal del hito. |
| ③ | **Texto** | Explicación breve debajo del título (opcional). |

**Consejo:** usa rótulos cortos en ① (como `Fases II y III` o `En implementación`) y una o dos frases en ③.

---

## 3. Escribir bien y preparar fotos

Seguir estas cuatro reglas evita que se dañe el diseño y hace que el sitio funcione para personas que usan lectores de pantalla.

### Pegar texto sin formato

Cuando copies texto desde Word, Google Docs o un correo, **no uses** `Ctrl + V` normal (arrastra fuentes, colores y tamaños ocultos).

- En Windows: mantén presionadas **`Ctrl + Shift + V`**.
- En Mac: mantén presionadas **`Cmd + Shift + V`**.

### Subtítulos y citas dentro del texto

En los campos **Texto del artículo** y **Texto de la crónica**:

- **Subtítulos:** coloca el cursor en la línea del subtítulo y usa el atajo `Shift + Alt + 3` en Windows o `Control + Option + 3` en Mac para aplicar **Título 3**. No uses *Título 1* ni *Título 2* ni pongas un párrafo entero en negrita para simular un subtítulo.
- **Citas:** haz clic en el botón de comillas (**Cita**). Escribe la frase en el primer párrafo, pulsa **Enter** y escribe en el segundo párrafo quién la dijo (nombre y cargo). El sitio le da estilo diferente a la frase y al autor de forma automática.

### Fotos: orientación, peso y créditos

- **Orientación:** usa fotos **horizontales** en portadas, fotos de apertura, tarjetas del índice y tarjetas destacadas. Si subes una foto vertical en un espacio horizontal, el sitio la recorta para encajar y puede cortar cabezas. En la columna lateral de un artículo puedes marcar **Vertical** si la foto es alta.
- **Peso:** procura que cada foto pese **menos de 2 MB** (el sitio acepta archivos hasta 32 MB y convierte las fotos JPG automáticamente a un formato más liviano, pero fotos muy pesadas hacen lenta la carga en tu computador).
- **Créditos:** en **Crédito de la foto**, **Crédito de la foto de apertura** y **Crédito** escribe `Fotografía: Nombre Apellido`. Las dos excepciones son **Créditos de fotografía** (pie del boletín, pestaña **Edición**) y **Descripción** (galería de historias): ahí escribes solo el nombre del fotógrafo.

### Texto alternativo (muy importante)

Cada vez que subas o elijas una foto en la biblioteca de medios, llena el campo **Texto alternativo** a la derecha. Describe en una frase corta qué se ve en la imagen (ejemplo: *«Productora de café seleccionando granos en Planadas, Tolima»*).

- No empieces con «Foto de…» ni «Imagen de…».
- Sirve para que las personas con discapacidad visual entiendan la foto y ayuda a que el contenido aparezca mejor en buscadores.

> **Imagen** `captura-07-biblioteca-medios-campos.png`: Biblioteca de medios con los campos Texto alternativo, Leyenda de la imagen y Descripción en el panel derecho.

---

## 4. Revisar y publicar

1. Mientras trabajas, haz clic en **Solo guardar** con frecuencia. **Solo guardar** funciona aunque todavía falten campos obligatorios.
2. Antes de revisar cómo se ve, haz clic en **Solo guardar** y luego en **Vista previa** (en pantalla puede leerse «Vistra previa»). Si no guardas primero, los cambios recientes pueden no verse en la vista previa.
3. Cuando todo esté listo:
   - Para publicar de inmediato: haz clic en **Publicar**.
   - Para programar fecha y hora: en el panel derecho, junto a **Publicar inmediatamente**, haz clic en **Editar**, elige fecha y hora, pulsa **Aceptar** y luego **Programar**.

> **Imagen** `captura-08-panel-publicar.png`: Panel lateral Publicar con Solo guardar, Vista previa, programación y el botón Publicar.

### Qué cambia en el sitio al publicar un boletín

En cuanto publicas:

- `/boletin/` pasa a mostrar la edición nueva de forma automática (siempre muestra la edición publicada con fecha más reciente).
- La edición anterior sigue en su propia dirección web y aparece al final en **Otras ediciones**.
- La tarjeta **Último boletín** en **Inicio** se actualiza sola con el nuevo titular, número, periodo, sumario y foto de portada.
- La copia guardada de las páginas se renueva automáticamente.

---

## 5. Publicar la historia del mes (PaisSano destacado)

Cada mes se publica una historia nueva de una organización productora. Al publicarla, pasa a ocupar la sección **PaisSano destacado** con la tarjeta **Historia del mes** en todo el sitio y las anteriores siguen accesibles en **Otras historias**.

1. En el menú lateral haz clic en **Historias PaisSana** y luego en **Añadir historia**.
2. En el campo superior del título (*Nombre de la organización*), escribe el nombre de la organización (ejemplo: `Asocafé`). Ese título define la dirección web (`/historias/asocafe/`).
3. Recorre las cinco pestañas en orden.
4. Al terminar las pestañas, haz clic en **Solo guardar**, revisa **Vista previa** y pulsa **Publicar** (o programa la fecha); es lo mismo que en la sección 4.

### Pestaña Presentación (la tarjeta Historia del mes)

Estos campos arman la sección **PaisSano destacado** y su tarjeta **Historia del mes** en **Inicio**, **Proyectos destacados** y **Productores** (`/productores/`).

> **Imagen** `lamina-09-historia-presentacion-wordpress.png`: Título superior y pestaña «Presentación» de una historia en WordPress (1 a 7).

> **Imagen** `lamina-09-historia-presentacion-sitio.png`: Sección «PaisSano destacado» y tarjeta «Historia del mes» en el sitio público (1 a 7).

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Título** *(campo superior de WordPress)* | Nombre de la organización en la tarjeta **Historia del mes** (y en **Otras historias**). |
| ② | **Lugar** *(obligatorio)* | Debajo del nombre en la tarjeta y en la portada de la historia junto a «PaisSano destacado ·». |
| ③ | **Subtítulo en el catálogo** | Línea corta junto a la cabecera de sección **PAISSANO DESTACADO**. |
| ④ | **Resumen** *(obligatorio)* | Párrafo de presentación de la tarjeta (también descripción por defecto para Google). |
| ⑤ | **Foto de la tarjeta** *(obligatorio)* | Fotografía a la izquierda de la tarjeta **Historia del mes**. |
| ⑥ | **Número** *(en Cifras)* | Cifra destacada dentro de la fila de indicadores de la tarjeta. |
| ⑦ | **Texto** *(en Cifras)* | Rótulo pequeño debajo de cada número. |

**Consejos:** ① define la dirección `/historias/<nombre>/`; escribe ④ en dos o tres líneas (ideal hasta 155 caracteres), usa foto horizontal con **Texto alternativo** en ⑤ y añade hasta 3 filas en **Cifras** (⑥ y ⑦).

### Pestañas Portada y Video

Aquí completas el encabezado a todo ancho de `/historias/<nombre>/`, su ficha técnica y el reproductor de video (opcional). La sección **El video** solo aparece en el sitio cuando eliges una fuente distinta de **Sin video**.

> **Imagen** `lamina-10-historia-portada-video-wordpress.png`: Pestañas «Portada» (1 a 5) y «Video» (6 a 8) de una historia en WordPress (ejemplo con video).

> **Imagen** `lamina-10-historia-portada-video-sitio.png`: Portada, ficha técnica y sección de video en la página de la historia (ejemplo con video, 1 a 8).

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Foto de portada** | Imagen horizontal a todo el ancho arriba de la historia (y foto por defecto al compartir). |
| ② | **Título de la historia** *(obligatorio)* | Titular grande sobre la portada de la historia. |
| ③ | **Subtítulo** | Línea opcional debajo del titular de portada. |
| ④ | **Dato** *(en Ficha)* | Rótulo de cada casilla de la ficha técnica bajo la portada. |
| ⑤ | **Valor** *(en Ficha)* | Valor correspondiente a cada dato de la ficha. |
| ⑥ | **Origen del video** | Activa la sección **El video** y define cómo se reproduce al pulsar el botón. |
| ⑦ | **Imagen de portada del video** | Miniatura que se ve antes de reproducir el video. |
| ⑧ | **Subtítulo del video** | Línea corta junto al encabezado «El video». |

**Consejos:** si dejas ① vacía, la portada usa fondo azul sólido; en ⑥ elige **Sin video** (oculta la sección), **YouTube** (**URL de YouTube**, recomendada para videos largos), **Archivo MP4 subido a WordPress** (menor a 20 MB en **Archivo de video (MP4)**) o **Enlace externo** (`https://` en **Enlace externo**). En YouTube, si dejas ⑦ vacía se usa la miniatura de YouTube.

### Pestañas Crónica y Galería

Aquí escribes el relato largo con fotos y recuadro de datos laterales, y subes la galería fotográfica con ampliación.

> **Imagen** `lamina-11-historia-cronica-galeria-wordpress.png`: Pestañas «Crónica» (1 a 7) y «Galería» (8) de una historia en WordPress.

> **Imagen** `lamina-11-historia-cronica-galeria-sitio.png`: Sección «La crónica» y galería «Las fotografías» en la página de la historia (1 a 8).

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Subtítulo de la crónica** | Línea corta junto al encabezado «La crónica». |
| ② | **Resumen de la crónica** | Párrafo en negrita antes del texto principal. |
| ③ | **Primer párrafo destacado** | Primer párrafo en letra más grande (opcional). |
| ④ | **Texto de la crónica** | Cuerpo completo de la crónica. |
| ⑤ | **Nota de fuente** | Crédito al final de la columna de texto (opcional). |
| ⑥ | **Fotos** | Columna lateral con 1 a 3 fotos (la primera va arriba del recuadro de datos y las demás debajo). |
| ⑦ | **Recuadro de datos** | Ficha lateral con pares **Rótulo del dato** y **Valor del dato** (opcional). |
| ⑧ | **Galería** | Rejilla «Las fotografías» con vista ampliada al pulsar cada imagen (hasta 24 fotos). |

**Consejos:** en ④ pega sin formato (`Ctrl/Cmd + Shift + V`), aplica **Título 3** con `Shift + Alt + 3` (`Control + Option + 3` en Mac) y usa **Cita** en dos párrafos. En ⑧ los botones del selector aparecen en inglés como **Add to gallery** (Añadir a la galería) y **Bulk actions** (Acciones en lote). En WordPress, ⑤ **Nota de fuente** está al final de la pestaña Crónica, debajo de ⑦.

**Paso de la galería (⑧):** para cada foto, haz clic sobre ella y llena **Texto alternativo**, **Leyenda de la imagen** (pie visible) y **Descripción** (solo el nombre del fotógrafo; el sitio antepone «Fotografía:»).

### Qué cambia en el sitio al publicar una historia

- `/historias/` pasa a mostrar la historia nueva y, debajo, la lista de **Otras historias**.
- La sección **PaisSano destacado** y su tarjeta **Historia del mes** en **Inicio**, **Proyectos destacados** y `/productores/` se actualizan solas.
- La historia anterior sigue publicada en su dirección propia (`/historias/<nombre>/`) y aparece en **Otras historias**.
- Editar una historia antigua **no** la vuelve destacada (manda la fecha de publicación).

---

## 6. Mantener el catálogo de productores PaisSana

El catálogo en `/productores/` se actualiza solo con las entradas de **Productores**.

### Buscar y editar un productor

1. En el menú lateral haz clic en **Productores**.
2. Usa el buscador de arriba a la derecha para encontrar al productor por nombre y haz clic sobre él.
3. Corrige lo que necesites y haz clic en **Actualizar**.

### Agregar un productor nuevo

Haz clic en **Productores** y luego en **Añadir productor**. Completa el título, la caja **Datos del productor** y las cajas de clasificación de la columna derecha (el ejemplo de las imágenes corresponde a la organización *Asociacion de Productores de Especies Menores del Sur del Tolima*).

> **Imagen** `lamina-12-productor-tarjeta-wordpress.png`: Formulario de un productor en WordPress con sus datos y cajas de clasificación (1 a 7).

> **Imagen** `lamina-12-productor-tarjeta-sitio.png`: Buscador y tarjeta del productor en /productores/ con los elementos 1 a 7.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Título** *(campo superior de WordPress)* | Nombre grande arriba de la tarjeta del productor (y en el buscador). |
| ② | **Municipio** *(obligatorio)* | Primera parte de la ubicación (`Municipio · Departamento`) y buscador. |
| ③ | **Departamentos** *(caja derecha)* | Segunda parte de la ubicación, desplegable de departamento, conteos y barras de distribución. |
| ④ | **Productos** | Lista de viñetas dentro de la tarjeta (y texto del buscador). |
| ⑤ | **Categorías** *(caja derecha)* | Etiquetas grises al pie de la tarjeta, botones de filtro, conteos y barras de distribución. |
| ⑥ | **Etnias** *(caja derecha)* | Etiqueta verde diferenciada al final de la tarjeta. |
| ⑦ | **Tiempos de operación** *(caja derecha)* | Solo en el filtro desplegable «Cualquier tiempo de operación» de `/productores/` (no se imprime dentro de la tarjeta). |

**Consejos:** escribe **un producto por línea** en ④ sin guiones ni viñetas; marca **1** opción en ③ y ⑦, **1 o más** en ⑤ y **1** en ⑥ solo si aplica (si el término es «Ninguno», no se muestra). **No se muestra en el sitio:** **Enlace o red social** (registro interno) y la caja **Poblaciones** (registro interno; no aparece en la tarjeta, los filtros ni las barras). Al terminar, haz clic en **Publicar**.

### Retirar un productor

- Para ocultarlo temporalmente sin borrarlo: ábrelo, cambia **Estado** de *Publicada* a **Borrador** y haz clic en **Actualizar**.
- Para eliminarlo: haz clic en **Mover a la papelera**.

En cuanto publicas, editas o retiras un productor —o cambias el nombre de un departamento o una categoría—, el buscador de `/productores/`, las cifras totales (en `/productores/`, **Inicio** y **Proyectos destacados**) y las barras por departamento y categoría se actualizan solos.

---

## 7. Lo que NO debes tocar (y por qué)

Tu cuenta de **Editor** puede ver la sección **Páginas**, pero hay tres páginas base que sostienen la estructura del sitio. **No las borres, no las pases a borrador y no les cambies la dirección web:**

- **Inicio** (`/`): es la portada principal del sitio.
- **Proyectos destacados** (`/proyectos-destacados/`): contiene la presentación de PaisSana.
- **Productores PaisSana** (`/productores/`): es la página que muestra el catálogo completo. Si le cambias la dirección web, el catálogo y los botones que llevan a él dejarán de funcionar.

Tampoco modifiques plantillas, estilos, el menú principal ni complementos o usuarios (si necesitas cambiar el menú principal o crear un usuario, pídelo al equipo administrador).

> **Imagen** `captura-12-paginas-protegidas.png`: Lista de Páginas con Inicio, Proyectos destacados y Productores PaisSana, las tres páginas base que no debes tocar.

---

## 8. Problemas frecuentes y qué hacer

| Problema | Por qué pasa y cómo resolverlo |
| --- | --- |
| **«Validación fallida» al pulsar Publicar** | Falta algún campo obligatorio (marcado con asterisco rojo `*`) o dejaste vacía alguna de las 8 secciones precargadas del boletín. Sube por la página, busca los recuadros marcados en rojo, llénalos o borra con **−** las secciones que no vas a usar. |
| **Publiqué o edité algo y no lo veo en el sitio** | El sitio guarda copias rápidas de las páginas, pero las renueva solas al publicar, editar o borrar un boletín, historia, productor, noticia, página, menú o al renombrar un departamento o categoría. Haz una recarga forzada manteniendo **`Ctrl + F5`** (Windows) o **`Cmd + Shift + R`** (Mac), o abre la página en una ventana de incógnito. Si pasados unos minutos sigue sin cambiar, avisa al equipo técnico. |
| **Una foto sale recortada o cortó una cara** | Se subió una foto vertical en un espacio horizontal (portada, tarjeta o apertura). Reemplázala por una foto horizontal o recórtala en horizontal antes de subirla. |
| **Una cita se ve rara** | Probablemente quedó en un solo párrafo o en tres. Abre el texto, deja la frase en el primer párrafo de la cita, pulsa **Enter** y pon solo el autor en el segundo párrafo. |
| **Subí un video MP4 y no carga o tarda demasiado** | El archivo es muy pesado (el límite es 32 MB y lo ideal es menos de 20 MB). Súbelo a YouTube y en la pestaña **Video** cambia **Origen del video** a **YouTube**. |
| **Publiqué por error antes de tiempo** | Abre la entrada, en el panel derecho busca **Estado: Publicada**, haz clic en **Editar**, cámbialo a **Borrador**, pulsa **Aceptar** y luego **Actualizar**. Desaparece del sitio al instante. |
| **Borré una entrada por error** | Entra a **Boletines**, **Historias PaisSana** o **Productores**, haz clic en **Papelera** arriba de la lista, pasa el cursor sobre la entrada y haz clic en **Restaurar**. |

---

## 9. Lista de comprobación mensual

Imprime o revisa esta lista antes de pulsar **Publicar**:

### Antes de publicar un boletín

- [ ] Título corto correcto (`Edición XX`) y **Número de edición** y **Periodo** llenos.
- [ ] **Portada** completa (titular, sumario, foto horizontal con texto alternativo y crédito).
- [ ] Secciones que no se usan **borradas** (para evitar «Validación fallida»).
- [ ] Todas las secciones tienen **Nombre de la sección**, **Índice: título** (en Cifras, Tarjetas y Agenda) e imagen/resumen del índice.
- [ ] Textos pegados sin formato, subtítulos en **Título 3** y citas en dos párrafos.
- [ ] **Créditos de fotografía** del pie escritos uno por línea (sin «Fotografía:»).
- [ ] Guardaste borrador con **Solo guardar** y revisaste **Vista previa** en computador y celular.
- [ ] Tras publicar: `/boletin/` muestra la edición nueva y **Inicio** actualizó la tarjeta **Último boletín**.

### Antes de publicar la historia del mes

- [ ] Título con el nombre de la organización (define `/historias/<nombre>/`).
- [ ] **Presentación** completa (lugar, resumen corto, foto horizontal con texto alternativo y hasta 3 cifras).
- [ ] **Portada** con título de la historia y ficha técnica revisada.
- [ ] **Video** configurado (YouTube, MP4 < 20 MB, enlace `https://` o **Sin video**).
- [ ] **Crónica** pegada sin formato, con subtítulos en **Título 3** y citas en dos párrafos.
- [ ] **Galería**: cada foto tiene **Texto alternativo**, **Leyenda de la imagen** (pie) y **Descripción** (fotógrafo).
- [ ] Guardaste borrador con **Solo guardar** y revisaste **Vista previa**.
- [ ] Tras publicar: la nueva historia aparece en `/historias/` y en la sección **PaisSano destacado** (**Inicio**, **Proyectos destacados** y `/productores/`), y la anterior sigue en **Otras historias**.

---

## 10. Buscadores y redes (SEO) y a quién acudir

### Título, descripción e imagen para buscadores y redes

El sitio completa solos estos datos a partir del contenido que llenas, pero puedes personalizar cómo aparece cualquier página, boletín o historia en Google, WhatsApp o redes sociales desde la caja **Ajustes de SEO** (en un boletín o historia está debajo del título; en una página, abre **Cajas meta** al final del editor). En `/boletin/` y `/historias/` se muestran los datos que escribas en la edición o historia más reciente.

> **Imagen** `lamina-13-seo-ajustes-wordpress.png`: Caja «Ajustes de SEO» en WordPress (pestañas General y Social) con los campos 1 a 3.

> **Imagen** `lamina-13-seo-ajustes-sitio.png`: Vista previa del resultado en Google y de la tarjeta al compartir en redes con los elementos 1 a 3.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Meta título** *(pestaña General)* | Título azul en Google y título de la tarjeta al compartir. |
| ② | **Descripción meta** *(pestaña General)* | Resumen corto debajo del título en Google y al compartir. |
| ③ | **URL de la imagen social** *(pestaña Social)* | Fotografía de la tarjeta al compartir el enlace en WhatsApp o redes. |

**Consejos:** si dejas ①, ② o ③ vacíos, el sitio usa los valores automáticos de la portada. Si el contador de **Descripción meta** marca un aviso en naranja como `166 – Demasiado largo`, acorta el texto hasta que el contador quede en verde. Deja sin marcar **¿Eliminar el título del sitio?** salvo que quieras omitir «| La Paz Sí Pasa». **No se muestra al editor:** la pestaña de visibilidad y los campos separados por red social están ocultos para mantener la caja simple. Al terminar, haz clic en **Actualizar** o **Publicar**.

### A quién acudir

Si encuentras un error que no está en la sección 8, necesitas cambiar el menú principal o un cambio no aparece tras recargar, escribe al equipo técnico responsable del sitio indicando:

1. La dirección web donde ves el problema.
2. Qué estabas intentando hacer (por ejemplo: «publicar la Edición 03»).
3. Una captura de pantalla del mensaje o de cómo se ve.

---

## 11. Resumen en una hoja

### Publicar el boletín del mes

1. Entra a la dirección del sitio seguida de `/wp-admin` → **Boletines** → **Añadir edición**.
2. Escribe el título corto (`Edición XX`), que define la dirección `/boletin/edicion-XX/`.
3. En **Edición**, llena **Número de edición**, **Periodo**, texto del índice y **Créditos de fotografía** (un nombre por línea).
4. En **Portada**, llena **Titular**, **Sumario**, foto horizontal (con **Texto alternativo**) y **Crédito de la foto**.
5. En **Secciones**, llena las filas que vas a usar y borra con **−** las que no necesites.
6. Pega los textos sin formato (`Ctrl/Cmd + Shift + V`), aplica **Título 3** con `Shift + Alt + 3` (`Control + Option + 3` en Mac) y usa **Cita** en dos párrafos.
7. Haz clic en **Solo guardar** y revisa **Vista previa**.
8. Haz clic en **Publicar** (o programa fecha y hora).
9. Comprueba `/boletin/` y la tarjeta **Último boletín** en **Inicio**.

### Publicar la historia del mes

1. Entra a la dirección del sitio seguida de `/wp-admin` → **Historias PaisSana** → **Añadir historia**.
2. Escribe el nombre de la organización en el título (define `/historias/<nombre>/`).
3. En **Presentación**, llena **Lugar**, **Subtítulo en el catálogo**, **Resumen**, **Foto de la tarjeta** y hasta 3 **Cifras**.
4. En **Portada**, sube la **Foto de portada**, escribe **Título de la historia** y agrega las filas de **Ficha**.
5. En **Video**, elige **YouTube**, **Archivo MP4** (< 20 MB), **Enlace externo** (`https://`) o **Sin video**.
6. En **Crónica**, pega el texto sin formato (**Título 3** con atajo y **Cita** en dos párrafos) y añade fotos o recuadro de datos si aplica.
7. En **Galería**, pulsa **Add to gallery** (Añadir a la galería), sube las fotos y llena **Texto alternativo**, **Leyenda de la imagen** (pie) y **Descripción** (fotógrafo) en cada una.
8. Haz clic en **Solo guardar** y revisa **Vista previa**.
9. Haz clic en **Publicar** y comprueba `/historias/` y la sección **PaisSano destacado** en **Inicio**, **Proyectos destacados** y `/productores/`.
