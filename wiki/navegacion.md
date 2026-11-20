# Estructura del sitio y navegación

**Estado:** propuesta · 2026-11-19 · tarea R3 de [boletin-catalogo-fcp](specs/boletin-catalogo-fcp.md) · solo lectura, no se implementó nada

Pedido de William: «Revisar la estructura del sitio para ver cómo podemos mejorar la navegación, pues está muy extraña y difícil». El sitio pasó de 2 a 5 tipos de página y la navegación no se rediseñó.

Fuente: sitio local `http://localhost:8090` (rama `feat/boletin-catalogo-fcp`), capturas de Chrome headless a 1440 y 390 px (alto de ventana 700), HTML servido, `wp` de solo lectura y el código del tema `lapaz`. Producción (`lapazsipasa.com`) se consultó con `curl`: hoy tiene solo `/` y `/proyectos-destacados/`. `/paissana/` y `/boletin/` responden 404 allí. **Las URL nuevas todavía no son públicas, así que cambiarlas ahora no cuesta redirecciones.**

---

## 1. Mapa actual

### Árbol de páginas

```text
/                                   Inicio (página «home», front-page.html)
├─ #lo-que-hacemos                  ancla (bloque lapaz/lo-que-hacemos)
├─ #actualidad                      ancla (bloque lapaz/actualidad)
/proyectos-destacados/              página «Proyectos destacados» (page-proyectos-destacados.html)
│                                   H1: «Un país que sana desde la tierra». Contenido: PaisSana
├─ #escucha-el-corazon-del-campo    audios
├─ #productores-paissana            videos de productores
└─ #paissana-en-ferias              ferias
/paissana/                          página «PaisSana» (page-paissana.html)
│                                   H1: «Quienes producen la paz». Catálogo de 316 productores
│                                   + tarjeta «PaisSano destacado» + buscador (?buscar=…#explorar)
└─ historias/asocafe/               CPT historia (single-historia.html). No existe /paissana/historias/ (404)
/boletin/                           archivo del CPT boletin: pinta la edición más reciente
└─ edicion-02/                      la misma edición (canonical de las dos URL)
/guia-de-estilos/                   solo en local
```

Las páginas son hermanas, todas de primer nivel (`post_parent` 0). `historia` no tiene archivo (`has_archive: false`), `productor` no tiene URL.

### Qué hay en cada navegación

| Dónde | Elementos | Notas |
|---|---|---|
| Menú «Principal» (`wp_navigation` 6, `core/navigation`) | LO QUE HACEMOS → `/#lo-que-hacemos` · PROYECTOS DESTACADOS → `/proyectos-destacados` · ACTUALIDAD → `/#actualidad` · BOLETÍN → `/boletin/` | Los cuatro son enlaces `custom` con URL relativa. Dos son anclas de la portada y dos son páginas. `/proyectos-destacados` sin barra final provoca un 301 en cada clic. |
| Escritorio (≥ 850 px) | Cuatro cajas iguales, **debajo** del hero (y = 420) | El único enlace a Inicio es el logo del hero. |
| Móvil (< 850 px) | Barra con «LA PAZ SÍ PASA» (enlace a Inicio) y hamburguesa, encima del hero | El overlay muestra los mismos 4 elementos, sin «Inicio». |
| Botonera de programas (`lapaz/paisana-hero`, solo en `/proyectos-destacados/`) | PAISSANA → `/paissana/` · PROGRAMA COLOMBIA SOSTENIBLE → `#` · PROGRAMA PILOTO DE INVERSIONES PRIORITARIAS → `#` | Botones `.btn-project` azul, verde y naranja. |
| Barra de secciones PaisSana (`.hero-nav`, mismo bloque) | ESCUCHA EL CORAZÓN DEL CAMPO · PAISSANA EN FERIAS · PRODUCTORES PAISSANA | Está en y = 1811 (escritorio) y y = 2629 (móvil). El orden no coincide con la página, que va audios → productores → ferias. |
| Boletín | Franja «BOLETÍN · JEFATURA…» · botón «Ver esta edición» → `#indice` · barra «Secciones del boletín» (Índice + 8 secciones) · índice en tarjetas «En esta edición» · 8 enlaces «↑ Volver al índice» · «Otras ediciones» (solo si hay más de una) | La barra no es fija (`position: static`). |
| Historia | «← Volver al catálogo» → `/paissana/` | Es el único enlace propio. |
| Pie (`lapaz/footer`) | fcp.gov.co, Instagram y X, y botón «Volver arriba» | Ningún enlace interno. |

