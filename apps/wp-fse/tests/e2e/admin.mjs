// node tests/e2e/admin.mjs — pantallas de edición con sesión de editor (HTTP, sin Chrome): cargan completas, con sus cajas y sin PHP Fatal.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import { CATALOGO_SLUG, EDICION, ASOCAFE, exigirLocal, wp, wpJson } from './fcp-lib.mjs';

const site = process.env.SITE_URL ?? 'http://localhost:8090';
exigirLocal( { site } );
const USUARIO = '__prueba_admin';
const inicio = new Date().toISOString();
const borrar = () =>
	wp( `require_once ABSPATH.'wp-admin/includes/user.php'; $u=username_exists("${ USUARIO }"); if($u) wp_delete_user((int)$u);` );
for ( const s of [ 'SIGINT', 'SIGTERM' ] )
	process.on( s, () => {
		try { borrar(); } finally { process.exit( 1 ); }
	} );

// Ids reales por ruta (las del seed): evita fijar números.
const idDe = ( tipo, slug ) =>
	Number( wp( `$p=get_page_by_path("${ slug }",OBJECT,"${ tipo }"); echo $p?$p->ID:0;` ) );
const slugDe = ( url ) => url.split( '/' ).filter( Boolean ).pop();
const grupo = ( g ) => `acf-${ wpJson( `echo json_encode(json_decode(file_get_contents(WP_CONTENT_DIR."/scf-json-lapaz/group_${ g }.json"),true)["key"]);` ) }`;
const pestanas = ( g ) =>
	wpJson( `echo json_encode(array_values(array_map(fn($f)=>$f["label"],array_filter(json_decode(file_get_contents(WP_CONTENT_DIR."/scf-json-lapaz/group_${ g }.json"),true)["fields"],fn($f)=>"tab"===$f["type"]))));` );

let cookie = '';
const pedir = async ( ruta ) => {
	const r = await fetch( new URL( ruta, site ), { redirect: 'manual', headers: { cookie } } );
	return { status: r.status, html: await r.text() };
};
// Cada pantalla: 200, HTML completo, sin pantalla de error. `caja` añade lo propio del tipo.
const pantalla = async ( nombre, ruta, extra ) => {
	const { status, html } = await pedir( ruta );
	await test( nombre, () => {
		assert.equal( status, 200, `HTTP ${ status }` );
		assert.ok( html.trimEnd().endsWith( '</html>' ), 'El HTML se corta antes de </html>.' );
		assert.ok( ! /error crítico|wp-die-message|Fatal error/i.test( html ), 'Pantalla de error.' );
		extra?.( html );
	} );
	return html;
};
const conSeo = ( html ) => {
	for ( const t of [ 'general', 'social' ] )
		assert.ok( html.includes( `id="tsf-flex-inpost-tab-${ t }"` ), `Falta la pestaña SEO ${ t }.` );
	assert.ok( ! html.includes( 'tsf-flex-inpost-tab-visibility' ), 'Un editor no debe ver la pestaña de visibilidad.' );
};
const sinSeo = ( html ) => assert.ok( ! html.includes( 'tsf-flex-inpost-tabs-wrapper' ), 'No debe haber caja de SEO.' );
const conGrupo = ( g, tabs = [] ) => ( html ) => {
	assert.ok( html.includes( `id="${ grupo( g ) }"` ), `Falta la caja del grupo ${ g }.` );
	for ( const t of tabs ) assert.ok( html.includes( `>${ t }</a>` ) || html.includes( `>${ t }<` ), `Falta la pestaña «${ t }».` );
};

