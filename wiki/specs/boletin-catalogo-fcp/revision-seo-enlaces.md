# Revisión R2: SEO, URLs y enlaces

Auditoría de solo lectura sobre `http://localhost:8090` (WordPress 7.1, tema `lapaz`, rama `feat/boletin-catalogo-fcp`), 2026-11-20. No se modificó código. Todo lo que dice «local» se midió en vivo; lo que dice «producción» se deduce del código (ver sección 6).

> **Estado al 2026-11-20 (nota añadida; el cuerpo es la auditoría del día y no se reescribió).**
>
> - **Rutas:** `/paissana/` es hoy `/productores/`, y `/paissana/historias/…` es `/historias/…` ([ajuste de navegación](../../navegacion.md#ajuste-del-2026-11-20-url-propias-para-productores-e-historias)).
> - **Resuelto:**
>   - Hallazgo 5, botones con `href="#"`: no queda ninguno. Los programas son elementos deshabilitados (`2d5d049`).
>   - Hallazgo 7, catálogo huérfano: mitigado. Hay accesos desde Inicio y Proyectos destacados (`872a85a`, `8347916`). El menú sigue con cuatro elementos.
>   - Hallazgo 8, redirección del menú: «Proyectos destacados» es un enlace de página, así que no hay 301 (`2d5d049`). `lapaz-setup` migra el menú de fábrica.
>   - La API REST: productores, taxonomías, boletines e historias fuera de REST (`3b2941d`).
> - **Abierto, verificado en código:** hallazgo 3, no hay datos estructurados (JSON-LD) en el tema.
> - **Abierto o sin verificar (TODO: confirmar en staging):** hallazgos 1, 2 y 10 (descripciones y títulos de `/productores/` y de las historias; `seo.php` cambió en `1e799ea`), 13 (salto de h1 a h3 en Proyectos destacados), 14 (espacio en el texto plano del h1 de la portada), 15 (texto del enlace del banner de noticias) y 16 (rendimiento).
> - **Decisiones D1 a D7:** siguen sin respuesta de William. Se listan en [pendiente de decisión](revisiones-independientes.md#pendiente-de-decisión-o-de-acceso-al-servidor).

## 1. Resumen

1. La base es sólida: títulos únicos y de buena longitud en las páginas con contenido propio, un solo `<h1>` por página, `lang="es-CO"`, OG/Twitter completos con dimensiones, canónicas absolutas, sitemap limpio (solo `page`, `boletin`, `historia`; sin usuarios, taxonomías, adjuntos ni guía) y todo lo que no debe existir (`/productor/…`, `/historia/`, `/paissana/historias/`, autores, feeds) da 404 o 301.
2. La carencia mayor es de contenido SEO: `/paissana/`, la guía y el resto de páginas sin extracto heredan la **misma descripción genérica de la portada**; `/paissana/` y la historia tienen títulos muy cortos; no hay **ningún dato estructurado** (JSON-LD) en todo el sitio.
3. Hay URL «fantasma» que en producción serían indexables: `/category/uncategorized/` (200, título en inglés), `/page/2/` (200, canónica rota `/2/`), `/?post_type=historia` (200).
4. Enlaces: dos botones con `href="#"` en `/proyectos-destacados/`, tres noticias de portada apuntan a `https://example.com/ejemplo-N` (404), y el menú enlaza `/proyectos-destacados` sin barra (301 en cada página). `/paissana/` no está en el menú ni en la portada: solo se llega desde `/proyectos-destacados/`.
5. Los filtros del catálogo ya declaran canónica `/paissana/` (lo hace el core); falta decidir si `?buscar=` lleva además `noindex` y si los departamentos merecen URL indexable propia (sección 5).

## 2. Tabla por página (local; «prod» = qué cambia al pasar a producción)

Leyenda: ✔ correcto, ✘ falla o mejorable. En todas, `robots` local = `noindex, nofollow` (por `lapaz_noindex_fuera_de_produccion`); en producción saldría `max-image-preview:large` salvo donde se indica.

| Página | Título (largo) | Descripción (largo, origen) | Canónica | Robots en prod | OG / Twitter | h1 |
|---|---|---|---|---|---|---|
| `/` | ✔ «La Paz Sí Pasa \| Fondo Colombia en Paz» (38) | ✔ 156, texto por defecto de `seo.php` | ✔ `/` | indexa | ✔ og.jpg 1200x630, alt | ✔ 1 |
| `/proyectos-destacados/` | ✔ «PaisSana, proyectos destacados \| La Paz Sí Pasa» (47) | ✔ 155, rama propia en `seo.php:85` | ✔ | indexa | ✔ (imagen genérica) | ✔ 1; salta de h1 a h3 |
| `/boletin/` | ✔ «Caminos de Transformación, Edición 02 \| La Paz Sí Pasa» (54) | ✔ 166 (`portada_sumario`; un poco largo) | ✔ apunta a `/boletin/edicion-02/` | indexa; ver hallazgo 11 | ✔ imagen portada 783x1024; ✘ `og:type=website` | ✔ 1 |
| `/boletin/edicion-02/` | ✔ igual | ✔ igual | ✔ propia | indexa | ✔ igual; ✘ `og:type=website` | ✔ 1 |
| `/paissana/` | ✘ «PaisSana \| La Paz Sí Pasa» (25, sin gancho) | ✘ copia de la portada | ✔ `/paissana/` | indexa | ✘ imagen y descripción genéricas | ✔ 1 |
| `/paissana/?departamento=cauca` | ✘ igual que `/paissana/` | ✘ igual | ✔ `/paissana/` | indexa si Google lo ignora | ✘ `og:url` = `/paissana/` | ✔ 1 |
| `/paissana/?buscar=cafe` | ✘ igual | ✘ igual | ✔ `/paissana/` | ídem | ídem | ✔ 1 |
| `/paissana/?categoria[]=moda&ver=72` | ✘ igual | ✘ igual | ✔ `/paissana/` | ídem | ídem | ✔ 1 |
| `/paissana/historias/asocafe/` | ✘ «Asocafé \| La Paz Sí Pasa» (24) | ✘ 228, se corta en buscadores (campo `resumen`) | ✔ propia | indexa | ✔ foto 1024x483, `og:type=article`; ✘ sin `article:published_time` | ✔ 1 |
| `/guia-de-estilos/` | ✔ | n/a (copia genérica) | ✔ | `noindex, nofollow` y fuera del sitemap (`guia-estilos.php:277`) | n/a | ✔ 1 |
| 404 (`/nada-aqui/`) | ✔ «Página no encontrada \| …» | ✔ propia | sin canónica (correcto) | 404; ver hallazgo 12 | `og:url` = portada (menor) | ✔ 1 |

Imágenes: ninguna sin atributo `alt`; las de adorno llevan `alt=""` (correcto). Dimensiones `width/height` presentes salvo `hero-logo.svg` (sin `height`) y un `<img alt="">` vacío de la lightbox del catálogo/historia.

## 3. Hallazgos

### Bloqueantes
Ninguno. Nada impide indexar ni rastrear el sitio correcto en producción.

### Importantes

**1. Páginas sin descripción propia heredan la de la portada.**
Evidencia: `/paissana/` y sus filtros, y `/guia-de-estilos/` devuelven la descripción «El Fondo Colombia en Paz ejecuta los recursos para implementar la paz…» (la de `/`). `/paissana/` es una página que se quiere posicionar.
Causa: `inc/seo.php:69-95`, el último `return` es el texto de la portada y `/paissana/` no tiene rama ni extracto.
Corrección: escribir el **extracto** de la página `paissana` en WordPress (el soporte de extracto en páginas ya existe, `seo.php:19`), por ejemplo «Catálogo de 316 productores de territorios PDET: busca por departamento, categoría o producto y conoce sus historias.» (≈150 caracteres). Si prefieres que sea código, añadir una rama `is_page('paissana')` como la de `proyectos-destacados`. Como el número de productores cambia, mejor el extracto sin cifra o con ella en el editor.

**2. Títulos demasiado pobres en `/paissana/` y en la historia.**
Evidencia: «PaisSana | La Paz Sí Pasa» (25) y «Asocafé | La Paz Sí Pasa» (24); no dicen qué es la página. Los filtros comparten el título.
Causa: `seo.php:38-56` solo reescribe título de portada, 404, proyectos y boletín; el resto usa el título de la página/entrada.
Corrección: título SEO de la historia = H1 recortado o «Asocafé: un café que cambió la historia de la serranía \| La Paz Sí Pasa» (usar el campo del titular que ya pinta el `<h1>`); `/paissana/` = «PaisSana: catálogo de productores de los territorios PDET \| La Paz Sí Pasa» (60). Rama nueva en `lapaz_document_title_parts`.

**3. No hay datos estructurados en ninguna página.**
Evidencia: 0 bloques `application/ld+json`.
Propuesta (no implementada), un `lapaz_print_jsonld()` en `wp_head` junto a `lapaz_print_meta`:
- Portada: `Organization` (nombre «Fondo Colombia en Paz», `url`, `logo`, `sameAs` con Instagram y X que ya están en el pie) y `WebSite` (sin `SearchAction`: el sitio no tiene buscador propio indexable).
- Historia: `NewsArticle` (`headline`, `image`, `datePublished`/`dateModified` desde el post, `author` y `publisher` = `Organization`, `mainEntityOfPage`) + `BreadcrumbList` Inicio > PaisSana > historia.
- Edición del boletín (y `/boletin/` apuntando a la edición): `NewsArticle` con la portada y `BreadcrumbList` Inicio > Boletín > Edición 02.
- `/paissana/`: `BreadcrumbList` Inicio > PaisSana. No marcar productores individuales (no tienen URL propia).
Requisito previo: migas visibles (hoy solo hay «← Volver al catálogo» en la historia), porque Google pide que el marcado refleje lo visible. Ver decisión D3.

**4. URL que en producción serían indexables y no deberían existir.**
Evidencia (local, todas 200; sin el `noindex` local serían indexables):
- `/category/uncategorized/` → 200, título «Uncategorized \| La Paz Sí Pasa» (inglés). También `/?cat=1` redirige ahí.
- `/page/2/` y `/page/2/?paged=2` → 200 con **canónica `http://localhost:8090/2/`** (URL que no existe); `/?paged=2` redirige a `/page/2/?paged=2`.
- `/?post_type=historia` → 200, título «La Paz Sí Pasa» sin canónica útil.
- `/?post_type=productor` y `/?departamento=cauca` → 200 con la portada (canónica `/`; correcto, es duplicado inocuo).
Causa: las Entradas y su taxonomía siguen registradas (`post` es `publicly_queryable`; `category` y `post_tag` públicas); `lapaz-limpieza.php` solo quita el menú del admin, no las URL públicas.
Corrección mínima en `lapaz-limpieza.php` (hook `template_redirect` prioridad 1): si `is_category() || is_tag() || is_date() || is_paged() || is_post_type_archive('historia')` (y `is_home()` con `paged`), devolver 404 con `$GLOBALS['wp_query']->set_404(); status_header(404); nocache_headers();` (mismo patrón que `lapaz_sin_archivos_de_autor` en `lapaz-seguridad.php:50`, pero 404 en vez de 301 a portada porque no existen). Las URL con `?historia=asocafe` y `?boletin=edicion-02` (200 con canónica correcta) pueden dejarse: no se enlazan.

**5. Botones con `href="#"` en `/proyectos-destacados/`.**
Evidencia: «PROGRAMA COLOMBIA SOSTENIBLE» y «PROGRAMA PILOTO DE INVERSIONES PRIORITARIAS» → `#` (suben al inicio de página, mala experiencia y señal de enlace roto).
Causa: `blocks/paisana-hero/render.php:26-27` (puerto de Astro con el destino pendiente).
Corrección: poner la URL real (pregunta pendiente D5); mientras no exista, convertir los `<a>` en `<span class="btn-project …" aria-disabled="true">` o quitarlos. Nunca `#`.

**6. Noticias de portada con enlaces de ejemplo.**
Evidencia: la portada enlaza `https://example.com/ejemplo-0`, `-1`, `-2` («El fondo entrega resultados de gestión», «Nuevos proyectos en territorios PDET», «Balance de Colombia Sostenible»), los tres 404 y con `target="_blank"`.
Causa: datos semilla del CPT `noticia` (carga de `lapaz-setup --seed`), no el código del tema. No pude comprobar si la base de producción importada trae noticias reales.
Corrección: tras `lapaz-importar`, verificar los enlaces de `noticia` en producción; si siguen siendo de ejemplo, reemplazar o despublicar antes de abrir al público.

**7. `/paissana/` es casi huérfana y la historia depende de un solo enlace.**
Evidencia (crawler de 8 páginas): `/paissana/` recibe enlaces solo de `/proyectos-destacados/` (botón «PAISSANA») y de la historia («← Volver al catálogo»); no está en el menú ni en la portada ni en el pie. La historia `/paissana/historias/asocafe/` solo recibe el enlace «Ver la historia completa →» de `/paissana/`. Hoy hay una sola historia; cuando haya más, ¿cómo se descubren?
Causa: menú `wp_navigation` ID 6 (generado en `apps/wp-fse/docker/lapaz-setup:82-94`) solo tiene 4 enlaces.
Corrección: añadir «PaisSana» al menú (una línea más en `lapaz-setup`; en producción, editar el menú) y decidir D2 sobre un listado de historias.

### Menores

**8. Menú con URL sin barra final: 301 en cada página.** `/proyectos-destacados` → 301 → `/proyectos-destacados/` (aparece en las 8 páginas rastreadas). Causa: `lapaz-setup:83` guarda `"url":"/proyectos-destacados"`; corregir a `/proyectos-destacados/` en el script y en el menú de producción. Coste: un salto por clic y señales de enlaces internos diluidas.

**9. Meta de Open Graph incompleta.**
`og:type` es `website` para la edición del boletín (debería ser `article`, como ya hace la historia, `seo.php:112`); faltan `article:published_time`/`modified_time` en historia y boletín, `og:image:type` y `twitter:site`. La imagen del boletín es vertical (783x1024) con `summary_large_image` (2:1): se recortará; valorar una imagen 1200x630 por edición. Las imágenes subidas son WebP: no pude comprobar cómo las toman LinkedIn/WhatsApp (ver sección 6).

**10. Descripción de la historia: 228 caracteres.** Se corta (~155-160). Causa: `seo.php:78-83` usa `resumen` completo. Recortar a 155 con `wp_trim_words`/`mb_strimwidth` o pedir un resumen corto en el editor. El del boletín (166) es aceptable.

**11. `/boletin/` duplica el contenido de la última edición.** Resuelto correctamente con canónica a la edición (`seo.php:156-162`; una sola etiqueta canonical, comprobado). Pero cualquier `?x=` en `/boletin/` también declara esa canónica (bien). Consecuencia: la edición actual en el sitemap es la única URL que se posiciona; `/boletin/` no está en el sitemap (correcto). La URL `/boletin/edicion-02/` no recibe ningún enlace interno (el menú y la portada apuntan a `/boletin/`); no es problema mientras la canónica y el sitemap la señalen. Cuando haya ediciones antiguas, `lapaz_boletin_anteriores()` las listará dentro de la edición actual (ya existe; revisar que usen URL con barra).

**12. Página 404.** Estado 404 correcto, h1 y descripción propios. Menor: `og:url` apunta a la portada (`seo.php:99`, `$url` por defecto) y `og:type=website`; no afecta al indexado.

**13. Salto de encabezados en `/proyectos-destacados/`.** h1 → h3 («Datos relevantes:», «Beneficios…») antes del primer h2 (`blocks/paisana-hero`). En la portada el h4 «Ver más:» cuelga de un h3. Cosmético para SEO, pero accesibilidad lo penaliza.

**14. `<h1>` de la portada sin espacio al extraer texto.** `blocks/retratos/render.php:24` pinta `La Paz Sí Pasa,<br />pasa en los territorios`; el texto plano es «La Paz Sí Pasa,pasa…». Añadir un espacio tras la coma (`'La Paz Sí Pasa, '`) para que herramientas y lectores concatenen bien.

**15. Texto de enlace débil.** `alt` del banner de noticias de la portada: «Más noticias del fondo aquí (abre en una pestaña nueva)» (el enlace solo contiene la imagen); mejor «Más noticias del Fondo Colombia en Paz en fcp.gov.co». «Ver esta edición ↓» (ancla a `#indice`, correcto pero genérico) y «Ver más productores» son aceptables por contexto. Ningún «clic aquí».

**16. Rendimiento con impacto SEO (lo evidente).**
- ✔ Imagen LCP del hero con `loading="eager"` + `fetchpriority="high"` + `<link rel="preload" as="image" imagesrcset>` (portada, `/proyectos-destacados/`, `/paissana/`, historia). En el boletín la portada va `eager` + `fetchpriority`. El resto `loading="lazy"` (57 de 61 en portada). Los `fetchpriority="auto"` son el valor por defecto de WordPress, inocuos.
- ✔ Una sola fuente precargada (`Komet_Light.woff2`), `font-display: swap`.
- ✘ **CSS en línea de 75-96 KB por página** (sin hojas externas cacheables) y `/proyectos-destacados/` pesa 287 KB de HTML con 152 imágenes. Es lo que genera el pipeline de bloques; medir en Lighthouse antes de actuar.
- ✘ `hero-logo.svg` sin `height` (menor, posible CLS mínimo).
- JS: solo `navigation.js` + el módulo de navegación del core en todas las páginas, más el `view.js` del bloque de cada página: no hay scripts cargados donde no hacen falta.

## 4. Enlaces rotos, vacíos y huérfanos

Crawler propio sobre 8 páginas (202 `<a>`, 39 destinos distintos). Salida bruta en el scratchpad de la sesión.

| Tipo | Página origen | Enlace / texto | Resultado |
|---|---|---|---|
| Roto (404) | `/` | `https://example.com/ejemplo-0` «El fondo entrega resultados de gestión» | 404 (semilla, hallazgo 6) |
| Roto (404) | `/` | `https://example.com/ejemplo-1` «Nuevos proyectos en territorios PDET» | 404 |
| Roto (404) | `/` | `https://example.com/ejemplo-2` «Balance de Colombia Sostenible» | 404 |
| Vacío `#` | `/proyectos-destacados/` | «PROGRAMA COLOMBIA SOSTENIBLE» | `#` (`paisana-hero/render.php:26`) |
| Vacío `#` | `/proyectos-destacados/` | «PROGRAMA PILOTO DE INVERSIONES PRIORITARIAS» | `#` (`render.php:27`) |
| Redirección | todas | menú «Proyectos destacados» `/proyectos-destacados` | 301 → con barra (hallazgo 8) |
| Redirección externa | todas | pie `https://www.fcp.gov.co` | 301 (a su destino; actualizar a la URL final, menor) |
| Ancla inexistente | ninguna | los `#indice`, `#seccion-1…8`, `#explorar`, `#lo-que-hacemos`, `#actualidad`, `#escucha-el-corazon-del-campo`, `#paissana-en-ferias`, `#productores-paissana` existen en su destino | ✔ |
| Enlace externo con `_blank` sin `rel` | ninguna | todos llevan `noopener` (el del banner sin `noreferrer`: irrelevante) | ✔ |
| Huérfana (casi) | `/paissana/` | solo desde `/proyectos-destacados/` y la historia; no en menú ni portada | hallazgo 7 |
| Huérfana (casi) | `/paissana/historias/asocafe/` | solo desde `/paissana/` | hallazgo 7 |
| Sin enlace interno | `/boletin/edicion-02/` | nadie la enlaza (el menú va a `/boletin/`); está en el sitemap | aceptable por la canónica |
| Sin enlace entrante | `/guia-de-estilos/` | ninguno (intencional, `noindex`) | ✔ |

`/privacy-policy/` está en borrador (404): si el pie o algún formulario debe enlazar una política de datos, no existe aún (pregunta D6).

## 5. Decisiones para William

**D1. Qué hacer con los filtros del catálogo.** Hoy `?departamento=`, `?categoria[]=`, `?buscar=` y `?ver=` devuelven 200 con título, descripción y canónica de `/paissana/` (el core usa `get_permalink`, que descarta la query; verificado en las cuatro URL). Mi recomendación:
- Mantener la **canónica a `/paissana/`** para `departamento`, `categoria` y `ver` (son cortes del mismo catálogo; indexarlos generaría ~25 páginas casi iguales con título idéntico).
- Añadir **`noindex, follow` solo a `?buscar=`** y a cualquier resultado vacío («No hay productores que coincidan», hoy 200): son URL infinitas generadas por el usuario, algunas «soft 404». Se hace en el filtro `wp_robots` (sitio: `inc/seo.php` o `inc/catalogo.php`) con `isset($_GET['buscar'])`. Nota: Google desaconseja mezclar `noindex` con una canónica a otra URL; por eso solo se aplica a la búsqueda y no a los demás filtros.
- Alternativa más ambiciosa: dar a **cada departamento** una URL indexable (autocanónica, título «Productores de Cauca \| PaisSana», descripción y h1 propios). Es la única forma de ganar tráfico por «productores de Cauca», pero exige contenido único por departamento. No lo haría sin ese contenido.
- Los enlaces de filtro llevan `#explorar`; no afecta (los buscadores ignoran el fragmento).

**D2. ¿Listado de historias en `/paissana/historias/`?** Hoy 404, correcto mientras haya una. Con más de una, la única vía de descubrimiento sería la tarjeta destacada de `/paissana/`. Recomendación: no crear el listado ahora (YAGNI); sí asegurar que cada historia nueva entre al sitemap (ya lo hace) y se enlace desde `/paissana/`. Si se crea, que sea una página real con `h1`, canónica propia y paginación con enlaces, no un archivo de tipo de contenido.

**D3. Datos estructurados.** ¿Se aprueba el paquete de la propuesta del hallazgo 3 (Organization/WebSite en portada, NewsArticle + BreadcrumbList en historia y boletín)? Implica migas visibles; mi sugerencia es hacerlo en un PR aparte y probarlo con la herramienta de resultados enriquecidos de Google en producción.

**D4. Extractos y títulos.** Quién redacta y mantiene las descripciones de `/paissana/`, la historia y las futuras historias (texto ≤155 caracteres), y el título SEO de la historia (hallazgos 1, 2 y 10).

**D5. Destinos de los programas.** ¿Qué URL reciben «Programa Colombia Sostenible» y «Programa piloto de inversiones prioritarias»? Si no existen, ¿se ocultan los botones?

**D6. Página de política de datos.** `privacy-policy` está en borrador. ¿Se publica o se elimina? (Si el sitio recoge datos, hace falta; hoy no hay formularios.)

**D7. URL fantasma de entradas (hallazgo 4).** Aprobar que `category`, `tag`, fechas, `page/N` y `?post_type=historia` devuelvan 404.

## 6. Qué no pude comprobar

- **Producción real.** No probé `lapazsipasa.com` ni un stack con `WP_ENVIRONMENT_TYPE=production`. Por código: `lapaz_noindex_fuera_de_produccion` (`seo.php:224-232`) añade `noindex, nofollow` en todo entorno distinto de `production` (local y el staging de Dokploy, `WP_ENVIRONMENT_TYPE=staging`, según `wiki/despliegue-fse.md`). En `production` se quita y quedan las directivas del core: páginas indexables = `max-image-preview:large`; búsqueda `/?s=` = `noindex, follow` (en local sale contradictorio, `noindex, follow … nofollow`, solo por el filtro local); guía `noindex, nofollow` y fuera del sitemap por `lapaz_guia_noindex` (`guia-estilos.php:277`), que no depende del entorno; 404 = estado 404 sin directiva (el core no añade `noindex` a 404). Existe una prueba `apps/wp-fse/tests/e2e/seo.mjs` que levanta un stack de producción efímero y comprueba la ausencia de `noindex`; no la ejecuté.
- **`robots.txt`** local: `Disallow: /wp-admin/`, `Allow: admin-ajax.php` y `Sitemap: http://localhost:8090/wp-sitemap.xml` (referencia presente). En producción la URL sale de `home_url()`, es decir de `WORDPRESS_URL`: confirmar que sea `https://lapazsipasa.com`. `blog_public` es `1` en local; si en producción fuera `0`, el core serviría `Disallow: /`.
- **Redirecciones http→https, `www`→apex y mayúsculas** (dependen de Traefik/Dokploy). Local: `/Boletin/` y `/BOLETIN/EDICION-02/` dan 404 (WordPress no normaliza mayúsculas); `index.php`, sin barra final y `?p=ID` redirigen bien (301).
- **Existencia de la página guía en producción:** el seed la crea en local; no verifiqué si la importación de producción la trae (si no, `/guia-de-estilos/` sería 404 allí).
- **Datos reales de producción** (noticias, más ediciones/historias, imágenes de portada): trabajé con el contenido local (1 edición, 1 historia, 316 productores).
- **Cómo muestran las vistas previas** LinkedIn/WhatsApp/X las imágenes WebP de OG y el recorte de la portada vertical.
- **Lighthouse/CrUX y Core Web Vitals:** solo revisé marcado (atributos de imagen, precargas, tamaño del HTML), no medí tiempos.
- **Enlaces externos:** solo estado HTTP; no verifiqué que `fcp.gov.co/sala-de-prensa/`, Instagram y X sigan activos más allá de responder sin 4xx/5xx.
