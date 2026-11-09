// node tests/e2e/paisana-productores.mjs [--visual | --baseline http://127.0.0.1:4321]
import { runPaisana } from './paisana-lib.mjs';

await runPaisana(
	{ 'paisana-productores': '.productores-videos' },
	async ( page, width, tests ) => {
		const before = await page.evaluate(
			`({cards:document.querySelectorAll('.productores-videos .video-row-card').length, players:document.querySelectorAll('.productores-videos .plyr').length})`
		);
		tests.check(
			`${ width }: seis productores con PaisSana`,
			before.cards === 6
		);
		tests.check(
			`${ width }: Plyr no se monta lejos del viewport`,
			before.players === 0
		);
		const mounted = await page.evaluate( `(async () => {
		const root=document.querySelector('.productores-videos');
		root.querySelector('.video-row-card').scrollIntoView({block:'center',behavior:'instant'});
		const deadline=performance.now()+10000;
		while(!root.querySelector('.plyr') && performance.now()<deadline) await new Promise(resolve=>setTimeout(resolve,50));
		return Boolean(root.querySelector('.plyr') && typeof window.Plyr==='function');
	})()` );
		tests.check(
			`${ width }: Plyr se monta al acercarse a la pantalla`,
			mounted
		);
		await tests.sleep( 500 );
		const forbidden = page.requests.filter(
			( url ) => new URL( url ).hostname === 'cdn.plyr.io'
		);
		tests.check(
			`${ width }: ninguna petición a cdn.plyr.io`,
			forbidden.length === 0,
			forbidden.join( ', ' )
		);
		tests.check(
			`${ width }: JS de Plyr servido desde el tema`,
			page.requests.some( ( url ) =>
				new URL( url ).pathname.includes(
					'/themes/lapaz/assets/vendor/plyr/plyr.min.js'
				)
			)
		);
	}
);
