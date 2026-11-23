# Guion de pruebas de staging — Boletín, catálogo PaisSana y SEO

Guion operativo para validar la rama `feat/boletin-catalogo-fcp` en staging antes de desplegar en producción. Reúne en una sola sesión las comprobaciones de [revisiones independientes](revisiones-independientes.md#pendiente-de-probar-en-staging), [despliegue](../../despliegue-fse.md#despliegue-de-boletín-y-catálogo-paissana) y [seo-plugin](seo-plugin.md).

Convenciones:
- Todos los comandos de servidor se corren en la terminal del contenedor `cms` en Dokploy como `www-data` (`su www-data -s /bin/bash -c '…'`).
- Sustituir `https://<STAGING>` por la URL pública de staging (con HTTPS).
- Las comprobaciones de navegador se hacen en **ventana de incógnito** (sin sesión) salvo donde se indique entrar con el usuario Editor.
- Tiempo total estimado: **~1 h 45 min** (11 bloques).

---

## Antes de empezar

Verificar estos cinco requisitos antes de iniciar el bloque A:

| Requisito | Dónde o con qué comando se comprueba | Esperado |
| --- | --- | --- |
| 1. Rama desplegada con imagen reconstruida | Dokploy → servicio de staging → Logs / Deploy (`apps/wp-fse/compose.yaml`, sin override) | Contenedor `cms` en estado `healthy`; `curl -sI https://<STAGING>/` sin `X-Powered-By` |
| 2. Variables de entorno correctas | `su www-data -s /bin/bash -c 'printf "ENV=%s CACHE=%s URL=%s\n" "$WP_ENVIRONMENT_TYPE" "$WP_CACHE" "$WORDPRESS_URL"'` | `ENV=staging CACHE=true URL=https://<STAGING>` |
| 3. Copia reciente de producción importada | Importada con `lapaz-importar /tmp/prod.sql /tmp/uploads.tar.gz` (ver [despliegue](../../despliegue-fse.md#3-contenido-real-de-producción)) | Conteos previos de `retrato`, `video`, `feria`, `audio_relato`, `subcuenta`, `noticia` presentes |
| 4. Respaldo previo del estado inicial de staging | `su www-data -s /bin/bash -c '( umask 077; wp --path=/var/www/html db export /tmp/pre-staging.sql --quiet ) && ls -lh /tmp/pre-staging.sql'` | Archivo > 0 bytes con permisos `-rw-------` |
| 5. Usuario Editor de prueba | `su www-data -s /bin/bash -c 'wp --path=/var/www/html user create editor_staging editor-staging@example.test --role=editor'` | Usuario creado y clave guardada aparte para la sesión (se borra al final) |

---

## Bloques de prueba

### Bloque A — Arranque y migraciones (`lapaz-setup`) · ~10 min

**Objetivo:** confirmar que `lapaz-setup` migra una base con contenido real sin perder datos y aplica sus guardas.

1. Anotar conteos y plantillas previas:
   ```bash
   su www-data -s /bin/bash -c 'for t in retrato video feria audio_relato subcuenta noticia; do echo "$t: $(wp --path=/var/www/html post list --post_type=$t --post_status=publish --format=count)"; done'
   su www-data -s /bin/bash -c 'wp --path=/var/www/html post list --post_type=wp_template,wp_template_part --post_status=any --fields=ID,post_type,post_name'
   ```
2. Probar rechazo de opción desconocida:
   ```bash
   su www-data -s /bin/bash -c 'lapaz-setup --help'; echo "exit=$?"
   ```
   - *Esperado:* error por `stderr` y `exit=2` sin modificar nada.
3. Probar la guarda contra `--seed` en producción (simulando la variable solo para este comando):
   ```bash
   su www-data -s /bin/bash -c 'WP_ENVIRONMENT_TYPE=production lapaz-setup --seed'; echo "exit=$?"
   ```
   - *Esperado:* `ERROR: --seed se rechaza…` por `stderr` y `exit=1` sin cambiar nada.
4. Correr `lapaz-setup` normal (sin `--seed`):
   ```bash
   su www-data -s /bin/bash -c 'lapaz-setup'
   ```
   - *Esperado:* `exit=0`; crea o migra la página `productores` conservando su ID si existía `paissana`; migra el menú Principal solo si era de fábrica (si fue editado, avisa sin tocarlo); activa `autodescription`; imprime `Caché de página: activa` y `Caché de página: vaciada`; avisa por `stderr` solo si hay plantillas personalizadas publicadas del tema `lapaz`.
5. Verificar en `/wp-admin/` que los menús **Boletines**, **Historias PaisSana** y **Productores** muestran sus campos SCF sin importación manual.
   - *Si falla:* **bloquea el despliegue** (si faltan grupos SCF, probar el comando de importación de [despliegue](../../despliegue-fse.md#durante-el-despliegue) paso 7 y anotar que es obligatorio).

---

### Bloque B — Carga selectiva (`SEED_SOLO`) e idempotencia · ~10 min

**Objetivo:** cargar las tres secciones nuevas sin tocar el contenido existente ni duplicar al repetir.

1. Cargar las tres secciones en orden:
   ```bash
   su www-data -s /bin/bash -c 'SEED_SOLO=productores wp --path=/var/www/html eval-file /opt/seed/seed.php'
   su www-data -s /bin/bash -c 'SEED_SOLO=boletines wp --path=/var/www/html eval-file /opt/seed/seed.php'
   su www-data -s /bin/bash -c 'SEED_SOLO=historias wp --path=/var/www/html eval-file /opt/seed/seed.php'
   ```
   - *Esperado:* cada corrida termina sin errores fatales ni OOM.
2. Repetir las tres corridas una segunda vez (idempotencia).
3. Comprobar conteos:
   ```bash
   su www-data -s /bin/bash -c 'for t in productor boletin historia retrato video feria audio_relato subcuenta noticia; do echo "$t: $(wp --path=/var/www/html post list --post_type=$t --post_status=publish --format=count)"; done'
   ```
   - *Esperado:* `productor: 316`, `boletin: 1`, `historia: 1`, y los conteos de `retrato`, `video`, `feria`, `audio_relato`, `subcuenta` y `noticia` idénticos a los del bloque A paso 1.
   - *Si falla:* **bloquea el despliegue**.

---

### Bloque C — Rutas, respuestas HTTP, sitemap e idiomas · ~10 min

**Objetivo:** confirmar códigos HTTP exactos en rutas nuevas, retiradas, sitemaps y archivos protegidos.

Ejecutar desde una terminal con `curl`:

1. **HTTP 200:**
   ```bash
   for p in / /proyectos-destacados/ /productores/ /historias/ /historias/asocafe/ /boletin/ /boletin/edicion-02/ /sitemap.xml /robots.txt; do
     printf "%s -> %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' "https://<STAGING>$p")"
   done
   ```
   - *Esperado:* todas responden `200`. En `/sitemap.xml` aparecen Inicio, Proyectos destacados, Productores PaisSana, `/boletin/edicion-02/` y `/historias/asocafe/`, sin `productor` ni `guia-de-estilos`. En `/robots.txt` aparece `Sitemap: https://<STAGING>/sitemap.xml`.
2. **HTTP 301 (sitemaps antiguos y feeds):**
   ```bash
   for p in /wp-sitemap.xml /wp-sitemap.xml/ /wp-sitemap-posts-page-1.xml /feed/; do
     curl -sI "https://<STAGING>$p" | awk 'NR==1 || tolower($0) ~ /^location:/'
   done
   ```
   - *Esperado:* los tres `/wp-sitemap*` → `301` a `https://<STAGING>/sitemap.xml`; `/feed/` → `301` a `https://<STAGING>/`.
3. **HTTP 401 (API REST sin sesión):**
   ```bash
   for p in /wp-json/wp/v2/users /wp-json/wp/v2/productor /wp-json/wp/v2/boletin /wp-json/wp/v2/historia; do
     printf "%s -> %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' "https://<STAGING>$p")"
   done
   ```
   - *Esperado:* todas responden `401`.
4. **HTTP 403 (archivos sensibles y carpeta de idiomas):**
   ```bash
   for p in /xmlrpc.php /readme.html /license.txt /wp-config-sample.php /wp-content/debug.log /wp-content/uploads/ /wp-content/languages/plugins/autodescription-es_CO.l10n.php /wp-content/languages/plugins/autodescription-es_CO.mo; do
     printf "%s -> %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' "https://<STAGING>$p")"
   done
   ```
   - *Esperado:* todas `403` (si las dos de `/wp-content/languages/plugins/` dan `200`, significa que aún falta aplicar el ajuste de `zz-lapaz-seguridad.conf` de la revisión 26 → **se anota y sigue**; el resto **bloquea el despliegue**).
5. **HTTP 404 (rutas retiradas o locales):**
   ```bash
   for p in /paissana/ /paissana/historias/asocafe/ /guia-de-estilos/; do
     printf "%s -> %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' "https://<STAGING>$p")"
   done
   ```
   - *Esperado:* todas responden `404`.
   - *Si falla:* `/paissana/` o `/guia-de-estilos/` en 200 **bloquea el despliegue**.

---

### Bloque D — Cabeceras y CSP en modo informe · ~10 min

**Objetivo:** comprobar cabeceras de seguridad detrás de Traefik y cero violaciones en consola.

1. Inspeccionar cabeceras en `/` y `/wp-login.php`:
   ```bash
   curl -sI https://<STAGING>/ | grep -iE 'server|x-powered-by|strict-transport-security|content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy'
   curl -sI https://<STAGING>/wp-login.php | grep -i 'content-security-policy'
   ```
   - *Esperado:* sin `X-Powered-By`; `Server` sin versión; `Strict-Transport-Security: max-age=31536000` presente en HTTPS; `Content-Security-Policy-Report-Only` presente en `/` y ausente en `/wp-login.php`.
2. Confirmar que HSTS no se emite en HTTP interno dentro del contenedor:
   ```bash
   su www-data -s /bin/bash -c 'curl -sI http://localhost/ | grep -i strict-transport-security || echo "OK: sin HSTS en HTTP interno"'
   ```
   - *Esperado:* `OK: sin HSTS en HTTP interno`.
3. Abrir en incógnito con DevTools → **Consola** abierta:
   - `/` (recorrer Retratos, Lo que hacemos, Actualidad, tarjetas nuevas)
   - `/proyectos-destacados/` (**reproducir un video de YouTube de Plyr y un audio**)
   - `/productores/` (buscar `cafe` y pulsar una barra)
   - `/historias/asocafe/` (abrir una foto de la galería)
   - `/boletin/`
   - *Esperado:* 0 errores de red 4xx/5xx en recursos propios y 0 avisos de violación de `Content-Security-Policy-Report-Only`.
   - *Si falla:* cabeceras rotas o recursos 404 **bloquea el despliegue**; una violación en `CSP-Report-Only` **se anota y sigue** (impide pasar CSP a modo activo hasta corregirla, no impide desplegar en modo informe).

---

### Bloque E — Caché de página real (WP Super Cache) · ~10 min

**Objetivo:** confirmar qué se guarda en caché, qué queda fuera y que la caché se vacía sola al editar.

1. Pedir dos veces `/productores/` y comprobar marca de WP Super Cache (o revisar `wp-content/cache/supercache/`):
   ```bash
   curl -s https://<STAGING>/productores/ | tail -n 5
   curl -s https://<STAGING>/productores/ | tail -n 5
   ```
   - *Esperado:* la segunda respuesta se sirve desde caché (`<!-- Cached page generated by WP-Super-Cache … -->` o archivo creado bajo `/var/www/html/wp-content/cache/supercache/`).
2. Comprobar que `/productores/?buscar=cafe`, `/productores/?x=1` y `/sitemap.xml` **no** se guardan en caché:
   ```bash
   curl -s "https://<STAGING>/productores/?buscar=cafe" > /dev/null
   curl -s "https://<STAGING>/productores/?x=1" > /dev/null
   curl -s "https://<STAGING>/sitemap.xml" > /dev/null
   su www-data -s /bin/bash -c 'find /var/www/html/wp-content/cache/supercache -maxdepth 4 -type f'
   ```
   - *Esperado:* existe archivo cacheado para `/productores/` limpio, pero ninguno con `?buscar=`, `?x=1` ni `sitemap.xml`.
3. Comprobar vaciado automático al editar:
   - Editar y guardar un productor de prueba (o renombrar un término en *Productores → Departamentos* y devolverlo a su nombre, o guardar el menú Principal).
   - Recargar `/productores/` en incógnito.
   - *Esperado:* el cambio aparece inmediatamente sin vaciado manual y `supercache/` se regeneró.
   - *Si falla:* `/productores/?buscar=` o `/sitemap.xml` cacheados **bloquea el despliegue**; si el vaciado automático falla al editar, **bloquea el despliegue**.

---

### Bloque F — SEO en staging y simulación de producción · ~15 min

**Objetivo:** confirmar unicidad de etiquetas, `noindex` en staging, ausencia de `noindex` en producción, prioridad del editor y bloqueo de redirecciones.

1. En incógnito (staging con `WP_ENVIRONMENT_TYPE=staging`), comprobar `<head>` en `/`, `/proyectos-destacados/`, `/productores/`, `/boletin/`, `/boletin/edicion-02/`, `/historias/` y `/historias/asocafe/`:
   ```bash
   for p in / /proyectos-destacados/ /productores/ /boletin/ /boletin/edicion-02/ /historias/ /historias/asocafe/; do
     echo "=== $p ==="
     curl -s "https://<STAGING>$p" | grep -oiE '<title>[^<]+</title>|<meta[^>]+(description|robots|og:title|og:locale)[^>]*>|<link[^>]+rel="canonical"[^>]*>'
   done
   ```
   - *Esperado:* exactamente 1 `<title>`, 1 `description`, 1 `robots` (con `noindex, nofollow` en staging), 1 `og:title`, 1 `og:locale` (`es_CO`); `/boletin/` apunta canónica a `/boletin/edicion-02/` y `/historias/` a `/historias/asocafe/`.
2. **Simulación de producción (comprobación crítica de `noindex`):**
   - En Dokploy (solo 2 minutos en staging), cambiar temporalmente `WP_ENVIRONMENT_TYPE=production` → Redeploy o reiniciar `cms` → vaciar caché → comprobar:
     ```bash
     curl -s https://<STAGING>/ | grep -i 'name="robots"'
     curl -s "https://<STAGING>/productores/?buscar=cafe" | grep -i 'name="robots"'
     curl -s "https://<STAGING>/productores/?departamento=cauca" | grep -i 'name="robots"'
     ```
   - *Esperado:* `/` y `/productores/?departamento=cauca` **sin `noindex`** (con `max-image-preview:large`); `/productores/?buscar=cafe` **con `noindex`** y **sin `nofollow`**.
   - **Volver inmediatamente `WP_ENVIRONMENT_TYPE=staging`** en Dokploy y confirmar que `/` vuelve a llevar `noindex`.
   - *Si `/` llevara `noindex` en modo `production`:* **bloquea el despliegue**.
3. **Prioridad del editor en entrada y archivos:**
   - Entrar como `editor_staging`, abrir **Edición 02** (boletín), cambiar **Meta título** y **Descripción meta** en **Ajustes de SEO** → **Actualizar**.
   - Comprobar en incógnito tanto `/boletin/edicion-02/` como `/boletin/` → ambos muestran el título y la descripción nuevos.
   - Repetir en **Asocafé** y comprobar `/historias/asocafe/` y `/historias/`. Luego restaurar los campos vacíos.
4. **Comprobar que el Editor no puede guardar redirecciones ni `noindex`:**
   - En la pestaña de edición con sesión de `editor_staging`, confirmar que no aparece la pestaña **Visibilidad** ni el menú lateral **SEO**.
   - *(Si se aplicó el ajuste de revisión 26)* Enviar un POST de guardado añadiendo `autodescription[redirect]=https://example.com` desde DevTools y confirmar que no se guarda `_genesis_redirect` / `redirect`.
   - *Si falla la prioridad del editor:* **bloquea el despliegue**. *Si falta el bloqueo POST:* **se anota y sigue** (aplicar ajuste de revisión 26).

---

### Bloque G — Flujo completo del Editor con el manual · ~15 min

**Objetivo:** seguir [`wiki/manual-editor.md`](../../manual-editor.md) de principio a fin con el usuario `editor_staging` y anotar los puntos `[CONFIRMAR EN PANTALLA]`.

1. Entrar a `https://<STAGING>/wp-admin` con `editor_staging`.
2. **Boletín de prueba:** **Boletines → Añadir edición** → comprobar que nacen las 8 secciones precargadas → llenar lo mínimo (borrar secciones no usadas) → comprobar barra de texto (**Título 3**, **Cita**) → **Publicar** → verificar que `/boletin/` muestra la nueva edición y «Otras ediciones» lista `Edición 02` → pasar a papelera y borrar.
3. **Historia de prueba:** **Historias PaisSana → Añadir historia** → publicar una historia de prueba → verificar `/historias/`, **Inicio** y `/productores/` → borrar.
4. **Productor de prueba:** **Productores → Añadir productor** → publicar → buscarlo en `/productores/` → borrar.
5. **Restricciones y Salud del sitio:**
   - Confirmar que `editor_staging` **no** ve *Plugins*, *Ajustes*, *SEO* ni *Usuarios*, y **no** puede abrir `https://<STAGING>/wp-admin/admin.php?page=theseoframework-settings`.
   - Con usuario **administrador**, abrir **Herramientas → Salud del sitio** y anotar si aparece aviso por la API REST cerrada (401).
   - *Si el Editor no puede publicar alguno de los 3 tipos o puede entrar a ajustes de plugins/SEO:* **bloquea el despliegue**. *Aviso de Salud del sitio o ajustes de texto del manual:* **se anota y sigue**.

---

### Bloque H — Accesibilidad (teclado y lector de pantalla) · ~10 min

**Objetivo:** validar con teclado y VoiceOver/NVDA los puntos no automatizables en local.

1. **Menú principal (escritorio y móvil):** navegar con `Tab`, comprobar foco visible y línea inferior del ítem activo en móvil sobre el overlay celeste.
2. **Tarjetas del índice del boletín (`/boletin/`):** tabular por las tarjetas de «En esta edición»; el lector debe anunciar el título del enlace (no el resumen completo como enlace único) y el foco debe ser visible alrededor de la tarjeta.
3. **Galería y lightbox (`/historias/asocafe/`):** abrir una foto con `Enter`, pulsar `Tab` (el foco queda encerrado en el botón Cerrar), pulsar `Escape` (el diálogo cierra, el scroll vuelve y el foco regresa a la miniatura pulsada).
4. **«Ver más» del catálogo (`/productores/`):** con VoiceOver/NVDA activo, filtrar o paginar hasta pulsar la última tanda de «Ver más» y confirmar si el conteo (`.conteo`) se anuncia una vez o dos.
5. **Video de enlace externo (si hay uno de prueba):** confirmar que el lector anuncia «Ver el video (abre en una pestaña nueva)».
   - *Si el teclado queda atrapado o el foco se pierde:* **bloquea el despliegue**. *Doble anuncio de `.conteo`:* **se anota y sigue**.

---

### Bloque I — Rendimiento (Lighthouse) · ~10 min

**Objetivo:** medir rendimiento real con WP Super Cache activo en móvil y escritorio.

Ejecutar Lighthouse (DevTools → **Lighthouse**, modo navegación, en incógnito, **segunda carga** para medir desde caché) en:
1. `/`
2. `/productores/` (hero compacto)
3. `/boletin/`
4. `/historias/asocafe/`

Anotar **LCP**, **CLS**, **INP/TBT** y puntuación de **Rendimiento** y **Accesibilidad**.
- *Umbrales de alerta:* LCP > 2,5 s en móvil, CLS > 0,1, o Accesibilidad < 95.
- *Si supera un umbral:* **se anota y sigue** (salvo CLS > 0,25 o LCP > 4 s en `/productores/`, que conviene revisar antes de publicar).

---

### Bloque J — Subida de archivo grande y correo SMTP · ~5 min

**Objetivo:** confirmar límites de subida detrás de Traefik y envío de correo por Resend.

1. En **Medios → Añadir nuevo** (o pestaña Video de una historia de prueba), subir un archivo MP4 de ~20 MB (y un JPEG > 2 MB para comprobar conversión a WebP). Borrar ambos después.
   - *Esperado:* subida completada sin error `413` de Traefik ni error `500`/OOM de PHP.
2. En `https://<STAGING>/wp-login.php?action=lostpassword`, pedir recuperación de contraseña para un correo de prueba controlado (si `SMTP_PASS` está configurado en staging).
   - *Esperado:* llega el correo y no aparecen errores `[lapaz-smtp]` en los logs de `cms`.
   - *Si falla la subida de 20 MB:* **bloquea el despliegue** (ajustar `maxRequestBodyBytes` en Traefik). *Si `SMTP_PASS` no está puesto en staging:* **se anota y sigue**.

---

### Bloque K — Ensayo de marcha atrás y limpieza final · ~10 min

**Objetivo:** verificar que el respaldo previo restaura limpio y dejar staging ordenado.

1. Hacer un cambio visible menor (p. ej. publicar una página de prueba `prueba-rollback`).
2. Restaurar el respaldo del requisito 4:
   ```bash
   su www-data -s /bin/bash -c 'wp --path=/var/www/html db import /tmp/pre-staging.sql'
   su www-data -s /bin/bash -c 'wp --path=/var/www/html cache flush && wp --path=/var/www/html rewrite flush --hard && wp --path=/var/www/html eval "if (function_exists(\"wp_cache_clear_cache\")) wp_cache_clear_cache();"'
   ```
   - *Esperado:* `prueba-rollback` desaparece y staging vuelve exactamente al estado previo.
3. Volver a correr `lapaz-setup` + los 3 `SEED_SOLO` (para dejar staging listo para revisión del Fondo), borrar `editor_staging` si no se usará más, y borrar `/tmp/pre-staging.sql`:
   ```bash
   su www-data -s /bin/bash -c 'rm -f /tmp/pre-staging.sql'
   ```
   - *Si la restauración falla:* **bloquea el despliegue**.

---

## Hoja de resultados

| Bloque | Paso | Resultado (OK / Fallo / Nota) | Quién | Fecha |
| --- | --- | --- | --- | --- |
| Pre | Requisitos 1–5 | | | |
| A | Arranque y `lapaz-setup` (1–5) | | | |
| B | `SEED_SOLO` e idempotencia (1–3) | | | |
| C | Rutas 200 / 301 / 401 / 403 / 404 (1–5) | | | |
| D | Cabeceras y consola CSP (1–3) | | | |
| E | WP Super Cache y vaciado (1–3) | | | |
| F | SEO staging + simulación producción + Editor (1–4) | | | |
| G | Flujo completo del Editor + manual + Salud (1–5) | | | |
| H | Accesibilidad teclado y lector (1–5) | | | |
| I | Lighthouse `/`, `/productores/`, `/boletin/`, `/historias/asocafe/` | | | |
| J | Subida ~20 MB y correo SMTP (1–2) | | | |
| K | Ensayo de marcha atrás y limpieza (1–3) | | | |

---

## Criterio de salida a producción

**Debe estar 100 % en verde para aprobar producción:**
- Bloques **A, B, C** (salvo 403 de `languages/`), **E**, **F** (en especial: `/` sin `noindex` en modo `production`, `/productores/?buscar=` con `noindex`, y prioridad del editor en `/boletin/` e `/historias/`), **G** (publicación de los 3 tipos y aislamiento del Editor), **H** (sin trampas de foco), **J** (subida de 20 MB) y **K** (restauración probada).

**Puede quedar anotado para seguimiento (no frena el despliegue):**
- Violaciones menores en `CSP-Report-Only` (el modo informe no bloquea; impide activar CSP hasta corregir).
- Aviso de REST 401 en *Salud del sitio* si el editor y el Editor del sitio operan normal.
- Doble anuncio de `.conteo` con lector de pantalla o retoques de Lighthouse dentro de márgenes aceptables.
- Ajustes cosméticos de redacción/capturas en `wiki/manual-editor.md`.
- 403 en `/wp-content/languages/plugins/` y bloqueo POST de visibilidad (si aún no se aplicaron los 2 ajustes de la revisión 26).

---

## Resumen de tiempos estimados

| Bloque | Tiempo |
| --- | ---: |
| Antes de empezar | 10 min |
| A. Arranque y `lapaz-setup` | 10 min |
| B. Carga `SEED_SOLO` e idempotencia | 10 min |
| C. Rutas, HTTP y sitemaps | 10 min |
| D. Cabeceras y CSP | 10 min |
| E. WP Super Cache | 10 min |
| F. SEO y simulación de producción | 15 min |
| G. Flujo del Editor con manual | 15 min |
| H. Accesibilidad teclado/lector | 10 min |
| I. Lighthouse | 10 min |
| J. Subida ~20 MB y SMTP | 5 min |
| K. Ensayo de marcha atrás | 10 min |
| **Total** | **~1 h 55 min** |
