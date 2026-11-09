// Pasa los <style> de componentes Astro al style.css de un bloque del tema.
//
//   node bin/astro-css-to-block.mjs <bloque> <clase-raíz> <Componente.astro>...
//
// - Quita :global(x) → x (en el tema no hay aislamiento de estilos).
// - La clase raíz del componente (p. ej. .hero) pasa a ser el wrapper del bloque
//   (.wp-block-lapaz-<bloque>); cualquier otro selector queda dentro del wrapper.
// - Las reglas dentro de @media se prefijan igual; @keyframes no se toca.
// Escribe en stdout: se revisa y se guarda en blocks/<bloque>/style.css.
import fs from 'node:fs';
import postcss from 'postcss';

const [ block, rootClass, ...files ] = process.argv.slice( 2 );
if ( ! block || ! rootClass || files.length === 0 ) {
	console.error( 'Uso: astro-css-to-block.mjs <bloque> <clase-raíz> <archivos.astro>...' );
	process.exit( 1 );
}
const wrapper = `.wp-block-lapaz-${ block }`;

const prefijar = ( selector ) => {
	const s = selector.trim().replace( /:global\(([^)]+)\)/g, '$1' );
	// Los pseudo-elementos de View Transitions cuelgan de la raíz del documento: no se prefijan.
	if ( s.startsWith( '::view-transition' ) ) {
		return s;
	}
	if ( s === rootClass || s.startsWith( rootClass + ' ' ) || /^[.:[]/.test( s.slice( rootClass.length ) ) && s.startsWith( rootClass ) ) {
		return wrapper + s.slice( rootClass.length );
	}
	return `${ wrapper } ${ s }`;
};

const salida = [];
for ( const file of files ) {
	const fuente = fs.readFileSync( file, 'utf8' );
	const estilos = [ ...fuente.matchAll( /<style(?:\s+is:global)?>([\s\S]*?)<\/style>/g ) ].map( ( m ) => m[ 1 ] ).join( '\n' );
	const root = postcss.parse( estilos );
	root.walkComments( ( c ) => {
		if ( /^=+\s*(CSS GENERAL|BREAKPOINT)/s.test( c.text ) || /^=+$/.test( c.text.trim() ) ) {
			c.remove();
		}
	} );
	root.walkRules( ( rule ) => {
		if ( rule.parent?.type === 'atrule' && /keyframes$/.test( rule.parent.name ) ) {
			return;
		}
		rule.selectors = rule.selectors.map( prefijar );
	} );
	// Astro indenta con 2 espacios dentro de <style>: se pasa a tabs, como el resto del tema.
	const css = root
		.toString()
		.split( '\n' )
		.map( ( l ) => l.replace( /^ {2}/, '' ).replace( /^( {2})+/, ( m ) => '\t'.repeat( m.length / 2 ) ) )
		.join( '\n' )
		.replace( /\n{3,}/g, '\n\n' )
		.trim();
	salida.push( `/* ${ file.split( '/' ).pop() } */\n${ css }` );
}

process.stdout.write(
	`/*\n * Bloque lapaz/${ block }. CSS copiado de ${ files.map( ( f ) => f.split( '/' ).pop() ).join( ', ' ) }\n * con bin/astro-css-to-block.mjs: sin :global() y con cada selector bajo el bloque.\n */\n\n${ salida.join( '\n\n' ) }\n`
);
