// node tests/e2e/paisana-hero.mjs [--visual | --baseline http://127.0.0.1:4321]
import { runPaisana, withProjectFields } from './paisana-lib.mjs';

await runPaisana(
	{ 'paisana-hero': '.paisana-header' },
	async ( page, width, tests ) => {
		const original = await page.evaluate(
			`[...document.querySelectorAll('.paisana-header .stat-number')].map(el=>el.textContent.trim())`
		);
		tests.check(
			`${ width }: cifras iniciales 450 / 3.402 / 168`,
			JSON.stringify( original ) === '["450","3.402","168"]',
			JSON.stringify( original )
		);
		const fields = {};
		for ( let i = 1; i <= 3; i++ ) {
			fields[ `cifra_${ i }_valor` ] = String( 900 + i );
			fields[ `cifra_${ i }_texto` ] = `Cifra de prueba ${ i }`;
		}
		await withProjectFields( fields, tests, async () => {
			const edited = await tests.openPage( tests.url, width );
			try {
				const actual = await edited.evaluate(
					`({numbers:[...document.querySelectorAll('.paisana-header .stat-number')].map(el=>el.textContent.trim()),texts:[...document.querySelectorAll('.paisana-header .stat-text')].map(el=>el.textContent.trim())})`
				);
				tests.check(
					`${ width }: las tres cifras editadas se reflejan`,
					JSON.stringify( actual.numbers ) === '["901","902","903"]',
					JSON.stringify( actual )
				);
				tests.check(
					`${ width }: los textos editados se reflejan`,
					JSON.stringify( actual.texts ) ===
						'["Cifra de prueba 1","Cifra de prueba 2","Cifra de prueba 3"]',
					JSON.stringify( actual )
				);
			} finally {
				edited.close();
			}
		} );
	}
);
