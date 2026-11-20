// node tests/e2e/historia.mjs — requiere el stack local en :8090 con el seed de historias.
import { createBrowserTests } from './lib.mjs';
import {
	conLimpieza,
	contar,
	limpiarPrueba,
	sembrar,
	sinDesborde,
	tipografiaGeneral,
	wpJson,
} from './fcp-lib.mjs';

const tests = createBrowserTests();
const site = tests.site;
const ASOCAFE = '/paissana/historias/asocafe/';

const masReciente = () =>
	wpJson(
		'$p=get_posts(["post_type"=>"historia","post_status"=>"publish","numberposts"=>1,"orderby"=>"date","order"=>"DESC"]); echo wp_json_encode($p?["id"=>$p[0]->ID,"path"=>wp_parse_url(get_permalink($p[0]),PHP_URL_PATH)]:null);'
	);

// Rutas de los enlaces de la tarjeta «PaisSano destacado»; ?x= esquiva la caché de página.
async function destacado( bust = '' ) {
	const page = await tests.openPage( new URL( `/paissana/${ bust }`, site ).href, 1440 );
	try {
		return await page.evaluate( `(() => { const b=document.querySelector('.wp-block-lapaz-historia-destacada'); return b?{texto:b.textContent.replace(/\\s+/g,' '),rutas:[...b.querySelectorAll('a')].map(a=>new URL(a.href).pathname)}:null; })()` );
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
	tests.check( '/paissana/ muestra la tarjeta «PaisSano destacado»', Boolean( d ) && /PaisSano destacado/i.test( d.texto ), d?.texto?.slice( 0, 80 ) );
	tests.check( 'La tarjeta enlaza a /paissana/historias/asocafe/', Boolean( d?.rutas.includes( ASOCAFE ) ), JSON.stringify( d?.rutas ) );
	const r = await fetch( new URL( ASOCAFE, site ), { redirect: 'manual' } );
	tests.check( `${ ASOCAFE } responde 200`, r.status === 200, `HTTP ${ r.status }` );
	await r.body?.cancel();
}

async function pagina() {
	const page = await tests.openPage( new URL( ASOCAFE, site ).href, 1440 );
	try {
		const d = await page.evaluate( `(() => {
			const q = ( s ) => [ ...document.querySelectorAll( s ) ];
			return {
				volver: q( '.volver-top' ).length,
				portada: document.querySelector( '.port-prod h1' )?.textContent.trim() ?? '',
				ficha: q( 'dl.ficha-tec dt' ).length,
				cronica: document.querySelector( '.cronica .texto' )?.textContent.trim().length ?? 0,
				aside: q( '.cronica aside' ).length,
				galeria: q( '.galeria figure button img' ).length,
				lightbox: q( '.lightbox' ).length,
				cerrar: q( '.lightbox .cerrar' ).length,
				sinNombre: q( '.galeria figure button' ).filter( ( b ) => ! ( b.getAttribute( 'aria-label' ) || b.getAttribute( 'aria-labelledby' ) || b.textContent.trim() || b.querySelector( 'img' )?.alt.trim() ) ).length,
			};
		})()` );
		tests.check( 'Historia: portada con título (.port-prod h1)', d.portada.length > 0, JSON.stringify( d ) );
		tests.check( 'Historia: enlace de volver (.volver-top)', d.volver >= 1 );
		tests.check( 'Historia: ficha técnica con datos (dl.ficha-tec)', d.ficha > 0, String( d.ficha ) );
		tests.check( 'Historia: crónica con texto y columna lateral', d.cronica > 200 && d.aside >= 1, `${ d.cronica } caracteres, ${ d.aside } aside` );
		tests.check( 'Historia: galería de 12 fotos', d.galeria === 12, String( d.galeria ) );
		tests.check( 'Historia: cada botón de la galería tiene nombre accesible', d.sinNombre === 0, `${ d.sinNombre } sin nombre` );
		tests.check( 'Historia: lightbox con botón de cerrar', d.lightbox === 1 && d.cerrar === 1 );
		const estado = `(() => { const l=document.querySelector('.lightbox'); return {on:l.classList.contains('on'),src:l.querySelector('img')?.getAttribute('src')||'',foco:document.activeElement===window.__boton}; })()`;
		const abrir = async () => {
			await page.evaluate( `(() => { const b=document.querySelector('.galeria figure button'); window.__boton=b; b.scrollIntoView({block:'center'}); b.focus(); b.click(); return 1; })()` );
			await tests.sleep( 400 );
			return page.evaluate( estado );
		};
		let e = await abrir();
		tests.check( 'Lightbox: abre con la foto ampliada', e.on && e.src.length > 0, JSON.stringify( e ) );
		await page.key( 'Escape' );
		e = await page.evaluate( estado );
		tests.check( 'Lightbox: Escape lo cierra y devuelve el foco al botón', ! e.on && e.foco, JSON.stringify( e ) );
		e = await abrir();
		tests.check( 'Lightbox: se puede abrir de nuevo', e.on );
		await page.evaluate( `document.querySelector('.lightbox .cerrar').click()` );
		await tests.sleep( 400 );
		e = await page.evaluate( estado );
		tests.check( 'Lightbox: el botón cierra y devuelve el foco', ! e.on && e.foco, JSON.stringify( e ) );
		const externas = page.requests.filter( ( u ) => /fonts\.(googleapis|gstatic)\.com/.test( u ) );
		await tipografiaGeneral( tests, page, 'Historia' );
		tests.check( 'Historia: sin peticiones a Google Fonts', externas.length === 0 );
	} finally {
		page.close();
	}
	await sinDesborde( tests, new URL( ASOCAFE, site ).href, 'Historia' );
}

async function nuevaHistoria() {
	const nueva = wpJson(
		'$id=wp_insert_post(["post_type"=>"historia","post_status"=>"publish","post_title"=>"__prueba historia","post_name"=>"prueba-historia","post_date"=>current_time("mysql")],true); echo wp_json_encode(["path"=>wp_parse_url(get_permalink($id),PHP_URL_PATH)]);'
	);
	const d = await destacado( `?x=${ Date.now() }` );
	tests.check( 'Historia nueva más reciente: el destacado cambia a ella', Boolean( d?.rutas.includes( nueva.path ) ) && ! d.rutas.includes( ASOCAFE ), JSON.stringify( d?.rutas ) );
	for ( const ruta of [ nueva.path, ASOCAFE ] ) {
		const r = await fetch( new URL( ruta, site ), { redirect: 'manual' } );
		tests.check( `${ ruta } responde 200`, r.status === 200, `HTTP ${ r.status }` );
		await r.body?.cancel();
	}
}

async function restaurado() {
	const d = await destacado( `?x=${ Date.now() }` );
	tests.check( 'Tras borrar la prueba, el destacado vuelve a Asocafé', Boolean( d?.rutas.includes( ASOCAFE ) ), JSON.stringify( d?.rutas ) );
}

await conLimpieza( tests, async () => {
	await seed();
	await tarjeta();
	await pagina();
	await nuevaHistoria();
	// El borrado ocurre en el finally de conLimpieza; aquí se hace antes para verificar la restauración.
	limpiarPrueba();
	await restaurado();
} );
