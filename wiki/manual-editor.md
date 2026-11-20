> **Borrador revisado (2026-11-20).** Contrastado campo por campo con los formularios. Faltan las capturas marcadas `[CAPTURA: …]`, un punto por confirmar en pantalla y confirmar en pantalla los nombres de la caja de SEO cuando el plugin quede instalado. La versión para el equipo del Fondo se entrega como documento de Google; las claves nunca van aquí.

# Manual del editor — La Paz Sí Pasa

Guía práctica para publicar cada mes el boletín *Caminos de Transformación*, actualizar la historia PaisSana del mes y mantener el catálogo de productores en **La Paz Sí Pasa**, sin necesidad de programar ni tocar el diseño del sitio.

---

## 1. Entrar al administrador y orientarte

### Cómo iniciar sesión

1. Abre tu navegador y entra a la dirección del sitio seguida de `/wp-admin` (por ejemplo: `https://lapazsipasa.com/wp-admin`).
2. Escribe tu **Nombre de usuario o correo electrónico** y tu **Contraseña** (las credenciales se entregan por aparte).
3. Haz clic en **Acceder**.

[CAPTURA 1: Pantalla de inicio de sesión de WordPress en `/wp-admin`.]

Si alguna vez olvidas tu contraseña, haz clic en **¿Olvidaste tu contraseña?** en esa misma pantalla y recibirás un correo para crear una nueva. También puedes cambiar tu clave en cualquier momento desde **Perfil** en el menú lateral.

### Qué menú vas a usar

Al entrar verás una barra oscura a la izquierda. Con tu cuenta de **Editor** puedes crear, editar y publicar contenido y subir fotos. No necesitas entrar a ajustes ni instalar complementos (eso solo lo hace un Administrador).

Las cuatro secciones con las que vas a trabajar cada mes son:

| Menú lateral | Para qué sirve | Dónde aparece en el sitio |
|---|---|---|
| **Boletines** | Publicar cada edición de *Caminos de Transformación*. | En `/boletin/` (siempre la más reciente), en `/boletin/edicion-XX/` y en la tarjeta **Último boletín** en **Inicio**. |
| **Historias PaisSana** | Publicar la historia del mes («PaisSano destacado»). | En `/historias/` (la más reciente y debajo **Otras historias**), en `/historias/<nombre>/`, y como tarjeta destacada en **Inicio**, **Proyectos destacados** y **Productores** (`/productores/`). |
| **Productores** | Agregar, corregir o retirar productores del catálogo PaisSana. | En el catálogo `/productores/`, sus cifras, su buscador y las barras de distribución. |
| **Medios** | Ver o subir fotos y archivos de video a la biblioteca. | En cualquier boletín o historia donde los elijas. |

[CAPTURA 2: Menú lateral de WordPress con **Boletines**, **Historias PaisSana**, **Productores** y **Medios** resaltados.]

---

## 2. Publicar una edición del boletín, paso a paso

Cada edición del boletín es una entrada independiente. El sitio arma solo las tarjetas del índice «En esta edición», la numeración de las secciones (`01`, `02`, `03`…), la barra superior de secciones y la lista de **Otras ediciones** al final.

### Paso 1: Crear la edición y ponerle título

1. En el menú lateral haz clic en **Boletines** y luego en **Añadir edición**.
2. En el campo superior del título (verás el texto guía *Edición 03*), escribe el nombre corto de la edición. Por ejemplo: `Edición 02`.
   - **Ojo:** este título **no** es el titular grande de la portada. Define la dirección web de la edición (`/boletin/edicion-02/`) y el nombre que aparecerá en **Otras ediciones**.

[CAPTURA 3: Parte superior de **Añadir edición** mostrando el campo de título y las pestañas **Edición**, **Portada** y **Secciones**.]

### Paso 2: Llenar la pestaña **Edición**

Haz clic en la pestaña **Edición** (abre seleccionada por defecto) y completa:

