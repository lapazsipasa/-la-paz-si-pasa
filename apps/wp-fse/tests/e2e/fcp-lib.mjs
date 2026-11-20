// Utilidades compartidas por boletin.mjs, catalogo.mjs e historia.mjs.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { wp } from './paisana-lib.mjs';

export { wp };

const local = [ 'http://localhost:8090', 'http://127.0.0.1:8090' ];

// Estas suites crean y borran contenido con wp-cli: solo valen contra el stack local.
export function exigirLocal( tests ) {
	if ( ! local.includes( new URL( tests.site ).origin ) )
		throw new Error( 'Estas pruebas requieren el stack local en :8090.' );
}

export function wpJson( code ) {
	return JSON.parse( wp( code ) );
}

// Carga el seed de una sección (productores, boletines, historias), como CI.
export function sembrar( seccion ) {
	execFileSync(
		'docker',
		[
			'compose',
			'exec',
			'-T',
			'-u',
			'www-data',
			'-e',
			`SEED_SOLO=${ seccion }`,
			'cms',
			'wp',
			'eval-file',
			'/opt/seed/seed.php',
		],
		{
			cwd: new URL( '../..', import.meta.url ),
			encoding: 'utf8',
			timeout: 300000,
			maxBuffer: 20 * 1024 * 1024,
		}
	);
}

export const contar = ( tipo ) =>
	Number( wp( `echo wp_count_posts("${ tipo }")->publish;` ) );

const PRUEBA = '__prueba';
const tipos = "'boletin','productor','historia'";

// Borra todo contenido de prueba (título con prefijo __prueba), sin importar su estado.
export function limpiarPrueba() {
	return Number(
		wp(
			`global $wpdb; $ids=$wpdb->get_col($wpdb->prepare("SELECT ID FROM $wpdb->posts WHERE post_title LIKE %s AND post_type IN (${ tipos })",$wpdb->esc_like("${ PRUEBA }")."%")); foreach($ids as $i) wp_delete_post($i,true); echo count($ids);`
		)
	);
}

export function restosPrueba() {
	return Number(
		wp(
			`global $wpdb; echo (int)$wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $wpdb->posts WHERE post_title LIKE %s AND post_type IN (${ tipos })",$wpdb->esc_like("${ PRUEBA }")."%"));`
		)
	);
}

// Ejecuta la suite y limpia siempre al final, incluso si falla.
export async function conLimpieza( tests, suite ) {
	try {
		exigirLocal( tests );
		limpiarPrueba();
		await suite();
	} catch ( error ) {
		tests.check( 'La suite terminó sin excepciones', false, error.stack );
	} finally {
		try {
			limpiarPrueba();
			tests.check( 'Limpieza: sin contenido __prueba', restosPrueba() === 0 );
		} catch ( error ) {
			tests.check( 'Limpieza: sin contenido __prueba', false, error.message );
		}
		await tests.finish();
	}
}

export async function esperar( tests, condicion, ms = 5000 ) {
	for ( let i = 0; i < ms / 100; i++ ) {
		if ( await condicion() ) return true;
		await tests.sleep( 100 );
	}
	return false;
}

// Sin desbordes horizontales a 360, 850 y 1440 px.
export async function sinDesborde( tests, url, etiqueta ) {
	for ( const width of [ 360, 850, 1440 ] ) {
		const page = await tests.openPage( url, width );
		try {
			const r = await page.evaluate(
				'({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth})'
			);
			tests.check(
				`${ etiqueta }: sin desborde horizontal a ${ width } px`,
				r.sw <= r.cw,
				JSON.stringify( r )
			);
		} finally {
			page.close();
		}
	}
}

export const norm = ( s ) =>
	String( s )
		.normalize( 'NFD' )
		.replace( /\p{Diacritic}/gu, '' )
		.toLowerCase();

export const productoresSeed = () =>
	JSON.parse(
		fs.readFileSync(
			new URL(
				'../../../wordpress/seed/productores.json',
				import.meta.url
			),
			'utf8'
		)
	);

// Texto del conteo de resultados y número de tarjetas de un HTML servido.
export const conteoDe = ( html ) => {
	const m = /class="[^"]*\bconteo\b[^"]*"[^>]*>([\s\S]*?)<\/p>/.exec( html );
	return m ? m[ 1 ].replace( /<[^>]+>/g, ' ' ).replace( /\s+/g, ' ' ).trim() : null;
};
// Entiende separadores de miles (1.234, 1,234, 1 234): «1.234» es 1234, no 1 y 234.
export const enteros = ( texto ) =>
	[ ...String( texto ?? '' ).matchAll( /\d{1,3}(?:[.,\s\u00a0]\d{3})+(?!\d)|\d+/g ) ].map( ( m ) =>
		Number( m[ 0 ].replace( /[.,\s\u00a0]/g, '' ) )
	);
export const tarjetasDe = ( html ) =>
	( html.match( /<article[^>]*class="[^"]*\bcard\b/g ) ?? [] ).length;

// Criterio tipográfico: Monique Round solo con peso 400 (nunca negrita simulada) y los bloques nuevos con
// font-synthesis sin «weight». Chrome devuelve "none" para `font-synthesis: none`.
export async function tipografiaGeneral( tests, page, etiqueta ) {
	const r = await page.evaluate( `(() => {
		const primera = ( f ) => f.split( ',' )[ 0 ].replace( /["']/g, '' ).trim();
		const negritas = [];
		for ( const el of document.querySelectorAll( 'body *' ) ) {
			if ( ! [ ...el.childNodes ].some( ( n ) => n.nodeType === 3 && n.textContent.trim() ) ) continue;
			const cs = getComputedStyle( el );
			if ( primera( cs.fontFamily ) === 'Monique Round' && Number( cs.fontWeight ) > 400 )
				negritas.push( el.tagName.toLowerCase() + '.' + el.className + ' ' + cs.fontWeight );
		}
		const raices = [ ...document.querySelectorAll( '[class*="wp-block-lapaz-"]' ) ].filter( ( e ) => /wp-block-lapaz-(boletin|catalogo|catalogo-portada|historia|historia-destacada)(\\s|$)/.test( e.className ) );
		return { negritas: negritas.slice( 0, 5 ), total: negritas.length, raices: raices.map( ( e ) => e.className.split( ' ' )[ 0 ] + ': ' + getComputedStyle( e ).fontSynthesis ) };
	})()` );
	tests.check( `${ etiqueta }: ningún texto en Monique Round con peso > 400`, r.total === 0, `${ r.total }: ${ r.negritas.join( '; ' ) }` );
	tests.check( `${ etiqueta }: la raíz del bloque desactiva font-synthesis de peso`, r.raices.length > 0 && r.raices.every( ( x ) => ! /weight/.test( x.split( ': ' )[ 1 ] ) ), r.raices.join( '; ' ) );
}
