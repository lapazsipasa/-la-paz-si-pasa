// node tests/e2e/paisana-ferias.mjs [--visual | --baseline http://127.0.0.1:4321]
import { runPaisana, wp } from './paisana-lib.mjs';

await runPaisana(
	{
		'paisana-ferias-intro': '.ferias-intro',
		'paisana-ferias': '.ferias-acordeon-list',
	},
	async ( page, width, tests ) => {
		const accordion = await page.evaluate( `(() => {
		const items=[...document.querySelectorAll('.feria-item')];
		const initial=items.filter(item=>item.open).length;
		if(items[1]) items[1].querySelector('summary').click();
		return {count:items.length,initial,one:items.filter(item=>item.open).length===1 && items[1]?.open};
	})()` );
		tests.check(
			`${ width }: quince ferias y una abierta al inicio`,
			accordion.count === 15 && accordion.initial === 1,
			JSON.stringify( accordion )
		);
		tests.check(
			`${ width }: abrir otra feria cierra la anterior`,
			accordion.one
		);
		const carousel = await page.evaluate( `(() => {
		const feria=[...document.querySelectorAll('.feria-item')].find(item=>item.querySelectorAll('.video-slide').length>1 && item.querySelector('.gallery-item'));
		if(!feria) return {found:false};
		feria.open=true;
		feria.scrollIntoView({block:'start',behavior:'instant'});
		const slides=[...feria.querySelectorAll('.video-slide')];
		const at=i=>slides.filter(slide=>!slide.hidden).length===1 && !slides[i].hidden && feria.querySelector('.video-contador').textContent.trim()===(i+1)+' / '+slides.length;
		const initial=at(0);
		feria.querySelector('.video-slide:not([hidden]) .play-btn-overlay').click();
		const playing=Boolean(feria.querySelector('iframe,video'));
		feria.querySelector('.video-nav-btn[data-paso="1"]').click();
		const next=at(1),stopped=!feria.querySelector('iframe,video');
		feria.querySelector('.video-nav-btn[data-paso="-1"]').click();
		const prev=at(0);
		feria.querySelector('.video-nav-btn[data-paso="-1"]').click();
		const wrap=at(slides.length-1);
		feria.querySelector('.video-nav-btn[data-paso="1"]').click();
		const gallery=feria.querySelector('.gallery-item');
		const full=gallery.dataset.fullSrc;
		gallery.click();
		const dialog=document.querySelector('dialog.lightbox');
		return {found:true,initial,playing,next,stopped,prev,wrap,full,lightbox:Boolean(dialog?.open && full && dialog.querySelector('img').src===new URL(full,location.href).href)};
	})()` );
		tests.check(
			`${ width }: feria con varios videos y fotos`,
			carousel.found
		);
		for ( const name of [
			'initial',
			'playing',
			'next',
			'stopped',
			'prev',
			'wrap',
			'lightbox',
		] )
			tests.check(
				`${ width }: feria ${ name }`,
				carousel[ name ],
				JSON.stringify( carousel )
			);
		await page.key( 'Escape' );
		tests.check(
			`${ width }: Esc cierra el lightbox`,
			await page.evaluate(
				`!document.querySelector('dialog.lightbox')?.open`
			)
		);
		const stopped = await page.evaluate( `(async()=>{
		const feria=document.querySelector('.feria-item[open]');
		const button=feria?.querySelector('.video-slide:not([hidden]) .play-btn-overlay');
		if(!button) return false;
		button.click();
		const playing=Boolean(feria.querySelector('iframe,video'));
		feria.open=false;
		await new Promise(resolve=>setTimeout(resolve,100));
		return playing && !feria.querySelector('iframe,video') && Boolean(feria.querySelector('.play-btn-overlay'));
	})()` );
		tests.check( `${ width }: cerrar la feria detiene su video`, stopped );
		if ( width !== 360 ) return;
		// SCF no vacía la URL de YouTube que oculta al elegir el MP4: el Origen de la fila debe mandar.
		// Los filtros viven solo en este proceso de wp-cli; no cambian la base.
		const origen = JSON.parse(
			wp(
				'foreach(["field_feria_fuente_video"=>"wordpress","field_feria_video_youtube"=>"https://www.youtube.com/watch?v=dQw4w9WgXcQ"] as $k=>$v) add_filter("acf/load_value/key=$k", static fn()=>$v); add_filter("acf/format_value/key=field_feria_video_file", static fn()=>["url"=>"https://example.test/nuevo.mp4"]); $f=get_posts(["post_type"=>"feria","posts_per_page"=>1]); echo wp_json_encode(array_map(static fn($r)=>[$r["fuente"],$r["url"]], lapaz_feria_videos($f[0]->ID,"x")));'
			)
		);
		tests.check(
			'Origen «Archivo MP4» manda en la fila aunque quede una URL de YouTube guardada',
			origen.length > 0 &&
				origen.every(
					( [ fuente, url ] ) =>
						fuente === 'wordpress' &&
						url === 'https://example.test/nuevo.mp4'
				),
			JSON.stringify( origen )
		);
	}
);
