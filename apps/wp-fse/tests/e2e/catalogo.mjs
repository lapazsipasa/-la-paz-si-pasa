// node tests/e2e/catalogo.mjs — requiere el stack local en :8090 con el seed de productores.
import { createBrowserTests } from './lib.mjs';
import { CATALOGO, CATALOGO_SLUG, PLANTILLA_CATALOGO, conLimpieza, conteoDe, enteros, esperar, norm, productoresSeed, seguro, sembrar, sinDesborde, tarjetasDe, tipografiaGeneral, wp, wpJson } from './fcp-lib.mjs';

const tests = createBrowserTests();
const site = tests.site;
const url = ( params = '' ) => new URL( `${ CATALOGO }${ params }`, site ).href;
const servido = async ( params ) => ( await fetch( url( params ) ) ).text();
const productores = productoresSeed();
const TOTAL = productores.length;
const PENULTIMA = Math.floor( ( TOTAL - 1 ) / 36 ) * 36; // última tanda antes de agotar «Ver más»
const textoDe = ( p ) => norm( [ p.nombre, p.departamento, p.municipio, ...p.categorias, ...p.productos ].join( ' ' ) );
// «N de TOTAL productores · …» → { n, total }, exacto (nada de «algún entero del texto»).
const parteConteo = ( texto ) => {
	const m = /^(\d[\d.,\s\u00a0]*?)\s+de\s+(\d[\d.,\s\u00a0]*?)\s+productores/.exec( texto ?? '' );
	return m ? { n: enteros( m[ 1 ] )[ 0 ], total: enteros( m[ 2 ] )[ 0 ] } : null;
};
const esConteo = ( texto, n, total = TOTAL ) => {
	const c = parteConteo( texto );
	return c !== null && c.n === n && c.total === total;
};
// Clic real del ratón sobre un elemento (sin tocar JS de la página); devuelve su visibilidad.
async function pulsar( page, selector ) {
	const r = await page.evaluate( `(() => { const b=document.querySelector(${ JSON.stringify( selector ) }); if(!b) return null; b.scrollIntoView({block:'center',behavior:'instant'}); const c=b.getBoundingClientRect(), s=getComputedStyle(b); return {x:c.x+c.width/2,y:c.y+c.height/2,visible:c.width>0&&c.height>0&&s.visibility!=='hidden'&&s.display!=='none'}; })()` );
	if ( ! r?.visible ) return r;
	for ( const type of [ 'mousePressed', 'mouseReleased' ] )
		await page.send( 'Input.dispatchMouseEvent', { type, x: r.x, y: r.y, button: 'left', clickCount: 1 } );
	return r;
}
const cuenta = ( lista ) =>
	lista.reduce( ( m, k ) => m.set( norm( k ), ( m.get( norm( k ) ) ?? 0 ) + 1 ), new Map() );

let terminos;
const slugDe = ( tax, nombre ) => terminos[ tax ].find( ( t ) => norm( t.name ) === norm( nombre ) );
const publicados = () => wpJson( 'global $wpdb; echo wp_json_encode(["pub"=>(int)$wpdb->get_var("SELECT COUNT(*) FROM $wpdb->posts WHERE post_type=\'productor\' AND post_status=\'publish\'"),"dup"=>(int)$wpdb->get_var("SELECT COUNT(*) FROM (SELECT post_title FROM $wpdb->posts WHERE post_type=\'productor\' AND post_status=\'publish\' GROUP BY post_title HAVING COUNT(*)>1) d")]);' );

async function seed() {
	sembrar( 'productores' );
	sembrar( 'productores' );
	terminos = wpJson(
		'$o=[]; foreach(["departamento","categoria_productor"] as $t){ $o[$t]=array_map(fn($x)=>["name"=>$x->name,"slug"=>$x->slug,"count"=>$x->count],get_terms(["taxonomy"=>$t,"hide_empty"=>false])); } $o["total"]=(int)wp_count_posts("productor")->publish; echo wp_json_encode($o);'
	);
	const p = publicados();
	tests.check( 'Seed productores idempotente: 316 publicados y sin títulos repetidos tras dos corridas', p.pub === 316 && p.dup === 0 && TOTAL === 316, `${ JSON.stringify( p ) } / json ${ TOTAL }` );
}

