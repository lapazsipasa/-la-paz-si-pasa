// node tests/e2e/lo-que-hacemos.mjs [--visual | --baseline http://127.0.0.1:4321]
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createBrowserTests } from './lib.mjs';

const expectedLogos = JSON.parse(
	fs.readFileSync(
		new URL( '../../../wordpress/seed/contenido.json', import.meta.url ),
		'utf8'
	)
)
	.subcuentas.sort( ( a, b ) => a.orden - b.orden )
	.map( ( item ) => item.nombre );
const { baselineFrom, visual, site, check, openPage, compare, finish } =
	createBrowserTests();
const base = baselineFrom ?? site;
let wordpress = false;

function wp( code ) {
	return execFileSync(
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
			code,
		],
		{
			cwd: new URL( '../..', import.meta.url ),
			encoding: 'utf8',
			timeout: 30000,
		}
	).trim();
}

async function scrollLogos( page, dir ) {
	return page.evaluate( `(async () => {
		const root = document.querySelector('.lo-que-hacemos .subcuentas');
		const track = root?.querySelector('.subcuentas__track');
		const button = root?.querySelector('.subcuentas__nav[data-dir="${ dir }"]');
		if (!track || !button) return { before: 0, after: 0 };
		const before = track.scrollLeft;
		button.click();
		let previous = before, stable = 0;
		const deadline = performance.now() + 5000;
		while (performance.now() < deadline) {
			await new Promise(resolve => setTimeout(resolve, 50));
			stable = Math.abs(track.scrollLeft - previous) < 1 ? stable + 1 : 0;
			previous = track.scrollLeft;
			if (stable >= 3 && Math.abs(previous - before) > 1) break;
		}
		return { before, after: track.scrollLeft };
	})()` );
}