1. **Número de edición** *(obligatorio)*: escribe solo el número. Ejemplo: `2` (el sitio muestra `02`).
2. **Periodo** *(obligatorio)*: los meses que cubre la edición. Ejemplo: `Octubre – Noviembre 2026`.
3. **Texto de la franja superior**: aparece en la cinta superior del boletín. Puedes dejar el texto que ya viene puesto (*Boletín · Jefatura de Relacionamiento Estratégico y Comunicaciones*).
4. **Texto de «En esta edición»**: un párrafo corto que presenta el índice de tarjetas. Ejemplo de la edición 02: *«Ocho secciones con los resultados, las historias y los aliados que marcaron los meses de octubre y noviembre. Entre a cualquiera desde aquí.»*
5. **Créditos de fotografía**: escribe **un nombre por línea**, sin poner la palabra «Fotografía:» antes. Se muestran en el pie del boletín. Ejemplo:
   ```text
   Fernando López Ríos
   Camila Galindo Muñoz
   ```

### Paso 3: Llenar la pestaña **Portada**

Haz clic en la pestaña **Portada** y completa:

1. **Titular** *(obligatorio)*: el titular principal de la edición. Ejemplo: `“Los PDET son un propósito nacional”`. Este titular también sale en la tarjeta **Último boletín** de **Inicio**.
2. **Sumario**: dos o tres líneas que resumen el tema de portada (su inicio también aparece en la tarjeta de **Inicio**).
3. **Protagonista o autor**: opcional, aparece debajo del sumario. Ejemplo: `Entrevista a Emilio Archila`.
4. **Cargo o descripción**: opcional, aparece debajo del nombre. Ejemplo: `Exconsejero presidencial para la estabilización y la consolidación`.
5. **Foto de portada** *(obligatorio)*: haz clic en **Añadir imagen**, elige o sube una foto horizontal y llena su **Texto alternativo** (ver sección 3).
6. **Crédito de la foto**: aquí sí escribes `Fotografía: Nombre Apellido`. Ejemplo: `Fotografía: Fernando López Ríos`.

[CAPTURA 4: Pestaña **Portada** llena con un ejemplo real.]

### Paso 4: Llenar la pestaña **Secciones**

Haz clic en la pestaña **Secciones**. Al crear una edición nueva, WordPress ya te entrega **las 8 secciones estándar listas y vacías**, en su orden habitual:

1. *En portada* (**Artículo**)
2. *El Fondo en cifras* (**Cifras**)
3. *Historias que transforman* (**Artículo**)
4. *Obras que conectan* (**Artículo**)
5. *Paz productiva* (**Artículo**)
6. *Alianzas* (**Tarjetas**)
7. *Actualidad* (**Artículo**)
8. *La agenda* (**Agenda**)

[CAPTURA 5: Pestaña **Secciones** mostrando las 8 filas precargadas colapsadas.]

Haz clic en la barra de una sección para abrirla y llenarla. Todas las secciones empiezan con cinco campos comunes que alimentan su encabezado y su tarjeta en el índice «En esta edición»:

- **Nombre de la sección** *(obligatorio)*: el nombre que sale en el encabezado, en la barra de secciones y en la tarjeta del índice (ejemplo: `En portada` o `El Fondo en cifras`).
- **Subtítulo de la sección**: línea corta debajo del nombre (ejemplo: `Entrevista · Programas de Desarrollo con Enfoque Territorial`).
- **Índice: título**: título corto de la tarjeta en «En esta edición».
  - En **Artículo** es opcional (si lo dejas vacío, usa el **Título** del artículo).
  - En **Cifras**, **Tarjetas** y **Agenda** es **obligatorio**.
- **Índice: imagen**: opcional. Foto horizontal para la tarjeta del índice (recomendada 16:10). En **Artículo**, si la dejas vacía el sitio toma la primera foto del artículo; en **Cifras**, **Tarjetas** y **Agenda**, conviene subir una foto para que la tarjeta no quede sin imagen.
- **Índice: resumen**: una o dos líneas para la tarjeta del índice.

Luego, cada molde tiene sus propios campos:

#### Molde **Artículo**
- **Etiqueta superior**: palabra o frase corta sobre el titular (ejemplo: `Entrevista`, `Perfil`).
- **Color de la etiqueta**: elige **Azul** o **Verde**.
- **Título** *(obligatorio)*: titular del artículo.
- **Resumen bajo el título**: dos o tres líneas en negrita debajo del titular.
- **Primer párrafo destacado**: opcional; abre el artículo con letra un poco más grande.
- **Texto del artículo**: el cuerpo completo (mira la sección 3 para pegar sin formato, subtítulos y citas).
- **Foto de apertura** y **Crédito de la foto de apertura**: opcional; foto horizontal a todo el ancho antes del texto.
- **Fotos** (botón **Añadir foto**): de una a tres fotos en la columna lateral. En cada fila eliges **Imagen** *(obligatorio)*, **Formato** (**Vertical** o **Panorámica**) y **Crédito**.
- **Ficha: título**, **Ficha: texto** y **Ficha: datos** (botón **Añadir dato**, con los campos **Cifra o dato** y **Descripción**): recuadro opcional de datos al lado del texto (ejemplo: *Los PDET en una línea* → `170` / `municipios priorizados`). Si dejas **Ficha: título** vacío, el recuadro no aparece.
- **Ficha con fondo claro**: actívalo para fondo blanco con borde; apagado usa fondo celeste.
- **Fotos a la izquierda**: por defecto las fotos van a la derecha del texto; actívalo si prefieres alternar y ponerlas a la izquierda.

#### Molde **Cifras**
- **Cifras** (botón **Añadir cifra**): cada fila pide **Número** *(obligatorio, ejemplo: `US$100`)* y **Texto** *(obligatorio, ejemplo: `millones invertidos por el FCP y el BID`)*. La **primera fila** se muestra más grande y destacada.
- **Nota**: párrafo opcional debajo de las cifras.

#### Molde **Tarjetas**
- **Tarjetas** (botón **Añadir tarjeta**): cada fila crea una tarjeta con **Etiqueta** (ejemplo: `KfW · Alemania`), **Color** del borde superior (**Azul**, **Naranja** o **Verde**), **Título** *(obligatorio)*, **Texto** (un párrafo por línea), **Monto** (opcional, ejemplo: `€31.250.000`) y **Nota del monto**.

#### Molde **Agenda**
- **Hitos** (botón **Añadir hito**): cada fila tiene **Cuándo** (ejemplo: `Fases II y III`), **Título** *(obligatorio)* y **Texto** (opcional, una o dos frases).

### Cómo quitar, reordenar o añadir secciones

- **Quitar una sección:** pasa el cursor por el borde derecho de la barra de la sección y haz clic en el botón **−** (quitar fila). **Importante:** si una edición va a tener menos de 8 secciones, **borra las filas que no vas a usar**. Si dejas una fila vacía, al intentar publicar verás «Validación fallida» porque tiene campos obligatorios sin llenar.
- **Reordenar:** arrastra una sección desde el número a la izquierda de su barra y suéltala donde quieras. La numeración (`01`, `02`…) se ajusta sola.
- **Añadir una nueva:** haz clic en **Añadir sección** al final de la lista y elige el molde (**Artículo**, **Cifras**, **Tarjetas** o **Agenda**).

---

## 3. Escribir bien y preparar fotos

Seguir estas cuatro reglas evita que se dañe el diseño y hace que el sitio funcione para personas que usan lectores de pantalla.

### Pegar texto sin formato
Cuando copies texto desde Word, Google Docs o un correo, **no uses** `Ctrl + V` normal (arrastra fuentes, colores y tamaños ocultos).
- En Windows: mantén presionadas **`Ctrl + Shift + V`**.
- En Mac: mantén presionadas **`Cmd + Shift + V`**.

### Subtítulos y citas dentro del texto
En los campos **Texto del artículo** y **Texto de la crónica**:
- **Subtítulos:** selecciona la línea y elige **Título 3** en el desplegable de párrafos. Si no ves el desplegable de títulos, pulsa el botón **Más herramientas** (último ícono de la barra) para mostrar la segunda fila. No uses *Título 1* ni *Título 2* ni pongas un párrafo entero en negrita para simular un subtítulo.
- **Citas:** haz clic en el botón de comillas (**Cita**). Escribe la frase en el primer párrafo, pulsa **Enter** y escribe en el segundo párrafo quién la dijo (nombre y cargo). El sitio le da estilo diferente a la frase y al autor de forma automática.