### Cómo se llega a cada página

Clics mínimos y por dónde. «Menú» es el menú principal.

| Desde ↓ / a → | Inicio | Proyectos destacados | Catálogo `/paissana/` | Historia del mes | Boletín |
|---|---|---|---|---|---|
| **Inicio** | — | 1 (menú) | 2 (menú → botón PAISSANA) | 3 (… → «Ver la historia completa») | 1 (menú) |
| **Proyectos destacados** | 1 (logo del hero) | — | 1 (botón PAISSANA) | 2 | 1 (menú) |
| **Catálogo** | 1 (logo del hero) | 1 (menú) | — | 1 (tarjeta destacada) | 1 (menú) |
| **Historia** | 1 (logo del hero) | 1 (menú) | 1 («Volver al catálogo») | — | 1 (menú) |
| **Boletín** | En escritorio no hay logo ni marca: solo se vuelve por las anclas del menú, que caen a mitad de la portada. En móvil, 1 (marca de la barra). | 1 (menú) | 2 (por Proyectos destacados) | 3 | — |

### Huérfanas, callejones y repetidos

- **Huérfana a medias: el catálogo.** No está en el menú. Solo se llega por un botón de otra página, rotulado con el mismo nombre que el contenido de esa página.
- **Huérfanas futuras: las historias anteriores.** La spec dice que «las anteriores siguen publicadas», pero no hay listado. En diciembre, Asocafé solo será alcanzable por el sitemap.
- **`/boletin/edicion-02/`** no la enlaza nadie (es la canónica de `/boletin/`). No es un problema mientras haya una sola edición. Con dos, entra en «Otras ediciones».
- **Enlaces a `#`:** los botones PROGRAMA COLOMBIA SOSTENIBLE y PROGRAMA PILOTO DE INVERSIONES PRIORITARIAS. Al tocarlos, la página salta arriba.
- **Callejón sin salida:** el boletín en escritorio, que no tiene marca ni enlace a Inicio.
- **Repetidos:**
  - En móvil, la marca aparece dos veces seguidas: el texto «LA PAZ SÍ PASA» de la barra y el logo grande del hero.
  - En el boletín, la barra de secciones y el índice en tarjetas quedan uno debajo del otro (y = 816 y y ≈ 920) con los mismos 8 destinos.
  - «Historias que transforman» se usa en tres sitios: el subtítulo de Productores en Proyectos destacados, la sección 3 del boletín y el tipo «Historias PaisSana».
  - «Actualidad» es una ancla del menú (los videos de la portada) y también la sección 7 del boletín.

---

## 2. Diagnóstico

1. **El hero de 420 px se repite en todas las páginas interiores y empuja el menú hacia abajo.** En escritorio, el menú empieza en y = 420 en Inicio, Proyectos destacados, el catálogo y la historia. El H1 cae en y = 692 a 914, cerca o fuera de la primera pantalla. En móvil, la barra (77 px) más el hero dejan el contenido en y = 497. Quien llega desde un buscador a `/paissana/historias/asocafe/` ve una foto genérica y el logo, sin ninguna pista de que está en PaisSana, hasta que baja.
2. **El hero no está en el boletín.** Es la única página sin marca en escritorio: arranca con el menú en y = 0. El sitio cambia de cara según la página, y el boletín parece otro sitio.
3. **El menú mezcla dos cosas.** «Lo que hacemos» y «Actualidad» son anclas que desde cualquier página interior recargan la portada y caen a mitad de ella. «Proyectos destacados» y «Boletín» son páginas. No hay forma de saber cuál es cuál, y el orden las intercala.
4. **Dos páginas para el mismo programa, con nombres que no dicen qué hay.**
   - El menú dice «Proyectos destacados», el H1 dice «Un país que sana desde la tierra» y el contenido es PaisSana.
   - La página llamada «PaisSana» (`/paissana/`) es en realidad el catálogo de productores, y su H1 es «Quienes producen la paz».
   - Las historias cuelgan de `/paissana/historias/` (bajo el catálogo), pero la portada del programa vive en `/proyectos-destacados/`.
   - Pulsar PAISSANA estando ya en la página de PaisSana lleva a otra página que también se llama PaisSana.
