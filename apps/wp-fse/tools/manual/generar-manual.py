#!/usr/bin/env python3
# Regenera los manuales del editor (.docx + .pdf + imagenes/) desde wiki/manual-editor.md y las láminas PNG:
# el manual general y un manual por tipo de contenido (raw/manual-editor/por-tipo/).
# Uso (desde la raíz del repo): python3 apps/wp-fse/tools/manual/generar-manual.py [texto.md] [carpeta-capturas] [--tipo=noticias,ferias | --solo-general] [--salida=carpeta]
# Requiere python-docx, Pillow, numpy y Google Chrome (el PDF se imprime con Chrome headless).
# Por defecto: texto wiki/manual-editor.md, láminas raw/manual-editor/capturas/, salidas en raw/manual-editor/ (fuera de git).
import argparse, html, math, os, re, shutil, subprocess, sys, tempfile, unicodedata
from pathlib import Path
import numpy as np
from PIL import Image
from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor

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
# slug -> (nombre, descripción de portada, [títulos de las secciones del tipo, sin el número], comunes opcionales)
# Comunes opcionales: "fotos" (Escribir bien y preparar fotos: texto largo o fotos editoriales) y "seo" (tipos con caja Ajustes de SEO).
TIPOS = {
    "boletin": ("Boletín", "Cómo armar y publicar cada edición mensual del boletín.",
                ["Publicar una edición del boletín, paso a paso"], {"fotos", "seo"}),
    "historia": ("Historia del mes", "Cómo publicar la historia PaisSana del mes: presentación, portada, video, crónica y galería.",
                 ["Publicar la historia del mes (PaisSano destacado)"], {"fotos", "seo"}),
    "productores": ("Catálogo de productores", "Cómo agregar, editar y retirar productores del catálogo PaisSana.",
                    ["Mantener el catálogo de productores PaisSana"], set()),
    "noticias": ("Noticias", "Cómo publicar las noticias que aparecen en Inicio.",
                 ["Publicar una noticia"], set()),
    "retratos": ("Retratos de la Paz", "Cómo publicar los retratos del carrusel Retratos de la Paz.",
                 ["Publicar un retrato (Retratos de la Paz)"], {"fotos"}),
    "videos": ("Videos", "Cómo publicar los videos de la sección Actualidad.",
               ["Publicar un video (Actualidad)"], set()),
    "relatos-sonoros": ("Relatos sonoros", "Cómo publicar los audios de El corazón del campo.",
                        ["Publicar un relato sonoro (El corazón del campo)"], set()),
    "ferias": ("Ferias", "Cómo publicar las ferias de PaisSana en ferias, con fotos y videos.",
               ["Publicar una feria (PaisSana en ferias)"], {"fotos"}),
    "subcuentas": ("Subcuentas", "Cómo mantener los logos de Conoce las subcuentas.",
                   ["Mantener las subcuentas"], set()),
    "paginas": ("Páginas Inicio y Proyectos destacados", "Cómo cambiar los campos de las páginas Inicio y Proyectos destacados.",
                ["Editar las páginas Inicio y Proyectos destacados"], {"fotos", "seo"}),
}

def secciones(titulos, extra):
    """Secciones de un manual por tipo, en el orden del manual general."""
    return (["Entrar al administrador y orientarte"] + titulos
            + ["Escribir bien y preparar fotos"] * ("fotos" in extra)
            + ["Revisar y publicar", "Lo que NO debes tocar (y por qué)", "Problemas frecuentes y qué hacer"]
            + ["Buscadores y redes (SEO)"] * ("seo" in extra) + ["A quién acudir"])
CHROME = os.environ.get("CHROME_BIN") or os.environ.get("CHROME") or next((c for c in ("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", shutil.which("google-chrome"), shutil.which("chromium"), shutil.which("chrome")) if c and Path(c).exists()), "")
MAXW, SPLIT, TRAMO = 1600, 1.5, 1.0   # ancho máx. px; ratio alto/ancho desde el que se parte; ratio objetivo por tramo
ANCHO_IN, ALTO_IN = 6.9, 5.2          # caja útil de imagen en la página (pulgadas)
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
        p.save(OUT / f, optimize=True)
        if (OUT / f).stat().st_size > 250_000:  # capturas con fotos: JPEG 4:4:4 q88 si pesa menos (texto sigue nítido)
            p.save(OUT / f"{base}.jpg", quality=88, subsampling=0, optimize=True)
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

def portada(blocks):
    """Párrafos entre el título y la primera sección (##), y el índice del bloque siguiente."""
    k = next(j for j, b in enumerate(blocks) if b[0] == "h1")
    return [b[1] for b in blocks[1:k] if b[0] == "p"], k

