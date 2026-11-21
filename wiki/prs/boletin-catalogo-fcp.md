# Boletín *Caminos de Transformación*, catálogo PaisSana e historia del mes

Rama `feat/boletin-catalogo-fcp` → `main` (39 commits) · [Spec](wiki/specs/boletin-catalogo-fcp.md) · [Decisiones](wiki/decisions/boletin-catalogo-fcp.md) · [Revisiones independientes](wiki/specs/boletin-catalogo-fcp/revisiones-independientes.md)

## Problema

El Fondo Colombia en Paz entregó dos piezas como HTML estático con tipografías y colores ajenos al sitio (Fredoka/Mulish de Google Fonts): la edición 02 del boletín *Caminos de Transformación* y el catálogo PaisSana con 316 productores y la historia de Asocafé. Ambas secciones deben publicarse en La Paz Sí Pasa manteniendo el sistema visual del tema `lapaz` y pudiendo ser alimentadas cada mes desde WordPress por una persona no técnica, sin tocar código ni dañar el diseño.

## Solución

- **Modelo de contenido (`apps/wp-fse/scf-json/`):** tres tipos nuevos exclusivos del sitio FSE (`boletin`, `productor` con 5 taxonomías nativas, `historia`), formularios en lenguaje llano y carga inicial idempotente en `apps/wordpress/seed/` (316 productores, edición 02 e historia de Asocafé) ([contrato](wiki/specs/boletin-catalogo-fcp/contrato.md)).
- **Boletín (`/boletin/` y `/boletin/<slug>/`):** bloque `lapaz/boletin` con contenido flexible en 4 moldes (Artículo, Cifras, Tarjetas, Agenda). Al crear una edición nacen las 8 secciones estándar listas; índice, numeración, barra de secciones y «Otras ediciones» se generan solos ([boletín](wiki/specs/boletin-catalogo-fcp/boletin-estructura.md)).
- **Catálogo de productores (`/productores/`):** bloques `lapaz/catalogo-portada` y `lapaz/catalogo`, con búsqueda y filtros en servidor (`WP_Query` + índice generado en `apps/wp-fse/mu-plugins/lapaz-catalogo.php`), navegación sin recargar con la Interactivity API sin build y funcionamiento completo sin JavaScript ([catálogo](wiki/specs/boletin-catalogo-fcp/paissana-catalogo.md)).
- **Historia del mes (`/historias/` y `/historias/<slug>/`):** bloques `lapaz/historia` (portada, ficha, video YouTube/MP4/enlace, crónica, galería con `<dialog>` nativo y «Otras historias») y `lapaz/historia-destacada`. `/paissana/` se retira (404; nunca estuvo en producción).
- **Navegación, accesos y guía de estilos:** menú Principal con 4 ítems y estado activo por sección (`inc/navegacion.php`), botones de programas sin publicar en gris deshabilitados, hero compacto en interiores (`is-style-compacto`), accesos desde Inicio y Proyectos destacados (`lapaz/boletin-destacado`, `lapaz/catalogo-banner`, `lapaz/historia-destacada`), tokens en `theme.json` con hojas compartidas `editorial.css` y `lectura.css` y guía de estilos viva solo en local (`lapaz/guia-estilos`) ([navegación](wiki/navegacion.md), [guía de estilos](wiki/guia-de-estilos.md)).
- **Seguridad y endurecimiento:** API REST cerrada sin sesión (`401`) y tipos del catálogo fuera de REST también con sesión (`lapaz-seguridad.php`), contraseñas de aplicación desactivadas, error de login genérico, oEmbed sin autor, `zz-lapaz-seguridad.conf` (sin listado de directorios, `readme.html`/`debug.log`/`xmlrpc.php` en 403, HSTS bajo HTTPS, `CSP-Report-Only`), límites PHP (`128M` en contenedor de `512M`), `no-new-privileges`, `mariadb:11.8`, acciones de CI fijadas por SHA y limpieza de datos internos en la wiki.
- **Accesibilidad AA y rendimiento:** contraste ≥ 5,98:1 en indicador de menú activo y pista de barras, `<dialog>` modal nativo, gestión de foco al agotar «Ver más», `_prime_post_caches` en la galería, `sizes` ajustados y vaciado de caché de WP Super Cache al guardar contenido (`lapaz-core.php`).
- **SEO editable (The SEO Framework 5.2.1, `autodescription`):** el editor cambia título, descripción e imagen para compartir de cada página, boletín e historia, con caja reducida para el Editor; `noindex` en las búsquedas del catálogo; sitemap en `/sitemap.xml`; el SEO del tema queda como respaldo sin el plugin (`inc/seo-tsf.php`, [seo-plugin](wiki/specs/boletin-catalogo-fcp/seo-plugin.md)).

