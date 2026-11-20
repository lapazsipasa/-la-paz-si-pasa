# Revisiones independientes del boletín y el catálogo

**Estado (2026-11-20):** nueve revisiones con informe y la décima en curso (acotada al commit `239dcc9`). Todas de solo lectura, hechas por AGY sobre la rama `feat/boletin-catalogo-fcp`. Los informes completos no están en el repo. Esta página deja constancia de cada una: veredicto, hallazgos relevantes, commit que los resolvió y lo que quedó sin aplicar.

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
- **Bloqueantes:** `inc/guia-estilos.php` con 301 líneas (tope de 300 de `bin/check`); suites e2e sin commit mientras CI ya las ejecutaba.
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
  - el manual del editor (índice propuesto de ocho puntos) y el usuario Editor: pendientes. Hay un borrador sin commit en [`manual-editor.md`](../../manual-editor.md), sin capturas;
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
  - menores de los enlaces del índice del boletín y de la jerarquía de `.titulo-art`: TODO: confirmar que `239dcc9` los cubre;
  - los requisitos de accesibilidad para el manual del editor: pendientes con el manual.
- **Revisión 10 (en curso):** verifica `239dcc9` contra esta sexta revisión. Sin informe todavía.

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

- **Veredicto:** la base está al ~75 %, pero no se puede dejar en verde. Cuatro bloqueos: `lib.mjs` no cierra Chrome al recibir señales (quedan procesos huérfanos); hay aserciones que pasan en falso o en vacío (`navegacion.mjs`, `boletin.mjs`); `navegacion.mjs` escribe a mano las rutas de `/paissana/` y no prueba `/historias/`; CI no ejecuta `navegacion.mjs` ni `rest.mjs`.
- **Commit:** ninguno. Estado en el árbol de trabajo: `apps/wp-fse/tests/e2e/` con 12 archivos modificados y 2 nuevos (`navegacion.mjs`, `rest.mjs`), sin commit.
- **Plan de cierre (T1 a T6), sin hacer:**
  - T1: arnés estable (`lib.mjs`, `paisana-lib.mjs`, `fcp-lib.mjs`), constantes de ruta;
  - T2: `navegacion.mjs`;
  - T3: `boletin.mjs` e `historia.mjs`;
  - T4: `catalogo.mjs`;
  - T5: `rest.mjs` sin Chrome y `seguridad.mjs` ampliado;
  - T6: CI y bases visuales.
- **Sin resultado:** `bin/check` y `seo.mjs` sin resultado registrado. TODO: confirmar.

## 9. URL nuevas y endurecimiento

- **Veredicto:** los tres commits son sólidos. No quedan rutas `/paissana/` ni IP o paneles en el repo. Sin bloqueantes.
- **Importantes:**
  - CSP en modo activo rompería el reproductor de YouTube de Plyr en `/proyectos-destacados/`. Pendiente: no activar sin probar en staging.
  - `memory_limit = 256M` dentro de un contenedor de 512 MB con `mod_php` puede llevar a OOM con dos subidas a la vez. Pendiente de decisión.
  - `/historias/` sin historias pintaba `<main>` vacío sin `<h1>`. Resuelto: el estado vacío ya tiene `<h1>` (`blocks/historia/render.php`).
- **Menores:**
  - `lapaz_url_catalogo_base()` no comprobaba que la página estuviera publicada. El código actual sí lo comprueba (`inc/accesos.php`).
  - Paginación habilitada en el archivo de historias: sin aplicar. TODO: confirmar si conviene.
  - `lapaz-setup` con las páginas `paissana` y `productores` a la vez: sin aplicar.
- **Site Health:** el aviso «La API REST encontró un error (401)» puede aparecer. Sin aplicar; probar en staging.
- **Commits revisados:** `1e799ea`, `3b2941d`, `ff6445d`.

---

## Pendiente de decisión o de acceso al servidor

Solo lo puede hacer William, o el Fondo en su caso. Nada de esto se resuelve en el repo.

