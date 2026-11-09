# Tema `lapaz`

Tema de bloques (FSE) de La Paz Sí Pasa. Spec y etapas: [`wiki/specs/wordpress-fse.md`](../../../../wiki/specs/wordpress-fse.md).

```text
theme.json           tokens (paleta, fuentes, spacing 1…16, anchos) y estilos globales
style.css            solo la cabecera del tema
functions.php        CSS base, CSS por bloque, preload de fuente, ref del menú
assets/css/base.css  alias de los tokens de Astro hacia los presets de WP + reset y layout
assets/css/navigation.css  navbar sobre core/navigation (solo carga donde está el bloque)
assets/fonts/        Komet y Monique Round (woff2)
parts/               header (móvil) y nav-desktop
templates/           index.html
```

**Menú:** se edita en *Apariencia → Editor → Navegación*. Los dos navbars (móvil y escritorio) usan el mismo menú `wp_navigation`, cuyo ID guarda `lapaz-setup` en la opción `lapaz_nav_ref`; el filtro `lapaz_navigation_ref` lo asigna a los bloques con clase `lapaz-nav-*`.

**Marca del header móvil:** es el título del sitio (*Ajustes → Generales*).