// Texto del conteo de una URL servida, parseado.
const conteoServido = async ( params ) => conteoDe( await servido( params ) );

async function hero() {
	const r = await fetch( url(), { redirect: 'manual' } );
	tests.check( `${ CATALOGO } responde 200`, r.status === 200, `HTTP ${ r.status }` );
	await r.body?.cancel();
	const esperado = [ TOTAL, new Set( productores.map( ( p ) => p.departamento ) ).size, new Set( productores.flatMap( ( p ) => p.categorias ) ).size ];
	const page = await tests.openPage( url(), 1440 );
	try {
		const tiles = await page.evaluate( `[...document.querySelectorAll('.wp-block-lapaz-catalogo-portada .tile')].map(t=>({n:t.querySelector('.n')?.textContent.trim(),l:t.querySelector('.l')?.textContent.trim()}))` );
		tests.check( 'Hero: existen exactamente tres cifras (.tile) en .wp-block-lapaz-catalogo-portada', tiles.length === 3, JSON.stringify( tiles ) );
		esperado.forEach( ( n, i ) =>
			tests.check( `Hero: cifra ${ i + 1 } (${ tiles[ i ]?.l }) = ${ n } según productores.json`, tiles.length === 3 && enteros( tiles[ i ].n ).length === 1 && enteros( tiles[ i ].n )[ 0 ] === n, `visto «${ tiles[ i ]?.n }»` )
		);
		const externas = page.requests.filter( ( u ) => /fonts\.(googleapis|gstatic)\.com/.test( u ) );
		await tipografiaGeneral( tests, page, CATALOGO );
		tests.check( `${ CATALOGO }: sin peticiones a Google Fonts`, externas.length === 0 );
	} finally {
		page.close();
	}
}

async function conteos() {
	// Barras de la página contra el JSON.
	const porDepto = cuenta( productores.map( ( p ) => p.departamento ) );
	const porCat = cuenta( productores.flatMap( ( p ) => p.categorias ) );
	for ( const [ tax, esperado ] of [ [ 'departamento', porDepto ], [ 'categoria_productor', porCat ] ] ) {
		// Los términos sin productores no son filtros válidos (el catálogo usa hide_empty): se ignoran.
		const lista = terminos[ tax ].filter( ( t ) => t.count > 0 );
		const malos = lista.filter( ( t ) => ( esperado.get( norm( t.name ) ) ?? 0 ) !== t.count );
		tests.check( `Conteo nativo de ${ tax } = productores.json`, malos.length === 0 && lista.length === esperado.size, JSON.stringify( malos.slice( 0, 3 ) ) );
		// Resultados filtrados de cada término.
		const fallos = [];
		for ( const t of lista ) {
			const c = await conteoServido( tax === 'departamento' ? `?departamento=${ t.slug }` : `?categoria[]=${ t.slug }` );
			if ( ! esConteo( c, esperado.get( norm( t.name ) ) ) ) fallos.push( `${ t.slug }: «${ c }»` );
		}
		tests.check( `Filtrar por cada ${ tax } (${ lista.length }) muestra «N de ${ TOTAL }» con el N del JSON`, lista.length > 0 && fallos.length === 0, fallos.slice( 0, 3 ).join( '; ' ) );
	}
	const page = await tests.openPage( url(), 1440 );
	try {
		const grupos = await page.evaluate( `[...document.querySelectorAll('section.distribucion .dist > div')].map(d=>[...d.querySelectorAll('a.barra')].map(a=>({nm:a.querySelector('.nm')?.textContent.trim(),v:a.querySelector('.v')?.textContent.trim()})))` );
		// Departamentos: los 15 con más productores; categorías: todas. Derivado de los datos.
		const topDepto = [ ...porDepto.values() ].sort( ( a, b ) => b - a ).slice( 0, 15 );
		const esperadas = [ topDepto.length, porCat.size ];
		tests.check( `Distribución: ${ esperadas[ 0 ] } barras de departamento y ${ esperadas[ 1 ] } de categoría (derivadas del JSON)`, grupos.length === 2 && grupos[ 0 ].length === esperadas[ 0 ] && grupos[ 1 ].length === esperadas[ 1 ], JSON.stringify( grupos.map( ( g ) => g.length ) ) );
		if ( grupos.length === 2 ) {
			const valor = ( b ) => ( enteros( b.v ).length === 1 ? enteros( b.v )[ 0 ] : null );
			const malasD = grupos[ 0 ].filter( ( b ) => valor( b ) !== porDepto.get( norm( b.nm ) ) );
			const malasC = grupos[ 1 ].filter( ( b ) => valor( b ) !== porCat.get( norm( b.nm ) ) );
			tests.check( 'Distribución: el valor de cada barra = conteo del JSON', grupos[ 0 ].length > 0 && grupos[ 1 ].length > 0 && malasD.length + malasC.length === 0, JSON.stringify( [ ...malasD, ...malasC ].slice( 0, 3 ) ) );
			tests.check( 'Distribución: las barras de departamento son las 15 con más productores, de mayor a menor', JSON.stringify( grupos[ 0 ].map( valor ) ) === JSON.stringify( topDepto ), JSON.stringify( grupos[ 0 ].map( valor ) ) );
		}
	} finally {
		page.close();
	}
}

