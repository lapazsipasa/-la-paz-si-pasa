# Accesos desde las páginas existentes (R4)

Los cuatro accesos aprobados el 2026-11-19 (ver `wiki/navegacion.md`, punto 5). El cuarto, el botón PAISSANA, lo lleva otro agente.

## Qué se puso y dónde

| Acceso | Dónde | Cómo |
|---|---|---|
| Tarjeta del boletín | `templates/front-page.html`, entre `lapaz/lo-que-hacemos` y `lapaz/actualidad` | Bloque nuevo `lapaz/boletin-destacado` (`blocks/boletin-destacado/`). Lee `lapaz_boletin_actual()`: foto de portada, rótulo «BOLETÍN · CAMINOS DE TRANSFORMACIÓN», titular de portada, «Edición NN · periodo», sumario recortado a 30 palabras y botón «LEER EL BOLETÍN →» al archivo `/boletin/`. Sin ediciones publicadas no pinta nada. |
| Historia del mes + catálogo | `front-page.html` después de `lapaz/actualidad`; `page-proyectos-destacados.html` entre `paisana-productores` y `paisana-ferias` | `lapaz/historia-destacada` con `{"enlaceCatalogo":true}`: añade «CONOCE A LOS N PRODUCTORES →» (N = `lapaz_catalogo_total()`; si es 0 no hay enlace). |

La URL del catálogo sale de `lapaz_url_catalogo()` (`inc/accesos.php`): `/paissana/#explorar`. Si el catálogo cambia de ruta, se cambia ahí.

## CSS

El patrón de tarjeta (`.dest-card`, `.dest-cont`, `.lugar`, `.mini`…) pasó de `blocks/historia-destacada/style.css` a `assets/css/editorial.css`, acotado con `:is(.wp-block-lapaz-historia-destacada, .wp-block-lapaz-boletin-destacado)`. `boletin-destacado` no tiene hoja propia. `historia-destacada/style.css` conserva solo el botón secundario `.btn-sec` (contorno celeste) y el recorte de margen móvil, que ahora solo aplica cuando la tarjeta sigue a `catalogo-portada` (es decir, en `/paissana/`); en Inicio y Proyectos destacados se conserva el ritmo de 10rem.

## Cómo lo cambia el editor

- Boletín: se actualiza solo al publicar una edición nueva (campos de portada, número y periodo).
- Historia: el interruptor «enlaceCatalogo» del bloque, en el editor de sitio.

## Para aprobar

- Textos: rótulo de sección «Último boletín» y destino del botón (archivo `/boletin/`, no la edición concreta).
- Enlace secundario apilado bajo el botón principal, en contorno.

## Banner del catálogo

Bloque `lapaz/catalogo-banner` (`blocks/catalogo-banner/`): panel azul a todo el ancho del contenedor con el logo PaisSana en blanco, rótulo «CATÁLOGO PAISSANA», titular «Encuentra a quienes producen la paz», una línea de apoyo, las tres cifras en vivo (`lapaz_catalogo_cifras()` en `inc/accesos.php`, mismos conteos que la portada del catálogo), un buscador (`<form method="get">`, `name="buscar"`, sin JavaScript, envía a `/paissana/?buscar=…#explorar`) y el botón «EXPLORAR EL CATÁLOGO →». Sin productores publicados no pinta nada.

- Dónde: `page-proyectos-destacados.html`, justo después de `lapaz/paisana-productores`; `front-page.html`, al final de `main`, tras la historia del mes. No va en `/paissana/`.
- Cambio en la tarjeta de la historia: en esas dos plantillas ya no lleva `{"enlaceCatalogo":true}` (el banner lo sustituye). El atributo del bloque se conserva.
- CSS: `.wp-block-lapaz-catalogo-banner` entra en las listas de `assets/css/editorial.css` (rótulos, titular, botón); disposición, cifras y buscador en `blocks/catalogo-banner/style.css`.
