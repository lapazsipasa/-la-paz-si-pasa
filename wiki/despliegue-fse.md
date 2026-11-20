# Despliegue del sitio FSE en Dokploy

Guía para levantar el sitio de bloques (`apps/wp-fse/`) en el **servidor nuevo** (`<IP_SERVIDOR>`, proyecto «La Paz Si Pasa») como staging, y después pasarlo a producción. El headless sigue funcionando hasta el final ([decisión 7](decisions/wordpress-fse-arquitectura.md#7-el-headless-sigue-en-pie-hasta-el-final)).

## Servidores (2026-11-09)

| Servidor | Dokploy | Qué corre | DNS |
|---|---|---|---|
| Nuevo | `http://<IP_SERVIDOR>:3000` (v0.31.0) | **Producción en vivo: sitio FSE** (desde 2026-11-09) y staging | `lapazsipasa.com`, `www` y `st` apuntan aquí |
| Actual (viejo) | `<PANEL_DOKPLOY_VIEJO>` (<IP_SERVIDOR>) | headless + Astro desde `kashipu/la-paz-si-pasa` `main`, ya sin tráfico. Respaldo hasta la limpieza final | ninguno |

- **MCP:** `dokploy-lapaz` (solo para este proyecto). La key se lee del Llavero de macOS (`security … -s dokploy-lapaz`) y no está en ningún archivo.
- **Pendiente de seguridad:** el panel nuevo va por HTTP en el puerto 3000. Hay que ponerle un dominio con HTTPS, cerrar el 3000 y rotar la key.

## Producción (desde 2026-11-09)

| Dato | Valor |
|---|---|
| Servicio | compose `MonoRepo` del entorno `production` (`appName` `<APP_DOKPLOY>`). Es el mismo servicio que corría el headless: se le cambió la ruta, no se creó otro |
| Origen | `lapazsipasa/-la-paz-si-pasa`, rama `main` (tag `v2.0.0`), ruta `./apps/wp-fse/compose.yaml` |
| Dominios | `lapazsipasa.com` y `www.lapazsipasa.com` → servicio `cms`, puerto 80, Let's Encrypt. WordPress redirige `www` al dominio principal |
| Contenido | seed (`lapaz-setup --seed`): 15 retratos, 9 videos, 15 ferias, 23 subcuentas, 0 noticias |
| Caché | WP Super Cache activa (`WP_CACHE=true`) |

**Cómo se hizo (2026-11-09):**

1. En el `MonoRepo` se cambió la ruta del compose de `./compose.prod.yaml` a `./apps/wp-fse/compose.yaml`. Dokploy usa `-p <appName>`, así que los volúmenes (`db_data`, `wordpress_data`) son los mismos del headless. El `--remove-orphans` borró el `frontend` de Astro.
2. El dominio `lapazsipasa.com` se cambió de `frontend` a `cms` antes del deploy. Si no, Dokploy falla con *Domain is attached to service "frontend" which does not exist in the compose*.
3. La base del headless en este servidor estaba vacía: WordPress mostró el instalador. Se instaló desde la web y se corrió `lapaz-setup --seed` en el `cms`.
4. DNS de `lapazsipasa.com`, `www` y `st` → `<IP_SERVIDOR>`.
5. Certificado: Traefik había pedido el de Let's Encrypt cuando el DNS aún apuntaba al servidor viejo y se quedó con el *TRAEFIK DEFAULT CERT*. Se arregló con *Web Server → Traefik → Reload*. Un dominio nuevo en un compose (como `www`) solo se activa después de un **Redeploy**.

**Verificado (2026-11-09):** portada con los 5 bloques `lapaz`, `/proyectos-destacados/` 200, 404 propio, es-CO, canonical y Open Graph, sin `noindex`, `robots.txt` y sitemap 200, uploads 200, `xmlrpc.php` 403, `/wp-json/wp/v2/users` 404, página servida desde WP Super Cache.

**Errores que costaron tiempo:**
- Un espacio al inicio de la ruta del compose en Dokploy (`' ./apps/wp-fse/compose.yaml'`) da *Compose file not found*.
- *Environment* quedó con las variables del headless y las del FSE juntas; `WORDPRESS_URL` y `SMTP_PASS` repetidas con valores distintos. Gana la última línea. Borrar el bloque viejo (`PUBLIC_SITE_URL`, `REVALIDATE_SECRET`, el primer `WORDPRESS_URL` y el primer `SMTP_PASS`).

**Pendiente:**
- `www.lapazsipasa.com`: Redeploy para que Traefik lo cargue y emita su certificado.
- Correo de ACME en Dokploy es `<CORREO_ACME>`: poner uno real.
- `cms.lapazsipasa.com` sigue en el DNS (<IP_SERVIDOR>, <IP_SERVIDOR>): borrarlo.
- Limpiar las variables duplicadas, respaldo programado de la base (*Backups*) y de `wordpress_data`.
- Staging a `st.lapazsipasa.com` (ver abajo).

## Staging actual (creado el 2026-11-08)

| Dato | Valor |
|---|---|
| Servidor | nuevo (`<IP_SERVIDOR>`), proyecto La Paz Si Pasa, **entorno `staging`** (separado del `production`, donde sigue el headless) |
| Servicio | compose `FSE` (`appName` `<APP_DOKPLOY>`), rama `feat/wordpress-fse`, `apps/wp-fse/compose.yaml`, despliegue automático apagado |
| URL | <URL_STAGING> (Let's Encrypt; HTTP redirige a HTTPS) |
| Variables | contraseñas de la base generadas y guardadas en Dokploy (nunca se mostraron), `WP_ENVIRONMENT_TYPE=staging` (noindex), SMTP de Resend **sin `SMTP_PASS`** (lo pone William) |
| Dominio final | `st.lapazsipasa.com` (DNS ya apunta aquí). **Pendiente:** agregar el dominio al servicio `cms`, `WORDPRESS_URL=https://st.lapazsipasa.com`, deploy, `wp search-replace <url sslip> https://st.lapazsipasa.com --all-tables-with-prefix --skip-columns=guid` y borrar el dominio sslip |

**Contenido (ya no aplica: el headless de este servidor pasó a ser producción FSE):** como el headless corre en el mismo servidor, se copia de contenedor a contenedor con `apps/wp-fse/bin/migrar-desde-headless.sh`. Se corre por SSH en el servidor. El headless solo se lee.

```bash
curl -fsSL https://raw.githubusercontent.com/lapazsipasa/-la-paz-si-pasa/feat/wordpress-fse/apps/wp-fse/bin/migrar-desde-headless.sh -o migrar.sh
bash migrar.sh <APP_DOKPLOY> <APP_DOKPLOY>
```

Al importar la base, los usuarios del headless pasan tal cual: se entra a `/wp-admin` con las mismas credenciales del CMS actual. `lapaz-setup` corre al final de la importación, así que no hace falta correrlo antes.

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

1. Respaldo de la base del headless (en el servidor actual, el respaldo diario a R2 **está desactivado**: hay que activarlo antes).
2. Importar el contenido más reciente (paso 3) con `WORDPRESS_URL=https://lapazsipasa.com` y `WP_ENVIRONMENT_TYPE=production`.
3. Mover el DNS de `lapazsipasa.com` y `www` al servidor nuevo, con el dominio en el servicio `cms`.
4. `cms.lapazsipasa.com`: 301 al dominio principal, o se da de baja.
5. El headless sigue en el servidor actual como respaldo hasta la limpieza final.

## Despliegue de boletín y catálogo PaisSana

Estado: **sin probar en un servidor**. Está en la rama `feat/boletin-catalogo-fcp`, sin PR ni merge. Cada paso marcado «TODO: confirmar en staging» hay que comprobarlo antes de producción. Contexto: [spec](specs/boletin-catalogo-fcp.md#flujo-de-ramas-y-github).

Orden: primero staging (`st.lapazsipasa.com`, TODO: confirmar que está arriba), después producción. Todos los comandos se corren en la terminal del servicio `cms` en Dokploy, como en [Primer arranque](#2-primer-arranque).

1. **Merge y deploy.** Squash a `main` con `apps/wp-fse/bin/check` en verde y aprobación de William. Dokploy despliega `main`. Después, **Redeploy** del servicio.
2. **Configuración.** Sin `--seed`:
   ```bash
   su www-data -s /bin/bash -c 'lapaz-setup'
   ```
   Qué hace (según `apps/wp-fse/docker/lapaz-setup`):
   - crea la página `/paissana/` si no existe;
   - migra el menú Principal, pero solo si sigue siendo el de fábrica. Si el editor lo cambió, imprime «Aviso: el menú Principal fue editado». En ese caso, ajustarlo en *Editor del sitio → Navegación* con el orden: Lo que hacemos, Actualidad, Proyectos destacados (enlace de página), Boletín;
   - aplica las reglas de enlaces (`rewrite structure --hard`);
   - con `WP_CACHE=true`, excluye `?buscar=` de la caché de página.
3. **Grupos SCF.** `lapaz-setup` no importa los grupos nuevos. SCF los lee de `scf-json-lapaz/` (`apps/wp-fse/mu-plugins/lapaz-core.php`). Comprobar en *Historias PaisSana*, *Boletines* y *Productores* que aparecen sus campos. Si no aparecen, importarlos con el mismo bucle de `.github/workflows/wp-fse.yml` (líneas 55 a 61). TODO: confirmar en staging si hace falta.
4. **Carga inicial por secciones.** Solo estas tres, en este orden. Cada una es idempotente (busca por título y actualiza):
   ```bash
   su www-data -s /bin/bash -c 'SEED_SOLO=productores wp --path=/var/www/html eval-file /opt/seed/seed.php'
   su www-data -s /bin/bash -c 'SEED_SOLO=boletines wp --path=/var/www/html eval-file /opt/seed/seed.php'
   su www-data -s /bin/bash -c 'SEED_SOLO=historias wp --path=/var/www/html eval-file /opt/seed/seed.php'
   ```
   **No usar `lapaz-setup --seed` en producción.** Corre todas las secciones y actualiza por título las entradas de portada, videos y ferias, así que pisa lo que el editor haya cambiado.
   Resultado esperado: 316 productores, una edición (`Edición 02`) y una historia (`Asocafé`). El seed no toca la portada ni las ferias.
5. **Caché.** `lapaz-setup` deja la caché activa, y WP Super Cache se vacía sola al guardar contenido (comentario en `lapaz-setup`). Si una página sigue vieja: TODO: confirmar en staging cómo vaciarla a mano (`wp super-cache flush`).
6. **Usuario Editor.** Un usuario por persona externa, con rol Editor, no administrador. Usar un nombre de usuario y un correo propios; no van en esta wiki:
   ```bash
   su www-data -s /bin/bash -c 'wp --path=/var/www/html user create <usuario> <correo> --role=editor'
   ```
   La clave la genera WP-CLI y la muestra una vez: entregarla por otro canal, nunca en git ni en la wiki. TODO: confirmar en staging que la muestra así. Datos de la persona: pendientes del Fondo.
7. **Comprobación posterior** (en producción, con navegador sin sesión):
   - HTTP 200: `/`, `/proyectos-destacados/`, `/boletin/`, `/boletin/edicion-02/`, `/paissana/` y `/paissana/historias/asocafe/` (TODO: confirmar el slug de la historia).
   - `/paissana/?buscar=cafe` devuelve resultados y no queda en caché (`cache_rejected_uri`, en `lapaz-setup`).
   - En `/` y `/proyectos-destacados/` aparecen las tarjetas de boletín, historia y banner del catálogo.
   - El menú Principal tiene «Boletín» y el enlace lleva a `/boletin/`.
   - `/guia-de-estilos/` da 404 en producción (la página solo se crea con `WP_ENVIRONMENT_TYPE=local`).
   - `/wp-sitemap.xml` incluye `boletin` e `historia`, y no `productor`. TODO: confirmar en staging.
   - Entrar con el usuario Editor: puede editar boletines, historias y productores, y no puede instalar plugins ni cambiar ajustes. TODO: confirmar en staging.

## Operación

| Tarea | Comando o lugar |
|---|---|
| Respaldo de la base | *Backups* del compose en Dokploy (servicio `db`, MariaDB) o `wp db export` dentro de `cms` |
| Respaldo de uploads | *Volume backups* de Dokploy sobre `wordpress_data` |
| Actualizar tema o plugins | push a la rama del servicio y deploy: todo va horneado en la imagen |
| Logs | Dokploy → servicio → Logs (`cms`). Los errores de SMTP salen con el prefijo `[lapaz-smtp]` |
