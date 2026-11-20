// node tests/e2e/rest.mjs — sin sesión toda la API REST responde 401 y no filtra datos; con sesión, los tipos del catálogo no están en REST. Sin Chrome.
import assert from 'node:assert/strict';
import test from 'node:test';
import { ASOCAFE, CATALOGO, RUTA_RETIRADA, exigirLocal, productoresSeed, wpJson } from './fcp-lib.mjs';

const site = process.env.SITE_URL ?? 'http://localhost:8090';
exigirLocal( { site } );
const get = async ( path ) => {
	const r = await fetch( new URL( path, site ), { redirect: 'manual', credentials: 'omit' } );
	return { status: r.status, texto: await r.text() };
};
const TAXONOMIAS = [ 'poblacion', 'departamento', 'etnia', 'categoria_productor', 'tiempo_operacion' ];
const TIPOS = [ 'productor', 'boletin', 'historia' ];
const RUTAS = [
	'/wp-json/',
	...[ ...TIPOS, ...TAXONOMIAS ].map( ( t ) => `/wp-json/wp/v2/${ t }` ),
	'/wp-json/wp/v2/types',
	'/wp-json/wp/v2/taxonomies',
	'/wp-json/wp/v2/media',
	'/wp-json/wp/v2/search?search=cafe',
	'/?rest_route=/wp/v2/productor',
];

// Datos que no deben aparecer nunca en una respuesta anónima.
const semilla = productoresSeed();
assert.ok( semilla.length >= 5, 'El seed de productores debe tener datos.' );
const secretos = [ ...semilla.slice( 0, 5 ).map( ( p ) => p.nombre ), 'Asocafé', 'Edición 02', ...TAXONOMIAS.map( ( t ) => `"${ t }"` ) ];

for ( const ruta of RUTAS ) {
	const r = await get( ruta );
	await test( `Sin sesión: ${ ruta } responde 401 y no trae datos`, () => {
		assert.equal( r.status, 401 );
		const filtrados = secretos.filter( ( s ) => r.texto.includes( s ) );
		assert.deepEqual( filtrados, [], 'El cuerpo no debe traer datos.' );
	} );
}

const oembed = await get( '/wp-json/oembed/1.0/embed?url=' + encodeURIComponent( new URL( '/', site ).href ) );
await test( 'oEmbed de una URL del sitio: 401, o 200 sin autor', () => {
	assert.ok( [ 200, 401 ].includes( oembed.status ), `HTTP ${ oembed.status }` );
	if ( oembed.status === 200 ) assert.ok( ! /author_(name|url)/.test( oembed.texto ), 'No debe traer autor.' );
} );

// Con sesión de administrador (wp-cli, sin contraseñas): los tipos del catálogo no están en REST.
const sesion = wpJson( `
$admin = get_users( array( 'role' => 'administrator', 'number' => 1, 'fields' => 'ID' ) )[0] ?? 0;
if ( ! $admin ) WP_CLI::error( 'Sin administrador' );
wp_set_current_user( (int) $admin );
$rutas = array_keys( rest_get_server()->get_routes() );
$lista = function ( $ns ) use ( $rutas ) { return array_values( array_filter( $rutas, fn( $r ) => 0 === strpos( $r, '/wp/v2/' . $ns ) ) ); };
$todos = array( 'productor', 'boletin', 'historia', 'poblacion', 'departamento', 'etnia', 'categoria_productor', 'tiempo_operacion' );
$expuestas = array();
foreach ( $todos as $t ) { $o = get_post_type_object( $t ) ?: get_taxonomy( $t ); $base = $o && ! empty( $o->rest_base ) ? $o->rest_base : $t; $expuestas = array_merge( $expuestas, $lista( $base ) ); }
$tipos = rest_do_request( new WP_REST_Request( 'GET', '/wp/v2/types' ) )->get_data();
$taxs = rest_do_request( new WP_REST_Request( 'GET', '/wp/v2/taxonomies' ) )->get_data();
$req = new WP_REST_Request( 'GET', '/wp/v2/search' );
$req->set_param( 'search', ${ JSON.stringify( semilla[ 0 ].nombre ).replace( /\$/g, '\\$' ) } );
$req->set_param( 'subtype', 'any' );
$res = rest_do_request( $req );
$sub = array_values( array_unique( array_map( fn( $i ) => $i['subtype'] ?? '', (array) $res->get_data() ) ) );
echo wp_json_encode( array( 'expuestas' => $expuestas, 'tipos' => array_keys( (array) $tipos ), 'taxs' => array_keys( (array) $taxs ), 'busqueda' => $res->get_status(), 'subtipos' => $sub ) );
` );
await test( 'Con sesión: ninguna ruta REST de productor, boletín, historia ni de las cinco taxonomías', () =>
	assert.deepEqual( sesion.expuestas, [] ) );
await test( 'Con sesión: /types y /taxonomies no listan los tipos del catálogo', () => {
	assert.deepEqual( sesion.tipos.filter( ( t ) => TIPOS.includes( t ) ), [] );
	assert.deepEqual( sesion.taxs.filter( ( t ) => TAXONOMIAS.includes( t ) ), [] );
	assert.ok( sesion.tipos.includes( 'post' ), 'Sanidad: /types debe seguir listando tipos de WordPress.' );
} );
await test( 'Con sesión: la búsqueda REST no devuelve productores', () => {
	assert.equal( sesion.busqueda, 200 );
	assert.deepEqual( sesion.subtipos.filter( ( s ) => TIPOS.includes( s ) ), [] );
} );

const muchas = Array.from( { length: 50 }, ( _, i ) => `categoria[]=x${ i }` ).join( '&' );
const c = await get( `${ CATALOGO }?${ muchas }` );
await test( 'Catálogo: categoria[] con 50 valores responde 200, pinta el bloque y sin avisos de PHP', () => {
	assert.equal( c.status, 200 );
	assert.match( c.texto, /wp-block-lapaz-catalogo\b/ );
	assert.doesNotMatch( c.texto, /<b>(Warning|Notice|Deprecated|Fatal error)<\/b>|PHP (Warning|Notice|Deprecated|Fatal)/ );
} );

for ( const ruta of [ RUTA_RETIRADA, `${ RUTA_RETIRADA }historias/asocafe/` ] ) {
	const r = await get( ruta );
	await test( `${ ruta } responde 404`, () => assert.equal( r.status, 404 ) );
}
const ok = await get( ASOCAFE );
await test( `Sanidad: ${ ASOCAFE } responde 200`, () => assert.equal( ok.status, 200 ) );
