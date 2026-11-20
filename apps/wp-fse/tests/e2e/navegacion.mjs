// node tests/e2e/navegacion.mjs — menú, estado activo, programas, hero compacto, accesos y guía de estilos.
// Requiere el stack local en :8090 con el seed del boletín, los productores y la historia.
import { createBrowserTests } from './lib.mjs';
import { ASOCAFE, BOLETIN, CATALOGO, EDICION, HISTORIAS, conLimpieza, conteoDe, contar, enteros, esperar, norm, productoresSeed, sinDesborde, wp, wpJson } from './fcp-lib.mjs';

const tests = createBrowserTests();
const site = tests.site;
const u = ( p ) => new URL( p, site ).href;
const PROYECTOS = '/proyectos-destacados/'; // página de Proyectos destacados (no está en fcp-lib)
const ETIQUETAS = [ 'Lo que hacemos', 'Actualidad', 'Proyectos destacados', 'Boletín' ];
const DESTINOS = [ '/#lo-que-hacemos', '/#actualidad', PROYECTOS, BOLETIN ];
const MOVIL = '.lapaz-nav-mobile .wp-block-navigation__responsive-container';

const estado = ( page, selector ) =>
	page.evaluate( `[...document.querySelectorAll(${ JSON.stringify( selector ) } + ' a.wp-block-navigation-item__content')].map(a=>({t:a.textContent.trim(),href:a.getAttribute('href'),activo:a.closest('li').classList.contains('current-menu-item'),aria:a.getAttribute('aria-current'),linea:getComputedStyle(a).boxShadow}))` );

async function menu() {
	const page = await tests.openPage( u( '/' ), 1440 );
	try {
		const items = await estado( page, 'nav.lapaz-nav-desktop' );
		tests.check( 'Menú: hay exactamente 4 elementos', items.length === 4, String( items.length ) );
		tests.check( 'Menú: orden Lo que hacemos · Actualidad · Proyectos destacados · Boletín', JSON.stringify( items.map( ( i ) => i.t ) ) === JSON.stringify( ETIQUETAS ), JSON.stringify( items.map( ( i ) => i.t ) ) );
		const destinos = items.map( ( i ) => { const x = new URL( i.href, site ); return x.pathname + x.hash; } );
		tests.check( 'Menú: destinos /#lo-que-hacemos, /#actualidad, /proyectos-destacados/ (con barra final), /boletin/', JSON.stringify( destinos ) === JSON.stringify( DESTINOS ), JSON.stringify( destinos ) );
		for ( const d of [ '/', PROYECTOS, BOLETIN ] ) {
			const r = await fetch( u( d ), { redirect: 'manual' } );
			tests.check( `Menú: ${ d } responde 200 sin redirigir`, r.status === 200, `HTTP ${ r.status }` );
			await r.body?.cancel();
		}
		tests.check( 'Menú: el enlace de Proyectos destacados es exactamente la URL final', items[ 2 ].href.replace( /^https?:\/\/[^/]+/, '' ) === PROYECTOS, items[ 2 ].href );
	} finally {
		page.close();
	}
}

