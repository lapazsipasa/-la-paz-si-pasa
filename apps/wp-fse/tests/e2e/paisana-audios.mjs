// node tests/e2e/paisana-audios.mjs [--visual | --baseline http://127.0.0.1:4321]
import { runPaisana } from './paisana-lib.mjs';

await runPaisana(
	{ 'paisana-audios': '.corazon-campo' },
	async ( page, width, tests ) => {
		const result = await page.evaluate( `(() => {
		const root=document.querySelector('.corazon-campo');
		const relatos=JSON.parse(root.dataset.relatos || '[]');
		const part=name=>root.querySelector('[data-audio="'+name+'"]');
		const matches=i=>{
			const expected=relatos[i];
			return expected && ['productor','marca','lugar'].every(key=>part(key)?.textContent===expected[key]) && part('elemento')?.src===expected.audioUrl && !part('play')?.disabled && !part('progreso')?.disabled && part('actual')?.textContent==='00:00';
		};
		const initial=matches(0);
		part('anterior')?.click();
		const prev=matches(relatos.length-1);
		part('siguiente')?.click();
		const next=matches(0);
		const cycle=[];
		for(let i=1;i<=relatos.length;i++){part('siguiente')?.click();cycle.push(matches(i%relatos.length));}
		return {count:relatos.length,initial,prev,next,cycle:cycle.length>0 && cycle.every(Boolean)};
	})()` );
		tests.check(
			`${ width }: quince relatos del seed`,
			result.count === 15
		);
		for ( const field of [ 'initial', 'prev', 'next', 'cycle' ] )
			tests.check(
				`${ width }: audio ${ field }, metadatos y controles sincronizados`,
				result[ field ],
				JSON.stringify( result )
			);
		const labels = await page.evaluate( `(() => {
			const root=document.querySelector('.corazon-campo');
			const audio=root.querySelector('audio'),button=root.querySelector('[data-audio="play"]');
			audio.dispatchEvent(new Event('play'));
			const playing=button.getAttribute('aria-label');
			audio.dispatchEvent(new Event('pause'));
			return {playing,paused:button.getAttribute('aria-label')};
		})()` );
		tests.check(
			`${ width }: play y pause actualizan aria-label`,
			labels.playing === 'Pausar audio' &&
				labels.paused === 'Reproducir audio',
			JSON.stringify( labels )
		);
		const disabled = await page.evaluate( `(async () => {
		const script=[...document.scripts].find(el=>el.src.includes('/paisana-audios/view.js'));
		if(!script) return false;
		const source=await (await fetch(script.src)).text();
		const original=document.querySelector('.corazon-campo');
		const clone=original.cloneNode(true);
		const first=JSON.parse(original.dataset.relatos)[0];
		clone.dataset.relatos=JSON.stringify([{...first,audioUrl:''}]);
		original.replaceWith(clone);
		// La copia no conserva listeners: se inicializa con el JS real y un relato sin archivo.
		new Function(source)();
		return clone.querySelector('[data-audio="play"]').disabled && clone.querySelector('[data-audio="progreso"]').disabled && !clone.querySelector('audio').hasAttribute('src') && clone.querySelector('[data-audio="play"]').getAttribute('aria-label')==='Audio no disponible';
	})()` );
		tests.check(
			`${ width }: sin archivo, play y progreso deshabilitados`,
			disabled
		);
	}
);
