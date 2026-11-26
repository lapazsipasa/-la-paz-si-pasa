> **Versión del 2026-11-25.** Manual general: cubre todos los contenidos que editas en el sitio. Cada formulario va con su lámina: la pantalla de WordPress y el componente del sitio que modifica, con los mismos números. Las imágenes no viven en el repo: van en los PDF que se entregan al Fondo (el general, 00, y uno por tipo, 01–10 en el orden del menú lateral de WordPress, generados desde este texto; la portada de cada manual por tipo toma el primer párrafo de su «Qué es y dónde aparece»). Los PDF también se ven en wp-admin (caja «Ayuda» y aviso de cada listado), desde `apps/wp-fse/manuales/`. Las claves de acceso nunca van aquí. Si cambias este texto, regenera los PDF ([cómo regenerarlos](../apps/wp-fse/tools/manual/README.md)) y actualiza esta fecha.

# Manual del editor — La Paz Sí Pasa

**Manual general: todos los contenidos del sitio**

Las páginas Inicio y Proyectos destacados, noticias, retratos, subcuentas, relatos sonoros, boletín, ferias, historias PaisSana, catálogo de productores y videos.

Versión del 25 de noviembre de 2026

Las claves de acceso se entregan por otro canal.

---

## Índice

1. Entrar al administrador y orientarte
2. Páginas Inicio y Proyectos destacados: editar sus campos
3. Noticias: publicar una noticia
4. Retratos de la Paz: publicar un retrato
5. Subcuentas: mantener los logos
6. Relatos sonoros: publicar un relato (El corazón del campo)
7. Boletín: publicar una edición, paso a paso
8. Ferias: publicar una feria (PaisSana en ferias)
9. Historia del mes: publicar la historia (PaisSano destacado)
10. Catálogo de productores: agregar, editar y retirar productores
11. Videos: publicar un video (Actualidad)
12. Escribir bien y preparar fotos
13. Revisar y publicar
14. Lo que NO debes tocar (y por qué)
15. Problemas frecuentes y qué hacer
16. Buscadores y redes (SEO)
17. A quién acudir
18. Resumen en una hoja

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

Al entrar verás una barra oscura a la izquierda. Con tu cuenta de **Editor** puedes crear, editar y publicar contenido y subir fotos. No necesitas entrar a ajustes ni instalar complementos (eso solo lo hace un Administrador). Cada entrada del menú alimenta una parte concreta del sitio; el manual general las explica todas.

> **Imagen** `captura-02-menu-lateral.png`: Menú lateral de WordPress con las secciones de contenido y Medios.

| Menú lateral | Para qué sirve | Dónde aparece en el sitio |
| --- | --- | --- |
| **Medios** | Ver o subir fotos, audios y archivos de video a la biblioteca. | En cualquier contenido donde los elijas. |
| **Páginas** | Cambiar los campos de **Inicio** y **Proyectos destacados** (foto de portada, banner, cifras y mapa). | En esas dos páginas (lo explica el manual de páginas o el manual general). |
| **Noticias** | Enlazar notas de prensa publicadas en otros medios. | En la línea de tiempo **Noticias** de **Inicio**. |
| **Retratos** | Publicar fotos con su descripción, proyecto y lugar. | En el carrusel **Retratos de la Paz** de **Inicio**. |
| **Subcuentas** | Mantener los logos de las subcuentas del Fondo. | En el carrusel **Conoce las subcuentas** de **Inicio**. |
| **Relatos sonoros** | Publicar audios grabados con productores. | En el reproductor **El corazón del campo** de **Proyectos destacados**. |
| **Boletines** | Publicar cada edición de *Caminos de Transformación*. | En `/boletin/` (siempre la más reciente), en `/boletin/edicion-XX/` y en la tarjeta **Último boletín** en **Inicio**. |
| **Ferias** | Publicar las ferias con fotos y videos verticales. | En el acordeón **PaisSana en ferias** de **Proyectos destacados**. |
| **Historias PaisSana** | Publicar la historia del mes (sección **PaisSano destacado**). | En `/historias/` (la más reciente y debajo **Otras historias**), en `/historias/<nombre>/`, y como tarjeta **Historia del mes** en **Inicio**, **Proyectos destacados** y **Productores** (`/productores/`). |
| **Productores** | Agregar, corregir o retirar productores del catálogo PaisSana. | En el catálogo `/productores/`, sus cifras, su buscador y las barras de distribución. |
| **Videos** | Publicar videos de YouTube o archivos MP4. | En la sección **Actualidad** de **Inicio** y, con la etiqueta PaisSana, en **Productores PaisSana** de **Proyectos destacados**. |

---

## 2. Páginas Inicio y Proyectos destacados: editar sus campos

### Qué es y dónde aparece

**Inicio** y **Proyectos destacados** tienen un diseño fijo: sus secciones y su orden están en el tema del sitio. Lo que sí cambias son unos pocos campos: la foto de portada de **Inicio**, el destino del banner **Más noticias del fondo**, y las cifras **Datos relevantes** y el mapa de regiones de **Proyectos destacados**.

### Antes de publicar

- [ ] Cambios hechos solo en **Cajas meta** (el área de bloques no se ve en el sitio).
- [ ] Foto de portada horizontal, de 1500 px de ancho y comprimida.
- [ ] Cifras con punto de miles (`3.402`) y de hasta 12 caracteres.
- [ ] Departamentos del mapa uno por línea, como `NOMBRE: número`.
- [ ] La página sigue publicada y con su dirección web de siempre.

### Dónde están los campos