5. **Botones que no llevan a nada.** Dos de los tres botones de la botonera apuntan a `#`. Además prometen una estructura de «programas» que no existe: solo hay PaisSana.
6. **Navegación apilada:**
   - En Proyectos destacados hay tres niveles: menú, botonera de programas y, 1.300 px más abajo, la barra de secciones PaisSana, que además está en otro orden que las secciones.
   - En el boletín también hay tres: menú, barra de secciones e índice en tarjetas, estos dos con los mismos destinos.
   - En móvil, los tres botones de la botonera ocupan 208 px y dejan el H1 de Proyectos destacados en y = 868, fuera de la primera pantalla de un teléfono de 844 px.
7. **No hay «dónde estoy».**
   - El HTML no tiene `aria-current` ni `current-menu-item` en ninguna página interior. La causa es que los enlaces del menú son `custom` con URL relativa. `core/navigation-link` marca la página activa solo con `kind: post-type` e `id`, o con la URL absoluta del archivo (`wp-includes/blocks/navigation-link.php`, línea 214).
   - `navigation.css` tampoco tiene un estilo para el ítem activo.
   - No hay migas. La única ruta de vuelta propia es «← Volver al catálogo» en la historia, y no sirve si se llegó desde otro lado.
8. **Rutas de vuelta pobres.** Desde la historia no hay salida a PaisSana ni a otras historias. Desde el boletín no hay enlaces a PaisSana, aunque las secciones «Paz productiva» e «Historias que transforman» hablan de lo mismo.

---

## 3. Propuesta de estructura

**Idea:** tres secciones de primer nivel y un solo nombre por cosa. PaisSana pasa a ser **una sección** con portada, catálogo e historias. El boletín sigue igual. La portada conserva sus anclas.

```text
/                                Inicio
├─ #lo-que-hacemos
├─ #actualidad
/paissana/                       PaisSana: lo que hoy es /proyectos-destacados/ (mapa, audios, productores, ferias)
├─ productores/                  Catálogo de productores: lo que hoy es /paissana/ (hija de PaisSana)
└─ historias/                    Historia del mes: muestra la más reciente, como /boletin/
   └─ <slug>/                    cada historia (sin cambios: /paissana/historias/asocafe/)
/boletin/                        Boletín: la edición más reciente
└─ <slug>/                       cada edición
```

### Cambios

| Hoy | Propuesta | Tipo |
|---|---|---|
| `/proyectos-destacados/` | `/paissana/` | se renombra el slug de la página «Proyectos destacados» a `paissana` y su título a «PaisSana» |
| `/paissana/` (catálogo) | `/paissana/productores/` | página hija de PaisSana, título «Productores PaisSana», slug `productores` |
| `/paissana/historias/` (404) | archivo de `historia`: pinta la más reciente y «Otras historias» | mismo patrón que `/boletin/` |
| `page-proyectos-destacados.html` y `page-paissana.html` | `page-paissana.html` (portada del programa) y `page-productores.html` (catálogo) | se intercambian las plantillas |

### Por qué así y no al revés

- Las historias ya viven en `/paissana/historias/`, así que la portada del programa tiene que ser `/paissana/`.
- Con todo bajo `/paissana/` y `/boletin/`, «estar en la sección» es simplemente que la ruta empiece así. Eso da el estado activo con un filtro de pocas líneas, sin configuración (ver 4).
- `/boletin/` y `/paissana/historias/` resuelven el «cuál es el de este mes» igual: la URL fija muestra el último. El editor nunca toca el menú cada mes.

