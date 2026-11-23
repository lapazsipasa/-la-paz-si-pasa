# Boletín *Caminos de Transformación*, catálogo PaisSana e historia del mes

**Estado (2026-11-23): fusionado.** PR #2 con squash en `main` como `a0c3802`, desplegado en producción. El catálogo queda oculto hasta que el Fondo lo autorice.

Rama `feat/boletin-catalogo-fcp` → `main` (45 commits) · [Spec](wiki/specs/boletin-catalogo-fcp.md) · [Decisiones](wiki/decisions/boletin-catalogo-fcp.md) · [Revisiones independientes](wiki/specs/boletin-catalogo-fcp/revisiones-independientes.md)

## Problema

El Fondo Colombia en Paz entregó dos piezas como HTML estático con tipografías y colores ajenos al sitio (Fredoka/Mulish de Google Fonts): la edición 02 del boletín *Caminos de Transformación* y el catálogo PaisSana con 316 productores y la historia de Asocafé. Ambas secciones deben publicarse en La Paz Sí Pasa manteniendo el sistema visual del tema `lapaz` y pudiendo ser alimentadas cada mes desde WordPress por una persona no técnica, sin tocar código ni dañar el diseño.

## Solución

- **Modelo de contenido (`apps/wp-fse/scf-json/`):** tres tipos nuevos exclusivos del sitio FSE (`boletin`, `productor` con 5 taxonomías nativas, `historia`), formularios en lenguaje llano y carga inicial idempotente en `apps/wordpress/seed/` (316 productores, edición 02 e historia de Asocafé) ([contrato](wiki/specs/boletin-catalogo-fcp/contrato.md)).
- **Boletín (`/boletin/` y `/boletin/<slug>/`):** bloque `lapaz/boletin` con contenido flexible en 4 moldes (Artículo, Cifras, Tarjetas, Agenda). Al crear una edición nacen las 8 secciones estándar listas; índice, numeración, barra de secciones y «Otras ediciones» se generan solos ([boletín](wiki/specs/boletin-catalogo-fcp/boletin-estructura.md)).
- **Catálogo de productores (`/productores/`):** bloques `lapaz/catalogo-portada` y `lapaz/catalogo`, con búsqueda y filtros en servidor (`WP_Query` + índice en `apps/wp-fse/mu-plugins/lapaz-catalogo.php`), navegación sin recargar con la Interactivity API sin build y funcionamiento completo sin JavaScript ([catálogo](wiki/specs/boletin-catalogo-fcp/paissana-catalogo.md)).
- **Historia del mes (`/historias/` y `/historias/<slug>/`):** bloques `lapaz/historia` (portada, ficha, video YouTube/MP4/enlace, crónica, galería con `<dialog>` nativo y «Otras historias») y `lapaz/historia-destacada`. `/paissana/` se retira (404; nunca estuvo en producción).
- **SEO editable (The SEO Framework 5.2.1, `autodescription`):** incluido con suma SHA-256 y traducción `es_CO` en `apps/wp-fse/Dockerfile`. El editor cambia título, descripción e imagen para compartir de cada página, boletín e historia desde una caja reducida (sin visibilidad ni campos sociales sueltos, bloqueado también al guardar en `inc/seo-tsf-editor.php`); el tema aporta valores por defecto, canónicas de archivos y `noindex` en búsquedas del catálogo y fuera de producción (`inc/seo-tsf.php`), sitemap en `/sitemap.xml` con 301 desde `/wp-sitemap*.xml` y respaldo propio sin el plugin (`inc/seo.php`, [seo-plugin](wiki/specs/boletin-catalogo-fcp/seo-plugin.md)).
- **Manual del editor (`wiki/manual-editor.md`):** cada formulario con una lámina emparejada (pantalla de WordPress y componente del sitio, mismos números); el documento se entrega aparte, fuera del repo.
- **Navegación, accesos y guía de estilos:** menú Principal con 4 ítems y estado activo por sección (`inc/navegacion.php`), programas sin publicar deshabilitados en gris, hero compacto en interiores, accesos desde Inicio y Proyectos destacados (`lapaz/boletin-destacado`, `lapaz/catalogo-banner`, `lapaz/historia-destacada`), tokens en `theme.json` con `editorial.css` y `lectura.css`, y guía de estilos viva solo en local (`lapaz/guia-estilos`) ([navegación](wiki/navegacion.md), [guía de estilos](wiki/guia-de-estilos.md)).
- **Seguridad, accesibilidad AA y rendimiento:** API REST cerrada sin sesión (401) y tipos del catálogo fuera de REST también con sesión (`lapaz-seguridad.php`), sin contraseñas de aplicación, login genérico, `zz-lapaz-seguridad.conf` (403 en archivos sensibles y carpeta de idiomas, HSTS bajo HTTPS, `CSP-Report-Only`), `memory_limit = 128M`, `no-new-privileges`, `mariadb:11.8`, acciones de CI fijadas por SHA, contraste ≥ 5,98:1, `<dialog>` nativo, `_prime_post_caches` en la galería y vaciado automático de WP Super Cache al guardar contenido (`lapaz-core.php`).

## Qué NO incluye

- Video final de Asocafé (pendiente del Fondo; usa enlace externo o sin fuente).
- Páginas de *Programa Colombia Sostenible* y *Programa Piloto de Inversiones Prioritarias* (botones deshabilitados).
- Suscripción, envío por correo, descarga PDF del boletín o páginas individuales por productor.
- Configuración del servidor Dokploy/Traefik (HTTPS del panel, límite de intentos en `wp-login.php`, respaldos diarios).

