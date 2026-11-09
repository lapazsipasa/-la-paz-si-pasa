# Etapa 2: sección Retratos ("La Paz Sí Pasa" + slider)

Estado: **hecha** · aprobada y construida el 2026-11-08 · spec principal: [wordpress-fse.md](../wordpress-fse.md)

> Cambia el orden del plan: William pidió seguir con el slider de Retratos antes que con hero y footer. Esta etapa es un **corte vertical** con todo lo que necesita una sección real: contenido editable (SCF + CPT + seed), el bloque y sus pruebas. Hero y footer pasan a la etapa 3.

## Objetivo

Que los editores puedan cargar y ordenar los Retratos de la Paz (foto, descripción, proyecto, lugar) desde WordPress, y que la sección se vea y funcione igual que en Astro.

## Qué se construye

### 1. Contenido editable (se reutiliza todo lo que ya existe)

| Pieza | Cómo | Reutiliza |
|---|---|---|
| SCF | plugin **Secure Custom Fields 6.9.8** (probado con 7.1.4) horneado en la imagen desde su zip oficial, con versión fija, y activado por `lapaz-setup`. Se termina la instalación manual | — |
| CPT y campos | `apps/wordpress/scf-json/` se copia a la imagen. `post_type_retrato.json` + `group_retratos.json` (`foto`, `descripcion`, `proyecto`, `lugar`) sin cambios | `scf-json/` del headless |
| mu-plugin `lapaz-core.php` | ruta de los JSON de SCF y tope de 1500 px para imágenes. Además, con el filtro `register_post_type_args`, deja los CPT **sin URL pública** (`publicly_queryable: false`), así salen del sitemap. **No toca los JSON compartidos**, así el headless sigue igual | `headless-core.php` (solo esas 2 funciones) |
| Seed | `seed.php` y `seed/media/` se copian a la imagen. Comando: `docker compose exec -u www-data -e SEED_SOLO=retratos cms wp eval-file /opt/seed/seed.php` | `apps/wordpress/seed/` |

### 2. Bloque `lapaz/retratos`

```
apps/wordpress/themes/lapaz/
├── blocks/retratos/
│   ├── block.json     apiVersion 3, supports.autoRegister (aparece en el editor sin JS), viewScript, style
│   ├── render.php     marcado de RetratosPaz + IntroText + RetratosPazSlider, mismas clases
│   ├── style.css      CSS de los 3 componentes, sin :global(), bajo .wp-block-lapaz-retratos
│   └── view.js        el <script> del slider: astro:page-load → ejecución directa, sin tipos de TS
├── inc/blocks.php     registra cada carpeta de blocks/ con register_block_type()
├── assets/img/retratos/  fondo en WebP de 1100 y 600 px, logo-fondo-paz.svg, retratos-arrow.svg
└── templates/front-page.html  header + nav-desktop + main con lapaz/retratos
```

**Cómo se pasa:**
- **Datos:** `WP_Query` sobre `retrato`, en el mismo orden que el adapter de Astro (fecha, de la más reciente a la más antigua). Campos con `get_field()` y los mismos nombres del mapper `apps/frontend/src/adapters/wordpress/mappers/`.
- **Fotos:** `wp_get_attachment_image()` con el tamaño `1536x1536` (como `imagenUrl`), con `sizes="(min-width: 850px) 45vw, 55vw"`.
  - La primera foto va eager con `fetchpriority=high`; el resto, lazy.
  - El `alt` es la descripción.
- **Fondo:** `<picture>` con el breakpoint de 849 px, igual que hoy. Los WebP se generan una sola vez desde `src/assets/retratos/` y se guardan en el tema.
- **Flechas:** el SVG del tema se imprime inline con `wp_kses` y una lista de etiquetas SVG permitidas, porque PHPCS no deja imprimir sin escapar.
- **Copy de IntroText** ("La Paz Sí Pasa, pasa en los territorios"…): queda fijo, como dice la cotización, pero traducible con `esc_html_e( …, 'lapaz' )`.
- **Si no hay retratos publicados:** el slider no se pinta (sin mocks), pero el texto de la intro sí.