try {
	const clave = randomBytes( 16 ).toString( 'hex' );
	borrar();
	wp( `wp_insert_user(array('user_login'=>"${ USUARIO }",'user_pass'=>"${ clave }",'role'=>'editor','user_email'=>'admin-prueba@example.test'));` );
	const c = wpJson( `$i=username_exists("${ USUARIO }"); $e=time()+900; echo json_encode(array(AUTH_COOKIE=>wp_generate_auth_cookie($i,$e,'auth'),LOGGED_IN_COOKIE=>wp_generate_auth_cookie($i,$e,'logged_in')));` );
	cookie = Object.entries( c ).map( ( [ k, v ] ) => `${ k }=${ v }` ).join( '; ' );

	const boletin = idDe( 'boletin', slugDe( EDICION ) );
	const historia = idDe( 'historia', slugDe( ASOCAFE ) );
	const productor = Number( wp( '$p=get_posts(array("post_type"=>"productor","numberposts"=>1,"fields"=>"ids")); echo $p[0]??0;' ) );
	const pagina = idDe( 'page', CATALOGO_SLUG );
	assert.ok( boletin && historia && productor && pagina, 'Faltan boletín, historia, productor o página del seed.' );
	const editar = ( id ) => `/wp-admin/post.php?post=${ id }&action=edit`;

	await pantalla( 'Editar Edición 02: grupo con pestañas y SEO', editar( boletin ), ( h ) => {
		conGrupo( 'boletin', pestanas( 'boletin' ) )( h );
		conSeo( h );
		// El título por defecto del tema (no solo el de la entrada) llega a la caja de SEO.
		assert.ok( h.includes( '&quot;defaultTitle&quot;:&quot;Caminos de Transformación, Edición 02&quot;' ), 'La caja de SEO no usa el título por defecto del tema.' );
	} );
	await pantalla( 'Editar Asocafé: grupo con pestañas y SEO', editar( historia ), ( h ) => { conGrupo( 'historia', pestanas( 'historia' ) )( h ); conSeo( h ); } );
	await pantalla( 'Editar un productor: su grupo y sin SEO', editar( productor ), ( h ) => { conGrupo( 'productor' )( h ); sinSeo( h ); } );
	const editor = await pantalla( 'Editar la página Productores PaisSana (editor de bloques)', editar( pagina ), ( h ) => assert.ok( h.includes( 'block-editor' ), 'Sin editor de bloques.' ) );
	const url = editor.match( /_wpMetaBoxUrl\s*=\s*"([^"]+)"/ )?.[ 1 ].replaceAll( '\\/', '/' );
	if ( url ) await pantalla( 'Cargador de cajas meta de esa página', new URL( url ).pathname + new URL( url ).search, ( h ) => assert.ok( h.includes( 'tsf-flex-inpost' ) ) );
	else await test( 'Cargador de cajas meta de esa página', { skip: 'No hay nonce en la página.' }, () => {} );
	for ( const t of [ 'boletin', 'historia' ] )
		await pantalla( `Añadir ${ t }: grupo y SEO`, `/wp-admin/post-new.php?post_type=${ t }`, ( h ) => { conGrupo( t, pestanas( t ) )( h ); conSeo( h ); } );
	await pantalla( 'Añadir productor: su grupo y sin SEO', '/wp-admin/post-new.php?post_type=productor', ( h ) => { conGrupo( 'productor' )( h ); sinSeo( h ); } );
	for ( const t of [ 'boletin', 'historia', 'productor' ] ) await pantalla( `Listado de ${ t }`, `/wp-admin/edit.php?post_type=${ t }`, ( h ) => assert.ok( h.includes( 'wp-list-table' ) ) );

	let registro = null;
	try {
		registro = execFileSync( 'docker', [ 'compose', 'logs', 'cms', '--since', inicio ], { cwd: new URL( '../..', import.meta.url ), encoding: 'utf8', timeout: 30000, maxBuffer: 50 * 1024 * 1024 } );
	} catch ( e ) {
		console.log( `Sin acceso al registro del contenedor (${ e.message.split( '\n' )[ 0 ] }): se omite.` );
	}
	await test( 'Sin PHP Fatal en el registro durante la suite', { skip: registro === null && 'Registro ilegible.' }, () =>
		assert.deepEqual( ( registro ?? '' ).split( '\n' ).filter( ( l ) => /PHP Fatal/.test( l ) ).slice( 0, 3 ), [] ) );
} finally {
	borrar();
	await test( 'Limpieza: usuario de prueba borrado', () => assert.equal( wp( `echo username_exists("${ USUARIO }")?1:0;` ), '0' ) );
}
