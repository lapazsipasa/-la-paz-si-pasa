// node tests/e2e/seguridad.mjs — HTTP anónimo y un PHP temporal creado/borrado con wp-cli.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { wp } from './paisana-lib.mjs';

const site = process.env.SITE_URL ?? 'http://localhost:8090';
const localOrigins = [ 'http://localhost:8090', 'http://127.0.0.1:8090' ];
assert.ok(
	localOrigins.includes( new URL( site ).origin ),
	'La prueba de uploads requiere el stack local en :8090.'
);

async function request( route, init = {} ) {
	const response = await fetch( new URL( route, site ), {
		redirect: 'manual',
		credentials: 'omit',
		...init,
	} );
	const body = await response.text();
	await test( `${ route }: cuatro cabeceras de seguridad`, () => {
		// REST y Apache pueden enviar el mismo valor; fetch agrupa las cabeceras repetidas.
		assert.match(
			response.headers.get( 'x-content-type-options' ) ?? '',
			/(?:^|,)\s*nosniff\s*(?:,|$)/i
		);
		assert.equal(
			response.headers.get( 'referrer-policy' ),
			'strict-origin-when-cross-origin'
		);
		assert.equal(
			response.headers.get( 'x-frame-options' )?.toUpperCase(),
			'SAMEORIGIN'
		);
		const policy = response.headers.get( 'permissions-policy' ) ?? '';
		for ( const feature of [
			'camera',
			'microphone',
			'geolocation',
			'payment',
		] )
			assert.match(
				policy,
				new RegExp( `${ feature }\\s*=\\s*\\(\\s*\\)` )
			);
	} );
	return { response, body };
}

// La API REST exige sesión (lapaz-seguridad.php): el sitio público no la consume.
for ( const route of [
	'/wp-json/',
	'/wp-json/wp/v2/types',
	'/wp-json/wp/v2/media',
	'/wp-json/wp/v2/noticia',
	'/wp-json/oembed/1.0/embed?url=' + encodeURIComponent( site + '/' ),
	'/?rest_route=/wp/v2/types',
] ) {
	const result = await request( route );
	await test( `${ route }: REST sin sesión 401`, () =>
		assert.equal( result.response.status, 401 ) );
}
const users = await request( '/wp-json/wp/v2/users' );
await test( 'Usuarios REST sin sesión: 401', () =>
	assert.equal( users.response.status, 401 ) );
const author = await request( '/?author=1' );
await test( 'Enumeración por author: 301 al inicio', () => {
	assert.equal( author.response.status, 301 );
	assert.ok( author.response.headers.get( 'location' ) );
	assert.equal(
		new URL( author.response.headers.get( 'location' ), site ).href,
		new URL( '/', site ).href
	);
} );

const home = await request( '/' );
await test( 'Sin fugas de versión: sin X-Powered-By y Server sin números', () => {
	assert.equal( home.response.headers.get( 'x-powered-by' ), null );
	assert.doesNotMatch( home.response.headers.get( 'server' ) ?? '', /\d/ );
} );
await test( 'Inicio: CSP solo informe, con YouTube sin cookies y sin report-uri (imagen nueva)', () => {
	const csp =
		home.response.headers.get( 'content-security-policy-report-only' ) ??
		'';
	assert.match( csp, /frame-src https:\/\/www\.youtube-nocookie\.com/ );
	assert.match( csp, /object-src 'none'/ );
	assert.doesNotMatch( csp, /report-(uri|to)/ );
	assert.equal(
		home.response.headers.get( 'content-security-policy' ),
		null
	);
} );
const boletin = await request( '/boletin/' );
await test( '/boletin/: CSP solo informe (imagen nueva)', () =>
	assert.ok(
		boletin.response.headers.get( 'content-security-policy-report-only' )
	) );
// fetch directo: WordPress repite en el login algunas cabeceras que Apache ya envía.
const login = await fetch( new URL( '/wp-login.php', site ), {
	redirect: 'manual',
} );
await test( 'wp-login.php sin CSP (el admin queda fuera)', () =>
	assert.equal(
		login.headers.get( 'content-security-policy-report-only' ),
		null
	) );
await test( 'HSTS solo con X-Forwarded-Proto https (imagen nueva)', async () => {
	assert.equal(
		home.response.headers.get( 'strict-transport-security' ),
		null
	);
	const https = await request( '/', {
		headers: { 'x-forwarded-proto': 'https' },
	} );
	assert.match(
		https.response.headers.get( 'strict-transport-security' ) ?? '',
		/max-age=\d{7,}/
	);
} );

await test( 'Contraseñas de aplicación desactivadas', () =>
	assert.equal(
		wp(
			'echo wp_is_application_passwords_available() ? "1" : "0";'
		),
		'0'
	) );

