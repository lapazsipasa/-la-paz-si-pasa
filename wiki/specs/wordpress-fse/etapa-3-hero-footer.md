# Etapa 3: hero, footer y plantillas de página

Estado: **hecha** (pruebas `layout.mjs` 49/49 y `bin/check` en verde) · 2026-11-08 · spec principal: [wordpress-fse.md](../wordpress-fse.md)

## Objetivo

Que la portada y Proyectos destacados tengan el esqueleto completo de Astro: header, hero, menú de escritorio, contenido y footer. Además, que el editor pueda cambiar la foto del hero desde WordPress sin desplegar.

## Qué se construye

### 1. Portada con página propia

Hoy WordPress muestra las últimas entradas en la portada. El hero lee sus campos (`hero_imagen` y, más adelante, `noticias_cta_url`) de la página `home`, igual que el adapter de Astro (`getHome()` → `wp/v2/pages?slug=home`).

- **`lapaz-setup`:** crea la página **Inicio** (slug `home`) si no existe y la fija como portada (`show_on_front=page`, `page_on_front`). Es idempotente.
- **`group_home.json`:** hoy aplica a **todas** las páginas (`post_type == page`). En `lapaz-core.php`, con el filtro `acf/load_field_group`, se acota a la portada (`page_type == front_page`). Así el campo "Imagen del hero" solo aparece al editar Inicio, y el JSON compartido con el headless no se toca. Es el mismo criterio de la etapa 2.

### 2. Bloque `lapaz/hero` (Hero.astro)

| Aspecto | Cómo |
|---|---|
| Marcado y CSS | Mismas clases: `.hero`, `.hero__bg`, `.hero__logo-link`, `.hero__logo`. CSS copiado bajo `.wp-block-lapaz-hero` |
| Imagen | Si Inicio tiene `hero_imagen`, se usa `wp_get_attachment_image()` con `sizes="100vw"`, srcset de la biblioteca, `loading=eager` y `fetchpriority=high`. Si no, los JPEG de `public/hero/` (640/960/1200, sin WebP a propósito por el grano de la foto) copiados al tema, con el mismo srcset de hoy |
| Logo | `hero-logo.svg` del tema, con `alt="La Paz Sí Pasa"` y enlace al inicio, igual que hoy |
| LCP | Es el elemento más pesado de la carga. **Mejora sobre Astro:** `<link rel="preload" as="image" imagesrcset … imagesizes="100vw" fetchpriority="high">` en `wp_head`, solo en páginas con el bloque (`has_block` en la plantilla). Hoy no existe |
| JS | Ninguno |
| Dónde | En las plantillas `front-page` y `proyectos-destacados`. Lee siempre la portada, aunque se pinte en otra página, como en Astro |

### 3. Bloque `lapaz/footer` (Footer.astro) en la parte `parts/footer.html`

| Aspecto | Cómo |
|---|---|
| Contenido | Fijo, como dice la cotización: logos, texto de cierre y redes (fcp.gov.co, Instagram y X). Los textos son traducibles (`esc_html_e`) y las URLs van con `esc_url` |
| Imágenes | Las 8 de `src/assets/footer/` (la foto pesa 1,8 MB en origen) se generan **una sola vez** en WebP al tamaño en que se muestran, ×2 para pantallas retina, y se guardan en `assets/img/footer/`. Cada `<img>` lleva `width` y `height` reales, para no mover el layout (CLS) |
| JS | "Volver arriba": `view.js` de 3 líneas con `scrollTo({ behavior: 'smooth' })`, que respeta `prefers-reduced-motion` (hoy no lo hace) |
| Dónde | Parte `footer` (área footer), en todas las plantillas |

### 4. Plantillas

| Plantilla | Orden (igual que `BaseLayout.astro`) |
|---|---|
| `front-page.html` | header · **hero** · nav-desktop · `main.lapaz-home` (retratos) · **footer** |
| `page-proyectos-destacados.html` (jerarquía por slug; no hizo falta `customTemplates`) | header · **hero** · nav-desktop · main (vacío hasta la etapa PaisSana) · **footer**. `lapaz-setup` se la asigna a la página Proyectos destacados |
| `404.html` | header · nav-desktop · bloque "Página no encontrada" con "Volver al inicio" (`404.astro`, textos traducibles en un patrón PHP) · footer |
| `index.html` | header · nav-desktop · main · footer |

## Reparto (en paneles de Orca, como en la etapa 2)

| Quién | Qué |
|---|---|
| **Claude** | portada en `lapaz-setup`, filtro de `group_home`, bloques hero y footer, preload, plantillas, verificación final y commit |
| **AGY** | assets: WebP del footer a su tamaño ×2 (con medidas), copia de los JPEG del hero y del `hero-logo.svg`. Después, revisión independiente de los dos bloques frente a Astro, sin editar |
| **Codex** | `tests/e2e/layout.mjs`: orden de las piezas en las dos plantillas; hero con `fetchpriority=high`, sin lazy y con preload presente; "volver arriba" lleva a `scrollY = 0`; enlaces del footer con `rel="noopener noreferrer"`; 404 responde 404 con su texto. Bases visuales del hero y del footer a 360, 850 y 1440, con Astro leyendo este WordPress. También suma estos pasos al workflow |