**Servidor (panel de Dokploy en `<PANEL_DOKPLOY>`, registro privado de operación):**
- Panel de administración solo por HTTPS, con el puerto de acceso directo cerrado al público.
- Rotación de claves y de la clave de la API; limpiar las variables duplicadas.
- Respaldos programados de la base de datos y de `wordpress_data`, con una restauración de prueba.
- Límite de intentos de inicio de sesión en `wp-login.php` (Traefik). Decidir el valor.
- Correo real para los certificados de Let's Encrypt.
- Borrar `cms.lapazsipasa.com` del DNS y el dominio temporal de staging, cuando `st` esté activo (ver [despliegue](../../despliegue-fse.md#staging-actual-creado-el-2026-11-08)).

**Decisiones de William:**
- Segundo factor para la cuenta del editor externo, o revocar sus sesiones. Y la clave del Editor entregada por otro canal.
- Nombre del administrador: `WP_ADMIN_USER` distinto de `admin`, en producción y en el CI.
- Cerrar `wp-cron.php`: requiere `DISABLE_WP_CRON` y un disparador externo.
- CSP en modo activo: después de la prueba en staging y de resolver Plyr.
- `memory_limit` frente al tope de 512 MB: subir el contenedor o bajar el límite.
- Fijar imágenes por digest (hoy `mariadb:11` por etiqueta).
- Cambiar el propietario del código en el contenedor: aprobar el cambio y su reconstrucción.
- Plugin de SEO: aprobar la instalación y sus requisitos previos.
- Permisos del Editor: confirmar que el menú lo cambia solo un administrador.
- Decisiones de la [revisión de SEO](revision-seo-enlaces.md#5-decisiones-para-william) D1 a D7 (filtros y canónicas, listado de historias, datos estructurados, extractos, destinos de los programas, política de privacidad y 404 de entradas).

**Del Fondo:**
- Autorización de las 12 personas con nombre en el seed, o retirar sus datos.
- Corregir el registro «Llaneridad Gourmet».
- Video `asocafe.mp4`, o enlace de YouTube o Vimeo.
- Datos de la persona externa para su usuario.
- Si el boletín deja de llamarse «interno» al publicarse.

**Del equipo:**
- Manual del editor: revisar el borrador, sacar las capturas y pasarlo a Google Doc.
- Aprobación de push, PR y deploy.

## Pendiente de probar en staging

Lo que no se puede verificar en local con la imagen actual.

- **Política de contenido:** consola sin violaciones de `Content-Security-Policy-Report-Only` en `/`, `/proyectos-destacados/` (un video de Plyr de YouTube y un audio), `/productores/`, `/historias/` y `/boletin/`.
- **Cabeceras de Apache con la imagen reconstruida:** HSTS solo por HTTPS (`max-age=31536000`, ausente en HTTP interno); sin `X-Powered-By`; sin listado de directorios; 403 en `readme.html`, `license.txt`, `wp-config-sample.php`, `debug.log` y `xmlrpc.php`.
- **Caché de página real (WP Super Cache):**
  - `/productores/` limpio, servido desde caché;
  - `/productores/?buscar=…` y `/productores/?x=1` fuera de caché;
  - publicar, editar o borrar un productor, un boletín o una historia vacía la caché.
- **API REST:** 401 sin sesión en `/wp-json/wp/v2/users` y en los tipos cerrados; el editor de bloques, el Editor del sitio y Salud del sitio funcionan sin aviso de REST.
- **Subidas grandes:** MP4 de unos 20 MB y JPEG grande, con el `memory_limit` actual.
- **HSTS y Traefik:** la cabecera llega solo cuando el visitante entra por HTTPS.
- **Migración de `lapaz-setup`:** `paissana` pasa a `productores` con el mismo ID; el menú migra solo si es el de fábrica; el caso de las dos páginas a la vez.
- **Seed por secciones:** `productores`, `boletines` e `historias`, en ese orden; 316 productores, una edición y una historia; correrlo dos veces no duplica.
- **Grupos SCF:** aparecen en *Historias PaisSana*, *Boletines* y *Productores* sin importación manual.
- **Permisos del Editor:** edita boletines, historias y productores; no instala plugins ni cambia ajustes.
- **Rutas:** `/productores/`, `/historias/` y `/boletin/` responden 200; `/paissana/` responde 404.
- **CI:** las acciones fijadas por SHA corren; `navegacion.mjs` y `rest.mjs` entran en el flujo; las suites pasan en la primera ejecución real.
- **Rendimiento:** Lighthouse de `/productores/` con el hero compacto. TODO: confirmar que se mide.
