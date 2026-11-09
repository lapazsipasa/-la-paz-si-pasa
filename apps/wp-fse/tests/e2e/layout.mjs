// node tests/e2e/layout.mjs [--visual | --baseline http://127.0.0.1:4321]
// Variables: SITE_URL (por defecto http://localhost:8090), CHROME_BIN.
import { createBrowserTests } from './lib.mjs';

const { baselineFrom, visual, site, check, openPage, compare, finish } =
	createBrowserTests();
const base = baselineFrom ?? site;

async function layout( page, label ) {
	const result = await page.evaluate( `(() => {
		const wp = Boolean(document.querySelector('.wp-site-blocks'));
		const selectors = ['header.site-header', '.hero', wp ? 'nav.lapaz-nav-desktop' : 'nav.nav:last-of-type', 'main', '.site-footer'];
		const nodes = selectors.map(selector => document.querySelector(selector));
		const image = document.querySelector('.hero__bg');
		const logo = document.querySelector('.hero__logo-link');
		const footer = document.querySelector('.site-footer');
		const links = [...(footer?.querySelectorAll('a[href]') ?? [])].filter(a => /^https?:$/.test(a.protocol) && a.origin !== location.origin);
		const images = [...(footer?.querySelectorAll('img') ?? [])];
		const candidates = value => (value ?? '').split(',').map(part => part.trim().split(/\\s+/)[0]).filter(Boolean).map(url => new URL(url, document.baseURI).href);
		const sources = image ? [image.src, image.currentSrc, ...candidates(image.getAttribute('srcset'))] : [];
		return {
			wp,
			missing: selectors.filter((selector, i) => !nodes[i]),
			order: nodes.every((node, i) => node && (!i || Boolean(nodes[i - 1].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING))),
			hero: Boolean(image && image.getAttribute('loading') !== 'lazy' && image.getAttribute('fetchpriority') === 'high'),
			preload: [...document.head.querySelectorAll('link[rel~="preload"][as="image"]')].some(link =>
				(link.hasAttribute('href') && sources.includes(link.href)) || candidates(link.getAttribute('imagesrcset')).some(url => sources.includes(url))),
			logo: Boolean(logo && logo.href === new URL('/', location.href).href && logo.querySelector('img')?.getAttribute('alt') === 'La Paz Sí Pasa'),
			contact: footer?.id === 'contacto',
			links: links.length > 0 && links.every(a => a.target === '_blank' && a.relList.contains('noopener') && a.relList.contains('noreferrer')),
			dimensions: images.length > 0 && images.every(img => Number(img.getAttribute('width')) > 0 && Number(img.getAttribute('height')) > 0)
		};
	})()` );
	check(
		`${ label }: header → hero → nav de escritorio → main → footer`,
		result.order,
		`faltan: ${ result.missing.join( ', ' ) }`
	);
	check( `${ label }: hero sin lazy y con fetchpriority=high`, result.hero );
	if ( result.wp ) {
		check(
			`${ label }: preload de la imagen del hero en head`,
			result.preload
		);
	}
	check(
		`${ label }: logo enlaza al inicio y tiene el alt correcto`,
		result.logo
	);
	check( `${ label }: footer con id=contacto`, result.contact );
	check(
		`${ label }: enlaces externos con _blank, noopener y noreferrer`,
		result.links
	);
	check(
		`${ label }: imágenes del footer con width y height`,
		result.dimensions
	);
	const photo = await page.evaluate( `(async () => {
		const image = document.querySelector('.site-footer__photo');
		if (!image) return { loaded: false, srcset: false };
		image.scrollIntoView({ block: 'center', behavior: 'instant' });
		const loaded = await Promise.race([
			(async () => {
				if (!image.complete) await new Promise(resolve => {
					image.addEventListener('load', resolve, { once: true });
					image.addEventListener('error', resolve, { once: true });
				});
				return image.complete && image.naturalWidth > 0;
			})(),
			new Promise(resolve => setTimeout(() => resolve(false), 5000))
		]);
		return { loaded, srcset: Boolean(image.getAttribute('srcset')?.trim()) };
	})()` );
	check( `${ label }: foto del footer cargada antes de 5 s`, photo.loaded );
	if ( result.wp ) {
		check( `${ label }: foto del footer con srcset`, photo.srcset );
	}

	const bottom = await page.evaluate( `new Promise(resolve => {
		scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
		requestAnimationFrame(() => resolve(scrollY));
	})` );
	check( `${ label }: scroll al final antes de volver arriba`, bottom > 0 );
	const top = await page.evaluate( `(async () => {
		const button = document.querySelector('.site-footer__totop');
		if (!button) return false;
		button.click();
		const deadline = performance.now() + 5000;
		while (scrollY !== 0 && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
		return scrollY === 0;
	})()` );
	check( `${ label }: volver arriba deja scrollY=0 antes de 5 s`, top );
}

