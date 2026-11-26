# Herramientas del manual del editor

Regeneran los manuales en PDF desde el texto de [`wiki/manual-editor.md`](../../../../wiki/manual-editor.md) y capturas del sitio local.

| Archivo | Qué hace |
| --- | --- |
| `generar-laminas.mjs` | Abre el sitio local con un usuario Editor temporal (`@example.org`), marca los campos con círculos numerados y guarda cada lámina (PNG, lado WordPress y lado sitio). No guarda ni publica nada. |
| `mapa-campos.json` | Qué campo de WordPress alimenta qué elemento del sitio, con los selectores de cada lámina. Es la fuente de las láminas. En `menu`, el ítem del menú lateral de cada tipo. |
| `generar-manual.py` | Lee la wiki y las láminas, recorta las imágenes largas, las ajusta a 170 ppp en su caja impresa y escribe los `.pdf` (Chrome headless). |

## Requisitos

Node (el de `apps/wp-fse`, con `npm ci` hecho), Google Chrome, Docker con el sitio local en `http://localhost:8090` **con el contenido de ejemplo cargado** (`docker compose exec -u www-data cms lapaz-setup --seed` desde `apps/wp-fse`, o el de producción con `lapaz-importar`; ver [`wiki/despliegue-fse.md`](../../../../wiki/despliegue-fse.md)) y Python con `Pillow`, `numpy` y `PyMuPDF` (este último solo para revisar el PDF): `python3 -m venv .venv && .venv/bin/pip install Pillow numpy PyMuPDF`, y luego `.venv/bin/python` en lugar de `python3` abajo. Si Chrome no está en la ruta habitual, define `CHROME_BIN` (sirve para ambos scripts; `generar-manual.py` también acepta `CHROME`).

El script de láminas se niega a correr si `SITE_URL` o el `home` de WordPress no son el sitio local, y se detiene con un mensaje si falta el contenido que necesita (edición `edicion-02`, historia `asocafe`, el productor «Especies Menores del Sur del Tolima» y la página `productores`).

## Regenerar (desde la raíz del repo)

```bash
node apps/wp-fse/tools/manual/generar-laminas.mjs            # láminas -> raw/manual-editor/capturas/
python3 apps/wp-fse/tools/manual/generar-manual.py           # «00 - Manual general» (raw/manual-editor/), «01…10 - <tipo>» (raw/manual-editor/por-tipo/) y su copia en apps/wp-fse/manuales/
python3 apps/wp-fse/tools/manual/generar-manual.py --tipo=noticias,ferias  # solo esos tipos (boletin, historia, productores, noticias, retratos, videos, relatos-sonoros, ferias, subcuentas, paginas)
python3 apps/wp-fse/tools/manual/generar-manual.py --solo-general          # solo el manual general
python3 apps/wp-fse/tools/manual/generar-manual.py otro-texto.md --salida=/tmp/prueba  # otro texto y otra carpeta de salida (pruebas; no toca raw/manual-editor/ ni apps/wp-fse/manuales/)
node apps/wp-fse/tools/manual/generar-laminas.mjs --menu     # solo captura-02: menú lateral liso y uno por tipo con su ítem resaltado
node apps/wp-fse/tools/manual/generar-laminas.mjs --limpiar  # por si acaso: el script ya borra el usuario temporal y los borradores al salir, incluso con Ctrl+C
```

Los manuales por tipo se arman con las secciones del tipo y las comunes de `wiki/manual-editor.md`, emparejadas por título (sin el número); `TIPOS` solo dice qué sección es la del tipo y qué comunes lleva («Escribir bien y preparar fotos», «Buscadores y redes (SEO)»). Todo el texto sale del Markdown: el nombre del manual («Manual de Videos») es lo que va antes de «:» en el título de su sección y la descripción de portada, el primer párrafo de su «### Qué es y dónde aparece». Si falta una sección o ese párrafo, el script se detiene y no genera nada. Requiere `Pillow`, `numpy` y Chrome; un venv sirve: `python3 -m venv raw/.venv-manual && raw/.venv-manual/bin/pip install Pillow numpy PyMuPDF`.