1. En el menú lateral haz clic en **Páginas**.
2. Haz clic en **Inicio** o en **Proyectos destacados**.
3. Se abre el editor de bloques. Baja hasta el final y abre **Cajas meta**. Ahí están los campos.
4. Cambia lo que necesites y haz clic en **Actualizar**, arriba a la derecha.

**Importante:** lo que escribas en el área de bloques de estas páginas (el espacio grande del centro) **no aparece en el sitio**. Solo cuentan los campos de **Cajas meta**.

### Página Inicio

Los campos están en la caja **Configuración de la home**.

> **Imagen** `lamina-20-pagina-inicio-wordpress.png`: Caja «Configuración de la home» dentro de Cajas meta en la página Inicio (1 y 2).

> **Imagen** `lamina-20-pagina-inicio-sitio.png`: Foto de portada de Inicio y banner «Más noticias del fondo» con los elementos 1 y 2.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Imagen del hero** | Foto de fondo de la portada, detrás del logo. También se usa arriba en **Proyectos destacados**, **Productores**, **Boletín** e **Historias**. |
| ② | **URL del banner «Más noticias del fondo»** | Destino del banner al final de la sección de noticias (se abre en una pestaña nueva). |

**Consejos:** en ① sube una foto horizontal de 1500 px de ancho y comprimida; si es más ancha, WordPress la reduce a 1500 px al subirla. El logo no se cambia aquí. Si dejas ① vacía, el sitio usa su foto de fábrica; si dejas ② vacía, el banner lleva a la sala de prensa del Fondo.

### Página Proyectos destacados

Los campos están en la caja **Proyectos destacados · PaisSana**, en dos pestañas: **Datos relevantes (PaisSana)** y **Regiones del mapa**.

> **Imagen** `lamina-21-pagina-proyectos-wordpress.png`: Pestañas «Datos relevantes (PaisSana)» (1 a 6) y «Regiones del mapa» (7 y 8) de la página Proyectos destacados.

> **Imagen** `lamina-21-pagina-proyectos-sitio.png`: Cifras «Datos relevantes» y mapa de regiones en Proyectos destacados con los elementos 1 a 8.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Cifra 1** | Primer número de **Datos relevantes**. |
| ② | **Texto de la cifra 1** | Texto debajo del primer número. |
| ③ | **Cifra 2** | Segundo número de **Datos relevantes**. |
| ④ | **Texto de la cifra 2** | Texto debajo del segundo número. |
| ⑤ | **Cifra 3** | Tercer número de **Datos relevantes**. |
| ⑥ | **Texto de la cifra 3** | Texto debajo del tercer número. |
| ⑦ | **Caribe · productores** | Número grande sobre **PRODUCTORES** al elegir la región Caribe en el mapa. |
| ⑧ | **Caribe · departamentos** | Lista de departamentos con su número, debajo del total de la región. |

**Consejos:** en ①, ③ y ⑤ escribe el número tal como debe leerse, con punto de miles (`3.402`); caben hasta 12 caracteres. En ⑧ escribe **un departamento por línea**, con el formato `NOMBRE: número` (por ejemplo `SUCRE: 17`); una línea sin los dos puntos no se muestra. Si dejas un campo vacío, el sitio usa el valor que tenía de fábrica.

**El mapa tiene cinco regiones.** La lámina numera solo Caribe, pero la pestaña **Regiones del mapa** tiene el mismo par de campos para **Pacífica**, **Andina**, **Orinoquía** y **Amazonía** (*Región · productores* y *Región · departamentos*). Se llenan igual que ⑦ y ⑧. Los nombres, colores y dibujos de las regiones no se editan.

### Qué cambia en el sitio al actualizar estas páginas

- Los cambios se ven en cuanto pulsas **Actualizar**.
- Las cifras del catálogo (total de productores, departamentos…) **no** salen de aquí: se calculan solas con las entradas de **Productores**.

### Errores típicos

- **Escribí en el área de bloques y no se ve:** es lo esperado. Usa los campos de **Cajas meta**.
- **No veo la caja de campos:** abre **Cajas meta** al final del editor. Si aun así no aparece, puede que la página haya cambiado de dirección web (ver *Lo que NO debes tocar (y por qué)*).

---

## 3. Noticias: publicar una noticia

### Qué es y dónde aparece

Las noticias son enlaces a notas que ya salieron en otros medios. No tienen página propia en el sitio: aparecen en la línea de tiempo **Noticias** de **Inicio**, agrupadas por año, y cada una abre la nota original en una pestaña nueva.

### Antes de publicar

- [ ] Titular escrito tal como debe leerse en **Inicio**.
- [ ] **URL externa** completa, con `https://`.
- [ ] **Fecha de publicación** igual a la de la nota original: decide el año en que se agrupa.

### Dónde está

En el menú lateral, **Noticias**. Ahí ves la lista de todas las noticias.

### Crear o editar una noticia

1. Haz clic en **Noticias** y luego en **Añadir noticia**. Para corregir una que ya existe, haz clic sobre su titular en la lista.
2. En el campo superior (verás el texto guía *Titular de la noticia*), escribe el titular tal como quieres que se lea en **Inicio**.
3. En la caja **Datos de la noticia**, pega la **URL externa** y elige la **Fecha de publicación**.
4. Haz clic en **Publicar** (o **Actualizar** si la estás corrigiendo).

> **Imagen** `lamina-14-noticia-wordpress.png`: Formulario de una noticia en WordPress con el titular y la caja «Datos de la noticia» (1 a 3).

> **Imagen** `lamina-14-noticia-sitio.png`: Línea de tiempo «Noticias» en la página de Inicio con los elementos 1 a 3.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Titular de la noticia** *(campo superior de WordPress)* | Texto del enlace en la línea de tiempo **Noticias**. |
| ② | **URL externa** *(obligatorio)* | Destino del enlace: al hacer clic, la nota se abre en una pestaña nueva. |
| ③ | **Fecha de publicación** | Año en el que se agrupa la noticia y su orden dentro de ese año. |