// ruta → índice del ítem activo (null: ninguno) y si el activo lleva aria-current="page".
async function activos() {
	const casos = [
		[ '/', null, false ],
		[ PROYECTOS, 2, true ],
		[ CATALOGO, 2, false ],
		[ `${ CATALOGO }?departamento=cauca`, 2, false ],
		[ HISTORIAS, 2, false ],
		[ ASOCAFE, 2, false ],
		[ BOLETIN, 3, true ],
		[ EDICION, 3, false ],
	];
	for ( const [ ruta, idx, exacta ] of casos ) {
		for ( const [ width, selector ] of [ [ 1440, 'nav.lapaz-nav-desktop' ], [ 390, MOVIL ] ] ) {
			const page = await tests.openPage( u( ruta ), width );
			try {
				if ( width === 390 ) {
					await page.evaluate( `document.querySelector('.lapaz-nav-mobile .wp-block-navigation__responsive-container-open').click()` );
					const abierto = await esperar( tests, () => page.evaluate( `document.querySelector(${ JSON.stringify( MOVIL ) }).classList.contains('is-menu-open')` ) );
					tests.check( `Menú móvil abierto en ${ ruta }`, abierto );
				}
				const items = await estado( page, selector );
				tests.check( `Menú ${ ruta } (${ width }px): hay 4 elementos antes de comprobar el estado`, items.length === 4, String( items.length ) );
				const activo = items.map( ( i, n ) => ( i.activo ? n : -1 ) ).filter( ( n ) => n >= 0 );
				const aria = items.map( ( i, n ) => ( i.aria === 'page' ? n : -1 ) ).filter( ( n ) => n >= 0 );
				const nombre = `${ ruta } (${ width }px)`;
				tests.check( `Menú ${ nombre }: ítem activo = ${ idx === null ? 'ninguno' : ETIQUETAS[ idx ] }`, JSON.stringify( activo ) === JSON.stringify( idx === null ? [] : [ idx ] ), JSON.stringify( activo ) );
				tests.check( `Menú ${ nombre }: aria-current="page" ${ exacta ? 'solo en el activo' : 'ausente (no es la página exacta)' }`, JSON.stringify( aria ) === JSON.stringify( exacta ? [ idx ] : [] ), JSON.stringify( aria ) );
				const anclas = items.filter( ( i ) => i.href.includes( '#' ) );
				tests.check( `Menú ${ nombre }: las anclas nunca se marcan`, anclas.length === 2 && anclas.every( ( i ) => ! i.activo && ! i.aria ), JSON.stringify( anclas ) );
				// El indicador no depende solo del color: el activo lleva una línea inferior (box-shadow inset) y los demás no.
				tests.check( `Menú ${ nombre }: el activo lleva línea inferior además del color`, items.length === 4 && items.every( ( i, n ) => ( n === idx ? /inset/.test( i.linea ) : i.linea === 'none' ) ), JSON.stringify( items.map( ( i ) => i.linea ) ) );
			} finally {
				page.close();
			}
		}
	}
}

