// node tests/e2e/historia.mjs — requiere el stack local en :8090 con el seed de historias.
import { createBrowserTests } from './lib.mjs';
import {
	ASOCAFE,
	CATALOGO,
	HISTORIAS,
	RUTA_RETIRADA,
	conLimpieza,
	contar,
	esperar,
	limpiarPrueba,
	sembrar,
	sinDesborde,
	tipografiaGeneral,
	wpJson,
} from './fcp-lib.mjs';

const tests = createBrowserTests();
const site = tests.site;
const url = ( ruta ) => new URL( ruta, site ).href;

const masReciente = () =>
	wpJson(
		'$p=get_posts(["post_type"=>"historia","post_status"=>"publish","numberposts"=>1,"orderby"=>"date","order"=>"DESC"]); echo wp_json_encode($p?["id"=>$p[0]->ID,"path"=>wp_parse_url(get_permalink($p[0]),PHP_URL_PATH)]:null);'
	);

async function estado( ruta ) {
	const r = await fetch( url( ruta ), { redirect: 'manual' } );
	await r.body?.cancel();
	return r.status;
}

// Rutas de los enlaces de la tarjeta de la historia destacada; ?x= esquiva la caché de página.
async function destacado( bust = '' ) {
	const page = await tests.openPage( url( `${ CATALOGO }${ bust }` ), 1440 );
	try {
		return await page.evaluate( `(() => { const b=document.querySelector('.wp-block-lapaz-historia-destacada'); return b?{texto:b.textContent.replace(/\\s+/g,' '),rutas:[...b.querySelectorAll('a')].map(a=>new URL(a.href).pathname)}:null; })()` );
	} finally {
		page.close();
	}
}

// Lo que muestra una página de historia o el archivo: título, canónica y «Otras historias».
async function leerHistoria( ruta ) {
	const page = await tests.openPage( url( ruta ), 1440 );
	try {
		return await page.evaluate( `(() => {
			const a = document.querySelector( 'section.anteriores' );
			return {
				h1: document.querySelector( '.port-prod h1' )?.textContent.trim() ?? null,
				canonical: document.querySelector( 'link[rel=canonical]' )?.href ?? null,
				anteriores: document.querySelectorAll( 'section.anteriores' ).length,
				titulo: a?.querySelector( 'h2' )?.textContent.trim() ?? null,
				enlaces: a ? [ ...a.querySelectorAll( 'a' ) ].map( ( x ) => new URL( x.href ).pathname ) : [],
			};
		})()` );
	} finally {
		page.close();
	}
}

async function seed() {
	sembrar( 'historias' );
	sembrar( 'historias' );
	tests.check( 'Seed historias idempotente: una sola historia tras dos corridas', contar( 'historia' ) === 1, String( contar( 'historia' ) ) );
}

async function tarjeta() {
	const ultima = masReciente();
	tests.check( 'La historia más reciente es Asocafé', ultima?.path === ASOCAFE, JSON.stringify( ultima ) );
	const d = await destacado();
	tests.check( `${ CATALOGO } muestra la tarjeta de la historia destacada`, Boolean( d ) && d.texto.length > 0, d?.texto?.slice( 0, 80 ) );
	tests.check( `La tarjeta enlaza solo a ${ ASOCAFE }`, Boolean( d ) && d.rutas.length > 0 && d.rutas.every( ( r ) => r === ASOCAFE ), JSON.stringify( d?.rutas ) );
	tests.check( `${ ASOCAFE } responde 200`, ( await estado( ASOCAFE ) ) === 200 );
}

async function archivo() {
	const r = await estado( HISTORIAS );
	tests.check( `${ HISTORIAS } responde 200`, r === 200, `HTTP ${ r }` );
	const d = await leerHistoria( HISTORIAS );
	tests.check( `${ HISTORIAS }: muestra la historia más reciente completa`, Boolean( d.h1 ), JSON.stringify( d ) );
	tests.check( `${ HISTORIAS }: canónica a la URL de la historia`, d.canonical === url( ASOCAFE ), String( d.canonical ) );
	tests.check( `${ HISTORIAS }: con una sola historia no hay «Otras historias»`, d.anteriores === 0, String( d.anteriores ) );
}

async function retiradas() {
	for ( const ruta of [ RUTA_RETIRADA, `${ RUTA_RETIRADA }${ ASOCAFE.slice( 1 ) }` ] ) {
		const r = await estado( ruta );
		tests.check( `${ ruta } responde 404`, r === 404, `HTTP ${ r }` );
	}
}

