// node tests/e2e/boletin.mjs — requiere el stack local en :8090 con el seed del boletín.
import { createBrowserTests } from './lib.mjs';
import {
	BOLETIN,
	conLimpieza,
	EDICION,
	contar,
	limpiarPrueba,
	sembrar,
	sinDesborde,
	tipografiaGeneral,
	wpJson,
} from './fcp-lib.mjs';

const tests = createBrowserTests();
const site = tests.site;
const pad = ( n ) => String( n ).padStart( 2, '0' );

// Lee la estructura de la edición que muestra la página abierta.
const leer = ( page ) =>
	page.evaluate( `(() => {
	const q = ( s, r = document ) => [ ...r.querySelectorAll( s ) ];
	const secs = q( 'section.seccion' );
	const indice = document.querySelector( 'section.indice' );
	const idIndice = indice?.id ?? '';
	const resuelve = ( href ) => {
		const el = href?.startsWith( '#' ) ? document.getElementById( href.slice( 1 ) ) : null;
		return Boolean( el && el.matches( 'section.seccion' ) );
	};
	const tarjetas = q( 'section.indice a.tema' ).map( ( a ) => a.getAttribute( 'href' ) );
	const barra = q( 'nav.nav a[href^="#seccion"]' ).map( ( a ) => a.getAttribute( 'href' ) );
	const cifras = q( 'section.seccion.cifras .cifras-grid > *' );
	return {
		titulo: document.title,
		canonical: document.querySelector( 'link[rel=canonical]' )?.href ?? null,
		franja: document.querySelector( '.franja' )?.textContent.replace( /\\s+/g, ' ' ).trim() ?? null,
		ids: secs.map( ( s ) => s.id ),
		numeros: secs.map( ( s ) => s.querySelector( '.sec-num' )?.textContent.trim() ?? null ),
		idIndice,
		tarjetas,
		tarjetasResuelven: tarjetas.every( resuelve ),
		barra,
		barraResuelve: q( 'nav.nav a[href^="#"]' ).every( ( a ) => document.getElementById( a.getAttribute( 'href' ).slice( 1 ) ) ),
		volver: secs.map( ( s ) => q( 'a', s ).some( ( a ) => idIndice && a.getAttribute( 'href' ) === '#' + idIndice && /volver al índice/i.test( a.textContent ) ) ),
		articulos: q( 'section.seccion div.articulo' ).length,
		cifrasSecciones: q( 'section.seccion.cifras' ).length,
		cifrasPrimeraDestacada: cifras.length > 1 && ( cifras[ 0 ].className !== cifras[ 1 ].className || getComputedStyle( cifras[ 0 ] ).fontSize !== getComputedStyle( cifras[ 1 ] ).fontSize || getComputedStyle( cifras[ 0 ] ).backgroundColor !== getComputedStyle( cifras[ 1 ] ).backgroundColor ),
		tarjetasMolde: q( 'section.seccion .tarjeta' ).length,
		hitos: q( 'section.seccion.agenda .hito' ).length,
		tipos: Object.fromEntries( [ [ 'mon', '.sec-title,.sec-num,.eyebrow,.rotulo-seccion,.cuando,.tema .nombre' ], [ 'kom', '.titular,.titulo-art,.tema h3,.hito h3,.tarjeta h3,.ficha h3' ] ].map( ( [ k, sel ] ) => [ k, q( sel ).map( ( e ) => { const cs = getComputedStyle( e ); return { sel: e.tagName.toLowerCase() + '.' + e.className, fam: cs.fontFamily.split( ',' )[ 0 ].replace( /[\"']/g, '' ).trim(), peso: Number( cs.fontWeight ), may: cs.textTransform }; } ) ] ) ),
		h1: q( 'h1' ).length,
		sinEncabezado: secs.filter( ( s ) => q( 'h2,h3,h4,h5,h6', s ).length === 0 ).map( ( s ) => s.id ),
		saltos: ( () => { const n = q( 'h1,h2,h3,h4,h5,h6' ).map( ( h ) => +h.tagName[ 1 ] ); return n.flatMap( ( v, i ) => ( i === 0 ? ( v === 1 ? [] : [ 'empieza en h' + v ] ) : v > n[ i - 1 ] + 1 ? [ 'h' + n[ i - 1 ] + '→h' + v + ' (n.º ' + i + ')' ] : [] ) ); } )(),
		fuenteCuerpo: ( () => { const p = document.querySelector( '.articulo .cuerpo p' ); return p ? getComputedStyle( p ).fontFamily : null; } )(),
	};
})()` );

