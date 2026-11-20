// node tests/e2e/catalogo.mjs — requiere el stack local en :8090 con el seed de productores.
import { createBrowserTests } from './lib.mjs';
import {
	conLimpieza,
	conteoDe,
	contar,
	enteros,
	esperar,
	norm,
	productoresSeed,
	sembrar,
	sinDesborde,
	tarjetasDe,
	tipografiaGeneral,
	wpJson,
} from './fcp-lib.mjs';

const tests = createBrowserTests();
const site = tests.site;
const url = ( params = '' ) => new URL( `/paissana/${ params }`, site ).href;
const servido = async ( params ) => ( await fetch( url( params ) ) ).text();
const productores = productoresSeed();
const cuenta = ( lista ) =>
	lista.reduce( ( m, k ) => m.set( norm( k ), ( m.get( norm( k ) ) ?? 0 ) + 1 ), new Map() );

let terminos;

async function seed() {
	sembrar( 'productores' );
	sembrar( 'productores' );
	terminos = wpJson(
	'$o=[]; foreach(["departamento","categoria_productor"] as $t){ $o[$t]=array_map(fn($x)=>["name"=>$x->name,"slug"=>$x->slug,"count"=>$x->count],get_terms(["taxonomy"=>$t,"hide_empty"=>false])); } $o["total"]=(int)wp_count_posts("productor")->publish; echo wp_json_encode($o);'
);
	tests.check( 'Seed productores idempotente: 316 tras dos corridas', contar( 'productor' ) === 316 && productores.length === 316, `${ contar( 'productor' ) } / json ${ productores.length }` );
}

async function hero() {
	const r = await fetch( url(), { redirect: 'manual' } );
	tests.check( '/paissana/ responde 200', r.status === 200, `HTTP ${ r.status }` );
	await r.body?.cancel();
	const conProductores = ( l ) => l.filter( ( t ) => t.count > 0 ).length;
	const esperado = [ terminos.total, conProductores( terminos.departamento ), conProductores( terminos.categoria_productor ) ];
	tests.check( 'Cifras de wp-cli coinciden con productores.json (316, departamentos, categorías)', JSON.stringify( esperado ) === JSON.stringify( [ productores.length, new Set( productores.map( ( p ) => p.departamento ) ).size, new Set( productores.flatMap( ( p ) => p.categorias ) ).size ] ), JSON.stringify( esperado ) );
	const page = await tests.openPage( url(), 1440 );
	try {
		const textos = await page.evaluate( `document.querySelector('.wp-block-lapaz-catalogo-portada')?.textContent ?? null` );
		const vistos = enteros( textos );
		tests.check( 'Hero: existe .wp-block-lapaz-catalogo-portada', textos !== null );
		tests.check( 'Hero: las tres cifras coinciden con wp-cli', esperado.every( ( n ) => vistos.includes( n ) ), `esperado ${ esperado }, visto ${ vistos }` );
		const externas = page.requests.filter( ( u ) => /fonts\.(googleapis|gstatic)\.com/.test( u ) );
		await tipografiaGeneral( tests, page, '/paissana/' );
		tests.check( '/paissana/: sin peticiones a Google Fonts', externas.length === 0 );
	} finally {
		page.close();
	}
}

async function conteos() {
	// Barras de la página contra el JSON.
	const porDepto = cuenta( productores.map( ( p ) => p.departamento ) );
	const porCat = cuenta( productores.flatMap( ( p ) => p.categorias ) );
	for ( const [ tax, esperado ] of [ [ 'departamento', porDepto ], [ 'categoria_productor', porCat ] ] ) {
		const malos = terminos[ tax ].filter( ( t ) => ( esperado.get( norm( t.name ) ) ?? 0 ) !== t.count );
		tests.check( `Conteo nativo de ${ tax } = productores.json`, malos.length === 0 && terminos[ tax ].length === esperado.size, JSON.stringify( malos.slice( 0, 3 ) ) );
		// Resultados filtrados de cada término.
		const fallos = [];
		for ( const t of terminos[ tax ] ) {
			const html = await servido( tax === 'departamento' ? `?departamento=${ t.slug }` : `?categoria[]=${ t.slug }` );
			if ( ! enteros( conteoDe( html ) ).includes( esperado.get( norm( t.name ) ) ) ) fallos.push( `${ t.slug }: «${ conteoDe( html ) }»` );
		}
		tests.check( `Filtrar por cada ${ tax } muestra el conteo del JSON`, fallos.length === 0, fallos.slice( 0, 3 ).join( '; ' ) );
	}
	const page = await tests.openPage( url(), 1440 );
	try {
		const barras = await page.evaluate( `[...document.querySelectorAll('section.distribucion a.barra')].map(a=>({nm:a.querySelector('.nm')?.textContent.trim(),v:a.querySelector('.v')?.textContent.trim()}))` );
		const todos = new Map( [ ...porDepto, ...porCat ] );
		const malas = barras.filter( ( b ) => ! enteros( b.v ).includes( todos.get( norm( b.nm ) ) ) );
		tests.check( 'Distribución: hay barras (15 departamentos + 10 categorías)', barras.length === 25, String( barras.length ) );
		tests.check( 'Distribución: el valor de cada barra = conteo del JSON', barras.length > 0 && malas.length === 0, JSON.stringify( malas.slice( 0, 3 ) ) );
	} finally {
		page.close();
	}
}

