// node tests/e2e/paisana-mapa.mjs [--visual | --baseline http://127.0.0.1:4321]
import { runPaisana, withProjectFields } from './paisana-lib.mjs';

const regions = [ 'caribe', 'pacifica', 'andina', 'orinoquia', 'amazonia' ];
await runPaisana(
	{ 'paisana-mapa-intro': '.mapa-intro', 'paisana-mapa': '.mapa-carrusel' },
	async ( page, width, tests ) => {
		const tabs = await page.evaluate(
			`document.querySelectorAll('.mapa-carrusel .tab-btn').length`
		);
		tests.check( `${ width }: cinco pestañas del mapa`, tabs === 5 );
		for ( const region of regions ) {
			const result = await page.evaluate( `(() => {
			const root=document.querySelector('.mapa-carrusel');
			root.querySelector('.tab-btn[data-target="${ region }"]')?.click();
			const selected=[...root.querySelectorAll('.tab-btn[aria-pressed="true"]')];
			const visible=[...root.querySelectorAll('.tab-content')].filter(el=>el.getClientRects().length>0 && getComputedStyle(el).visibility!=='hidden');
			return selected.length===1 && selected[0].dataset.target==='${ region }' && visible.length===1 && visible[0].dataset.region==='${ region }' && [...root.querySelectorAll('.tab-btn')].every(tab=>tab.getAttribute('aria-pressed')===String(tab===selected[0]));
		})()` );
			tests.check(
				`${ width }: ${ region } seleccionada y único panel visible`,
				result
			);
		}
		const fields = {};
		regions.forEach( ( region, i ) => {
			fields[ `region_${ region }_total` ] = i === 0 ? 0 : 1000 + i;
			fields[
				`region_${ region }_deptos`
			] = `PRUEBA ${ region.toUpperCase() }: 9\nOTRA REGIÓN: 2`;
		} );
		await withProjectFields( fields, tests, async () => {
			const edited = await tests.openPage( tests.url, width );
			try {
				for ( const region of regions ) {
					const text = await edited.evaluate(
						`(() => {const root=document.querySelector('.mapa-carrusel');root.querySelector('.tab-btn[data-target="${ region }"]').click();return root.querySelector('.tab-content[data-region="${ region }"]').textContent.replace(/\\s+/g,' ').trim();})()`
					);
					const total = String(
						fields[ `region_${ region }_total` ]
					).padStart( 2, '0' );
					tests.check(
						`${ width }: total y departamentos editados de ${ region }`,
						text.includes( total ) &&
							text.includes(
								`PRUEBA ${ region.toUpperCase() }`
							) &&
							text.includes( '09' ) &&
							text.includes( 'OTRA REGIÓN' ) &&
							text.includes( '02' ),
						text
					);
				}
			} finally {
				edited.close();
			}
		} );
	}
);