### Redirecciones

- `/proyectos-destacados/` → `/paissana/` (301). Es la única URL pública que cambia. Las anclas `#productores-paissana`, `#paissana-en-ferias` y `#escucha-el-corazon-del-campo` se conservan porque son los mismos bloques.
- WordPress no crea esta redirección solo: `wp_check_for_changed_slugs()` ignora los tipos jerárquicos, y las páginas lo son. Hay dos formas de hacerla:
  - unas 6 líneas en el mu-plugin `lapaz-limpieza.php`, que ya tiene redirecciones (línea 72). Queda versionado y se prueba en local y en staging. **Recomendada.**
  - una regla de redirección de Dokploy. No queda en git.
- `/paissana/` (catálogo) → `/paissana/productores/`: **no hace falta** si se hace antes de que la rama llegue a producción. Si se hace después, sí hace falta, y debe preservar los parámetros del buscador (`?buscar=…&departamento=…`).

### Alternativa sin mover URL

Si William no quiere tocar `/proyectos-destacados/`, igual se puede:

- rotular el menú «PaisSana» → `/proyectos-destacados/`;
- llamar «Catálogo de productores» a `/paissana/`;
- compartir entre ambas la navegación de sección del punto 4.

Funciona, pero las URL siguen contradiciendo los nombres (el catálogo en `/paissana/` y la portada de PaisSana en otra ruta), y el estado activo de sección necesita una lista de rutas escrita a mano en vez del prefijo.

---

## 4. Propuesta de navegación

### Menú principal (`wp_navigation` «Principal», editable en *Editor del sitio → Navegación*)

| # | Etiqueta | Destino | Tipo | Activo cuando |
|---|---|---|---|---|
| 1 | LO QUE HACEMOS | `/#lo-que-hacemos` | ancla de la portada | — |
| 2 | ACTUALIDAD | `/#actualidad` | ancla de la portada | — |
| 3 | PAISSANA | página PaisSana (`kind: post-type`, `id`) | página | la ruta empieza por `/paissana/` |
| 4 | BOLETÍN | `/boletin/` | archivo | la ruta empieza por `/boletin/` |

- Las anclas van juntas a la izquierda (son la portada) y las secciones a la derecha. Se mantienen las etiquetas que ya conoce el público de producción.
- **Sin submenús.** El diseño de cajas iguales de `core/navigation` no está pensado para desplegables, y cada sección trae su propia navegación (abajo).
- **Sin ítem «Inicio».** El logo (hero o barra móvil) cumple esa función en todas las páginas, incluido el boletín (ver «Hero compacto»).
- **Estado activo:**
  - Para las páginas, `core/navigation-link` ya marca `current-menu-item` y `aria-current="page"` si el enlace es `kind: post-type` con `id`.
  - Para la sección completa (catálogo, historias, ediciones), un filtro `render_block_core/navigation-link` de unas 12 líneas en `functions.php` añade `current-menu-item` cuando la ruta pedida empieza por la del enlace.
  - El estilo son 4 líneas en `navigation.css`: el mismo fondo `--color-nav-bg-active` que el `:hover`.

### Navegación de sección PaisSana

La botonera azul, verde y naranja deja de ser «programas», con dos de tres botones muertos, y pasa a ser la navegación de la sección. Se ve igual en las tres páginas de PaisSana:

```text
[ PAISSANA ]  [ PRODUCTORES ]  [ HISTORIA DEL MES ]
  /paissana/   /paissana/productores/   /paissana/historias/
```

- Es una parte de plantilla `parts/nav-paissana.html` con un `core/navigation` que apunta a un segundo menú «PaisSana». El editor la cambia sin desarrollo.
- El CSS de `.btn-project` se aplica a las clases nativas, igual que `navigation.css` hace con el menú principal (decisión 3 de arquitectura).
- El activo usa el mismo mecanismo que el menú.
- La barra de anclas de Proyectos destacados (`.hero-nav`) se queda dentro de su página, con el orden corregido: audios, productores, ferias.

