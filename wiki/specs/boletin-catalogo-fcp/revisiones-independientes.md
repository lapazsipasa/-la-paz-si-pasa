# Revisiones independientes del boletín y el catálogo

**Estado (2026-11-23): revisiones hasta la 45 (ver 40 a 45).** Resumen del 2026-11-21: veintinueve revisiones independientes (1 a 10, 12, 13, 15 a 19, 21 a 23, 25 a 27, 29, 32, 34, 35, 36 y 38) y nueve tareas de redacción (11, 14, 20, 24, 28, 30, 31, 33 y 37). Las revisiones de solo lectura de la 1 a la 35 las hizo AGY sobre la rama `feat/boletin-catalogo-fcp`. La 25 tuvo una primera pasada de un subagente, porque AGY agotó su cuota; AGY la repitió el 2026-11-21. La 36 retocó imágenes del manual; el revisor de las 36 y 38 no está anotado (TODO: verificar). La 39 (lectura completa del manual maquetado) está en curso: la hace un subagente revisor, no AGY, porque AGY perdió su sesión (error de autenticación) al final del día. Los informes completos no están en el repo. Esta página deja constancia de cada una: veredicto, hallazgos relevantes, commit que los resolvió y lo que quedó sin aplicar. Estado de la rama al cierre: 45 commits, último `7bb554f`; sin commit, la sincronización de la wiki de hoy y las herramientas del manual.

Gravedad: **bloqueante** impide abrir el PR · **alto** y **crítico** son de seguridad o privacidad · **importante** se arregla antes de producción · los menores se citan en una frase.

