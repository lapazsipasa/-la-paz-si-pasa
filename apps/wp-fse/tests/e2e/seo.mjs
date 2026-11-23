// node tests/e2e/seo.mjs — incluye un stack de producción efímero, sin puertos publicados.
// El SEO lo emite The SEO Framework (autodescription); el tema solo da valores por defecto y,
// sin el plugin, un respaldo propio (inc/seo.php).
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createBrowserTests } from './lib.mjs';
import { wp } from './paisana-lib.mjs';
import {
	ASOCAFE,
	BOLETIN,
	CATALOGO,
	EDICION,
	HISTORIAS,
	exigirLocal,
	wpJson,
} from './fcp-lib.mjs';

const tests = createBrowserTests();
const site = tests.site;
const MARCA = 'La Paz Sí Pasa';
const HOME = `${ MARCA } | Fondo Colombia en Paz`;
const GENERAL =
	'El Fondo Colombia en Paz ejecuta los recursos para implementar la paz: conoce las subcuentas, las cifras de gestión y las historias de los territorios PDET.';
const PAISANA =
	'PaisSana reúne a las familias productoras de los territorios PDET: mapas por región, relatos en audio, ferias y videos del café, el cacao y las artesanías.';
const NO_EXISTE = '/no-existe-xyz';
const PLUGIN = 'autodescription/autodescription.php';
const url = ( ruta ) => new URL( ruta, site ).href;
const b64 = ( valor ) =>
	Buffer.from( JSON.stringify( valor ) ).toString( 'base64' );

// Restauraciones que deben correr aunque la suite se interrumpa (SIGINT/SIGTERM salen por `exit`).
const alSalir = new Set();
process.on( 'exit', () =>
	alSalir.forEach( ( restaurar ) => {
		try {
			restaurar();
		} catch {}
	} )
);

// Una sola página en blanco que solo sirve para analizar HTML con DOMParser.
let lector;

// Selectores cuyo número de etiquetas debe ser exactamente 1 en el <head>.
const UNICOS = {
	title: 'title',
	description: 'meta[name="description"]',
	robots: 'meta[name="robots"]',
	ogTitle: 'meta[property="og:title"]',
	ogLocale: 'meta[property="og:locale"]',
};

async function head( page, html ) {
	const doc =
		html === undefined
			? 'document'
			: `new DOMParser().parseFromString(${ JSON.stringify(
					html
			  ) }, 'text/html')`;
	return page.evaluate( `((document) => ({
		title:document.title,
		meta:Object.fromEntries([...document.head.querySelectorAll('meta[name],meta[property]')].map(el=>[el.getAttribute('name')||el.getAttribute('property'),el.content])),
		n:Object.fromEntries(Object.entries(${ JSON.stringify(
			UNICOS
		) }).map(([k,s])=>[k,document.head.querySelectorAll(s).length])),
		canonical:[...document.head.querySelectorAll('link[rel="canonical"]')].map(el=>el.href),
		jsonld:[...document.querySelectorAll('script[type="application/ld+json"]')].map(el=>el.textContent),
		favicon:document.head.querySelector('link[rel~="icon"]')?.href,
		emojis:/wp-emoji|_wpemojiSettings|emoji-release/.test(document.head.innerHTML),
		api:document.head.querySelector('link[rel*="api.w.org"]')?.outerHTML,
		oembed:document.head.querySelector('link[type*="oembed"]')?.outerHTML,
		feeds:document.head.querySelector('link[type="application/rss+xml"],link[type="application/atom+xml"]')?.outerHTML,
		discovery:document.head.querySelector('link[rel="EditURI"],link[rel="shortlink"]')?.outerHTML,
		globalStyles:document.head.querySelector('#global-styles-inline-css')?.textContent ?? null
	}))(${ doc })` );
}

// Cabecera de una ruta local, leída del HTML servido.
async function cabecera( ruta ) {
	const respuesta = await fetch( url( ruta ), { redirect: 'manual' } );
	return head( lector, await respuesta.text() );
}

// Una etiqueta de cada: title, description, robots, og:title y og:locale (es_CO).
function unico( label, data, { social = true } = {} ) {
	const claves = social ? Object.keys( UNICOS ) : [ 'title', 'robots' ];
	tests.check(
		`${ label }: una sola etiqueta de ${ claves.join( ', ' ) }`,
		claves.every( ( clave ) => data.n[ clave ] === 1 ),
		JSON.stringify( data.n )
	);
	if ( social ) {
		tests.check(
			`${ label }: og:locale es_CO`,
			data.meta[ 'og:locale' ] === 'es_CO',
			data.meta[ 'og:locale' ]
		);
	}
}

const directivas = ( data ) =>
	( data.meta.robots ?? '' ).split( /[,\s]+/ ).filter( Boolean );