async function pagina() {
	const page = await tests.openPage( url( ASOCAFE ), 1440 );
	try {
		const d = await page.evaluate( `(() => {
			const q = ( s ) => [ ...document.querySelectorAll( s ) ];
			const botones = q( '.galeria figure button' );
			const l = document.querySelector( '.lightbox' );
			return {
				volver: q( '.volver-top' ).length,
				portada: document.querySelector( '.port-prod h1' )?.textContent.trim() ?? '',
				prioridad: document.querySelector( '.port-prod img' )?.getAttribute( 'fetchpriority' ) ?? null,
				prioritarias: q( '[fetchpriority="high"]' ).length,
				ficha: q( 'dl.ficha-tec dt' ).length,
				cronica: document.querySelector( '.cronica .texto' )?.textContent.trim().length ?? 0,
				aside: q( '.cronica aside' ).length,
				galeria: q( '.galeria figure button img' ).length,
				botones: botones.length,
				sinNombre: botones.filter( ( b ) => ! ( b.getAttribute( 'aria-label' ) || b.getAttribute( 'aria-labelledby' ) || b.querySelector( 'img' )?.alt.trim() ) ).length,
				lightbox: q( '.lightbox' ).length,
				esDialog: l instanceof HTMLDialogElement,
				abierto: l?.open ?? null,
				cerrar: q( '.lightbox .cerrar' ).length,
			};
		})()` );
		tests.check( 'Historia: portada con título (.port-prod h1)', d.portada.length > 0, JSON.stringify( d ) );
		tests.check( 'Historia: la imagen de portada lleva fetchpriority="high" y es la única de la página', d.prioridad === 'high' && d.prioritarias === 1, `${ d.prioridad } / ${ d.prioritarias }` );
		tests.check( 'Historia: enlace de volver (.volver-top)', d.volver >= 1 );
		tests.check( 'Historia: ficha técnica con datos (dl.ficha-tec)', d.ficha > 0, String( d.ficha ) );
		tests.check( 'Historia: crónica con texto y columna lateral', d.cronica > 200 && d.aside >= 1, `${ d.cronica } caracteres, ${ d.aside } aside` );
		tests.check( 'Historia: galería de 12 fotos en 12 botones', d.galeria === 12 && d.botones === 12, `${ d.galeria } fotos, ${ d.botones } botones` );
		tests.check( 'Historia: cada botón de la galería tiene nombre accesible', d.botones === 12 && d.sinNombre === 0, `${ d.sinNombre } sin nombre` );
		tests.check( 'Lightbox: es un único <dialog> cerrado al cargar, con botón de cerrar', d.lightbox === 1 && d.esDialog && d.abierto === false && d.cerrar === 1, JSON.stringify( d ) );

		const leer = () =>
			page.evaluate( `(() => {
				const l = document.querySelector( '.lightbox' );
				const otro = document.querySelector( '.galeria figure:nth-child(2) button' );
				otro.focus();
				const colado = document.activeElement === otro;
				return {
					abierto: l.open,
					modal: l.matches( ':modal' ),
					on: l.classList.contains( 'on' ),
					src: l.querySelector( 'img' )?.getAttribute( 'src' ) || '',
					foco: document.activeElement === window.__boton,
					enCerrar: document.activeElement === l.querySelector( '.cerrar' ),
					colado,
				};
			})()` );
		const leerCerrado = () =>
			page.evaluate( `(() => { const l = document.querySelector( '.lightbox' ); return { abierto: l.open, on: l.classList.contains( 'on' ), foco: document.activeElement === window.__boton, src: l.querySelector( 'img' )?.getAttribute( 'src' ) || '' }; })()` );
		const abrir = async () => {
			await page.evaluate( `(() => { const b=document.querySelector('.galeria figure button'); window.__boton=b; b.scrollIntoView({block:'center'}); b.focus(); b.click(); return 1; })()` );
			await esperar( tests, async () => ( await page.evaluate( `document.querySelector('.lightbox').open` ) ) === true );
		};
		const cerrado = async () => {
			await esperar( tests, async () => ( await page.evaluate( `document.querySelector('.lightbox').open` ) ) === false );
			return leerCerrado();
		};
		// Clic real (ratón) en un punto de la ventana.
		const clic = async ( x, y ) => {
			for ( const type of [ 'mousePressed', 'mouseReleased' ] )
				await page.send( 'Input.dispatchMouseEvent', { type, x, y, button: 'left', clickCount: 1 } );
		};

		await abrir();
		let e = await leer();
		tests.check( 'Lightbox: abre como diálogo modal (open, :modal y clase on) con la foto ampliada', e.abierto && e.modal && e.on && e.src.length > 0, JSON.stringify( e ) );
		tests.check( 'Lightbox: el foco queda en «Cerrar» y el fondo no recibe foco', e.enCerrar && ! e.colado, JSON.stringify( e ) );
		await page.key( 'Tab' );
		tests.check( 'Lightbox: Tab no saca el foco del diálogo', await page.evaluate( `document.activeElement === document.querySelector('.lightbox .cerrar')` ) );

		await page.key( 'Escape' );
		e = await cerrado();
		tests.check( 'Lightbox: Escape lo cierra y devuelve el foco al botón', ! e.abierto && ! e.on && e.foco && ! e.src, JSON.stringify( e ) );

		await abrir();
		const r = await page.evaluate( `(() => { const b = document.querySelector('.lightbox .cerrar').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; })()` );
		await clic( r.x, r.y );
		e = await cerrado();
		tests.check( 'Lightbox: «Cerrar» lo cierra y devuelve el foco', ! e.abierto && ! e.on && e.foco && ! e.src, JSON.stringify( e ) );

		await abrir();
		await clic( 4, 4 ); // fuera de la foto y del botón: cae en el fondo del diálogo
		e = await cerrado();
		tests.check( 'Lightbox: clic fuera lo cierra y devuelve el foco', ! e.abierto && ! e.on && e.foco && ! e.src, JSON.stringify( e ) );

		await tipografiaGeneral( tests, page, 'Historia' );
		const externas = page.requests.filter( ( u ) => /fonts\.(googleapis|gstatic)\.com/.test( u ) );
		tests.check( 'Historia: sin peticiones a Google Fonts', externas.length === 0, externas.join( ', ' ) );
	} finally {
		page.close();
	}
	await sinDesborde( tests, url( ASOCAFE ), 'Historia' );
}