async function busqueda() {
	const cafe = productores.filter( ( p ) => norm( [ p.nombre, p.departamento, p.municipio, ...p.categorias, ...p.productos ].join( ' ' ) ).includes( 'cafe' ) ).length;
	const html = await servido( '?buscar=cafe' );
	const conTilde = await servido( `?buscar=${ encodeURIComponent( 'café' ) }` );
	tests.check( '«cafe» encuentra productores con «Café»', cafe > 0 && enteros( conteoDe( html ) ).includes( cafe ), `esperado ${ cafe }, «${ conteoDe( html ) }»` );
	tests.check( '«café» y «cafe» dan el mismo conteo', conteoDe( html ) === conteoDe( conTilde ), `«${ conteoDe( html ) }» vs «${ conteoDe( conTilde ) }»` );
	const planadas = productores.filter( ( p ) => norm( [ p.nombre, p.departamento, p.municipio, ...p.categorias, ...p.productos ].join( ' ' ) ).includes( 'planadas' ) ).length;
	const h = await servido( '?buscar=Planadas' );
	tests.check( 'Buscar «Planadas» (municipio) encuentra sus productores', planadas > 0 && enteros( conteoDe( h ) ).includes( planadas ) && /Planadas/.test( h.split( 'class="grid' )[ 1 ] ?? '' ), `esperado ${ planadas }, «${ conteoDe( h ) }»` );
	const corta = await servido( '?buscar=c' );
	tests.check( 'Búsqueda de 1 carácter se ignora (no filtra)', enteros( conteoDe( corta ) ).includes( 316 ), conteoDe( corta ) );
}

async function hostiles() {
	const casos = [
		[ 'ver=999999', ( h ) => tarjetasDe( h ) === 316 ],
		[ 'ver=abc', ( h ) => tarjetasDe( h ) === 36 ],
		[ 'ver=-5', ( h ) => tarjetasDe( h ) === 36 ],
		[ `departamento=${ encodeURIComponent( '<script>alert(1)</script>' ) }`, ( h ) => ! h.includes( '<script>alert(1)</script>' ) ],
		[ `buscar=${ encodeURIComponent( '<img src=x onerror=alert(1)>' ) }`, ( h ) => ! /<img src=x onerror/i.test( h ) ],
		[ `categoria[]=${ encodeURIComponent( '"><svg onload=alert(1)>' ) }`, ( h ) => ! /<svg onload/i.test( h ) ],
		[ 'categoria=%27%20OR%201=1', ( h ) => ! /OR 1=1/.test( h ) ],
	];
	for ( const [ params, ok ] of casos ) {
		const r = await fetch( url( `?${ params }` ) );
		const html = await r.text();
		tests.check( `Parámetro hostil ${ decodeURIComponent( params ).slice( 0, 40 ) }: 200 y sin inyección`, r.status === 200 && ok( html ), `HTTP ${ r.status }; tarjetas ${ tarjetasDe( html ) }` );
	}
}