// Organización del JSON-LD y presencia de la búsqueda falsa.
function estructurados( label, data ) {
	const nodos = data.jsonld.flatMap( ( texto ) => {
		try {
			const json = JSON.parse( texto );
			return json[ '@graph' ] ?? [ json ];
		} catch {
			return [];
		}
	} );
	const organizacion = nodos.find( ( nodo ) =>
		[ nodo[ '@type' ] ].flat().includes( 'Organization' )
	);
	tests.check(
		`${ label }: JSON-LD con la organización «Fondo Colombia en Paz»`,
		organizacion?.name === 'Fondo Colombia en Paz',
		JSON.stringify( organizacion )
	);
	tests.check(
		`${ label }: JSON-LD sin SearchAction ni potentialAction`,
		data.jsonld.length > 0 &&
			! /potentialAction|SearchAction/.test( data.jsonld.join( '' ) )
	);
}

function cleanedHead( label, data ) {
	tests.check(
		`${ label }: sin generator`,
		! Object.hasOwn( data.meta, 'generator' )
	);
	for ( const key of [ 'api', 'oembed', 'feeds', 'discovery' ] ) {
		tests.check(
			`${ label }: sin ${ key } en head`,
			! data[ key ],
			data[ key ]
		);
	}
	const bytes = Buffer.byteLength( data.globalStyles ?? '', 'utf8' );
	tests.check(
		`${ label }: global-styles ${ bytes } bytes (<12 KB)`,
		data.globalStyles !== null && bytes > 0 && bytes < 12 * 1024
	);
}