### Boletín

- La barra «Secciones del boletín» pasa a `position: sticky` (es CSS de un bloque nuevo, no de una página existente). Así acompaña la lectura de 11.000 px y los 8 «↑ Volver al índice» dejan de ser necesarios.
- El índice en tarjetas se queda: es la entrada visual.

### Dónde estoy y volver

- **Migas con el bloque nativo `core/breadcrumbs`** (está en WordPress 7.1, `wp-includes/blocks/breadcrumbs.php`), solo en las plantillas de detalle:
  - `single-historia.html`: Inicio / Historias PaisSana / Asocafé. Reemplaza a «← Volver al catálogo».
  - `single-boletin.html`: Inicio / Boletín / Edición 02.
  - Las arma solo, a partir del archivo del tipo. Cero mantenimiento.
- En las páginas de sección no hacen falta: el menú activo y la navegación de sección ya dicen dónde se está.
- **Otras historias:** al final de cada historia y en `/paissana/historias/`, la misma lista que «Otras ediciones» del boletín (`section.anteriores`). Resuelve las historias huérfanas.

### Hero compacto en páginas interiores

- Es un estilo de bloque «Compacto» del hero (`styles` en `blocks/hero/block.json`, más CSS), que el editor puede elegir. Misma foto y mismo logo, unos 160 px de alto en escritorio. En móvil se oculta, porque la barra ya muestra la marca.
- Se aplica en el catálogo, las historias y el boletín. El boletín así recupera la marca y el enlace a Inicio en escritorio.
- La portada conserva el hero completo. En PaisSana (hoy Proyectos destacados) lo decide William, porque el contrato congela esa página.

### Pie

Sin cambios. No hace falta duplicar el menú abajo con solo 4 destinos.

### Boceto de escritorio (1440)

```text
┌───────────────────────────────────────────────────────────────────────┐
│  ☀ LA PAZ SÍ PASA | PASA EN LOS TERRITORIOS     (hero compacto ~160px)│
├───────────────────────────────────────────────────────────────────────┤
│ [LO QUE HACEMOS] [ACTUALIDAD] [▓PAISSANA▓] [BOLETÍN]   ▓ = activo     │
├───────────────────────────────────────────────────────────────────────┤
│ Inicio / Historias PaisSana / Asocafé            (solo en el detalle) │
│ [ PAISSANA ] [ PRODUCTORES ] [▓HISTORIA DEL MES▓]   (sección PaisSana)│
├───────────────────────────────────────────────────────────────────────┤
│ H1 «Un café que cambió la historia de la serranía»   ← primera pantalla│
│ …                                                                     │
│ OTRAS HISTORIAS: · Asocafé (nov) · …                                  │
├───────────────────────────────────────────────────────────────────────┤
│ pie (sin cambios)                                                     │
└───────────────────────────────────────────────────────────────────────┘
```

### Boceto de móvil (390)

```text
┌──────────────────────────────┐        overlay del menú
│ LA PAZ SÍ PASA          [≡]  │        ┌──────────────────────────────┐
├──────────────────────────────┤        │                         [×]  │
│ Inicio / Historias / Asocafé │        │   [   LO QUE HACEMOS    ]    │
│[PAISSANA][PRODUC-][HISTORIA ]│        │   [     ACTUALIDAD      ]    │
│          [ TORES ][ DEL MES ]│        │   [▓▓▓▓  PAISSANA  ▓▓▓▓▓]    │
├──────────────────────────────┤        │   [       BOLETÍN       ]    │
│ H1 en la primera pantalla    │        └──────────────────────────────┘
│ (sin hero en interiores)     │
```

La navegación de sección en móvil va en 3 columnas, con etiquetas de hasta 2 líneas (unos 56 px), en vez de 3 botones apilados (208 px).

---