**Consejos:** en ② pega la dirección completa, con `https://`. En ③ pon la fecha en que el medio publicó la nota; si la dejas vacía, el sitio usa la fecha en que publicaste la noticia en WordPress.

### Qué cambia en el sitio al publicar una noticia

- La línea de tiempo **Noticias** de **Inicio** se ordena sola, de la más reciente a la más antigua, y agrupa por año (el año más reciente arriba).
- Se muestran **como máximo 3 noticias por año**: las 3 más recientes de ese año. Si publicas una cuarta del mismo año, la más antigua de ese año deja de verse (sigue guardada en WordPress).
- Debajo de la línea de tiempo está el banner **Más noticias del fondo**; su destino se cambia en la página **Inicio** (lo explica el manual de páginas o el manual general).

### Errores típicos

- **La noticia no aparece:** revisa que tenga **URL externa** y que esté publicada. También puede ser que ya haya 3 noticias más recientes en ese año.
- **La noticia sale en el año equivocado:** corrige la **Fecha de publicación**; manda sobre la fecha de WordPress.

---

## 4. Retratos de la Paz: publicar un retrato

### Qué es y dónde aparece

Cada retrato es una foto con un texto corto, el proyecto y el lugar. Los retratos forman el carrusel **Retratos de la Paz** de **Inicio**.

### Antes de publicar

- [ ] Título interno que te sirva para encontrarlo (no se ve en el sitio).
- [ ] **Foto** de buena calidad.
- [ ] **Descripción** de menos de 500 caracteres que describa bien a la persona (es también su texto alternativo).
- [ ] **Proyecto** elegido.
- [ ] **Lugar** con el formato `Municipio, departamento`.

### Dónde está

En el menú lateral, **Retratos**.

### Crear o editar un retrato

1. Haz clic en **Retratos** y luego en **Añadir retrato**.
2. En el campo superior (*Título del retrato*), escribe un nombre que te sirva para encontrarlo en la lista (por ejemplo, el nombre de la persona). Este título **no** se muestra en el sitio.
3. En la caja **Retratos de la Paz**, llena los cuatro campos.
4. Haz clic en **Publicar**.

> **Imagen** `lamina-15-retrato-wordpress.png`: Formulario de un retrato en WordPress con la caja «Retratos de la Paz» (1 a 4).

> **Imagen** `lamina-15-retrato-sitio.png`: Carrusel «Retratos de la Paz» en la página de Inicio con los elementos 1 a 4.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Foto** *(obligatorio)* | Fotografía grande del carrusel. |
| ② | **Descripción** *(obligatorio)* | Párrafo junto a la foto (también es el texto alternativo de la foto). Máximo 500 caracteres. |
| ③ | **Proyecto** *(obligatorio)* | Debajo del rótulo **Proyecto:**. Eliges una opción: *Colombia Sostenible*, *PaisSana*, *PDET* o *Programa Piloto de Inversiones Prioritarias en Municipios PDET*. |
| ④ | **Lugar** *(obligatorio)* | Debajo del rótulo **Lugar:**. Máximo 120 caracteres. |

**Consejos:** en ① sube una foto de buena calidad. La **Descripción** de ② también es la que leen en voz alta los lectores de pantalla, así que describe bien a la persona. En ④ usa el formato `Municipio, departamento`.

### Qué cambia en el sitio al publicar un retrato

- El retrato publicado más reciente pasa a ser la **primera diapositiva** del carrusel. Los demás siguen detrás, del más nuevo al más antiguo, y se recorren con las flechas.
- Un retrato sin foto (o cuya foto se borró de **Medios**) no se muestra.

### Errores típicos

- **Borré una foto de Medios y el retrato desapareció:** vuelve a subirla y elígela otra vez en **Foto**.
- **El texto se corta al escribir:** la **Descripción** admite hasta 500 caracteres; resume.

---

## 5. Subcuentas: mantener los logos

### Qué es y dónde aparece

Cada subcuenta del Fondo tiene su logo en el carrusel **Conoce las subcuentas** de **Inicio**.

### Antes de publicar

- [ ] Nombre completo de la subcuenta en el título (lo leen los lectores de pantalla).
- [ ] **Logo** en PNG con fondo transparente.
- [ ] **Orden** sin repetir (deja saltos: `10`, `20`, `30`…).
- [ ] **Plantilla** en **Plantilla por defecto**.

### Dónde está

En el menú lateral, **Subcuentas**.

### Crear o editar una subcuenta

1. Haz clic en **Subcuentas** y luego en **Añadir subcuenta**. Para cambiar un logo, haz clic sobre la subcuenta en la lista.
2. En el campo superior (*Nombre de la subcuenta*), escribe el nombre completo. No se ve escrito en el sitio, pero es lo que leen en voz alta los lectores de pantalla.
3. En la caja **Datos de la subcuenta**, sube el **Logo**.
4. En la caja **Atributos de entrada** de la derecha, escribe el **Orden**.
5. Haz clic en **Publicar** (o **Actualizar**).

> **Imagen** `lamina-19-subcuenta-wordpress.png`: Formulario de una subcuenta en WordPress con el logo y la caja «Atributos de entrada» (1 y 2).

> **Imagen** `lamina-19-subcuenta-sitio.png`: Carrusel «Conoce las subcuentas» en la página de Inicio con los elementos 1 y 2.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Logo** *(obligatorio)* | Logo dentro del carrusel. |
| ② | **Orden** *(caja Atributos de entrada)* | Posición del logo en el carrusel. |