// Secciones, índice y barra coherentes entre sí, para n secciones.
function estructura( etiqueta, d, n ) {
	const esperadas = Array.from( { length: n }, ( _, i ) => `seccion-${ i + 1 }` );
	const hrefs = esperadas.map( ( id ) => `#${ id }` );
	tests.check( `${ etiqueta }: ${ n } secciones con anclas seccion-1..${ n }`, JSON.stringify( d.ids ) === JSON.stringify( esperadas ), JSON.stringify( d.ids ) );
	const nums = Array.from( { length: n }, ( _, i ) => pad( i + 1 ) );
	tests.check( `${ etiqueta }: numeración 01–${ pad( n ) } en .sec-num`, JSON.stringify( d.numeros ) === JSON.stringify( nums ), JSON.stringify( d.numeros ) );
	tests.check( `${ etiqueta }: el índice tiene ${ n } tarjetas, en orden, hacia anclas que existen`, JSON.stringify( d.tarjetas ) === JSON.stringify( hrefs ) && d.tarjetasResuelven, JSON.stringify( d.tarjetas ) );
	tests.check( `${ etiqueta }: la barra de secciones tiene ${ n } enlaces, en orden, a anclas que existen`, JSON.stringify( d.barra ) === JSON.stringify( hrefs ) && d.barraResuelve, JSON.stringify( d.barra ) );
	tests.check( `${ etiqueta }: «Volver al índice» en cada sección`, d.volver.length === n && d.volver.every( Boolean ), `${ JSON.stringify( d.volver ) } (id del índice: «${ d.idIndice }»)` );
}

async function seed() {
	sembrar( 'boletines' );
	sembrar( 'boletines' );
	tests.check( 'Seed boletines idempotente: una sola edición tras dos corridas', contar( 'boletin' ) === 1, String( contar( 'boletin' ) ) );
}

