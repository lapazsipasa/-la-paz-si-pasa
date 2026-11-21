// Uso: node apps/wp-fse/tools/manual/generar-laminas.mjs                 -> todas las láminas (usuario Editor temporal; se borra con --limpiar)
//      ... --solo=01,05,13    -> solo esas láminas (prefijo del id); --front / --admin para un solo lado
//      ... --limpiar          -> borra el usuario editora-manual. Lee mapa-campos.json (junto a este archivo).
// Las láminas (PNG) quedan en raw/manual-editor/capturas/ (carpeta fuera de git), o en --salida=<carpeta>.
// Requiere el sitio local en http://localhost:8090 (docker compose en apps/wp-fse) y Chrome. No guarda ni publica nada.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { PNG } from 'pngjs';
import { createBrowserTests, prepararPintado } from '../../tests/e2e/lib.mjs';

const AQUI = import.meta.dirname;
const WPFSE = path.resolve(AQUI, '../..');
const REPO = path.resolve(WPFSE, '../..');
const MAPA = JSON.parse(fs.readFileSync(path.join(AQUI, 'mapa-campos.json'), 'utf8'));
const args = process.argv.slice(2);
const solo = (args.find((a) => a.startsWith('--solo=')) || '').slice(7).split(',').filter(Boolean);
const SOLO_FRONT = args.includes('--front'), SOLO_ADMIN = args.includes('--admin');
const USER = 'editora-manual';
const COLORES = ['#c2410c', '#1e3a8a']; // naranja oscuro (impares) / azul oscuro (pares)
const MAX_ALTO = 2200, M = 16;
let TAM = 30; // diámetro de los círculos numerados (px CSS); cada lámina puede pedir otro con "circulo"