**Consejos:** en ① usa un PNG con fondo transparente (WordPress no admite SVG). En ② el número menor va primero; deja saltos (`10`, `20`, `30`…) para poder meter una subcuenta en medio sin renumerar todas. En **Plantilla** deja **Plantilla por defecto**.

### Qué cambia en el sitio al publicar una subcuenta

- El carrusel se reordena solo según el **Orden** y se recorre con las flechas.
- Una subcuenta sin logo no se muestra.

### Errores típicos

- **El logo se ve con un recuadro blanco:** el archivo no tiene fondo transparente. Pide el logo en PNG con fondo transparente.
- **Dos logos cambiaron de lugar:** tienen el mismo **Orden**. Dale a cada uno un número distinto.

---

## 6. Relatos sonoros: publicar un relato (El corazón del campo)

### Qué es y dónde aparece

Los relatos sonoros son audios grabados con productores. Se escuchan en el reproductor **El corazón del campo** de **Proyectos destacados**.

### Antes de publicar

- [ ] Título interno que te sirva para encontrarlo (no se ve en el sitio).
- [ ] **Productor**, **Marca o producto** y **Lugar** (`Municipio, departamento`) llenos.
- [ ] Audio en MP3 (o M4A u OGG) de menos de 10 MB.
- [ ] **Duración en segundos** escrita como número (2 min 30 s es `150`) o vacía.
- [ ] **Orden** distinto del de los demás relatos.

### Dónde está

En el menú lateral, **Relatos sonoros**.

### Crear o editar un relato

1. Haz clic en **Relatos sonoros** y luego en **Añadir relato sonoro**.
2. En el campo superior (*Título interno del relato*), escribe un nombre que te sirva para encontrarlo. Este título **no** se muestra en el sitio.
3. En la caja **Datos del relato sonoro**, llena los campos y sube el audio.
4. Haz clic en **Publicar**.

> **Imagen** `lamina-17-relato-sonoro-wordpress.png`: Formulario de un relato sonoro en WordPress con la caja «Datos del relato sonoro» (1 a 6).

> **Imagen** `lamina-17-relato-sonoro-sitio.png`: Reproductor «El corazón del campo» en Proyectos destacados con los elementos 1 a 6.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Productor** *(obligatorio)* | Nombre en grande junto al botón de reproducir. |
| ② | **Marca o producto** *(obligatorio)* | Línea debajo del nombre. |
| ③ | **Lugar** *(obligatorio)* | Línea debajo de la marca. |
| ④ | **Archivo de audio** *(obligatorio)* | Audio que suena al pulsar el botón de reproducir. |
| ⑤ | **Duración en segundos** | Tiempo total que se ve al lado derecho de la barra de avance. |
| ⑥ | **Orden** | Lugar del relato al recorrerlos con las flechas. |

**Consejos:** en ③ usa el formato `Municipio, departamento`. En ④ sube un MP3 (también sirven M4A y OGG) de menos de 10 MB. En ⑤ escribe solo el número: un audio de 2 minutos y 30 segundos es `150`; si lo dejas vacío, el reproductor lo lee del archivo. En ⑥ el número menor va primero. El campo **Subtítulos** aparece en gris y desactivado: el sitio no lo muestra, así que no hace falta llenarlo.

### Qué cambia en el sitio al publicar un relato

- El reproductor carga primero el relato con el **Orden** más bajo. Las flechas pasan al siguiente o al anterior.
- Los relatos sin **Orden** van al final.

### Errores típicos

- **El relato nuevo salió primero sin querer:** revisa el **Orden**; dos relatos con el mismo número pueden cambiar de lugar.
- **El audio tarda en empezar:** el archivo es muy pesado. Vuelve a exportarlo como MP3 comprimido y reemplázalo.

---

## 7. Boletín: publicar una edición, paso a paso

### Qué es y dónde aparece

El boletín *Caminos de Transformación* sale una vez al mes y cada edición es una entrada propia. La más reciente se ve en `/boletin/` y en la tarjeta **Último boletín** de **Inicio**; las anteriores siguen en su dirección (`/boletin/edicion-XX/`) y en la lista **Otras ediciones**.

Tú llenas los textos y las fotos. El sitio arma solo las tarjetas del índice «En esta edición», la numeración de las secciones (`01`, `02`, `03`…), la barra superior de secciones y la lista **Otras ediciones** al final.

### Antes de publicar

- [ ] Título corto correcto (`Edición XX`), con **Número de edición** y **Periodo** llenos.
- [ ] **Portada** completa: titular, sumario, foto horizontal con texto alternativo y crédito.
- [ ] Secciones que no usas **borradas** (si quedan vacías, sale «Validación fallida»).
- [ ] Cada sección tiene **Nombre de la sección**, **Índice: título** (en Cifras, Tarjetas y Agenda) e imagen y resumen del índice.
- [ ] Textos pegados sin formato, subtítulos en **Título 3** y citas en dos párrafos.
- [ ] **Créditos de fotografía** del pie escritos uno por línea (sin «Fotografía:»).
- [ ] Guardaste con **Solo guardar** y revisaste **Vista previa** en computador y celular.

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

**Consejos:** ③ y ④ son opcionales; en ⑤ elige una foto horizontal y llena su **Texto alternativo** (cómo, en *Escribir bien y preparar fotos*); en ⑥ sí escribe `Fotografía: Nombre Apellido`.

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
| ② | **Subtítulo de la sección** | Línea corta junto al nombre en la cabecera de la sección. |
| ③ | **Índice: título** | Título enlazado dentro de la tarjeta de «En esta edición». |
| ④ | **Índice: imagen** | Foto horizontal de la tarjeta en «En esta edición» (recomendada 16:10). |
| ⑤ | **Índice: resumen** | Texto breve de la tarjeta en «En esta edición». |

