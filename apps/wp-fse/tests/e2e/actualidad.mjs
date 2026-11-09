// node tests/e2e/actualidad.mjs [--visual | --baseline http://127.0.0.1:4321]
import { execFileSync } from 'node:child_process';
import { createBrowserTests } from './lib.mjs';

const { baselineFrom, visual, site, check, openPage, compare, finish } =
	createBrowserTests();
const base = baselineFrom ?? site;
let wordpress = false;

async function capture( page, width ) {
	const ready = await page.evaluate( `(async () => {
		const section = document.querySelector('.actualidad');
		if (!section) return false;
		section.scrollIntoView({ block: 'start', behavior: 'instant' });
		return Promise.race([
			(async () => {
				await document.fonts.ready;
				const images = [...section.querySelectorAll('img')].filter(img => {
					if (img.offsetParent === null) return false;
					const track = img.closest('.actualidad__track');
					if (!track) return true;
					const a = img.getBoundingClientRect(), b = track.getBoundingClientRect();
					return a.right > b.left && a.left < b.right;
				});
				return (await Promise.all(images.map(async img => {
					img.loading = 'eager';
					try { await img.decode(); } catch { return false; }
					return img.complete && img.naturalWidth > 0;
				}))).every(Boolean);
			})(),
			new Promise(resolve => setTimeout(() => resolve(false), 5000))
		]);
	})()` );
	check(
		`${ width }: miniaturas visibles y fuentes listas antes de 5 s`,
		ready
	);
	if ( ! ready ) return;
	const png = await page.shot( '.actualidad' );
	check( `${ width }: sección disponible para captura`, Boolean( png ) );
	if ( png ) compare( `actualidad-${ width }`, png );
}

async function behavior( page, width ) {
	const initial = await page.evaluate( `(() => {
		const section = document.querySelector('.actualidad');
		return { wp: Boolean(document.querySelector('.wp-site-blocks')), cards: section?.querySelectorAll('.actualidad__card').length ?? 0, iframe: Boolean(section?.querySelector('[data-player] iframe')) };
	})()` );
	wordpress ||= initial.wp;
	check( `${ width }: nueve cards del seed`, initial.cards === 9 );
	check( `${ width }: iframe ausente antes de play`, ! initial.iframe );
	if ( initial.cards < 2 ) return;
	const play = await page.evaluate( `(() => {
		const player = document.querySelector('.actualidad [data-player]');
		const button = player?.querySelector('.actualidad__play');
		if (!player || !button) return null;
		// Ejercita también la URL que ya lleva parámetros, sin cambiar contenido en WordPress.
		if (${ initial.wp }) player.dataset.src += (player.dataset.src.includes('?') ? '&' : '?') + 'rel=0';
		button.click();
		return player.querySelector('iframe')?.src ?? null;
	})()` );
	check( `${ width }: play crea el iframe`, Boolean( play ) );
	if ( play ) {
		const url = new URL( play );
		check(
			`${ width }: autoplay=1 y un solo signo ?`,
			url.searchParams.get( 'autoplay' ) === '1' &&
				( play.match( /\?/g ) ?? [] ).length === 1,
			play
		);
		if ( initial.wp )
			check(
				`${ width }: conserva rel=0 al añadir autoplay`,
				url.searchParams.get( 'rel' ) === '0',
				play
			);
	}
	const selected = await page.evaluate( `(async () => {
		const section = document.querySelector('.actualidad');
		const card = section.querySelectorAll('.actualidad__card')[1];
		const expected = { title: card.dataset.titulo, description: card.dataset.descripcion, tags: JSON.parse(card.dataset.tags ?? '[]'), thumbnail: card.dataset.thumbnail };
		card.click();
		const deadline = performance.now() + 5000;
		while (section.querySelector('[data-campo="titulo"]')?.textContent !== expected.title && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
		const player = section.querySelector('[data-player]');
		return { expected,
			title: section.querySelector('[data-campo="titulo"]')?.textContent,
			description: section.querySelector('[data-campo="descripcion"]')?.textContent,
			tags: [...section.querySelectorAll('[data-campo="tags"] .actualidad__tag')].map(tag => tag.textContent),
			thumbnail: player.querySelector('[data-campo="thumbnail"]')?.src,
			active: section.querySelectorAll('.actualidad__track li[data-activo]').length === 1 && card.closest('li').hasAttribute('data-activo'),
			stopped: !player.querySelector('iframe, video')
		};
	})()` );
	for ( const field of [ 'title', 'description', 'tags', 'thumbnail' ] ) {
		check(
			`${ width }: card cambia ${ field } del destacado`,
			JSON.stringify( selected[ field ] ) ===
				JSON.stringify( selected.expected[ field ] ),
			JSON.stringify( selected )
		);
	}
	check(
		`${ width }: solo la card seleccionada tiene data-activo`,
		selected.active
	);
	check(
		`${ width }: cambiar de card elimina el reproductor anterior`,
		selected.stopped
	);
	for ( const dir of [ 1, -1 ] ) {
		const scroll = await page.evaluate( `(async () => {
			const section = document.querySelector('.actualidad');
			const track = section.querySelector('.actualidad__track');
			if (${ dir } === 1) track.scrollTo({left: 0, behavior: 'instant'});
			const before = track.scrollLeft;
			section.querySelector('.actualidad__nav[data-dir="${ dir }"]').click();
			let last = before, stable = 0;
			const deadline = performance.now() + 5000;
			while (performance.now() < deadline) {
				await new Promise(resolve => setTimeout(resolve, 50));
				stable = Math.abs(track.scrollLeft - last) < 1 ? stable + 1 : 0;
				last = track.scrollLeft;
				if (stable >= 3 && Math.abs(last - before) > 1) break;
			}
			return {before, after: track.scrollLeft};
		})()` );
		check(
			`${ width }: flecha ${ dir } mueve el carrusel`,
			dir * ( scroll.after - scroll.before ) > 0,
			JSON.stringify( scroll )
		);
	}
}

async function singleVideo() {
	// El filtro vive solo en este proceso de wp-cli; no despublica videos ni cambia la base.
	const output = execFileSync(
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
			'add_action("pre_get_posts", static function($query){ if($query->get("post_type")==="video") $query->set("posts_per_page",1); }); echo wp_json_encode(["count"=>count(lapaz_get_videos()),"html"=>do_blocks("<!-- wp:lapaz/actualidad /-->")]);',
		],
		{
			cwd: new URL( '../..', import.meta.url ),
			encoding: 'utf8',
			timeout: 30000,
		}
	);
	const rendered = JSON.parse( output );
	const page = await openPage( 'about:blank', 360 );
	try {
		const result = await page.evaluate( `(() => {
			const doc = new DOMParser().parseFromString(${ JSON.stringify(
				rendered.html
			) }, 'text/html');
			return { player: Boolean(doc.querySelector('.actualidad [data-player]')), carousel: Boolean(doc.querySelector('.actualidad__carrusel, .actualidad__card, .actualidad__nav')) };
		})()` );
		check(
			'Un solo video: player presente y carrusel ausente',
			rendered.count === 1 && result.player && ! result.carousel
		);
	} finally {
		page.close();
	}
}

try {
	for ( const width of baselineFrom || visual
		? [ 360, 850, 1440 ]
		: [ 360, 1440 ] ) {
		const page = await openPage( new URL( '/', base ).href, width );
		try {
			if ( baselineFrom || visual ) await capture( page, width );
			if ( width !== 850 && ! baselineFrom )
				await behavior( page, width );
		} finally {
			page.close();
		}
	}
	if ( wordpress ) await singleVideo();
} finally {
	await finish();
}