async function busqueda() {
	const cafe = productores.filter( ( p ) => textoDe( p ).includes( 'cafe' ) ).length;
	const planadas = productores.filter( ( p ) => textoDe( p ).includes( 'planadas' ) ).length;
	const c1 = await conteoServido( '?buscar=cafe' );
	const c2 = await conteoServido( `?buscar=${ encodeURIComponent( 'café' ) }` );
	tests.check( '«cafe» encuentra exactamente los productores con «Café»', cafe > 0 && esConteo( c1, cafe ), `esperado ${ cafe } de ${ TOTAL }, «${ c1 }»` );
	tests.check( '«café» y «cafe» dan el mismo conteo', esConteo( c2, cafe ) && c1 === c2, `«${ c1 }» vs «${ c2 }»` );
	const h = await servido( '?buscar=Planadas' );
	tests.check( 'Buscar «Planadas» (municipio) encuentra exactamente sus productores', planadas > 0 && esConteo( conteoDe( h ), planadas ) && tarjetasDe( h ) === planadas && /Planadas/.test( h.split( 'class="grid' )[ 1 ] ?? '' ), `esperado ${ planadas }, «${ conteoDe( h ) }»` );
	const corta = await conteoServido( '?buscar=c' );
	tests.check( 'Búsqueda de 1 carácter se ignora (no filtra)', esConteo( corta, TOTAL ), String( corta ) );
	// Estado vacío: sin coincidencias.
	const vacio = await servido( '?buscar=zzxqwvk' );
	tests.check( 'Búsqueda sin coincidencias: conteo «0 de 316», mensaje de vacío y ninguna tarjeta', esConteo( conteoDe( vacio ), 0 ) && tarjetasDe( vacio ) === 0 && /class="vacio"[^>]*>\s*No hay productores/.test( vacio ) && ! /class="[^"]*\bmas\b/.test( vacio ), `«${ conteoDe( vacio ) }», ${ tarjetasDe( vacio ) } tarjetas` );
}

