/**
 * Ferias (PaisSanaFeriaItem.astro + feriaVideos.ts): play de videos, carrusel de videos por
 * feria, lightbox de la galería y corte del video al cerrar una feria. Listeners delegados
 * en el bloque (en Astro, en document). El <dialog> del lightbox vive dentro del bloque
 * para que su CSS quede bajo el prefijo del bloque; showModal() lo lleva igual a la capa superior.
 */

/** @type {WeakMap<HTMLElement, Node[]>} */
const miniaturas = new WeakMap();

/**
 * Guarda miniatura y botón antes de reemplazarlos por el reproductor.
 *
 * @param {HTMLElement} media Contenedor del video.
 */
const guardarMiniatura = ( media ) => {
	if ( ! miniaturas.has( media ) ) {
		miniaturas.set( media, [ ...media.childNodes ] );
	}
};

/**
 * Detiene los videos dentro de `raiz` devolviendo su miniatura: es lo único que corta el
 * audio de un embed de YouTube sin cargar su API.
 *
 * @param {Element} raiz Feria o slide.
 */
const detenerVideos = ( raiz ) => {
	raiz.querySelectorAll( '.video-media' ).forEach( ( media ) => {
		if ( ! ( media instanceof HTMLElement ) ) {
			return;
		}
		const original = miniaturas.get( media );
		if ( original && media.querySelector( 'iframe, video' ) ) {
			media.replaceChildren( ...original );
		}
	} );
};

/**
 * Abre la foto en un <dialog> reutilizado por todo el bloque.
 *
 * @param {HTMLElement}      bloque Bloque de ferias.
 * @param {HTMLImageElement} foto   Miniatura pulsada.
 * @param {string}           grande URL en tamaño grande (data-full-src); la miniatura se vería pixelada.
 */
const abrirLightbox = ( bloque, foto, grande ) => {
	const existente = bloque.querySelector( 'dialog.lightbox' );
	let dialogo = existente instanceof HTMLDialogElement ? existente : null;
	if ( ! dialogo ) {
		const nuevo = document.createElement( 'dialog' );
		nuevo.className = 'lightbox';
		nuevo.innerHTML =
			'<img alt=""><button type="button" class="lightbox-cerrar" aria-label="Cerrar">✕</button>';
		nuevo.addEventListener( 'click', ( event ) => {
			if (
				event.target === nuevo ||
				( event.target instanceof Element &&
					event.target.closest( '.lightbox-cerrar' ) )
			) {
				nuevo.close();
			}
		} );
		bloque.append( nuevo );
		dialogo = nuevo;
	}
	const ampliada = dialogo.querySelector( 'img' );
	if ( ampliada ) {
		ampliada.src = grande || foto.currentSrc || foto.src;
		ampliada.alt = foto.alt;
	}
	dialogo.showModal();
};

document
	.querySelectorAll( '.wp-block-lapaz-paisana-ferias' )
	.forEach( ( bloque ) => {
		if ( ! ( bloque instanceof HTMLElement ) ) {
			return;
		}

		// toggle no burbujea: se captura. Al cerrarse una feria se detiene su video.
		bloque.addEventListener(
			'toggle',
			( event ) => {
				if (
					event.target instanceof HTMLDetailsElement &&
					! event.target.open
				) {
					detenerVideos( event.target );
				}
			},
			true
		);

		bloque.addEventListener( 'click', ( event ) => {
			if ( ! ( event.target instanceof Element ) ) {
				return;
			}
			const paso = event.target.closest( '.video-nav-btn' );
			if ( paso instanceof HTMLElement ) {
				const carrusel = paso.closest( '[data-carrusel]' );
				/** @type {HTMLElement[]} */
				const slides = [];
				carrusel?.querySelectorAll( '.video-slide' ).forEach( ( s ) => {
					if ( s instanceof HTMLElement ) {
						slides.push( s );
					}
				} );
				const actual = slides.findIndex( ( slide ) => ! slide.hidden );
				if ( actual < 0 ) {
					return;
				}
				const siguiente =
					( actual + Number( paso.dataset.paso ) + slides.length ) %
					slides.length;
				slides.forEach(
					( slide, i ) => ( slide.hidden = i !== siguiente )
				);
				const anterior = slides[ actual ];
				if ( anterior ) {
					detenerVideos( anterior );
				}
				const contador = carrusel?.querySelector( '.video-contador' );
				if ( contador ) {
					contador.textContent = `${ siguiente + 1 } / ${
						slides.length
					}`;
				}
				return;
			}

			const item = event.target.closest( '.gallery-item' );
			const foto = item?.querySelector( 'img' );
			if ( item instanceof HTMLElement && foto ) {
				abrirLightbox( bloque, foto, item.dataset.fullSrc ?? '' );
				return;
			}

			const boton = event.target.closest( '.play-btn-overlay' );
			const media = boton?.closest( '.video-media' );
			if ( ! boton || ! ( media instanceof HTMLElement ) ) {
				return;
			}
			const src = media.dataset.videoSrc;
			if ( ! src ) {
				return;
			}
			guardarMiniatura( media );
			if ( media.dataset.videoSource === 'youtube' ) {
				const iframe = document.createElement( 'iframe' );
				iframe.src = `${ src }${
					src.includes( '?' ) ? '&' : '?'
				}autoplay=1&rel=0&playsinline=1`;
				iframe.title = boton.getAttribute( 'aria-label' ) ?? 'Video';
				iframe.allow =
					'accelerometer; autoplay; encrypted-media; picture-in-picture';
				iframe.allowFullscreen = true;
				media.replaceChildren( iframe );
			} else {
				const video = document.createElement( 'video' );
				video.src = src;
				video.controls = true;
				video.autoplay = true;
				video.playsInline = true;
				media.replaceChildren( video );
			}
		} );
	} );