[CAPTURA 6: Barra del editor de texto mostrando el desplegable con **Título 3** y el botón de **Cita**.]
[CONFIRMAR EN PANTALLA: verificar si el desplegable de párrafos aparece en la primera fila de la barra básica o al pulsar **Más herramientas**.]

### Fotos: orientación, peso y créditos
- **Orientación:** usa fotos **horizontales** en portadas, fotos de apertura, tarjetas del índice y tarjetas destacadas. Si subes una foto vertical en un espacio horizontal, el sitio la recorta para encajar y puede cortar cabezas. En la columna lateral de un artículo puedes marcar **Vertical** si la foto es alta.
- **Peso:** procura que cada foto pese **menos de 2 MB** (el sitio acepta archivos hasta 32 MB y convierte las fotos JPG automáticamente a un formato más liviano, pero fotos muy pesadas hacen lenta la carga en tu computador).
- **Créditos:** en **Crédito de la foto**, **Crédito de la foto de apertura** y **Crédito** escribe `Fotografía: Nombre Apellido`. Las dos excepciones son **Créditos de fotografía** (pie del boletín, pestaña **Edición**) y **Descripción** (galería de historias): ahí escribes solo el nombre del fotógrafo.

### Texto alternativo (muy importante)
Cada vez que subas o elijas una foto en la biblioteca de medios, llena el campo **Texto alternativo** a la derecha. Describe en una frase corta qué se ve en la imagen (ejemplo: *«Productora de café seleccionando granos en Planadas, Tolima»*).
- No empieces con «Foto de…» ni «Imagen de…».
- Sirve para que las personas con discapacidad visual entiendan la foto y ayuda a que el contenido aparezca mejor en buscadores.

[CAPTURA 7: Ventana de la biblioteca de medios con los campos **Texto alternativo**, **Leyenda** y **Descripción** señalados a la derecha.]

---

## 4. Revisar y publicar

1. Mientras trabajas, haz clic en **Guardar borrador** con frecuencia. **Guardar borrador** funciona aunque todavía falten campos obligatorios.
2. Antes de revisar cómo se ve, haz clic en **Guardar borrador** y luego en **Vista previa** (si no guardas primero, los cambios recientes pueden no verse en la vista previa).
3. Cuando todo esté listo:
   - Para publicar de inmediato: haz clic en **Publicar**.
   - Para programar fecha y hora: en el panel derecho, junto a **Publicar inmediatamente**, haz clic en **Editar**, elige fecha y hora, pulsa **Aceptar** y luego **Programar**.

[CAPTURA 8: Panel derecho **Publicar** con los botones **Guardar borrador**, **Vista previa** y **Publicar**.]

### Qué cambia en el sitio al publicar un boletín
En cuanto publicas:
- `/boletin/` pasa a mostrar la edición nueva de forma automática (siempre muestra la edición publicada con fecha más reciente).
- La edición anterior sigue en su propia dirección web y aparece al final en **Otras ediciones**.
- La tarjeta **Último boletín** en **Inicio** se actualiza sola con el nuevo titular, número, periodo, sumario y foto de portada.
- La copia guardada de las páginas se renueva automáticamente.

---

## 5. Publicar la historia del mes (PaisSano destacado)

Cada mes se publica una historia nueva de una organización productora. Al publicarla, pasa a ser la historia destacada en todo el sitio y las anteriores siguen accesibles en **Otras historias**.

1. En el menú lateral haz clic en **Historias PaisSana** y luego en **Añadir historia**.
2. En el campo superior del título (*Nombre de la organización*), escribe el nombre de la organización (ejemplo: `Asocafé`). Ese título define la dirección web (`/historias/asocafe/`).
3. Recorre las cinco pestañas en orden:

### Pestaña **Presentación** (la tarjeta destacada)
Estos campos arman la tarjeta «PaisSano destacado» que se ve en **Inicio**, **Proyectos destacados** y **Productores** (`/productores/`):
- **Lugar** *(obligatorio)*: municipio y departamento (ejemplo: `Santa Rosa del Sur · Bolívar`).
- **Subtítulo en el catálogo**: línea corta junto a «PaisSano destacado» en la tarjeta destacada (se ve en Inicio, Proyectos destacados y `/productores/`).
- **Resumen** *(obligatorio)*: dos o tres líneas para la tarjeta destacada y buscadores (ideal hasta 155 caracteres).
- **Foto de la tarjeta** *(obligatorio)*: foto horizontal con **Texto alternativo**.
- **Cifras** (botón **Añadir cifra**): hasta 3 cifras de impacto (**Número** y **Texto**, ambos obligatorios si agregas la fila).

[CAPTURA 9: Pestaña **Presentación** de una historia con cifras y foto de tarjeta.]

### Pestaña **Portada** (encabezado y ficha de la historia)
- **Foto de portada**: foto horizontal a todo el ancho (si la dejas vacía, la portada usa fondo azul sólido).
- **Título de la historia** *(obligatorio)*: el titular grande de la crónica (ejemplo: `Un café que cambió la historia de la serranía`).
- **Subtítulo**: opcional, una o dos líneas debajo del título.
- **Ficha** (botón **Añadir dato**): recuadro de datos técnicos bajo la portada (pares **Dato** y **Valor**, ejemplo: `Territorio` / `Sur de Bolívar`).

### Pestaña **Video**
Elige una opción en **Origen del video**:
- **Sin video**: oculta los demás campos y no muestra sección de video en la página.
- **YouTube**: pega el enlace en **URL de YouTube**. Es la opción recomendada para videos largos o pesados.
- **Archivo MP4 subido a WordPress**: sube un archivo en **Archivo de video (MP4)**. Úsalo solo si el video pesa **menos de 20 MB**; si pesa más, súbelo primero a YouTube.
- **Enlace externo (se abre en otra pestaña)**: pega una dirección que empiece por `https://` en **Enlace externo** (por ejemplo un enlace de Google Drive).

Cuando hay video, también puedes llenar **Imagen de portada del video** (miniatura antes de reproducir) y **Subtítulo del video**.

### Pestaña **Crónica**
- **Subtítulo de la crónica**: línea corta bajo el título de la sección.
- Dentro de **Contenido de la crónica**:
  - **Resumen de la crónica**: dos o tres líneas en negrita antes del texto.
  - **Primer párrafo destacado**: opcional.
  - **Texto de la crónica**: el relato completo (mismas reglas de la sección 3: pegar sin formato, **Título 3** para subtítulos, **Cita** en dos párrafos).
  - **Fotos** (botón **Añadir foto**): de 1 a 3 fotos al lado del texto (**Imagen** obligatoria y **Crédito**).
  - **Recuadro de datos** (botón **Añadir dato**): opcional; pares **Rótulo del dato** y **Valor del dato** (ejemplo: `Cofinancia` / `Fondo Colombia en Paz`).
- **Nota de fuente**: opcional, crédito del reportaje original (puedes poner el título en cursiva).

### Pestaña **Galería**
1. Haz clic en **Añadir a la galería** y selecciona las fotos (hasta 24).
2. Haz clic en cada foto seleccionada y llena en el panel derecho:
   - **Texto alternativo**: qué muestra la foto.
   - **Leyenda**: el pie de foto que verá el visitante debajo de la imagen y al ampliarla.
   - **Descripción**: el nombre del fotógrafo (el sitio antepone «Fotografía:» automáticamente).

En el sitio, al pulsar cualquier foto de la galería se abre ampliada sobre la pantalla; el visitante puede cerrarla con el botón **×**, pulsando la tecla **Escape** o tocando fuera de la foto.

[CAPTURA 10: Pestaña **Galería** con una foto seleccionada mostrando **Texto alternativo**, **Leyenda** y **Descripción**.]

