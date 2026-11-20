# Carga inicial del contenido del micrositio

`contenido.json` tiene transcrito el contenido de las hojas «Home -Galeria» y
«PAISSANA» del Excel del cliente; `media/` trae las fotos y los audios ya
comprimidos para web. `seed.php` lo carga en los CPT.

Son 54 entradas: 15 `retrato`, 9 `video`, 15 `feria` y 15 `audio_relato`.

Para el boletín, el catálogo y las historias (sitio FSE) hay tres secciones más,
con su propio JSON: 316 `productor`, 1 `boletin` (edición 02) y 1 `historia`
(Asocafé).

Es idempotente: busca cada entrada por título y post_type y la actualiza en vez
de duplicarla, y reconoce los medios por nombre de archivo. Se puede correr las
veces que haga falta.

## Secciones del sitio FSE

Cada sección se corre sola con `SEED_SOLO=<sección>` (sin la variable corre todo)
y se puede repetir: busca por título y reutiliza los medios por nombre de archivo.

```bash
docker compose -f apps/wp-fse/compose.yaml -p lapaz-fse exec -T -u www-data cms \
  sh -c 'SEED_SOLO=productores wp eval-file /opt/seed/seed.php'   # o boletines, historias
```

| Sección | Archivo | Qué carga |
|---|---|---|
| `productores` | `productores.json` | 316 productores con sus 5 taxonomías (crea los términos que falten), `municipio`, `productos` y `enlace`. Si existe `lapaz_catalogo_indexar()` (mu-plugin `lapaz-catalogo`) la llama para generar el texto de búsqueda. |
| `boletines` | `boletin-02.json` | Edición 02: campos de edición y portada y las 8 filas de `secciones`. |
| `historias` | `historia-asocafe.json` | Historia de Asocafé: presentación, portada, ficha, video (sin fuente todavía), crónica y galería de 12 fotos. |

`productores.json` sale de `raw/Catalogo PaisSana Asocafe/productores.json` (los
índices pasan a texto; etnia «Ninguno», tiempo vacío y población «Ninguno de los
Anteriores» no generan término). Las etiquetas de departamento, etnia, tiempo y
población son las del prototipo (`const DATOS` de su `index.html`), que tiene las
tildes que el JSON compacto no trae.

En los JSON de boletín e historia, cada imagen es `{ "archivo": "boletin/x.jpg",
"alt": "…" }` (ruta relativa a `media/`) y el seed la cambia por el ID del adjunto
a cualquier profundidad. En la galería, `pie` va a la leyenda del adjunto y
`credito` a su descripción. `cuerpo` es HTML del editor. El texto es el del
prototipo, íntegro.

Fotos en `media/boletin/` (10) y `media/paissana/` (12).

## Local

```bash
docker compose run --rm --user 33 wpcli wp eval-file /opt/seed/seed.php
```

El `--user 33` no es opcional: la imagen `wpcli` es Alpine y ahí `www-data` es
uid 82, pero la de WordPress es Debian y usa uid 33, que es quien posee
`wp-content/uploads`. Sin eso, cada subida falla con «no se ha podido escribir».

## Sitio FSE (producción desde 2026-11-09)

El sitio de producción es el FSE (`apps/wp-fse/`). Su carga inicial y su operación están en [despliegue-fse.md](../../../wiki/despliegue-fse.md). Resumen:

- Instalación nueva: `su www-data -s /bin/bash -c 'lapaz-setup --seed'` carga todas las secciones.
- Sitio ya en uso: no usar `--seed`. Cargar solo lo nuevo, una sección por comando: `SEED_SOLO=productores`, `SEED_SOLO=boletines`, `SEED_SOLO=historias` (con `wp --path=/var/www/html eval-file /opt/seed/seed.php`). Las secciones de portada, videos y ferias se actualizan por título y pisan los cambios del editor.
- Lista de secciones: [arriba, en «Secciones del sitio FSE»](#secciones-del-sitio-fse).

## Headless de respaldo (Dokploy, servidor viejo)

Solo aplica al headless (`compose.prod.yaml`), que sigue en el servidor viejo como respaldo.

Prerrequisito: **Secure Custom Fields tiene que estar instalado y activo**. Es un
plugin, no vive en el repo, y sin él no se registra ningún CPT — el sitio queda
con los tipos nativos de WordPress y nada más. Se instala desde
`wp-admin` → Plugins → Añadir nuevo → «Secure Custom Fields».

Después, un solo comando dentro del contenedor `cms` (no hace falta wp-cli ni
instalar nada; el `su` es para que los archivos queden de www-data y no de root):

```bash
su -s /bin/sh www-data -c 'php /opt/seed/seed.php'
```

Se puede lanzar desde la terminal de Dokploy sobre el servicio `cms`, o como
Schedule de tipo compose apuntando a ese servicio.

También existe el servicio `wpcli` bajo el perfil `tools`, que no se levanta en
los despliegues normales, por si hace falta wp-cli para otra cosa:

```bash
docker compose -f compose.prod.yaml run --rm --user 33 wpcli wp <comando>
```

Para comprobar:

```bash
curl -s https://cms.<dominio>/wp-json/wp/v2/feria?per_page=1
```

## Qué queda incompleto

- `feria.galeria` vacía en las 15: las fotos no tienen enlace en SharePoint.
- `audio_relato.subtitulos` vacío en los 15: la transcripción no está en el Excel.
- Las ferias con varios shorts (Agroexpo, Cafés de Colombia, Chocoshow, Carnaval,
  ANATO) solo tienen el primero; el CPT acepta un video.
