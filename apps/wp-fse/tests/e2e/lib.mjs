import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

// Fuerza el pintado de las secciones con content-visibility:auto (fuera de pantalla no se pintan y su alto
// se colapsa a contain-intrinsic-size) y espera imágenes y fuentes. Úsalo antes de medir o capturar.
export async function prepararPintado( page ) {
	await page.evaluate( `(async () => {
		if ( ! document.getElementById( '__e2e-pintado' ) ) {
			const st = document.createElement( 'style' );
			st.id = '__e2e-pintado';
			st.textContent = '*,*::before,*::after{content-visibility:visible !important}';
			document.head.append( st );
		}
		const imgs = [ ...document.images ];
		imgs.forEach( ( i ) => { i.loading = 'eager'; i.decoding = 'sync'; } );
		await Promise.all( imgs.map( ( i ) => i.decode().catch( () => {} ) ) );
		await document.fonts.ready;
		await new Promise( ( r ) => requestAnimationFrame( () => requestAnimationFrame( r ) ) );
		return 1;
	})()` );
	await new Promise( ( r ) => setTimeout( r, 500 ) );
}

// Limpieza de Chrome: un solo registro para todos los navegadores del proceso.
// Se ejecuta en exit, señales y errores no capturados; mata el grupo de procesos y borra el perfil temporal.
const abiertos = new Set();
let limpiezaRegistrada = false;
function limpiar( { browser, profile } ) {
	try {
		process.kill( -browser.pid, 'SIGKILL' );
	} catch {}
	fs.rmSync( profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 } );
}
function registrarLimpieza() {
	if ( limpiezaRegistrada ) return;
	limpiezaRegistrada = true;
	process.on( 'exit', () => abiertos.forEach( limpiar ) );
	for ( const sig of [ 'SIGINT', 'SIGTERM' ] )
		process.on( sig, () => process.exit( sig === 'SIGINT' ? 130 : 143 ) );
	process.on( 'uncaughtException', ( e ) => {
		console.error( e );
		process.exit( 1 );
	} );
	process.on( 'unhandledRejection', ( e ) => {
		console.error( e );
		process.exit( 1 );
	} );
}

