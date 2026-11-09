// node tests/e2e/seo.mjs — incluye un stack de producción efímero, sin puertos publicados.
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createBrowserTests } from './lib.mjs';
import { wp } from './paisana-lib.mjs';

const tests = createBrowserTests();
const site = tests.site;
const routes = [
	[
		'/',
		'La Paz Sí Pasa | Fondo Colombia en Paz',
		'El Fondo Colombia en Paz ejecuta los recursos para implementar la paz: conoce las subcuentas, las cifras de gestión y las historias de los territorios PDET.',
	],
	[
		'/proyectos-destacados/',
		'PaisSana, proyectos destacados | La Paz Sí Pasa',
		'PaisSana reúne a las familias productoras de los territorios PDET: mapas por región, relatos en audio, ferias y videos del café, el cacao y las artesanías.',
	],
	[
		'/no-existe-xyz',
		'Página no encontrada | La Paz Sí Pasa',
		'La página que buscas no existe o cambió de dirección. Vuelve al inicio para conocer la gestión del Fondo Colombia en Paz en los territorios.',
	],
];

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
		canonical:[...document.head.querySelectorAll('link[rel="canonical"]')].map(el=>el.href),
		favicon:document.head.querySelector('link[rel~="icon"]')?.href,
		emojis:/wp-emoji|_wpemojiSettings|emoji-release/.test(document.head.innerHTML),
		api:document.head.querySelector('link[rel*="api.w.org"]')?.outerHTML,
		oembed:document.head.querySelector('link[type*="oembed"]')?.outerHTML,
		feeds:document.head.querySelector('link[type="application/rss+xml"],link[type="application/atom+xml"]')?.outerHTML,
		discovery:document.head.querySelector('link[rel="EditURI"],link[rel="shortlink"]')?.outerHTML,
		globalStyles:document.head.querySelector('#global-styles-inline-css')?.textContent ?? null
	}))(${ doc })` );
}

function cleanedHead( label, data ) {
	tests.check(
		`${ label }: sin generator`,
		! Object.hasOwn( data.meta, 'generator' )
	);
	for ( const key of [ 'api', 'oembed', 'feeds', 'discovery' ] )
		tests.check(
			`${ label }: sin ${ key } en head`,
			! data[ key ],
			data[ key ]
		);
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
	for ( const route of routes.map( ( item ) => item[ 0 ] ) ) {
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

async function pages() {
	for ( const [ route, title, description ] of routes ) {
		const page = await tests.openPage( new URL( route, site ).href, 1440 );
		try {
			const data = await head( page );
			cleanedHead( route, data );
			tests.check(
				`${ route }: título`,
				data.title === title,
				data.title
			);
			tests.check(
				`${ route }: description por defecto`,
				data.meta.description === description,
				data.meta.description
			);
			tests.check(
				`${ route }: Open Graph completo y coherente`,
				data.meta[ 'og:title' ] === title &&
					data.meta[ 'og:description' ] === description &&
					data.meta[ 'og:site_name' ] === 'La Paz Sí Pasa' &&
					data.meta[ 'og:locale' ] === 'es_CO' &&
					data.meta[ 'og:type' ] === 'website' &&
					data.meta[ 'og:image:width' ] === '1200' &&
					data.meta[ 'og:image:height' ] === '630' &&
					Boolean( data.meta[ 'og:image:alt' ] ),
				JSON.stringify( data.meta )
			);
			tests.check(
				`${ route }: og:url`,
				data.meta[ 'og:url' ] ===
					new URL( route === '/no-existe-xyz' ? '/' : route, site )
						.href,
				data.meta[ 'og:url' ]
			);
			tests.check(
				`${ route }: Twitter completo y coherente`,
				data.meta[ 'twitter:card' ] === 'summary_large_image' &&
					data.meta[ 'twitter:title' ] === title &&
					data.meta[ 'twitter:description' ] === description &&
					Boolean( data.meta[ 'og:image' ] ) &&
					data.meta[ 'twitter:image' ] === data.meta[ 'og:image' ]
			);
			// El core imprime canonical solo para contenido singular; el 404 no lo tiene.
			tests.check(
				`${ route }: canonical sin duplicados`,
				route === '/no-existe-xyz'
					? data.canonical.length === 0
					: data.canonical.length === 1 &&
							data.canonical[ 0 ] === new URL( route, site ).href,
				JSON.stringify( data.canonical )
			);
			const robots = ( data.meta.robots ?? '' ).split( /[,\s]+/ );
			tests.check(
				`${ route }: local noindex y nofollow`,
				robots.includes( 'noindex' ) && robots.includes( 'nofollow' ),
				data.meta.robots
			);
			tests.check(
				`${ route }: favicon presente`,
				Boolean( data.favicon )
			);
			if ( data.favicon ) {
				const icon = await fetch( data.favicon );
				tests.check(
					`${ route }: favicon responde correctamente`,
					icon.ok,
					`HTTP ${ icon.status }`
				);
				await icon.body?.cancel();
			}
			tests.check(
				`${ route }: sin script ni estilos de emojis`,
				! data.emojis
			);
		} finally {
			page.close();
		}
	}
}

async function excerpt() {
	if (
		! [ 'http://localhost:8090', 'http://127.0.0.1:8090' ].includes(
			new URL( site ).origin
		)
	)
		throw new Error(
			'La edición del extracto requiere el stack local en :8090.'
		);
	const snapshot =
		'$page=get_page_by_path("proyectos-destacados"); if(!$page) WP_CLI::error("Falta Proyectos destacados"); echo wp_json_encode(["id"=>$page->ID,"excerpt"=>$page->post_excerpt]);';
	const saved = JSON.parse( wp( snapshot ) );
	const text = 'Descripción SEO de prueba & territorio.';
	try {
		wp(
			`wp_update_post(["ID"=>${
				saved.id
			},"post_excerpt"=>${ JSON.stringify( text ) }]);`
		);
		const page = await tests.openPage(
			new URL( '/proyectos-destacados/', site ).href,
			1440
		);
		try {
			const data = await head( page );
			tests.check(
				'Extracto: reemplaza description, og y Twitter',
				[
					'description',
					'og:description',
					'twitter:description',
				].every( ( key ) => data.meta[ key ] === text ),
				JSON.stringify( data.meta )
			);
		} finally {
			page.close();
		}
	} finally {
		const encoded = Buffer.from( JSON.stringify( saved ) ).toString(
			'base64'
		);
		wp(
			`$saved=json_decode(base64_decode("${ encoded }"),true); wp_update_post(["ID"=>$saved["id"],"post_excerpt"=>$saved["excerpt"]]);`
		);
		tests.check(
			'Extracto original restaurado',
			JSON.stringify( JSON.parse( wp( snapshot ) ) ) ===
				JSON.stringify( saved )
		);
	}
}

async function sitemap() {
	const indexUrl = new URL( '/wp-sitemap.xml', site ).href;
	const index = await fetch( indexUrl );
	tests.check(
		'Sitemap: índice responde 200',
		index.status === 200,
		`HTTP ${ index.status }`
	);
	const xml = await index.text();
	const providers = [ ...xml.matchAll( /<loc>([^<]+)<\/loc>/g ) ].map(
		( match ) => match[ 1 ].replaceAll( '&amp;', '&' )
	);
	tests.check(
		'Sitemap: solo proveedor de páginas',
		providers.length > 0 &&
			providers.every( ( url ) =>
				/^\/wp-sitemap-posts-page-\d+\.xml$/.test(
					new URL( url ).pathname
				)
			),
		JSON.stringify( providers )
	);
	const urls = [];
	for ( const url of providers ) {
		const response = await fetch( url );
		tests.check(
			'Sitemap de páginas responde 200',
			response.status === 200,
			url
		);
		urls.push(
			...[
				...( await response.text() ).matchAll( /<loc>([^<]+)<\/loc>/g ),
			].map( ( match ) => match[ 1 ].replaceAll( '&amp;', '&' ) )
		);
	}
	tests.check(
		'Sitemap: solo Inicio y Proyectos destacados',
		JSON.stringify( urls.sort() ) ===
			JSON.stringify(
				[
					new URL( '/', site ).href,
					new URL( '/proyectos-destacados/', site ).href,
				].sort()
			),
		JSON.stringify( urls )
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
				timeout: 240000,
				maxBuffer: 10 * 1024 * 1024,
			}
		);
	try {
		console.log(
			'• Producción: levantando stack efímero sin puertos publicados'
		);
		compose( 'up', '-d', '--build', '--wait', '--wait-timeout', '120' );
		compose( 'exec', '-T', '-u', 'www-data', 'cms', 'lapaz-setup' );
		const html = compose(
			'exec',
			'-T',
			'cms',
			'curl',
			'-fsS',
			'-H',
			'Host: seo-production.test',
			'http://localhost/'
		);
		const page = await tests.openPage( 'about:blank', 1440 );
		try {
			const data = await head( page, html );
			cleanedHead( 'Producción', data );
			const robots = data.meta.robots ?? '';
			tests.check(
				'Producción: noindex ausente con compose.yaml',
				! robots.split( /[,\s]+/ ).includes( 'noindex' ),
				robots
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
			page.close();
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
				if ( method === 'POST' )
					args.push(
						'-H',
						'Content-Type: text/xml',
						'--data-binary',
						'<methodCall><methodName>system.listMethods</methodName><params/></methodCall>'
					);
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
			compose( 'down', '--volumes', '--remove-orphans' );
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
	await pages();
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
	await excerpt();
	await sitemap();
	await production();
} finally {
	await tests.finish();
}