**Consejos:** ③ es obligatorio en Cifras, Tarjetas y Agenda (en Artículo, si queda vacío, usa el **Título** del artículo); en ④, si queda vacío en Artículo toma la primera foto del artículo, pero en los demás moldes conviene subir una foto horizontal.

### Molde Artículo

Para pegar el texto, los subtítulos y las citas sigue las reglas de *Escribir bien y preparar fotos*.

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

### Qué cambia en el sitio al publicar un boletín

En cuanto publicas:

- `/boletin/` pasa a mostrar la edición nueva de forma automática (siempre muestra la edición publicada con fecha más reciente).
- La tarjeta **Último boletín** en **Inicio** se actualiza sola con el nuevo titular, número, periodo, sumario y foto de portada.
- La copia guardada de las páginas se renueva automáticamente.

---

## 8. Ferias: publicar una feria (PaisSana en ferias)

### Qué es y dónde aparece

Cada feria es una fila del acordeón **PaisSana en ferias** de **Proyectos destacados**. Al abrirla se ven su texto, su galería de fotos y sus videos verticales.

### Antes de publicar

- [ ] Nombre de la feria como debe leerse y **Descripción** de menos de 800 caracteres.
- [ ] Hasta 6 fotos en **Galería**, ya reducidas y con **Texto alternativo**.
- [ ] Videos verticales (9:16) sin filas vacías; cada MP4 de menos de 32 MB y con su **Miniatura del video**.
- [ ] **Orden** escrito.
- [ ] **Abierta por defecto** marcada en una sola feria.

### Dónde está

En el menú lateral, **Ferias**.

### Crear o editar una feria

1. Haz clic en **Ferias** y luego en **Añadir feria**.
2. En el campo superior (*Nombre de la feria*), escribe el nombre como debe leerse en el sitio.
3. En la caja **Datos de la feria**, escribe la **Descripción** y sube las fotos en **Galería** con **Add to gallery** (Añadir a la galería).
4. Si tienes videos verticales, haz clic en **Añadir video** una vez por video. En cada fila elige el **Origen** (**YouTube** o **Archivo MP4 subido a WordPress**) y llena su campo.
5. Escribe el **Orden** y decide si la feria va **Abierta por defecto**.
6. Haz clic en **Publicar**.

> **Imagen** `lamina-18-feria-wordpress.png`: Formulario de una feria en WordPress con el nombre y la caja «Datos de la feria» (1 a 5).

> **Imagen** `lamina-18-feria-sitio.png`: Feria abierta en el acordeón «PaisSana en ferias» de Proyectos destacados con los elementos 1 a 5.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Nombre de la feria** *(campo superior de WordPress)* | Título de la fila del acordeón. |
| ② | **Descripción** *(obligatorio)* | Texto que se lee al abrir la feria. Máximo 800 caracteres. |
| ③ | **Galería** | Bloque **GALERÍA FOTOGRÁFICA** (hasta 6 fotos); cada foto se amplía al hacer clic. |
| ④ | **Videos verticales** | Tarjeta de video a la derecha; con varios videos se pasa de uno a otro con flechas. |
| ⑤ | **Abierta por defecto** | La feria aparece ya abierta al cargar la página. |

**Consejos:** en ③ sube fotos ya reducidas y llena el **Texto alternativo** de cada una. En ④ los videos deben ser verticales (9:16); las direcciones de Shorts (`youtube.com/shorts/…`) sirven tal cual. Para un MP4, sube también la **Miniatura del video**. **Pie del video** es opcional y aparece debajo del video. Marca ⑤ en **una sola** feria.

### Cómo subir los videos: YouTube o directo a WordPress

Cada video de la feria puede venir de donde te quede más fácil. En cada fila, el campo **Origen** te deja elegir:

- **YouTube:** si el video ya está publicado en YouTube (o en Shorts), elige **YouTube** y pega su dirección completa en **URL de YouTube**. Es lo más liviano para el sitio. Si dejas vacía la **Miniatura del video**, se usa la de YouTube.
- **Archivo MP4 subido a WordPress:** si tienes el archivo en tu equipo y no está en YouTube, elige **Archivo MP4 subido a WordPress** y súbelo en el campo de archivo. Debe ser vertical (9:16), ya comprimido y de menos de 32 MB. En este caso sube también la **Miniatura del video** (la imagen que se ve antes de darle play).

Al cambiar el **Origen**, la fila muestra solo el campo que corresponde: la dirección de YouTube o el archivo. Puedes mezclar en la misma feria videos de YouTube y videos subidos.

### Qué cambia en el sitio al publicar una feria

- Las ferias se ordenan por **Orden**: el número menor va arriba. Las que no tienen **Orden** van al final.
- Solo puede haber una feria abierta a la vez. Si marcas ⑤ en varias, se abre la primera de la lista; si no marcas ninguna, todas empiezan cerradas.
- Una feria sin videos ocupa todo el ancho con su texto y sus fotos.

### Errores típicos

- **No puedo añadir más fotos:** la **Galería** admite como máximo 6.

---

## 9. Historia del mes: publicar la historia (PaisSano destacado)

### Qué es y dónde aparece

Cada mes se publica la historia de una organización productora. La más reciente ocupa la sección **PaisSano destacado**: se lee completa en `/historias/` y sale como tarjeta **Historia del mes** en **Inicio**, **Proyectos destacados** y `/productores/`. Las anteriores siguen en su dirección (`/historias/<nombre>/`) y en **Otras historias**.

### Antes de publicar