export function createBrowserTests() {
	const args = process.argv.slice( 2 );
	const baselineFrom = args.includes( '--baseline' )
		? args[ args.indexOf( '--baseline' ) + 1 ]
		: null;
	const visual = args.includes( '--visual' );
	const site = process.env.SITE_URL ?? 'http://localhost:8090';
	const baseDir = path.join( import.meta.dirname, 'baseline' );
	const chrome =
		process.env.CHROME_BIN ??
		( process.platform === 'darwin'
			? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
			: 'google-chrome' );

	const sleep = ( ms ) => new Promise( ( r ) => setTimeout( r, ms ) );
	const profile = fs.mkdtempSync(
		path.join( process.env.TMPDIR ?? '/tmp', 'lapaz-e2e-' )
	);
	const browser = spawn(
		chrome,
		[
			'--headless=new',
			'--remote-debugging-port=0', // puerto libre; Chrome lo escribe en DevToolsActivePort
			`--user-data-dir=${ profile }`,
			'--hide-scrollbars',
			'--no-sandbox',
			'about:blank',
		],
		{ stdio: 'ignore', detached: true } // detached: grupo propio para matar también los procesos auxiliares
	);
	registrarLimpieza();
	const entrada = { browser, profile };
	abiertos.add( entrada );
	// Puerto real: la primera línea de DevToolsActivePort.
	const leerPuerto = async () => {
		for ( let i = 0; i < 100; i++ ) {
			try {
				return Number(
					fs.readFileSync( path.join( profile, 'DevToolsActivePort' ), 'utf8' ).split( '\n' )[ 0 ]
				);
			} catch {
				await sleep( 100 );
			}
		}
		throw new Error( 'Chrome no abrió el puerto de depuración' );
	};

	let failures = 0;
	function check( name, ok, detail = '' ) {
		console.log(
			`${ ok ? '✓' : '✗' } ${ name }${ ok ? '' : ` ${ detail }` }`
		);
		if ( ! ok ) {
			failures++;
		}
	}

	async function openPage( url, width ) {
		const port = await leerPuerto();
		const tab = await (
			await fetch( `http://127.0.0.1:${ port }/json/new?about:blank`, {
				method: 'PUT',
			} )
		).json();
		const ws = new WebSocket( tab.webSocketDebuggerUrl );
		const pending = new Map();
		const requests = [];
		let loaded;
		const loadEvent = new Promise( ( r ) => ( loaded = r ) );
		let id = 0;
		ws.onmessage = ( e ) => {
			const m = JSON.parse( e.data );
			if ( m.method === 'Page.loadEventFired' ) loaded();
			if ( m.method === 'Network.requestWillBeSent' )
				requests.push( m.params.request.url );
			pending.get( m.id )?.( m.result );
			pending.delete( m.id );
		};
		await new Promise( ( r ) => ( ws.onopen = r ) );
		const send = ( method, params = {} ) =>
			new Promise( ( r ) => {
				pending.set( ++id, r );
				ws.send( JSON.stringify( { id, method, params } ) );
			} );
		await send( 'Emulation.setDeviceMetricsOverride', {
			width,
			height: 700,
			deviceScaleFactor: 1,
			mobile: width < 850,
		} );
		await send( 'Page.enable' );
		await send( 'Network.enable' );
		await send( 'Page.navigate', { url } );
		// Carga real con tope de 8 s, fuentes listas y un respiro corto para los scripts de arranque.
		await Promise.race( [ loadEvent, sleep( 8000 ) ] );
		const evaluate = async ( expression ) =>
			(
				await send( 'Runtime.evaluate', {
					expression,
					awaitPromise: true,
					returnByValue: true,
				} )
			).result.value;
		await Promise.race( [
			evaluate( 'document.fonts.ready.then( () => 1 )' ),
			sleep( 3000 ),
		] );
		await sleep( 500 );
		const key = async ( k ) => {
			await send( 'Input.dispatchKeyEvent', {
				type: 'keyDown',
				key: k,
				code: k,
				windowsVirtualKeyCode: k === 'Escape' ? 27 : undefined,
			} );
			await send( 'Input.dispatchKeyEvent', {
				type: 'keyUp',
				key: k,
				code: k,
				windowsVirtualKeyCode: k === 'Escape' ? 27 : undefined,
			} );
			await sleep( 300 );
		};
		// Captura recortada al rectángulo de un elemento.
		const shot = async ( selector ) => {
			if ( ! baselineFrom ) await prepararPintado( { evaluate } );
			const r = await evaluate(
				// Alinea el elemento a píxel entero antes de capturarlo: la misma sección cae en
				// fracciones de píxel distintas según lo que haya arriba (Astro tiene más secciones
				// en la portada) y el texto se suaviza distinto, aunque el diseño sea idéntico.
				`(() => { const e = document.querySelector(${ JSON.stringify(
					selector
				) }); if (!e) return null; let b = e.getBoundingClientRect(); const fx = (b.x + scrollX) % 1, fy = (b.y + scrollY) % 1; if (fx || fy) { e.style.translate = (-fx) + 'px ' + (-fy) + 'px'; b = e.getBoundingClientRect(); } return { x: Math.round(b.x + scrollX), y: Math.round(b.y + scrollY), width: Math.round(b.width), height: Math.round(b.height) }; })()`
			);
			if ( ! r ) {
				return null;
			}
			const res = await send( 'Page.captureScreenshot', {
				format: 'png',
				captureBeyondViewport: true,
				clip: { ...r, scale: 1 },
			} );
			return Buffer.from( res.data, 'base64' );
		};
		if ( baselineFrom ) {
			// En Astro dev se quitan la barra de desarrollo y el panel de fuentes de contenido.
			await evaluate(
				`document.querySelector('astro-dev-toolbar')?.remove(); [...document.querySelectorAll('body > *')].filter(e => e.textContent.trim().startsWith('Fuentes de contenido')).forEach(e => e.remove()); 1`
			);
		}
		return { evaluate, key, shot, send, requests, close: () => ws.close() };
	}

	function compare( name, png ) {
		const file = path.join( baseDir, `${ name }.png` );
		if ( baselineFrom ) {
			fs.mkdirSync( baseDir, { recursive: true } );
			fs.writeFileSync( file, png );
			console.log( `• base guardada: ${ name }` );
			return;
		}
		if ( ! visual ) {
			return;
		}
		if ( ! fs.existsSync( file ) ) {
			check(
				`visual ${ name }`,
				false,
				'(no hay base: correr --baseline)'
			);
			return;
		}
		const a = PNG.sync.read( fs.readFileSync( file ) );
		const b = PNG.sync.read( png );
		if ( a.width !== b.width || a.height !== b.height ) {
			check(
				`visual ${ name }`,
				false,
				`tamaño ${ b.width }×${ b.height }, base ${ a.width }×${ a.height }`
			);
			return;
		}
		const diff = pixelmatch( a.data, b.data, null, a.width, a.height, {
			threshold: 0.1,
		} );
		const ratio = diff / ( a.width * a.height );
		const ok = ratio < 0.01;
		check(
			`visual ${ name }`,
			ok,
			`(${ ( ratio * 100 ).toFixed(
				2
			) }% de píxeles distintos; ver baseline/${ name }.actual.png)`
		);
		if ( ! ok ) {
			fs.writeFileSync(
				path.join( baseDir, `${ name }.actual.png` ),
				png
			);
		}
	}

	async function finish() {
		// Se espera a que Chrome salga antes de borrar su perfil; la limpieza nunca falla la prueba.
		const exited = once( browser, 'exit' );
		browser.kill();
		await Promise.race( [ exited, sleep( 3000 ) ] );
		limpiar( entrada ); // SIGKILL al grupo si no cerró, y borra el perfil
		abiertos.delete( entrada );
		process.exitCode = failures ? 1 : 0;
	}

	return {
		baselineFrom,
		visual,
		site,
		check,
		openPage,
		compare,
		sleep,
		finish,
	};
}
