# SEO editable por el equipo: The SEO Framework

**Estado: diseño, pendiente de aprobación.** Fase 1 (probar y diseñar) hecha el 2026-11-20 sobre `http://localhost:8090`. No se integró nada: el plugin quedó instalado y desactivado, y el `<head>` del sitio es el de antes.

Contexto: [decisiones](../../decisions/boletin-catalogo-fcp.md) y la auditoría [revision-seo-enlaces.md](revision-seo-enlaces.md). Hoy el SEO lo hace el tema (`inc/seo.php`, `inc/guia-estilos.php`) y quien edita solo puede cambiar el extracto de las páginas.

## 0. Veredicto

**Integrar con ajustes.** The SEO Framework (TSF) 5.2.1 cumple lo esencial: aparece en los tres tipos nuevos, da título, descripción e imagen para compartir por entrada, y un usuario con rol Editor solo ve eso. Los ajustes son de integración, no de plugin:

1. El contenido de boletines e historias vive en campos SCF, no en `post_content`. Sin ayuda, TSF no genera descripción ni imagen para ellos (lo comprobé: salen vacías). Los valores por defecto se los da el tema con filtros (sección 4). Funciona: lo probé.
2. La caja viene en inglés hasta instalar la traducción `es_CO` (existe en wordpress.org, cubre las cadenas de la caja; ~75 % del total).
3. Al activarlo, el tema y TSF imprimen las mismas etiquetas dos veces. Hay que quitar la salida del tema (sección 3).
4. `/wp-sitemap.xml` pasa a dar 404: el sitemap es `/sitemap.xml`. Hay que cambiar dos pruebas e2e.
5. En el editor de bloques (páginas) la caja queda dentro del panel plegado «Cajas meta»; hay que enseñarlo en el manual.

No hay ningún incumplimiento esencial. Alternativa si algo falla en staging: Slim SEO (más ligero, sin ajustes globales, pero con menos control por entrada); no la probé.

## 1. Por qué un plugin y por qué este

- **Por qué plugin:** los editores no son técnicos y deben cambiar solos título, descripción e imagen de cada página, boletín e historia. Hoy eso exige tocar código (títulos y descripciones por defecto) o usar el extracto de la página (solo descripción, solo páginas).
- **Por qué TSF:** gratuito completo (sin anuncios ni versión de pago en la caja), declara compatibilidad con WordPress 7.1 (`Requires 7.0`, `Tested up to 7.1`, PHP 7.4+), no hace peticiones salientes (sección 6) y expone filtros para cada valor que el tema necesita por defecto.
- **Alternativa:** Slim SEO.

## 2. Qué verá y qué podrá cambiar el editor

Probado con administrador y con un usuario Editor temporal (`__prueba`, ya borrado), en Chrome headless.

| Pantalla | ¿Aparece la caja «SEO Settings»? |
|---|---|
| Página (Productores PaisSana, editor de bloques) | Sí, dentro del panel plegado «Cajas meta», abajo del lienzo. |
| Boletín (Edición 02, editor clásico con SCF) | Sí, entre el título y «Edición del boletín». |
| Historia (Asocafé, editor clásico con SCF) | Sí, igual. |
| Productor | No: el tipo no es público (`public: false`), TSF no lo toca. Es lo que se quiere. |

**Pestañas de fábrica**
- *General*: título (Meta Title), casilla «quitar el nombre del sitio», descripción. Cada campo trae contador de caracteres con semáforo («54 – Good», «166 – Too long», «24 – Far too short») y contador de píxeles. No hay vista previa de resultado de Google.
- *Social*: título y descripción para Open Graph y para Twitter por separado, tipo de tarjeta, **imagen para compartir** (campo URL + botón «Select Image» que abre la mediateca). Los campos vacíos muestran el valor que se usará (el que da el tema), así el editor ve qué pasa si no escribe nada.
- *Visibility*: robots (`noindex`, `nofollow`, `noarchive`), URL canónica, redirección 301. **Sobra y es peligrosa** para este público.

**Qué puede tocar un Editor.** Solo los campos de cada entrada. No ve el menú «SEO» y la URL `admin.php?page=theseoframework-settings` le responde «Lo siento, no tienes permitido el acceso a esta página». La capacidad de los ajustes globales es `manage_options` (`bootstrap/define.php:45`). Los Editores pueden usar la REST en el panel (la API sigue cerrada a visitantes): el editor de bloques cargó bien con su sesión.

