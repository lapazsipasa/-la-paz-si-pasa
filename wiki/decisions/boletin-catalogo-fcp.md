# Decisión: boletín y catálogo PaisSana

Fecha: 2026-11-19 · Decide: William Moreno · Contexto: [spec boletin-catalogo-fcp](../specs/boletin-catalogo-fcp.md)

Cada decisión dice qué se decidió, por qué y qué la haría cambiar.

## 1. El boletín se alimenta con un formulario por secciones, no con patrones de bloques

- **Qué:** tipo `boletin`, una entrada por edición. Las secciones son un campo de contenido flexible de SCF con 4 moldes (artículo, cifras, tarjetas, agenda). Lo pinta el bloque `lapaz/boletin`. Detalle en [boletin-estructura](../specs/boletin-catalogo-fcp/boletin-estructura.md).
- **Por qué:**
  - es la misma forma de trabajo del resto del sitio (Ferias, Retratos): el manual enseña una sola;
  - quien edita no puede dañar el diseño;
  - cifras, tarjetas, hitos y secciones se agregan y quitan con «Añadir fila»;
  - el índice, la numeración y la barra de secciones se generan y no se desincronizan;
  - la edición 02 entra por el seed como JSON, sin generar marcado de bloques.
- **Descartado:** patrones de bloques core con bloqueo `contentOnly`. Según la documentación, ese bloqueo impide todas las operaciones salvo editar el contenido de los bloques que ya existen: no deja agregar una cifra o una tarjeta, y el índice habría que escribirlo dos veces.
- **Cambiaría si** el Fondo necesita composiciones libres en cada edición. Entonces el cuerpo del artículo pasaría al editor de bloques.

## 2. El catálogo filtra en el servidor con taxonomías nativas y `WP_Query`

- **Qué:** tipo `productor` con taxonomías nativas para todo lo que se filtra, búsqueda con `s` sobre un texto de búsqueda generado al guardar, y una consulta por petición. Detalle en [paissana-catalogo](../specs/boletin-catalogo-fcp/paissana-catalogo.md).
- **Por qué:**
  - cada filtro tiene URL propia, se puede compartir y lo ven los buscadores;
  - funciona sin JavaScript;
  - los conteos y el filtro del admin vienen con las taxonomías;
  - el costo por petición no crece con el número de productores.
- **Descartado:** filtrar en el navegador con un JSON, como el prototipo. Responde al instante con 316 registros, pero no usa la búsqueda de WordPress, no da URLs por filtro y la página pesa más.
- **Costo aceptado:** cada combinación nueva de filtros es una petición (220 a 280 ms de TTFB sin caché).
- **Cambiaría si** se necesita tolerancia a errores de escritura o el registro pasa de varios miles: se evalúa un plugin de búsqueda con índice propio.

## 3. Interactivity API solo en el bloque del catálogo

- **Qué:** `lapaz/catalogo` usa el router de la Interactivity API para cambiar la región de resultados sin recargar. El resto del tema sigue con `viewScript` y JS simple.
- **Por qué:** es la herramienta nativa de WordPress para esto y la que usa el Query Loop del núcleo. Modifica el «fuera de alcance» de la [spec FSE](../specs/wordpress-fse.md), que la excluía porque el JS existente no la necesitaba.
- **Condición:** debe funcionar sin build, con un módulo ES plano. Se prueba al empezar la etapa. Si no, se usa JS propio (`fetch` y reemplazo de la región) sobre el mismo servidor.
- **Cambiaría si** el runtime pesa más de lo que aporta en la medición de Lighthouse de `/paissana`.

## 4. El contenido inicial entra al seed y al repo público

- **Qué:** la edición 02, los 316 productores y la historia de Asocafé van a `apps/wordpress/seed/`.
- **Por qué:** es la vía de las demás secciones, viaja con el deploy y se puede volver a cargar. Los datos se publican de todas formas en el sitio.
- **Implica:** la etnia y la población atendida de cada productor quedan en un repositorio público.
- **Cambiaría si** el Fondo pide retirar algún dato: se quita del JSON y del sitio.