### 3. Pruebas y calidad

- **`bin/check`:**
  - se activa la validación de `block.json` contra el esquema oficial;
  - se agrega la regla de que todo selector de `blocks/*/style.css` empiece por `.wp-block-lapaz-<bloque>`.
- **`tests/e2e/retratos.mjs`:**
  - siguiente y anterior recorren las fotos de forma circular;
  - solo una foto y un texto quedan visibles a la vez (`aria-hidden`);
  - la primera foto no es lazy;
  - si no hay retratos, la sección no se rompe.
- **Prueba visual contra Astro con los mismos datos:**
  - Astro se apunta al WordPress FSE (`WORDPRESS_URL=http://localhost:8090`): los CPT y los campos SCF son idénticos y siguen expuestos por REST;
  - se comparan la sección completa a 360, 850 y 1440 px, y el slider después de dos clics en "siguiente".

## Fuera de alcance

- Hero y footer (pasan a la etapa 3).
- Edición del copy de IntroText.
- Swipe táctil, autoplay o teclado en el slider: hoy no existen y no se agregan.

## Definición de hecho

1. Con el seed cargado, `/` muestra la sección igual que Astro a 360, 850 y 1440 px. La comparación visual da menos de 1 % de diferencia.
2. Un editor crea, edita o despublica un retrato y el cambio se ve sin desplegar.
3. Las pruebas de `tests/e2e/retratos.mjs` y las del navbar pasan.
4. `bin/check` queda en verde, incluidas las reglas nuevas.
5. La imagen de producción (`compose.yaml` sin override) trae SCF, el mu-plugin, los JSON y el seed horneados, y `lapaz-setup` deja todo activo.
6. Se documenta en este archivo el resultado, con hallazgos y capturas.

## Riesgos

- Que el filtro de `publicly_queryable` choque con la vista previa en el admin. Se prueba "Vista previa" desde el editor del CPT.
- Que el seed suba 56 MB a la imagen, igual que en el headless. Si pesa demasiado, solo se copia `seed/media/retratos/` en esta etapa.

Estimación: 1 a 1,5 días.

## Resultado (2026-11-08)

Etapa construida y verificada.

| Verificación | Resultado |
|---|---|
| Fidelidad visual | Comparada con Astro **con los mismos datos**, porque Astro lee el WordPress FSE por REST. Sección completa: 0,01 % de píxeles distintos a 1440 px y 0,07 % a 360 px. Las cuatro bases de `retratos.mjs` (360, 850, 1440 y 1440 después de dos clics) quedan por debajo del 1 % |
| Comportamiento | `tests/e2e/retratos.mjs`: 43 comprobaciones que pasan. Avance circular en las dos direcciones, una sola foto y un solo texto visibles con `data-slide` igual, primera foto sin lazy, ARIA del carrusel y título. Navbar: sigue en verde |
| Edición | Al despublicar un retrato, el slider pasa de 15 a 14 fotos sin desplegar; al publicarlo vuelve a 15 |
| Editor | `lapaz/retratos` se registra con `supports.autoRegister: true`, sin JS de editor |
| Rendimiento | Primera foto `loading=eager` + `fetchpriority=high`; las demás lazy, con `sizes="auto, …"`, que agrega core. srcset de la biblioteca de medios. Fondo en WebP de 37 KB y 12 KB, generado una vez. `view.js` se carga con `defer` y solo en la portada |
| URLs y SEO | `/retrato/` responde 404; el sitemap solo lista `page` y `post` |
| Imagen de producción | Solo con `compose.yaml` (sin override): `lapaz-core`, SCF 6.9.8 activo, 13 JSON de campos, seed horneado y 15 retratos en la portada |
| Calidad | `bin/check` pasa sus 14 capas. La nueva es "Prefijo de bloque en CSS" |
| CI | El workflow carga el seed de retratos y corre `retratos.mjs` |

