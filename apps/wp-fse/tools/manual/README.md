# Herramientas del manual del editor

Regeneran el manual (Word y PDF) desde el texto de [`wiki/manual-editor.md`](../../../../wiki/manual-editor.md) y capturas del sitio local.

| Archivo | Qué hace |
| --- | --- |
| `generar-laminas.mjs` | Abre el sitio local con un usuario Editor temporal (`@example.org`), marca los campos con círculos numerados y guarda cada lámina (PNG, lado WordPress y lado sitio). No guarda ni publica nada. |
| `mapa-campos.json` | Qué campo de WordPress alimenta qué elemento del sitio, con los selectores de cada lámina. Es la fuente de las láminas. |
| `generar-manual.py` | Lee la wiki y las láminas, recorta las imágenes largas y escribe el `.docx` y el `.pdf` (Chrome headless). |

## Requisitos

Node (el de `apps/wp-fse`, con `npm ci` hecho), Google Chrome, Docker con el sitio local en `http://localhost:8090` **con el contenido de ejemplo cargado** (`docker compose exec -u www-data cms lapaz-setup --seed` desde `apps/wp-fse`, o el de producción con `lapaz-importar`; ver [`wiki/despliegue-fse.md`](../../../../wiki/despliegue-fse.md)) y Python con `python-docx`, `Pillow`, `numpy` y `PyMuPDF` (este último solo para revisar el PDF): `python3 -m venv .venv && .venv/bin/pip install python-docx Pillow numpy PyMuPDF`. Si Chrome no está en la ruta habitual, define `CHROME_BIN` (láminas) y `CHROME` (PDF).

El script de láminas se niega a correr si `SITE_URL` o el `home` de WordPress no son el sitio local, y se detiene con un mensaje si falta el contenido que necesita (edición `edicion-02`, historia `asocafe`, el productor «Especies Menores del Sur del Tolima» y la página `productores`).

## Regenerar (desde la raíz del repo)

```bash
node apps/wp-fse/tools/manual/generar-laminas.mjs            # láminas -> raw/manual-editor/capturas/
python3 apps/wp-fse/tools/manual/generar-manual.py           # .docx, .pdf e imagenes/ -> raw/manual-editor/
node apps/wp-fse/tools/manual/generar-laminas.mjs --limpiar  # por si acaso: el script ya borra el usuario temporal y los borradores al salir, incluso con Ctrl+C
```

`--solo=01,05` regenera solo esas láminas. Las capturas sueltas (`captura-*.png`: inicio de sesión, menú, medios, panel Publicar, páginas protegidas) se toman a mano y viven en `raw/manual-editor/capturas/`.

## Regla

Las imágenes y los documentos generados **no se suben al repo**: `raw/` está fuera de git. Antes de entregar, revisa que ninguna imagen muestre `localhost`, correos ni datos internos.