async function capture( page, selector, name ) {
	const ready = await page.evaluate( `(async () => {
		const section = document.querySelector(${ JSON.stringify( selector ) });
		if (!section) return false;
		section.scrollIntoView({ block: 'start', behavior: 'instant' });
		return Promise.race([
			(async () => {
				await document.fonts.ready;
				return (await Promise.all([...section.querySelectorAll('img')].filter(img => img.offsetParent !== null).map(async img => {
					if (!img.complete) await new Promise(resolve => {
						img.addEventListener('load', resolve, { once: true });
						img.addEventListener('error', resolve, { once: true });
					});
					try { await img.decode(); } catch { return false; }
					return img.complete && img.naturalWidth > 0;
				}))).every(Boolean);
			})(),
			new Promise(resolve => setTimeout(() => resolve(false), 5000))
		]);
	})()` );
	check(
		`${ name }: imágenes visibles y fuentes listas antes de 5 s`,
		ready
	);
	if ( ! ready ) {
		return;
	}
	const png = await page.shot( selector );
	check( `${ name }: sección disponible para captura`, Boolean( png ) );
	if ( png ) {
		compare( name, png );
	}
}

try {
	for ( const width of baselineFrom || visual
		? [ 360, 850, 1440 ]
		: [ 360, 1440 ] ) {
		for ( const route of width === 850
			? [ '/' ]
			: [ '/', '/proyectos-destacados/' ] ) {
			const page = await openPage( new URL( route, base ).href, width );
			try {
				if ( width !== 850 ) {
					await layout( page, `${ route } ${ width }` );
				}
				if ( route === '/' && ( baselineFrom || visual ) ) {
					await capture( page, '.hero', `hero-${ width }` );
					await capture(
						page,
						'.site-footer__panel',
						`footer-${ width }`
					);
				}
			} finally {
				page.close();
			}
		}
	}
	const missingUrl = new URL( '/no-existe-xyz', base ).href;
	const response = await fetch( missingUrl );
	check(
		'GET /no-existe-xyz responde HTTP 404',
		response.status === 404,
		`HTTP ${ response.status }`
	);
	await response.body?.cancel();
	for ( const width of [ 360, 1440 ] ) {
		const page = await openPage( missingUrl, width );
		try {
			check(
				`404 ${ width }: Página no encontrada visible`,
				await page.evaluate( `(() => {
				const title = document.querySelector('main h1');
				return Boolean(title?.textContent.includes('Página no encontrada') && title.getClientRects().length && getComputedStyle(title).visibility !== 'hidden');
			})()` )
			);
			check(
				`404 ${ width }: enlace al inicio en el contenido`,
				await page.evaluate(
					`[...(document.querySelector('main')?.querySelectorAll('a[href]') ?? [])].some(a => a.href === new URL('/', location.href).href)`
				)
			);
		} finally {
			page.close();
		}
	}
} finally {
	await finish();
}