**Qué se oculta** (probado, ver captura «reducida»): la pestaña *Visibility* con el filtro `the_seo_framework_inpost_settings_tabs` (`inc/views/post/settings.php:89`) y, con CSS en `admin_head`, los cuatro campos de Open Graph/Twitter y el tipo de tarjeta (usan los de *General* si están vacíos). Queda: título, descripción, imagen. Los campos tienen `id` estables (`autodescription_og_title`, `…_twitter_title`, `…_twitter_card_type`, `…_socialimage-url`).

**Capturas hechas** (en el scratchpad de la sesión, no se versionan):
- Caja completa en boletín, historia y página, pestañas General, Social y Visibility, como administrador y como Editor.
- Caja reducida (General + solo imagen) como Editor en los tres tipos, con «Cajas meta» desplegado en la página.
- Ajustes globales de SEO como administrador, y la negativa de acceso al Editor.
- Edición de un productor sin caja.

## 3. Qué pasa en el `<head>` (con el SEO del tema tal como está)

Con TSF activo y el tema sin tocar, salen **dos copias** de casi todo. TSF imprime primero (prioridad 1), el tema después (prioridad 2).

| Etiqueta | Duplicada | Quién gana hoy |
|---|---|---|
| `<title>` | No (una sola, la de TSF). Pero el filtro `document_title_parts` del tema **deja de aplicar**: sale «Proyectos destacados - La Paz Sí Pasa», no «PaisSana, proyectos destacados \| …». | TSF |
| `description` | Sí (en todas las páginas) | Dos etiquetas; los buscadores toman la primera (TSF), que en CPT sale vacía hasta darle valores por defecto |
| `canonical` | Solo en `/boletin/` y `/historias/` (la de TSF apunta al archivo, la del tema a la entrada) | Contradicción; Google puede ignorar ambas |
| `robots` | Sí: core imprime `noindex, nofollow` (por `lapaz_noindex_fuera_de_produccion`) y TSF imprime la suya (`max-snippet:-1,max-image-preview:large,…`) | Gana la más restrictiva: el `noindex` local se mantiene, pero son dos etiquetas |
| `og:type/url/title/description/image…` | Sí (el tema en `es_CO`, TSF en `es_ES`, ver riesgos) | Dos juegos |
| `twitter:*` | Sí | Dos juegos |
| JSON-LD | No: solo TSF (el tema no tiene) | TSF |

URLs de la auditoría con TSF activo y sin otros cambios:
- `/category/uncategorized/`: 200, `noindex`, sin canónica. Sigue siendo una URL real.
- `/page/2/`: 200, canónica a `/` (la canónica rota `/2/` desaparece), **sin** `noindex`.
- `/?s=cafe`: 200 con `noindex` (TSF lo trae de fábrica).
- `/productores/?buscar=cafe`: **sin** `noindex`; canónica a `/productores/` (sigue igual).
- `/guia-de-estilos/`: indexable por TSF; el tema la saca con su filtro (sección 4).

## 4. Plan de integración

### 4.1 Qué se quita y qué se queda en `inc/seo.php`

Se quita (lo reemplaza TSF o queda sin efecto):
- `lapaz_page_excerpt()` (soporte de extracto en páginas): dos cajas para la descripción confundirían. Migración única, sección 5.
- `lapaz_document_title_parts()`, `lapaz_document_title_separator()`: TSF toma el título (separador por ajuste).
- `lapaz_meta_description()` y `lapaz_print_meta()` salvo los íconos: lo imprime TSF.
- `lapaz_archivo_canonical()`.
- `lapaz_sitemap_post_types()` y `lapaz_sitemap_providers()`: el sitemap del núcleo ya no existe.
- En `inc/guia-estilos.php`: `lapaz_guia_noindex()` y `lapaz_guia_fuera_del_sitemap()` (se reemplazan por la regla de la sección 4.2).

Se queda: `lapaz_es_boletin()`, `lapaz_es_historia()`, los íconos (`<link rel="icon">` y `apple-touch-icon` se separan de `lapaz_print_meta` en una función de tres líneas; TSF no los imprime), `lapaz_image_output_format()` (WebP), `lapaz_sin_emojis()`.