`--solo=01,05` regenera solo esas láminas. `--menu` genera `captura-02-menu-lateral.png` y `captura-02-menu-lateral-<tipo>.png` (Editor temporal en `/wp-admin/`, el ratón sobre el ítem del tipo: el azul lo pinta WordPress); la sección de cada tipo (en el general y en su manual) la muestra al comienzo, tras el primer bloque de «Dónde está» o, si no hay, de «Qué es y dónde aparece», con el pie «Menú lateral de WordPress; en azul, <ítem>.». La sección 1 lleva siempre la lisa. Las demás capturas sueltas (`captura-*.png`) no las genera el script: se toman a mano, con sesión de administrador en el sitio local, y se guardan en `raw/manual-editor/capturas/`. Sin ellas `generar-manual.py` no puede armar el manual.

| Archivo | Pantalla (URL relativa) | Qué debe verse | Recorte |
| --- | --- | --- | --- |
| `captura-01-inicio-sesion.png` | `/wp-admin` (sin sesión) | Formulario de inicio de sesión de WordPress, vacío | Solo la caja del formulario |
| `captura-02-menu-lateral.png` | `/wp-admin/` con sesión de Editor (`--menu`) | Menú lateral con Boletines, Historias PaisSana, Productores y Medios | Solo la columna del menú, a escala 4 |
| `captura-02-menu-lateral-<tipo>.png` | La misma, con el ratón sobre el ítem del tipo (`--menu`) | El ítem del tipo en azul (`boletin`: Boletines, `paginas`: Páginas…) | Igual que la lisa |
| `captura-07-biblioteca-medios-campos.png` | `/wp-admin/upload.php`, clic en una imagen | Panel derecho con Texto alternativo, Leyenda de la imagen y Descripción rellenos | Ventana de detalle de la imagen |
| `captura-08-panel-publicar.png` | `/wp-admin/post-new.php?post_type=boletin` | Panel lateral Publicar con Solo guardar, Vista previa, programación y el botón Publicar | Solo el panel lateral |
| `captura-12-paginas-protegidas.png` | `/wp-admin/edit.php?post_type=page` | Lista de Páginas con Inicio, Proyectos destacados y Productores PaisSana | Solo la tabla, sin barra de administración |

Sin avisos de plugins, sin correos reales ni `localhost` visibles.

## Numeración

00 es el manual general; 01–10, los manuales por tipo en el orden del menú lateral de WordPress (sin Medios), que es también el de `TIPOS` y el de sus secciones en el general: 01 Páginas (Inicio y Proyectos destacados), 02 Noticias, 03 Retratos de la Paz, 04 Subcuentas, 05 Relatos sonoros, 06 Boletín, 07 Ferias, 08 Historia del mes, 09 Catálogo de productores, 10 Videos. El número va en el nombre del archivo, en la portada de cada manual por tipo («Manual 10 de 10»), en la lista «Manuales por tipo» del índice del general y en los enlaces de wp-admin. Si cambia el orden de `TIPOS`, cambia también el de las secciones de `wiki/manual-editor.md` y el de `LAPAZ_MANUALES` en `apps/wp-fse/mu-plugins/lapaz-manuales.php`.

## Publicación en WordPress

Cada regeneración copia los 11 PDF a `apps/wp-fse/manuales/` con el slug de `TIPOS` (`general.pdf`, `boletin.pdf`, `videos.pdf`…). Esa carpeta sí está en git: el Dockerfile la copia a `/opt/lapaz/manuales/`, fuera del docroot, y el mu-plugin `lapaz-manuales.php` la sirve por `admin-post.php?action=lapaz_manual&manual=<slug>` solo a quien puede editar (sin sesión, al inicio de sesión). En wp-admin cada tipo muestra la caja lateral «Ayuda» al editar y un aviso fijo en su listado.

Para actualizarlos: regenerar, revisar los PDF, hacer commit de `apps/wp-fse/manuales/` y desplegar (la imagen nueva trae los PDF).

## Regla

Las imágenes y los documentos generados **no se suben al repo**: `raw/` está fuera de git. La única excepción son los 11 PDF de `apps/wp-fse/manuales/` (públicos en GitHub, aceptado), sin videos, imágenes sueltas ni `.docx`. Antes de entregar, revisa que ninguna imagen muestre `localhost`, correos ni datos internos.
