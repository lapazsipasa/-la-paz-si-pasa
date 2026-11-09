# Etapa 1: prueba de concepto del navbar

Estado: **hecha** · 2026-11-08 · spec principal: [wordpress-fse.md](../wordpress-fse.md)

## Objetivo

Comprobar que el menú del sitio se configura entero desde WordPress (Editor del sitio → Navegación) y se ve igual que el navbar de Astro.

## Qué se construye

| Pieza | Quién | Dónde |
|---|---|---|
| WordPress en cero, listo para Dokploy | Codex | `apps/wp-fse/` (`compose.yaml`, `compose.override.yaml`, `Dockerfile`, `docker/entrypoint.sh`, `docker/lapaz-setup`, `.env.example`, `composer.json`, `phpcs.xml.dist`) |
| Tema mínimo y navbar | AGY | `apps/wordpress/themes/lapaz/` (`style.css`, `theme.json`, `assets/`, `functions.php`, `parts/`, `templates/index.html`) |
| Coordinación, verificación y documentación | Claude | `wiki/` |

### Cómo queda el navbar

- **Móvil (< 850 px):** `parts/header.html` es un `header.site-header` con `core/site-title` como marca y `core/navigation` (`overlayMenu: always`, clase `lapaz-nav-mobile`). Reemplaza a `Nav.astro` y `NavMenu.astro`.
- **Escritorio (≥ 850 px):** `parts/nav-desktop.html` es `core/navigation` (`overlayMenu: never`, clase `lapaz-nav-desktop`), debajo del hero. Reemplaza a `NavMenuDesktop.astro`.
- **Un solo menú:** los dos bloques usan el mismo `wp_navigation` "Principal". `lapaz-setup` lo crea y guarda su ID en la opción `lapaz_nav_ref`. El tema rellena el `ref` con el filtro `render_block_data`, así que ningún ID queda fijo en el HTML.
- **Estilos:** el CSS de los 3 componentes se reutiliza en `assets/css/navigation.css` sobre las clases de `core/navigation`, y se carga solo donde aparece el bloque con `wp_enqueue_block_style`. Los tokens viejos (`--color-nav-text`, `--space-4`…) apuntan a los presets de `theme.json` desde `assets/css/base.css`, para que el CSS copiado funcione sin cambios.
- **JS:** no se copia el de `Nav.astro`. `core/navigation` ya trae apertura y cierre, `aria-expanded`, Esc, trampa de foco y bloqueo del scroll.

### Riesgo y alternativa

El botón nativo es un SVG, no los 3 `span` de hoy. Se iguala con CSS. Si la fidelidad no alcanza, la alternativa es un bloque `lapaz/nav` que lea el mismo `wp_navigation` con `parse_blocks()` y pinte el HTML y el JS actuales.

## Cómo se verifica

```bash
cd apps/wp-fse
cp .env.example .env               # completar WP_ADMIN_EMAIL
docker compose up -d --build       # usa compose.yaml + compose.override.yaml
docker compose exec -u www-data cms lapaz-setup
open http://localhost:8090
```

1. A 360, 850 y 1440 px se ve igual que Astro. Para comparar, `npm run dev` en `apps/frontend` funciona sin WordPress, con mocks.
2. Al agregar, renombrar o reordenar un ítem en Editor del sitio → Navegación, el cambio sale en el menú móvil y en el de escritorio.
3. Con teclado: Tab llega a la hamburguesa, Enter abre, Esc cierra y devuelve el foco. Con el menú abierto no hace scroll el body, y un clic en un ancla cierra el overlay.
4. Query Monitor no muestra errores de PHP, y `navigation.css` solo se carga en páginas con el bloque.
5. PHPCS: `docker run --rm -v "$PWD/..":/app -w /app/apps/wp-fse composer:2 sh -c "composer install && vendor/bin/phpcs"` termina sin errores.
6. El headless sigue igual: `docker compose up` en la raíz levanta `:8080` como antes.
7. `docker compose -f compose.yaml config` muestra lo mismo que desplegaría Dokploy: sin puertos, sin bind mounts y con healthchecks.

## Resultado (2026-11-08)

La prueba de concepto salió bien. **Se queda `core/navigation`; no hace falta la alternativa `lapaz/nav`.**

| Verificación | Resultado |
|---|---|
| Fidelidad visual | Móvil 360 px, cerrado y abierto, igual que Astro en capturas con viewport exacto (CDP). En escritorio a 850 y 1440 px, las cajas de los enlaces miden lo mismo al píxel: 1440 → x 56/504/952, ancho 432, alto 48; 850 → x 24/297/569, ancho 257 |
| Edición desde WordPress | Al renombrar, reordenar y agregar un ítem en el `wp_navigation`, el cambio aparece en los dos menús sin tocar código |
| Teclado y accesibilidad | Abre con foco en el primer enlace; Esc cierra y devuelve el foco al botón; el scroll queda bloqueado mientras está abierto; el botón se anuncia como «Abrir el menú» |
| Ancla en el overlay | core no cerraba el overlay al tocar `/#…`. Se agregó `assets/js/navigation.js` (8 líneas), que usa el botón nativo de cerrar y solo se carga donde aparece el bloque |
| PHPCS (WPCS 3) | 0 errores. Se configuró para revisar solo PHP |
| Errores de PHP | ninguno en los logs |
| Imagen de producción | `docker compose -f compose.yaml up --build`: sin puertos, sin bind mounts, tema horneado y copiado por el entrypoint, los dos servicios `healthy` y el navbar se renderiza |
| Setup idempotente | `lapaz-setup` corrido dos veces no duplica nada (menú ID 5, página Proyectos destacados) |
| Headless intacto | Ningún archivo del stack raíz cambió (`git status`) |

**Hallazgos:**
- `core/navigation` copia `className` a su `<ul>` interno. Por eso los selectores se acotan a `nav.lapaz-nav-desktop` y no se usa `container--wide` sobre el bloque.
- El layout flex del grupo pesa más que `header.site-header`. Se subió la especificidad a `header.wp-block-group.site-header`.
- El hueco del hero (etapa 2) todavía no existe, así que el menú de escritorio queda arriba. Al agregar el hero se ubica debajo, igual que en Astro.

**Reparto de trabajo:** Codex hizo la infraestructura (`apps/wp-fse/`) en un panel de Orca. Claude hizo el tema y la verificación. AGY se detuvo antes de crear archivos, al reasignarse el tema.