async function hostiles() {
	const unaCat = terminos.categoria_productor.find( ( t ) => t.count > 0 );
	const muchas = [ unaCat.slug, ...Array.from( { length: 24 }, ( _, i ) => `no-existe-${ i }` ) ].map( ( s ) => `categoria[]=${ s }` ).join( '&' );
	const casos = [
		[ 'ver=999999', ( h ) => tarjetasDe( h ) === TOTAL ],
		[ 'ver=abc', ( h ) => tarjetasDe( h ) === 36 ],
		[ 'ver=-5', ( h ) => tarjetasDe( h ) === 36 ],
		[ `departamento=${ encodeURIComponent( '<script>alert(1)</script>' ) }`, ( h ) => ! h.includes( '<script>alert(1)</script>' ) ],
		[ `buscar=${ encodeURIComponent( '<img src=x onerror=alert(1)>' ) }`, ( h ) => ! /<img src=x onerror/i.test( h ) ],
		[ `categoria[]=${ encodeURIComponent( '"><svg onload=alert(1)>' ) }`, ( h ) => ! /<svg onload/i.test( h ) ],
		[ 'categoria=%27%20OR%201=1', ( h ) => ! /OR 1=1/.test( h ) ],
		[ muchas, ( h ) => tarjetasDe( h ) > 0 && parteConteo( conteoDe( h ) ) !== null ],
	];
	for ( const [ params, ok ] of casos ) {
		const r = await fetch( url( `?${ params }` ) );
		const html = await r.text();
		tests.check( `Parámetro hostil ${ decodeURIComponent( params ).slice( 0, 40 ) }${ params === muchas ? ' (25 valores)' : '' }: 200 y sin inyección`, r.status === 200 && ok( html ), `HTTP ${ r.status }; tarjetas ${ tarjetasDe( html ) }` );
	}
}

// Esto mide la plantilla de bloques renderizada en proceso (wp eval + do_blocks), no una petición HTTP
// completa: cuenta los SELECT del listado de productores. El COUNT de wp_count_posts del hero no cuenta.
async function consultaUnica() {
	const slug = terminos.departamento.find( ( t ) => t.count > 0 )?.slug ?? '';
	for ( const get of [ '[]', `["buscar"=>"cafe","departamento"=>"${ slug }"]` ] ) {
		const r = wpJson(
			`$GLOBALS["__q"]=[]; add_filter("query",function($s){$GLOBALS["__q"][]=$s;return $s;}); $_GET=${ get }; $_REQUEST=$_GET; $p=get_page_by_path("${ CATALOGO_SLUG }"); $GLOBALS["post"]=$p; setup_postdata($p); $t=get_block_template(get_stylesheet()."//${ PLANTILLA_CATALOGO }"); $out=do_blocks($t->content); $re="/^\\s*SELECT\\s+(SQL_CALC_FOUND_ROWS\\s+)?".preg_quote($GLOBALS["wpdb"]->posts,"/")."\\..*post_type\\s*(=|IN)\\s*\\(?'productor'/is"; $q=array_filter($GLOBALS["__q"],fn($x)=>preg_match($re,$x)); echo wp_json_encode(["n"=>count($q),"render"=>str_contains($out,"conteo")]);`
		);
		tests.check( `La plantilla ${ PLANTILLA_CATALOGO } emite una sola consulta SQL de listado de productores (${ get }; mide la plantilla en proceso, no una petición HTTP)`, r.render && r.n === 1, JSON.stringify( r ) );
	}
}

async function proyectos() {
	const page = await tests.openPage( new URL( '/proyectos-destacados/', site ).href, 1440 );
	try {
		const rutas = await page.evaluate( `[...document.querySelectorAll('.wp-block-lapaz-paisana-hero a')].filter(a=>/paissana/i.test(a.textContent)).map(a=>new URL(a.href).pathname)` );
		tests.check( `El botón PAISSANA de /proyectos-destacados/ lleva a ${ CATALOGO }`, rutas.includes( CATALOGO ), JSON.stringify( rutas ) );
	} finally {
		page.close();
	}
}