const wp = (a) => execSync(`docker compose exec -T -u www-data cms wp --path=/var/www/html ${a}`, { cwd: WPFSE, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
if (args.includes('--limpiar')) { try { wp(`user delete ${USER} --yes`); } catch {} console.log('usuario borrado'); process.exit(0); }

// --- sesión (Editor temporal) ---
function sesion() {
  let id = '';
  try { id = wp(`user get ${USER} --field=ID`); } catch {}
  if (!id) {
    const pass = crypto.randomBytes(18).toString('base64url');
    wp(`user create ${USER} editora@example.org --role=editor --display_name=Editora --first_name=Editora --user_pass=${pass} --porcelain`);
    id = wp(`user get ${USER} --field=ID`);
  }
  const nombres = wp(`eval 'echo AUTH_COOKIE."|".LOGGED_IN_COOKIE;'`).split('|');
  const gen = (esq) => wp(`eval 'echo wp_generate_auth_cookie(${id}, time()+7200, "${esq}");'`);
  return [[nombres[0], gen('auth')], [nombres[1], gen('logged_in')]];
}
// --- marcadores {ID_...} ---
const IDS = {};
for (const [k, cmd] of Object.entries(MAPA.marcadores)) IDS[k] = wp(cmd.replace(/^wp /, '')).split('\n')[0];
// Borrador temporal (copia de una entrada con metas cambiadas) para mostrar lo que la entrada real no tiene; se borra al final.
const BORRADORES = [];
function borrador(b) {
  const php = `$s=get_post(${res0(b.copiar_de)}); $id=wp_insert_post(['post_type'=>$s->post_type,'post_title'=>$s->post_title.' (borrador del manual)','post_status'=>'draft']); foreach(get_post_meta($s->ID) as $k=>$v){ if($k==='_edit_lock'||$k==='_edit_last')continue; update_post_meta($id,$k,maybe_unserialize($v[0])); } foreach(json_decode(${JSON.stringify(JSON.stringify(b.meta))},true) as $k=>$v) update_post_meta($id,$k,$v); echo $id;`;
  const id = execSync(`docker compose exec -T -u www-data cms wp --path=/var/www/html eval ${JSON.stringify(php).replace(/\$/g, '\\$')}`, { cwd: WPFSE, encoding: 'utf8' }).trim();
  BORRADORES.push(id); return id;
}
const res0 = (s) => s.replace(/\{(ID_[A-Z_0-9]+)\}/g, (_, k) => IDS[k]);
const res = (s) => s.replace(/\{(ID_[A-Z_0-9]+)\}/g, (_, k) => IDS[k]);

const t = createBrowserTests();
const sleep = t.sleep;
const OUT = path.resolve((args.find((a) => a.startsWith('--salida=')) || '').slice(9) || path.join(REPO, 'raw/manual-editor/capturas'));
fs.mkdirSync(OUT, { recursive: true });
const LIMPIA_ADMIN = '.notice,.update-nag,.notice-warning,.updated,#query-monitor-main,#qm,#qm-metabox,#wpadminbar,#edit-slug-box,.error:not(.acf-error-message){display:none !important} html.wp-toolbar{padding-top:0 !important}';
const LIMPIA_FRONT = '#wpadminbar{display:none !important} html{margin-top:0 !important}';

async function abrir(ruta, { w = 1280, cookies = null, css = '' } = {}) {
  const p = await t.openPage('about:blank', w);
  await p.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
  if (cookies) for (const [n, v] of cookies) for (const pa of ['/', '/wp-admin'])
    await p.send('Network.setCookie', { name: n, value: v, domain: 'localhost', path: pa });
  if (ruta.startsWith('@html:')) { // página local dibujada por el script, servida desde el mismo origen para que carguen las imágenes
    await p.send('Page.navigate', { url: t.site + '/robots.txt' }); await sleep(1500);
    await p.evaluate(`document.open();document.write(${JSON.stringify(ruta.slice(6))});document.close();1`);
  } else if (ruta.startsWith('http')) await p.send('Page.navigate', { url: ruta });
  else await p.send('Page.navigate', { url: t.site + ruta });
  for (let i = 0; i < 40; i++) { await sleep(500); if ((await p.evaluate('document.readyState')) === 'complete' && i > 3) break; }
  p.css = (x) => addCss(p, x); if (css) await p.css(css);
  await prepararPintado(p);
  return p;
}
const addCss = (p, c) => p.evaluate(`(()=>{const s=document.createElement('style');s.textContent=${JSON.stringify(c)};document.head.append(s);1})()`);
const fix = async () => {};

// Abre pestaña ACF por su texto; expande layouts/filas colapsadas que contienen el selector.
const abrirTab = (p, texto) => p.evaluate(`(()=>{const b=[...document.querySelectorAll('.acf-tab-button,.tsf-flex-nav-tab-label')].find(e=>e.textContent.trim()===${JSON.stringify(texto)});if(!b)return false;b.click();return true})()`);
const expandir = (p, sel) => p.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return 'no existe';let n=e,k=0;
  while(n&&n!==document.body){ if(n.classList&&n.classList.contains('-collapsed')){const h=n.querySelector(':scope > .acf-fc-layout-handle, :scope > .acf-row-handle .acf-icon.-collapse, :scope > .acf-row-handle.order, :scope > .acf-row-handle');if(h){h.click();k++}} n=n.parentElement}
  return k})()`);

// Marca elementos: círculos + contorno. items=[{n,sel,texto}] -> [{n,x,y,w,h}|{n,error}]
const MARCAR = `window.__marcar=(items,colores)=>{
  document.querySelectorAll('.__lam').forEach(e=>e.remove());
  const out=[],pos=[],S=window.__tam||30;
  for(const it of items){
    const el=document.querySelector(it.sel); if(!el){out.push({n:it.n,error:'selector sin coincidencia'});continue}
    let b=null;
    if(it.texto){const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let nd;while(nd=w.nextNode()){const i=nd.data.indexOf(it.texto);if(i>=0){const r=document.createRange();r.setStart(nd,i);r.setEnd(nd,i+it.texto.length);b=r.getBoundingClientRect();break}}
      if(!b){out.push({n:it.n,error:'texto no encontrado'});continue}}
    else b=el.getBoundingClientRect();
    const cs=getComputedStyle(el);
    if(b.width<2||b.height<2||cs.visibility==='hidden'){out.push({n:it.n,error:'invisible o sin tamaño'});continue}
    const x=b.left+scrollX,y=b.top+scrollY,c=colores[(it.n-1)%2];
    const o=document.createElement('div');o.className='__lam';
    o.style.cssText='position:absolute;pointer-events:none;box-sizing:border-box;border:2px solid '+c+';border-radius:3px;box-shadow:0 0 0 1.5px rgba(255,255,255,.9),inset 0 0 0 1px rgba(255,255,255,.9);z-index:2147483000;left:'+x+'px;top:'+y+'px;width:'+b.width+'px;height:'+b.height+'px';
    document.body.append(o);
    let bx=x+(it.circ?it.circ[0]:-S*2/3),by=y+(it.circ?it.circ[1]:-S*2/3);
    if(!it.circ&&pos.some(q=>Math.abs(q[0]-bx)<S+2&&Math.abs(q[1]-by)<S+2)){bx=x+b.width-S/3;}
    while(!it.circ&&pos.some(q=>Math.abs(q[0]-bx)<S+2&&Math.abs(q[1]-by)<S+2))by+=S+4;
    pos.push([bx,by]);
    const d=document.createElement('div');d.className='__lam';d.textContent=it.n;
    d.style.cssText='position:absolute;pointer-events:none;z-index:2147483001;width:'+S+'px;height:'+S+'px;border-radius:50%;box-sizing:border-box;background:'+c+';color:#fff;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25);font:700 '+(S/2)+'px/'+(S-4)+'px Arial,sans-serif;text-align:center;left:'+bx+'px;top:'+by+'px';
    document.body.append(d);
    out.push({n:it.n,x:Math.min(x,bx),y:Math.min(y,by),w:Math.max(x+b.width,bx+S)-Math.min(x,bx),h:Math.max(y+b.height,by+S)-Math.min(y,by)});
  }
  return out}`;
const rectDoc = (p, sel) => p.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return {x:b.x+scrollX,y:b.y+scrollY,w:b.width,h:b.height}})()`);
const union = (rs) => { const x = Math.min(...rs.map((r) => r.x)), y = Math.min(...rs.map((r) => r.y)); return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y }; };

