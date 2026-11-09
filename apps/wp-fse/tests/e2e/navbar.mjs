// Pruebas de comportamiento y visuales del navbar (core/navigation) con Chrome headless (CDP).
//
//   node tests/e2e/navbar.mjs                       comportamiento contra http://localhost:8090
//   node tests/e2e/navbar.mjs --visual              además compara píxeles contra tests/e2e/baseline/
//   node tests/e2e/navbar.mjs --baseline <astro>    captura las bases desde Astro (antes de retirarlo)
//
// Variables: SITE_URL (por defecto http://localhost:8090), CHROME_BIN.
// Lo visual es solo local: las fuentes se rasterizan distinto en Linux (CI) y macOS.
import { createBrowserTests } from './lib.mjs';

const { baselineFrom, site, check, openPage, compare, sleep, finish } = createBrowserTests();

// Selectores de cada implementación para las mismas piezas del navbar.
const targets = {
	wp: {
		header: 'header.site-header',
		toggle: '.lapaz-nav-mobile .wp-block-navigation__responsive-container-open',
		overlay: '.lapaz-nav-mobile .wp-block-navigation__responsive-container',
		openClass: 'is-menu-open',
		desktop: 'nav.lapaz-nav-desktop',
	},
	astro: {
		header: 'header.site-header',
		toggle: '.nav__toggle',
		overlay: '.nav__list',
		openClass: 'is-open',
		desktop: 'nav.nav:last-of-type',
	},
};

const t = baselineFrom ? targets.astro : targets.wp;
const base = baselineFrom ?? site;

try {
	// Móvil: header visible, overlay, Esc, foco y cierre al tocar un ancla.
	const m = await openPage( `${ base }/`, 360 );
	compare( 'movil-header', await m.shot( t.header ) );
	if ( ! baselineFrom ) {
		check( 'móvil: el menú de escritorio está oculto', await m.evaluate( `getComputedStyle(document.querySelector('${ t.desktop }')).display === 'none'` ) );
	}
	await m.evaluate( `document.querySelector('${ t.toggle }').click()` );
	await sleep( 400 );
	compare( 'movil-overlay', await m.shot( t.overlay ) );
	if ( ! baselineFrom ) {
		check( 'móvil: la hamburguesa abre el overlay', await m.evaluate( `document.querySelector('${ t.overlay }').classList.contains('${ t.openClass }')` ) );
		check( 'móvil: el foco entra al overlay', await m.evaluate( `document.querySelector('${ t.overlay }').contains(document.activeElement)` ) );
		check( 'móvil: el scroll del body queda bloqueado', await m.evaluate( `getComputedStyle(document.documentElement).overflowY === 'hidden'` ) );
		await m.key( 'Escape' );
		check( 'móvil: Esc cierra el overlay', ! ( await m.evaluate( `document.querySelector('${ t.overlay }').classList.contains('${ t.openClass }')` ) ) );
		check( 'móvil: el foco vuelve a la hamburguesa', await m.evaluate( `document.activeElement === document.querySelector('${ t.toggle }')` ) );
		await m.evaluate( `document.querySelector('${ t.toggle }').click()` );
		await sleep( 300 );
		await m.evaluate( `document.querySelector('${ t.overlay } a[href*="#"]').click()` );
		await sleep( 400 );
		check( 'móvil: tocar un ancla cierra el overlay', ! ( await m.evaluate( `document.querySelector('${ t.overlay }').classList.contains('${ t.openClass }')` ) ) );
	}
	m.close();

	// Escritorio: header oculto, mismo menú que en móvil.
	const d = await openPage( `${ base }/`, 1440 );
	compare( 'escritorio-nav', await d.shot( t.desktop ) );
	if ( ! baselineFrom ) {
		check( 'escritorio: el header móvil está oculto', await d.evaluate( `getComputedStyle(document.querySelector('${ t.header }')).display === 'none'` ) );
		const labels = await d.evaluate( `JSON.stringify([...document.querySelectorAll('${ t.desktop } a')].map(a => a.textContent.trim()))` );
		const mobileLabels = await d.evaluate( `JSON.stringify([...document.querySelectorAll('${ t.overlay } a')].map(a => a.textContent.trim()))` );
		check( 'escritorio: mismos ítems que el menú móvil', labels === mobileLabels && labels !== '[]', `${ labels } ≠ ${ mobileLabels }` );
	}
	d.close();
} finally {
	await finish();
}