Regla de la etapa 2: solo un agente corre `bin/check` a la vez. Claude lo corre al final.

## Fuera de alcance

- Hacer editable el copy del footer o los enlaces de redes (la cotización los deja fijos).
- Cambiar el logo del hero desde WordPress.
- SEO del `<head>` (OG, canonical): queda para la etapa de SEO y rendimiento. Solo se agrega el preload del hero.

## Definición de hecho

1. La portada y Proyectos destacados se ven igual que Astro a 360, 850 y 1440 px, con los mismos datos: hero, menú y footer con menos de 1 % de diferencia, y Retratos igual que en la etapa 2.
2. El editor cambia la imagen del hero en Inicio y se ve en las dos páginas sin desplegar. Si la quita, vuelve la foto por defecto.
3. El campo del hero solo aparece al editar Inicio.
4. Las pruebas de `layout.mjs`, `retratos.mjs` y `navbar.mjs` pasan, y `bin/check` está en verde.
5. El LCP de la portada no empeora frente a Astro. Se mide con la traza de Chrome headless (el mismo método en los dos sitios) y el preload aparece en el HTML.
6. La imagen de producción incluye todo, y `lapaz-setup` deja Inicio como portada y la plantilla asignada a Proyectos destacados.
7. Esta página documenta el resultado y los aprendizajes.

## Riesgos

- **`page_type == front_page`:** depende de que Inicio sea la portada. Si alguien cambia la portada en Ajustes, el campo se mueve con ella. Es el comportamiento esperado, y se documenta.
- **Compatibilidad del filtro `acf/load_field_group` con SCF 6.9:** si no existe, la alternativa es `acf/location/rule_match` acotado al grupo `group_home`.

Estimación: 1 día.

## Resultado (2026-11-08)

| Verificación | Resultado |
|---|---|
| Orden de piezas | `/` y `/proyectos-destacados/`: header, hero, nav de escritorio, main y footer, igual que `BaseLayout.astro`. `/no-existe` responde 404 con su texto |
| Hero editable | Con una foto en el campo de Inicio, sale en las dos páginas con srcset y su precarga. Sin foto, vuelve a los JPEG del tema |
| Campo del hero | `group_home` solo aparece al editar Inicio; en Proyectos destacados no |
| Visual | Hero: 0,00 % a 1440 y 360. Footer completo: 0,36 % a 1440. La foto con trama da 4,4 % a 360 por el reescalado de srcset, aunque el archivo pesa lo mismo que el de Astro (189 KB). Codex compara el panel aparte. El panel a 850 px quedó en manos de Codex (es un desfase de fracción de píxel, no de diseño) |
| Rendimiento (móvil, 4× CPU, red lenta, sin caché, frente al **build de producción** de Astro) | LCP: WordPress **1,34 s**, Astro 1,41 s. Bytes: WordPress **434 KB**, Astro 507 KB |
| Pruebas | `tests/e2e/layout.mjs` de Codex: 49 comprobaciones que pasan |
| Calidad | `bin/check` en verde (antes del traspaso de las pruebas a Codex) |

## Aprendizajes

1. **La plantilla por slug (`page-<slug>.html`) es más simple que `customTemplates`:** no hay que asignarla ni guardar nada en la base. `customTemplates` solo hace falta si el editor tiene que elegir la plantilla.
2. **SCF 6.9 no tiene `acf/load_field_group`**, el riesgo que se anotó en la propuesta. La ubicación se acota con `acf/location/match_rule`. Antes de asumir un hook de SCF, se busca en su código (`grep apply_filters`) dentro del contenedor.
3. **En temas de bloques la plantilla se pinta antes de `wp_head`.** Por eso el bloque puede avisar qué imagen precargar y el `<head>` la imprime, sin adivinar por URL ni por plantilla.
4. **No se compara rendimiento contra `astro dev`:** el modo desarrollo daba 4,1 s de LCP frente a 1,4 s del build. La referencia es `astro build` + `node dist/server/entry.mjs`.
5. **Las imágenes se generan con el mismo encoder y calidad que Astro** (sharp, WebP 80, resolución original en los logos). Si no, la prueba visual marca diferencias de suavizado que no son de diseño.
6. **`bin/astro-css-to-block.mjs` automatiza el paso del CSS** (sin `:global()`, la raíz pasa a ser el wrapper, el resto queda dentro, con tabs). Se usó en hero y footer y queda para las secciones que siguen.
7. **PHPCBF puede romper una etiqueta HTML** que tenga PHP en medio (`<footer <?php …?>>`). Los atributos del wrapper se calculan en una variable antes del HTML.
8. **Reparto:** depurar pruebas visuales consume mucho tiempo de desarrollo. Desde esta etapa Claude solo desarrolla y Codex se encarga de pruebas, bases y `bin/check` (pedido de William).
9. **AGY en `accept-edits` pide permiso para cada comando**, y en tareas con muchos comandos (generar imágenes) se traba. Sirve para revisiones de lectura; los assets los generó Claude.