def es_resumen(t):
    return re.sub(r"^\d+\. ", "", t) == "Resumen en una hoja"

def recortar(md, nombre, desc, titulos):
    """Texto del manual de un tipo: portada con su subtítulo y descripción, índice propio, 'Cómo leer…' y solo las secciones pedidas, renumeradas."""
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
    cab = L[ini:sec[0]]
    k = [j for j in range(1, len(cab)) if cab[j].strip()]  # líneas con texto tras el título: subtítulo, descripción, versión…
    cab[k[0]], cab[k[1]] = f"**{nombre}**", desc
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

# ---------- docx ----------
def fuente(st, tam=None, color=None, bold=None):
    st.font.name = "Arial"
    rf = st.element.get_or_add_rPr().get_or_add_rFonts()
    for a in ("asciiTheme", "hAnsiTheme", "eastAsiaTheme", "cstheme"):
        rf.attrib.pop(qn("w:" + a), None)
    for a in ("ascii", "hAnsi", "eastAsia", "cs"):
        rf.set(qn("w:" + a), "Arial")
    if tam: st.font.size = Pt(tam)
    if color: st.font.color.rgb = RGBColor.from_string(color)
    if bold is not None: st.font.bold = bold

def campo(par, instr):
    for t, txt in (("begin", None), (None, instr), ("separate", None), (None, "1"), ("end", None)):
        r = par.add_run()
        if t:
            e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), t)
        elif txt == instr:
            e = OxmlElement("w:instrText"); e.set(qn("xml:space"), "preserve"); e.text = instr
        else:
            e = OxmlElement("w:t"); e.text = txt
        r._r.append(e)

def add_runs(par, t, tam=None, bold=False):
    for tx, b, i, c in runs(t):
        r = par.add_run(tx)
        r.bold = b or bold or None
        r.italic = i or None
        if c:
            r.font.name = "Courier New"
            r.font.size = Pt((tam or 11) - 1)
        elif tam:
            r.font.size = Pt(tam)

def sombrear(cell, color):
    tcPr = cell._tc.get_or_add_tcPr()
    s = OxmlElement("w:shd"); s.set(qn("w:val"), "clear"); s.set(qn("w:color"), "auto"); s.set(qn("w:fill"), color)
    tcPr.append(s)

def fmt_par(p, **kw):
    f = p.paragraph_format
    for k, v in kw.items():
        setattr(f, k, v)
    return p