## Validación

- **Calidad determinista (`apps/wp-fse/bin/check`):** 17 pasos en verde (PHPCS, PHPStan, ESLint, Stylelint, validación de plantillas, `block.json`, límites de líneas y tokens).
- **18 suites e2e en verde (965 comprobaciones, salida 0 sobre la imagen reconstruida y `7bb554f`):** `navbar` (9), `retratos` (43), `layout` (49), `lo-que-hacemos` (24), `actualidad` (27), `paisana-hero` (8), `paisana-mapa` (24), `paisana-audios` (14), `paisana-productores` (10), `paisana-ferias` (24), `boletin` (56), `catalogo` (60), `historia` (43), `navegacion` (181), `seo` (283), `seguridad` (68), `rest` (22) y `admin` (20).
- **Revisiones independientes:** 29 revisiones (1–10, 12–13, 15–19, 21–23, 25–27, 29, 32, 34–36 y 38) y 9 tareas de redacción (11, 14, 20, 24, 28, 30, 31, 33 y 37); la 39 (lectura del manual) sigue en curso. Todas, registradas en [revisiones-independientes.md](wiki/specs/boletin-catalogo-fcp/revisiones-independientes.md).
- **Fallo real detectado y cerrado antes del PR:** al abrir pantallas de edición con sesión de Editor para capturar el manual, PHP lanzó `TypeError` en `lapaz_tsf_imagen()` porque The SEO Framework 5.2.1 pasa `null` en el tercer parámetro (`$single`) desde la pestaña Social, cortando los formularios SCF y dejando en blanco el editor de bloques. Las 17 suites previas no lo vieron porque ninguna abría `post.php` autenticado. Se corrigió la firma y dos fallos de contexto en `inc/seo-tsf.php` (`c3f7c11`) y se añadió `apps/wp-fse/tests/e2e/admin.mjs` al CI (20 comprobaciones en verde tras el refuerzo de `2eeeb72`).
- **Qué NO se ha probado aún de forma automática:** guardado HTTP (POST) con validación SCF, WP Super Cache real con `WP_CACHE=true`, subida de medios JPEG → WebP/1500 px, `lapaz-importar` e idempotencia de `lapaz-setup` en segunda corrida, editor de bloques en Chrome con sesión, envío SMTP, lector de pantalla (VoiceOver/NVDA) y Lighthouse de `/productores/`.

## Riesgos

- **Cierre de API REST sin sesión:** puede mostrar aviso en *Salud del sitio*; validar en staging junto con el Editor del sitio y The SEO Framework.
- **Cambio de sitemap:** `/wp-sitemap.xml` redirige (301) a `/sitemap.xml`; reenviar `/sitemap.xml` en Search Console tras desplegar.
- **Plugin fijado en la imagen:** actualizar The SEO Framework exige subir `TSF_VERSION`/`TSF_SHA256` en `Dockerfile` y la traducción `es_CO` en `apps/wp-fse/docker/languages/plugins/`.
- **CSP:** entra en `Content-Security-Policy-Report-Only`. En dev (2026-11-23, `cf74458`) la consola sale sin violaciones en 9 rutas, incluido `/proyectos-destacados/` con Plyr/YouTube. Pasar a modo activo sigue siendo decisión de William; conviene confirmarlo en staging o producción antes.
- **Historial de la rama:** commits anteriores a `ff6445d` contenían datos de operación ya retirados del árbol; hacer **squash merge** a `main` (el squash no borra datos que ya existían en commits previos de `main`: cerrar puerto del panel, activar HTTPS y rotar claves).

## Después del merge

**Hecho el 2026-11-23** ([despliegue](../despliegue-fse.md#despliegue-de-boletín-y-catálogo-paissana)): pasos 1 a 4, salvo `productores` (espera al Fondo). Paso 5 (usuario Editor): TODO: verificar. Paso 6: hecho, salvo `/productores/` y el reenvío del sitemap en Search Console.

Ejecutar primero en staging siguiendo el [guion de pruebas de staging](wiki/specs/boletin-catalogo-fcp/plan-staging.md) y luego en producción según [wiki/despliegue-fse.md](wiki/despliegue-fse.md#despliegue-de-boletín-y-catálogo-paissana):
1. Respaldar la base de datos antes del despliegue.
2. Desplegar `main` en Dokploy reconstruyendo la imagen de `cms`.
3. Ejecutar `lapaz-setup` (sin `--seed`) dentro de `cms`.
4. Cargar el seed selectivo (`SEED_SOLO=productores`, `boletines`, `historias`, en ese orden; nunca `--seed` completo en producción).
5. Crear el usuario **Editor** y entregar la clave por otro canal.
6. Verificar rutas, cabeceras, consola CSP, caché de página, permisos del Editor y envío de `/sitemap.xml` en Search Console.

## Pendientes

- **Dueño / servidor:** panel Dokploy solo por HTTPS y puerto directo cerrado, rotación de claves, respaldos diarios, rate limiting en Traefik, 2FA del Editor y decisiones D1–D7 de SEO ([lista completa](wiki/specs/boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor)).
- **Fondo Colombia en Paz:** video de Asocafé, datos de la persona editora, confirmar rótulo «Boletín interno», autorización de los 12 registros de personas naturales, erratas de origen en productores (municipios numéricos) y noticias reales de portada ([nota](wiki/specs/boletin-catalogo-fcp/nota-para-el-fondo.md)).