// Alta de un productor __prueba (departamento, categoría, municipio) y su baja: todo vuelve a como estaba.
async function altaYBaja() {
	const dep = slugDe( 'departamento', productores[ 0 ].departamento );
	const cat = slugDe( 'categoria_productor', productores[ 0 ].categorias[ 0 ] );
	const mun = 'Zzmunicipioprueba';
	const filtros = [ `?departamento=${ dep.slug }`, `?categoria[]=${ cat.slug }`, `?buscar=${ mun }`, '' ];
	const leer = async () => Promise.all( filtros.map( conteoServido ) );
	const antes = await leer();
	const nDep = parteConteo( antes[ 0 ] )?.n;
	const nCat = parteConteo( antes[ 1 ] )?.n;
	tests.check( 'Alta: punto de partida limpio (316, sin resultados para el municipio de prueba)', esConteo( antes[ 2 ], 0 ) && esConteo( antes[ 3 ], TOTAL ) && nDep > 0 && nCat > 0, JSON.stringify( antes ) );
	const { id } = wpJson(
		`$id=wp_insert_post(["post_type"=>"productor","post_status"=>"publish","post_title"=>"__prueba Productor"]); update_field("municipio","${ mun }",$id); update_field("productos","Producto de prueba",$id); wp_set_object_terms($id,["${ dep.slug }"],"departamento"); wp_set_object_terms($id,["${ cat.slug }"],"categoria_productor"); echo wp_json_encode(["id"=>$id]);`
	);
	try {
		const durante = await leer();
		tests.check( 'Alta: sube el total (317) y los conteos de su departamento y su categoría', esConteo( durante[ 3 ], TOTAL + 1, TOTAL + 1 ) && esConteo( durante[ 0 ], nDep + 1, TOTAL + 1 ) && esConteo( durante[ 1 ], nCat + 1, TOTAL + 1 ), JSON.stringify( durante ) );
		const html = await servido( `?buscar=${ mun }` );
		tests.check( 'Alta: se le encuentra por su municipio (texto de búsqueda) y aparece su tarjeta', esConteo( conteoDe( html ), 1, TOTAL + 1 ) && tarjetasDe( html ) === 1 && html.includes( '__prueba Productor' ), `«${ conteoDe( html ) }»` );
		const sinFiltro = await servido( `?ver=${ 36 * 10 }` );
		tests.check( 'Alta: aparece en el catálogo completo', sinFiltro.includes( '__prueba Productor' ) && tarjetasDe( sinFiltro ) === TOTAL + 1, `${ tarjetasDe( sinFiltro ) } tarjetas` );
		// Renombrar o borrar un término reindexa el texto de búsqueda de sus productores.
		wp( `$t=wp_insert_term("Zzdeptoprueba","departamento"); wp_set_object_terms(${ Number( id ) },[(int)$t["term_id"]],"departamento",true); echo 1;` );
		wp( `$t=get_term_by("name","Zzdeptoprueba","departamento"); wp_update_term($t->term_id,"departamento",["name"=>"Zzdeptorenombrado"]); echo 1;` );
		const renombrado = await servido( '?buscar=Zzdeptorenombrado' );
		tests.check( 'Renombrar un departamento: se encuentra al productor por el nombre nuevo', esConteo( conteoDe( renombrado ), 1, TOTAL + 1 ) && renombrado.includes( '__prueba Productor' ), `«${ conteoDe( renombrado ) }»` );
		wp( `$t=get_term_by("name","Zzdeptorenombrado","departamento"); wp_delete_term($t->term_id,"departamento"); echo 1;` );
		const borrado = await servido( '?buscar=Zzdeptorenombrado' );
		tests.check( 'Borrar un departamento: el productor deja de salir por ese nombre', esConteo( conteoDe( borrado ), 0, TOTAL + 1 ), `«${ conteoDe( borrado ) }»` );
	} finally {
		wp( `wp_delete_post(${ Number( id ) },true); foreach(["Zzdeptoprueba","Zzdeptorenombrado"] as $n){ $t=get_term_by("name",$n,"departamento"); if($t) wp_delete_term($t->term_id,"departamento"); } echo 1;` );
	}
	const despues = await leer();
	tests.check( 'Baja: el total, los conteos de sus términos y la búsqueda por municipio vuelven a como estaban', JSON.stringify( despues ) === JSON.stringify( antes ), JSON.stringify( despues ) );
	const p = publicados();
	tests.check( 'Baja: 316 publicados y sin títulos repetidos', p.pub === TOTAL && p.dup === 0, JSON.stringify( p ) );
}

// Espera a que lo pintado coincida con lo que el servidor devolvería para la URL actual.
async function consistente( page ) {
	let actual = null;
	const ok = await esperar( tests, async () => {
		actual = await seguro( page, `({href:location.href,texto:document.querySelector('.conteo')?.textContent.replace(/\\s+/g,' ').trim()??null})` );
		if ( ! actual ) return false;
		const servidor = conteoDe( await ( await fetch( actual.href ) ).text() );
		return servidor !== null && servidor === actual.texto;
	}, 6000 );
	return { ok, actual };
}