## Qué NO incluye
- Video final de Asocafé (pendiente del Fondo; usa enlace externo o sin fuente).
- Páginas de *Programa Colombia Sostenible* y *Programa Piloto de Inversiones Prioritarias* (botones en gris «próximamente»).
- Suscripción, envío por correo, descarga PDF del boletín o páginas individuales por productor.
- Configuración del servidor Dokploy/Traefik (HTTPS del panel, rate limiting en `wp-login.php`, respaldos diarios).

## Validación

- **Verificado en local con la imagen reconstruida:** `seguridad.mjs` 64 de 64, `seo.mjs` 280 y `navegacion.mjs` 181, en verde.
- **Pendiente de la corrida final:** `catalogo`, `boletin`, `historia`, `rest` y `lo-que-hacemos`, y `apps/wp-fse/bin/check` completo.
- **Revisiones independientes:** 23 de solo lectura (1 a 10, 12, 13, 15 a 19, 21 a 23 y 25 a 27) y 4 tareas de redacción terminadas (11, 14, 20 y 24; la 28 está en curso), registradas en [revisiones-independientes.md](wiki/specs/boletin-catalogo-fcp/revisiones-independientes.md). La 25 la repitió AGY el 2026-11-21.
- **Pendiente antes de producción:** probar en staging con la imagen reconstruida (`CSP-Report-Only` en consola con Plyr YouTube, HSTS, WP Super Cache real en `/productores/` y vaciado al publicar, Site Health con REST cerrado, subidas de ~20 MB, SEO con un Editor real y `robots` sin `noindex` en producción); verificación con lector de pantalla (VoiceOver/NVDA) y Lighthouse de `/productores/`.

## Riesgos

- **Cierre de API REST sin sesión:** puede mostrar aviso en *Salud del sitio* del admin; validar en staging junto con el Editor del sitio y The SEO Framework.
- **Cambia la URL del sitemap:** `/wp-sitemap.xml` pasa a `/sitemap.xml` (301). Hay que reenviarla en Search Console tras desplegar.
- **SEO con dependencia de un plugin de terceros:** The SEO Framework solo se actualiza reconstruyendo la imagen: subir `TSF_VERSION` y `TSF_SHA256` en `apps/wp-fse/Dockerfile` y los dos archivos de idioma `autodescription-es_CO` en `apps/wp-fse/docker/languages/plugins/`.
- **CSP:** entra en modo solo informe (`Content-Security-Policy-Report-Only`); no pasar a modo activo sin confirmar consola limpia en `/proyectos-destacados/` (videos YouTube de Plyr).
- **Historial de la rama:** commits anteriores a `ff6445d` contenían datos de operación ya redactados en `wiki/`; usar **squash merge** a `main` y no publicar commits intermedios de la rama en repos públicos.

## Después del merge

Seguir [wiki/despliegue-fse.md](wiki/despliegue-fse.md#despliegue-de-boletín-y-catálogo-paissana) primero en staging y luego en producción:
1. Respaldar la base de datos antes del despliegue.
2. Desplegar `main` en Dokploy reconstruyendo la imagen de `cms`.
3. Ejecutar `lapaz-setup` (sin `--seed`) dentro de `cms` para crear/migrar `/productores/`, reglas de caché y enlaces.
4. Cargar el seed selectivo (`SEED_SOLO=productores`, `boletines`, `historias`, en ese orden; **nunca** `--seed` completo en producción).
5. Crear el usuario con rol **Editor** y entregar la clave por canal separado.
6. Verificar HTTP 200/404, cabeceras, consola CSP, caché y permisos del Editor.

## Pendientes del dueño y del Fondo

- **Dueño / servidor:** panel Dokploy con HTTPS y puerto directo cerrado, rotación de claves, respaldos diarios, rate limiting en Traefik, 2FA del Editor y decisiones D1–D7 de SEO ([lista completa](wiki/specs/boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor)).
- **Fondo Colombia en Paz:** video de Asocafé, nombre y correo de la persona editora, confirmar si el boletín deja de llamarse «interno», autorización de productores registrados como personas naturales, corrección del municipio numérico de «Llaneridad Gourmet» y noticias reales de portada.
