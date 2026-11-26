#!/usr/bin/env python3
# Regenera los manuales del editor (.pdf + imagenes/) desde wiki/manual-editor.md y las láminas PNG:
# el manual general y un manual por tipo de contenido (raw/manual-editor/por-tipo/).
# Uso (desde la raíz del repo): python3 apps/wp-fse/tools/manual/generar-manual.py [texto.md] [carpeta-capturas] [--tipo=noticias,ferias | --solo-general] [--salida=carpeta]
# Requiere Pillow, numpy y Google Chrome (el PDF se imprime con Chrome headless).
# Por defecto: texto wiki/manual-editor.md, láminas raw/manual-editor/capturas/, salidas en raw/manual-editor/ (fuera de git)
# y una copia de cada PDF en apps/wp-fse/manuales/<slug>.pdf (versionada: la imagen de WordPress la sirve en wp-admin).
import argparse, html, json, math, os, re, shutil, subprocess, sys, tempfile, unicodedata
from pathlib import Path
import numpy as np
from PIL import Image

REPO = Path(__file__).resolve().parents[4]
SALIDA = REPO / "raw" / "manual-editor"
ap = argparse.ArgumentParser()
ap.add_argument("texto", nargs="?", default=REPO / "wiki" / "manual-editor.md")
ap.add_argument("capturas", nargs="?", default=SALIDA / "capturas")
ap.add_argument("--tipo", help="solo estos manuales por tipo, separados por coma (sin el general)")
ap.add_argument("--solo-general", action="store_true", help="solo el manual general")
ap.add_argument("--salida", help="carpeta de salida (por defecto raw/manual-editor/), útil para pruebas")
ARGS = ap.parse_args()
SALIDA = Path(ARGS.salida) if ARGS.salida else SALIDA
MD, CAP = Path(ARGS.texto), Path(ARGS.capturas)
OUT = SALIDA / "imagenes"  # compartida: una lámina se llama igual y sale igual en todos los manuales
SUFIJO = "La Paz Si Pasa"
# Copia versionada que WordPress sirve en wp-admin (mu-plugin lapaz-manuales): <slug>.pdf; no se toca en pruebas con --salida.
MANUALES = None if ARGS.salida else REPO / "apps" / "wp-fse" / "manuales"
# slug -> ([títulos de las secciones del tipo, sin el número], comunes opcionales). Todo el texto sale de wiki/manual-editor.md:
# el nombre del manual es lo que va antes de «:» en el título de su primera sección y la descripción de portada,
# el primer párrafo de su «Qué es y dónde aparece».
# Comunes opcionales: "fotos" (Escribir bien y preparar fotos: texto largo o fotos editoriales) y "seo" (tipos con caja Ajustes de SEO).
TIPOS = {  # orden del menú lateral de WordPress (sin Medios): da el número 01–10 de cada manual
    "paginas": (["Páginas Inicio y Proyectos destacados: editar sus campos"], {"fotos", "seo"}),
    "noticias": (["Noticias: publicar una noticia"], set()),
    "retratos": (["Retratos de la Paz: publicar un retrato"], {"fotos"}),
    "subcuentas": (["Subcuentas: mantener los logos"], set()),
    "relatos-sonoros": (["Relatos sonoros: publicar un relato (El corazón del campo)"], set()),
    "boletin": (["Boletín: publicar una edición, paso a paso"], {"fotos", "seo"}),
    "ferias": (["Ferias: publicar una feria (PaisSana en ferias)"], {"fotos"}),
    "historia": (["Historia del mes: publicar la historia (PaisSano destacado)"], {"fotos", "seo"}),
    "productores": (["Catálogo de productores: agregar, editar y retirar productores"], set()),
    "videos": (["Videos: publicar un video (Actualidad)"], set()),
}

MENU = json.loads((Path(__file__).with_name("mapa-campos.json")).read_text(encoding="utf-8"))["menu"]  # slug -> ítem del menú lateral

def secciones(titulos, extra):
    """Secciones de un manual por tipo, en el orden del manual general."""
    return (["Entrar al administrador y orientarte"] + titulos
            + ["Escribir bien y preparar fotos"] * ("fotos" in extra)
            + ["Revisar y publicar", "Lo que NO debes tocar (y por qué)", "Problemas frecuentes y qué hacer"]
            + ["Buscadores y redes (SEO)"] * ("seo" in extra) + ["A quién acudir"])