def build_docx(blocks, destino):
    d = Document()
    sec = d.sections[0]
    sec.page_width, sec.page_height = Inches(8.5), Inches(11)
    sec.left_margin = sec.right_margin = sec.top_margin = sec.bottom_margin = Cm(1.7)
    sec.different_first_page_header_footer = True
    campo(sec.footer.paragraphs[0], "PAGE")
    sec.footer.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    S = d.styles
    fuente(S["Normal"], 11)
    S["Normal"].paragraph_format.space_after = Pt(6)
    S["Normal"].paragraph_format.line_spacing = 1.15
    fuente(S["Title"], 28, "1F3A5F", True)
    fuente(S["Subtitle"], 14, "444444", False)
    for n, tam, antes in (("Heading 1", 19, 20), ("Heading 2", 13.5, 14), ("Heading 3", 12, 10)):
        fuente(S[n], tam, "1F3A5F", True)
        S[n].paragraph_format.space_before, S[n].paragraph_format.space_after = Pt(antes), Pt(6)
        S[n].paragraph_format.keep_with_next = True
    fuente(S["Caption"], 9, "555555", False)
    S["Caption"].font.italic = False
    for n in ("List Bullet", "List Bullet 2"):
        fuente(S[n], 11)
        S[n].paragraph_format.space_after = Pt(3)

    # portada: título, subtítulo (negrita), versión, aviso
    t = blocks[0][1]
    d.add_paragraph().paragraph_format.space_after = Pt(150)
    d.add_paragraph(t, style="Title")
    cover, k = portada(blocks)
    p = d.add_paragraph(style="Subtitle"); add_runs(p, cover[0], 14)
    fmt_par(p, space_before=Pt(24))
    for j, c in enumerate(cover[1:]):  # descripción, versión… y el aviso final en negrita
        add_runs(fmt_par(d.add_paragraph(), space_before=Pt(60 if j == 0 else 0)), c, 12, j == len(cover) - 2)
    d.add_page_break()
    for b in blocks[k:]:
        tipo = b[0]
        if tipo in ("h1", "h2"):
            p = d.add_paragraph(style="Heading 1" if tipo == "h1" else "Heading 2")
            p.add_run(b[1])
            if tipo == "h1" and es_resumen(b[1]):
                p.paragraph_format.page_break_before = True
        elif tipo == "p":
            add_runs(d.add_paragraph(), b[1])
        elif tipo == "li":
            _, nivel, marca, tx = b
            if marca == "-":
                p = d.add_paragraph(style="List Bullet 2" if nivel else "List Bullet")
            else:
                p = d.add_paragraph()
                fmt_par(p, left_indent=Cm(0.9 + 0.8 * nivel), first_line_indent=Cm(-0.6), space_after=Pt(3))
                p.add_run(marca + "\t")
                p.paragraph_format.tab_stops.add_tab_stop(Cm(0.9 + 0.8 * nivel))
            add_runs(p, tx)
        elif tipo == "img":
            _, ruta, w, h, cap, lab, peq = b
            if lab:
                p = fmt_par(d.add_paragraph(), keep_with_next=True, space_before=Pt(12), space_after=Pt(4))
                add_runs(p, lab, 9, True)
                for r in p.runs:  # mismo rótulo que el PDF: versalitas azules
                    r.font.all_caps, r.font.color.rgb = True, RGBColor.from_string("1F3A5F")
            ancho = Inches(min(peq or ANCHO_IN, ALTO_IN * w / h))
            p = fmt_par(d.add_paragraph(), keep_with_next=True, alignment=WD_ALIGN_PARAGRAPH.CENTER, space_after=Pt(2))
            p.add_run().add_picture(str(ruta), width=ancho)
            add_runs(fmt_par(d.add_paragraph(style="Caption"), space_after=Pt(10)), cap, 9)
        elif tipo == "table":
            rows = b[1]
            nc = len(rows[0])
            anchos = [0.6, 2.5, 3.8] if nc == 3 else [2.2, 4.7]
            tb = d.add_table(rows=len(rows), cols=nc)
            tb.style = "Table Grid"
            tb.alignment = WD_TABLE_ALIGNMENT.CENTER
            tb.autofit = False
            bd = OxmlElement("w:tblBorders")
            for e in ("top", "left", "bottom", "right", "insideH", "insideV"):
                x = OxmlElement("w:" + e)
                for a, v in (("val", "single"), ("sz", "4"), ("space", "0"), ("color", "BBBBBB")):
                    x.set(qn("w:" + a), v)
                bd.append(x)
            tb._tbl.tblPr.append(bd)
            for ri, row in enumerate(rows):
                tr = tb.rows[ri]
                trPr = tr._tr.get_or_add_trPr()
                trPr.append(OxmlElement("w:cantSplit"))
                if ri == 0:
                    trPr.append(OxmlElement("w:tblHeader"))
                for ci, tx in enumerate(row):
                    c = tr.cells[ci]
                    c.width = Inches(anchos[ci])
                    p = c.paragraphs[0]
                    fmt_par(p, space_after=Pt(2), space_before=Pt(2), line_spacing=1.05)
                    if nc == 3 and ci == 0 and ri > 0:
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        add_runs(p, tx, 12, True)
                    else:
                        add_runs(p, tx, 10, ri == 0)
                    if ri == 0:
                        sombrear(c, "E3EAF3")
            d.add_paragraph().paragraph_format.space_after = Pt(4)
    d.save(destino.with_name(destino.name + ".docx"))