async function programas() {
	const page = await tests.openPage( u( PROYECTOS ), 1440 );
	try {
		const r = await page.evaluate( `(() => {
			const nav = document.querySelector( '.proyectos-nav' );
			const dis = [ ...nav.querySelectorAll( '.btn-disabled' ) ];
			const foco = dis.map( ( e ) => { e.focus(); return document.activeElement === e; } );
			const a = nav.querySelector( 'a.btn-blue' );
			return {
				paissana: a ? new URL( a.href ).pathname : null,
				etiquetas: [ ...nav.querySelectorAll( '.btn-project' ) ].map( ( e ) => e.tagName.toLowerCase() ),
				enlaces: nav.querySelectorAll( 'a' ).length,
				dis: dis.map( ( e ) => ( { tag: e.tagName.toLowerCase(), href: e.hasAttribute( 'href' ), tabindex: e.getAttribute( 'tabindex' ), sr: e.querySelector( '.screen-reader-text' )?.textContent.trim() ?? '' } ) ),
				foco,
				heroNav: [ ...document.querySelectorAll( '.hero-nav a' ) ].map( ( e ) => e.getAttribute( 'href' ) ),
			};
		})()` );
		tests.check( `Programas: PAISSANA enlaza a ${ CATALOGO }`, r.paissana === CATALOGO, String( r.paissana ) );
		tests.check( 'Programas: solo PAISSANA es un enlace; los otros dos son span', r.enlaces === 1 && JSON.stringify( r.etiquetas ) === JSON.stringify( [ 'a', 'span', 'span' ] ), JSON.stringify( r ) );
		tests.check( 'Programas: los dos deshabilitados no tienen href ni tabindex y no se pueden enfocar', r.dis.length === 2 && r.dis.every( ( d ) => d.tag === 'span' && ! d.href && d.tabindex === null ) && r.foco.every( ( f ) => ! f ), JSON.stringify( r ) );
		tests.check( 'Programas: los deshabilitados anuncian «(próximamente)» a lectores de pantalla', r.dis.every( ( d ) => /próximamente/i.test( d.sr ) ), JSON.stringify( r.dis ) );
		// Tab desde el inicio nunca cae en un deshabilitado.
		await page.evaluate( 'document.activeElement?.blur(); window.scrollTo(0,0)' );
		let cayo = false;
		for ( let i = 0; i < 30 && ! cayo; i++ ) {
			await page.send( 'Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 } );
			await page.send( 'Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 } );
			cayo = await page.evaluate( `Boolean(document.activeElement?.closest('.btn-disabled'))` );
		}
		tests.check( 'Programas: 30 pulsaciones de Tab no enfocan un botón deshabilitado', ! cayo );
		tests.check( 'Barra de secciones PaisSana: orden audios, productores, ferias', JSON.stringify( r.heroNav ) === JSON.stringify( [ '#escucha-el-corazon-del-campo', '#productores-paissana', '#paissana-en-ferias' ] ), JSON.stringify( r.heroNav ) );
	} finally {
		page.close();
	}
}

// Una sola imagen con fetchpriority=high por vista, en la imagen esperada.
async function hero() {
	const vistas = [
		[ '/', '.hero__bg', false ],
		[ PROYECTOS, '.hero__bg', false ],
		[ CATALOGO, '.wp-block-lapaz-catalogo-portada img', true ],
		[ HISTORIAS, '.port-prod img', true ],
		[ ASOCAFE, '.port-prod img', true ],
		[ BOLETIN, '.wp-block-lapaz-boletin .portada img', true ],
		[ EDICION, '.wp-block-lapaz-boletin .portada img', true ],
	];
	for ( const [ ruta, esperado, compacto ] of vistas ) {
		const page = await tests.openPage( u( ruta ), 1440 );
		try {
			const r = await page.evaluate( `(() => {
				const h = document.querySelector( '.wp-block-lapaz-hero' );
				const img = h?.querySelector( 'img.hero__bg' );
				const altas = [ ...document.querySelectorAll( 'img[fetchpriority="high"]' ) ];
				const rect = h?.getBoundingClientRect();
				return {
					hero: Boolean( h ), compacto: Boolean( h?.classList.contains( 'is-style-compacto' ) ), alto: Math.round( rect?.height ?? 0 ),
					altas: altas.length, enEsperada: altas.length === 1 && altas[ 0 ].matches( ${ JSON.stringify( esperado ) } ),
					heroLoading: img?.getAttribute( 'loading' ) ?? null, heroPrio: img?.getAttribute( 'fetchpriority' ) ?? null,
					precarga: document.querySelectorAll( 'link[rel="preload"][as="image"]' ).length,
				};
			})()` );
			tests.check( `${ ruta }: exactamente un fetchpriority="high", en ${ esperado }`, r.enEsperada, JSON.stringify( r ) );
			if ( compacto ) {
				tests.check( `${ ruta }: hero compacto de ~160 px en escritorio, imagen lazy, sin fetchpriority alto ni precarga`, r.hero && r.compacto && r.alto >= 120 && r.alto <= 200 && r.heroLoading === 'lazy' && r.heroPrio !== 'high' && r.precarga === 0, JSON.stringify( r ) );
			} else {
				tests.check( `${ ruta }: hero completo intacto (alto > 300, eager, fetchpriority alto, precarga)`, r.hero && ! r.compacto && r.alto > 300 && r.heroLoading === 'eager' && r.heroPrio === 'high' && r.precarga >= 1, JSON.stringify( r ) );
			}
		} finally {
			page.close();
		}
		if ( compacto ) {
			const m = await tests.openPage( u( ruta ), 390 );
			try {
				const oculto = await m.evaluate( `(() => { const h = document.querySelector( '.wp-block-lapaz-hero' ); const r = h.getBoundingClientRect(); return { display: getComputedStyle( h ).display, alto: r.height }; })()` );
				tests.check( `${ ruta }: hero compacto oculto en móvil`, oculto.display === 'none' || oculto.alto === 0, JSON.stringify( oculto ) );
				// Todas las URL que el hero podría pedir (src y srcset): ninguna debe haberse descargado.
				const fotos = await m.evaluate( `(() => { const i = document.querySelector( '.wp-block-lapaz-hero img.hero__bg' ); return i ? [ i.src, ...i.srcset.split( ',' ).map( ( c ) => c.trim().split( /\\s+/ )[ 0 ] ).filter( Boolean ) ].map( ( x ) => new URL( x, location.href ).href ) : []; })()` );
				const descargado = m.requests.filter( ( x ) => fotos.includes( x ) );
				tests.check( `${ ruta }: la imagen del hero compacto no se descarga en móvil`, fotos.length > 0 && descargado.length === 0, JSON.stringify( { fotos: fotos.length, descargado } ) );
			} finally {
				m.close();
			}
		}
	}
}

async function accesos() {
	const ultima = wpJson( '$p=get_posts(["post_type"=>"boletin","post_status"=>"publish","numberposts"=>1,"orderby"=>"date","order"=>"DESC"]); echo wp_json_encode(["titular"=>wp_strip_all_tags((string)get_field("portada_titular",$p[0]->ID))]);' );
	const limpia = ( s ) => s.replace( /[“”"«»]/g, '' ).replace( /\s+/g, ' ' ).trim();
	const leer = ( page ) => page.evaluate( `(() => {
		const pos = ( s ) => { const e = document.querySelector( s ); return e ? e.getBoundingClientRect().top + scrollY : null; };
		const hd = document.querySelector( '.wp-block-lapaz-historia-destacada' );
		const bd = document.querySelector( '.wp-block-lapaz-boletin-destacado' );
		return {
			orden: { lque: pos( '.wp-block-lapaz-lo-que-hacemos' ), bol: pos( '.wp-block-lapaz-boletin-destacado' ), act: pos( '.wp-block-lapaz-actualidad' ), his: pos( '.wp-block-lapaz-historia-destacada' ), prod: pos( '.wp-block-lapaz-paisana-productores' ), fer: pos( '.wp-block-lapaz-paisana-ferias' ) },
			boletin: bd ? { titular: bd.querySelector( 'h3' )?.textContent ?? '', href: bd.querySelector( 'a.btn' )?.getAttribute( 'href' ) } : null,
			historia: hd ? { principal: hd.querySelector( 'a.btn' )?.getAttribute( 'href' ), sec: [ ...hd.querySelectorAll( 'a.btn-sec' ) ].map( ( a ) => ( { href: a.getAttribute( 'href' ), texto: a.textContent.replace( /\\s+/g, ' ' ).trim() } ) ) } : null,
		};
	})()` );
	const ok200 = async ( href, nombre ) => {
		const r = await fetch( new URL( href, site ), { redirect: 'manual' } );
		tests.check( `${ nombre }: ${ href } responde 200`, r.status === 200, `HTTP ${ r.status }` );
		await r.body?.cancel();
	};

	let page = await tests.openPage( u( '/' ), 1440 );
	try {
		const d = await leer( page );
		const o = d.orden;
		tests.check( 'Inicio: orden Lo que hacemos → Boletín destacado → Actualidad → Historia destacada', [ o.lque, o.bol, o.act, o.his ].every( ( x ) => x !== null ) && o.lque < o.bol && o.bol < o.act && o.act < o.his, JSON.stringify( o ) );
		tests.check( `Inicio: la tarjeta del boletín lleva el titular de la edición más reciente y el botón a ${ BOLETIN }`, Boolean( d.boletin ) && limpia( d.boletin.titular ) === limpia( ultima.titular ) && new URL( d.boletin.href, site ).pathname === BOLETIN, JSON.stringify( [ d.boletin, ultima ] ) );
		tests.check( 'Inicio: la historia destacada ya no lleva el segundo enlace (lo sustituye el banner)', Boolean( d.historia ) && d.historia.sec.length === 0, JSON.stringify( d.historia ) );
		if ( d.historia ) await ok200( d.historia.principal, 'Inicio historia' );
		if ( d.boletin ) await ok200( d.boletin.href, 'Inicio boletín' );
		await ok200( CATALOGO, 'Inicio acceso' );
	} finally {
		page.close();
	}
	page = await tests.openPage( u( PROYECTOS ), 1440 );
	try {
		const d = await leer( page );
		const o = d.orden;
		tests.check( 'Proyectos destacados: la historia destacada va entre productores y ferias', [ o.prod, o.his, o.fer ].every( ( x ) => x !== null ) && o.prod < o.his && o.his < o.fer, JSON.stringify( o ) );
		tests.check( 'Proyectos destacados: la historia destacada no lleva el segundo enlace', Boolean( d.historia ) && d.historia.sec.length === 0, JSON.stringify( d.historia ) );
	} finally {
		page.close();
	}
	page = await tests.openPage( u( CATALOGO ), 1440 );
	try {
		const d = await leer( page );
		tests.check( `${ CATALOGO }: la tarjeta destacada existe y no lleva el segundo enlace`, Boolean( d.historia ) && d.historia.sec.length === 0, JSON.stringify( d.historia ) );
	} finally {
		page.close();
	}
}

// Banner del catálogo: en / (al final de main) y en /proyectos-destacados/ (tras Productores); no en las demás.
async function banner() {
	const productores = contar( 'productor' );
	const esperadas = wpJson( '$n=function($t){return count(get_terms(["taxonomy"=>$t,"hide_empty"=>true]));}; echo wp_json_encode([(int)wp_count_posts("productor")->publish,$n("departamento"),$n("categoria_productor")]);' );
	tests.check( 'Banner: cifras de wp-cli (productores publicados primero)', esperadas[ 0 ] === productores, JSON.stringify( esperadas ) );
	const leer = ( page ) => page.evaluate( `(() => {
		const b = document.querySelector( '.wp-block-lapaz-catalogo-banner' );
		if ( ! b ) return null;
		const f = b.querySelector( 'form' ); const main = document.querySelector( 'main' );
		const top = ( e ) => e.getBoundingClientRect().top + scrollY;
		const prod = document.querySelector( '.wp-block-lapaz-paisana-productores' );
		const nuevo = ( e ) => e && b.compareDocumentPosition( e ) & Node.DOCUMENT_POSITION_FOLLOWING;
		return {
			cifras: [ ...b.querySelectorAll( '.cat-cifras .n' ) ].map( ( e ) => Number( e.textContent.replace( /\\D/g, '' ) ) ),
			form: f ? { metodo: f.method, role: f.getAttribute( 'role' ), campo: Boolean( f.querySelector( 'input[type=search][name=buscar]' ) ), boton: f.querySelector( 'button[type=submit]' )?.textContent.trim(), aria: f.querySelector( 'input' )?.getAttribute( 'aria-label' ), ayuda: f.querySelector( 'input' )?.getAttribute( 'placeholder' ), action: f.getAttribute( 'action' ) } : null,
			enlace: [ ...b.querySelectorAll( 'a' ) ].map( ( a ) => { const x = new URL( a.href ); return { path: x.pathname, hash: x.hash, t: a.textContent.replace( /\\s+/g, ' ' ).trim() }; } ),
			ultimoDeMain: ! [ ...main.querySelectorAll( '*' ) ].some( ( e ) => e.matches( 'section, .wp-block-lapaz-actualidad, [class*="wp-block-lapaz-"]' ) && ! b.contains( e ) && nuevo( e ) && ! e.contains( b ) ),
			trasProductores: Boolean( prod ) && top( prod ) < top( b ),
		};
	})()` );
	const inicio = await tests.openPage( u( '/' ), 1440 );
	let datos;
	try {
		datos = await leer( inicio );
		tests.check( 'Banner: presente en / y es lo último de main', Boolean( datos ) && datos.ultimoDeMain, JSON.stringify( datos ) );
	} finally {
		inicio.close();
	}
	const pd = await tests.openPage( u( PROYECTOS ), 1440 );
	try {
		const d = await leer( pd );
		tests.check( 'Banner: presente en /proyectos-destacados/ justo después de Productores PaisSana', Boolean( d ) && d.trasProductores, JSON.stringify( d ) );
		const entre = await pd.evaluate( `(() => { const p = document.querySelector( '.wp-block-lapaz-paisana-productores' ); const b = document.querySelector( '.wp-block-lapaz-catalogo-banner' ); const f = document.querySelector( '.wp-block-lapaz-paisana-ferias' ); return Boolean( p && b && f && ( p.compareDocumentPosition( b ) & 4 ) && ( b.compareDocumentPosition( f ) & 4 ) ); })()` );
		tests.check( 'Banner: en /proyectos-destacados/ queda entre Productores y Ferias', entre );
	} finally {
		pd.close();
	}
	for ( const ruta of [ CATALOGO, ASOCAFE, BOLETIN ] ) {
		const page = await tests.openPage( u( ruta ), 1440 );
		try {
			tests.check( `Banner: ausente en ${ ruta }`, ( await leer( page ) ) === null );
		} finally {
			page.close();
		}
	}
	// Cifras iguales a las del hero del catálogo y a wp-cli.
	const portada = await tests.openPage( u( CATALOGO ), 1440 );
	let heroNums = [];
	try {
		heroNums = await portada.evaluate( `[...document.querySelectorAll('.wp-block-lapaz-catalogo-portada .tile .n')].map(e=>e.textContent.trim())` );
	} finally {
		portada.close();
	}
	tests.check( 'Banner: las tres cifras coinciden con wp-cli', datos && JSON.stringify( datos.cifras ) === JSON.stringify( esperadas ), JSON.stringify( [ datos?.cifras, esperadas ] ) );
	const nodos = heroNums.map( ( t ) => enteros( t )[ 0 ] );
	tests.check( 'Banner: hay tres cifras en el banner y tres en catalogo-portada', datos?.cifras.length === 3 && nodos.length === 3, JSON.stringify( [ datos?.cifras, heroNums ] ) );
	tests.check( 'Banner: cada cifra (en orden) coincide con la de su nodo en catalogo-portada', datos?.cifras.length === 3 && nodos.length === 3 && datos.cifras.every( ( n, i ) => n === nodos[ i ] ), JSON.stringify( [ datos?.cifras, nodos ] ) );
	tests.check( 'Banner: formulario GET con role=search, campo buscar, botón «Buscar» y ayuda «Productor, producto o municipio»', Boolean( datos?.form ) && datos.form.metodo === 'get' && datos.form.role === 'search' && datos.form.campo && datos.form.boton === 'Buscar' && /^Buscar productor, producto o municipio$/i.test( datos.form.aria ) && datos.form.ayuda === 'Productor, producto o municipio' && new URL( datos.form.action, site ).pathname === CATALOGO, JSON.stringify( datos?.form ) );
	const explorar = datos?.enlace.find( ( e ) => /Explorar el catálogo/.test( e.t ) );
	tests.check( `Banner: enlace «Explorar el catálogo» a ${ CATALOGO }#explorar`, explorar?.path === CATALOGO && explorar?.hash === '#explorar', JSON.stringify( datos?.enlace ) );
	const r = await fetch( u( CATALOGO ), { redirect: 'manual' } );
	tests.check( `Banner: ${ CATALOGO } (destino de los enlaces) responde 200`, r.status === 200, `HTTP ${ r.status }` );
	await r.body?.cancel();
	// Envío con el formulario y con teclado.
	const key = async ( page, k, code, vk, text ) => {
		for ( const type of [ 'keyDown', 'keyUp' ] ) await page.send( 'Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: vk, ...( type === 'keyDown' && text ? { text } : {} ) } );
	};
	const page = await tests.openPage( u( '/' ), 1440 );
	try {
		await page.evaluate( `(() => { const i = document.querySelector( '.wp-block-lapaz-catalogo-banner input[name=buscar]' ); i.scrollIntoView( { block: 'center' } ); i.focus(); return 1; })()` );
		const secuencia = [];
		await key( page, 'Tab', 'Tab', 9 );
		secuencia.push( await page.evaluate( `document.activeElement.tagName + ':' + document.activeElement.textContent.trim().slice(0,12)` ) );
		await key( page, 'Tab', 'Tab', 9 );
		secuencia.push( await page.evaluate( `document.activeElement.tagName + ':' + document.activeElement.textContent.trim().slice(0,12)` ) );
		tests.check( 'Banner: con teclado se llega del campo al botón «Buscar» y al enlace «Explorar»', secuencia[ 0 ].startsWith( 'BUTTON:Buscar' ) && secuencia[ 1 ].startsWith( 'A:Explorar' ), JSON.stringify( secuencia ) );
		await page.evaluate( `(() => { const i = document.querySelector( '.wp-block-lapaz-catalogo-banner input[name=buscar]' ); i.focus(); return 1; })()` );
		await page.send( 'Input.insertText', { text: 'cafe' } );
		await key( page, 'Enter', 'Enter', 13, '\r' );
		await esperar( tests, () => page.evaluate( `location.pathname === ${ JSON.stringify( CATALOGO ) } && document.readyState === 'complete' && Boolean( document.querySelector( '.conteo' ) )` ), 10000 );
		const url = await page.evaluate( 'location.pathname + location.search + location.hash' );
		tests.check( `Banner: escribir «cafe» y pulsar Enter lleva a ${ CATALOGO }?buscar=cafe#explorar`, url === `${ CATALOGO }?buscar=cafe#explorar`, url );
		const conteo = await page.evaluate( `document.querySelector( '.conteo' )?.textContent.trim() ?? ''` );
		const cafe = productoresSeed().filter( ( p ) => norm( [ p.nombre, p.departamento, p.municipio, ...p.categorias, ...p.productos ].join( ' ' ) ).includes( 'cafe' ) ).length;
		const sinFiltrar = enteros( conteoDe( await ( await fetch( u( CATALOGO ) ) ).text() ) );
		tests.check( 'Banner: la búsqueda llega filtrada: resultados = esperado del seed y menos que sin filtrar', cafe > 0 && sinFiltrar[ 0 ] === productores && enteros( conteo )[ 0 ] === cafe && cafe < sinFiltrar[ 0 ], JSON.stringify( { conteo, sinFiltrar, cafe, productores } ) );
	} finally {
		page.close();
	}
	// enlaceCatalogo sigue existiendo en el bloque (ninguna plantilla lo activa).
	const sec = wpJson( 'echo wp_json_encode(["con"=>substr_count(do_blocks("<!-- wp:lapaz/historia-destacada {\\"enlaceCatalogo\\":true} /-->"),"btn-sec"),"sin"=>substr_count(do_blocks("<!-- wp:lapaz/historia-destacada /-->"),"btn-sec")]);' );
	tests.check( 'historia-destacada: enlaceCatalogo=true añade .btn-sec y por defecto no lo lleva', sec.con === 1 && sec.sin === 0, JSON.stringify( sec ) );
}

async function tactiles() {
	const medir = async ( ruta, selector, nombre ) => {
		const page = await tests.openPage( u( ruta ), 390 );
		try {
			const r = await page.evaluate( `(() => { const l = [ ...document.querySelectorAll( ${ JSON.stringify( selector ) } ) ].filter( ( e ) => e.offsetParent ); return { n: l.length, chicos: l.map( ( e ) => { const b = e.getBoundingClientRect(); return [ Math.round( b.width ), Math.round( b.height ), e.textContent.trim().slice( 0, 20 ) ]; } ).filter( ( [ w, h ] ) => w < 44 || h < 44 ).slice( 0, 4 ) }; })()` );
			tests.check( `Táctil a 390 px: ${ nombre } >= 44×44 px`, r.n > 0 && r.chicos.length === 0, JSON.stringify( r ) );
		} finally {
			page.close();
		}
	};
	await medir( CATALOGO, '.chip', 'chips de categoría' );
	await medir( CATALOGO, 'section.distribucion a.barra', 'barras de distribución' );
	await medir( ASOCAFE, '.volver-top a', 'enlace de volver (historia)' );
	await medir( BOLETIN, 'section.seccion a[href^="#"]', 'enlaces «Volver al índice» del boletín' );
}

async function guia() {
	// La guía solo existe en local: en otro entorno no hay nada que comprobar.
	if ( wp( 'echo wp_get_environment_type();' ).trim() !== 'local' ) return console.log( '- guía de estilos: omitida (entorno no local)' );
	const r = await fetch( u( '/guia-de-estilos/' ), { redirect: 'manual' } );
	const html = await r.text();
	tests.check( '/guia-de-estilos/ responde 200 en local', r.status === 200, `HTTP ${ r.status }` );
	const robots = html.match( /<meta name=['"]robots['"] content=['"]([^'"]*)/ )?.[ 1 ] ?? '';
	tests.check( '/guia-de-estilos/ es noindex', /noindex/.test( robots ), robots );
	const idx = await ( await fetch( u( '/wp-sitemap.xml' ) ) ).text();
	const locs = [ ...idx.matchAll( /<loc>([^<]+)<\/loc>/g ) ].map( ( m ) => m[ 1 ].replaceAll( '&amp;', '&' ) );
	let todo = idx;
	for ( const l of locs ) todo += await ( await fetch( l ) ).text();
	const urls = ( todo.match( /<loc>/g ) ?? [] ).length - locs.length;
	tests.check( 'El sitemap lista al menos una URL de contenido', locs.length > 0 && urls > 0, String( urls ) );
	tests.check( '/guia-de-estilos/ no está en el sitemap', ! /guia-de-estilos/.test( todo ) );
}

await conLimpieza( tests, async () => {
	await menu();
	await activos();
	await programas();
	await hero();
	await accesos();
	await banner();
	await tactiles();
	await guia();
	for ( const ruta of [ '/', PROYECTOS, CATALOGO, HISTORIAS, ASOCAFE, BOLETIN, EDICION ] )
		await sinDesborde( tests, u( ruta ), `Desborde ${ ruta }` );
} );