CHROME = os.environ.get("CHROME_BIN") or os.environ.get("CHROME") or next((c for c in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", shutil.which("google-chrome"), shutil.which("chromium"), shutil.which("chrome")) if c and Path(c).exists()), "")
MAXW, SPLIT, TRAMO = 1600, 1.5, 1.0   # ancho máx. px; ratio alto/ancho desde el que se parte; ratio objetivo por tramo
ANCHO_IN, ALTO_IN = 6.9, 5.2          # caja útil de imagen en la página (pulgadas)
PPP = 170                             # resolución final de cada tramo en su caja impresa: texto nítido y PDF liviano
PEQ = {"captura-01": 3.0, "captura-02": 1.4, "captura-08": 3.8}  # capturas pequeñas: ancho máximo en pulgadas (nunca se parten)

# ---------- imágenes ----------
def cortes(im, n, umbral=0.006, minrun=16, forzar=False):
    """Cortes en franjas uniformes (sin texto) cerca de H*i/n; si no hay, corte con solape de 40 px.
    Entre varias franjas gana la más ancha (hueco entre campos, no entre rótulo y campo), penalizada por la distancia al ideal."""
    H = im.height
    a = np.asarray(im.convert("L")).astype(int)
    med = np.median(a, axis=1, keepdims=True)
    fr = (np.abs(a - med) > 14).mean(1)
    vacia = fr < umbral  # fila sin texto, foto ni número (admite bordes verticales finos)
    # fila idéntica a la anterior (sin el margen izquierdo de los círculos): hueco aunque la crucen bordes de cajas,
    # siempre que no sea el interior de un recuadro de color (fr alto)
    vacia |= np.r_[False, np.abs(np.diff(a[:, a.shape[1] // 32:], axis=0)).mean(1) < 0.5] & (fr < 0.1)
    # nunca cortar pegado a un círculo numerado (filas con muchos píxeles saturados en el margen izquierdo, más 12 px de holgura)
    rgb = np.asarray(im.convert("RGB")).astype(int)[:, : im.width // 30]
    circ = (rgb.max(2) - rgb.min(2) > 100).sum(1) > 25
    circ &= np.convolve(circ, np.ones(7), "same") >= 7  # un círculo ocupa muchas filas seguidas; el borde horizontal de una caja, 2 o 3
    vacia &= ~np.convolve(circ, np.ones(25), "same").astype(bool)
    res = []
    for i in range(1, n):
        ideal, ventana = int(H * i / n), int(H / n * 0.4)
        lo, hi = ideal - ventana, ideal + ventana
        mejor, run = None, None
        for y in range(lo, hi + 1):
            if vacia[y]:
                run = (run[0], y) if run else (y, y)
            else:
                run = None
            if run and run[1] - run[0] >= minrun:
                c = (run[0] + run[1]) // 2
                p = (run[1] - run[0]) * (1 - abs(c - ideal) / ventana / 2)
                if mejor is None or p > mejor[1]:
                    mejor = (c, p)
        if mejor:
            res.append((mejor[0], mejor[0], True))
        elif forzar:
            res.append((ideal - 20, ideal + 20, False))
        else:
            return None  # sin franja vacía
    return res  # (fin_tramo, inicio_siguiente, limpio)

def recomponer_productor(im):
    """La columna derecha del formulario es larga y la izquierda queda vacía: Etnias, Poblaciones y Tiempos
    de operación se colocan en tres columnas bajo el formulario (la mitad vacía de la lámina desaparece)."""
    W, H = im.size
    k = W / 2494  # las coordenadas están medidas en la lámina de 2494 px de ancho
    c = lambda v: round(v * k)
    fondo = im.getpixel((c(900), c(1500)))
    x0 = c(1900)
    cortes_y = [c(1925), c(2449), c(3100), H]
    out = Image.new("RGB", (W, c(1925)), fondo)
    out.paste(im.crop((0, 0, W, c(1925))), (0, 0))
    out.paste(Image.new("RGB", (x0 - c(120), c(1925) - c(1160)), fondo), (c(40), c(1160)))
    for i in range(3):
        out.paste(im.crop((x0, cortes_y[i], W, cortes_y[i + 1])), (c(40) + i * c(600), c(1180)))
    return out

def preparar(nombre):
    """Devuelve [(ruta, ancho, alto)] de los tramos ya optimizados."""
    im = Image.open(CAP / nombre).convert("RGB")
    if im.width > MAXW:
        im = im.resize((MAXW, round(im.height * MAXW / im.width)), Image.LANCZOS)
    if nombre == "lamina-12-productor-tarjeta-wordpress.png":
        im = recomponer_productor(im)
    r = im.height / im.width
    n = math.ceil(r / TRAMO) if r > SPLIT and Path(nombre).stem[:8] != "captura-" else 1
    cs = []
    while n > 1:
        # franja vacía entre campos; si no hay, se admiten bordes más gruesos y franjas más finas
        cs = next((c for u, m in ((0.006, 16), (0.02, 16), (0.006, 8), (0.02, 8)) if (c := cortes(im, n, u, m))), None)
        if cs or r / (n - 1) > 1.25:  # menos tramos solo si el texto sigue legible
            break
        n -= 1
    if n > 1 and not cs:
        cs = cortes(im, n, forzar=True)  # sin franja vacía: corte con solape de 40 px
    partes, y0 = [], 0
    for i in range(n):
        y1 = cs[i][0] if i < n - 1 else im.height
        partes.append(im.crop((0, y0, im.width, y1)))
        if i < n - 1:
            y0 = cs[i][1]
        if i < n - 1 and not cs[i][2]:
            print(f"  aviso: {nombre} corte {i + 1} sin franja vacía, con solape de 40 px")
    res = []
    for i, p in enumerate(partes):
        base = Path(nombre).stem if n == 1 else f"{Path(nombre).stem}-p{i + 1}"
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / f"{base}.png").unlink(missing_ok=True); (OUT / f"{base}.jpg").unlink(missing_ok=True)
        f = f"{base}.png"
        k = PPP * min(ANCHO_IN / p.width, ALTO_IN / p.height)  # px por px a PPP en la caja (las capturas PEQ quedan aún más nítidas)
        if k < 1:
            p = p.resize((round(p.width * k), round(p.height * k)), Image.LANCZOS)
        p.save(OUT / f, optimize=True)
        if (OUT / f).stat().st_size > 120_000:  # capturas con fotos: JPEG q78 4:2:0 si pesa menos (el texto oscuro sobre claro sigue nítido)
            p.save(OUT / f"{base}.jpg", quality=78, subsampling=2, optimize=True)
            if (OUT / f"{base}.jpg").stat().st_size < (OUT / f).stat().st_size:
                (OUT / f).unlink(); f = f"{base}.jpg"
            else:
                (OUT / f"{base}.jpg").unlink()
        res.append((OUT / f, p.width, p.height))
    return res

# ---------- markdown -> bloques ----------
INL = re.compile(r"\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*")
def runs(t, b=False, i=False, c=False):
    out, pos = [], 0
    for m in INL.finditer(t):
        if m.start() > pos:
            out.append((t[pos:m.start()], b, i, c))
        if m.group(1) is not None:
            out += runs(m.group(1), True, i, c)
        elif m.group(2) is not None:
            out.append((m.group(2), b, i, True))
        else:
            out += runs(m.group(3), b, True, c)
        pos = m.end()
    if pos < len(t):
        out.append((t[pos:], b, i, c))
    return out

def con_menus(md):
    """Menú lateral con el ítem del tipo en azul (generar-laminas.mjs --menu) al comienzo de la sección de cada tipo, junto al título:
    en el PDF flota a la derecha de «Qué es y dónde aparece» y «Dónde está». La sección 1 conserva el liso."""
    L = md.split("\n")
    for t, (titulos, _) in TIPOS.items():
        if (CAP / f"captura-02-menu-lateral-{t}.png").exists():
            k = next(j for j, x in enumerate(L) if re.match(rf"^## (?:\d+\. )?{re.escape(titulos[0])}\s*$", x))
            L[k + 1:k + 1] = ["", f"> **Imagen** `captura-02-menu-lateral-{t}.png`: Menú lateral de WordPress; en azul, {MENU[t]}."]
    return "\n".join(L)

def portada(blocks):
    """Párrafos entre el título y la primera sección (##), y el índice del bloque siguiente."""
    k = next(j for j, b in enumerate(blocks) if b[0] == "h1")
    return [b[1] for b in blocks[1:k] if b[0] == "p"], k

def es_resumen(t):
    return re.sub(r"^\d+\. ", "", t) == "Resumen en una hoja"

def recortar(md, nombre, titulos, num):
    """Texto del manual de un tipo: portada propia, índice propio, 'Cómo leer…' y solo las secciones pedidas, renumeradas.
    La descripción de portada es el primer párrafo de «Qué es y dónde aparece» de la sección propia del tipo."""
    L = md.split("\n=====")[0].split("\n")
    ini = next(j for j, x in enumerate(L) if x.startswith("# "))
    sec = [j for j, x in enumerate(L) if x.startswith("## ") and j > ini]
    por = {}
    for a, b in zip(sec, sec[1:] + [len(L)]):
        m = re.match(r"^## (?:\d+\. )?(.+?)\s*$", L[a])
        por[m.group(1)] = L[a + 1:b]
    faltan = [t for t in titulos if t not in por]
    if faltan:
        sys.exit(f"Manual «{nombre}»: no encuentro en {MD} las secciones {faltan}")
    leer = next((x for x in L if x.startswith("**Cómo leer las láminas")), None)
    if not leer:
        sys.exit(f"Manual «{nombre}»: no encuentro el párrafo «Cómo leer las láminas…» en {MD}")
    propia = next(t for t in titulos if t.startswith(nombre + ": "))
    sub = por[propia]
    q = next((j for j, x in enumerate(sub) if x.strip() == "### Qué es y dónde aparece"), None)
    desc = next((x for x in sub[q + 1:] if x.strip()), "#") if q is not None else "#"
    if desc.startswith("#"):
        sys.exit(f"Manual «{nombre}»: falta el párrafo de «### Qué es y dónde aparece» en «{propia}» ({MD})")
    cab = L[ini:sec[0]]
    k = [j for j in range(1, len(cab)) if cab[j].strip()]  # líneas con texto tras el título: subtítulo, descripción, versión, aviso
    marca = cab[0].split(" — ")[-1]  # «La Paz Sí Pasa», del título del manual general
    cab[0], cab[k[0]], cab[k[1]] = f"# {nombre}", f"**Manual del editor · {marca}**", desc
    cab[k[2]] = f"Manual {num} de {len(TIPOS)} · {cab[k[2]]}"  # al pie de la portada, sobre la versión
    out = cab + ["## Índice", ""] + [f"{n}. {t}" for n, t in enumerate(titulos, 1)] + ["", leer, "", "---", ""]
    for n, t in enumerate(titulos, 1):
        out += [f"## {n}. {t}"] + por[t]
    return "\n".join(out)

def parse(md):
    L = md.split("\n=====")[0].split("\n")
    L = L[next(j for j, x in enumerate(L) if x.startswith("# ")):]  # salta la nota de versión inicial
    blocks, i, usadas = [], 0, []
    while i < len(L):
        s = L[i]
        if not s.strip() or s.strip() == "---":
            i += 1
        elif s.startswith("# "):
            blocks.append(("title", s[2:])); i += 1
        elif s.startswith("### "):
            blocks.append(("h2", s[4:])); i += 1
        elif s.startswith("## "):
            blocks.append(("h1", s[3:])); i += 1
        elif s.startswith("|"):
            rows = []
            while i < len(L) and L[i].startswith("|"):
                if not re.match(r"^\|[\s|:-]+\|$", L[i]):
                    rows.append([c.strip() for c in L[i].strip().strip("|").split("|")])
                i += 1
            blocks.append(("table", rows))
        elif s.startswith(">") and not re.match(r"^> \*\*Imagen\*\* `(.+?)`: (.+)$", s.strip()):
            sys.exit(f"Línea '>' que no es una imagen válida (esperado: > **Imagen** `archivo.png`: pie): {s}")
        elif (m := re.match(r"^> \*\*Imagen\*\* `(.+?)`: (.+)$", s.strip())):
            f, pie = m.group(1), m.group(2)
            usadas.append(f)
            lab = {"wordpress": "En WordPress", "sitio": "En el sitio"}.get(Path(f).stem.rsplit("-", 1)[-1]) if f.startswith("lamina-") else None
            partes = preparar(f)
            for k, (p, w, h) in enumerate(partes):
                cap = pie if len(partes) == 1 else f"{pie} ({k + 1}\u00a0de\u00a0{len(partes)})"
                blocks.append(("img", p, w, h, cap, lab if k == 0 else None, PEQ.get(Path(f).stem[:10])))
            i += 1
        elif re.match(r"^\s*(\d+)\. ", s) or re.match(r"^\s*- ", s):
            while i < len(L) and (re.match(r"^\s*\d+\. ", L[i]) or re.match(r"^\s*- ", L[i])):
                m = re.match(r"^(\s*)(\d+\.|-) (.*)$", L[i])
                nivel = 1 if len(m.group(1)) >= 2 else 0
                tx = m.group(3)
                marca = m.group(2)
                if tx.startswith("[ ] "):
                    marca, tx = "☐", tx[4:]
                blocks.append(("li", nivel, marca, tx)); i += 1
        else:
            blocks.append(("p", s)); i += 1
    return blocks, usadas

# ---------- html -> pdf ----------
CSS = """
@page { size: 8.5in 11in; margin: 1.7cm; @bottom-center { content: counter(page); font: 9pt Helvetica, Arial, sans-serif; color:#666 } }
@page :first { @bottom-center { content: none } }
body { font: 11pt/1.45 Helvetica, Arial, sans-serif; color:#222; margin:0 }
h1 { font-size:19pt; line-height:1.2; color:#1F3A5F; margin:0 0 14pt; break-before:page; break-after:avoid }  /* cada sección (##) en página nueva */
h2 { font-size:13.5pt; line-height:1.25; color:#1F3A5F; margin:22pt 0 9pt; break-after:avoid } h1 + h2 { margin-top:6pt }
.portada { height:9.3in; display:flex; flex-direction:column; break-after:page }
.portada .t { font-size:30pt; line-height:1.15; font-weight:bold; color:#1F3A5F; margin-top:2.4in }
.portada .t::before { content:""; display:block; width:1.1in; border-top:5pt solid #1F3A5F; margin-bottom:20pt }
.portada .s { font-size:14pt; color:#444; margin-top:10pt } .portada .d { font-size:12.5pt; line-height:1.45; margin-top:36pt; max-width:5.4in }
.portada .pie { margin-top:auto; font-size:10pt; color:#444 } .portada .pie p { margin:0 0 3pt } .portada .pie p:last-child { font-weight:bold; color:#222 }
.pb { break-before:page } p { margin:0 0 9pt }
code { white-space:nowrap; font-family:Menlo, "Courier New", monospace; font-size:.86em; background:#f0f0f0; padding:0 .15em; border-radius:2px }
ul,ol { margin:0 0 11pt; padding-left:18pt } li { margin-bottom:5pt } li > ul, li > ol { margin:5pt 0 0 } .corta { break-inside:avoid } ul.chk { list-style-type:"\\2610\\00a0\\00a0" }
figure { margin:12pt 0 18pt; text-align:center; break-inside:avoid } .l + figure { margin-top:0; margin-bottom:8pt }
figure img { max-width:%sin; max-height:%sin; width:auto; height:auto } figure.peq img { max-width:var(--w) } figcaption { font-size:9pt; line-height:1.35; color:#555; margin:7pt auto 0; max-width:5.8in }
.l { font-weight:bold; font-size:9pt; color:#1F3A5F; text-transform:uppercase; letter-spacing:.05em; margin:16pt 0 6pt; break-after:avoid; text-align:left }
figure + .l { margin-top:12pt }
figure.menu { float:right; width:1.7in; margin:2pt 0 10pt 18pt } figure.menu + table { width:auto } figure:not(.menu), .l, h1 { clear:both } .cols ul { columns:2; column-gap:24pt } .indice li, .cols li { margin-bottom:2pt }
table { border-collapse:collapse; width:100%%; margin:12pt 0 16pt; font-size:10pt; line-height:1.35 } th,td { border:1px solid #bbb; padding:4pt 6pt; vertical-align:top; text-align:left }
th { background:#E3EAF3 } tr,tbody.g,section.rec,table.corta { break-inside:avoid } thead { display:table-header-group } td.n { text-align:center; font-weight:bold; font-size:12pt; width:9%%; }
p,li { orphans:2; widows:2 } figure + p { break-inside:avoid } p:has(+ ul), p:has(+ ol), p:has(+ table) { break-after:avoid } li.dp { break-after:avoid }
.res { font-size:9.5pt; line-height:1.2 } .res h1 { margin-top:0 } .res h2 { font-size:12pt; margin:8pt 0 3pt } .res li { margin-bottom:1.5pt }
""" % (ANCHO_IN, ALTO_IN)

def h(t):
    o = ""
    for tx, b, i, c in runs(t):
        x = html.escape(tx)
        if c: x = f"<code>{x}</code>"
        if i: x = f"<em>{x}</em>"
        if b: x = f"<strong>{x}</strong>"
        o += x
    return o

def lista(items):
    """Listas HTML nativas (la viñeta queda fuera del texto y las líneas largas se alinean); el nivel 1 va dentro del ítem anterior.
    Las numeradas llevan value=N: el número es el del texto, no el del contador del navegador. Una lista de ≤4 ítems no se parte."""
    tag = lambda m: "ol" if m[0].isdigit() else "chk" if m == "☐" else "ul"
    o, i = "", 0
    while i < len(items):
        nivel, t = items[i][0], tag(items[i][1])
        lis = []
        while i < len(items) and items[i][0] == nivel and tag(items[i][1]) == t:
            _, marca, tx = items[i]; i += 1
            hijos = []
            while i < len(items) and items[i][0] > nivel:
                hijos.append(items[i]); i += 1
            val = f" value={marca[:-1]}" if t == "ol" else ""
            lis.append(f"<li{val}{' class=dp' if tx.rstrip().endswith(':') else ''}>{h(tx)}{lista(hijos) if hijos else ''}</li>")
        el = "ol" if t == "ol" else "ul"
        cls = " ".join(c for c in ("chk" if t == "chk" else "", "corta" if len(lis) <= 4 else "") if c)
        o += f'<{el}{f" class={chr(34)}{cls}{chr(34)}" if cls else ""}>{"".join(lis)}</{el}>'
    return o

def build_pdf(blocks, destino):
    o = [f"<!doctype html><meta charset=utf-8><title>{destino.name}</title><style>{CSS}</style><body>"]
    cover, k = portada(blocks)  # subtítulo, descripción y al pie versión y aviso (el último, en negrita)
    o.append(f'<div class=portada><div class=t>{h(blocks[0][1])}</div><div class=s>{h(cover[0])}</div><div class=d>{h(cover[1])}</div>'
             f'<div class=pie>{"".join(f"<p>{h(c)}</p>" for c in cover[2:])}</div></div>')
    items, rec, en_resumen = [], False, False
    def cierra():
        if items: o.append(lista(items)); items.clear()
    # listas con envoltorio propio, para que el índice del general (y «Manuales por tipo», a dos columnas) quepa en una página
    ENVOLTORIO, envolver = {"Índice": "indice", "Manuales por tipo": "cols"}, None
    for b in blocks[k:]:
        tipo = b[0]
        if tipo != "li":
            if envolver and items:  # la primera lista tras el título del envoltorio
                o.append(f"<div class={envolver}>"); cierra(); o.append("</div>"); envolver = None
            cierra()
            if tipo in ("h1", "h2"):
                envolver = ENVOLTORIO.get(b[1])
        if tipo in ("h1", "h2"):
            tg = "h1" if tipo == "h1" else "h2"
            cls = ' class=pb' if (tipo == "h1" and es_resumen(b[1])) else ""
            if rec: o.append("</section>"); rec = False
            if tipo == "h1" and en_resumen: o.append("</div>")
            if tipo == "h2" and en_resumen: o.append("<section class=rec>"); rec = True
            en_resumen = es_resumen(b[1]) if tipo == "h1" else en_resumen
            if tipo == "h1" and en_resumen: o.append("<div class=res>")  # estilo compacto: cabe en una hoja
            o.append(f"<{tg}{cls}>{h(b[1])}</{tg}>")
        elif tipo == "p":
            o.append(f"<p>{h(b[1])}</p>")
        elif tipo == "li":
            items.append(b[1:])
        elif tipo == "img":
            _, ruta, w, hh, cap, lab, peq = b
            if lab: o.append(f'<div class=l>{lab}</div>')
            # el menú lateral (alto y angosto) flota a la derecha del texto: sin hueco en blanco antes de él
            fig = f'<figure class="peq{" menu" if ruta.stem.startswith("captura-02") else ""}" style="--w:{peq}in">' if peq else "<figure>"
            o.append(f'{fig}<img src="{ruta.as_uri()}"><figcaption>{h(cap)}</figcaption></figure>')
        elif tipo == "table":
            rows = b[1]
            o.append(f"<table{' class=corta' if len(rows) <= 8 else ''}><thead><tr>" + "".join(f"<th>{h(c)}</th>" for c in rows[0]) + "</tr></thead><tbody" + (" class=g" if len(rows) > 6 else "") + ">")
            cuerpo = rows[1:]
            for j, r in enumerate(cuerpo):
                if len(cuerpo) >= 6 and j in (2, len(cuerpo) - 2):  # tbody.g: nunca menos de 2 filas al pie ni al tope de página
                    o.append(f"</tbody><tbody{' class=g' if j > 2 else ''}>")
                o.append("<tr>" + "".join(f'<td class=n>{h(c)}</td>' if (len(r) == 3 and ci == 0) else f"<td>{h(c)}</td>" for ci, c in enumerate(r)) + "</tr>")
            o.append("</tbody></table>")
    cierra()
    if rec: o.append("</section>")
    if en_resumen: o.append("</div>")
    tmp = Path(tempfile.mkdtemp()) / "manual.html"
    tmp.write_text("".join(o), encoding="utf-8")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--generate-pdf-document-outline", f"--print-to-pdf={destino.with_name(destino.name + '.pdf')}", tmp.as_uri()],
                   check=True, capture_output=True, timeout=300)

def plano(t):  # nombre de archivo sin acentos
    return unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()

if __name__ == "__main__":
    assert CHROME, "No encuentro Chrome: define CHROME_BIN con su ruta"
    md = con_menus(MD.read_text(encoding="utf-8"))
    sel = [] if ARGS.solo_general else (ARGS.tipo.split(",") if ARGS.tipo else list(TIPOS))
    if desconocidos := [t for t in sel if t not in TIPOS]:
        sys.exit(f"Tipo desconocido {desconocidos}; los válidos son {list(TIPOS)}")
    # 00 es el general; 01–10, los tipos en el orden de sus secciones en el general (el de TIPOS). El mismo número en archivo, portada y wp-admin.
    NUM = {t: f"{i:02d}" for i, t in enumerate(TIPOS, 1)}
    leer = next(x for x in md.split("\n") if x.startswith("**Cómo leer las láminas"))
    caja = ["### Manuales por tipo", "", "Además de este manual general (00), cada tipo de contenido tiene el suyo, con el mismo número en el nombre del archivo y en la caja «Ayuda» de WordPress:", ""]
    caja += [f"- **{NUM[t]}** · {v[0][0].split(': ')[0]}" for t, v in TIPOS.items()] + ["", leer]
    general = md.replace(leer, "\n".join(caja), 1)
    trabajos = [] if ARGS.tipo else [("general", SALIDA / f"00 - Manual general - {SUFIJO}", general)]
    for t in sel:  # se recortan todos antes de generar: si falta una sección, no sale ningún manual a medias
        titulos, extra = TIPOS[t]
        nombre = titulos[0].split(": ")[0]
        texto = recortar(md, nombre, secciones(titulos, extra), NUM[t])
        trabajos.append((t, SALIDA / "por-tipo" / f"{NUM[t]} - {plano(nombre)} - {SUFIJO}", texto))
    shutil.rmtree(OUT, ignore_errors=True)  # quita imágenes de ediciones anteriores
    (SALIDA / "por-tipo").mkdir(parents=True, exist_ok=True)
    for viejo in [*SALIDA.glob("Manual del editor - La Paz Si Pasa.*"), *SALIDA.glob("Manual*.pdf"), *(SALIDA / "por-tipo").glob("Manual*.pdf")]:
        viejo.unlink()  # nombres antiguos, sin número
    for slug, destino, texto in trabajos:
        blocks, usadas = parse(texto)
        faltan = [f for f in usadas if not (CAP / f).exists()]
        assert not faltan, faltan
        build_pdf(blocks, destino)
        if MANUALES:
            MANUALES.mkdir(exist_ok=True)
            shutil.copyfile(destino.with_name(destino.name + ".pdf"), MANUALES / f"{slug}.pdf")
        print(destino.name, "| imágenes citadas:", len(usadas), "| tramos:", sum(b[0] == "img" for b in blocks))
