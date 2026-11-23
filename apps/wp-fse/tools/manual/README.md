# Herramientas del manual del editor

Regeneran el manual (Word y PDF) desde el texto de [`wiki/manual-editor.md`](../../../../wiki/manual-editor.md) y capturas del sitio local.

| Archivo | Qué hace |
| --- | --- |
| `generar-laminas.mjs` | Abre el sitio local con un usuario Editor temporal (`@example.org`), marca los campos con círculos numerados y guarda cada lámina (PNG, lado WordPress y lado sitio). No guarda ni publica nada. |
| `mapa-campos.json` | Qué campo de WordPress alimenta qué elemento del sitio, con los selectores de cada lámina. Es la fuente de las láminas. |
| `generar-manual.py` | Lee la wiki y las láminas, recorta las imágenes largas y escribe el `.docx` y el `.pdf` (Chrome headless). |

## Requisitos

Node (el de `apps/wp-fse`, con `npm ci` hecho), Google Chrome, Docker con el sitio local en `http://localhost:8090` **con el contenido de ejemplo cargado** (`docker compose exec -u www-data cms lapaz-setup --seed` desde `apps/wp-fse`, o el de producción con `lapaz-importar`; ver [`wiki/despliegue-fse.md`](../../../../wiki/despliegue-fse.md)) y Python con `python-docx`, `Pillow`, `numpy` y `PyMuPDF` (este último solo para revisar el PDF): `python3 -m venv .venv && .venv/bin/pip install python-docx Pillow numpy PyMuPDF`, y luego `.venv/bin/python` en lugar de `python3` abajo. Si Chrome no está en la ruta habitual, define `CHROME_BIN` (sirve para ambos scripts; `generar-manual.py` también acepta `CHROME`).

El script de láminas se niega a correr si `SITE_URL` o el `home` de WordPress no son el sitio local, y se detiene con un mensaje si falta el contenido que necesita (edición `edicion-02`, historia `asocafe`, el productor «Especies Menores del Sur del Tolima» y la página `productores`).

## Regenerar (desde la raíz del repo)

```bash
node apps/wp-fse/tools/manual/generar-laminas.mjs            # láminas -> raw/manual-editor/capturas/
python3 apps/wp-fse/tools/manual/generar-manual.py           # manual general (raw/manual-editor/) y uno por tipo (raw/manual-editor/por-tipo/), .docx y .pdf
python3 apps/wp-fse/tools/manual/generar-manual.py --tipo=noticias,ferias  # solo esos tipos (boletin, historia, productores, noticias, retratos, videos, relatos-sonoros, ferias, subcuentas, paginas)
python3 apps/wp-fse/tools/manual/generar-manual.py --solo-general          # solo el manual general
node apps/wp-fse/tools/manual/generar-laminas.mjs --limpiar  # por si acaso: el script ya borra el usuario temporal y los borradores al salir, incluso con Ctrl+C
```

Los manuales por tipo se arman con las secciones del tipo y las comunes de `wiki/manual-editor.md`, emparejadas por título (sin el número); si falta alguna, el script se detiene y no genera nada. Requiere `python-docx`, `Pillow`, `numpy` y Chrome; un venv sirve: `python3 -m venv raw/.venv-manual && raw/.venv-manual/bin/pip install python-docx Pillow numpy PyMuPDF`.

`--solo=01,05` regenera solo esas láminas. Las capturas sueltas (`captura-*.png`) no las genera el script: se toman a mano, con sesión de administrador en el sitio local, y se guardan en `raw/manual-editor/capturas/`. Sin ellas `generar-manual.py` no puede armar el manual.

| Archivo | Pantalla (URL relativa) | Qué debe verse | Recorte |
| --- | --- | --- | --- |
| `captura-01-inicio-sesion.png` | `/wp-admin` (sin sesión) | Formulario de inicio de sesión de WordPress, vacío | Solo la caja del formulario |
| `captura-02-menu-lateral.png` | `/wp-admin/` con sesión | Menú lateral con Boletines, Historias PaisSana, Productores y Medios | Solo la columna del menú |
| `captura-07-biblioteca-medios-campos.png` | `/wp-admin/upload.php`, clic en una imagen | Panel derecho con Texto alternativo, Leyenda de la imagen y Descripción rellenos | Ventana de detalle de la imagen |
| `captura-08-panel-publicar.png` | `/wp-admin/post-new.php?post_type=boletin` | Panel lateral Publicar con Solo guardar, Vista previa, programación y el botón Publicar | Solo el panel lateral |
| `captura-12-paginas-protegidas.png` | `/wp-admin/edit.php?post_type=page` | Lista de Páginas con Inicio, Proyectos destacados y Productores PaisSana | Solo la tabla, sin barra de administración |

Sin avisos de plugins, sin correos reales ni `localhost` visibles.

## Regla

Las imágenes y los documentos generados **no se suben al repo**: `raw/` está fuera de git. Antes de entregar, revisa que ninguna imagen muestre `localhost`, correos ni datos internos.