async function clip(p, r, docW) {
  const x = Math.max(0, r.x), y = Math.max(0, r.y), w = Math.min(r.w, docW - x);
  await p.evaluate('scrollTo(0,0)');
  const s = await p.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x, y, width: w, height: r.h, scale: 2 } });
  return PNG.sync.read(Buffer.from(s.data, 'base64'));
}
function apilar(pngs, destino) {
  const W = Math.max(...pngs.map((i) => i.width)), GAP = 24;
  const H = pngs.reduce((a, i) => a + i.height, 0) + GAP * (pngs.length - 1);
  const o = new PNG({ width: W, height: H }); o.data.fill(0);
  for (let i = 0; i < o.data.length; i += 4) { o.data[i] = 214; o.data[i + 1] = 218; o.data[i + 2] = 224; o.data[i + 3] = 255; }
  let y = 0; for (const i of pngs) { PNG.bitblt(i, o, 0, 0, i.width, i.height, 0, y); y += i.height + GAP; }
  fs.writeFileSync(destino, PNG.sync.write(o));
}
const partir = (s) => s.split(/,\s*(?![^()\[\]]*[)\]])/).map((x) => x.trim()).filter(Boolean);

// Marca los pares en la página actual; devuelve los resultados y avisos.
async function marcarPares(p, pares, lado, informe, id, hechos) {
  const items = pares.filter((q) => !hechos.has(q.n)).map((q) => ({ n: q.n, sel: q[lado + '_selector'], texto: q[lado + '_texto'], circ: q.circ }));
  for (const it of items) if (lado === 'admin') await expandir(p, it.sel);
  await sleep(400);
  if (lado === 'admin') await p.evaluate(`(()=>{const R=(v)=>v.replace(/http:\\/\\/localhost:8090/g,'https://lapazsipasa.com').replace(/localhost:8090/g,'lapazsipasa.com');document.querySelectorAll('input,textarea').forEach(e=>{if(e.placeholder)e.placeholder=R(e.placeholder);if(e.type==='text'||e.type==='url')e.value=R(e.value)});const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())if(n.data.includes('localhost:8090'))n.data=R(n.data);1})()`);
  await prepararPintado(p);
  await p.evaluate(`window.__tam=${TAM}`);
  await p.evaluate(MARCAR);
  const r = await p.evaluate(`window.__marcar(${JSON.stringify(items)},${JSON.stringify(COLORES)})`);
  return r;
}