### 4.2 Valores por defecto con filtros de TSF

Todos son del plugin y aceptan que el editor escriba encima: lo escrito en la caja (`_genesis_title`, `_genesis_description`, `_social_image_id`/`_social_image_url`, `_genesis_canonical_uri`, `_genesis_noindex`) gana siempre. Lo comprobé escribiendo esos metadatos en el boletín, la página y la historia: el título, la descripción y la imagen del editor sustituyeron a los del tema.

| Necesidad | Filtro (archivo:línea en el plugin) | Notas |
|---|---|---|
| Título por defecto | `the_seo_framework_title_from_generation( $titulo, $args )` (`meta/title.class.php:238`) | `$args` es `null` cuando es la consulta actual. Para el archivo `/boletin/` devolver `lapaz_boletin_titulo( lapaz_boletin_mostrado() )`; para historias `get_the_title()`. Aplicar solo con `$args === null` o `$args['id']`, no con `$args['pta']`: si no, la miga de pan «Boletín» se llama como la edición. |
| Descripción por defecto | `the_seo_framework_generated_description( $desc, $args, $tipo )` (`meta/description.class.php:178`) | Boletín: `portada_sumario`. Historia: `resumen`. Páginas y 404: los textos que hoy están en `lapaz_meta_description()`. Texto general como último recurso. |
| Imagen social por defecto | `the_seo_framework_generated_image_details( $detalles, $args, $single, $contexto )` (`meta/image.class.php:214`) | Devuelve una lista de arrays `url, id, width, height, alt, caption, filesize`. Boletín y historia: `portada_foto`. Último recurso: `og.jpg` 1200x630. |
| Canónica de `/boletin/` y `/historias/` | `the_seo_framework_post_type_archive_meta( $meta, $post_type, $headless )` (`data/plugin/pta.class.php:129`) | Poner `$meta['canonical']` con el permalink de la entrada mostrada. Resultado probado: una sola etiqueta, la correcta. |
| `noindex` | `the_seo_framework_robots_meta_array( $meta, $args, $opciones )` (`meta/robots.class.php:170`) | Ver nota abajo sobre `$args`. Valores: `$meta['noindex'] = 'noindex'`. |
| Sitemap | Automático: TSF excluye lo que da `noindex` por `$args['id']`; además `the_seo_framework_sitemap_exclude_ids` (`sitemap/utils.class.php:97`) | Probado: con la guía en `noindex` por id, sale del sitemap. |
| Datos estructurados | `the_seo_framework_schema_graph_data` (`meta/schema.class.php:143`); ajustes `ld_json_*` y `knowledge_*` | Sección 4.5. |
| Quitar la caja de un tipo | `the_seo_framework_seobox_output` / `…_supported_post_type` | `productor` ya queda fuera por no ser público. |

**Nota sobre `$args` y `noindex`.** TSF llama a `the_seo_framework_robots_meta_array` de dos modos: con `$args === null` al imprimir una página, y con `$args = ['id' => N]` al armar el sitemap. Las reglas por consulta (búsqueda del catálogo, fuera de producción) deben aplicar solo con `null`; si no, en local y staging el sitemap quedaría vacío y las pruebas del sitemap fallarían. La regla de la guía debe aplicar a ambos modos (para que salga del sitemap).

Ejemplo corto, tal como lo probé (reemplaza a `lapaz_print_meta`, `lapaz_archivo_canonical` y los filtros de sitemap):

