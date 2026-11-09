/**
 * Reproductor de relatos (PaisSanaAudioPlayer.astro) sobre el <audio> nativo.
 * Acotado al bloque con data-audio en lugar de los id fijos de Astro.
 */

/**
 * mm:ss de una cantidad de segundos.
 *
 * @param {number} segundos Segundos.
 * @return {string} Tiempo formateado.
 */
const formatTime = ( segundos ) => {
	if ( ! Number.isFinite( segundos ) ) {
		return '00:00';
	}
	const mins = Math.floor( segundos / 60 );
	const secs = Math.floor( segundos % 60 );
	return `${ String( mins ).padStart( 2, '0' ) }:${ String( secs ).padStart(
		2,
		'0'
	) }`;
};

document
	.querySelectorAll( '.wp-block-lapaz-paisana-audios' )
	.forEach( ( seccion ) => {
		if ( ! ( seccion instanceof HTMLElement ) ) {
			return;
		}
		/** @type {unknown} */
		const datos = JSON.parse( seccion.dataset.relatos || '[]' );
		/** @type {Array<{productor: string, marca: string, lugar: string, audioUrl: string, duracionSegundos: number}>} */
		const relatos = Array.isArray( datos ) ? datos : [];
		/**
		 * @param {string} nombre Valor de data-audio.
		 * @return {Element | null} Elemento.
		 */
		const parte = ( nombre ) =>
			seccion.querySelector( `[data-audio="${ nombre }"]` );
		const playBtn = parte( 'play' );
		const progressBar = parte( 'progreso' );
		const audio = parte( 'elemento' );
		if (
			relatos.length === 0 ||
			! ( playBtn instanceof HTMLButtonElement ) ||
			! ( progressBar instanceof HTMLInputElement ) ||
			! ( audio instanceof HTMLAudioElement )
		) {
			return;
		}
		const currentTimeEl = parte( 'actual' );
		const durationEl = parte( 'duracion' );
		let indiceActual = 0;

		/** @param {number} segundos Duración. */
		const pintarDuracion = ( segundos ) => {
			if ( durationEl ) {
				durationEl.textContent = formatTime( segundos );
			}
			progressBar.max = String( Math.floor( segundos ) || 0 );
		};

		/** @param {number} indice Relato a cargar. */
		const cargarRelato = ( indice ) => {
			audio.pause();
			playBtn.classList.remove( 'playing' );
			indiceActual = indice;
			const relato = relatos[ indiceActual ];
			if ( ! relato ) {
				return;
			}
			const textos = {
				productor: relato.productor,
				marca: relato.marca,
				lugar: relato.lugar,
			};
			Object.entries( textos ).forEach( ( [ nombre, valor ] ) => {
				const el = parte( nombre );
				if ( el ) {
					el.textContent = valor;
				}
			} );
			progressBar.value = '0';
			if ( currentTimeEl ) {
				currentTimeEl.textContent = '00:00';
			}
			pintarDuracion( relato.duracionSegundos || 0 );

			// Sin archivo publicado: controles deshabilitados.
			const disponible = Boolean( relato.audioUrl );
			playBtn.setAttribute(
				'aria-label',
				disponible ? 'Reproducir audio' : 'Audio no disponible'
			);
			playBtn.toggleAttribute( 'disabled', ! disponible );
			progressBar.toggleAttribute( 'disabled', ! disponible );
			if ( disponible ) {
				audio.src = relato.audioUrl;
			} else {
				audio.removeAttribute( 'src' );
			}
		};

		playBtn.addEventListener( 'click', () => {
			if ( audio.paused ) {
				audio.play();
			} else {
				audio.pause();
			}
		} );
		audio.addEventListener( 'play', () => {
			playBtn.classList.add( 'playing' );
			playBtn.setAttribute( 'aria-label', 'Pausar audio' );
		} );
		audio.addEventListener( 'pause', () => {
			playBtn.classList.remove( 'playing' );
			playBtn.setAttribute( 'aria-label', 'Reproducir audio' );
		} );
		// La duración real del archivo manda sobre la cargada en WordPress.
		audio.addEventListener( 'loadedmetadata', () =>
			pintarDuracion( audio.duration )
		);
		audio.addEventListener( 'timeupdate', () => {
			progressBar.value = String( audio.currentTime );
			if ( currentTimeEl ) {
				currentTimeEl.textContent = formatTime( audio.currentTime );
			}
		} );
		audio.addEventListener( 'ended', () => {
			progressBar.value = '0';
			if ( currentTimeEl ) {
				currentTimeEl.textContent = '00:00';
			}
		} );
		progressBar.addEventListener( 'input', () => {
			const valor = Number( progressBar.value );
			audio.currentTime = valor;
			if ( currentTimeEl ) {
				currentTimeEl.textContent = formatTime( valor );
			}
		} );
		parte( 'anterior' )?.addEventListener( 'click', () =>
			cargarRelato(
				( indiceActual - 1 + relatos.length ) % relatos.length
			)
		);
		parte( 'siguiente' )?.addEventListener( 'click', () =>
			cargarRelato( ( indiceActual + 1 ) % relatos.length )
		);

		cargarRelato( 0 );
	} );
