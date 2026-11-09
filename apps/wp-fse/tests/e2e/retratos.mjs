// node tests/e2e/retratos.mjs [--visual | --baseline http://127.0.0.1:4321]
// Variables: SITE_URL (por defecto http://localhost:8090), CHROME_BIN.
import { createBrowserTests } from './lib.mjs';

const { baselineFrom, visual, site, check, openPage, compare, sleep, finish } =
	createBrowserTests();
const base = baselineFrom ?? site;

async function state( page ) {
	return page.evaluate( `(() => {
		const slider = document.querySelector('.retratos-slider');
		return ['foto', 'campos'].map(part => [...(slider?.querySelectorAll('.retratos-slider__' + part) ?? [])].map(el => ({
			slide: el.getAttribute('data-slide'), hidden: el.getAttribute('aria-hidden'),
			visible: el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'
		})));
	})()` );
}

async function expectSlide( page, width, index, label ) {
	const parts = await state( page );
	const ok = parts.every(
		( items ) =>
			items.length > 0 &&
			items.every(
				( item, i ) =>
					item.slide === String( i ) &&
					item.hidden === String( i !== index ) &&
					item.visible === ( i === index )
			)
	);
	check(
		`${ width }: ${ label }; una foto y un texto visibles con data-slide=${ index }`,
		ok,
		JSON.stringify( parts )
	);
}

async function click( page, direction ) {
	await page.evaluate(
		`document.querySelector('.retratos-slider__arrow--${ direction }').click()`
	);
	await sleep( 300 );
}

async function capture( page, name ) {
	if ( ! baselineFrom && ! visual ) {
		return;
	}
	// Las fotos ocultas son lazy y no deben bloquear la captura del paso visible.
	const images = await page.evaluate( `(async () => {
		const section = document.querySelector('.retratos-paz');
		if (!section) return false;
		section.scrollIntoView();
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
	check( `${ name }: imágenes cargadas y decodificadas`, images );
	const png = await page.shot( '.retratos-paz' );
	check( `${ name }: sección disponible para captura`, Boolean( png ) );
	if ( png && images ) {
		compare( name, png );
	}
}

try {
	for ( const width of [ 360, 850, 1440 ] ) {
		const page = await openPage( `${ base }/`, width );
		try {
			const [ photos, texts ] = await state( page );
			const total = photos.length;
			check(
				`${ width }: N fotos y N textos, N > 0`,
				total > 0 && total === texts.length,
				`${ total } fotos, ${ texts.length } textos`
			);
			if ( ! total || total !== texts.length ) {
				continue;
			}
			if ( width !== 850 ) {
				await expectSlide( page, width, 0, 'estado inicial' );
				check(
					`${ width }: la primera foto no es lazy`,
					await page.evaluate(
						`document.querySelector('.retratos-slider__foto').getAttribute('loading') !== 'lazy'`
					)
				);
				check(
					`${ width }: carrusel y botones etiquetados`,
					await page.evaluate( `(() => {
					const section = document.querySelector('section.retratos-slider');
					const buttons = ['prev', 'next'].map(direction => section?.querySelector('button.retratos-slider__arrow--' + direction));
					return section?.getAttribute('aria-roledescription') === 'carrusel' && buttons.every(button => Boolean(button?.getAttribute('aria-label')?.trim()));
				})()` )
				);
				check(
					`${ width }: h1 contiene La Paz Sí Pasa`,
					await page.evaluate(
						`document.querySelector('.retratos-texto h1.retratos-texto__titulo')?.textContent.includes('La Paz Sí Pasa') === true`
					)
				);
			}
			await capture( page, `retratos-${ width }` );
			if ( width === 850 ) {
				continue;
			}
			for ( let step = 1; step <= Math.max( total, 2 ); step++ ) {
				await click( page, 'next' );
				await expectSlide(
					page,
					width,
					step % total,
					`siguiente ${ step }`
				);
				if ( width === 1440 && step === 2 ) {
					await capture( page, 'retratos-1440-paso2' );
				}
			}
			await click( page, 'prev' );
			await expectSlide( page, width, total - 1, 'anterior desde cero' );
		} finally {
			page.close();
		}
	}
} finally {
	await finish();
}
