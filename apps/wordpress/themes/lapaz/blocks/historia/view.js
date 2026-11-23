/**
 * Historia: reproduce el video al pulsar (iframe de YouTube sin cookies o <video>) y el
 * lightbox de la galería (<dialog> modal: clic fuera, botón o Escape lo cierran; el foco vuelve a la foto, en el evento `close`).
 */

/**
 * Reemplaza el póster y el botón por el reproductor.
 *
 * @param {HTMLElement} envoltorio .video-wrap con data-fuente, data-src y data-titulo.
 */
const reproducirHistoria = ( envoltorio ) => {
	const { fuente, src, titulo } = envoltorio.dataset;
	if ( ! src ) {
		return;
	}
	/** @type {HTMLElement} */
	let reproductor;
	if ( fuente === 'youtube' ) {
		const iframe = document.createElement( 'iframe' );
		iframe.src = `${ src }?autoplay=1&rel=0&playsinline=1`;
		iframe.title = titulo ?? 'Video';
		iframe.allow =
			'accelerometer; autoplay; encrypted-media; picture-in-picture';
		iframe.allowFullscreen = true;
		reproductor = iframe;
	} else {
		const video = document.createElement( 'video' );
		video.src = src;
		video.controls = true;
		video.autoplay = true;
		video.playsInline = true;
		reproductor = video;
	}
	reproductor.tabIndex = -1;
	envoltorio.replaceChildren( reproductor );
	reproductor.focus();
};

document.querySelectorAll( '.wp-block-lapaz-historia' ).forEach( ( bloque ) => {
	const lightbox = bloque.querySelector( '.lightbox' );
	const ampliada = lightbox?.querySelector( 'img' );
	const pie = lightbox?.querySelector( 'p' );
	const cerrar = lightbox?.querySelector( '.cerrar' );
	/** @type {HTMLElement|null} */
	let origen = null;

	// El navegador cierra el <dialog> (Escape, gesto del sistema) o el código: la limpieza va en `close`.
	const limpiar = () => {
		// Si ya se reabrió, el `close` tardío del cierre anterior no debe deshacerlo.
		if (
			! lightbox ||
			( lightbox instanceof HTMLDialogElement && lightbox.open )
		) {
			return;
		}
		lightbox.classList.remove( 'on' );
		document.body.style.overflow = '';
		ampliada?.removeAttribute( 'src' );
		origen?.focus();
		origen = null;
	};
	lightbox?.addEventListener( 'close', limpiar );

	bloque.addEventListener( 'click', ( event ) => {
		if ( ! ( event.target instanceof Element ) ) {
			return;
		}
		const play = event.target.closest( '.video-wrap button.play' );
		const envoltorio = play?.closest( '.video-wrap' );
		if ( envoltorio instanceof HTMLElement ) {
			reproducirHistoria( envoltorio );
			return;
		}
		const foto = event.target.closest( '.galeria button' );
		if (
			foto instanceof HTMLElement &&
			lightbox instanceof HTMLDialogElement &&
			ampliada instanceof HTMLImageElement &&
			pie &&
			cerrar instanceof HTMLElement
		) {
			origen = foto;
			ampliada.src = foto.dataset.grande ?? '';
			ampliada.alt = foto.querySelector( 'img' )?.alt ?? '';
			pie.textContent = foto.dataset.pie ?? '';
			pie.hidden = '' === pie.textContent;
			// showModal() deja el resto de la página inerte y lo pone sobre todo.
			lightbox.showModal();
			lightbox.classList.add( 'on' );
			document.body.style.overflow = 'hidden';
			cerrar.focus();
			return;
		}
		if (
			lightbox instanceof HTMLDialogElement &&
			( event.target === lightbox || event.target.closest( '.cerrar' ) )
		) {
			lightbox.close();
			// `close` llega en una tarea aparte: limpiar ya evita un instante con el estado viejo (es idempotente).
			limpiar();
		}
	} );
} );