async function lamina(l, cookies) {
  TAM = l.circulo || 30;
  if (l.borrador) IDS.ID_BORRADOR = borrador(l.borrador);
  const nombre = (s) => path.join(OUT, `lamina-${l.id}-${s}.png`);
  const avisos = [];
  // ---------- WordPress ----------
  if (!SOLO_FRONT) {
    const a = l.admin;
    const p = await abrir(res(a.url), { cookies, css: LIMPIA_ADMIN + (a.css || '') });
    await fix(p, LIMPIA_ADMIN);
    const tabs = a.tabs || [a.tab].filter(Boolean);
    const hechos = new Set(), imgs = [];
    const docW = 1280;
    for (const tb of (tabs.length ? tabs : [null])) {
      if (tb) { if (!(await abrirTab(p, tb))) avisos.push(`pestaña «${tb}» no existe`); await sleep(600); }
      const candidatos = l.pares.filter((q) => !hechos.has(q.n));
      const vis = [];
      for (const q of candidatos) {
        const ok = await p.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(q.admin_selector)});return !!e})()`);
        if (!ok) continue;
        await expandir(p, q.admin_selector);
        const v = await p.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(q.admin_selector)});const b=e.getBoundingClientRect();return b.width>2&&b.height>2})()`);
        if (v) vis.push(q);
      }
      if (!vis.length) continue;
      const r = await marcarPares(p, vis, 'admin', avisos, l.id, hechos);
      const buenos = r.filter((x) => !x.error);
      for (const x of r) if (x.error) avisos.push(`admin n${x.n}: ${x.error}`); else hechos.add(x.n);
      const rec = partir(a.recorte);
      let box = union((await Promise.all(rec.map((s) => rectDoc(p, s)))).filter(Boolean));
      let cr = { x: box.x - M, y: box.y - M, w: box.w + 2 * M, h: box.h + 2 * M };
      if (buenos.length) cr = union([cr, ...buenos]);
      if (cr.h > MAX_ALTO) { // recorta a la zona de los números
        const z = union(buenos); const y0 = Math.max(cr.y, z.y - M), y1 = Math.min(cr.y + cr.h, z.y + z.h + M);
        cr = { ...cr, y: y0, h: y1 - y0 }; avisos.push(`admin recortado a zona de números (${Math.round(cr.h)}px)`);
      }
      imgs.push(await clip(p, cr, docW));
    }
    for (const q of l.pares) if (!hechos.has(q.n) && !avisos.some((x) => x.startsWith(`admin n${q.n}`))) avisos.push(`admin n${q.n}: no visible en ninguna pestaña`);
    if (imgs.length) apilar(imgs, nombre('wordpress'));
    await p.close();
  }
  // ---------- Sitio ----------
  if (!SOLO_ADMIN) {
    const f = l.front, w = f.ancho || 1280;
    const url = f.tipo === 'vista_previa_generada' ? await vistaPrevia(f) : f.url;
    const p = await abrir(res(url), { w, css: LIMPIA_FRONT, cookies: f.sesion ? cookies : null });
    await fix(p, LIMPIA_FRONT);
    // la lámina espera un pequeño margen para animaciones de entrada
    await p.css('*{animation:none !important;transition:none !important} .reveal,[data-reveal]{opacity:1 !important;transform:none !important}');
    const r = await marcarPares(p, l.pares, 'front', avisos, l.id, new Set());
    for (const x of r) if (x.error) avisos.push(`front n${x.n}: ${x.error}`);
    const docW = await p.evaluate('document.documentElement.clientWidth');
    const bandas = partir(f.recorte);
    const imgs = [];
    for (const s of bandas) {
      const b = await rectDoc(p, s);
      if (!b) { avisos.push(`front recorte sin coincidencia: ${s}`); continue; }
      let cr = bandas.length > 1 ? { x: 0, y: b.y - 6, w: docW, h: b.h + 12 } : { x: b.x - M, y: b.y - M, w: b.w + 2 * M, h: b.h + 2 * M };
      // incluye los números que caigan dentro de esta banda
      const dentro = r.filter((q) => !q.error && q.y + q.h > cr.y && q.y < cr.y + cr.h);
      if (dentro.length) { const z = union([cr, ...dentro.map((q) => ({ x: q.x - 2, y: q.y - 2, w: q.w + 4, h: q.h + 4 }))]); cr = bandas.length > 1 ? { ...cr, y: z.y, h: z.h } : z; }
      if (cr.h > MAX_ALTO && r.length) {
        const ok = r.filter((q) => !q.error); const z = union(ok); const y0 = Math.max(cr.y, z.y - M), y1 = Math.min(cr.y + cr.h, z.y + z.h + M);
        cr = { ...cr, y: y0, h: y1 - y0 }; avisos.push(`front recortado a zona de números (${Math.round(cr.h)}px)`);
      }
      imgs.push(await clip(p, cr, docW));
    }
    if (imgs.length) apilar(imgs, nombre('sitio'));
    await p.close();
  }
  const n = l.pares.length;
  console.log(`${l.id}: ${n} pares; ${avisos.length ? 'AVISOS: ' + avisos.join(' | ') : 'sin avisos'}`);
}