// Mismo mensaje con usuario inexistente que con uno existente y clave errónea.
async function loginError( usuario ) {
	const body = new URLSearchParams( {
		log: usuario,
		pwd: 'clave-incorrecta-e2e',
		'wp-submit': 'Acceder',
	} );
	const r = await fetch( new URL( '/wp-login.php', site ), {
		method: 'POST',
		body,
		redirect: 'manual',
		headers: { cookie: 'wordpress_test_cookie=WP%20Cookie%20check' },
	} );
	return /<div id="login_error"[^>]*>([\s\S]*?)<\/div>/.exec(
		await r.text()
	)?.[ 1 ]
		?.replace( /<[^>]+>/g, '' )
		.replace( /\s+/g, ' ' )
		.trim();
}
await test( 'Login: mismo error con usuario inexistente y existente', async () => {
	const existente = wp(
		'echo get_users( array( "number" => 1, "fields" => "user_login" ) )[0] ?? "";'
	);
	assert.ok( existente, 'No hay usuarios para la prueba.' );
	const a = await loginError( `no-existe-${ randomUUID() }` );
	const b = await loginError( existente );
	assert.ok( a );
	assert.equal( a, b );
	assert.ok( ! a.includes( existente ) );
} );

for ( const route of [
	'/xmlrpc.php',
	'/readme.html',
	'/license.txt',
	'/wp-config-sample.php',
	'/wp-content/debug.log',
] ) {
	const result = await request( route );
	await test( `${ route }: 403 (readme, license, sample y debug.log: imagen nueva)`, () =>
		assert.equal( result.response.status, 403 ) );
}
for ( const route of [
	'/wp-content/uploads/',
	'/wp-content/themes/lapaz/assets/',
] ) {
	const result = await request( route );
	await test( `${ route }: sin listado de directorios`, () =>
		assert.ok(
			result.response.status !== 200 ||
				! /Index of/i.test( result.body )
		) );
}

for ( const route of [
	'/wp-content/scf-json/',
	'/wp-content/scf-json/group_home.json',
	'/wp-content/scf-json-lapaz/',
	'/wp-content/scf-json-lapaz/group_proyectos.json',
] ) {
	const result = await request( route );
	await test( `${ route }: 403`, () =>
		assert.equal( result.response.status, 403 ) );
}
for ( const route of [
	'/wp-content/themes/lapaz/blocks/hero/render.php',
	'/wp-content/themes/lapaz/patterns/no-encontrada.php',
] ) {
	const result = await request( route );
	await test( `${ route }: acceso directo vacío`, () => {
		assert.equal( result.response.status, 200 );
		assert.equal( result.body, '' );
	} );
}

await test( 'Local: DISALLOW_FILE_MODS desactivado', () => {
	assert.equal(
		wp(
			'echo defined("DISALLOW_FILE_MODS") && DISALLOW_FILE_MODS ? "1" : "0";'
		),
		'0'
	);
} );

const name = `lapaz-seguridad-e2e-${ randomUUID() }.php`;
let fixture;
try {
	fixture = JSON.parse(
		wp(
			`$uploads=wp_upload_dir(); if(!wp_mkdir_p($uploads["basedir"])) WP_CLI::error("No se pudo preparar uploads"); $path=$uploads["basedir"]."/${ name }"; $handle=@fopen($path,"x"); if(!$handle) WP_CLI::error("No se pudo crear el archivo exclusivo"); $code="<?php echo 'lapaz-e2e-executed';"; $written=fwrite($handle,$code); fclose($handle); if($written!==strlen($code)){unlink($path); WP_CLI::error("No se pudo escribir el archivo completo");} echo wp_json_encode(["path"=>$path,"url"=>$uploads["baseurl"]."/${ name }"]);`
		)
	);
	assert.ok(
		localOrigins.includes( new URL( fixture.url ).origin ),
		'El archivo de prueba debe permanecer en el stack local.'
	);
	const result = await request( fixture.url );
	await test( 'Un .php en uploads no se ejecuta: 403', () =>
		assert.equal( result.response.status, 403 ) );
} finally {
	if ( fixture ) {
		const encoded = Buffer.from( JSON.stringify( fixture ) ).toString(
			'base64'
		);
		const removed = wp(
			`$file=json_decode(base64_decode("${ encoded }"),true); if(basename($file["path"])!=="${ name }") WP_CLI::error("Ruta inesperada"); if(file_exists($file["path"]) && !unlink($file["path"])) WP_CLI::error("No se pudo borrar el archivo de prueba"); echo file_exists($file["path"])?"0":"1";`
		);
		await test( 'Archivo PHP temporal eliminado', () =>
			assert.equal( removed, '1' ) );
	}
}

// Variantes de extensión ejecutables (imagen nueva): archivos reales, porque Apache solo niega los que existen.
const variantes = [ 'phtml', 'php8', 'pht', 'php.jpg' ].map(
	( ext ) => `lapaz-seguridad-e2e-${ randomUUID() }.${ ext }`
);
try {
	wp(
		`$d=wp_upload_dir()["basedir"]; wp_mkdir_p($d); foreach(${ JSON.stringify( variantes ) } as $n){ if(file_put_contents($d."/".$n,"<?php echo 'lapaz-e2e-executed';",LOCK_EX)===false) WP_CLI::error("No se pudo crear ".$n); }`
	);
	for ( const variante of variantes ) {
		const result = await request( `/wp-content/uploads/${ variante }` );
		await test( `Variante .${ variante.split( '.' ).slice( 1 ).join( '.' ) } en uploads: 403`, () =>
			assert.equal( result.response.status, 403 ) );
	}
} finally {
	wp(
		`$d=wp_upload_dir()["basedir"]; foreach(${ JSON.stringify( variantes ) } as $n){ if(strpos($n,"lapaz-seguridad-e2e-")===0 && file_exists($d."/".$n)) unlink($d."/".$n); }`
	);
}