## 5. Accesos desde las páginas existentes (insumo para R4)

Como máximo 2 por página. Se agregan bloques en la plantilla y no se modifica ninguno de los existentes. Así se respeta «las páginas que ya existían no cambian» del [contrato](specs/boletin-catalogo-fcp/contrato.md), salvo la botonera, que necesita el visto bueno de William.

### `/` (Inicio)

| Prioridad | Destino | Dónde exactamente | Componente | Texto sugerido |
|---|---|---|---|---|
| 1 | Boletín | `templates/front-page.html`, entre `lapaz/lo-que-hacemos` y `lapaz/actualidad`, a todo el ancho de `main` | Tarjeta de la edición más reciente con el marcado de `lapaz/historia-destacada` (`section.destacado > .dest-card`, panel azul, botón `.btn` celeste), que ya estiliza `editorial.css`. Es un bloque pequeño nuevo (`lapaz/boletin-destacado`) que lee la última edición: foto de portada, titular, periodo. Se actualiza solo cada mes. | Rótulo: «BOLETÍN · CAMINOS DE TRANSFORMACIÓN». Título: el titular de la edición. Bajada: «Edición 02 · octubre–noviembre 2026» (sale de los campos). Botón: «LEER EL BOLETÍN →» |
| 2 | Historia del mes y catálogo | `templates/front-page.html`, después de `lapaz/actualidad`, al cierre de `main` | `lapaz/historia-destacada` tal cual (tarjeta «PaisSano destacado», ya dinámica), más un segundo enlace al catálogo. Puede ser un atributo del bloque o un `.btn` debajo. | Botones: «VER LA HISTORIA COMPLETA →» (ya existe) y «CONOCE A LOS 316 PRODUCTORES →» |

Lo que se descartó: un segundo banner de imagen junto a `.banner-cta` («Más noticias del fondo aquí»). Es una imagen fija: cada cambio pediría diseñar un archivo nuevo, y en esa columna ya hay un banner.

### `/proyectos-destacados/` (futura `/paissana/`)

| Prioridad | Destino | Dónde exactamente | Componente | Texto sugerido |
|---|---|---|---|---|
| 1 | Catálogo e historia | Botonera de `lapaz/paisana-hero` (`nav.proyectos-nav`), justo debajo del menú | `.btn-project` existentes. El botón PAISSANA ya lleva a `/paissana/`. Se le cambia el rótulo y los dos botones `#` pasan a apuntar al catálogo y a la historia. Esto es la navegación de sección del punto 4: si William la aprueba, R4 no tiene que hacer nada más aquí. | [PAISSANA] [PRODUCTORES] [HISTORIA DEL MES]. Mientras no se decida, como mínimo: rotular PAISSANA como «CATÁLOGO DE PRODUCTORES» |
| 2 | Historia del mes y catálogo | `templates/page-proyectos-destacados.html`, entre `lapaz/paisana-productores` y `lapaz/paisana-ferias`, al final de «Productores PaisSana» | `lapaz/historia-destacada` con el mismo segundo enlace que en Inicio. Encaja con el texto de la sección: «conoce a los verdaderos protagonistas de PaisSana». | «VER LA HISTORIA COMPLETA →» y «CONOCE A LOS 316 PRODUCTORES →» |

El boletín no lleva acceso aquí: con 2 por página tiene menos relación con PaisSana, y el menú ya lo cubre.

### Notas para R4

- Los enlaces al catálogo se escriben con `home_url( '/paissana/' )` mientras no se decida la estructura del punto 3. Si se aprueba, pasan a `/paissana/productores/`. Conviene una sola función (por ejemplo `lapaz_url_catalogo()`) para cambiarlo en un solo sitio.
- `editorial.css` se carga solo donde hay un bloque editorial. Poner `lapaz/historia-destacada` en Inicio y en Proyectos destacados lo trae solo, sin tocar las hojas de esas páginas.

---

## 6. Plan por pasos

Rutas del tema relativas a `apps/wordpress/themes/lapaz/`.