- [ ] Título con el nombre de la organización (define `/historias/<nombre>/`).
- [ ] **Presentación** completa: lugar, resumen corto, foto horizontal con texto alternativo y hasta 3 cifras.
- [ ] **Portada** con el título de la historia y la ficha técnica revisada.
- [ ] **Video** configurado: YouTube, MP4 de menos de 20 MB, enlace `https://` o **Sin video**.
- [ ] **Crónica** pegada sin formato, con subtítulos en **Título 3** y citas en dos párrafos.
- [ ] **Galería**: cada foto tiene **Texto alternativo**, **Leyenda de la imagen** (pie) y **Descripción** (fotógrafo).
- [ ] Guardaste con **Solo guardar** y revisaste **Vista previa**.

### Crear la historia

1. En el menú lateral haz clic en **Historias PaisSana** y luego en **Añadir historia**.
2. En el campo superior del título (*Nombre de la organización*), escribe el nombre de la organización (ejemplo: `Asocafé`). Ese título define la dirección web (`/historias/asocafe/`).
3. Recorre las cinco pestañas en orden.
4. Al terminar las pestañas, haz clic en **Solo guardar**, revisa **Vista previa** y pulsa **Publicar** (o programa la fecha); es lo mismo que en *Revisar y publicar*.

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
- Editar una historia antigua **no** la vuelve destacada (manda la fecha de publicación).

---

## 10. Catálogo de productores: agregar, editar y retirar productores

### Qué es y dónde aparece

El catálogo de `/productores/` muestra las organizaciones productoras de PaisSana con su buscador, sus filtros y las barras por departamento y categoría. Cada productor es una entrada de **Productores**; el catálogo y sus cifras totales, que también salen en **Inicio** y **Proyectos destacados**, se actualizan solos.

### Antes de publicar

- [ ] Nombre de la organización en el título.
- [ ] **Municipio** lleno y **1** departamento marcado.
- [ ] **Productos** escritos uno por línea, sin guiones ni viñetas.
- [ ] **1 o más** categorías marcadas.
- [ ] **1** tiempo de operación marcado y una etnia solo si aplica.

### Buscar y editar un productor

1. En el menú lateral haz clic en **Productores**.
2. Usa el buscador de arriba a la derecha para encontrar al productor por nombre y haz clic sobre él.
3. Corrige lo que necesites y haz clic en **Actualizar**.

### Agregar un productor nuevo

Haz clic en **Productores** y luego en **Añadir productor**. Completa el título, la caja **Datos del productor** y las cajas de clasificación de la columna derecha (el ejemplo de las imágenes corresponde a la organización *Asociacion de Productores de Especies Menores del Sur del Tolima*).

> **Imagen** `lamina-12-productor-tarjeta-wordpress.png`: Formulario de un productor en WordPress con sus datos y cajas de clasificación (1 a 7). En tu pantalla, Etnias, Poblaciones y Tiempos de operación están en la columna derecha; aquí se agruparon abajo para que se lean mejor.

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

## 11. Videos: publicar un video (Actualidad)

### Qué es y dónde aparece

Los videos forman la sección **Actualidad** de **Inicio**: el más reciente es el video destacado grande y, debajo, el carrusel **Ver más:** lleva los demás. Con la etiqueta **PaisSana**, el video también sale en **Productores PaisSana** de **Proyectos destacados**.

### Antes de publicar

- [ ] Título que verá el público y **Descripción** de menos de 500 caracteres.
- [ ] **Fuente del video** correcta: **YouTube** o **Archivo MP4 subido a WordPress**.
- [ ] Con YouTube: la dirección completa de un video público.
- [ ] Con MP4: archivo de menos de 32 MB y su **Miniatura**.
- [ ] 1 o 2 **Etiquetas**.

### Dónde está

En el menú lateral, **Videos**.

### Crear o editar un video

1. Haz clic en **Videos** y luego en **Añadir video**.
2. En el campo superior (*Título del video*), escribe el título que verá el público.
3. En la caja **Datos del video**, escribe la **Descripción**.
4. En **Fuente del video**, elige **YouTube** o **Archivo MP4 subido a WordPress**. Solo se pide el campo que corresponde.
5. Si elegiste YouTube, pega la **URL de YouTube**. Si elegiste MP4, sube el archivo en **Archivo de video (MP4)** y una **Miniatura**.
6. Elige las **Etiquetas** y haz clic en **Publicar**.

> **Imagen** `lamina-16-video-wordpress.png`: Formulario de un video en WordPress con el título y la caja «Datos del video» (1 a 5).

> **Imagen** `lamina-16-video-sitio.png`: Video destacado de la sección «Actualidad» en la página de Inicio con los elementos 1 a 5.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Título del video** *(campo superior de WordPress)* | Título del video destacado y de su tarjeta en **Ver más:**. |
| ② | **Descripción** *(obligatorio)* | Párrafo junto al video destacado. Máximo 500 caracteres. |
| ③ | **URL de YouTube** *(obligatorio si la fuente es YouTube)* | Video que se reproduce al pulsar el botón de play. |
| ④ | **Miniatura** | Imagen que se ve antes de reproducir. |
| ⑤ | **Etiquetas** *(obligatorio)* | Rótulos junto a **Etiquetas:**, debajo de la descripción. |

**Consejos:** en ③ pega la dirección normal del video (la que copias del navegador o del botón **Compartir** de YouTube); el sitio la convierte solo. En ④, con YouTube puedes dejarla vacía y se usa la miniatura del video; con MP4 súbela siempre, o el video se verá sin imagen. En ⑤ elige 1 o 2 entre *PaisSana*, *Colombia Sostenible*, *PDET* y *Actualidad*.

### Qué cambia en el sitio al publicar un video

