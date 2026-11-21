// node tests/e2e/admin.mjs — pantallas de edición con sesión de editor (HTTP, sin Chrome): cargan completas, con sus cajas y sin PHP Fatal. Incluye el guardado real de un boletín borrador.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import { CATALOGO_SLUG, EDICION, ASOCAFE, exigirLocal, limpiarPrueba, wp, wpJson } from './fcp-lib.mjs';

const site = process.env.SITE_URL ?? 'http://localhost:8090';
exigirLocal( { site } );
const USUARIO = '__prueba_admin';
const inicio = new Date( Date.now() - 5000 ).toISOString(); // margen: el reloj de la VM de Docker puede ir unos segundos por delante.
const borrar = () => {
	try {
		limpiarPrueba(); // boletines `__prueba*` (el del guardado), siempre
	} finally {
		wp( `require_once ABSPATH.'wp-admin/includes/user.php'; $u=username_exists("${ USUARIO }"); if($u) wp_delete_user((int)$u);` );
	}
};
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
// Cajas de las cinco taxonomías del productor (ids reales del HTML de WordPress: <taxonomía>div).
const conTaxonomias = ( html ) => {
	for ( const t of [ 'departamento', 'categoria_productor', 'tiempo_operacion', 'etnia', 'poblacion' ] )
		assert.ok( html.includes( `id="${ t }div"` ), `Falta la caja de la taxonomía ${ t }.` );
};
const conGrupo = ( g, tabs = [] ) => ( html ) => {
	assert.ok( html.includes( `id="${ grupo( g ) }"` ), `Falta la caja del grupo ${ g }.` );
	for ( const t of tabs ) assert.ok( html.includes( `>${ t }</a>` ) || html.includes( `>${ t }<` ), `Falta la pestaña «${ t }».` );
};