// Una sola consulta de listado de productores por petición, medida en proceso con el filtro `query`
// (el COUNT de wp_count_posts del hero no cuenta: es un agregado, no el listado).
async function consultaUnica() {
	const slug = terminos.departamento.find( ( t ) => t.count > 0 )?.slug ?? '';
	for ( const get of [ '[]', `["buscar"=>"cafe","departamento"=>"${ slug }"]` ] ) {
		const r = wpJson(
			`$GLOBALS["__q"]=[]; add_filter("query",function($s){$GLOBALS["__q"][]=$s;return $s;}); $_GET=${ get }; $_REQUEST=$_GET; $p=get_page_by_path("paissana"); $GLOBALS["post"]=$p; setup_postdata($p); $t=get_block_template(get_stylesheet()."//page-paissana"); $out=do_blocks($t->content); $q=array_filter($GLOBALS["__q"],fn($x)=>preg_match("/^\\s*SELECT\\s+(SQL_CALC_FOUND_ROWS\\s+)?wp_posts\\..*post_type\\s*(=|IN)\\s*\\(?'productor'/is",$x)); echo wp_json_encode(["n"=>count($q),"render"=>str_contains($out,"conteo")]);`
		);
		tests.check( `Una sola consulta SQL de productor por petición (${ get }; medido en proceso, sin Query Monitor)`, r.render && r.n === 1, JSON.stringify( r ) );
	}
}

async function proyectos() {
	const page = await tests.openPage( new URL( '/proyectos-destacados/', site ).href, 1440 );
	try {
		const rutas = await page.evaluate( `[...document.querySelectorAll('.wp-block-lapaz-paisana-hero a')].filter(a=>/paissana/i.test(a.textContent)).map(a=>new URL(a.href).pathname)` );
		tests.check( 'El botón PAISSANA de /proyectos-destacados/ lleva a /paissana/', rutas.includes( '/paissana/' ), JSON.stringify( rutas ) );
	} finally {
		page.close();
	}
}

// Espera a que lo pintado coincida con lo que el servidor devolvería para la URL actual.
async function consistente( page ) {
	let actual = null;
	const ok = await esperar( tests, async () => {
		actual = await page.evaluate( `({href:location.href,texto:document.querySelector('.conteo')?.textContent.replace(/\\s+/g,' ').trim()??null})` );
		const servidor = conteoDe( await ( await fetch( actual.href ) ).text() );
		return servidor !== null && servidor === actual.texto;
	}, 6000 );
	return { ok, actual };
}

async function sinJs() {
	const slug = terminos.departamento.slice().sort( ( a, b ) => b.count - a.count )[ 0 ];
	const esperado = productores.filter( ( p ) => norm( p.departamento ) === norm( slug.name ) ).length;
	const page = await tests.openPage( 'about:blank', 1440 );
	try {
		await page.send( 'Emulation.setScriptExecutionDisabled', { value: true } );
		await page.send( 'Page.navigate', { url: url() } );
		await tests.sleep( 2500 );
		const antes = await page.evaluate( `({js:document.querySelector('.wp-block-lapaz-catalogo')?.classList.contains('js-activo'),conteo:document.querySelector('.conteo')?.textContent.trim(),metodo:document.querySelector('form.filtros')?.method})` );
		tests.check( 'Sin JS: el bloque no tiene js-activo y el formulario es GET', antes.js === false && antes.metodo === 'get', JSON.stringify( antes ) );
		await page.evaluate( `(() => { const f=document.querySelector('form.filtros'); f.querySelector('select[name=departamento]').value=${ JSON.stringify( slug.slug ) }; f.submit(); return 1; })()` );
		await tests.sleep( 2500 );
		const despues = await page.evaluate( `({search:location.search,conteo:document.querySelector('.conteo')?.textContent.trim()})` );
		tests.check( 'Sin JS: enviar el formulario pone el filtro en la URL', despues.search.includes( `departamento=${ slug.slug }` ), despues.search );
		tests.check( 'Sin JS: el conteo cambia y coincide con el JSON', despues.conteo !== antes.conteo && enteros( despues.conteo ).includes( esperado ), `${ antes.conteo } → ${ despues.conteo } (esperado ${ esperado })` );
		await page.evaluate( `(() => { const f=document.querySelector('form.filtros'); f.querySelector('input[type=search]').value='cafe'; f.submit(); return 1; })()` );
		await tests.sleep( 2500 );
		const buscado = await page.evaluate( `({search:location.search,conteo:document.querySelector('.conteo')?.textContent.trim()})` );
		tests.check( 'Sin JS: buscar «cafe» pone buscar=cafe en la URL y cambia el conteo', buscado.search.includes( 'buscar=cafe' ) && buscado.conteo !== despues.conteo, JSON.stringify( buscado ) );
	} finally {
		page.close();
	}
}

