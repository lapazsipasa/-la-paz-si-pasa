# Guía de estilos

Página viva del sistema visual del tema FSE: colores, tipografía, espaciado, formas y reglas de uso, con ejemplos correctos e incorrectos.

## Cómo verla

`http://localhost:8090/guia-de-estilos/` (página `guia-de-estilos` con la plantilla `page-guia-de-estilos.html`). No se indexa: `noindex` y fuera del sitemap.

## De dónde salen los datos

Nada está copiado: el bloque `lapaz/guia-estilos` (oculto del insertador) lee `wp_get_global_settings()` y `wp_get_global_styles()` al renderizar, vía `inc/guia-estilos.php`.

- Paleta, familias con sus pesos declarados en `fontFace`, `fontSizes`, `spacingSizes` y todo `settings.custom` (radius, border, shadow, letter-spacing, font-weight).
- Componentes compartidos: la sección usa la hoja `lapaz-editorial` (declarada en el `block.json`) con el marcado real del boletín, dentro de un contenedor `wp-block-lapaz-boletin`.
- Tamaños de `h1–`h3` desde `styles.elements`.
- El contraste de las combinaciones texto/fondo se calcula en PHP con la fórmula WCAG (AA: 4,5 texto normal, 3 texto grande).

## Reglas de uso

Tipografía:

- Monique Round tiene Regular (400) y Bold (700); los encabezados del sitio actual usan el 700. Para las secciones nuevas la regla es de criterio visual, no técnica: Monique solo en destacados cortos en MAYÚSCULAS (sección, numeración, etiqueta, botón), hoy en Regular 400; nunca en títulos largos ni en minúsculas.
- Títulos en Komet Heavy 800; jerarquías menores en Bold 700; cuerpo en Light 300. Komet Black 900 existe pero no se usa.

Color:

- Priman los fondos oscuros (el azul del sitio) con texto blanco, para que el celeste destaque como acento (etiqueta y botón), como en la portada del boletín.
- Pocos colores a la vez: verde y naranja solo como acento puntual, nunca junto a celeste y azul en un mismo bloque.

## Cómo se actualiza

Se cambia `theme.json` y la página lo refleja. Las reglas de uso (textos y ejemplos) viven en `blocks/guia-estilos/partes/`.
