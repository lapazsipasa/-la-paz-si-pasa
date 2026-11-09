import { execFileSync } from 'node:child_process';
import { createBrowserTests } from './lib.mjs';

export function wp( code ) {
	return execFileSync(
		'docker',
		[
			'compose',
			'exec',
			'-T',
			'-u',
			'www-data',
			'cms',
			'wp',
			'--path=/var/www/html',
			'eval',
			code,
		],
		{
			cwd: new URL( '../..', import.meta.url ),
			encoding: 'utf8',
			timeout: 30000,
		}
	).trim();
}

export async function withProjectFields( values, tests, action ) {
	if (
		! [ 'http://localhost:8090', 'http://127.0.0.1:8090' ].includes(
			new URL( tests.site ).origin
		)
	)
		throw new Error(
			'La edición de prueba requiere el stack local en :8090.'
		);
	const encoded = Buffer.from( JSON.stringify( values ) ).toString(
		'base64'
	);
	const snapshot = `$page=get_page_by_path("proyectos-destacados"); if(!$page) WP_CLI::error("No existe Proyectos destacados"); $values=json_decode(base64_decode("${ encoded }"),true); $meta=[]; foreach(array_keys($values) as $name){foreach([$name,"_".$name] as $key) $meta[$key]=get_post_meta($page->ID,$key,false);} echo wp_json_encode(["id"=>$page->ID,"meta"=>$meta]);`;
	const saved = JSON.parse( wp( snapshot ) );
	try {
		wp(
			`$values=json_decode(base64_decode("${ encoded }"),true); foreach($values as $name=>$value) update_field("field_proyectos_".$name,$value,${ saved.id });`
		);
		await action();
	} finally {
		const original = Buffer.from( JSON.stringify( saved ) ).toString(
			'base64'
		);
		wp(
			`$saved=json_decode(base64_decode("${ original }"),true); foreach($saved["meta"] as $key=>$values){delete_post_meta($saved["id"],$key); foreach($values as $value) add_post_meta($saved["id"],$key,$value);}`
		);
		tests.check(
			'Proyectos: metadatos originales restaurados',
			JSON.stringify( JSON.parse( wp( snapshot ) ) ) ===
				JSON.stringify( saved )
		);
	}
}

async function capture( page, name, selector, tests ) {
	const ready = await page.evaluate( `(async () => {
		const section=document.querySelector(${ JSON.stringify( selector ) });
		if(!section) return false;
		return Promise.race([
			(async()=>{
				await document.fonts.ready;
				return (await Promise.all([...section.querySelectorAll('img')].filter(img=>img.offsetParent!==null && !img.closest('details:not([open]), [hidden]')).map(async img=>{
					img.loading='eager';
					try {await img.decode();} catch {return false;}
					return img.complete && img.naturalWidth>0;
				}))).every(Boolean);
			})(),new Promise(resolve=>setTimeout(()=>resolve(false),5000))
		]);
	})()` );
	tests.check( `${ name }: imágenes y fuentes listas antes de 5 s`, ready );
	if ( ! ready ) return;
	const png = await page.shot( selector );
	tests.check( `${ name }: recorte disponible`, Boolean( png ) );
	if ( png ) tests.compare( name, png );
}

export async function runPaisana( shots, behavior ) {
	const tests = createBrowserTests();
	const base = tests.baselineFrom ?? tests.site;
	const url = new URL( '/proyectos-destacados/', base ).href;
	try {
		if ( tests.baselineFrom || tests.visual ) {
			for ( const width of [ 360, 850, 1440 ] ) {
				const page = await tests.openPage( url, width );
				try {
					for ( const [ name, selector ] of Object.entries( shots ) )
						await capture(
							page,
							`${ name }-${ width }`,
							selector,
							tests
						);
				} finally {
					page.close();
				}
			}
		}
		// Una página nueva evita que las capturas activen Plyr o cambien el estado de la prueba.
		if ( ! tests.baselineFrom ) {
			for ( const width of [ 360, 1440 ] ) {
				const page = await tests.openPage( url, width );
				try {
					await behavior( page, width, { ...tests, url } );
				} finally {
					page.close();
				}
			}
		}
	} finally {
		await tests.finish();
	}
}