async function conJs() {
	const marca = ( page ) => page.evaluate( 'window.__sinRecarga === 1' );
	const teclear = async ( page, texto ) => {
		await page.evaluate( `(() => { const i=document.querySelector('.filtros input[type=search]'); i.focus(); i.select(); return 1; })()` );
		await page.send( 'Input.insertText', { text: texto } );
	};
	let page = await tests.openPage( url(), 1440 );
	try {
		tests.check( 'Con JS: el bloque recibe js-activo', await page.evaluate( `document.querySelector('.wp-block-lapaz-catalogo')?.classList.contains('js-activo') ?? false` ) );
		await page.evaluate( 'window.__sinRecarga = 1' );
		const paso = async ( nombre, accion, urlOk ) => {
			await page.evaluate( accion );
			const cambio = await esperar( tests, async () => page.evaluate( urlOk ) );
			const c = await consistente( page );
			const cargando = await page.evaluate( `Boolean(document.querySelector('.cargando'))` );
			tests.check( `Con JS: ${ nombre } cambia la URL, no recarga y los resultados coinciden con el servidor`, cambio && ( await marca( page ) ) && c.ok && ! cargando, `${ cambio } ${ JSON.stringify( c.actual ) }` );
		};
		await teclear( page, 'cafe' );
		await esperar( tests, async () => page.evaluate( `location.search.includes('buscar=cafe')` ) );
		const c1 = await consistente( page );
		tests.check( 'Con JS: tras navegar no queda el estado «cargando»', ! ( await page.evaluate( `Boolean(document.querySelector('.cargando'))` ) ) );
		tests.check( 'Con JS: escribir en la búsqueda cambia la URL, no recarga y coincide con el servidor', ( await marca( page ) ) && c1.ok && /buscar=cafe/.test( c1.actual?.href ), JSON.stringify( c1.actual ) );
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
		tests.check( 'Con JS: «Ver más» pone ver=72, muestra 72 tarjetas y no recarga', antes === 36 && tras === 72 && c.ok && ( await page.evaluate( 'window.__sinRecarga === 1' ) ), `${ antes } → ${ tras }` );
		await page.evaluate( `document.querySelector('section.distribucion a.barra')?.click()` );
		await esperar( tests, async () => page.evaluate( `/departamento=|categoria/.test(location.search)` ) );
		const cb = await consistente( page );
		tests.check( 'Con JS: pulsar una barra filtra, cambia la URL y no recarga', cb.ok && /departamento=|categoria/.test( cb.actual?.href ?? '' ) && ( await page.evaluate( 'window.__sinRecarga === 1' ) ), JSON.stringify( cb.actual ) );
		await page.evaluate( 'history.back()' );
		await esperar( tests, async () => page.evaluate( `location.search.includes('ver=72') && !/departamento=|categoria/.test(location.search)` ) );
		const cv = await consistente( page );
		tests.check( 'Con JS: «atrás» tras la barra vuelve a ver=72 con 72 tarjetas', cv.ok && ( await page.evaluate( `document.querySelectorAll('.card').length` ) ) === 72 && ( await page.evaluate( 'window.__sinRecarga === 1' ) ) );
	} finally {
		page.close();
	}
	// URL con filtros abierta directamente.
	const dep = terminos.departamento.find( ( t ) => norm( t.name ) === norm( productores[ 0 ].departamento ) );
	const cat = terminos.categoria_productor.find( ( t ) => norm( t.name ) === norm( productores[ 0 ].categorias[ 0 ] ) );
	const params = `?departamento=${ dep.slug }&categoria[]=${ cat.slug }#explorar`;
	const esperado = productores.filter( ( p ) => norm( p.departamento ) === norm( dep.name ) && p.categorias.some( ( c ) => norm( c ) === norm( cat.name ) ) ).length;
	page = await tests.openPage( url( params ), 1440 );
	try {
		const texto = await page.evaluate( `document.querySelector('.conteo')?.textContent.trim()` );
		const marcadas = await page.evaluate( `[...document.querySelectorAll('.chip input:checked')].length` );
		tests.check( 'Abrir una URL con filtros muestra esos resultados y los controles reflejan el filtro', enteros( texto ).includes( esperado ) && marcadas === 1, `esperado ${ esperado }, «${ texto }», ${ marcadas } marcadas` );
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
	await sinJs();
	await conJs();
	await sinDesborde( tests, url(), 'Catálogo' );
} );