### Qué cambia en el sitio al publicar una historia
- `/historias/` pasa a mostrar la historia nueva y, debajo, la lista de **Otras historias**.
- Las tarjetas destacadas de **Inicio**, **Proyectos destacados** y `/productores/` se actualizan solas con la historia nueva.
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
1. Haz clic en **Productores** y luego en **Añadir productor**.
2. En el título (*Nombre del productor u organización*), escribe el nombre tal como debe aparecer en la tarjeta.
3. En **Datos del productor**:
   - **Municipio** *(obligatorio)*: municipio donde opera.
   - **Productos**: escribe **un producto por línea**, sin guiones ni viñetas al inicio. Ejemplo:
     ```text
     Café tostado
     Café en grano
     Miel de abejas
     ```
   - **Enlace o red social**: opcional (por ahora se guarda como registro y no se muestra en el sitio).
4. En las cajas de casillas de la columna derecha, marca:
   - **Departamentos**: marca **1** departamento.
   - **Categorías**: marca **1 o más** categorías de oferta.
   - **Tiempos de operación**: marca **1** opción.
   - **Etnias**: marca **1** opción solo si aplica.
   - **Poblaciones**: **es solo registro interno**; no se muestra ni filtra en el sitio público.
   - *Nota:* si falta un departamento o una categoría, puedes crearlo ahí mismo con **Añadir departamento** o **Añadir categoría**.
5. Haz clic en **Publicar**.

[CAPTURA 11: Pantalla de **Añadir productor** con **Datos del productor** a la izquierda y las cajas de casillas (**Departamentos**, **Categorías**, **Tiempos de operación**, **Etnias**, **Poblaciones**) a la derecha.]

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

[CAPTURA 12: Lista de **Páginas** señalando **Inicio**, **Proyectos destacados** y **Productores PaisSana** como páginas base protegidas.]

---

## 8. Problemas frecuentes y qué hacer

| Problema | Por qué pasa y cómo resolverlo |
|---|---|
| **«Validación fallida» al pulsar Publicar** | Falta algún campo obligatorio (marcado con asterisco rojo `*`) o dejaste vacía alguna de las 8 secciones precargadas del boletín. Sube por la página, busca los recuadros marcados en rojo, llénalos o borra con **−** las secciones que no vayas a usar. |
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
- [ ] Guardaste borrador y revisaste **Vista previa** en computador y celular.
- [ ] Tras publicar: `/boletin/` muestra la edición nueva y **Inicio** actualizó la tarjeta **Último boletín**.

### Antes de publicar la historia del mes
- [ ] Título con el nombre de la organización (define `/historias/<nombre>/`).
- [ ] **Presentación** completa (lugar, resumen corto, foto horizontal con texto alternativo y hasta 3 cifras).
- [ ] **Portada** con título de la historia y ficha técnica revisada.
- [ ] **Video** configurado (YouTube, MP4 < 20 MB, enlace `https://` o **Sin video**).
- [ ] **Crónica** pegada sin formato, con subtítulos en **Título 3** y citas en dos párrafos.
- [ ] **Galería**: cada foto tiene **Texto alternativo**, **Leyenda** (pie) y **Descripción** (fotógrafo).
- [ ] Guardaste borrador y revisaste **Vista previa**.
- [ ] Tras publicar: la nueva historia aparece en `/historias/` y destacada en **Inicio**, **Proyectos destacados** y `/productores/`, y la anterior sigue en **Otras historias**.

---

## 10. Buscadores y redes (SEO) y a quién acudir

### Título, descripción e imagen para buscadores y redes

El sitio completa solos estos datos a partir del contenido que llenas, pero puedes personalizar cómo aparece cualquier página, boletín o historia en Google, WhatsApp o redes sociales. En `/boletin/` y `/historias/` se muestran los datos que escribas en la caja de la edición o historia más reciente.

1. **Dónde encontrar la caja:**
   - En un **Boletín** o una **Historia PaisSana**, baja desde el título: verás la caja **Ajustes de SEO**.
   - En una **Página** (como *Productores PaisSana*), baja hasta el final del editor y abre el panel plegado **Cajas meta**: ahí está **Ajustes de SEO**.
