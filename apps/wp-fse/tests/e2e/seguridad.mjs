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

async function request( route ) {
	const response = await fetch( new URL( route, site ), {
		redirect: 'manual',
		credentials: 'omit',
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

const api = await request( '/wp-json/wp/v2/types' );
await test( 'La API REST general sigue operativa sin sesión', () =>
	assert.equal( api.response.status, 200 ) );
const users = await request( '/wp-json/wp/v2/users' );
await test( 'Usuarios REST sin sesión: 404', () =>
	assert.equal( users.response.status, 404 ) );
const author = await request( '/?author=1' );
await test( 'Enumeración por author: 301 al inicio', () => {
	assert.equal( author.response.status, 301 );
	assert.ok( author.response.headers.get( 'location' ) );
	assert.equal(
		new URL( author.response.headers.get( 'location' ), site ).href,
		new URL( '/', site ).href
	);
} );

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