async function behavior( page, width ) {
	const data = await page.evaluate( `(() => {
		const section = document.querySelector('.lo-que-hacemos');
		return {
			wp: Boolean(document.querySelector('.wp-site-blocks')),
			logos: [...(section?.querySelectorAll('.subcuentas__track img') ?? [])].map(img => img.getAttribute('alt') ?? ''),
			rows: [...(section?.querySelectorAll('.timeline__row') ?? [])].map(row => ({
				year: row.querySelector('.timeline__year')?.textContent.trim(),
				links: [...row.querySelectorAll('.timeline__news a')].map(a => ({ target: a.target, rel: a.rel, url: a.href }))
			}))
		};
	})()` );
	wordpress ||= data.wp;
	check(
		`${ width }: 23 logos con alt`,
		data.logos.length === 23 && data.logos.every( ( alt ) => alt.trim() )
	);
	check(
		`${ width }: logos en menu_order del seed`,
		// wptexturize devuelve la raya del título como carácter o entidad, según el origen.
		JSON.stringify(
			data.logos.map( ( title ) => title.replace( /–|&#8211;/g, '-' ) )
		) === JSON.stringify( expectedLogos ),
		JSON.stringify( data.logos )
	);
	check(
		`${ width }: primero Atención Integral de las Víctimas`,
		data.logos[ 0 ] === 'Atención Integral de las Víctimas'
	);
	check(
		`${ width }: años descendentes 2026 y 2025`,
		JSON.stringify( data.rows.map( ( row ) => row.year ) ) ===
			'["2026","2025"]'
	);
	check(
		`${ width }: máximo tres noticias por año (3 + 2 de las seis de ejemplo)`,
		JSON.stringify( data.rows.map( ( row ) => row.links.length ) ) ===
			'[3,2]'
	);
	check(
		`${ width }: noticias con _blank, noopener y noreferrer`,
		data.rows.length > 0 &&
			data.rows.every( ( row ) =>
				row.links.every(
					( link ) =>
						link.target === '_blank' &&
						[ 'noopener', 'noreferrer' ].every( ( token ) =>
							link.rel.split( /\s+/ ).includes( token )
						)
				)
			)
	);
	await page.evaluate(
		`document.querySelector('.lo-que-hacemos .subcuentas__track')?.scrollTo({ left: 0, behavior: 'instant' })`
	);
	const next = await scrollLogos( page, 1 );
	check(
		`${ width }: siguiente aumenta scrollLeft`,
		next.after > next.before,
		JSON.stringify( next )
	);
	const prev = await scrollLogos( page, -1 );
	check(
		`${ width }: anterior reduce scrollLeft`,
		prev.after < prev.before,
		JSON.stringify( prev )
	);
	const timeline = await page.evaluate( `(async () => {
		const root = document.querySelector('.lo-que-hacemos .timeline');
		const list = root?.querySelector('.timeline__list');
		const rows = root?.querySelectorAll('.timeline__row');
		const button = root?.querySelector('.timeline__scroll[data-dir="1"]');
		if (!list || !rows?.[1] || !button) return { ok: false };
		const original = list.style.maxHeight;
		try {
			// Con seis noticias no siempre hay desborde: se reduce solo el viewport de la prueba.
			list.style.maxHeight = '80px';
			list.scrollTo({ top: 0, behavior: 'instant' });
			const target = Math.min(rows[1].getBoundingClientRect().top - list.getBoundingClientRect().top - list.clientTop, list.scrollHeight - list.clientHeight);
			button.click();
			const deadline = performance.now() + 5000;
			while (Math.abs(list.scrollTop - target) > 1 && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 50));
			return { ok: target > 0 && Math.abs(list.scrollTop - target) <= 1, target, actual: list.scrollTop, offsets: [...rows].map(row => row.offsetTop) };
		} finally {
			list.style.maxHeight = original;
			list.scrollTo({ top: 0, behavior: 'instant' });
		}
	})()` );
	check(
		`${ width }: flecha del timeline llega a la siguiente fila`,
		timeline.ok,
		JSON.stringify( timeline )
	);
}

async function capture( page, width ) {
	const ready = await page.evaluate( `(async () => {
		const section = document.querySelector('.lo-que-hacemos');
		if (!section) return false;
		section.scrollIntoView({ block: 'start', behavior: 'instant' });
		return Promise.race([
			(async () => {
				await document.fonts.ready;
				const images = [...section.querySelectorAll('img')].filter(img => {
					if (img.offsetParent === null) return false;
					const track = img.closest('.subcuentas__track');
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
		`${ width }: imágenes visibles y fuentes listas antes de 5 s`,
		ready
	);
	if ( ready ) {
		const png = await page.shot( '.lo-que-hacemos' );
		check( `${ width }: sección disponible para captura`, Boolean( png ) );
		if ( png ) compare( `lo-que-hacemos-${ width }`, png );
	}
}

async function cta() {
	if (
		! [ 'http://localhost:8090', 'http://127.0.0.1:8090' ].includes(
			new URL( base ).origin
		)
	) {
		throw new Error(
			'La prueba editable del CTA requiere el stack local en :8090.'
		);
	}
	const snapshot =
		'$id=(int)get_option("page_on_front"); if(!$id) WP_CLI::error("No hay portada"); echo wp_json_encode(["id"=>$id,"meta"=>["noticias_cta_url"=>get_post_meta($id,"noticias_cta_url",false),"_noticias_cta_url"=>get_post_meta($id,"_noticias_cta_url",false)]]);';
	const saved = JSON.parse( wp( snapshot ) );
	try {
		for ( const value of [ '', 'https://example.com/prensa-e2e/' ] ) {
			wp(
				`update_field("field_home_noticias_cta_url", ${ JSON.stringify(
					value
				) }, ${ saved.id });`
			);
			for ( const width of [ 360, 1440 ] ) {
				const page = await openPage( new URL( '/', base ).href, width );
				try {
					const href = await page.evaluate(
						`document.querySelector('.lo-que-hacemos .banner-cta')?.href`
					);
					check(
						`${ width }: CTA ${
							value ? 'personalizado' : 'por defecto'
						}`,
						href ===
							( value || 'https://fcp.gov.co/sala-de-prensa/' ),
						href
					);
				} finally {
					page.close();
				}
			}
		}
	} finally {
		const encoded = Buffer.from( JSON.stringify( saved ) ).toString(
			'base64'
		);
		wp(
			`$saved=json_decode(base64_decode("${ encoded }"),true); foreach($saved["meta"] as $key=>$values){delete_post_meta($saved["id"],$key); foreach($values as $value) add_post_meta($saved["id"],$key,$value);}`
		);
		check(
			'CTA: metadatos originales restaurados',
			JSON.stringify( JSON.parse( wp( snapshot ) ) ) ===
				JSON.stringify( saved )
		);
	}
}

async function emptyContent() {
	const rendered = JSON.parse(
		wp(
			'add_action("pre_get_posts",static function($query){if(in_array($query->get("post_type"),["subcuenta","noticia"],true))$query->set("post__in",[0]);}); echo wp_json_encode(["logos"=>count(lapaz_get_subcuentas()),"news"=>count(lapaz_get_noticias()),"html"=>do_blocks("<!-- wp:lapaz/lo-que-hacemos /-->")]);'
		)
	);
	const page = await openPage( 'about:blank', 360 );
	try {
		const hidden = await page.evaluate(
			`(() => {const doc=new DOMParser().parseFromString(${ JSON.stringify(
				rendered.html
			) },'text/html');return Boolean(doc.querySelector('.lo-que-hacemos')) && !doc.querySelector('.subcuentas__nav, .timeline__scroll');})()`
		);
		check(
			'Sin subcuentas ni noticias no se pintan los controles',
			rendered.logos === 0 && rendered.news === 0 && hidden
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
			if ( width !== 850 ) await behavior( page, width );
		} finally {
			page.close();
		}
	}
	if ( wordpress && ! baselineFrom ) {
		await cta();
		await emptyContent();
	}
} finally {
	await finish();
}