### (a) Rápidos y seguros: menú, enlaces y etiquetas, sin diseño nuevo

| Paso | Archivos | Esfuerzo | Riesgo |
|---|---|---|---|
| a1. Menú: reordenar a LO QUE HACEMOS · ACTUALIDAD · (Proyectos destacados o PaisSana) · BOLETÍN. El enlace de página pasa a ser de página (`kind: post-type`, `id`, sin el 301 por la barra final), y Boletín pasa a URL absoluta del archivo. En producción se hace en *Editor del sitio → Navegación*. | contenido (`wp_navigation`); `apps/wp-fse/docker/lapaz-setup` solo para instalaciones nuevas | 15 min | Bajo |
| a2. Estilo del ítem activo: `.current-menu-item > .wp-block-navigation-item__content` con el fondo de `:hover` | `assets/css/navigation.css` | 10 min | Bajo |
| a3. Botonera: el botón PAISSANA pasa a decir «CATÁLOGO DE PRODUCTORES», y se quitan (o esconden) los dos botones `#` | `blocks/paisana-hero/render.php`, prueba `tests/e2e/catalogo.mjs` | 20 min | Bajo, pero toca Proyectos destacados: **requiere el OK de William** |
| a4. Ordenar `.hero-nav` como la página: audios, productores, ferias | `blocks/paisana-hero/render.php` | 5 min | Bajo (mismo OK) |

### (b) Medianos: plantillas, partes, estado activo y migas

| Paso | Archivos | Esfuerzo | Riesgo |
|---|---|---|---|
| b1. Activo por sección (prefijo de ruta) | `functions.php` | 30 min y prueba | Bajo |
| b2. Hero «Compacto» como estilo de bloque, aplicado en catálogo, historia y boletín (agrega `lapaz/hero` a las dos plantillas del boletín) | `blocks/hero/block.json`, `blocks/hero/style.css`, `templates/page-paissana.html`, `single-historia.html`, `single-boletin.html`, `archive-boletin.html` | 1–2 h | Medio: el hero es el LCP. Se mide de nuevo con Lighthouse. |
| b3. `core/breadcrumbs` en historia y boletín, con estilo Monique pequeño en mayúsculas; se quita «← Volver al catálogo» | `templates/single-historia.html`, `single-boletin.html`, `blocks/historia/partes/portada.php`, CSS | 1 h | Bajo |
| b4. Barra de secciones del boletín fija | `blocks/boletin/style.css` | 20 min | Bajo |
| b5. «Otras historias» al final de cada historia (patrón `section.anteriores`) | `blocks/historia/render.php`, `inc/historia.php` | 1 h | Bajo. Puede esperar a que exista la segunda historia (diciembre). |
| b6. Accesos del punto 5 (tarea R4) | `templates/front-page.html`, `templates/page-proyectos-destacados.html`, bloque nuevo `lapaz/boletin-destacado` | 3–4 h | Medio: toca las páginas que ya existían. Van en commits aparte con capturas de antes y después. |

### (c) Grandes: requieren decisión de William o del Fondo

| Paso | Archivos | Esfuerzo | Riesgo |
|---|---|---|---|
| c1. Estructura del punto 3: `/proyectos-destacados/` → `/paissana/`, el catálogo a `/paissana/productores/`, plantillas intercambiadas y slugs en código. **Hacerlo antes del primer deploy de esta rama:** así solo hay una redirección. | `inc/paisana.php:16`, `inc/seo.php:47,85`, `inc/catalogo.php:176`, `apps/wp-fse/mu-plugins/lapaz-core.php:99`, `apps/wp-fse/docker/lapaz-setup:67-83`, `blocks/historia/partes/portada.php:25`, `blocks/paisana-hero/render.php:25`, `templates/page-*.html`, 5 suites de `tests/e2e/` (`catalogo`, `historia`, `layout`, `paisana-lib`, `seo`) | 4–6 h | Medio: URL pública, SEO y enlaces externos de FCP y redes. Lo mitiga el 301. |
| c2. Redirección 301 de `/proyectos-destacados/` | `apps/wp-fse/mu-plugins/lapaz-limpieza.php` | 30 min | Bajo |
| c3. Archivo `/paissana/historias/` que muestra la más reciente | `apps/wp-fse/scf-json/post_type_historia.json` (`has_archive`), `templates/archive-historia.html`, `inc/historia.php` | 1–2 h | Bajo |
| c4. Navegación de sección PaisSana como parte de plantilla con un segundo menú; reemplaza a la botonera | `parts/nav-paissana.html`, CSS, las 3 plantillas de PaisSana, `lapaz-setup` (crea el menú) | 2–3 h | Medio: cambia el aspecto de Proyectos destacados |
| c5. Hero compacto también en PaisSana (hoy Proyectos destacados) | `templates/page-proyectos-destacados.html` | 10 min | Bajo, pero es una decisión de diseño |