2. **En la pestaña General:**
   - **Meta título:** el título que aparecerá en Google. Si lo dejas vacío, el sitio usa el título normal. Debajo verás una barra de color con el estado (**Bien**, **Demasiado corto** o **Demasiado largo**; si te pasas mucho puede decir «Demasiado tiempo»). Deja sin marcar **¿Eliminar el título del sitio?** salvo que quieras omitir «| La Paz Sí Pasa».
   - **Descripción meta:** el resumen corto que se lee bajo el título en Google y al compartir (ideal hasta 155 caracteres). Si la dejas vacía, el sitio toma el sumario del boletín o el resumen de la historia.
3. **En la pestaña Social:**
   - **URL de la imagen social:** haz clic en **Seleccionar imagen** (o **Cambiar la imagen** / **Quita la imagen**) para elegir una foto horizontal de la biblioteca de medios. Si la dejas vacía, se usa la foto de portada.
4. Haz clic en **Actualizar** o **Publicar** para guardar.

*(Las etiquetas de la caja vienen traducidas al español; algún texto secundario del contador puede aparecer en inglés.)*

[CAPTURA: Caja **Ajustes de SEO** en un boletín, con **Meta título** y **Descripción meta** y su barra de longitud.]
[CAPTURA: Panel **Cajas meta** desplegado al final de una página, con la pestaña **Social** y el botón **Seleccionar imagen**.]

[CONFIRMAR EN PANTALLA: la ubicación de **Cajas meta** en las páginas; que el Editor solo ve las pestañas **General** y **Social**; y si la casilla **¿Eliminar el título del sitio?** surte efecto por entrada.]

### A quién acudir
Si encuentras un error que no está en la sección 8, necesitas cambiar el menú principal o un cambio no aparece tras recargar, escribe al equipo técnico responsable del sitio indicando:
1. La dirección web donde ves el problema.
2. Qué estabas intentando hacer (por ejemplo: «publicar la Edición 03»).
3. Una captura de pantalla del mensaje o de cómo se ve.

---

## Resumen en una hoja

### Publicar el boletín del mes
1. Entra a `/wp-admin` → **Boletines** → **Añadir edición**.
2. Escribe el título corto (`Edición XX`), que define la dirección `/boletin/edicion-XX/`.
3. En **Edición**, llena **Número de edición**, **Periodo**, texto del índice y **Créditos de fotografía** (un nombre por línea).
4. En **Portada**, llena **Titular**, **Sumario**, foto horizontal (con **Texto alternativo**) y **Crédito de la foto**.
5. En **Secciones**, llena las filas que vas a usar y borra con **−** las que no necesites.
6. Pega los textos sin formato (`Ctrl/Cmd + Shift + V`), usa **Título 3** para subtítulos y **Cita** en dos párrafos.
7. Haz clic en **Guardar borrador** y revisa **Vista previa**.
8. Haz clic en **Publicar** (o programa fecha y hora).
9. Comprueba `/boletin/` y la tarjeta **Último boletín** en **Inicio**.

### Publicar la historia del mes
1. Entra a `/wp-admin` → **Historias PaisSana** → **Añadir historia**.
2. Escribe el nombre de la organización en el título (define `/historias/<nombre>/`).
3. En **Presentación**, llena **Lugar**, **Subtítulo en el catálogo**, **Resumen**, **Foto de la tarjeta** y hasta 3 **Cifras**.
4. En **Portada**, sube la **Foto de portada**, escribe **Título de la historia** y agrega las filas de **Ficha**.
5. En **Video**, elige **YouTube**, **Archivo MP4** (< 20 MB), **Enlace externo** (`https://`) o **Sin video**.
6. En **Crónica**, pega el texto sin formato (**Título 3** y **Cita** en dos párrafos) y añade fotos o recuadro de datos si aplica.
7. En **Galería**, sube las fotos y llena **Texto alternativo**, **Leyenda** (pie) y **Descripción** (fotógrafo) en cada una.
8. Haz clic en **Guardar borrador** y revisa **Vista previa**.
9. Haz clic en **Publicar** y comprueba `/historias/`, **Inicio**, **Proyectos destacados** y `/productores/`.