Lo que sigue pendiente, en dos listas: [pendiente de decisión o de acceso al servidor](#pendiente-de-decisión-o-de-acceso-al-servidor) y [pendiente de probar en staging](#pendiente-de-probar-en-staging).

---

## 1. Código y estilo

- **Veredicto:** la arquitectura de datos es sólida y segura en los parámetros y en las salidas. No lista para PR por cinco bloqueantes.
- **Bloqueantes:** aserciones de tipografía invertidas en `boletin.mjs`; consulta `wpJson` antes de `seed()` en `catalogo.mjs`; hojas CSS declaradas en `blocks/boletin/block.json` que no existían; contraste de 3,53:1 en `historia-destacada` y `historia`; saltos de `h2` a `h4`.
- **Importantes (8):** reindexado del catálogo al cambiar términos; estado «cargando» atascado ante error de red; consultas repetidas en `/boletin/`; `get_field()` suelto en plantillas; falta `fetchpriority` en la portada del boletín; botón de galería sin nombre; `bin/check` solo revisaba `style.css`; cursiva sintética sobre Komet.
- **Menores:** `no_found_rows` en la historia reciente, erratas de las etiquetas SCF y `enteros()` sin separador de miles.
- **Commit:** `667cf01` (primera ronda), `c710ccf` (suites e2e).
- **Sin aplicar del todo:** la revisión 8 vuelve a encontrar aserciones que pasan en falso en `boletin.mjs`. Ver revisión 8.

## 2. Verificación y CSS modular

- **Veredicto:** las correcciones de la revisión 1 quedaron bien resueltas. No lista para pedir aprobación por dos bloqueantes rápidos.
- **Bloqueantes:** `inc/guia-estilos.php` con 301 líneas (tope de 300 de `bin/check`); suites e2e sin commit mientras CI ya las ejecutaba (resuelto en `c710ccf`).
- **Importantes:** reindexado redundante en el seed de 316 productores; la guía de estilos debía quedar fuera de producción.
- **Menores:** `h1` del estado vacío del boletín; el campo «Rótulo» ofrece naranja, azul y verde, pero solo el verde cambia; `.credito` duplicado; `h2` dentro de la guía.
- **Verificado sin hallazgos:** hoja compartida `assets/css/editorial.css`, tokens en `theme.json`, cero colores sueltos, contraste AA en los cinco bloques editoriales.
- **Commit:** `e6eb811` (guía a 235 líneas, reindexado, guía vacía en producción), `c710ccf` (suites), `1fc1301` (tokens y hoja compartida, sin hallazgos).
- **Sin aplicar:** el criterio del rótulo naranja o azul es decisión de William.

## 3. Navegación, hero, accesos y responsive

- **Veredicto:** los hallazgos de la revisión 2 quedaron resueltos. Sin bloqueantes; cinco importantes.
- **Importantes:** imagen LCP de `/paissana/` en `lazy`; el hero compacto oculto en móvil descargaba su foto; márgenes negativos repetidos; `aria-disabled` en un `<span>`; `lapaz_nav_path()` no comparaba el host.
- **Menores:** nota desactualizada en `accesos-paginas-existentes.md` (retirada en `8347916`); `revision-seo-enlaces.md` con hallazgos ya resueltos (actualizado en su propia página); clase `verde` muerta en `historia-destacada` (ya no está).
- **Commit:** `e152e69` (importantes), `8347916` (nota), `afa96b4` (responsive, previo a la revisión).
- **Sin aplicar:** nada del bloque. Lo que sigue, en [revisión responsive](revision-responsive.md) (nota de rutas arriba) y [revisión de SEO](revision-seo-enlaces.md) (estado arriba).

## 4. Experiencia del editor y documentos

- **Veredicto:** pestañas claras y ocho secciones precargadas. Bloqueo de usabilidad: la pestaña «Crónica» de las historias clonaba el molde Artículo entero, con nueve campos que el sitio no muestra y un «Título» obligatorio que impedía publicar.
- **Commit:** `a0c2b63` (crónica sin el molde, etiquetas en lenguaje llano, color Azul o Verde, campos de video que aparecen solo con video, «Índice: título» obligatorio en cifras, tarjetas y agenda).
- **Documentos:** la revisión pedía poner al día la wiki y la guía de despliegue. Se hizo en esta entrega.
- **Sin aplicar:**
  - el manual del editor: versión 2 en [`manual-editor.md`](../../manual-editor.md) (commits `3e08f05`, `2b7fe49` y `28f1cf0`); faltan capturas y pasarlo a Google Doc. El usuario Editor sigue pendiente de datos del Fondo;
  - ver en `wp-admin` real cómo SCF pinta el molde clonado y los botones de TinyMCE: no se pudo en la revisión; TODO: confirmar en staging.

## 5. Seguridad y privacidad de datos

- **Veredicto:** buena higiene del código (escapes, `WP_Query` parametrizada, validación de slugs y de IDs de YouTube). Dos altos antes de publicar: la API REST sin sesión y datos sensibles de personas en el repo público.
- **Alto 1, API REST:** productores, taxonomías y grupos entregaban sin sesión lo que el sitio no muestra.
  - **Commit:** `3b2941d`. Tipos, taxonomías y grupos fuera de REST, con un filtro en `lapaz-seguridad.php` que impide reabrirlos.
- **Alto 2, datos de personas:** el seed trae la población atendida, enlaces de redes y 12 registros con nombre de persona natural (7 con etnia o condición de víctima).
  - **Sin aplicar a propósito:** decisión de William del 2026-11-20 (ver [decisiones](../../decisions/boletin-catalogo-fcp.md#4-el-contenido-inicial-entra-al-seed-y-al-repo-público)).
  - **Pendiente del Fondo:** autorización de esas personas y corregir el registro «Llaneridad Gourmet», cuyo municipio viene como número.
- **Medios:**
  - caché de página sin límite de query strings: resuelto en `3b2941d` (`^/productores/.*\?` en `lapaz-setup`);
  - el rol Editor puede tocar páginas estructurales, pero no el menú: sin aplicar. El manual debe decir que el menú lo cambia un administrador.
- **Bajos:** tipo MIME del video y esquema `https` del enlace (`3b2941d`); compatibilidad con CSP (`ff6445d`, en modo informe); guía de estilos en producción (resuelto en `e6eb811`).
- **Verificado sin hallazgos:** sin EXIF, GPS ni XMP en las 22 fotos del seed; sin correos ni teléfonos en los JSON del boletín y la historia.
- **Sin aplicar:** duplicación menor de CSS en `catalogo-banner` (menor, sin urgencia).

## 6. Accesibilidad y rendimiento

- **Veredicto:** el texto de los bloques nuevos cumple WCAG 2.2 AA con holgura (mínimo 5,97:1). Dos bloqueantes AA y cuatro importantes; además, un hueco en la invalidación de caché.
- **Bloqueantes:** el ítem activo del menú se distinguía solo por el color; la pista de las barras de distribución no tenía contraste suficiente.
- **Importantes:** flechas leídas por lectores de pantalla y falta de aviso al abrir pestaña nueva; el foco se perdía al agotar «Ver más»; el lightbox no dejaba inerte el fondo; los enlaces de «Otras ediciones» medían menos de 44 px.
- **Rendimiento:** el logo de PaisSana pesaba 1300×480 y se pintaba a 144 px; la galería hacía 25 consultas; la caché de página no se vaciaba al publicar.
- **Commit:** `239dcc9`. Línea inferior en el ítem activo, lightbox como `<dialog>`, foco en «Ver más», galería con 4 consultas, logo y miniaturas a su tamaño, vaciado de caché al publicar, productor, boletín o historia.
- **Sin aplicar:**
  - `.titulo-art` en `<h2>` (mismo nivel que `.sec-title`): no aplicado a propósito porque el cuerpo WYSIWYG usa `<h3>`;
  - tarjetas del índice del boletín como `<article>` con enlace estirado: resuelto después en `1d87a5b` y `35b50b3` (ver revisiones 10 y 17);
  - los requisitos de accesibilidad para el manual del editor: incorporados en [`manual-editor.md`](../../manual-editor.md) (commit `2b7fe49`; TODO: verificar que cubren todos los requisitos).

## 7. Ciberseguridad del sitio completo

- **Veredicto:** base defensiva por encima de un WordPress estándar. Sin críticos en el código. Dos altos preexistentes: el panel del servidor expuesto por HTTP con datos internos en el repo público, y ningún límite de intentos en el inicio de sesión.
- **Altos:**
  - **A1, datos internos en el repo:** `ff6445d` retiró de la wiki las direcciones, los paneles y los nombres internos. Quedan marcadores. El servidor sigue pendiente (ver lista).
  - **A2, fuerza bruta:** el mensaje de error de login es genérico (`ff6445d`). El límite de intentos en Traefik sigue pendiente.
- **Medios:**
  - contraseñas de aplicación desactivadas (`ff6445d`); el segundo factor del editor sigue pendiente;
  - API REST y oEmbed cerrados sin sesión (`3b2941d`, `ff6445d`);
  - `no-new-privileges` en los contenedores (`ff6445d`);
  - Apache sin listado de directorios y con archivos sensibles bloqueados (`ff6445d`);
  - HSTS y CSP en modo informe (`ff6445d`);
  - `lapaz-importar` con permisos restringidos y `tar` seguro (`ff6445d`);
  - acciones de GitHub fijadas por SHA (`ff6445d`), pero las imágenes Docker siguen con etiqueta, no con digest;
  - propietario del código en el contenedor (`root:www-data`): no aplicado. La revisión lo considera seguro, pero exige reconstruir y probar;
  - requisitos antes de instalar The SEO Framework: pendientes.
- **Bajos:** límites de PHP (`ff6445d`), `.dockerignore` (`ff6445d`), disparadores de CI por ruta (`ff6445d`). Sin aplicar: exigir `WP_ADMIN_USER` (ver lista).
- **Sin aplicar a propósito:** restringir `wp-cron.php`. Bloquearlo rompe las publicaciones programadas, porque WordPress lo llama por la URL pública. Forma segura: `DISABLE_WP_CRON` y un disparador externo.

## 8. Pruebas automáticas

- **Veredicto:** la base estaba al ~75 % y no se podía dejar en verde por cuatro bloqueos: `lib.mjs` dejaba procesos Chrome huérfanos ante señales; había aserciones en falso o en vacío (`navegacion.mjs`, `boletin.mjs`); `navegacion.mjs` escribía a mano `/paissana/` y no probaba `/historias/`; CI no ejecutaba `navegacion.mjs` ni `rest.mjs`.
- **Commit:** `9bb6c80` (cerró T1 a T6: arnés con `detached: true` y limpieza en señales, puerto aleatorio `0`, `prepararPintado()`, constantes de ruta en `fcp-lib.mjs`, suites `boletin`, `catalogo`, `historia`, `navegacion` y `rest` sin Chrome, CI y bases visuales).
- **Estado (local, 2026-11-20):** en verde `navegacion` 181, `catalogo` 58, `boletin` 56, `historia` 43, `rest` 22 y `lo-que-hacemos` 24; `seguridad` 64 de 64 con la imagen reconstruida, y `seo` 280. Son cifras de antes de las pruebas de la revisión 26.
- **Corrida final (2026-11-21, sobre `7bb554f`):** `bin/check` en verde (17 pasos) y las 18 suites con salida 0 sobre la imagen reconstruida (965 comprobaciones; `admin` 20 tras el refuerzo de `2eeeb72`). `wp()` duplicada en `lo-que-hacemos.mjs` resuelta en `e78e2f1`.

## 9. URL nuevas y endurecimiento

- **Veredicto:** los tres commits (`1e799ea`, `3b2941d`, `ff6445d`) son sólidos; no quedan rutas `/paissana/` ni IP o paneles en el repo. Sin bloqueantes.
- **Importantes:**
  - CSP en modo activo rompería el reproductor de YouTube de Plyr en `/proyectos-destacados/`. Pendiente: no activar sin probar en staging.
  - `memory_limit = 256M` dentro de un contenedor de 512 MB con `mod_php` puede llevar a OOM con dos subidas a la vez. Resuelto en `f0f5f67` (`memory_limit = 128M`); el tope del contenedor sigue siendo decisión de William.
  - `/historias/` sin historias pintaba `<main>` vacío sin `<h1>`. Resuelto: el estado vacío ya tiene `<h1>` (`blocks/historia/render.php`).
- **Menores:**
  - `lapaz_url_catalogo_base()` no comprobaba que la página estuviera publicada. Resuelto en `f0f5f67` (`inc/accesos.php`).
  - Paginación habilitada en el archivo de historias: resuelto en `f0f5f67`. TODO: confirmar si conviene.
  - `lapaz-setup` con las páginas `paissana` y `productores` a la vez: resuelto en `f0f5f67` (avisa y no borra nada).
- **Commit:** `f0f5f67` (`<h1>` y aviso en `/historias/` vacío, archivo sin paginación, `lapaz_url_catalogo_base()` exige publicación, `lapaz-setup` publica la página migrada y avisa si conviven ambas, `memory_limit = 128M`, CSP-Report-Only con YouTube/noembed, MariaDB fijada a `11.8`).
- **Sin aplicar:** activar CSP (espera prueba en staging sin violaciones); posible aviso de REST 401 en *Salud del sitio* (comprobar en staging).

## 10. Accesibilidad AA y rendimiento aplicados (`239dcc9`)

- **Veredicto:** los bloqueantes AA de la revisión 6 (menú activo 5,98:1 y pista de barras 5,98:1–7,58:1) y las mejoras de rendimiento quedaron bien cerrados; dos importantes pendientes en lightbox y vaciado de caché.
- **Importantes:** el `<dialog>` del lightbox no escuchaba el evento nativo `close` (Escape/gesto dejaba `.on`, `src` y foco sin limpiar); `lapaz-core.php` no vaciaba caché al editar el menú (`wp_navigation`), páginas, los 6 CPT previos ni términos de taxonomías del catálogo.
- **Menores:** `<dialog>` sin bloqueo de scroll del fondo; `assets/css/editorial.css` a 18 líneas del tope de 400; posible doble anuncio al enfocar `.conteo` (`tabindex="-1"` + `aria-live="polite"`).
- **Commit:** `1d87a5b` (listener `close` y bloqueo de scroll en `blocks/historia/view.js`; `lapaz-core.php` ampliado a menú, páginas, 6 CPT y taxonomías; división en `assets/css/editorial.css` y `assets/css/lectura.css`; tarjetas del índice como `<article>` con enlace estirado).
- **Sin aplicar:** doble anuncio de `.conteo` (pendiente de comprobar con VoiceOver/NVDA).

## 11. Borrador del manual del editor (redacción)

- Tarea de redacción: primera versión de [`manual-editor.md`](../../manual-editor.md), integrada en `3e08f05`.

## 12. Verificación de suites e2e (`9bb6c80`)

- **Veredicto:** ya se puede confiar en el verde del arnés y las suites; quedaban tres huecos importantes en `catalogo.mjs` y `rest.mjs`.
- **Importantes:** `catalogo.mjs` llamaba manualmente a `lapaz_catalogo_indexar($id)` en lugar de probar el indexado automático del MU-plugin; `rest.mjs` no tenía guarda `exigirLocal()`; aserción de `oEmbed` en `rest.mjs` aceptaba un `500` vacío.
- **Menores:** `page.evaluate()` sin `seguro()` en `navegacion.mjs`; dependencia del reloj en `boletin.mjs` e `historia.mjs`; `?ver=288` acoplado a 316 productores; `wp()` duplicada en `lo-que-hacemos.mjs`.
- **Commit:** `e78e2f1` (resueltos los tres importantes y los cuatro menores).
- **Sin aplicar:** cobertura adicional sugerida (limpieza de filtros activos, estado vacío de `/historias/`, verificación de `lapaz_cache_vaciar` en `shutdown`, `securitypolicyviolation` de CSP): no bloquea el PR.

## 13. Documentación (`3e08f05`) y manual del editor

- **Veredicto:** árbol actual 100 % limpio de IP, paneles y credenciales; la wiki llevaba 3 commits de retraso frente a `git log` y el manual tenía imprecisiones menores en nombres de campos.
- **Importantes:** `updates.md`, `changelog.md`, `revisiones-independientes.md`, `contrato.md`, `boletin-catalogo-fcp.md` y `entorno-desarrollo.md` desactualizados; `despliegue-fse.md` sin respaldo previo, sin comando propio de grupos SCF ni verificación de conteos; el historial git anterior a `ff6445d` aún contiene direcciones redactadas (no hacer `git push` sin aplastar).
- **Menores:** 7 ajustes de etiquetas y claridad en `manual-editor.md`; duplicación de listas de pendientes entre `despliegue-fse.md`, `updates.md` y esta página.
- **Commit:** `3e08f05` (documentación); el manual v2 y los ajustes de esta revisión, en `2b7fe49` y `28f1cf0`. Los textos de sincronización de la wiki, en la tarea 20.

## 14. Manual v2, descripción de PR y nota para el Fondo (redacción)

- Tarea de redacción: actualización de [`manual-editor.md`](../../manual-editor.md), borrador de PR en [`prs/boletin-catalogo-fcp.md`](../../prs/boletin-catalogo-fcp.md) y nota de entrega en [`nota-para-el-fondo.md`](nota-para-el-fondo.md) (commit `2b7fe49`; el borrador de PR se reescribió el 2026-11-21 como descripción final, sin commit).

## 15. Ensayo en papel del despliegue y marcha atrás

- **Veredicto:** desplegable en staging tal cual y en producción con respaldo previo y tres ajustes en `lapaz-setup`; el headless de respaldo tiene diff 0.
- **Importantes:** `lapaz-setup` no vaciaba WP Super Cache al terminar, no avisaba de plantillas personalizadas en la base (`wp_template`/`wp_template_part`) que tapan el tema, ni bloqueaba `--seed` sobre producción ya instalada.
- **Menores:** subir de `mariadb:11` a `11.8` impide downgrade binario de `db` (en rollback se revierte `cms` o se restaura dump SQL).
- **Commit:** `2f13b6b`. Los tres importantes están aplicados en `apps/wp-fse/docker/lapaz-setup` (auditados en la revisión 19; plan de marcha atrás y checklist en la tarea 20).

## 16. Diseño de integración de The SEO Framework (`seo-plugin.md`)

- **Veredicto:** viable con ajustes puntuales antes de implementar; dos bloqueantes en el diseño y cuatro importantes.
- **Bloqueantes:** la sección 4.1 borraba el SEO del tema contradiciendo el fallback sin plugin y olvidaba `lapaz_noindex_fuera_de_produccion` (duplicaría `meta[name="robots"]`); instalar la traducción `es_CO` en tiempo de ejecución no está probado bajo `DISALLOW_FILE_MODS=true`.
- **Importantes:** faltaban `proyectos-destacados` y `404` en el filtro de título y validar `$_GET['buscar']` vacío; migración de extractos fuera de la guarda única `lapaz_seo_configurado`; `/wp-sitemap.xml` → `/sitemap.xml` sin 301 ni exclusión `^/sitemap` en WP Super Cache; definir `og:locale` (`es_ES` vs `es_CO`) y `og:title` antes de tocar `seo.mjs`.
- **Menores:** documentar que las actualizaciones de seguridad de `autodescription` entran solo por `Dockerfile`.
- **Commit:** `2f13b6b` (`inc/seo-tsf.php`, `autodescription` 5.2.1).

## 17. Verificación de correcciones de las revisiones 10 (`1d87a5b`) y 12 (`e78e2f1`)

- **Veredicto:** ambos commits cerraron limpiamente los hallazgos de las revisiones 10 y 12 (`editorial.css` en 250 líneas y `lectura.css` en 137); quedaban dos detalles importantes rápidos.
- **Importantes:** `.tema h3 a:focus-visible { outline: none }` quitaba el foco sin `@supports selector(:has(*))` (riesgo WCAG 2.4.7); `historia.mjs` solo esperaba `open === false` al cerrar el lightbox con Escape (riesgo de intermitencia).
- **Menores:** tarjeta del índice sin título dejaba «Ir a la sección →» sin enlace; posible salto lateral al ocultar el scroll en `body`.
- **Commit:** `35b50b3` (envuelve el foco en `@supports selector(:has(*))`, espera completa en `historia.mjs`, respaldo al nombre de sección en `indice.php`).
- **Sin aplicar:** `scrollbar-gutter: stable` (cosmético menor).

## 18. Fidelidad del contenido cargado frente a `raw/`

- **Veredicto:** se cumplió «queda como venía»: las 8 secciones y 10 fotos del boletín, la crónica y 12 fotos de Asocafé y los 316 productores (28 departamentos, 10 categorías) pasaron íntegros sin omisiones ni duplicados.
- **Importantes:** ninguno. Solo diferencias deliberadas (omisión de logos del prototipo y del aviso de video local en Drive; normalización de espacios dobles y tildes/mayúsculas en etiquetas tomadas del HTML del prototipo; centinelas «Ninguno» omitidos en taxonomías).
- **Menores:** claves sobrantes en `historia-asocafe.json` (`cronica.rotulo_color`, etc.), ya quitadas en `384db0d`; tres puntos editoriales para confirmar con el Fondo («Boletín interno», nota «Registro con corte a septiembre de 2026» y erratas de origen en registros de productores).
- **Commit:** `384db0d` (la crónica de Asocafé solo lleva los campos de su formulario). Las consultas al Fondo están en [`nota-para-el-fondo.md`](nota-para-el-fondo.md).

## 19. Cambios de `lapaz-setup` (árbol de trabajo)

- **Veredicto:** la guarda contra `--seed`, el aviso de plantillas y el vaciado de caché están bien ubicados y no rompen CI, `lapaz-importar` ni el primer arranque en producción; tres hallazgos medios antes de hacer commit.
- **Medios:** `wp post list ... | tail -n +2` sin protección aborta el script bajo `set -euo pipefail` antes de vaciar la caché (y no filtra `--wp_theme=lapaz --post_status=publish`); el `case` de argumentos ignora en silencio opciones desconocidas (`--help`, typos); el vaciado de caché no avisa por `stderr` si falta `wp_cache_clear_cache()` o si `wp-content/cache/` no es escribible.
- **Estado:** los tres medios están corregidos en `2f13b6b` (el `case` rechaza opciones desconocidas, el vaciado avisa por `stderr`, ya no hay `tail -n +2`). No se ha ejecutado el script en local. TODO: verificar en staging.
- **Bajos:** añadir `--path=/var/www/html` al comando alternativo del mensaje de error; anotar en la guía el caso de instalación previa por asistente web.
- **Commit:** `2f13b6b`.

## 20. Textos de sincronización de la wiki (redacción)

- Tarea de redacción: textos listos para actualizar esta página, [`despliegue-fse.md`](../../despliegue-fse.md), [`changelog.md`](../../changelog.md), [`updates.md`](../../updates.md), [`contrato.md`](contrato.md), [`boletin-catalogo-fcp.md`](../boletin-catalogo-fcp.md), [`entorno-desarrollo.md`](../../entorno-desarrollo.md), [`index.md`](../../index.md), [`AGENTS.md`](../../../AGENTS.md) y la lista única de pendientes.

## 21. Plugin de SEO en la imagen y el arranque

- **Veredicto:** arquitectura sólida; un riesgo bloqueante y tres importantes antes del primer arranque.
- **Hallazgos:**
  - **Bloqueante:** la firma de la API del plugin no estaba verificada, y el vaciado del sitemap no comprobaba `class_exists`: abortaba el arranque si el plugin faltaba.
  - SCF y el plugin se activaban en la misma llamada.
  - El sitemap se vaciaba antes de tiempo.
  - La copia de idiomas de `entrypoint.sh` podía impedir el arranque.
  - El paquete de idioma de wordpress.org cambia de suma cuando alguien edita una traducción.
- **Commit:** `2f13b6b`: activación tolerante con aviso, firma confirmada en el código del plugin, vaciado al final, copia de idiomas tolerante y traducción `es_CO` guardada en el repo (`apps/wp-fse/docker/languages/plugins/`).
- **Sin aplicar:** ninguno.

## 22. Integración del plugin en el tema

- **Veredicto:** sin bloqueantes; ningún camino deja producción en `noindex`.
- **Hallazgos:**
  - `/boletin/` e `/historias/` ignoraban lo que el editor escribía en la caja de SEO de la entrada más reciente.
  - El catálogo filtrado llevaba `nofollow` y `noindex` en más casos de los decididos (D1 de la [auditoría de SEO](revision-seo-enlaces.md#5-decisiones-para-william)).
  - `inc/seo-tsf.php` quedó a 3 líneas del tope de 300.
  - Consulta repetida por la página de la guía.
  - El CSS de la caja se imprimía en todo el admin.
  - La redirección del sitemap antiguo no cubría la barra final ni los sub-sitemaps.
- **Commit:** `2f13b6b` (`inc/seo-tsf.php`, ya en 279 líneas).
- **Sin aplicar:** ninguno.

## 23. Auditoría de sobras antes del PR

- **Veredicto:** rama limpia: sin funciones, clases CSS, tokens, atributos de bloque ni archivos muertos.
- **Hallazgos:** seis retoques menores, entre ellos una clase `azul` sin regla CSS, comentarios heredados y un helper de pruebas que el revisor creyó sin uso.
- **Commit:** `2f13b6b` (la clase y los comentarios).
- **Sin aplicar:** el helper `restosPrueba` de `apps/wp-fse/tests/e2e/fcp-lib.mjs` sí se usa dentro del propio archivo (línea 100): el hallazgo era incorrecto.

## 24. Documentación del plugin de SEO y descripción final del PR (redacción)

- **Resultado:** textos de la integración de The SEO Framework: sección 10 de [`manual-editor.md`](../../manual-editor.md) (cadenas verificadas en `es_CO`), [`seo-plugin.md`](seo-plugin.md), [`despliegue-fse.md`](../../despliegue-fse.md), [`prs/boletin-catalogo-fcp.md`](../../prs/boletin-catalogo-fcp.md) y la wiki sincronizada.
- **Commit:** aplicado en `28f1cf0`; la sincronización del 2026-11-21, sin commit.

## 25. Repetición de la verificación de los ajustes de la 22 (AGY, 2026-11-21)

- **Veredicto:** todo lo de las revisiones 21 y 22 quedó resuelto. Imprimir el CSS desde el filtro de pestañas de TSF es seguro en 5.2.1 (el filtro se aplica una sola vez, al pintar la caja), pero es frágil: si una versión futura lo llama antes de cabeceras o en AJAX, habrá que moverlo a `admin_head-post.php`. Producción nunca queda en `noindex` por error.
- **Estado:** primera pasada de un subagente, porque AGY agotó su cuota; AGY la repitió el 2026-11-21 con este resultado.
- **Cierres:**
  - PHPCS en `inc/boletin.php` y la canónica de `boletin.mjs` e `historia.mjs`: hechos en `1d4e1b2`.
  - `seo.mjs`: el contenedor se baja también si la suite se interrumpe (`compose('down')` en `alSalir`): hecho en `2f13b6b`.
- **Menores:**
  - la imagen para compartir sale a tamaño completo (`'full'` en `inc/seo-tsf.php:168` y `seo.mjs:195`): hecho en `2f13b6b`. La propuesta de cambiar a `'large'` no procede: ningún archivo lo usa;
  - `alSalir` como conjunto para no repetir restauraciones: hecho;
  - `restosPrueba()` de `fcp-lib.mjs` no se borra: sí se usa (línea 100), ver la 23.
  - staging queda indexable si el panel de despliegue no define `WP_ENVIRONMENT_TYPE=staging`.
- **Commit:** `2f13b6b` (imagen a tamaño completo), `1d4e1b2` (canónica y PHPCS).
- **Sin aplicar:** definir `WP_ENVIRONMENT_TYPE=staging` en el panel de staging (ver la [tabla de variables](../../despliegue-fse.md)).

## 26. Seguridad de lo añadido desde la revisión 9 (`f0f5f67..HEAD`)

- **Veredicto:** nada crítico ni alto. No se abrieron rutas REST; la redirección de sitemaps no depende de `Host`; un anónimo no puede disparar el vaciado de caché; el frontend no usa `innerHTML`; `autodescription-es_CO.l10n.php` es solo un `return` de cadenas.
- **Medios (corregidos en `1546852`):**
  - Un Editor podía guardar redirección, canónica o `noindex` enviando el formulario a mano, porque ocultar la pestaña solo quitaba el HTML. Corrección: `lapaz_tsf_bloquear_visibilidad()` en `inc/seo-tsf.php`, en el filtro `the_seo_framework_save_post_meta`. Prueba en `seo.mjs`.
  - Se podían pedir por HTTP los `.php`, `.mo` y `.po` de `wp-content/languages`. Corrección: bloque en `docker/apache/zz-lapaz-seguridad.conf`. Prueba en `seguridad.mjs` (403).
- **Bajos:**
  - `_social_image_url` sin validar el esquema en el tema: `esc_url_raw` con `http` y `https` en `inc/seo-tsf.php` (corregido en `1546852`);
  - alertas de seguridad para los tres plugins fijados en la imagen (`secure-custom-fields`, `wp-super-cache`, `autodescription`): sin aplicar, es tarea del responsable técnico (ver la lista de pendientes del servidor).
- **Commit:** `1546852` (correcciones de la revisión 26; verificadas en la 29).

## 27. Auditoría final de la wiki frente al código y el historial

- **Veredicto:** la wiki está al día salvo desfases puntuales. Sin IPs, paneles, correos, teléfonos ni credenciales en `wiki/`, `README.md`, `AGENTS.md`, `apps/wordpress/seed/README.md`, `apps/wp-fse/docker/` ni `apps/wp-fse/bin/`. La sección 10 del manual coincide con `autodescription-es_CO.l10n.php`.
- **Corregido:** «sin commit» obsoletos en `despliegue-fse.md` y `seo-plugin.md`; pendientes ya resueltos quitados de la lista única; `prs/boletin-catalogo-fcp.md` y `updates.md` al día; la descripción de `/productores/` en `seo-plugin.md` (no tiene rama propia en `inc/seo-tsf.php`); `lapaz-setup` en los README (activa The SEO Framework y bloquea `--seed` en producción ya instalada).
- **Comprobado y sin cambio:** la imagen social usa `'full'` en `inc/seo-tsf.php:168` y en `seo.mjs:195`. La auditoría decía `'large'`, y no es así.
- **Commit:** `d957a80`.

## 28. Guion de pruebas de staging (redacción)

- Tarea de redacción: guion de pruebas de staging en [plan-staging](plan-staging.md), que cubre la lista de [pendiente de probar en staging](#pendiente-de-probar-en-staging).

## 29. Verificación de las correcciones de la revisión 26 (AGY, 2026-11-21)
- **Veredicto:** las tres correcciones de la 26 quedaron resueltas: bloqueo de la visibilidad de TSF al Editor en el servidor, bloque de Apache para `.php`, `.mo` y `.po` de `wp-content/languages`, y esquema `http`/`https` en la imagen social. Sin bloqueantes.
- **Menores:** `inc/seo-tsf.php` a 297 de 300 líneas (el bloqueo pasó a `inc/seo-tsf-editor.php`); en `seo.mjs` faltaba probar que un `noindex` del admin se conserva cuando guarda el Editor.
- **Commit:** `1546852`. La extracción y la prueba de preservación están en ese commit. TODO: verificar que `borrar()` en `seo.mjs` también borra el post `__prueba`.
- **Sin aplicar:** nada del bloque.

## 30. Lista de capturas y manual para el documento (redacción)
- Tarea de redacción: lista de capturas del manual y texto para el documento de Google que se entrega al Fondo. Los rótulos verificados en pantalla pasan a [manual-editor](../../manual-editor.md).

## 31. Mapa de campos de WordPress a cambios en el sitio (redacción)
- Tarea de redacción: mapa de cada campo de WordPress a lo que cambia en el sitio, con 13 láminas numeradas que emparejan la pantalla y el bloque (ver [manual-editor](../../manual-editor.md)).

## 32. Firmas y contextos de The SEO Framework 5.2.1 y ganchos de admin (AGY, urgente)
- **Veredicto:** un fallo crítico, con todas las suites en verde: las pantallas de edición de boletines, historias y páginas se cortaban por un `TypeError` en `lapaz_tsf_imagen()` (filtro de la imagen para compartir), porque el plugin pasa `null` donde el tema espera `bool`. Además, dos altos de lógica en `inc/seo-tsf.php`, uno medio y dos bajos. El fallo entró con la integración del plugin (`2f13b6b`).
- **Hallazgos:** C1 crítico (`$unica` recibía `null`); A1 `isset($args['pta'])` siempre verdadero, que anulaba el título de boletines y ediciones en el editor; A2 `lapaz_tsf_id()` confundía IDs de términos, usuarios y entradas; M1 la descripción de términos y archivos se pisaba con la general del sitio; B1 `<style>` impreso dentro de un filtro; B2 canónica de archivos también en el panel de ajustes PTA.
- **Commit:** C1, A1, A2, M1 y B1 resueltos en `c3f7c11`.
- **Sin aplicar:** B2 (bajo; solo administradores, en *SEO → Ajustes → Archivos de tipos de contenido*; aceptable). Los rótulos del manual, punto 5, quedaron aplicados en el manual v3.

## 33. Manual con láminas emparejadas (redacción)
- Tarea de redacción: manual v3 con 13 parejas de láminas (pantalla de WordPress y componente del sitio con los mismos números), que pasa a [manual-editor](../../manual-editor.md).

## 34. Suite `admin.mjs` y zonas sin cobertura (AGY)
- **Veredicto:** `admin.mjs` prueba de verdad las pantallas de edición con sesión de Editor, sin falsos verdes de login ni de `wp_die`. Tres hallazgos medios y uno bajo en la propia suite; cinco de los seis de la 32 cerrados en disco.
- **Hallazgos (parte A):** `skip` silencioso en el cargador de cajas meta del editor de bloques y en la lectura de logs PHP (`admin.mjs:78-79` y `:85-92`); `wp_insert_user()` sin comprobar `WP_Error` (`:57`); bajo: no se exigen las cinco cajas de taxonomía del productor ni el menú del Editor.
- **Parte B:** C1, A1, A2, M1 y B1 resueltos; queda B2 (ver la 32).
- **Parte C (zonas sin cobertura):** guardado POST con validación SCF; WP Super Cache con `WP_CACHE=true`; subida JPEG → WebP de 1500 px; idempotencia de `lapaz-setup` y `lapaz-importar`; editor de bloques en Chrome con sesión; envío SMTP. Ver «Después del PR» en la lista única.
- **Commit:** la parte A (refuerzo de `admin.mjs`) está en `2eeeb72`: 20 comprobaciones, con el guardado HTTP de un boletín borrador como Editor.

## 35. Veredicto final antes del PR (AGY)
- **Veredicto:** lista para abrir el PR con squash merge. Sin bloqueantes: 42 commits, 188 archivos, +23 485 / −454 líneas contra `lapazsipasa/main`; sin IPs, paneles ni credenciales en el diff; `bin/check` (17 pasos) y las 18 suites (958 comprobaciones) en verde.
- **Debe ir en este PR:** el refuerzo de `admin.mjs` (en curso), la sincronización de la wiki (en esta entrega) y los rótulos del manual (hechos en el manual v3).
- **Puede ir después del PR:** la parte C de la 34 y los abiertos de la tabla de la lista única.
- **Commit:** ninguno nuevo; la sincronización de la wiki y el manual v3 están sin commit.

## 36. Control visual de las imágenes del manual (retoques)
- **Veredicto:** de las 31 imágenes del manual, 10 láminas servían tal cual, 2 con retoque y 1 a repetir. Las que lo necesitaban se retocaron.
- **Revisor:** TODO: verificar (no consta en la fuente).
- **Commit:** ninguno. Las imágenes y los documentos no viven en el repo.
- **Sin aplicar:** nada del bloque.

## 37. Manual final en su forma nueva (redacción)
- Tarea de redacción: texto final del manual del editor, con una lámina emparejada por formulario (pantalla de WordPress y componente del sitio, con los mismos números). Ver [manual-editor](../../manual-editor.md).
- **Commit:** `0a529d3` (láminas y wiki) y `7bb554f` (texto final).

## 38. Segunda pasada visual del manual
- **Veredicto:** todas las imágenes sirven. Sin erratas en el texto.
- **Revisor:** TODO: verificar (no consta en la fuente).
- **Commit:** ninguno.

## 39. Lectura completa del manual maquetado (en curso)
- **Estado:** en curso. Documento de 51 páginas: listo con 9 ajustes de orden, maquetación e imágenes, que se aplican en el documento y no en el repo.
- **Revisor:** un subagente revisor independiente, no AGY. AGY perdió su sesión (error de autenticación) al final del día, igual que se anotó la primera pasada de la 25.
- **Commit:** ninguno.

---

## 40 a 45. Revisiones del 2026-11-22 y 2026-11-23 (manual por tipo y arreglos)

La 40 (AGY, manual y sus herramientas) se aplicó en `dc49c39` y `98c8c05`. Las siguientes siguen el trabajo del manual general y los 10 manuales por tipo.

### 41. General final (subagente independiente)
- **Revisor:** subagente independiente, solo lectura; AGY no tenía panel.
- **Ángulo:** código de la rama, seguridad y privacidad de lo versionado, manual frente al código y sitio local.
- **Veredicto:** sin bloqueantes ni altos. Sitio local limpio (sin errores de PHP ni de consola, sin anclas rotas).
- **Hallazgos:** medios: videos y ferias ignoraban «Fuente del video» y «Origen» (ganaba la URL de YouTube oculta); el manual y la ayuda pedían logo en SVG, que WordPress no deja subir. Bajos: renombrar o borrar un término no reindexaba el catálogo; la ayuda del MP4 decía 50 MB y el tope es 32 MB; una línea mal escrita en las regiones del mapa a veces se mostraba; el manual pedía texto alternativo en Retratos cuando el sitio usa la Descripción; «Imagen del hero» también aparece en `/boletin/` y `/historias/`; comentario de `generar-laminas.mjs` contradictorio.
- **Commit:** `37b631e` (fuente de video, ayudas de SCF a PNG y 32 MB, reindexado por término, mapa). Los desajustes de texto del manual y el comentario de `generar-laminas.mjs` van en `604cbab`.

### 42. PDF de los manuales (AGY)
- **Ángulo:** lectura visual de las 219 páginas de los 11 PDF, contra el manual.
- **Verificado sin hallazgos:** privacidad de las láminas, correspondencia tabla, WordPress y sitio, índices y pies.
- **Hallazgos:** altos: portada rota en los 11 PDF; bloque de boletines colado en 9 manuales por tipo; remisiones a secciones inexistentes; SEO en 7 manuales sin caja SEO. Medios: resumen de una hoja en dos páginas y sin Productores, imágenes cortadas en mal punto, círculos tapando texto, contradicción MP4 y YouTube, secciones comunes sobrantes, páginas medio vacías, lista mensual incompleta. Bajos: recortes residuales y pies desactualizados.
- **Commit:** `604cbab` (generador y manual).
- **Descartado:** poner tilde a «vídeo». WordPress muestra «video», y el manual debe coincidir con lo que ve el editor.

### 43. Arreglos de la 41 (AGY, solo lectura, sin Docker)
- **Ángulo:** revisión estática de `37b631e`.
- **Veredicto:** M2 y B2 resueltos; M1, B1 y B3 resueltos con casos límite.
- **Hallazgos:** media: con MP4 elegido pero sin archivo resucitaba la URL de YouTube oculta; media: `wp_update_post()` en bucle al reindexar términos grandes; baja: `SUCRE:` sin número pintaba `00` y un nombre de solo espacios pasaba; baja: orden implícito en `shutdown` entre reindexado y vaciado de caché; baja: robustez de las pruebas nuevas.
- **Commit:** `c0c05a4` (video sin caer a YouTube, mapa que exige número, reindexado con prioridad 5 en `shutdown`, pruebas). Pruebas: `catalogo.mjs` limpia los términos `Zzdepto*` de corridas previas, `paisana-ferias.mjs` busca la primera feria con videos, `paisana-mapa.mjs` cubre `NOMBRE:` sin número y líneas sin nombre, y `actualidad.mjs` cubre MP4 elegido sin archivo; `fuenteElegida()` ya fijaba la fuente por filtro.
- **Descartado:** cambiar `wp_update_post()` por `$wpdb->update()`. El catálogo tiene 316 productores y saltarse los ganchos es peor que la lentitud de reindexar.

### 44. Verificación de los PDF tras la 42 (AGY)
- **Ángulo:** 196 páginas de los 11 PDF regenerados con `604cbab`.
- **Veredicto:** A1 a A4 y M1 a M7 resueltos; B3 y B4 parciales. Los 10 manuales por tipo se sostienen solos y no hay datos internos.
- **Hallazgos nuevos:** media: en `lamina-05` el círculo 5 queda huérfano al pie del primer corte. Bajas: tablas cortas partidas con una fila suelta; la captura de `lamina-19` aún muestra la ayuda vieja de SVG; «con Texto alternativo» sigue en la lista mensual de Retrato; franja y rozamientos de borde; un paso de lista separado de sus viñetas.
- **Commit:** ninguno. Ajustes finales de PDF en curso.
- **Descartado:** tilde de «vídeo» (ver 42).

### 47. Confirmación de los retoques de la 46 (AGY, 2026-11-23)
- **Veredicto:** los 4 retoques de `de250b8`, resueltos; sin altos ni medios.
- **Bajo, aplicado:** con `widows: 2`, un párrafo de 3 líneas tras una figura se partía 2 + 1 (retratos y ferias, p02–p03). Ahora `figure + p` no se parte.

### 46. PDF tras el pulido final (AGY, 2026-11-23)
- **Ángulo:** los 11 PDF de `c75b944` (194 páginas).
- **Veredicto:** sin hallazgos altos ni medios. Resueltos el roce de `lamina-05` y las tablas con una fila sola.
- **Bajos, aplicados:** contador «(N de 3)» partido en los pies, línea viuda en el manual de páginas, `/wp-admin` partido en p02 y roce del recuadro con los pies de foto en la lámina 11 (crónica y galería de la historia).

### 45. Verificación final de los PDF (AGY, 2026-11-23)
- **Ángulo:** lectura visual de los 11 PDF regenerados con `5cb941e`: 195 páginas (manual general 64 y 10 manuales por tipo 131).
- **Veredicto:** sin hallazgos de severidad alta ni media.
- **Resueltos de la 44:** B3, B4 y N1 a N4 (retrato en la lista mensual, paso de `lamina-04`, círculo huérfano de `lamina-05`, tablas cortas, ayuda de SVG de `lamina-19` y franja con paso de lista).
- **Hallazgos:** baja, cosmética: en `manual-subcuentas` (p07-p08) la tabla de problemas frecuentes arranca con una fila al pie. No requiere cambio.
- **Commit:** ninguno. `c75b944` (espaciado y estética de los PDF) llegó después de esta revisión; lo revisó la 46.

---

## Pendiente de decisión o de acceso al servidor

Solo lo puede hacer William, o el Fondo en su caso. Nada de esto se resuelve en el repo.

**Servidor (panel de Dokploy en `<PANEL_DOKPLOY>`, registro privado de operación):**
- Panel de administración solo por HTTPS, con el puerto de acceso directo cerrado al público (R7).
- Rotación de claves y de la clave de la API; limpiar variables duplicadas en *Environment* (R7, despliegue).
- Respaldos programados de la base de datos y de `wordpress_data`, con una restauración de prueba (R7).
- Límite de intentos de inicio de sesión en `wp-login.php` en Traefik; comprobar `maxRequestBodyBytes` ≥ 32 MB (R7, R15).
- Correo real para los certificados de Let's Encrypt; verificar SPF/DKIM/DMARC de Resend (R7, R13).
- Borrar el registro DNS del host `cms` antiguo y el dominio temporal de staging cuando `st` esté activo (ver [despliegue](../../despliegue-fse.md#staging-actual-creado-el-2026-11-08)).
- Revisar en la base de producción antes del deploy: `wp_template`/`wp_template_part` personalizados, `acf-field-group` en BD, menú editado o monitores externos sobre `/wp-json/` (R15).
- Historial público: las direcciones del servidor y del panel siguen visibles en el historial de `main` del repo público (documentos de despliegue y un script de migración anteriores a esta rama); retirarlas del árbol no las borra: cerrar el puerto del panel, ponerle HTTPS y rotar la clave (R7, R13).
- Alertas de seguridad (Wordfence, Patchstack o similar) para `secure-custom-fields`, `wp-super-cache` y `autodescription`, las tres fijadas en la imagen (R26).

**Decisiones de William:**
- Aprobación de push (aplastando el historial anterior a `ff6445d` antes de subir a un remoto público, R13/R17), PR y deploy.
- Segundo factor para la cuenta del editor externo o revocación de sus sesiones; entrega de la clave por otro canal (R7).
- `WP_ADMIN_USER` distinto de `admin` en producción y en CI (R7).
- Cerrar `wp-cron.php` con `DISABLE_WP_CRON` y un disparador externo (R7).
- Pasar CSP a modo activo tras confirmar cero violaciones en staging o producción con Plyr/YouTube (R7, R9). Dev salió limpio el 2026-11-23 (`cf74458`), incluido el video de YouTube.
- Fijar imágenes Docker por digest (hoy `mariadb:11.8` y `wordpress:7.1.3-php8.3-apache` por etiqueta) (R7, R9).
- Cambiar el propietario del código en el contenedor a `root:www-data` (R7).
- Integración de The SEO Framework (`autodescription` 5.2.1): visto bueno a `og:locale` `es_CO` (forzado en `inc/seo-tsf.php`) y a `og:title` sin sufijo (valor de fábrica, según [seo-plugin](seo-plugin.md)). La traducción `es_CO` ya va horneada en el `Dockerfile` (`2f13b6b`) (R16).
- `memory_limit` frente al tope de 512 MB: subir el contenedor o bajar el límite (R9).
- Confirmar que el menú principal lo cambia solo un administrador (R5).
- Decisiones D1 a D7 de la [revisión de SEO](revision-seo-enlaces.md#5-decisiones-para-william) (filtros y canónicas, listado de historias, datos estructurados, extractos, destinos de programas, política de privacidad y 404 de entradas).

**Del Fondo (enviados en [`nota-para-el-fondo.md`](nota-para-el-fondo.md)):**
- Video de Asocafé (`asocafe.mp4` o enlace definitivo en YouTube/Vimeo) (spec, R18).
- Nombre completo y correo electrónico de la persona externa para crear su usuario Editor (spec).
- Confirmar si el rótulo superior del boletín deja de decir «Boletín interno» (spec, R18).
- Autorización de las 12 personas con nombre natural en el catálogo (o retirar/ajustar datos) (R5).
- Corregir erratas de origen en el catálogo: municipio numérico en *Llaneridad Gourmet* (`17665`) y *Cafe Artesanal Tamara Aromas del Piedemonte SAS* (`17013`); nota interna «(Preguntar Si Es Alimento O Cosmetico)» en *Asociacion de Familias Unidas de Cascajo, el Carmen de Bolivar*; «Caf+E» en *Cafetos Frescos Como la Montaña*; nombres cortados a ~60 caracteres (R5, R18).
- Confirmar que los enlaces de redes sociales de los productores se mantengan ocultos hasta depurarlos (R5, nota al Fondo).
- Noticias reales para la sección «Lo que hacemos» de la portada (despliegue).
- Destino de los botones «Programa Colombia Sostenible» y «Programa Piloto de Inversiones Prioritarias» (hoy deshabilitados en gris) (navegación, R2).
- Confirmar si se conserva la nota «Registro con corte a septiembre de 2026» al final del catálogo o se omite por ser registro vivo (R18).

**Del equipo (antes de abrir el PR):**
- Hecho el 2026-11-21: correcciones de las revisiones 25 y 26 (`2f13b6b`, `1546852`) y corrida final de `bin/check` (17 pasos) y de las 18 suites sobre la imagen reconstruida (`seguridad` 68, `seo` 283, `navegacion` 181, `admin` 20; 965 comprobaciones en total, sobre `7bb554f`).
- Hecho: el fallo de las pantallas de edición (`c3f7c11`; ver la 32 y la 34).
- Hecho (`2eeeb72`): refuerzo de `apps/wp-fse/tests/e2e/admin.mjs` (parte A de la 34: los dos `skip` silenciosos, `conSeo` en el cargador de cajas, `WP_Error` en `wp_insert_user()` y el patrón de error fatal PHP).
- Hecho (`0a529d3`, `7bb554f`): láminas numeradas del manual (13 parejas, [`manual-editor.md`](../../manual-editor.md)).
- En curso: lectura completa del manual maquetado (revisión 39) y paso a documento de Google (R4, R13), que hace el dueño.

**Después del PR (revisión 34, parte C, y revisión 35):**
- Cobertura e2e: POST real con validación SCF (boletín, historia y productor); WP Super Cache con `WP_CACHE=true`; subida JPEG → WebP de 1500 px; idempotencia de `lapaz-setup` y `lapaz-importar`; editor de bloques en Chrome con sesión; prueba de `lapaz-smtp`.
- Abiertos en el código (tabla de la 35):
  - R5, duplicación menor de CSS en `catalogo-banner` (baja, sin urgencia).
  - R7, imágenes Docker fijadas por etiqueta y propietario del código `www-data` frente a `root:www-data` (media; decisiones de William).
  - R10, posible doble anuncio al enfocar `.conteo` (baja; comprobar con VoiceOver/NVDA en staging).
  - R17, `scrollbar-gutter: stable` en el lightbox (baja, cosmético).
  - R32 B2, canónica de archivos en el panel PTA de administradores (baja, aceptable).
  - R34, refuerzo de `admin.mjs` (media; antes del PR, hecho en `2eeeb72`).
  - R34, zonas sin cobertura (media; después del PR).
  - Cerrado en esta entrega: rótulos del manual (R32, punto 5), aplicados en el manual v3.

## Pendiente de probar en staging

El orden y los pasos para ejecutarlo todo en una sesión están en el [guion de pruebas de staging](plan-staging.md).

Lo que no se puede verificar en local con la imagen actual.

- **Política de contenido:** consola sin violaciones de `Content-Security-Policy-Report-Only` en `/`, `/proyectos-destacados/` (un video de Plyr de YouTube y un audio), `/productores/`, `/historias/` y `/boletin/`. En dev (2026-11-23, `cf74458`), 9 rutas en 360 y 1440 px dan 0 violaciones tras añadir `'wasm-unsafe-eval'` (router de la Interactivity API en el catálogo), incluido `/proyectos-destacados/` con un video de YouTube reproduciéndose en Plyr. Falta repetirlo en staging o producción antes de pasar a modo activo.
- **Cabeceras de Apache con la imagen reconstruida:** HSTS solo por HTTPS (`max-age=31536000`, ausente en HTTP interno); sin `X-Powered-By`; sin listado de directorios; 403 en `readme.html`, `license.txt`, `wp-config-sample.php`, `debug.log` y `xmlrpc.php`, y en `/wp-content/languages/plugins/autodescription-es_CO.{l10n.php,mo}` (R26).
- **Caché de página real (WP Super Cache):**
  - `/productores/` limpio, servido desde caché;
  - `/productores/?buscar=…` y `/productores/?x=1` fuera de caché;
  - publicar, editar o borrar un productor, un boletín o una historia vacía la caché;
  - `/sitemap.xml` no queda en caché de página.
- **API REST:** 401 sin sesión en `/wp-json/wp/v2/users` y en los tipos cerrados; el editor de bloques, el Editor del sitio y Salud del sitio funcionan sin aviso de REST.
- **Subidas grandes:** MP4 de unos 20 MB y JPEG grande, con `memory_limit = 128M` y `upload_max_filesize = 32M` detrás de Traefik (R9, R15).
- **HSTS y Traefik:** la cabecera llega solo cuando el visitante entra por HTTPS.
- **Migración de `lapaz-setup`:** `paissana` pasa a `productores` con el mismo ID; el menú migra solo si es el de fábrica; el caso de las dos páginas a la vez.
- **Seed por secciones:** `productores`, `boletines` e `historias`, en ese orden; 316 productores, una edición y una historia; correrlo dos veces no duplica.
- **Grupos SCF:** aparecen en *Historias PaisSana*, *Boletines* y *Productores* sin importación manual.
- **Permisos del Editor:** edita boletines, historias y productores; no instala plugins ni cambia ajustes. La caja de SEO le muestra solo General e imagen social; probar con un usuario Editor real, no de prueba. Enviando a mano `redirect`, `_genesis_noindex` o `_genesis_canonical_uri`, el Editor no los guarda (R26).
- **SEO en producción:** `robots` sin `noindex` con `WP_ENVIRONMENT_TYPE=production`; en staging, `WP_ENVIRONMENT_TYPE=staging` (sin esa variable, staging queda indexable).
- **Rutas:** `/productores/`, `/historias/` y `/boletin/` responden 200; `/paissana/` responde 404.
- **Sitemap:** `/sitemap.xml` (un solo `urlset`, con The SEO Framework); `/wp-sitemap.xml` debe dar 301 a esa ruta. Debe incluir `boletin` e `historia` y excluir `productor` y `guia-de-estilos` (R9, R15). Tras desplegar, reenviar `/sitemap.xml` en Search Console para reemplazar `/wp-sitemap.xml`.
- **Accesibilidad con lector de pantalla (VoiceOver / NVDA):** cierre del `<dialog>` con Escape y retorno de foco; que enfocar `.conteo` al agotar «Ver más» no duplique el anuncio; aviso «(abre en una pestaña nueva)» en el video de enlace externo (R10, R17).
- **CI:** las acciones fijadas por SHA corren; `navegacion.mjs` y `rest.mjs` entran en el flujo; las suites pasan en la primera ejecución real.
- **Rendimiento:** Lighthouse de `/productores/` con el hero compacto. TODO: confirmar que se mide.

### 40 · Manual maquetado final y herramientas del manual (2026-11-21)

- **Quién:** subagente revisor. AGY la terminó en su panel pero quedó esperando permiso para escribir el informe.
- **Veredicto:** listo con 4 cambios necesarios.
- **Hallazgos:** círculo ③ tapado en la lámina del productor; el generador de láminas no comprobaba que el sitio fuera el local; el usuario temporal y los borradores quedaban vivos si se interrumpía; el README no decía que hay que cargar antes el contenido de ejemplo. Opcionales: marcadores y título del PDF, altura de imagen, recorte de la lámina de Cifras, cuatro retoques de texto y código sin uso.
- **Resuelto:** todo, en el commit de este cierre. Manual en 43 páginas.
- **Sin aplicar:** propiedades del documento Word y guarda de líneas `>` en el maquetador (opcionales menores).
- **AGY (2026-11-21):** guardó después su propia revisión 40. Coincide con la del subagente en lo aplicado. Además señaló, y se resolvió en el commit de este cierre: el README no bastaba para regenerar en un clon limpio (faltaban las 5 capturas que no hace el script); variable de Chrome distinta en cada script (ahora `CHROME_BIN` para ambos); el maquetador ignoraba en silencio líneas de imagen mal formadas (ahora falla con aviso). Sin aplicar, opcional: cortes de las láminas 05 y 11.