- El video publicado más reciente pasa a ser el **destacado** de **Actualidad**. Los demás quedan en el carrusel **Ver más:**; al hacer clic en uno, ocupa el lugar del destacado.

### Errores típicos

- **El video no se reproduce:** revisa que la **URL de YouTube** sea de un video público y que esté completa. Si es un MP4, comprueba que **Fuente del video** diga **Archivo MP4 subido a WordPress**.
- **El MP4 no sube:** el sitio acepta archivos de hasta 32 MB. Para videos más largos, súbelos a YouTube y usa esa fuente.

---

## 12. Escribir bien y preparar fotos

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

## 13. Revisar y publicar

1. Mientras trabajas, haz clic en **Solo guardar** con frecuencia. **Solo guardar** funciona aunque todavía falten campos obligatorios.
2. Antes de revisar cómo se ve, haz clic en **Solo guardar** y luego en **Vista previa** (en pantalla puede leerse «Vistra previa»). Si no guardas primero, los cambios recientes pueden no verse en la vista previa.
3. Cuando todo esté listo:
   - Para publicar de inmediato: haz clic en **Publicar**.
   - Para programar fecha y hora: en el panel derecho, junto a **Publicar inmediatamente**, haz clic en **Editar**, elige fecha y hora, pulsa **Aceptar** y luego **Programar**.

> **Imagen** `captura-08-panel-publicar.png`: Panel lateral Publicar con Solo guardar, Vista previa, programación y el botón Publicar.

**En las páginas Inicio y Proyectos destacados** el editor es otro y no tiene este panel: los botones **Vista previa** y **Actualizar** están arriba a la derecha. Los cambios se guardan y se ven en el sitio al pulsar **Actualizar** (lo explica el manual de páginas o el manual general).

---

## 14. Lo que NO debes tocar (y por qué)

Tu cuenta de **Editor** puede ver la sección **Páginas**, pero hay tres páginas base que sostienen la estructura del sitio. **No las borres, no las pases a borrador y no les cambies la dirección web:**

- **Inicio** (`/`): es la portada principal del sitio.
- **Proyectos destacados** (`/proyectos-destacados/`): contiene la presentación de PaisSana. Si le cambias la dirección web, la página pierde su diseño y desaparece su caja de campos (cifras y mapa).
- **Productores PaisSana** (`/productores/`): es la página que muestra el catálogo completo. Si le cambias la dirección web, el catálogo y los botones que llevan a él dejarán de funcionar.

**Sí puedes** abrir **Inicio** y **Proyectos destacados** para cambiar sus campos en **Cajas meta** (foto de portada, banner, cifras y mapa); lo explica el manual de páginas o el manual general. Lo que no cambia es su estructura: el orden y el diseño de sus secciones están en el tema del sitio, y lo que escribas en el área de bloques de esas páginas no se muestra. No pierdas tiempo añadiendo, moviendo o borrando bloques ahí.

Tampoco modifiques plantillas, estilos, el menú principal ni complementos o usuarios (si necesitas cambiar el menú principal o crear un usuario, pídelo al equipo administrador).

> **Imagen** `captura-12-paginas-protegidas.png`: Lista de Páginas con Inicio, Proyectos destacados y Productores PaisSana, las tres páginas base que no debes borrar ni cambiar de dirección web.

---

## 15. Problemas frecuentes y qué hacer

| Problema | Por qué pasa y cómo resolverlo |
| --- | --- |
| **«Validación fallida» al pulsar Publicar** | Falta algún campo obligatorio (marcado con asterisco rojo `*`) o dejaste vacía alguna de las 8 secciones precargadas del boletín. Sube por la página, busca los recuadros marcados en rojo, llénalos o borra con **−** las secciones que no vas a usar. |
| **Publiqué o edité algo y no lo veo en el sitio** | El sitio guarda copias rápidas de las páginas, pero las renueva solas al publicar, editar o borrar un boletín, historia, productor, noticia, retrato, video, relato sonoro, feria, subcuenta, página, menú o al renombrar un departamento o categoría. Haz una recarga forzada manteniendo **`Ctrl + F5`** (Windows) o **`Cmd + Shift + R`** (Mac), o abre la página en una ventana de incógnito. Si pasados unos minutos sigue sin cambiar, avisa al equipo técnico. |
| **Una foto sale recortada o cortó una cara** | Se subió una foto vertical en un espacio horizontal (portada, tarjeta o apertura). Reemplázala por una foto horizontal o recórtala en horizontal antes de subirla. |
| **Una cita se ve rara** | Probablemente quedó en un solo párrafo o en tres. Abre el texto, deja la frase en el primer párrafo de la cita, pulsa **Enter** y pon solo el autor en el segundo párrafo. |
| **Subí un video MP4 y no carga o tarda demasiado** | El archivo es muy pesado (el límite es 32 MB y lo ideal es menos de 20 MB). Súbelo a YouTube y cambia el campo de origen a **YouTube**: en una historia, pestaña **Video** → **Origen del video**; en un video, **Fuente del video**; en una feria, **Origen** en la fila del video. Luego pega la **URL de YouTube**. |
| **Publiqué por error antes de tiempo** | Abre la entrada, en el panel derecho busca **Estado: Publicada**, haz clic en **Editar**, cámbialo a **Borrador**, pulsa **Aceptar** y luego **Actualizar**. Desaparece del sitio al instante. |
| **Una noticia publicada no aparece en Inicio** | Se muestran como máximo 3 noticias por año, las más recientes según su **Fecha de publicación**. Revisa esa fecha y que la noticia tenga **URL externa**. |
| **El carrusel, el reproductor o el acordeón salen en otro orden** | Retratos y videos se ordenan por fecha de publicación (el más nuevo primero). Subcuentas, relatos sonoros y ferias se ordenan por su campo **Orden** (el número menor primero). Revisa ese campo. |
| **Cambié algo en el área de bloques de Inicio o Proyectos destacados y no se ve** | Esas páginas solo leen los campos de **Cajas meta**. Abre **Cajas meta** al final del editor y cambia ahí el campo. |
| **Borré una entrada por error** | Entra a la sección del menú donde estaba (**Boletines**, **Historias PaisSana**, **Productores**, **Noticias**, **Retratos**, **Videos**, **Relatos sonoros**, **Ferias** o **Subcuentas**), haz clic en **Papelera** arriba de la lista, pasa el cursor sobre la entrada y haz clic en **Restaurar**. |