```php
add_filter( 'the_seo_framework_generated_description', static function ( $desc, $args ) {
	$id = lapaz_seo_id( $args ); // $args['id'], o la entrada que muestra /boletin/ o /historias/, o get_queried_object_id()
	$t  = 'boletin' === get_post_type( $id ) ? lapaz_field_text( 'portada_sumario', $id )
		: ( 'historia' === get_post_type( $id ) ? lapaz_field_text( 'resumen', $id ) : '' );
	return '' !== $t ? wp_strip_all_tags( $t ) : $desc;
}, 10, 2 );

add_filter( 'the_seo_framework_post_type_archive_meta', static function ( $meta, $tipo ) {
	$id = 'boletin' === $tipo ? lapaz_boletin_mostrado() : ( 'historia' === $tipo ? lapaz_historia_mostrada() : 0 );
	if ( $id && empty( $meta['canonical'] ) ) {
		$meta['canonical'] = (string) get_permalink( $id );
	}
	return $meta;
}, 10, 2 );

add_filter( 'the_seo_framework_robots_meta_array', static function ( $m, $args ) {
	$guia = get_page_by_path( 'guia-de-estilos' );
	if ( $guia && ( null === $args ? is_page( $guia->ID ) : (int) ( $args['id'] ?? 0 ) === $guia->ID ) ) {
		$m['noindex']  = 'noindex';                                                   // guía: fuera de índice y de sitemap
		$m['nofollow'] = 'nofollow';
	}
	if ( null === $args && is_page( 'productores' ) && isset( $_GET['buscar'] ) ) {
		$m['noindex'] = 'noindex';                                                    // búsqueda y resultados vacíos
	}
	if ( null === $args && 'production' !== wp_get_environment_type() ) {
		$m['noindex']  = 'noindex';                                                   // staging y local
		$m['nofollow'] = 'nofollow';
	}
	return $m;
}, 10, 2 );
```

Los valores de `noindex` y `nofollow` son cadenas, como en la prueba.

Cómo queda cada requisito, con lo probado:
- **Descripción de boletín e historia** por defecto = `portada_sumario` / `resumen`: sí (descripción, og:description y twitter:description).
- **Imagen** = foto de portada: sí; el editor la cambia con «Select Image» y su valor gana.
- **Canónica de `/boletin/` y `/historias/`** = la entrada mostrada: sí, una sola etiqueta.
- **`noindex` en `/productores/?buscar=…`** y en resultados vacíos: sí (cubre cualquier valor de `buscar`, también el que no da resultados; se probó `?buscar=zzzzqq`).
- **Guía fuera de índice y de sitemap:** sí.
- **`productor` fuera de todo:** sí, sin caja, sin sitemap, sin salida.

### 4.3 Ajustes iniciales del plugin (una sola vez, por wp-cli)

Se escriben después de activar (TSF crea sus ajustes por defecto al activarse; `wp option patch update` solo cambia la clave). Marca `lapaz_seo_configurado` para no pisar lo que un administrador cambie luego.

| Clave en `autodescription-site-settings` | Valor | Por qué |
|---|---|---|
| `title_separator` | `pipe` | «Página \| La Paz Sí Pasa», como hoy. |
| `homepage_title_tagline` | `Fondo Colombia en Paz` | Portada: «La Paz Sí Pasa \| Fondo Colombia en Paz» (probado). |
| `ld_json_searchbox` | `0` | El sitio no tiene buscador propio: TSF declaraba un `SearchAction` falso hacia `/search/{término}/`. |
| `knowledge_name` | `Fondo Colombia en Paz` | `Organization` de la portada (probado). Pendiente: `knowledge_logo_url` y redes (Instagram/X del pie); hay que confirmar las URL con el Fondo. |

El resto de valores de fábrica sirve: `search_noindex`, `date_noindex`, `noindex_post_types.attachment` y `max_image_preview=large` ya vienen activos; `social_title_rem_additions=1` quita el nombre del sitio de `og:title` (más limpio que ahora; cambia las pruebas).

No se usa `site_noindex` de TSF para staging: `lapaz-importar` carga la base de producción en otros servidores y arrastraría ese ajuste. La regla va en código (sección 4.2).

### 4.4 Sitemap y `robots.txt`

- TSF sustituye el sitemap del núcleo: **`/wp-sitemap.xml` da 404**; el sitemap es **`/sitemap.xml`** (un solo `urlset`, sin índice) con hoja de estilo propia (`/sitemap.xsl`, `/sitemap.css`).
- Contenido probado con el plan puesto: Inicio, Productores PaisSana, Proyectos destacados, `/historias/asocafe/`, `/boletin/edicion-02/`. Sin guía, sin productores (no públicos), sin adjuntos, sin archivos `/boletin/` ni `/historias/` (la canónica ya apunta a la entrada).
- El sitemap se guarda en un transitorio (`tsf_sitemap_*`); un cambio de código que afecte al sitemap necesita vaciarlo (`wp transient delete --all` o guardar una entrada). Lo viví al probar: el primer sitemap se quedó con la guía hasta limpiar.
- `robots.txt` virtual: conserva `Disallow: /wp-admin/` y `Allow: /wp-admin/admin-ajax.php`, y la línea `Sitemap:` apunta a `/sitemap.xml`. No hace falta tocar nada.

