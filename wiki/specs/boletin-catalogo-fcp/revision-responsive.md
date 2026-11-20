# Revisión responsive: boletín, catálogo PaisSana e historia

> **Nota (2026-11-20):** las rutas de este informe son las de entonces. `/paissana/` es hoy `/productores/`, y `/paissana/historias/asocafe/` es `/historias/asocafe/` ([ajuste de navegación](../../navegacion.md#ajuste-del-2026-11-20-url-propias-para-productores-e-historias)). El cuerpo no se reescribió. Los arreglos de CSS están en el commit `afa96b4`.

Rama `feat/boletin-catalogo-fcp`. Solo CSS de bloque (`blocks/{boletin,catalogo,catalogo-portada,historia,historia-destacada}/`).

## Qué se revisó

- Páginas: `/boletin/`, `/paissana/`, `/paissana/historias/asocafe/` (con lightbox abierto) y el menú en `/`, `/proyectos-destacados/` y `/boletin/`.
- Anchos: 320, 360, 390, 414, 600, 768, 850, 1024, 1280, 1440 y 1920 px.
- Medido con script (Chrome headless por CDP): scroll horizontal, elementos fuera del viewport, texto desbordado, imágenes deformadas, áreas táctiles < 44 px, tamaños de titulares.
- Capturas por tramos a 320, 390, 768, 1024 y 1440 (lazy-load forzado antes de capturar), vistas una a una.

## Resultado

Ninguna página tiene scroll horizontal a ningún ancho. El menú con cuatro elementos está bien: la botonera de escritorio cabe desde 850 px (último botón termina en 826 px) y el menú móvil muestra los cuatro botones apilados a 320, 390 y 768. `navigation.css` no se tocó.

## Hallazgos

| Página | Ancho | Problema | Causa | Arreglo | Estado |
|---|---|---|---|---|---|
| /paissana/ | ≤ 850 | Hueco de 160 px entre secciones y 640 px en blanco al final | `.paisana-page` con `gap`/`padding` de 10rem, `assets/css/base.css:157-164` (compartido con Proyectos destacados, no se toca) | Margen inferior negativo (-6rem) en la raíz de los tres bloques solo bajo 850 px: `catalogo-portada/style.css:~94`, `historia-destacada/style.css:~86`, `catalogo/style.css:~313`. La clase se repite (doble/triple) para ganar a `margin-block-end:0` del layout de WP | Arreglado (compensación) |
| /paissana/ | 320-850 | «departamentos» se sale de la cifra de portada | `.tile .l` sin corte de palabra | `overflow-wrap` + `hyphens: auto` y paso de reducción hasta 480 px, `catalogo-portada/style.css` | Arreglado |
| /paissana/ | móvil | Chips de categoría de 40 px y filas de barras de 30 px (táctil) | `.chip` `min-height: 40px`; `.barra` sin alto mínimo, `catalogo/style.css` | 44 px en chips; 44 px en barras bajo 850 px | Arreglado |
| historia, boletín | todos | «Volver al catálogo» / «Volver al índice» de 38 px | `padding-block` en enlace en línea | `inline-flex` + `min-height: 44px` (`historia/style.css`, `boletin/moldes.css`) | Arreglado |
| historia | móvil ancho | Galería de una columna, muy larga a 480-849 px | `grid-template-columns: 1fr` hasta 850 | Dos columnas desde 480 px (`historia/style.css`) | Arreglado |
| boletín | todos | Estado vacío en Monique mayúsculas con frase larga | `.sin-edicion` | Komet Regular sin mayúsculas (`boletin/style.css`) | Arreglado |
| historia | todos | `.cronica aside figcaption` duplicaba `.credito` | `historia/cronica.css` | Regla borrada; el aside usa `.credito` de `editorial.css` | Arreglado |
| boletín | — | Rótulo de sección: el campo ofrece Naranja/Verde/Azul pero solo «Verde» cambia | `boletin/articulo.css` | Comentario de una línea; no se añade naranja | Decisión pendiente de William: ¿se quita «Naranja» de las opciones del campo? |

## Sin arreglar (fuera de mi alcance)

- Enlaces del pie (`fcp.gov.co`, `@fondo_colombiaenpaz`, `@fcolombiaenpaz`, 28 px) y marca del encabezado («La Paz Sí Pasa», 19 px): bloques `footer` y `header`, otros archivos. Propuesta: `min-height: 44px` con `inline-flex`.
- Hueco de 10rem: la corrección limpia es un `@media (max-width: 849px)` en `base.css` para `.paisana-page` (`gap` y `padding-block-end` de 4rem). Al aplicarla se pueden quitar los tres márgenes negativos. Afecta también a Proyectos destacados, que no debía cambiar.
- `img.site-footer__paz-logo` (proporción 3,3-4,8 frente a 5,0) e `img.hero__logo` (5,3-5,6 frente a 5,0): preexistentes del sitio, no de las páginas nuevas.
- El placeholder del buscador se corta a 320 px («Buscar productor, producto o…»): vive en el marcado PHP; propuesta de texto más corto.
- Con 850-1024 px el rótulo de la barra de secciones del boletín se desplaza en horizontal (comportamiento previsto, sin indicador visual).

## Cómo repetir la revisión

Script CDP con `apps/wp-fse/tests/e2e/lib.mjs` (`createBrowserTests().openPage(url, ancho)`): por cada página y ancho, forzar `loading=eager`, recorrer la página, medir `scrollWidth > innerWidth`, rectángulos fuera del viewport, `scrollWidth > clientWidth` en hojas de texto, objetos táctiles < 44 px y proporción de imágenes; capturar con `Page.captureScreenshot` por tramos. Para el lightbox, pulsar `.galeria button` y medir `.lightbox img`, `.cerrar` y `p`. Stylelint tras cada cambio (comando en el brief de CSS). Los scripts de esta pasada son temporales y no están en el repo.