// Lámina SEO: tarjeta con los valores reales del <head> de la página pública.
async function vistaPrevia(f) {
  const html = await (await fetch(t.site + f.url)).text();
  const meta = (re) => (html.match(re) || [])[1] || '';
  const dec = (s) => s.replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&#8211;/g, '–').replace(/&#8217;/g, '’');
  const titulo = dec(meta(/<title[^>]*>([^<]*)<\/title>/i));
  const desc = dec(meta(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i));
  const og = meta(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const pagina = `<!doctype html><meta charset=utf-8><body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif"><div class="seo-preview-mockup" style="padding:28px;display:flex;gap:28px;align-items:flex-start;width:1224px;box-sizing:content-box">
  <div style="flex:1"><div style="font:700 13px Arial;color:#6b7280;margin-bottom:10px;text-transform:uppercase;padding:0 0 14px 34px">Resultado en Google</div>
  <div class="seo-preview-google" style="background:#fff;border-radius:10px;padding:20px 22px 20px 72px;box-shadow:0 1px 3px rgba(0,0,0,.15)">
   <div style="font-size:13px;color:#4d5156;margin-bottom:6px">lapazsipasa.com › boletin › edicion-02</div>
   <div class="seo-titulo" style="font-size:20px;line-height:1.3;color:#1a0dab;margin-bottom:6px;display:inline-block">${esc(titulo)}</div>
   <div class="seo-descripcion" style="font-size:14px;line-height:1.55;color:#4d5156">${esc(desc)}</div></div></div>
  <div style="width:420px"><div style="font:700 13px Arial;color:#6b7280;margin-bottom:10px;text-transform:uppercase;padding:0 0 14px 34px">Al compartir (WhatsApp, redes)</div>
  <div class="seo-preview-social" style="background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.15)">
   <img class="seo-imagen" src="${og}" style="display:block;width:100%;height:220px;object-fit:contain;background:#e5e7eb">
   <div style="padding:14px 16px"><div style="font-size:12px;color:#6b7280;margin-bottom:4px">lapazsipasa.com</div>
   <div class="seo-titulo" style="font-size:16px;font-weight:700;color:#111;margin-bottom:4px">${esc(titulo)}</div>
   <div class="seo-descripcion" style="font-size:13px;color:#4b5563;line-height:1.45">${esc(desc.length > 140 ? desc.slice(0, 137) + '…' : desc)}</div></div></div></div></div></body>`;
  console.log('SEO head:', JSON.stringify({ titulo, desc: desc.slice(0, 60) + '…', og }));
  return '@html:' + pagina;
}

const cookies = sesion();
const lista = MAPA.laminas.filter((l) => !solo.length || solo.some((s) => l.id.startsWith(s)));
try { for (const l of lista) await lamina(l, cookies); }
finally { for (const id of BORRADORES) { try { wp(`post delete ${id} --force`); } catch {} } }
await t.finish();