try {
	const clave = randomBytes( 16 ).toString( 'hex' );
	borrar();
	wp( `$r=wp_insert_user(array('user_login'=>"${ USUARIO }",'user_pass'=>"${ clave }",'role'=>'editor','user_email'=>'admin-prueba@example.test')); if(is_wp_error($r)) WP_CLI::error('No se pudo crear el usuario de prueba: '.$r->get_error_message());` );
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
	await pantalla( 'Editar un productor: su grupo, sus 5 taxonomías y sin SEO', editar( productor ), ( h ) => { conGrupo( 'productor' )( h ); conTaxonomias( h ); sinSeo( h ); } );
	const editor = await pantalla( 'Editar la página Productores PaisSana (editor de bloques)', editar( pagina ), ( h ) => assert.ok( h.includes( 'block-editor' ), 'Sin editor de bloques.' ) );
	const url = editor.match( /_wpMetaBoxUrl\s*=\s*"([^"]+)"/ )?.[ 1 ].replaceAll( '\\/', '/' );
	assert.ok( url, 'No se encontró _wpMetaBoxUrl en el editor de bloques.' );
	await pantalla( 'Cargador de cajas meta de esa página: caja de SEO con sus pestañas', new URL( url ).pathname + new URL( url ).search, conSeo );
	for ( const t of [ 'boletin', 'historia' ] )
		await pantalla( `Añadir ${ t }: grupo y SEO`, `/wp-admin/post-new.php?post_type=${ t }`, ( h ) => { conGrupo( t, pestanas( t ) )( h ); conSeo( h ); } );
	await pantalla( 'Añadir productor: su grupo y sin SEO', '/wp-admin/post-new.php?post_type=productor', ( h ) => { conGrupo( 'productor' )( h ); sinSeo( h ); } );
	for ( const t of [ 'boletin', 'historia', 'productor' ] ) await pantalla( `Listado de ${ t }`, `/wp-admin/edit.php?post_type=${ t }`, ( h ) => assert.ok( h.includes( 'wp-list-table' ) ) );

	// Un Editor tiene manage_categories: ve los términos del catálogo (no se espera negativa de WordPress).
	await pantalla( 'Listado de páginas', '/wp-admin/edit.php?post_type=page', ( h ) => assert.ok( h.includes( 'wp-list-table' ) ) );
	await pantalla( 'Términos de Departamentos del catálogo', '/wp-admin/edit-tags.php?taxonomy=departamento&post_type=productor', ( h ) => assert.ok( h.includes( 'wp-list-table' ) && h.includes( 'id="addtag"' ), 'Sin tabla ni formulario de términos.' ) );
	await pantalla( 'Biblioteca de medios', '/wp-admin/upload.php', ( h ) => assert.ok( h.includes( 'wp-media-grid' ) || h.includes( 'wp-list-table' ), 'Sin biblioteca.' ) );
	await pantalla( 'Perfil del editor', '/wp-admin/profile.php', ( h ) => assert.ok( h.includes( 'id="your-profile"' ), 'Sin formulario de perfil.' ) );

	// Guardado real por HTTP de un boletín borrador, como el navegador: el flujo mensual del editor.
	// Los campos `required` de SCF solo se validan en JS: el servidor guarda el borrador sin rellenarlos.
	const idB = Number( wp( `echo wp_insert_post(array('post_type'=>'boletin','post_status'=>'draft','post_title'=>'__prueba boletin','post_author'=>username_exists("${ USUARIO }")));` ) );
	const formulario = ( await pedir( editar( idB ) ) ).html.match( /<form name="post"[\s\S]*?<\/form>/ )?.[ 0 ] ?? '';
	const datos = new URLSearchParams();
	const attr = ( tag, a ) => tag.match( new RegExp( `\\b${ a }=(["'])(.*?)\\1` ) )?.[ 2 ];
	for ( const [ tag ] of formulario.matchAll( /<input\b[^>]*>/g ) ) { // WordPress imprime algunos con comillas simples (post_ID)
		const n = attr( tag, 'name' );
		if ( attr( tag, 'type' ) === 'hidden' && n && ! n.includes( 'acfcloneindex' ) ) datos.append( n, ( attr( tag, 'value' ) ?? '' ).replaceAll( '&#038;', '&' ).replaceAll( '&amp;', '&' ) );
	}
	// Lo visible de «Publicar» (fecha, estado, visibilidad): sin ello WordPress avisa de claves indefinidas y no redirige.
	for ( const [ tag ] of formulario.matchAll( /<input\b[^>]*type="text"[^>]*>/g ) ) if ( /^(aa|jj|hh|mn)$/.test( attr( tag, 'name' ) ) ) datos.set( attr( tag, 'name' ), attr( tag, 'value' ) );
	datos.set( 'mm', formulario.match( /<select[^>]*name="mm"[\s\S]*?<option[^>]*value="(\d+)"[^>]*selected/ )?.[ 1 ] ?? '' );
	datos.set( 'post_status', 'draft' );
	datos.set( 'visibility', 'public' );
	const campo = formulario.match( /name="(acf\[field_boletin_portada_titular\])"/ )?.[ 1 ];
	assert.ok( campo && datos.get( 'post_ID' ) && datos.get( '_wpnonce' ) && datos.get( 'tsf_post_nonce_name' ), 'El formulario no trae el titular de portada ni sus nonces.' );
	datos.set( 'post_title', '__prueba boletin guardado' );
	datos.set( campo, 'Titular de prueba' );
	datos.set( 'save', 'Guardar' );
	datos.set( 'autodescription[_genesis_title]', 'Titulo SEO de prueba' );
	datos.set( 'autodescription[redirect]', 'https://malo.example/x' ); // un Editor no puede
	datos.set( 'autodescription[_genesis_noindex]', '1' ); // un Editor no puede
	const guardar = await fetch( new URL( '/wp-admin/post.php', site ), { method: 'POST', redirect: 'manual', headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' }, body: datos } );
	await test( 'Guardar un boletín borrador por HTTP: redirección normal', () => {
		assert.equal( guardar.status, 302, `HTTP ${ guardar.status }` );
		assert.match( guardar.headers.get( 'location' ) ?? '', /post\.php\?.*message=/ );
	} );
	const g = wpJson( `$i=${ idB }; echo wp_json_encode(array('titulo'=>get_the_title($i),'titular'=>get_field('field_boletin_portada_titular',$i),'seo'=>get_post_meta($i,'_genesis_title',true),'redirect'=>get_post_meta($i,'redirect',true),'noindex'=>get_post_meta($i,'_genesis_noindex',true)));` );
	await test( 'Guardado: título, campo del grupo y título de SEO quedaron guardados', () =>
		assert.deepEqual( [ g.titulo, g.titular, g.seo ], [ '__prueba boletin guardado', 'Titular de prueba', 'Titulo SEO de prueba' ] ) );
	await test( 'Guardado: un Editor no guarda redirección ni noindex', () => {
		assert.ok( ! g.redirect, `Se guardó la redirección: ${ g.redirect }` );
		assert.ok( ! Number( g.noindex || 0 ), 'Se guardó el noindex.' );
	} );

	let registro = null;
	let sinRegistro = '';
	try {
		registro = execFileSync( 'docker', [ 'compose', 'logs', 'cms', '--since', inicio ], { cwd: new URL( '../..', import.meta.url ), encoding: 'utf8', timeout: 30000, maxBuffer: 50 * 1024 * 1024 } );
	} catch ( e ) {
		sinRegistro = `No se pudo leer el registro del contenedor (${ e.message.split( '\n' )[ 0 ] }).`;
		console.log( sinRegistro );
	}
	// Solo en CI se admite no poder leerlo (y queda dicho en la salida); en local es un fallo.
	await test( 'Sin errores fatales de PHP en el registro durante la suite', { skip: !! process.env.CI && registro === null && sinRegistro }, () => {
		assert.ok( registro !== null, sinRegistro );
		assert.deepEqual( registro.split( '\n' ).filter( ( l ) => /PHP (Fatal|Parse) error|syntax error, unexpected|Uncaught (\S+)?Error/.test( l ) ).slice( 0, 3 ), [] );
	} );
} finally {
	borrar();
	await test( 'Limpieza: usuario y boletín de prueba borrados', () =>
		assert.equal( wp( `global $wpdb; echo (username_exists("${ USUARIO }")?1:0).$wpdb->get_var("SELECT COUNT(*) FROM $wpdb->posts WHERE post_title LIKE '\\_\\_prueba%'");` ), '00' ) );
}