async function sinJs() {
	const depto = terminos.departamento.slice().sort( ( a, b ) => b.count - a.count )[ 0 ];
	const delDepto = productores.filter( ( p ) => norm( p.departamento ) === norm( depto.name ) );
	const esperado = delDepto.length;
	const esperadoCafe = delDepto.filter( ( p ) => textoDe( p ).includes( 'cafe' ) ).length;
	const page = await tests.openPage( 'about:blank', 1440 );
	try {
		await page.send( 'Emulation.setScriptExecutionDisabled', { value: true } );
		await page.send( 'Page.navigate', { url: url() } );
		await esperar( tests, async () => ( await seguro( page, `document.readyState === 'complete' && Boolean(document.querySelector('.conteo'))` ) ) === true, 8000 );
		const antes = await page.evaluate( `({js:document.querySelector('.wp-block-lapaz-catalogo')?.classList.contains('js-activo'),conteo:document.querySelector('.conteo')?.textContent.replace(/\\s+/g,' ').trim(),metodo:document.querySelector('form.filtros')?.method})` );
		tests.check( 'Sin JS: el bloque no tiene js-activo y el formulario es GET', antes.js === false && antes.metodo === 'get', JSON.stringify( antes ) );
		await page.evaluate( `document.querySelector('form.filtros select[name=departamento]').value=${ JSON.stringify( depto.slug ) }` );
		const boton = await pulsar( page, 'form.filtros button[type=submit]' );
		tests.check( 'Sin JS: el botón «Buscar» existe, es visible y dice «Buscar»', boton?.visible === true && ( await page.evaluate( `document.querySelector('form.filtros button[type=submit]').textContent.trim()` ) ) === 'Buscar', JSON.stringify( boton ) );
		await esperar( tests, async () => ( await seguro( page, `location.search.includes('departamento=${ depto.slug }') && document.readyState === 'complete' && Boolean(document.querySelector('.conteo'))` ) ) === true, 8000 );
		const despues = await page.evaluate( `({search:location.search,conteo:document.querySelector('.conteo')?.textContent.replace(/\\s+/g,' ').trim()})` );
		tests.check( 'Sin JS: pulsar «Buscar» pone el filtro en la URL', despues.search.includes( `departamento=${ depto.slug }` ), despues.search );
		tests.check( 'Sin JS: el conteo cambia y es «N de 316» con el N del JSON', despues.conteo !== antes.conteo && esConteo( despues.conteo, esperado ), `${ antes.conteo } → ${ despues.conteo } (esperado ${ esperado })` );
		await page.evaluate( `document.querySelector('form.filtros input[type=search]').value='cafe'` );
		await pulsar( page, 'form.filtros button[type=submit]' );
		await esperar( tests, async () => ( await seguro( page, `location.search.includes('buscar=cafe') && document.readyState === 'complete' && Boolean(document.querySelector('.conteo'))` ) ) === true, 8000 );
		const buscado = await page.evaluate( `({search:location.search,conteo:document.querySelector('.conteo')?.textContent.replace(/\\s+/g,' ').trim()})` );
		tests.check( 'Sin JS: buscar «cafe» pone buscar=cafe (y conserva el departamento) y el conteo es el del JSON', buscado.search.includes( 'buscar=cafe' ) && buscado.search.includes( `departamento=${ depto.slug }` ) && esConteo( buscado.conteo, esperadoCafe ), `${ JSON.stringify( buscado ) } (esperado ${ esperadoCafe })` );
	} finally {
		page.close();
	}
}