### 4.5 Datos estructurados

TSF genera solos, en JSON-LD: `WebSite` (con `SearchAction`, que se apaga), `WebPage` con `BreadcrumbList` en todas las páginas, `CollectionPage` en los archivos, `Organization` solo en la portada, y `datePublished`/`dateModified` en entradas. Para este sitio:
- Correcto: `WebSite`, `WebPage`, `Organization` (con el ajuste), migas.
- Migas de la edición: Inicio > Boletín > Edición. Con el título por defecto aplicado solo a la consulta actual la miga intermedia dice «Boletín»; si se aplica también a `pta` dice el nombre de la edición (lo vi): de ahí la nota de 4.2.
- **No genera `Article`/`NewsArticle`** (la auditoría lo proponía para historia y boletín). Decisión pendiente: aceptar `WebPage` (suficiente para el índice; el Fondo no busca resultados enriquecidos) o añadir `Article` con `the_seo_framework_schema_graph_data`. Recomiendo lo primero.
- Las migas siguen sin existir a la vista. Sigue pendiente la decisión D3 de la auditoría.

### 4.6 Qué pasa con los hallazgos abiertos de la auditoría

| Hallazgo | Con el plugin |
|---|---|
| 1. Descripción genérica en `/productores/` (antes `/paissana/`) y en la guía | Resuelto en código (texto por defecto de `/productores/` en el filtro de descripción) y en la caja (el editor lo cambia). La guía va en `noindex`. |
| 2. Títulos pobres (`/productores/`, historia) | El editor puede escribirlos en la caja con contador («24 – Far too short» ya le avisa). Por defecto se mantiene el título de la entrada; si se quiere uno mejor desde el principio, se fija en el filtro de título o se escribe en el seed. |
| `noindex` de búsquedas del catálogo | Resuelto por el filtro de robots. |
| `/category/uncategorized/` | TSF lo pone en `noindex` (por no tener entradas), pero sigue siendo 200. **No lo resuelve**: se mantiene la propuesta de la auditoría (404 en `lapaz-limpieza.php`). |
| `/page/2/` | TSF corrige la canónica (`/`), pero sigue en 200 e indexable. **No lo resuelve**: va con el mismo 404. |
| `/?post_type=historia` | Canónica a la historia (por el filtro), 200. Aceptable. |
| Descripción de la historia de 228 caracteres | El contador lo avisa al editor; en el filtro se recorta a ~155 con `mb_strimwidth` (probé sin recortar). |
| `og:type` del boletín (`website`) | Resuelto: TSF imprime `article` en boletín e historia, con `article:published_time` y `modified_time`. |
| `og:url` del 404 y la portada | TSF usa la URL de la página; en 404 sigue apuntando a la portada (menor). |
| Datos estructurados | Resuelto con lo de 4.5. |

## 5. Cambios en `Dockerfile` y `lapaz-setup`

**Versión exacta:** 5.2.1 · **URL:** `https://downloads.wordpress.org/plugin/autodescription.5.2.1.zip` · **SHA-256:** `9e18a34a4437ddf7ec5a6e1dea6d1e59408db6e59944b8fc672250b80fdbd3fa` (calculada sobre el zip descargado).

`apps/wp-fse/Dockerfile`, después del bloque de WP Super Cache:

```dockerfile
# The SEO Framework con versión fija: SEO editable por entrada (título, descripción, imagen para compartir).
ARG TSF_VERSION=5.2.1
ARG TSF_SHA256=9e18a34a4437ddf7ec5a6e1dea6d1e59408db6e59944b8fc672250b80fdbd3fa
# hadolint ignore=SC2016
RUN curl -fsSL "https://downloads.wordpress.org/plugin/autodescription.${TSF_VERSION}.zip" -o /tmp/tsf.zip \
    && echo "${TSF_SHA256}  /tmp/tsf.zip" | sha256sum -c - \
    && php -r '$z = new ZipArchive(); $z->open("/tmp/tsf.zip") === true || exit(1); $z->extractTo("/opt/wp-content/plugins"); $z->close();' \
    && rm /tmp/tsf.zip
```