Orden sugerido: a1–a2 → b1 → (decisión) c1–c4 → b2–b5 → b6 (R4). Si la estructura no se aprueba, b6 puede ir justo después de a2.

---

## Decisiones de William (2026-11-19)

| Pregunta | Decisión | Qué implica |
|---|---|---|
| ¿Unificar PaisSana bajo `/paissana/`? | **No mover URL.** | `/proyectos-destacados/` y `/paissana/` se quedan donde están. Se arreglan el menú y los enlaces. Vale la [alternativa sin mover URL](#alternativa-sin-mover-url); la estructura del punto 3 queda como referencia. |
| ¿Habrá páginas de Colombia Sostenible y del Programa Piloto? | **Conservar los dos botones, en gris y deshabilitados.** | La botonera sigue siendo de programas. «Proyectos destacados» queda como página paraguas y el menú conserva esa etiqueta. No se crea la navegación de sección PaisSana. |
| ¿Hero compacto en las páginas interiores? | **Sí, en catálogo, historias y boletín.** | Paso b2. La portada y Proyectos destacados conservan el hero completo. |
| ¿Accesos desde las páginas existentes? | **Sí, los cuatro del punto 5.** | Paso b6 (tarea R4). El acceso por la botonera en Proyectos destacados se reduce al botón PAISSANA, que ya lleva al catálogo. |

Se construye ahora: a1, a2, a4, b1, b2 y b6, más los botones deshabilitados. Quedan propuestos y sin construir: migas (b3), barra de secciones fija del boletín (b4), «Otras historias» (b5) y todo el bloque (c).

## 7. Preguntas para William

1. **¿Unificamos PaisSana bajo `/paissana/`, con portada, productores e historias, y redirigimos `/proyectos-destacados/`?** Recomendación: **sí, y antes de que esta rama llegue a producción**. Hoy cuesta una sola redirección; después cuesta dos y hay que preservar los filtros del buscador.
2. **¿Se van a publicar páginas de Programa Colombia Sostenible y del Programa Piloto (PPIP)?** Si no hay fecha, recomiendo quitar esos dos botones y usar la botonera como navegación de PaisSana. Si sí habrá, «Proyectos destacados» se mantiene como página paraguas con los tres programas, y PaisSana queda dentro. Es la única pregunta que cambia el árbol.
3. **Etiqueta del menú: «PAISSANA» o «PROYECTOS DESTACADOS».** Recomendación: «PAISSANA», que es lo que hay. Depende de la respuesta 2.
4. **¿Se puede tocar `/proyectos-destacados/`?** El contrato dice que «no cambia», pero los accesos (R4), la botonera y el hero compacto la tocan. Recomendación: permitir cambios de navegación (botonera, accesos, orden de anclas) y dejar intactos sus contenidos y su estilo.
5. **¿Hero compacto en las páginas interiores?** Recomendación: sí en catálogo, historias y boletín. En PaisSana, decides tú.

## Pendiente de verificar en staging

- Que el filtro de activo por prefijo funcione con la caché de WP Super Cache (el HTML se cachea por URL, así que debería).
- Lighthouse de una página interior con el hero compacto.