# ---------- html -> pdf ----------
CSS = """
@page { size: 8.5in 11in; margin: 1.7cm; @bottom-center { content: counter(page); font: 9pt Helvetica, Arial, sans-serif; color:#666 } }
@page :first { @bottom-center { content: none } }
body { font: 10.5pt/1.35 Helvetica, Arial, sans-serif; color:#222; margin:0 }
h1 { font-size:19pt; line-height:1.2; color:#1F3A5F; margin:20pt 0 7pt; break-after:avoid }
h2 { font-size:13.5pt; line-height:1.25; color:#1F3A5F; margin:14pt 0 5pt; break-after:avoid }
.t { font-size:28pt; font-weight:bold; color:#1F3A5F; margin-top:3.2in }
.s { font-size:14pt; color:#444; margin-top:24pt } .c { font-size:12pt; margin-top:50pt } .c b { font-weight:bold }
.pb { break-before:page } .t,.s,.c { break-after:avoid } p { margin:0 0 6pt } code { white-space:nowrap; font:9.5pt "Courier New",monospace; background:#f0f0f0; padding:0 2px }
ul,ol { margin:0 0 6pt; padding-left:20pt } li { margin-bottom:3pt } ul.n { list-style:none; padding-left:0 } ul.n li { padding-left:16pt; text-indent:-16pt }
figure { margin:0 0 12pt; text-align:center; break-inside:avoid } .l + figure { margin-bottom:6pt }
figure img { max-width:%sin; max-height:%sin; width:auto; height:auto } figure.peq img { max-width:var(--w) } figcaption { font-size:9pt; line-height:1.3; color:#555; margin:4pt auto 0; max-width:5.8in }
.l { font-weight:bold; font-size:9pt; color:#1F3A5F; text-transform:uppercase; letter-spacing:.05em; margin:12pt 0 4pt; break-after:avoid; text-align:left }
figure + .l { margin-top:8pt }
table { border-collapse:collapse; width:100%%; margin:8pt 0 10pt; font-size:10pt; line-height:1.3 } th,td { border:1px solid #bbb; padding:3pt 5pt; vertical-align:top; text-align:left }
th { background:#E3EAF3 } tr,tbody.g,section.rec,table.corta { break-inside:avoid } thead { display:table-header-group } td.n { text-align:center; font-weight:bold; font-size:12pt; width:9%%; }
p,li { orphans:2; widows:2 } p:has(+ ul), p:has(+ table) { break-after:avoid } li.dp { break-after:avoid }
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

def build_pdf(blocks, destino):
    o, k = [f"<!doctype html><meta charset=utf-8><title>{destino.name}</title><style>{CSS}</style><body>"], 1
    o.append(f'<div class=t>{h(blocks[0][1])}</div>')
    cover, k = portada(blocks)
    o.append(f'<div class=s>{h(cover[0])}</div>')
    for j, c in enumerate(cover[1:]):  # descripción, versión… y el aviso final en negrita
        st = ' style="margin-top:60pt"' if j == 0 else ' style="margin-top:6pt"'
        o.append(f'<div class=c{st}>{f"<b>{h(c)}</b>" if j == len(cover) - 2 else h(c)}</div>')
    o.append('<div style="break-after:page"></div>')
    abierta, rec, en_resumen = None, False, False
    def cierra():
        nonlocal abierta
        if abierta: o.append("</ul>"); abierta = None
    for b in blocks[k:]:
        tipo = b[0]
        if tipo != "li": cierra()
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
            _, nivel, marca, tx = b
            ap = '<ul>' if marca == "-" else '<ul class=n>'
            if abierta != ap: cierra(); o.append(ap); abierta = ap
            o.append(f"<li{' style=margin-left:18pt' if nivel else ''}{' class=dp' if tx.rstrip().endswith(':') else ''}>{'' if marca == '-' else marca + ' '}{h(tx)}</li>")
        elif tipo == "img":
            _, ruta, w, hh, cap, lab, peq = b
            if lab: o.append(f'<div class=l>{lab}</div>')
            fig = f'<figure class=peq style="--w:{peq}in">' if peq else "<figure>"
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
    # listas numeradas: se escriben como "N." manual (ul.n) para no depender del contador del navegador
    tmp = Path(tempfile.mkdtemp()) / "manual.html"
    tmp.write_text("".join(o), encoding="utf-8")
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--generate-pdf-document-outline", f"--print-to-pdf={destino.with_name(destino.name + '.pdf')}", tmp.as_uri()],
                   check=True, capture_output=True, timeout=300)

def plano(t):  # nombre de archivo sin acentos
    return unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()

if __name__ == "__main__":
    assert CHROME, "No encuentro Chrome: define CHROME_BIN con su ruta"
    md = MD.read_text(encoding="utf-8")
    sel = [] if ARGS.solo_general else (ARGS.tipo.split(",") if ARGS.tipo else list(TIPOS))
    if desconocidos := [t for t in sel if t not in TIPOS]:
        sys.exit(f"Tipo desconocido {desconocidos}; los válidos son {list(TIPOS)}")
    trabajos = [] if ARGS.tipo else [(SALIDA / f"Manual general - {SUFIJO}", md)]
    for t in sel:  # se recortan todos antes de generar: si falta una sección, no sale ningún manual a medias
        nombre, desc, titulos, extra = TIPOS[t]
        trabajos.append((SALIDA / "por-tipo" / f"Manual - {plano(nombre)} - {SUFIJO}", recortar(md, nombre, desc, secciones(titulos, extra))))
    shutil.rmtree(OUT, ignore_errors=True)  # quita imágenes de ediciones anteriores
    (SALIDA / "por-tipo").mkdir(parents=True, exist_ok=True)
    for viejo in SALIDA.glob("Manual del editor - La Paz Si Pasa.*"):
        viejo.unlink()  # nombre antiguo del manual general
    for destino, texto in trabajos:
        blocks, usadas = parse(texto)
        faltan = [f for f in usadas if not (CAP / f).exists()]
        assert not faltan, faltan
        build_docx(blocks, destino)
        build_pdf(blocks, destino)
        print(destino.name, "| imágenes citadas:", len(usadas), "| tramos:", sum(b[0] == "img" for b in blocks))