`apps/wp-fse/docker/lapaz-setup`, sustituir la línea `plugin activate secure-custom-fields` y añadir debajo:

```bash
"${wp[@]}" plugin activate secure-custom-fields autodescription
# Traducción de la caja de SEO (con DISALLOW_FILE_MODS WordPress no la baja solo). Si falla, queda en inglés.
"${wp[@]}" language plugin install autodescription es_CO || echo "Aviso: sin traducción de The SEO Framework" >&2

# Ajustes iniciales de SEO: una sola vez, para no pisar lo que un administrador cambie después.
if [ -z "$("${wp[@]}" option get lapaz_seo_configurado 2>/dev/null || true)" ]; then
    for par in 'title_separator=pipe' 'homepage_title_tagline=Fondo Colombia en Paz' \
               'ld_json_searchbox=0' 'knowledge_name=Fondo Colombia en Paz'; do
        "${wp[@]}" option patch update autodescription-site-settings "${par%%=*}" "${par#*=}"
    done
    "${wp[@]}" option update lapaz_seo_configurado 1
fi
```

Migración única del extracto de las páginas a la descripción de TSF (solo si TSF no tiene ya descripción), también en `lapaz-setup`:

```bash
"${wp[@]}" eval '
    foreach ( get_posts( array( "post_type" => "page", "post_status" => "any", "numberposts" => -1 ) ) as $p ) {
        if ( "" !== $p->post_excerpt && "" === (string) get_post_meta( $p->ID, "_genesis_description", true ) ) {
            update_post_meta( $p->ID, "_genesis_description", $p->post_excerpt );
        }
    }'
```

(El contenido del extracto se queda en la base; solo se quita su caja.) `lapaz-importar` no necesita cambios: los ajustes y los metadatos viajan en la base.

## 6. Compatibilidad

- **Tema de bloques:** el título sale una sola vez; TSF avisa «Theme title-tag Support Missing» en su pantalla de ajustes (el tema no declara `title-tag`, los temas de bloques lo hacen implícito), pero el `<title>` sale bien. Ignorar el aviso.
- **REST cerrada a visitantes** (`mu-plugins/lapaz-seguridad.php`): TSF no registra rutas REST ni metadatos REST (`register_rest*`, `register_meta`: ninguna coincidencia en su código) ni las usa en el front. En el panel solo usa `admin-ajax`. Con sesión de Editor el editor de bloques funcionó.
- **Caché de página (WP Super Cache):** no probado (aquí `WP_CACHE` es falso). Riesgo: que la caché guarde `/sitemap.xml`; se comprueba en staging. Las URL con `?buscar=` ya están fuera de caché.
- **`DISALLOW_FILE_MODS` en producción:** TSF no instala ni escribe archivos (no hay `file_put_contents`, `WP_Filesystem` ni `unlink` en su código). Lo que sí choca es la traducción: la instalación por wp-cli bajo `DISALLOW_FILE_MODS` no se probó (aquí vale 0). `lapaz-setup` ya instala el idioma del núcleo de la misma forma.
- **Peticiones salientes:** ninguna. Busqué `wp_remote_`, `wp_safe_remote`, `curl_`, `file_get_contents('http` y `fetch(` en todo el plugin: solo hay tres `fetch` locales de scripts de administración (funciones propias, sin red). No hay telemetría ni licencias. Los enlaces «Extensions» y la guía de 5 minutos son solo enlaces. TSF deja un aviso persistente de bienvenida en su pantalla de ajustes (solo administradores).
- **Opciones que crea:** `autodescription-site-settings`, `autodescription-site-cache`, `the_seo_framework_initial_db_version` y `the_seo_framework_upgraded_db_version`, más el transitorio del sitemap. Al desactivarlo no se borran: las quité a mano al terminar las pruebas.

## 7. Pruebas e2e que hay que cambiar (`apps/wp-fse/tests/e2e/`)

