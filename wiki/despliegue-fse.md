# Despliegue del sitio FSE en Dokploy

Guía para levantar el sitio de bloques (`apps/wp-fse/`) en el **servidor nuevo** (`2.25.237.45`, proyecto «La Paz Si Pasa») como staging, y después pasarlo a producción. El headless sigue funcionando hasta el final ([decisión 7](decisions/wordpress-fse-arquitectura.md#7-el-headless-sigue-en-pie-hasta-el-final)).

## Servidores (2026-11-08)

| Servidor | Dokploy | Qué corre | DNS |
|---|---|---|---|
| Actual | `dokploy.graficodev.cloud` (72.61.11.19) | **Producción en vivo:** headless + Astro, desde `kashipu/la-paz-si-pasa` `main`, con despliegue automático en cada push | `lapazsipasa.com`, `www` y `cms` apuntan aquí |
| Nuevo | `http://2.25.237.45:3000` (v0.31.0) | Copia del headless desde `lapazsipasa/-la-paz-si-pasa`, `idle` | todavía no apunta aquí |

- **MCP:** `dokploy-lapaz` (solo para este proyecto). La key se lee del Llavero de macOS (`security … -s dokploy-lapaz`) y no está en ningún archivo.
- **Pendiente de seguridad:** el panel nuevo va por HTTP en el puerto 3000. Hay que ponerle un dominio con HTTPS, cerrar el 3000 y rotar la key.

## Staging actual (creado el 2026-11-08)

| Dato | Valor |
|---|---|
| Servidor | nuevo (`2.25.237.45`), proyecto La Paz Si Pasa, **entorno `staging`** (separado del `production`, donde sigue el headless) |
| Servicio | compose `FSE` (`appName` `compose-compress-back-end-array-fuf9qm`), rama `feat/wordpress-fse`, `apps/wp-fse/compose.yaml`, despliegue automático apagado |
| URL | https://compose-compress-back-end-array-fuf9qm-34fdbb-2-25-237-45.sslip.io (Let's Encrypt; HTTP redirige a HTTPS) |
| Variables | contraseñas de la base generadas y guardadas en Dokploy (nunca se mostraron), `WP_ENVIRONMENT_TYPE=staging` (noindex), SMTP de Resend **sin `SMTP_PASS`** (lo pone William) |
| Headless en el mismo servidor | compose `MonoRepo` (`appName` `compose-transmit-virtual-protocol-6qurgn`), corriendo: cms, db y frontend |

**Contenido:** como el headless corre en el mismo servidor, se copia de contenedor a contenedor con `apps/wp-fse/bin/migrar-desde-headless.sh`. Se corre por SSH en el servidor. El headless solo se lee.

```bash
curl -fsSL https://raw.githubusercontent.com/lapazsipasa/-la-paz-si-pasa/feat/wordpress-fse/apps/wp-fse/bin/migrar-desde-headless.sh -o migrar.sh
bash migrar.sh compose-transmit-virtual-protocol-6qurgn compose-compress-back-end-array-fuf9qm
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

## 4. Cambio a producción (cuando William lo apruebe)

1. Respaldo de la base del headless (en el servidor actual, el respaldo diario a R2 **está desactivado**: hay que activarlo antes).
2. Importar el contenido más reciente (paso 3) con `WORDPRESS_URL=https://lapazsipasa.com` y `WP_ENVIRONMENT_TYPE=production`.
3. Mover el DNS de `lapazsipasa.com` y `www` al servidor nuevo, con el dominio en el servicio `cms`.
4. `cms.lapazsipasa.com`: 301 al dominio principal, o se da de baja.
5. El headless sigue en el servidor actual como respaldo hasta la limpieza final.

## Operación

| Tarea | Comando o lugar |
|---|---|
| Respaldo de la base | *Backups* del compose en Dokploy (servicio `db`, MariaDB) o `wp db export` dentro de `cms` |
| Respaldo de uploads | *Volume backups* de Dokploy sobre `wordpress_data` |
| Actualizar tema o plugins | push a la rama del servicio y deploy: todo va horneado en la imagen |
| Logs | Dokploy → servicio → Logs (`cms`). Los errores de SMTP salen con el prefijo `[lapaz-smtp]` |