**Reparto:**
- Claude: contenido, mu-plugin, imagen, bloque y verificación.
- Codex: `tests/e2e/retratos.mjs`, `tests/e2e/lib.mjs` (código común con navbar), la regla de prefijo CSS y el workflow.
- AGY: los WebP del fondo y los SVG, y una revisión independiente del bloque frente a Astro (ver más abajo).

## Aprendizajes

**Del proceso:**
1. **Comparar con los mismos datos es lo que hace confiable la prueba visual.** Al apuntar Astro (`WORDPRESS_URL=http://localhost:8090`) al WordPress nuevo, las dos versiones pintan los mismos retratos, y cualquier diferencia de píxeles es diseño, no contenido. Sirve para todas las secciones que siguen.
2. **La comparación visual encontró lo que no ve un linter.** Los títulos salían en peso regular porque `theme.json` fijaba `fontWeight: 400` en los encabezados, mientras que Astro hereda el bold del navegador. Corregido a 700; la diferencia bajó del 5 % a 0,01 %.
3. **Un corte vertical por sección funciona mejor que construir por capas.** Contenido + bloque + pruebas en la misma etapa dejaron la sección terminada y editable de punta a punta, sin piezas a medias.
4. **El reparto entre agentes funcionó.** Las pruebas y los assets avanzaron en paralelo con el bloque. Lo que hay que cuidar:
   - **No correr `bin/check` en paralelo.** Dos agentes ejecutando `npm ci` sobre el mismo `node_modules` producen fallas falsas (Stylelint, ESLint y esquemas fallaron una vez solo por eso). Regla: un solo agente corre `bin/check` a la vez, y quien implementa da la última palabra.
   - **AGY pide permiso para cada comando** en `accept-edits`. Rinde mejor en tareas de lectura, revisión o archivos acotados. Codex trabaja solo dentro de su sandbox.
   - **Los contratos van en el brief:** clases, nombres de archivo y qué toca cada uno. Así no hubo choques de archivos.

**Técnicos:**
5. **`wp eval-file archivo arg` no pasa el argumento a `$argv`.** El seed cargaba todo. Para limitarlo hay que usar la variable `SEED_SOLO` (`docker compose exec -e SEED_SOLO=retratos …`); lo descubrió Codex.
6. **`img.decode()` nunca resuelve en imágenes lazy ocultas** (`aria-hidden`, `display: none`) y cuelga las pruebas. Solo se esperan las imágenes visibles, y con un tope de tiempo.
7. **Sin `view.asset.php`, WordPress versiona el `viewScript` con la versión de WP** (`?ver=7.1.4`): el navegador no se entera de los cambios del tema. `view.asset.php` con `filemtime()` lo resuelve. Ese nombre lo exige WordPress, así que PHPCS lleva una excepción documentada para `*.asset.php`.
8. **`register_post_type_args` permite cambiar los CPT sin tocar los JSON compartidos con el headless.** Así se quitaron las URLs públicas de los retratos sin afectar producción.
9. **`scf-json/` va montado en solo lectura en local:** se comparte con el headless, y un "Guardar" en el admin de SCF lo reescribiría.
10. **Pasar el CSS de Astro a un bloque se puede automatizar:** quitar `:global()` y anteponer `.wp-block-lapaz-<bloque>` a cada selector. Ahora `bin/check` exige ese prefijo, lo que evita las colisiones de clases.
11. **`autoRegister` (WP 7.0+) funciona en 7.1:** el bloque aparece en el editor solo con `block.json` y `render.php`.
12. **PHPStan al máximo obliga a tipar los datos de SCF** (`get_field` devuelve `mixed`). Los helpers `lapaz_field_text()` y `lapaz_field_image_id()` quedan como patrón para los próximos bloques.

**Para revisar:** con la imagen `wordpress:7.1.3`, WordPress tiene activos los plugins `ai`, `ai-provider-for-anthropic` y `ai-provider-for-google`. TODO: confirmar si vienen con core 7.x o con la imagen, y si se desactivan en producción.