---

## 16. Buscadores y redes (SEO)

### Título, descripción e imagen para buscadores y redes

El sitio completa solos estos datos a partir del contenido que llenas, pero puedes personalizar cómo aparece cualquier página, boletín o historia en Google, WhatsApp o redes sociales desde la caja **Ajustes de SEO** (en un boletín o historia está debajo del título; en una página, abre **Cajas meta** al final del editor). En `/boletin/` y `/historias/` se muestran los datos que escribas en la edición o historia más reciente. Noticias, retratos, videos, relatos sonoros, ferias y subcuentas no tienen página propia (solo se ven dentro de **Inicio** o **Proyectos destacados**), así que no llevan esta caja.

> **Imagen** `lamina-13-seo-ajustes-wordpress.png`: Caja «Ajustes de SEO» en WordPress (pestañas General y Social) con los campos 1 a 3.

> **Imagen** `lamina-13-seo-ajustes-sitio.png`: Vista previa del resultado en Google y de la tarjeta al compartir en redes con los elementos 1 a 3.

| Nº | Campo en WordPress | Dónde aparece en el sitio |
| --- | --- | --- |
| ① | **Meta título** *(pestaña General)* | Título azul en Google y título de la tarjeta al compartir. |
| ② | **Descripción meta** *(pestaña General)* | Resumen corto debajo del título en Google y al compartir. |
| ③ | **URL de la imagen social** *(pestaña Social)* | Fotografía de la tarjeta al compartir el enlace en WhatsApp o redes. |

**Consejos:** si dejas ①, ② o ③ vacíos, el sitio usa los valores automáticos de la portada. Si el contador de **Descripción meta** marca un aviso en naranja como `166 – Demasiado largo`, acorta el texto hasta que el contador quede en verde. Deja sin marcar **¿Eliminar el título del sitio?** salvo que quieras omitir «| La Paz Sí Pasa». **No se muestra al editor:** la pestaña de visibilidad y los campos separados por red social están ocultos para mantener la caja simple. Al terminar, haz clic en **Actualizar** o **Publicar**.

---

## 17. A quién acudir

Si encuentras un error que no está en *Problemas frecuentes y qué hacer*, necesitas cambiar el menú principal o un cambio no aparece tras recargar, escribe al equipo técnico responsable del sitio indicando:

1. La dirección web donde ves el problema.
2. Qué estabas intentando hacer (por ejemplo: «publicar un contenido nuevo» o «cambiar una foto»).
3. Una captura de pantalla del mensaje o de cómo se ve.

---

## 18. Resumen en una hoja

Entra a la dirección del sitio seguida de `/wp-admin`. Pega siempre los textos sin formato (`Ctrl/Cmd + Shift + V`) y llena el **Texto alternativo** de cada foto.

### Boletín del mes

1. **Boletines** → **Añadir edición** → título corto `Edición XX` (define `/boletin/edicion-XX/`).
2. **Edición:** **Número de edición**, **Periodo**, texto del índice y **Créditos de fotografía** (un nombre por línea).
3. **Portada:** **Titular**, **Sumario**, foto horizontal y **Crédito de la foto**.
4. **Secciones:** llena las que usas y borra con **−** las demás. Subtítulos en **Título 3**, **Cita** en dos párrafos.
5. **Solo guardar** → **Vista previa** → **Publicar**. Comprueba `/boletin/` y **Último boletín** en **Inicio**.

### Historia del mes

1. **Historias PaisSana** → **Añadir historia** → nombre de la organización (define `/historias/<nombre>/`).
2. **Presentación**, **Portada**, **Video** (YouTube, MP4 < 20 MB, enlace o **Sin video**), **Crónica** y **Galería** (pie y fotógrafo en cada foto).
3. **Solo guardar** → **Vista previa** → **Publicar**. Comprueba `/historias/` y **PaisSano destacado**.

### Otros contenidos (luego **Publicar** o **Actualizar**)

- **Productor:** **Productores** → **Añadir productor** → nombre, **Municipio**, productos y cajas de la derecha. Sale en `/productores/`.
- **Noticia:** titular, **URL externa** y **Fecha de publicación**. Sale en **Noticias** de **Inicio** (máximo 3 por año).
- **Retrato:** **Foto**, **Descripción**, **Proyecto** y **Lugar**. Abre el carrusel **Retratos de la Paz**.
- **Video:** título, **Descripción**, **Fuente del video**, URL o MP4 con **Miniatura**, y **Etiquetas**. Destacado en **Actualidad**.
- **Relato sonoro:** productor, marca, lugar, audio, duración y **Orden**. Suena en **El corazón del campo**.
- **Feria:** **Descripción**, **Galería** (hasta 6), **Videos verticales**, **Orden** y **Abierta por defecto**.
- **Subcuenta:** **Logo** y **Orden**. Sale en **Conoce las subcuentas** de **Inicio**.
- **Páginas:** **Inicio** o **Proyectos destacados** → **Cajas meta** → **Actualizar**. No toques los bloques.