- **`seo.mjs`**
  - `routes`: títulos y descripciones se mantienen con los filtros, pero `og:title` y `twitter:title` ya no llevan «\| La Paz Sí Pasa» (`social_title_rem_additions`). Ajustar la expectativa.
  - `og:locale === 'es_CO'`: depende del punto de riesgo de abajo.
  - `robots`: una sola etiqueta (hoy puede haber dos si queda `wp_robots`).
  - `excerpt()`: reescribir. Pasa a escribir `_genesis_description` en la página y comprobar `description`, `og:description` y `twitter:description`.
  - `sitemap()`: `/sitemap.xml`, un `urlset` plano; esperar Inicio, Productores, Proyectos destacados, las entradas de boletín e historia y **no** la guía.
  - Bloque de producción: sin `noindex` en `robots` y con `max-image-preview:large`.
- **`navegacion.mjs`** (líneas 328-336): `/wp-sitemap.xml` → `/sitemap.xml`; la guía sigue en `noindex` y fuera del sitemap.
- **`boletin.mjs` (97, 195, 206) e `historia.mjs` (82, 200-210):** las comprobaciones de canónica usan `link[rel=canonical]` y siguen valiendo; añadir que hay **una** canónica y que `/boletin/` y `/historias/` apuntan a la entrada.
- **Nuevas:** (a) un Editor ve la caja en página, boletín e historia y no ve el menú «SEO» ni entra a sus ajustes; (b) un valor escrito en la caja gana al del tema (título, descripción, imagen); (c) `/productores/?buscar=cafe` tiene `noindex`; (d) un solo `<title>`, una sola `description` y una sola canónica en todas las rutas.

## 8. Riesgos

- **Dependencia de un plugin de terceros para algo central.** Mitigación: versión y suma fijadas; los valores por defecto viven en el tema, de modo que sin plugin el sitio no se rompe, solo pierde la caja.
- **`og:locale` sale `es_ES` aunque el sitio es `es_CO`** (probado local con `es_CO` activo). Se verifica en staging; si sigue, se corrige con `the_seo_framework_meta_render_data`.
- **La traducción es incompleta** (~75 %; la de `es_ES` es más completa: 784 cadenas frente a 590 de `es_CO`). Las cadenas de la caja que usé de muestra sí están traducidas. Las faltantes salen en inglés, sobre todo en los ajustes globales, que no ven los Editores.
- **Mala configuración por parte de un administrador** (marcar `noindex` en todo el sitio, redirecciones). La caja reducida y la ausencia de ajustes globales para el Editor lo limitan.
- **Sitemap en caché** (transitorio) tras cambios de código: vaciarlo en cada despliegue que lo toque.
- **El editor de bloques pliega «Cajas meta».** Hay que decirlo en el manual con una captura.
- **Actualizaciones:** con `DISALLOW_FILE_MODS` el plugin solo se actualiza subiendo versión y suma en el `Dockerfile`.

## 9. Qué probar en staging (con `WP_ENVIRONMENT_TYPE=production`)

1. `curl /` y las demás rutas: una sola `description`, una sola canónica, una sola `robots` sin `noindex`.
2. `/sitemap.xml` responde 200, no incluye la guía ni productores, y con WP Super Cache activo no queda en caché obsoleta tras publicar un boletín.
3. `robots.txt` apunta a `/sitemap.xml`.
4. La traducción `es_CO` queda instalada y la caja sale en español.
5. Un Editor real: abre una página, un boletín y una historia; cambia título, descripción e imagen con «Select Image»; guarda; el `<head>` lo refleja al recargar y con la caché de página.
6. `og:locale`, y el resultado en el depurador de Facebook/WhatsApp con una imagen WebP (en la auditoría quedó sin comprobar).
7. Tras `lapaz-importar`, los ajustes de TSF y los metadatos por entrada llegan con la base y `lapaz-setup` no pisa los ajustes.
8. Validar el JSON-LD con la prueba de resultados enriquecidos de Google.

## 10. Qué no se probó

- Guardar desde la interfaz con clics reales (los valores por entrada se probaron escribiendo los metadatos con wp-cli, que son los que TSF lee) ni el selector de la mediateca.
- Producción: `DISALLOW_FILE_MODS` real, instalación de la traducción bajo esa restricción, WP Super Cache activo con el sitemap.
- Cómo lo ven Facebook, WhatsApp, LinkedIn y X.
- Actualización de versión del plugin y desinstalación.
- Slim SEO (alternativa no instalada).