async function edicion() {
	const ultima = wpJson(
		'$p=get_posts(["post_type"=>"boletin","post_status"=>"publish","numberposts"=>1,"orderby"=>"date","order"=>"DESC"]); echo wp_json_encode($p?["url"=>get_permalink($p[0]),"numero"=>(string)get_field("numero",$p[0]->ID)]:null);'
	);
	tests.check( 'Hay una edición publicada', Boolean( ultima ) );
	if ( ! ultima ) return;
	tests.check( 'La edición más reciente es la 02 y vive en /boletin/edicion-02/', Number( ultima.numero ) === 2 && new URL( ultima.url ).pathname === EDICION, JSON.stringify( ultima ) );
	const ruta = new URL( ultima.url ).pathname;
	for ( const url of [ BOLETIN, ruta ] ) {
		const r = await fetch( new URL( url, site ), { redirect: 'manual' } );
		tests.check( `${ url } responde 200`, r.status === 200, `HTTP ${ r.status }` );
		await r.body?.cancel();
	}
	const datos = {};
	for ( const url of [ BOLETIN, ruta ] ) {
		const page = await tests.openPage( new URL( url, site ).href, 1440 );
		try {
			const d = await leer( page );
			datos[ url ] = d;
			tests.check( `${ url }: la franja muestra la edición ${ pad( Number( ultima.numero ) ) }`, ( d.franja ?? '' ).includes( pad( Number( ultima.numero ) ) ), d.franja );
			estructura( url, d, 8 );
			tests.check( `${ url }: canónica = URL de la edición`, d.canonical === new URL( ruta, site ).href, d.canonical );
			if ( url === ruta ) {
				tests.check( `${ url }: 5 artículos`, d.articulos === 5, String( d.articulos ) );
				tests.check( `${ url }: 1 sección de cifras con la primera destacada`, d.cifrasSecciones === 1 && d.cifrasPrimeraDestacada, `${ d.cifrasSecciones } / ${ d.cifrasPrimeraDestacada }` );
				tests.check( `${ url }: 1 sección de tarjetas con 4 tarjetas`, d.tarjetasMolde === 4, String( d.tarjetasMolde ) );
				tests.check( `${ url }: 1 agenda con 4 hitos`, d.hitos === 4, String( d.hitos ) );
				const malos = ( l, f ) => l.filter( ( x ) => ! f( x ) ).map( ( x ) => `${ x.sel } ${ x.fam } ${ x.peso } ${ x.may }` );
				const m1 = malos( d.tipos.mon, ( x ) => x.fam === 'Monique Round' && x.peso === 400 && x.may === 'uppercase' );
				const m2 = malos( d.tipos.kom, ( x ) => x.fam === 'Komet' && x.peso >= 700 );
				tests.check( `${ url }: rótulos (.sec-title, .eyebrow, .cuando…) en Monique Round 400 MAYÚSCULAS`, d.tipos.mon.length > 0 && m1.length === 0, m1.slice( 0, 4 ).join( '; ' ) );
				tests.check( `${ url }: títulos (.titular, .titulo-art, h3…) en Komet con peso >= 700`, d.tipos.kom.length > 0 && m2.length === 0, m2.slice( 0, 4 ).join( '; ' ) );
				tests.check( `${ url }: el cuerpo empieza por Komet`, d.fuenteCuerpo !== null && d.fuenteCuerpo.split( ',' )[ 0 ].replace( /["']/g, '' ).trim() === 'Komet', d.fuenteCuerpo );
				await tipografiaGeneral( tests, page, url );
				tests.check( `${ url }: un solo h1 en la página`, d.h1 === 1, String( d.h1 ) );
				tests.check( `${ url }: cada sección tiene encabezado`, d.sinEncabezado.length === 0, d.sinEncabezado.join( ', ' ) );
				tests.check( `${ url }: encabezados sin saltos de nivel en toda la página`, d.saltos.length === 0, d.saltos.join( '; ' ) );
				const externas = page.requests.filter( ( u ) => /fonts\.(googleapis|gstatic)\.com/.test( u ) );
				tests.check( `${ url }: sin peticiones a Google Fonts`, externas.length === 0, externas.join( ', ' ) );
			}
		} finally {
			page.close();
		}
	}
	tests.check( '/boletin/ y la edición muestran la misma estructura', JSON.stringify( [ datos[ BOLETIN ]?.ids, datos[ BOLETIN ]?.tarjetas ] ) === JSON.stringify( [ datos[ ruta ]?.ids, datos[ ruta ]?.tarjetas ] ) );
	await sinDesborde( tests, new URL( ruta, site ).href, 'Boletín' );
}

async function edicionNueva() {
	const r = wpJson(
		'$id=wp_insert_post(["post_type"=>"boletin","post_status"=>"auto-draft","post_title"=>"__prueba auto-draft"]); $f=get_field("secciones",$id); echo wp_json_encode(["layouts"=>array_column(is_array($f)?$f:[],"acf_fc_layout"),"nombres"=>array_column(is_array($f)?$f:[],"nombre")]);'
	);
	tests.check( 'Edición nueva: trae las 8 secciones estándar (articulo, cifras, 3 articulo, tarjetas, articulo, agenda)', JSON.stringify( r.layouts ) === JSON.stringify( [ 'articulo', 'cifras', 'articulo', 'articulo', 'articulo', 'tarjetas', 'articulo', 'agenda' ] ), JSON.stringify( r ) );
	tests.check( 'Edición nueva: cada sección trae nombre', r.nombres.length === 8 && r.nombres.every( Boolean ), JSON.stringify( r.nombres ) );
}

// Crea una edición de prueba copiando la real más reciente. Opciones: fecha, numero, nombre, quitar (índice
// de sección a quitar), cifras y tarjetas (nº de filas a las que se completa la lista repitiendo la última).
function crear( { fecha, numero, nombre, quitar = null, cifras = 0, tarjetas = 0 } ) {
	return wpJson(
		`$b=null; foreach(get_posts(["post_type"=>"boletin","post_status"=>"publish","numberposts"=>20,"orderby"=>"date","order"=>"DESC"]) as $p){ if(0!==strpos($p->post_title,"__prueba")){ $b=$p; break; } } if(!$b) WP_CLI::error("Sin edición base"); $f=get_fields($b->ID,false); $rows=$f["secciones"];
		${ quitar === null ? '' : `array_splice($rows,${ quitar },1);` }
		foreach($rows as &$r){ foreach([["cifras","field_boletin_cifras_lista",${ cifras }],["tarjetas","field_boletin_tarjetas_lista",${ tarjetas }]] as $m){ if($r["acf_fc_layout"]===$m[0] && $m[2]>0){ $l=$r[$m[1]]; while(count($l)<$m[2]) $l[]=end($l); $r[$m[1]]=$l; } } } unset($r);
		$f["secciones"]=$rows; $f["numero"]="${ numero }"; $f["periodo"]="__prueba";
		$id=wp_insert_post(["post_type"=>"boletin","post_status"=>"publish","post_title"=>"__prueba ${ nombre }","post_name"=>"prueba-${ numero }","post_date"=>${ fecha === 'ahora' ? 'current_time("mysql")' : `"${ fecha }"` }],true); foreach($f as $k=>$v) update_field($k,$v,$id);
		echo wp_json_encode(["url"=>get_permalink($id)]);`
	);
}

// Edición antigua (no desplaza a /boletin/) con una sección menos.
async function quitarSeccion() {
	const r = crear( { fecha: '2000-01-01 00:00:00', numero: 99, nombre: 'boletin 7 secciones', quitar: 2 } );
	const page = await tests.openPage( r.url, 1440 );
	try {
		const d = await leer( page );
		estructura( 'Sin una sección', d, 7 );
		tests.check( 'Sin una sección: quedan 4 artículos', d.articulos === 4, String( d.articulos ) );
	} finally {
		page.close();
	}
}

// Una séptima cifra y una quinta tarjeta, en una edición antigua: nada se sale a 360, 850 ni 1440 px.
async function rejillasLlenas() {
	const r = crear( { fecha: '2000-01-02 00:00:00', numero: 97, nombre: 'boletin 7 cifras y 5 tarjetas', cifras: 7, tarjetas: 5 } );
	for ( const width of [ 360, 850, 1440 ] ) {
		const page = await tests.openPage( r.url, width );
		try {
			const d = await page.evaluate( `(() => {
				const q = ( s ) => [ ...document.querySelectorAll( s ) ];
				const doc = document.documentElement;
				const fuera = q( '.cifras-grid > *, section.seccion .tarjeta' ).filter( ( e ) => { const b = e.getBoundingClientRect(); return b.left < -1 || b.right > doc.clientWidth + 1; } ).length;
				return { cifras: q( '.cifras-grid > *' ).length, tarjetas: q( 'section.seccion .tarjeta' ).length, fuera, sw: doc.scrollWidth, cw: doc.clientWidth };
			})()` );
			tests.check( `7 cifras y 5 tarjetas a ${ width } px: la edición trae 7 y 5`, d.cifras === 7 && d.tarjetas === 5, JSON.stringify( d ) );
			tests.check( `7 cifras y 5 tarjetas a ${ width } px: ninguna se sale de la ventana ni hay desborde horizontal`, d.fuera === 0 && d.sw <= d.cw, JSON.stringify( d ) );
		} finally {
			page.close();
		}
	}
}

// Publicar una edición más reciente la convierte en /boletin/, con «Otras ediciones» y la anterior en su URL.
async function edicionMasReciente() {
	const r = crear( { fecha: 'ahora', numero: 98, nombre: 'boletin mas reciente' } );
	const ruta = new URL( r.url ).pathname;
	const page = await tests.openPage( new URL( BOLETIN, site ).href, 1440 );
	try {
		const d = await page.evaluate( `(() => {
			const a = document.querySelector( 'section.anteriores' );
			return {
				franja: document.querySelector( '.franja' )?.textContent.replace( /\\s+/g, ' ' ).trim() ?? null,
				canonical: document.querySelector( 'link[rel=canonical]' )?.href ?? null,
				anteriores: document.querySelectorAll( 'section.anteriores' ).length,
				titulo: a?.querySelector( 'h2' )?.textContent.trim() ?? null,
				enlaces: a ? [ ...a.querySelectorAll( 'a' ) ].map( ( x ) => new URL( x.href ).pathname ) : [],
			};
		})()` );
		tests.check( `${ BOLETIN } muestra la edición nueva`, ( d.franja ?? '' ).includes( '98' ), d.franja );
		tests.check( `${ BOLETIN }: la canónica apunta a la edición nueva`, d.canonical === r.url, String( d.canonical ) );
		tests.check( `${ BOLETIN }: «Otras ediciones» incluye la anterior (${ EDICION }) y no la que se muestra`, d.anteriores === 1 && d.titulo === 'Otras ediciones' && d.enlaces.includes( EDICION ) && ! d.enlaces.includes( ruta ), JSON.stringify( d ) );
	} finally {
		page.close();
	}
	const e = await fetch( new URL( EDICION, site ), { redirect: 'manual' } );
	tests.check( `${ EDICION } sigue respondiendo 200`, e.status === 200, `HTTP ${ e.status }` );
	await e.body?.cancel();
	limpiarPrueba();
	const p = await tests.openPage( new URL( BOLETIN, site ).href, 1440 );
	try {
		const c = await p.evaluate( `document.querySelector( 'link[rel=canonical]' )?.href ?? null` );
		tests.check( `Tras borrar la prueba, ${ BOLETIN } vuelve a la edición 02`, c === new URL( EDICION, site ).href, String( c ) );
	} finally {
		p.close();
	}
}

await conLimpieza( tests, async () => {
	await seed();
	await edicion();
	await edicionNueva();
	await quitarSeccion();
	await rejillasLlenas();
	await edicionMasReciente();
} );