async function conJs() {
	const marca = ( page ) => page.evaluate( 'window.__sinRecarga === 1' );
	const cargando = ( page ) => page.evaluate( `Boolean(document.querySelector('.cargando'))` );
	const teclear = async ( page, texto ) => {
		await page.evaluate( `(() => { const i=document.querySelector('.filtros input[type=search]'); i.focus(); i.select(); return 1; })()` );
		await page.send( 'Input.insertText', { text: texto } );
	};
	const cafe = productores.filter( ( p ) => textoDe( p ).includes( 'cafe' ) ).length;
	let page = await tests.openPage( url(), 1440 );
	try {
		tests.check( 'Con JS: el bloque recibe js-activo', await page.evaluate( `document.querySelector('.wp-block-lapaz-catalogo')?.classList.contains('js-activo') ?? false` ) );
		await page.evaluate( 'window.__sinRecarga = 1' );
		const paso = async ( nombre, accion, urlOk ) => {
			await page.evaluate( accion );
			const cambio = await esperar( tests, async () => page.evaluate( urlOk ) );
			const c = await consistente( page );
			tests.check( `Con JS: ${ nombre } cambia la URL, no recarga y los resultados coinciden con el servidor`, cambio && ( await marca( page ) ) && c.ok && ! ( await cargando( page ) ), `${ cambio } ${ JSON.stringify( c.actual ) }` );
		};
		await teclear( page, 'cafe' );
		await esperar( tests, async () => page.evaluate( `location.search.includes('buscar=cafe')` ) );
		const c1 = await consistente( page );
		tests.check( 'Con JS: tras navegar no queda el estado «cargando»', ! ( await cargando( page ) ) );
		tests.check( 'Con JS: escribir en la búsqueda cambia la URL, no recarga y el conteo es el del JSON', ( await marca( page ) ) && c1.ok && /buscar=cafe/.test( c1.actual?.href ) && esConteo( c1.actual?.texto, cafe ), JSON.stringify( c1.actual ) );
		const slug = terminos.departamento.find( ( t ) => t.count > 0 ).slug;
		await paso( 'cambiar el selector de departamento', `(() => { const s=document.querySelector('.filtros select[name=departamento]'); s.value=${ JSON.stringify( slug ) }; s.dispatchEvent(new Event('change',{bubbles:true})); return 1; })()`, `location.search.includes('departamento=${ slug }')` );
		await paso( 'marcar una categoría', `(() => { document.querySelector('.chip input[type=checkbox]').click(); return 1; })()`, `location.search.includes('categoria')` );
		const mid = await page.evaluate( 'location.href' );
		await page.evaluate( 'history.back()' );
		const volvio = await esperar( tests, async () => ! ( await page.evaluate( `location.search.includes('categoria')` ) ) );
		const cb = await consistente( page );
		const estado = await page.evaluate( `({marcadas:document.querySelectorAll('.chip input:checked').length,buscar:document.querySelector('.filtros input[type=search]').value,depto:document.querySelector('.filtros select[name=departamento]').value})` );
		tests.check( 'Con JS: «atrás» restaura URL, resultados y controles sin recargar', volvio && cb.ok && ( await marca( page ) ) && estado.marcadas === 0 && estado.buscar === 'cafe' && estado.depto === slug, JSON.stringify( estado ) );
		await page.evaluate( 'history.forward()' );
		const adelante = await esperar( tests, async () => ( await page.evaluate( 'location.href' ) ) === mid );
		const cf = await consistente( page );
		const marcadas = await page.evaluate( `document.querySelectorAll('.chip input:checked').length` );
		tests.check( 'Con JS: «adelante» restaura la categoría marcada sin recargar', adelante && cf.ok && ( await marca( page ) ) && marcadas === 1, `${ marcadas } marcadas` );
	} finally {
		page.close();
	}
	// Barra y «Ver más», desde el catálogo sin filtros (316 > 36).
	page = await tests.openPage( url(), 1440 );
	try {
		await page.evaluate( 'window.__sinRecarga = 1' );
		const antes = await page.evaluate( `document.querySelectorAll('.card').length` );
		await page.evaluate( `document.querySelector('a.mas')?.click()` );
		await esperar( tests, async () => page.evaluate( `location.search.includes('ver=72')` ) );
		const c = await consistente( page );
		const tras = await page.evaluate( `document.querySelectorAll('.card').length` );
		tests.check( 'Con JS: «Ver más» pone ver=72, muestra 72 tarjetas y no recarga', antes === 36 && tras === 72 && c.ok && ( await marca( page ) ) && ! ( await cargando( page ) ), `${ antes } → ${ tras }` );
		await page.evaluate( `document.querySelector('section.distribucion a.barra')?.click()` );
		await esperar( tests, async () => page.evaluate( `/departamento=|categoria/.test(location.search)` ) );
		const cb = await consistente( page );
		tests.check( 'Con JS: pulsar una barra filtra, cambia la URL y no recarga', cb.ok && /departamento=|categoria/.test( cb.actual?.href ?? '' ) && ( await marca( page ) ), JSON.stringify( cb.actual ) );
		await page.evaluate( 'history.back()' );
		await esperar( tests, async () => page.evaluate( `location.search.includes('ver=72') && !/departamento=|categoria/.test(location.search)` ) );
		const cv = await consistente( page );
		tests.check( 'Con JS: «atrás» tras la barra vuelve a ver=72 con 72 tarjetas', cv.ok && ( await page.evaluate( `document.querySelectorAll('.card').length` ) ) === 72 && ( await marca( page ) ) );
	} finally {
		page.close();
	}
	// Agotar «Ver más»: el foco pasa al conteo.
	page = await tests.openPage( url( `?ver=${ PENULTIMA }` ), 1440 );
	try {
		await page.evaluate( 'window.__sinRecarga = 1' );
		const antes = await page.evaluate( `({tarjetas:document.querySelectorAll('.card').length,mas:Boolean(document.querySelector('a.mas'))})` );
		await page.evaluate( `document.querySelector('a.mas')?.click()` );
		const agotado = await esperar( tests, async () => ( await seguro( page, `!document.querySelector('a.mas') && document.querySelectorAll('.card').length === ${ TOTAL }` ) ) === true );
		const foco = await esperar( tests, async () => ( await seguro( page, `document.activeElement?.classList.contains('conteo') ?? false` ) ) === true, 3000 );
		tests.check( 'Con JS: al agotar «Ver más» (penúltima tanda → todas las tarjetas, sin enlace) el foco queda en el conteo', antes.tarjetas === PENULTIMA && antes.mas && agotado && foco && ( await marca( page ) ) && ! ( await cargando( page ) ), `${ JSON.stringify( antes ) } agotado=${ agotado } foco=${ await page.evaluate( 'document.activeElement?.tagName + "." + document.activeElement?.className' ) }` );
	} finally {
		page.close();
	}
	// URL con filtros abierta directamente.
	const dep = slugDe( 'departamento', productores[ 0 ].departamento );
	const cat = slugDe( 'categoria_productor', productores[ 0 ].categorias[ 0 ] );
	const params = `?departamento=${ dep.slug }&categoria[]=${ cat.slug }#explorar`;
	const esperado = productores.filter( ( p ) => norm( p.departamento ) === norm( dep.name ) && p.categorias.some( ( c ) => norm( c ) === norm( cat.name ) ) ).length;
	page = await tests.openPage( url( params ), 1440 );
	try {
		const texto = await page.evaluate( `document.querySelector('.conteo')?.textContent.replace(/\\s+/g,' ').trim()` );
		const marcadas = await page.evaluate( `[...document.querySelectorAll('.chip input:checked')].length` );
		tests.check( 'Abrir una URL con filtros muestra esos resultados («N de 316» exacto) y los controles reflejan el filtro', esConteo( texto, esperado ) && marcadas === 1, `esperado ${ esperado }, «${ texto }», ${ marcadas } marcadas` );
	} finally {
		page.close();
	}
}

await conLimpieza( tests, async () => {
	await seed();
	await hero();
	await conteos();
	await busqueda();
	await hostiles();
	await consultaUnica();
	await proyectos();
	await altaYBaja();
	await sinJs();
	await conJs();
	await sinDesborde( tests, url(), 'Catálogo' );
	const p = publicados();
	tests.check( 'Al terminar: exactamente 316 productores publicados y ningún título repetido', p.pub === 316 && p.dup === 0, JSON.stringify( p ) );
} );