async function nuevaHistoria() {
	const nueva = wpJson(
		'$u=get_posts(["post_type"=>"historia","post_status"=>"publish","numberposts"=>1,"orderby"=>"date","order"=>"DESC"]); $f=$u?gmdate("Y-m-d H:i:s",strtotime($u[0]->post_date)+3600):current_time("mysql"); if($f>current_time("mysql")) $f=current_time("mysql"); /* ponytail: si +1 h cae en el futuro, hora actual (no queda programada) */ $id=wp_insert_post(["post_type"=>"historia","post_status"=>"publish","post_title"=>"__prueba historia","post_name"=>"prueba-historia","post_date"=>$f],true); echo wp_json_encode(["path"=>wp_parse_url(get_permalink($id),PHP_URL_PATH)]);'
	);
	const d = await destacado( `?x=${ Date.now() }` );
	tests.check( 'Historia nueva más reciente: el destacado cambia a ella', Boolean( d ) && d.rutas.length > 0 && d.rutas.every( ( r ) => r === nueva.path ), JSON.stringify( d?.rutas ) );
	for ( const ruta of [ nueva.path, ASOCAFE ] ) {
		const r = await estado( ruta );
		tests.check( `${ ruta } responde 200`, r === 200, `HTTP ${ r }` );
	}
	const a = await leerHistoria( HISTORIAS );
	tests.check( `${ HISTORIAS } con dos historias: muestra la nueva y su canónica apunta a ella`, a.canonical === url( nueva.path ) && ( a.h1 ?? '' ).includes( '__prueba' ), JSON.stringify( a ) );
	tests.check( `${ HISTORIAS } con dos historias: «Otras historias» lista Asocafé y no la que se muestra`, a.anteriores === 1 && a.titulo === 'Otras historias' && a.enlaces.includes( ASOCAFE ) && ! a.enlaces.includes( nueva.path ), JSON.stringify( a ) );
	const b = await leerHistoria( ASOCAFE );
	tests.check( `${ ASOCAFE } sigue con su canónica y lista la nueva en «Otras historias»`, b.canonical === url( ASOCAFE ) && b.enlaces.includes( nueva.path ), JSON.stringify( b ) );
}

async function restaurado() {
	const d = await destacado( `?x=${ Date.now() }` );
	tests.check( 'Tras borrar la prueba, el destacado vuelve a Asocafé', Boolean( d ) && d.rutas.length > 0 && d.rutas.every( ( r ) => r === ASOCAFE ), JSON.stringify( d?.rutas ) );
	const a = await leerHistoria( HISTORIAS );
	tests.check( `Tras borrar la prueba, ${ HISTORIAS } vuelve a Asocafé sin «Otras historias»`, a.canonical === url( ASOCAFE ) && a.anteriores === 0, JSON.stringify( a ) );
}

await conLimpieza( tests, async () => {
	await seed();
	await tarjeta();
	await archivo();
	await retiradas();
	await pagina();
	await nuevaHistoria();
	// El borrado ocurre también en el finally de conLimpieza; aquí se hace antes para verificar la restauración.
	limpiarPrueba();
	await restaurado();
} );
