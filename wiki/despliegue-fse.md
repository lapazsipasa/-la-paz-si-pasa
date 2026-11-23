# Despliegue del sitio FSE en Dokploy

Guía para levantar el sitio de bloques (`apps/wp-fse/`) en el **servidor nuevo** (`<IP_PRODUCCION>`, proyecto «La Paz Si Pasa») como staging, y después pasarlo a producción. El headless sigue funcionando hasta el final ([decisión 7](decisions/wordpress-fse-arquitectura.md#7-el-headless-sigue-en-pie-hasta-el-final)).

## Servidores (2026-11-09)

Los datos reales (IP, paneles, nombres de aplicaciones) están en el registro privado de operación, no en este repo. Marcadores: `<IP_PRODUCCION>`, `<IP_RESPALDO>`, `<PANEL_DOKPLOY>`, `<PANEL_DOKPLOY_RESPALDO>`, `<APP_PRODUCCION>`, `<APP_STAGING>`, `<URL_STAGING_SSLIP>`.

| Servidor | Dokploy | Qué corre | DNS |
|---|---|---|---|
| Nuevo | `<PANEL_DOKPLOY>` | **Producción en vivo: sitio FSE** (desde 2026-11-09) y staging | `lapazsipasa.com`, `www` y `st` apuntan aquí |
| Actual (viejo) | `<PANEL_DOKPLOY_RESPALDO>` (`<IP_RESPALDO>`) | headless + Astro desde `kashipu/la-paz-si-pasa` `main`, ya sin tráfico. Respaldo hasta la limpieza final | ninguno |

- **MCP:** uno propio para este proyecto. La key vive en el llavero del equipo y no está en ningún archivo.
- **Seguridad del panel:** el estado y los pendientes del panel (TLS, puertos, rotación de claves) se llevan en el registro privado de operación.

## Producción (desde 2026-11-09)

| Dato | Valor |
|---|---|
| Servicio | compose `MonoRepo` del entorno `production` (`appName` `<APP_PRODUCCION>`). Es el mismo servicio que corría el headless: se le cambió la ruta, no se creó otro |
| Origen | `lapazsipasa/-la-paz-si-pasa`, rama `main` (tag `v2.0.0`), ruta `./apps/wp-fse/compose.yaml` |
| Dominios | `lapazsipasa.com` y `www.lapazsipasa.com` → servicio `cms`, puerto 80, Let's Encrypt. WordPress redirige `www` al dominio principal |
| Contenido | seed (`lapaz-setup --seed`): 15 retratos, 9 videos, 15 ferias, 23 subcuentas, 0 noticias |
| Caché | WP Super Cache activa (`WP_CACHE=true`) |

**Cómo se hizo (2026-11-09):**

1. En el `MonoRepo` se cambió la ruta del compose de `./compose.prod.yaml` a `./apps/wp-fse/compose.yaml`. Dokploy usa `-p <appName>`, así que los volúmenes (`db_data`, `wordpress_data`) son los mismos del headless. El `--remove-orphans` borró el `frontend` de Astro.
2. El dominio `lapazsipasa.com` se cambió de `frontend` a `cms` antes del deploy. Si no, Dokploy falla con *Domain is attached to service "frontend" which does not exist in the compose*.
3. La base del headless en este servidor estaba vacía: WordPress mostró el instalador. Se instaló desde la web y se corrió `lapaz-setup --seed` en el `cms`.
4. DNS de `lapazsipasa.com`, `www` y `st` → `<IP_PRODUCCION>`.
5. Certificado: Traefik había pedido el de Let's Encrypt cuando el DNS aún apuntaba al servidor viejo y se quedó con el *TRAEFIK DEFAULT CERT*. Se arregló con *Web Server → Traefik → Reload*. Un dominio nuevo en un compose (como `www`) solo se activa después de un **Redeploy**.

**Verificado (2026-11-09):** portada con los 5 bloques `lapaz`, `/proyectos-destacados/` 200, 404 propio, es-CO, canonical y Open Graph, sin `noindex`, `robots.txt` y sitemap 200, uploads 200, `xmlrpc.php` 403, `/wp-json/wp/v2/users` 404, página servida desde WP Super Cache.

**Errores que costaron tiempo:**
- Un espacio al inicio de la ruta del compose en Dokploy (`' ./apps/wp-fse/compose.yaml'`) da *Compose file not found*.
- *Environment* quedó con las variables del headless y las del FSE juntas; `WORDPRESS_URL` y `SMTP_PASS` repetidas con valores distintos. Gana la última línea. Borrar el bloque viejo (`PUBLIC_SITE_URL`, `REVALIDATE_SECRET`, el primer `WORDPRESS_URL` y el primer `SMTP_PASS`).

**Pendiente:**
- `www.lapazsipasa.com`: Redeploy para que Traefik lo cargue y emita su certificado.
- Correo de ACME en Dokploy: poner uno real.
- `cms.lapazsipasa.com` sigue en el DNS: borrarlo.
- Limpiar las variables duplicadas, respaldo programado de la base (*Backups*) y de `wordpress_data`.
- Staging a `st.lapazsipasa.com` (ver abajo).

## Staging actual (creado el 2026-11-08)

| Dato | Valor |
|---|---|
| Servidor | nuevo (`<IP_PRODUCCION>`), proyecto La Paz Si Pasa, **entorno `staging`** (separado del `production`, donde sigue el headless) |
| Servicio | compose `FSE` (`appName` `<APP_STAGING>`), rama `feat/wordpress-fse`, `apps/wp-fse/compose.yaml`, despliegue automático apagado |
| URL | `<URL_STAGING_SSLIP>` (Let's Encrypt; HTTP redirige a HTTPS) |
| Variables | contraseñas de la base generadas y guardadas en Dokploy (nunca se mostraron), `WP_ENVIRONMENT_TYPE=staging` (noindex), SMTP de Resend **sin `SMTP_PASS`** (lo pone William) |
| Dominio final | `st.lapazsipasa.com` (DNS ya apunta aquí). **Pendiente:** agregar el dominio al servicio `cms`, `WORDPRESS_URL=https://st.lapazsipasa.com`, deploy, `wp search-replace <url sslip> https://st.lapazsipasa.com --all-tables-with-prefix --skip-columns=guid` y borrar el dominio sslip |

**Contenido (ya no aplica: el headless de este servidor pasó a ser producción FSE):** como el headless corre en el mismo servidor, se copia de contenedor a contenedor con `apps/wp-fse/bin/migrar-desde-headless.sh`. Se corre por SSH en el servidor. El headless solo se lee.

```bash
curl -fsSL https://raw.githubusercontent.com/lapazsipasa/-la-paz-si-pasa/feat/wordpress-fse/apps/wp-fse/bin/migrar-desde-headless.sh -o migrar.sh
bash migrar.sh <APP_PRODUCCION> <APP_STAGING>
```

Al importar la base, los usuarios del headless pasan tal cual: se entra a `/wp-admin` con las mismas credenciales del CMS actual. `lapaz-setup` corre al final de la importación, así que no hace falta correrlo antes.

## Entorno dev (creado el 2026-11-22)

- **Para qué:** ver la rama en curso (`feat/boletin-catalogo-fcp`) separada de producción y de staging, con su propia base de datos.
- **Dokploy:** proyecto «La Paz Si Pasa», entorno `dev`, compose «FSE dev» (`apps/wp-fse/compose.yaml`, rama `feat/boletin-catalogo-fcp`, sin despliegue automático: se despliega a mano).
- **Variables:** las de `.env.example` con claves propias; `WORDPRESS_URL=https://dev.lapazsipasa.com`, `WP_ENVIRONMENT_TYPE=staging` (todo el sitio con `noindex`), `WP_CACHE=true`. Claves fuera del repo.
- **Contenido:** instalación nueva con `lapaz-setup --seed` (contenido de ejemplo: 316 productores, Edición 02, Asocafé). No lleva la base de producción.
- **Dominio:** `dev.lapazsipasa.com` resuelve y responde por HTTPS con Let's Encrypt (comprobado el 2026-11-23). Antes faltaba el registro DNS `dev` (tipo A, con la misma IP que `lapazsipasa.com`). TODO: verificar si la dirección provisional de Dokploy sigue activa.
- **Actualizar:** desplegar «FSE dev» en Dokploy tras subir commits a la rama.

## 1. Servicio en Dokploy

| Campo | Valor |
|---|---|
| Tipo | Docker Compose, en el proyecto La Paz Si Pasa |
| Origen | Git: `https://github.com/lapazsipasa/-la-paz-si-pasa.git`, rama `feat/wordpress-fse` (más adelante, `main`) |
| Ruta del compose | `apps/wp-fse/compose.yaml`. **Sin** el override, que es solo local |
| Dominio | servicio `cms`, puerto **80**, HTTPS con Let's Encrypt. Staging: dominio generado o `staging.lapazsipasa.com` |

**Variables** (en *Environment*, nunca en el repo):

| Variable | Staging | Producción |
|---|---|---|
| `WORDPRESS_URL` | `https://<dominio de staging>` | `https://lapazsipasa.com` |
| `WORDPRESS_DB_PASSWORD`, `WORDPRESS_DB_ROOT_PASSWORD` | generadas, distintas a las del headless | generadas |
| `WP_ENVIRONMENT_TYPE` | `staging` (noindex, se pueden instalar plugins) | `production` (indexable, `DISALLOW_FILE_MODS`) |
| `WP_ADMIN_USER`, `WP_ADMIN_EMAIL` | un usuario que **no** sea `admin` | ídem |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | los de Resend (los mismos del headless) | ídem |
| `WP_CACHE` | `true` (caché de página; después del deploy, correr `lapaz-setup`) | `true` |

## 2. Primer arranque

Desde la terminal del contenedor `cms` en Dokploy:

```bash
su www-data -s /bin/bash -c 'lapaz-setup --seed'   # instala, configura, carga el seed; muestra la contraseña una vez
```

Con esto el sitio queda completo, con el contenido del seed (sin noticias reales).

En producción (`WP_ENVIRONMENT_TYPE=production` o sin definir), si WordPress ya está instalado —por ejemplo, tras pasar por el instalador web—, `lapaz-setup --seed` se rechaza antes de modificar nada para no pisar contenido editado. Si de verdad se requiere cargar todo el seed sobre una instalación existente: `lapaz-setup --seed --forzar-seed`.

## 3. Contenido real de producción

El headless de producción y el sitio FSE tienen **el mismo modelo de contenido** (mismos CPT y campos SCF). El contenido se pasa con base de datos + uploads:

1. **En el servidor actual,** exportar la base y los uploads del headless:
   ```bash
   docker exec <db del headless> sh -c 'mariadb-dump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction "$MARIADB_DATABASE"' > headless.sql
   docker exec <cms del headless> sh -c 'cd /var/www/html/wp-content/uploads && tar -czf - .' > uploads.tar.gz
   ```
2. **Copiar** los dos archivos al servidor nuevo y dentro del contenedor `cms` del FSE (`docker cp … <cms>:/tmp/`, `chown www-data`).
3. **Importar:**
   ```bash
   su www-data -s /bin/bash -c 'lapaz-importar /tmp/headless.sql /tmp/uploads.tar.gz'
   ```
   El comando:
   - guarda un respaldo de la base actual en `/tmp`;
   - importa la base;
   - reemplaza la URL de origen (leída **de la base**, no de `WP_HOME`) por `WORDPRESS_URL`, sin tocar `guid`;
   - extrae los uploads;
   - corre `lapaz-setup` (tema, SCF, portada, menú, limpieza) y vacía la caché.
4. **Verificar:** los conteos de cada CPT coinciden con el headless y no quedan URLs viejas.

**Probado en local** (2026-11-08), con el headless local como origen: se importaron 15 retratos, 9 videos, 15 ferias, 15 audios y 4 noticias, con 112 MB de uploads. Las 4 noticias son datos de prueba de la base local del headless, no contenido real; las de producción se verán al importar desde el servidor actual. Quedaron 0 URLs viejas en posts y postmeta, y las imágenes y audios responden 200.

## 4. Cambio a producción (plan original; lo que se hizo está en «Producción»)

1. Respaldo de la base del headless (en el servidor actual: confirmar que el respaldo diario está activo antes de seguir).
2. Importar el contenido más reciente (paso 3) con `WORDPRESS_URL=https://lapazsipasa.com` y `WP_ENVIRONMENT_TYPE=production`.
3. Mover el DNS de `lapazsipasa.com` y `www` al servidor nuevo, con el dominio en el servicio `cms`.
4. `cms.lapazsipasa.com`: 301 al dominio principal, o se da de baja.
5. El headless sigue en el servidor actual como respaldo hasta la limpieza final.

## Despliegue de boletín y catálogo PaisSana

Estado: **desplegado en producción el 2026-11-23** (PR #2, squash `a0c3802` en `main`). Boletín e historia publicados; el catálogo está oculto hasta que el Fondo lo autorice ([publicarlo](#publicar-el-catálogo-cuando-el-fondo-autorice)). Lo que sigue como TODO no se ha comprobado. Contexto: [spec](specs/boletin-catalogo-fcp.md#flujo-de-ramas-y-github).

Orden: primero staging (`st.lapazsipasa.com`, TODO: confirmar que está arriba), después producción. El 2026-11-23 se ensayó la secuencia en staging con una copia de la base de producción y luego se hizo en producción. Todos los comandos se corren en la terminal del servicio `cms` en Dokploy como `www-data` (`su www-data -s /bin/bash -c '…'`).

Pendientes de decisión, servidor y staging: [revisiones independientes](specs/boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor). Rutas nuevas: catálogo en `/productores/`, historias en `/historias/<slug>/` (con archivo en `/historias/`); `/paissana/` no existe ([decisión del 2026-11-20](navegacion.md#ajuste-del-2026-11-20-url-propias-para-productores-e-historias)).

### Antes del despliegue (sobre el `cms` actual)

1. **Respaldo obligatorio de la base de datos** (permisos `600`) y copia fuera del servidor:
   ```bash
   su www-data -s /bin/bash -c '( umask 077; wp --path=/var/www/html db export /tmp/pre-deploy-boletin-catalogo.sql --quiet )'
   ```
   Confirmar que el archivo tiene tamaño > 0 y descargarlo del servidor antes de seguir. En Dokploy, disparar también un *Backup* manual de `db_data` y un *Volume backup* de `wordpress_data`.
2. **Revisar plantillas personalizadas en la base** (si existen, tapan las plantillas nuevas del tema):
   ```bash
   su www-data -s /bin/bash -c 'wp --path=/var/www/html post list --post_type=wp_template,wp_template_part --post_status=any --fields=ID,post_type,post_name'
   ```
3. **Revisar grupos SCF en la base** (confirmar que no haya conflictos con `group_boletin`, `group_historia`, `group_productor` o `group_articulo`):
   ```bash
   su www-data -s /bin/bash -c 'wp --path=/var/www/html post list --post_type=acf-field-group --fields=ID,post_name,post_status'
   ```
4. **Anotar conteos previos** para verificar después que nada existente se perdió:
   ```bash
   su www-data -s /bin/bash -c 'for t in retrato video feria audio_relato subcuenta noticia; do echo "$t: $(wp --path=/var/www/html post list --post_type=$t --post_status=publish --format=count)"; done'
   ```

### Durante el despliegue

5. **Merge y deploy.** Squash a `main` con `apps/wp-fse/bin/check` en verde y aprobación de William (no hacer `git push` de la rama sin aplastar el historial anterior a `ff6445d`). Dokploy despliega `main`. Hacer **Redeploy** confirmando rebuild de la imagen `cms` (trae Apache `zz-lapaz-seguridad.conf`, límites de PHP y MariaDB `11.8`). Confirmado el 2026-11-23: Redeploy reconstruye la imagen. Esperar contenedor `healthy`.
6. **Configuración (sin `--seed`):**
   ```bash
   su www-data -s /bin/bash -c 'lapaz-setup'
   ```
   Qué hace `apps/wp-fse/docker/lapaz-setup`:
   - si se pasa `--seed` en producción sobre un sitio ya instalado, lo rechaza antes de cambiar nada (salvo `--forzar-seed`), y rechaza las opciones desconocidas;
   - activa The SEO Framework (`autodescription` 5.2.1) de forma tolerante (si falla, avisa y el tema usa el SEO de respaldo en `inc/seo.php`); una sola vez (`lapaz_seo_configurado`) aplica los ajustes iniciales y migra el extracto de las páginas a `_genesis_description`;
   - crea la página `productores` («Productores PaisSana»); si existe `paissana`, la renombra conservando su ID y la deja publicada; si existen ambas, avisa y no borra ninguna;
   - migra el menú Principal solo si sigue siendo el de fábrica; si el editor lo cambió, imprime aviso y no lo toca (ajustarlo luego en *Editor del sitio → Navegación*: Lo que hacemos, Actualidad, Proyectos destacados como enlace de página, Boletín);
   - aplica las reglas de enlaces (`rewrite structure --hard`);
   - con `WP_CACHE=true`, excluye de la caché `/productores/` con parámetros (`^/productores/.*\?`) y los sitemaps (`^/(wp-)?sitemap`), vacía los transitorios del sitemap del plugin y vacía la caché de página al terminar (`wp_cache_clear_cache()`);
   - avisa por `stderr` si existen plantillas personalizadas del tema `lapaz` (`wp_template`/`wp_template_part`) en la base que tapen los archivos del tema.
7. **Grupos SCF.** `lapaz-setup` no los importa a la base: SCF los lee desde `scf-json-lapaz/` (`apps/wp-fse/mu-plugins/lapaz-core.php`). Comprobar en `/wp-admin/` que *Boletines*, *Historias PaisSana* y *Productores* muestran sus campos. Solo si no aparecieran (el 2026-11-23 aparecieron sin importar, así que no hizo falta):
   ```bash
   su www-data -s /bin/bash -c 'wp --path=/var/www/html eval "foreach (glob(WP_CONTENT_DIR . \"/scf-json-lapaz/group_*.json\") as \$f) { acf_import_field_group(json_decode(file_get_contents(\$f), true)); }"'
   ```
8. **Carga inicial por secciones.** Solo estas tres, en este orden (cada una es idempotente por título; no usar `lapaz-setup --seed` en producción). El 2026-11-23 se corrieron `boletines` e `historias`; `productores` se omite hasta que el Fondo autorice el catálogo:
   ```bash
   su www-data -s /bin/bash -c 'SEED_SOLO=productores wp --path=/var/www/html eval-file /opt/seed/seed.php'
   su www-data -s /bin/bash -c 'SEED_SOLO=boletines wp --path=/var/www/html eval-file /opt/seed/seed.php'
   su www-data -s /bin/bash -c 'SEED_SOLO=historias wp --path=/var/www/html eval-file /opt/seed/seed.php'
   ```
9. **Vaciar caché de página tras los seeds** (por si se corrieron después de `lapaz-setup`):
   ```bash
   su www-data -s /bin/bash -c 'wp --path=/var/www/html eval "if (function_exists(\"wp_cache_clear_cache\")) { wp_cache_clear_cache(); echo \"Caché vaciada\n\"; }"'
   ```
   Al publicar, editar o borrar entradas, menú o términos del catálogo, `lapaz-core.php` la vacía una vez por petición (`shutdown`).
10. **Usuario Editor.** Un usuario por persona externa, rol Editor, nunca administrador (nombre y correo pendientes del Fondo; no van en el repo):
    ```bash
    su www-data -s /bin/bash -c 'wp --path=/var/www/html user create <usuario> <correo> --role=editor'
    ```
    La clave se muestra una sola vez (TODO: confirmar en staging): entregarla por otro canal.

### Después del despliegue (navegador sin sesión + consola DevTools)

11. **Verificar conteos** (esperado: `productor: 316` cuando se cargue el catálogo, `boletin: 1`, `historia: 1`, y los conteos del paso 4 sin cambios). Resultado del 2026-11-23: `productor: 0`, el resto como se esperaba:
    ```bash
    su www-data -s /bin/bash -c 'for t in productor boletin historia retrato video feria audio_relato subcuenta noticia; do echo "$t: $(wp --path=/var/www/html post list --post_type=$t --post_status=publish --format=count)"; done'
    ```
12. **Rutas:** HTTP 200 en `/`, `/proyectos-destacados/`, `/productores/`, `/historias/`, `/historias/asocafe/`, `/boletin/` y `/boletin/edicion-02/`; HTTP 404 en `/paissana/` y `/guia-de-estilos/`. Comprobado el 2026-11-23 en producción: todo igual, salvo `/productores/`, que da 404 mientras la página esté en borrador.
13. **API y archivos sensibles:** HTTP 401 sin sesión en `/wp-json/wp/v2/users` y `/wp-json/wp/v2/productor`; HTTP 403 en `/xmlrpc.php`, `/readme.html`, `/wp-content/debug.log` y sin listado en `/wp-content/uploads/`. Comprobado el 2026-11-23 en producción.
14. **Cabeceras y consola:** sin `X-Powered-By`; `Strict-Transport-Security` solo en HTTPS; `Content-Security-Policy-Report-Only` en frontend y ausente en `/wp-login.php`; consola sin violaciones CSP en `/`, `/proyectos-destacados/` (reproduciendo video de YouTube y audio) y `/productores/`. En dev salió limpio el 2026-11-23 (desplegado con `cf74458`, en 360 y 1440 px), con el video de YouTube de Plyr reproduciéndose. Comprobado en producción el 2026-11-23: 0 violaciones en 7 rutas a 360 y 1440 px, con Plyr reproduciendo YouTube. Pasar a modo activo sigue siendo decisión de William.
15. **Visual y navegación:** `/` y `/proyectos-destacados/` muestran tarjetas de boletín, historia y banner del catálogo; el menú Principal incluye «Boletín» y marca estado activo.
16. **Caché:** `/productores/` limpio servido desde caché; `/productores/?buscar=cafe` y `/sitemap.xml` sin cachear; editar un productor de prueba vacía la caché.
17. **SEO y sitemap (The SEO Framework):**
    - plugin `autodescription` activo y caja **Ajustes de SEO** en español (`es_CO`) al editar una página, boletín o historia;
    - en `/` y rutas nuevas: exactamente **una** `<title>`, **una** `description`, **una** `canonical`, **una** `robots` (**sin `noindex`** en producción) y `og:locale` = `es_CO`;
    - `/sitemap.xml` responde `200` con páginas, boletines e historias (sin `productor` ni `guia-de-estilos`); `/wp-sitemap.xml` responde `301` → `/sitemap.xml`. Comprobado el 2026-11-23: 4 URL (portada, proyectos destacados, historia y boletín), `robots` indexable y canónica correcta;
    - **Google Search Console:** reenviar `/sitemap.xml` para reemplazar `/wp-sitemap.xml`.
18. **Editor y Salud del sitio:** entrar con el usuario Editor (edita boletines, historias, productores y solo *General* + imagen social en **Ajustes de SEO**; no instala plugins ni cambia ajustes ni menú) y revisar *Salud del sitio* (TODO: confirmar en staging si aparece aviso de REST; TODO: confirmar que el Editor no ve el menú *SEO*).
19. **Limpieza:** tras 24–48 h estables, borrar `/tmp/pre-deploy-boletin-catalogo.sql` del contenedor (conservar la copia externa).

### Plan de marcha atrás

Volviendo solo a la imagen anterior (`v2.0.0`; TODO: confirmar que es la etiqueta que corre hoy en producción) **no se deshacen** en la base la página `productores`, el menú actualizado, los 316 productores, `Edición 02`, `Asocafé`, los 22 adjuntos ni el usuario Editor (el menú con `/boletin/` daría 404). Además, `db` sube de MariaDB `11` a `11.8` y no admite downgrade binario de `db_data`.

- **Volver atrás de inmediato** si `/` o `/proyectos-destacados/` dan 500/404, `/wp-admin/` no carga o no guarda, se pierde contenido real o Apache/PHP falla al arrancar.
- **Arreglar hacia delante** si falla solo una página nueva, falta ajustar un menú editado a mano, aparece una violación en `CSP-Report-Only` (no bloquea) o falta vaciar caché.

Pasos para marcha atrás completa (código + base de datos):
1. En Dokploy, apuntar el servicio al tag/commit anterior (`v2.0.0`) y hacer **Redeploy** (dejando `db` en `11.8`).
2. Restaurar el respaldo previo:
   ```bash
   su www-data -s /bin/bash -c 'wp --path=/var/www/html db import /tmp/pre-deploy-boletin-catalogo.sql'
   ```
3. Vaciar caché y reescrituras:
   ```bash
   su www-data -s /bin/bash -c 'wp --path=/var/www/html cache flush && wp --path=/var/www/html rewrite flush --hard && wp --path=/var/www/html eval "if (function_exists(\"wp_cache_clear_cache\")) wp_cache_clear_cache();"'
   ```
4. Tras verificar el sitio, borrar `/tmp/pre-deploy-boletin-catalogo.sql` del contenedor.

### Publicar el catálogo cuando el Fondo autorice

Estado al 2026-11-23: la página `productores` está en **borrador** (`/productores/` da 404 y no sale en el sitemap), no hay productores cargados y el botón PAISSANA de Proyectos destacados apunta a `#`. Hacerlo solo con la autorización del Fondo (personas con nombre propio y erratas, ver [pendientes del Fondo](specs/boletin-catalogo-fcp/revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor)). Como `www-data` en la terminal de `cms`:

1. **Respaldo** de la base, como el paso 1 de «Antes del despliegue», con copia fuera del servidor.
2. **Cargar los productores** (idempotente por título):
   ```bash
   su www-data -s /bin/bash -c 'SEED_SOLO=productores wp --path=/var/www/html eval-file /opt/seed/seed.php'
   ```
3. **Corregir o retirar** las fichas observadas por el Fondo, desde el admin. Si se retira una ficha, no volver a correr el seed sin revisar antes (TODO: verificar que no la recrea).
4. **Publicar** la página `productores`:
   ```bash
   su www-data -s /bin/bash -c 'wp --path=/var/www/html post list --post_type=page --post_status=draft --fields=ID,post_name'
   su www-data -s /bin/bash -c 'wp --path=/var/www/html post update <id> --post_status=publish'
   ```
5. **Vaciar la caché de página** (paso 9 de arriba).
6. **Verificar:** `/productores/` responde 200 con los productores cargados; el botón PAISSANA de Proyectos destacados lleva a `/productores/`; el banner del catálogo aparece en Inicio y en Proyectos destacados; la historia muestra «Volver al catálogo»; `/sitemap.xml` incluye `/productores/` (sin las fichas, según el paso 17); y el conteo de `productor` coincide con lo cargado.

## Operación

| Tarea | Comando o lugar |
|---|---|
| Respaldo de la base | *Backups* del compose en Dokploy (servicio `db`, MariaDB) o `wp db export` dentro de `cms` |
| Respaldo de uploads | *Volume backups* de Dokploy sobre `wordpress_data` |
| Actualizar tema o plugins | push a la rama del servicio y deploy: todo va horneado en la imagen |
| Logs | Dokploy → servicio → Logs (`cms`). Los errores de SMTP salen con el prefijo `[lapaz-smtp]` |
| Actualizar The SEO Framework (`autodescription`) | En producción (`DISALLOW_FILE_MODS`) no se actualiza desde el panel: subir `TSF_VERSION` y `TSF_SHA256` en `apps/wp-fse/Dockerfile`, actualizar los dos archivos `es_CO` en `apps/wp-fse/docker/languages/plugins/` (ver su `LEEME.md`), reconstruir y desplegar |
| Si The SEO Framework se desactiva | El sitio no se rompe: `inc/seo.php` e `inc/guia-estilos.php` retoman automáticamente título, descripción, Open Graph, canónicas, `noindex` fuera de producción y `/wp-sitemap.xml` (solo se pierde la caja editable por entrada) |