function cleanedHeaders( label, headers ) {
	const server = headers.get( 'server' ) ?? '';
	tests.check(
		`${ label }: Server sin versión de Apache ni sistema operativo`,
		! /apache(?:\/|\s+)\d|\((?:debian|ubuntu)/i.test( server ),
		server
	);
	tests.check(
		`${ label }: sin X-Powered-By`,
		! headers.has( 'x-powered-by' )
	);
	tests.check(
		`${ label }: sin Link de descubrimiento REST ni shortlink`,
		! /api\.w\.org|shortlink/i.test( headers.get( 'link' ) ?? '' ),
		headers.get( 'link' )
	);
}

async function cleanupHttp( label, base, request ) {
	for ( const route of [ '/', '/proyectos-destacados/', NO_EXISTE ] ) {
		const response = await request( route, 'GET' );
		cleanedHeaders( `${ label } ${ route }`, response.headers );
	}
	const feed = await request( '/feed/', 'GET' );
	tests.check(
		`${ label }: /feed/ responde 301 al inicio`,
		feed.status === 301 &&
			Boolean( feed.headers.get( 'location' ) ) &&
			new URL( feed.headers.get( 'location' ) ?? '', base ).href ===
				new URL( '/', base ).href,
		`HTTP ${ feed.status }; Location: ${ feed.headers.get( 'location' ) }`
	);
	cleanedHeaders( `${ label } /feed/`, feed.headers );
	const xmlrpc = await request( '/xmlrpc.php', 'POST' );
	tests.check(
		`${ label }: POST /xmlrpc.php responde 403`,
		xmlrpc.status === 403,
		`HTTP ${ xmlrpc.status }`
	);
	cleanedHeaders( `${ label } /xmlrpc.php`, xmlrpc.headers );
}

// Valores que el sitio debe dar por defecto en la edición 02 y en Asocafé (los calcula el sitio, no el tema).
function esperado() {
	return wpJson(
		`$p=fn($tipo,$slug)=>get_posts(["post_type"=>$tipo,"name"=>$slug,"post_status"=>"publish","numberposts"=>1])[0] ?? null; $b=$p("boletin","edicion-02"); $h=$p("historia","asocafe"); if(!$b||!$h) WP_CLI::error("Falta la edición 02 o Asocafé: cargar el seed");
$foto=function($id,$campos){ foreach($campos as $c){ $f=lapaz_field_image_id($c,$id); $d=$f?wp_get_attachment_image_src($f,"full"):false; if($d) return $d[0]; } return null; };
echo wp_json_encode(["boletin"=>["id"=>$b->ID,"titulo"=>lapaz_boletin_titulo($b->ID),"sumario"=>wp_strip_all_tags(lapaz_field_text("portada_sumario",$b->ID)),"foto"=>$foto($b->ID,["portada_foto"])],"historia"=>["id"=>$h->ID,"titulo"=>get_the_title($h->ID),"resumen"=>wp_strip_all_tags(lapaz_field_text("resumen",$h->ID)),"foto"=>$foto($h->ID,["portada_foto","foto"])]]);`
	);
}

async function pages( e ) {
	const og = url( '/wp-content/themes/lapaz/assets/img/seo/og.jpg' );
	const resumen = e.historia.resumen.replace( /\s+/g, ' ' ).trim();
	const pagina = ( ruta, nombre, desc = GENERAL ) => ( {
		ruta,
		title: `${ nombre } | ${ MARCA }`,
		og: nombre,
		desc,
		imagen: og,
		tipo: 'website',
	} );
	const rutas = [
		{
			ruta: '/',
			title: HOME,
			og: HOME,
			desc: GENERAL,
			imagen: og,
			tipo: 'website',
		},
		pagina(
			'/proyectos-destacados/',
			'PaisSana, proyectos destacados',
			PAISANA
		),
		pagina( CATALOGO, 'Productores PaisSana' ),
		...[ BOLETIN, EDICION ].map( ( ruta ) => ( {
			ruta,
			title: `${ e.boletin.titulo } | ${ MARCA }`,
			og: e.boletin.titulo,
			desc: e.boletin.sumario,
			imagen: e.boletin.foto,
			canonica: EDICION,
			tipo: ruta === EDICION ? 'article' : 'website',
		} ) ),
		...[ HISTORIAS, ASOCAFE ].map( ( ruta ) => ( {
			ruta,
			title: `${ e.historia.titulo } | ${ MARCA }`,
			og: e.historia.titulo,
			resumen,
			imagen: e.historia.foto,
			canonica: ASOCAFE,
			tipo: ruta === ASOCAFE ? 'article' : 'website',
		} ) ),
	];
	for ( const r of rutas ) {
		const data = await cabecera( r.ruta );
		const route = r.ruta;
		cleanedHead( route, data );
		unico( route, data );
		tests.check( `${ route }: título`, data.title === r.title, data.title );
		const description = data.meta.description;
		tests.check(
			r.resumen
				? `${ route }: description por defecto = resumen de la historia (≈155)`
				: `${ route }: description por defecto`,
			r.resumen
				? description.length <= 160 &&
						description.length >= 100 &&
						resumen.startsWith( description.replace( /…$/, '' ) )
				: description === r.desc,
			description
		);
		const desc = description;
		tests.check(
			`${ route }: Open Graph completo y coherente`,
			data.meta[ 'og:title' ] === r.og &&
				data.meta[ 'og:description' ] === desc &&
				data.meta[ 'og:site_name' ] === MARCA &&
				data.meta[ 'og:type' ] === r.tipo &&
				data.meta[ 'og:image' ] === r.imagen &&
				Number( data.meta[ 'og:image:width' ] ) > 0 &&
				Number( data.meta[ 'og:image:height' ] ) > 0 &&
				Boolean( data.meta[ 'og:image:alt' ] ),
			JSON.stringify( data.meta )
		);
		tests.check(
			`${ route }: og:url`,
			data.meta[ 'og:url' ] === url( r.canonica ?? route ),
			data.meta[ 'og:url' ]
		);
		tests.check(
			`${ route }: Twitter completo y coherente`,
			data.meta[ 'twitter:card' ] === 'summary_large_image' &&
				data.meta[ 'twitter:title' ] === r.og &&
				data.meta[ 'twitter:description' ] === desc &&
				data.meta[ 'twitter:image' ] === r.imagen
		);
		// En local todo es noindex y el plugin no imprime canónica en páginas noindex, salvo en /boletin/ e /historias/.
		tests.check(
			`${ route }: canonical sin duplicados`,
			r.canonica && route !== r.canonica
				? data.canonical.length === 1 &&
						data.canonical[ 0 ] === url( r.canonica )
				: data.canonical.length === 0 ||
						( data.canonical.length === 1 &&
							data.canonical[ 0 ] === url( route ) ),
			JSON.stringify( data.canonical )
		);
		tests.check(
			`${ route }: local noindex y nofollow`,
			directivas( data ).includes( 'noindex' ) &&
				directivas( data ).includes( 'nofollow' ),
			data.meta.robots
		);
		await icono( route, data );
		if ( route === '/' ) {
			estructurados( route, data );
		}
	}
	// 404: título con sufijo y nada más que exigir de descripción ni Open Graph.
	const data = await cabecera( NO_EXISTE );
	cleanedHead( NO_EXISTE, data );
	unico( NO_EXISTE, data, { social: false } );
	tests.check(
		`${ NO_EXISTE }: título`,
		data.title === `Página no encontrada | ${ MARCA }`,
		data.title
	);
	await icono( NO_EXISTE, data );
	tests.check(
		`${ NO_EXISTE }: sin canonical`,
		data.canonical.length === 0,
		JSON.stringify( data.canonical )
	);
	// La guía de estilos solo existe en local: fuera del índice (y del sitemap, ver más abajo).
	const guia = await cabecera( '/guia-de-estilos/' );
	tests.check(
		'/guia-de-estilos/: noindex y nofollow',
		directivas( guia ).includes( 'noindex' ) &&
			directivas( guia ).includes( 'nofollow' ),
		guia.meta.robots
	);
}

async function icono( route, data ) {
	tests.check( `${ route }: favicon presente`, Boolean( data.favicon ) );
	if ( data.favicon ) {
		const icon = await fetch( data.favicon );
		tests.check(
			`${ route }: favicon responde correctamente`,
			icon.ok,
			`HTTP ${ icon.status }`
		);
		await icon.body?.cancel();
	}
	tests.check( `${ route }: sin script ni estilos de emojis`, ! data.emojis );
}

// Snapshot, escritura y restauración de los metadatos del plugin (y el extracto) de una entrada.
const CLAVES = [
	'_genesis_title',
	'_genesis_description',
	'_social_image_url',
];
async function conMeta( etiqueta, id, { meta = {}, excerpt }, accion ) {
	exigirLocal( tests );
	const snapshot = `$o=["x"=>get_post_field("post_excerpt",${ id }),"m"=>[]]; foreach(${ JSON.stringify(
		CLAVES
	) } as $k) $o["m"][$k]=get_post_meta(${ id },$k,false); echo wp_json_encode($o);`;
	const saved = JSON.parse( wp( snapshot ) );
	const volver = () =>
		wp(
			`$s=json_decode(base64_decode("${ b64(
				saved
			) }"),true); foreach($s["m"] as $k=>$vs){delete_post_meta(${ id },$k); foreach($vs as $v) add_post_meta(${ id },$k,$v);} ${
				excerpt === undefined
					? ''
					: `wp_update_post(["ID"=>${ id },"post_excerpt"=>$s["x"]]);`
			}`
		);
	alSalir.add( volver );
	try {
		wp(
			`foreach(json_decode(base64_decode("${ b64(
				meta
			) }"),true) as $k=>$v){ if($v===null) delete_post_meta(${ id },$k); else update_post_meta(${ id },$k,$v);} ${
				excerpt === undefined
					? ''
					: `wp_update_post(["ID"=>${ id },"post_excerpt"=>${ JSON.stringify(
							excerpt
					  ) }]);`
			}`
		);
		await accion();
	} finally {
		volver();
		alSalir.delete( volver );
		tests.check(
			`${ etiqueta }: metadatos originales restaurados`,
			JSON.stringify( JSON.parse( wp( snapshot ) ) ) ===
				JSON.stringify( saved )
		);
	}
}

// Lo que el editor escribe en la caja del plugin gana sobre los valores por defecto del tema,
// en la entrada y en el archivo que la muestra.
async function editorGana( e ) {
	const imagen = url(
		'/wp-content/themes/lapaz/assets/img/seo/apple-touch-icon.png'
	);
	for ( const [ id, nombre, rutas ] of [
		[ e.boletin.id, 'edición 02', [ EDICION, BOLETIN ] ],
		[ e.historia.id, 'Asocafé', [ ASOCAFE, HISTORIAS ] ],
	] ) {
		const titulo = `Título del editor (${ nombre })`;
		const desc = `Descripción del editor (${ nombre }) & territorio.`;
		await conMeta(
			`Editor ${ nombre }`,
			id,
			{
				meta: {
					_genesis_title: titulo,
					_genesis_description: desc,
					_social_image_url: imagen,
				},
			},
			async () => {
				for ( const ruta of rutas ) {
					const data = await cabecera( ruta );
					tests.check(
						`Editor gana en ${ ruta }: título (con marca) y og:title/twitter:title (sin ella)`,
						data.title === `${ titulo } | ${ MARCA }` &&
							data.meta[ 'og:title' ] === titulo &&
							data.meta[ 'twitter:title' ] === titulo,
						`${ data.title } / ${ data.meta[ 'og:title' ] }`
					);
					tests.check(
						`Editor gana en ${ ruta }: descripción en description, og y Twitter`,
						[
							'description',
							'og:description',
							'twitter:description',
						].every( ( clave ) => data.meta[ clave ] === desc ),
						data.meta.description
					);
					tests.check(
						`Editor gana en ${ ruta }: imagen en og:image y twitter:image`,
						data.meta[ 'og:image' ] === imagen &&
							data.meta[ 'twitter:image' ] === imagen,
						data.meta[ 'og:image' ]
					);
					unico( `Editor gana en ${ ruta }`, data );
				}
			}
		);
	}
}

// En páginas la descripción es la del plugin; sin ella, el extracto sigue sirviendo de respaldo.
async function extracto() {
	const id = Number(
		wp(
			'$p=get_page_by_path("proyectos-destacados"); echo $p ? $p->ID : 0;'
		)
	);
	if ( ! id ) {
		throw new Error( 'Falta Proyectos destacados' );
	}
	const textos = ( data, texto ) =>
		[ 'description', 'og:description', 'twitter:description' ].every(
			( clave ) => data.meta[ clave ] === texto
		);
	const plugin = 'Descripción SEO de prueba & territorio.';
	await conMeta(
		'Descripción del plugin',
		id,
		{
			meta: { _genesis_description: plugin },
			excerpt: 'Extracto que no debe ganar.',
		},
		async () => {
			const data = await cabecera( '/proyectos-destacados/' );
			tests.check(
				'Descripción del plugin: gana sobre el extracto en description, og y Twitter',
				textos( data, plugin ),
				JSON.stringify( data.meta )
			);
		}
	);
	const extractoSolo = 'Extracto de prueba & respaldo.';
	await conMeta(
		'Extracto',
		id,
		{ meta: { _genesis_description: null }, excerpt: extractoSolo },
		async () => {
			const data = await cabecera( '/proyectos-destacados/' );
			tests.check(
				'Extracto: sin descripción del plugin sirve de respaldo',
				textos( data, extractoSolo ),
				JSON.stringify( data.meta )
			);
		}
	);
}

async function sitemap() {
	const indice = url( '/sitemap.xml' );
	const response = await fetch( indice );
	tests.check(
		'Sitemap: /sitemap.xml responde 200',
		response.status === 200,
		`HTTP ${ response.status }`
	);
	const xml = await response.text();
	tests.check(
		'Sitemap: un solo urlset, sin índice de proveedores',
		/<urlset[\s>]/.test( xml ) && ! /<sitemapindex/.test( xml )
	);
	const urls = [ ...xml.matchAll( /<loc>([^<]+)<\/loc>/g ) ].map( ( match ) =>
		match[ 1 ].replaceAll( '&amp;', '&' )
	);
	for ( const ruta of [
		'/',
		'/proyectos-destacados/',
		CATALOGO,
		EDICION,
		ASOCAFE,
	] ) {
		tests.check(
			`Sitemap: incluye ${ ruta }`,
			urls.includes( url( ruta ) ),
			JSON.stringify( urls )
		);
	}
	tests.check(
		'La guía de estilos existe en local (su exclusión del sitemap no es vacía)',
		wp( 'echo get_page_by_path("guia-de-estilos") ? 1 : 0;' ) === '1'
	);
	tests.check(
		'Sitemap: sin la guía de estilos ni productores sueltos',
		! urls.some( ( loc ) =>
			/guia-de-estilos|\/productor\//.test( new URL( loc ).pathname )
		),
		JSON.stringify( urls )
	);
	for ( const ruta of [
		'/wp-sitemap.xml',
		'/wp-sitemap.xml/',
		'/wp-sitemap-posts-page-1.xml',
	] ) {
		const viejo = await fetch( url( ruta ), { redirect: 'manual' } );
		await viejo.body?.cancel();
		tests.check(
			`Sitemap: ${ ruta } redirige con 301 a /sitemap.xml`,
			viejo.status === 301 &&
				new URL( viejo.headers.get( 'location' ) ?? '', site ).href ===
					indice,
			`HTTP ${ viejo.status }; Location: ${ viejo.headers.get(
				'location'
			) }`
		);
	}
	const robots = await ( await fetch( url( '/robots.txt' ) ) ).text();
	tests.check(
		'robots.txt apunta a /sitemap.xml',
		robots.split( /\r?\n/ ).includes( `Sitemap: ${ indice }` ) &&
			! /wp-sitemap/.test( robots ),
		robots
	);
}

// Quien edita ve la caja del plugin sin la pestaña de visibilidad y no administra; un administrador sí.
async function editor() {
	exigirLocal( tests );
	const borrar = () =>
		wp(
			'require_once ABSPATH."wp-admin/includes/user.php"; foreach(get_posts(["title"=>"__prueba","post_type"=>"any","post_status"=>"any","numberposts"=>-1]) as $x) wp_delete_post($x->ID,true); $u=get_user_by("login","__prueba"); if($u) wp_delete_user($u->ID); echo 1;'
		);
	alSalir.add( borrar );
	try {
		borrar();
		const tabs = wpJson(
			`$id=wp_insert_user(["user_login"=>"__prueba","user_pass"=>wp_generate_password(24),"user_email"=>"__prueba@example.test","role"=>"editor"]); if(is_wp_error($id)) WP_CLI::error($id->get_error_message());
$admin=get_users(["role"=>"administrator","number"=>1,"fields"=>"ID"])[0];
$por=function($u){ wp_set_current_user($u); ob_start(); lapaz_tsf_estilo_caja(); $t=array_keys((array)apply_filters("the_seo_framework_inpost_settings_tabs",["general"=>[],"social"=>[],"visibility"=>[]],null)); return ["admin"=>current_user_can("manage_options"),"tabs"=>$t,"css"=>ob_get_clean()]; };
echo wp_json_encode(["editor"=>$por($id),"admin"=>$por($admin)]);`
		);
		tests.check(
			'Editor (rol editor): no puede manage_options',
			tabs.editor.admin === false
		);
		tests.check(
			'Editor: la caja del plugin no incluye la pestaña de visibilidad',
			tabs.editor.tabs.includes( 'general' ) &&
				! tabs.editor.tabs.includes( 'visibility' ),
			JSON.stringify( tabs.editor.tabs )
		);
		tests.check(
			'Editor: la caja oculta los campos sociales sueltos; el administrador no recibe ese CSS',
			tabs.editor.css.includes( 'tsf-flex-setting' ) &&
				tabs.admin.css === ''
		);
		tests.check(
			'Administrador: puede manage_options y ve la pestaña de visibilidad',
			tabs.admin.admin === true &&
				tabs.admin.tabs.includes( 'visibility' ),
			JSON.stringify( tabs.admin )
		);
		// Guardado a mano por el camino real del plugin (Post::save_meta): el editor no cambia
		// redirección, canónica ni robots; el administrador sí.
		const guardado = wpJson(
			`$ed=get_user_by("login","__prueba")->ID; $admin=get_users(["role"=>"administrator","number"=>1,"fields"=>"ID"])[0];
$p=wp_insert_post(["post_title"=>"__prueba","post_status"=>"draft","post_type"=>"page"]);
$k=["redirect","_genesis_canonical_uri","_genesis_noindex","_genesis_nofollow","_genesis_noarchive"];
$por=function($u) use($p,$k){ wp_set_current_user($u); \\The_SEO_Framework\\Data\\Plugin\\Post::save_meta($p,["redirect"=>"https://malo.example/x","_genesis_canonical_uri"=>"https://malo.example/c","_genesis_noindex"=>1,"_genesis_nofollow"=>1,"_genesis_noarchive"=>1,"_genesis_title"=>"__prueba titulo"]); $r=[]; foreach($k as $c) $r[$c]=get_post_meta($p,$c,true); $r["titulo"]=get_post_meta($p,"_genesis_title",true); foreach($k as $c) delete_post_meta($p,$c); return $r; };
$o=["editor"=>$por($ed)]; $o["admin"]=$por($admin); wp_delete_post($p,true); echo wp_json_encode($o);`
		);
		tests.check(
			'Editor: no guarda redirección, canónica ni robots enviando el formulario a mano',
			Object.entries( guardado.editor ).every(
				( [ c, v ] ) => c === 'titulo' || v === ''
			) && guardado.editor.titulo === '__prueba titulo',
			JSON.stringify( guardado.editor )
		);
		tests.check(
			'Administrador: sí guarda redirección, canónica y robots',
			guardado.admin.redirect === 'https://malo.example/x' &&
				guardado.admin._genesis_canonical_uri === 'https://malo.example/c' &&
				guardado.admin._genesis_noindex === '1',
			JSON.stringify( guardado.admin )
		);
		// Un administrador dejó noindex y una redirección; después guarda un Editor con otros valores.
		const conserva = wpJson(
			`$ed=get_user_by("login","__prueba")->ID; $admin=get_users(["role"=>"administrator","number"=>1,"fields"=>"ID"])[0];
$p=wp_insert_post(["post_title"=>"__prueba","post_status"=>"draft","post_type"=>"page"]);
wp_set_current_user($admin); \\The_SEO_Framework\\Data\\Plugin\\Post::save_meta($p,["redirect"=>"https://admin.example/r","_genesis_noindex"=>1]);
wp_set_current_user($ed); \\The_SEO_Framework\\Data\\Plugin\\Post::save_meta($p,["redirect"=>"","_genesis_noindex"=>0,"_genesis_title"=>"__prueba otro"]);
echo wp_json_encode(["redirect"=>get_post_meta($p,"redirect",true),"noindex"=>get_post_meta($p,"_genesis_noindex",true),"titulo"=>get_post_meta($p,"_genesis_title",true)]);`
		);
		tests.check(
			'Editor: al guardar conserva el noindex y la redirección que dejó un administrador',
			conserva.redirect === 'https://admin.example/r' &&
				conserva.noindex === '1' &&
				conserva.titulo === '__prueba otro',
			JSON.stringify( conserva )
		);
	} finally {
		borrar();
		alSalir.delete( borrar );
		tests.check(
			'Editor: usuario temporal __prueba eliminado',
			wp( 'echo get_user_by("login","__prueba") ? 1 : 0;' ) === '0' &&
				wp( 'echo count(get_posts(["title"=>"__prueba","post_type"=>"any","post_status"=>"any"]));' ) === '0'
		);
	}
}

// Sin el plugin el tema sigue emitiendo título, descripción, Open Graph y canónica (inc/seo.php).
// Se reactiva siempre, también si la suite se interrumpe.
async function respaldo( e ) {
	exigirLocal( tests );
	const ajustes = () =>
		wp(
			'echo md5(serialize(get_option("autodescription-site-settings")));'
		);
	const activo = () =>
		wp(
			`require_once ABSPATH."wp-admin/includes/plugin.php"; echo is_plugin_active("${ PLUGIN }") ? 1 : 0;`
		) === '1';
	const antes = ajustes();
	const activar = () =>
		wp(
			`require_once ABSPATH."wp-admin/includes/plugin.php"; $r=activate_plugin("${ PLUGIN }"); if(is_wp_error($r)) WP_CLI::error($r->get_error_message()); echo 1;`
		);
	alSalir.add( activar );
	try {
		wp(
			`require_once ABSPATH."wp-admin/includes/plugin.php"; deactivate_plugins("${ PLUGIN }"); echo 1;`
		);
		tests.check(
			'Respaldo: plugin desactivado y sin THE_SEO_FRAMEWORK_PRESENT',
			! activo() &&
				wp( 'echo defined("THE_SEO_FRAMEWORK_PRESENT") ? 1 : 0;' ) ===
					'0'
		);
		for ( const [ ruta, title, og, desc, canonica ] of [
			[ '/', HOME, HOME, GENERAL, '/' ],
			[
				BOLETIN,
				`${ e.boletin.titulo } | ${ MARCA }`,
				`${ e.boletin.titulo } | ${ MARCA }`,
				e.boletin.sumario,
				EDICION,
			],
		] ) {
			const data = await cabecera( ruta );
			tests.check(
				`Respaldo ${ ruta }: título, descripción, og:title y una canónica desde el tema`,
				data.title === title &&
					data.meta.description === desc &&
					data.meta[ 'og:title' ] === og &&
					data.canonical.length === 1 &&
					data.canonical[ 0 ] === url( canonica ),
				JSON.stringify( [ data.title, data.meta, data.canonical ] )
			);
			unico( `Respaldo ${ ruta }`, data );
		}
		const id = Number(
			wp(
				'$p=get_page_by_path("proyectos-destacados"); echo $p ? $p->ID : 0;'
			)
		);
		const texto = 'Extracto de respaldo del tema.';
		await conMeta(
			'Respaldo extracto',
			id,
			{ excerpt: texto },
			async () => {
				const data = await cabecera( '/proyectos-destacados/' );
				tests.check(
					'Respaldo: el extracto de la página sigue siendo su description',
					data.meta.description === texto,
					data.meta.description
				);
			}
		);
		const mapa = await fetch( url( '/wp-sitemap.xml' ), {
			redirect: 'manual',
		} );
		await mapa.body?.cancel();
		tests.check(
			'Respaldo: /wp-sitemap.xml vuelve a responder 200',
			mapa.status === 200,
			`HTTP ${ mapa.status }`
		);
	} finally {
		activar();
		alSalir.delete( activar );
		tests.check( 'Respaldo: plugin reactivado', activo() );
		tests.check(
			'Respaldo: ajustes del plugin intactos',
			ajustes() === antes
		);
	}
	const mapa = await fetch( url( '/sitemap.xml' ) );
	await mapa.body?.cancel();
	tests.check(
		'Plugin reactivado: /sitemap.xml vuelve a responder 200',
		mapa.status === 200
	);
}

async function production() {
	const project = `lapaz-fse-seo-${ process.pid }-${ randomUUID().slice(
		0,
		8
	) }`;
	const env = {
		...process.env,
		WORDPRESS_URL: 'http://seo-production.test',
		WORDPRESS_DB_NAME: 'wordpress',
		WORDPRESS_DB_USER: 'wordpress',
		WORDPRESS_DB_PASSWORD: 'seo-e2e-db-only',
		WORDPRESS_DB_ROOT_PASSWORD: 'seo-e2e-root-only',
		WP_ADMIN_USER: 'seo-e2e',
		WP_ADMIN_EMAIL: 'ci@example.test',
		WP_ENVIRONMENT_TYPE: 'production',
		WP_DEVELOPMENT_MODE: '',
	};
	const compose = ( ...args ) =>
		execFileSync(
			'docker',
			[ 'compose', '-p', project, '-f', 'compose.yaml', ...args ],
			{
				cwd: new URL( '../..', import.meta.url ),
				env,
				encoding: 'utf8',
				timeout: 600000, // el seed completo tarda
				maxBuffer: 10 * 1024 * 1024,
			}
		);
	let bajado = false;
	const bajar = () => {
		if ( bajado ) {
			return;
		}
		bajado = true;
		alSalir.delete( bajar );
		compose( 'down', '--volumes', '--remove-orphans' );
	};
	alSalir.add( bajar ); // También si la suite se interrumpe con una señal.
	try {
		console.log(
			'• Producción: levantando stack efímero sin puertos publicados'
		);
		compose( 'up', '-d', '--build', '--wait', '--wait-timeout', '120' );
		// Instalación nueva: el seed está permitido y da boletín, historia y productores.
		compose(
			'exec',
			'-T',
			'-u',
			'www-data',
			'cms',
			'lapaz-setup',
			'--seed'
		);
		const get = ( ruta ) =>
			compose(
				'exec',
				'-T',
				'cms',
				'curl',
				'-sS',
				'-H',
				'Host: seo-production.test',
				`http://localhost${ ruta }`
			);
		const base = env.WORDPRESS_URL;
		const page = lector;
		try {
			const data = await head( page, get( '/' ) );
			cleanedHead( 'Producción', data );
			const robots = data.meta.robots ?? '';
			tests.check(
				'Producción: noindex ausente con compose.yaml',
				! robots.split( /[,\s]+/ ).includes( 'noindex' ),
				robots
			);
			estructurados( 'Producción /', data );
			// Rutas públicas: indexables, con max-image-preview:large, una canónica y una etiqueta de cada.
			for ( const [ ruta, canonica ] of [
				[ '/', '/' ],
				[ '/proyectos-destacados/', '/proyectos-destacados/' ],
				[ CATALOGO, CATALOGO ],
				[ BOLETIN, EDICION ],
				[ EDICION, EDICION ],
				[ HISTORIAS, ASOCAFE ],
				[ ASOCAFE, ASOCAFE ],
			] ) {
				const d = await head( page, get( ruta ) );
				const claves = directivas( d );
				unico( `Producción ${ ruta }`, d );
				tests.check(
					`Producción ${ ruta }: sin noindex y con max-image-preview:large`,
					! claves.includes( 'noindex' ) &&
						claves.includes( 'max-image-preview:large' ),
					d.meta.robots
				);
				tests.check(
					`Producción ${ ruta }: una sola canonical (${ canonica })`,
					d.canonical.length === 1 &&
						d.canonical[ 0 ] === new URL( canonica, base ).href,
					JSON.stringify( d.canonical )
				);
			}
			// Catálogo: la búsqueda sale del índice pero sigue rastreable; un filtro por departamento, no.
			for ( const consulta of [ '?buscar=cafe', '?buscar=zzxqwvk' ] ) {
				const claves = directivas(
					await head( page, get( `${ CATALOGO }${ consulta }` ) )
				);
				tests.check(
					`Producción ${ CATALOGO }${ consulta }: noindex y sin nofollow`,
					claves.includes( 'noindex' ) &&
						! claves.includes( 'nofollow' ),
					claves.join( ',' )
				);
			}
			const departamento = compose(
				'exec',
				'-T',
				'-u',
				'www-data',
				'cms',
				'wp',
				'term',
				'list',
				'departamento',
				'--field=slug',
				'--number=1'
			).trim();
			const filtro = directivas(
				await head(
					page,
					get( `${ CATALOGO }?departamento=${ departamento }` )
				)
			);
			tests.check(
				`Producción ${ CATALOGO }?departamento=${ departamento }: sin noindex`,
				departamento !== '' && ! filtro.includes( 'noindex' ),
				filtro.join( ',' )
			);
			tests.check(
				'Producción: robots.txt apunta a /sitemap.xml',
				get( '/robots.txt' )
					.split( /\r?\n/ )
					.includes( `Sitemap: ${ base }/sitemap.xml` )
			);
			const mapa = get( '/sitemap.xml' );
			tests.check(
				'Producción: /sitemap.xml lista Inicio, la edición y la historia',
				[ '/', EDICION, ASOCAFE ].every( ( ruta ) =>
					mapa.includes(
						`<loc>${ new URL( ruta, base ).href }</loc>`
					)
				),
				mapa.slice( 0, 400 )
			);
			tests.check(
				'Producción: entorno confirmado',
				compose(
					'exec',
					'-T',
					'-u',
					'www-data',
					'cms',
					'wp',
					'eval',
					'echo wp_get_environment_type();'
				).trim() === 'production'
			);
			tests.check(
				'Producción: DISALLOW_FILE_MODS activo',
				compose(
					'exec',
					'-T',
					'-u',
					'www-data',
					'cms',
					'wp',
					'eval',
					'echo defined("DISALLOW_FILE_MODS") && DISALLOW_FILE_MODS ? "1" : "0";'
				).trim() === '1'
			);
		} finally {
			// el lector se cierra al final de la suite
		}
		await cleanupHttp(
			'Producción',
			env.WORDPRESS_URL,
			async ( route, method ) => {
				const args = [
					'exec',
					'-T',
					'cms',
					'curl',
					'-sS',
					'-D',
					'-',
					'-o',
					'/dev/null',
					'-w',
					'\n%{http_code}',
					'-H',
					'Host: seo-production.test',
					'-X',
					method,
				];
				if ( method === 'POST' ) {
					args.push(
						'-H',
						'Content-Type: text/xml',
						'--data-binary',
						'<methodCall><methodName>system.listMethods</methodName><params/></methodCall>'
					);
				}
				args.push( `http://localhost${ route }` );
				const output = compose( ...args );
				const status = Number( output.trim().slice( -3 ) );
				const pairs = output
					.split( /\r?\n/ )
					.map( ( line ) => /^([^:\s]+):\s*(.*)$/.exec( line ) )
					.filter( Boolean )
					.map( ( match ) => [ match[ 1 ], match[ 2 ] ] );
				return { status, headers: new Headers( pairs ) };
			}
		);
		const plugins = JSON.parse(
			compose(
				'exec',
				'-T',
				'-u',
				'www-data',
				'cms',
				'wp',
				'plugin',
				'list',
				'--format=json'
			)
		);
		tests.check(
			'Producción: The SEO Framework activo',
			plugins.some(
				( item ) =>
					item.name === 'autodescription' && item.status === 'active'
			)
		);
		tests.check(
			'Producción: plugins de ejemplo eliminados',
			plugins.every(
				( item ) =>
					! [
						'ai',
						'ai-provider-for-anthropic',
						'ai-provider-for-google',
						'hello',
						'akismet',
					].includes( item.name )
			)
		);
		const themes = JSON.parse(
			compose(
				'exec',
				'-T',
				'-u',
				'www-data',
				'cms',
				'wp',
				'theme',
				'list',
				'--format=json'
			)
		);
		tests.check(
			'Producción: solo queda el tema lapaz activo',
			themes.length === 1 &&
				themes[ 0 ].name === 'lapaz' &&
				themes[ 0 ].status === 'active'
		);
	} catch ( error ) {
		tests.check(
			'Producción: stack y verificación HTTP',
			false,
			error.stderr?.toString() || error.message
		);
	} finally {
		try {
			bajar();
			tests.check( 'Producción: stack temporal eliminado', true );
		} catch ( error ) {
			tests.check(
				'Producción: stack temporal eliminado',
				false,
				error.message
			);
		}
	}
}

try {
	exigirLocal( tests );
	lector = await tests.openPage( 'about:blank', 1440 );
	const e = esperado();
	await pages( e );
	await cleanupHttp( 'Local', site, async ( route, method ) => {
		const response = await fetch( new URL( route, site ), {
			method,
			redirect: 'manual',
			...( method === 'POST'
				? {
						headers: { 'Content-Type': 'text/xml' },
						body: '<methodCall><methodName>system.listMethods</methodName><params/></methodCall>',
				  }
				: {} ),
		} );
		const result = { status: response.status, headers: response.headers };
		await response.body?.cancel();
		return result;
	} );
	await editorGana( e );
	await extracto();
	await sitemap();
	await editor();
	await respaldo( e );
	await production();
} catch ( error ) {
	tests.check( 'La suite terminó sin excepciones', false, error.stack );
} finally {
	lector?.close();
	await tests.finish();
}
