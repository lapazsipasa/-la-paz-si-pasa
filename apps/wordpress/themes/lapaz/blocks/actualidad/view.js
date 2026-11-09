/**
 * Actualidad (ActualidadGaleria.astro): play del destacado (iframe de YouTube o <video>),
 * cambio de destacado desde las cards con View Transitions y scroll del carrusel.
 * Sin los estilos inline de Astro: aquí el CSS del bloque alcanza a lo que crea el JS.
 */

const MOVIMIENTO = window.matchMedia( '(prefers-reduced-motion: reduce)' )
	.matches
	? 'auto'
	: 'smooth';

const PLAY_SVG =
	'<svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="white" opacity="0.9" /><path d="M9.5 7.5v9l7-4.5z" fill="var(--color-actualidad-bg)" /></svg>';

/**
 * Agrega autoplay=1 a una URL, tenga o no parámetros.
 *
 * @param {string} src URL del embed.
 * @return {string} URL con autoplay.
 */
const conAutoplay = ( src ) =>
	`${ src }${ src.includes( '?' ) ? '&' : '?' }autoplay=1`;

/**
 * Reemplaza la miniatura del player por el video.
 *
 * @param {HTMLElement} player Contenedor del player.
 * @param {string}      alt    Título del video.
 */
const reproducir = ( player, alt ) => {
	const fuente = player.dataset.fuente ?? '';
	const src = player.dataset.src ?? '';
	if ( ! src ) {
		return;
	}
	player.replaceChildren();
	if ( fuente === 'youtube' ) {
		const iframe = document.createElement( 'iframe' );
		iframe.src = conAutoplay( src );
		iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
		iframe.allowFullscreen = true;
		iframe.title = alt;
		player.append( iframe );
		return;
	}
	const video = document.createElement( 'video' );
	video.src = src;
	video.controls = true;
	video.autoplay = true;
	player.append( video );
};

/**
 * Vuelve a poner miniatura y botón de play en el player.
 *
 * @param {HTMLElement} player    Contenedor del player.
 * @param {string}      thumbnail URL de la miniatura.
 * @param {string}      alt       Título del video.
 */
const reiniciar = ( player, thumbnail, alt ) => {
	player.replaceChildren();
	if ( thumbnail ) {
		const img = document.createElement( 'img' );
		img.dataset.campo = 'thumbnail';
		img.src = thumbnail;
		img.alt = alt;
		player.append( img );
	}
	const play = document.createElement( 'button' );
	play.type = 'button';
	play.className = 'actualidad__play';
	play.setAttribute( 'aria-label', `Reproducir ${ alt }` );
	play.innerHTML = PLAY_SVG;
	player.append( play );
};

document
	.querySelectorAll( '.wp-block-lapaz-actualidad' )
	.forEach( ( actualidad ) => {
		const destacadoEl = actualidad.querySelector( '[data-destacado]' );
		const player = actualidad.querySelector( '[data-player]' );
		if (
			! ( destacadoEl instanceof HTMLElement ) ||
			! ( player instanceof HTMLElement )
		) {
			return;
		}
		const track = actualidad.querySelector( '[data-track]' );
		const tituloEl = destacadoEl.querySelector( '[data-campo="titulo"]' );
		const descripcionEl = destacadoEl.querySelector(
			'[data-campo="descripcion"]'
		);
		const tagsEl = destacadoEl.querySelector( '[data-campo="tags"]' );

		// Delegado: el botón de play se recrea en cada cambio de destacado.
		player.addEventListener( 'click', ( event ) => {
			if (
				event.target instanceof Element &&
				event.target.closest( '.actualidad__play' )
			) {
				reproducir( player, tituloEl?.textContent ?? '' );
			}
		} );

		/**
		 * Copia los datos de la card al destacado.
		 *
		 * @param {HTMLElement} card Card pulsada.
		 */
		const destacar = ( card ) => {
			const titulo = card.dataset.titulo ?? '';
			const thumbnail = card.dataset.thumbnail ?? '';
			if ( tituloEl ) {
				tituloEl.textContent = titulo;
			}
			if ( descripcionEl ) {
				descripcionEl.textContent = card.dataset.descripcion ?? '';
			}
			if ( tagsEl ) {
				/** @type {unknown} */
				const tags = JSON.parse( card.dataset.tags || '[]' );
				tagsEl.replaceChildren(
					...( Array.isArray( tags ) ? tags : [] ).map( ( tag ) => {
						const span = document.createElement( 'span' );
						span.className = 'actualidad__tag';
						span.textContent = String( tag );
						return span;
					} )
				);
			}
			reiniciar( player, thumbnail, titulo );
			player.dataset.fuente = card.dataset.fuente ?? '';
			player.dataset.src = card.dataset.src ?? '';
			player.dataset.thumbnail = thumbnail;
			track
				?.querySelectorAll( 'li[data-activo]' )
				.forEach( ( li ) => li.removeAttribute( 'data-activo' ) );
			card.closest( 'li' )?.setAttribute( 'data-activo', 'true' );
		};

		actualidad
			.querySelectorAll( '.actualidad__card' )
			.forEach( ( card ) => {
				if ( ! ( card instanceof HTMLElement ) ) {
					return;
				}
				card.addEventListener( 'click', async () => {
					const irAlDestacado = () =>
						destacadoEl.scrollIntoView( {
							behavior: MOVIMIENTO,
							block: 'nearest',
						} );
					const thumb = card.querySelector(
						'.actualidad__card-thumb'
					);

					// Se precarga la miniatura grande: sin ella la transición pasa por un recuadro negro.
					const previa = new Image();
					previa.src = card.dataset.thumbnail ?? '';
					await previa.decode().catch( () => {} );

					if (
						! document.startViewTransition ||
						! ( thumb instanceof HTMLElement )
					) {
						destacar( card );
						irAlDestacado();
						return;
					}
					thumb.style.viewTransitionName = 'actualidad-video';
					const transicion = document.startViewTransition( () => {
						thumb.style.viewTransitionName = '';
						player.style.viewTransitionName = 'actualidad-video';
						destacar( card );
					} );
					transicion.finished.finally( () => {
						player.style.viewTransitionName = '';
						irAlDestacado();
					} );
				} );
			} );

		actualidad.querySelectorAll( '.actualidad__nav' ).forEach( ( btn ) => {
			btn.addEventListener( 'click', () => {
				const dir =
					btn instanceof HTMLElement ? Number( btn.dataset.dir ) : 0;
				track?.scrollBy( { left: dir * 280, behavior: MOVIMIENTO } );
			} );
		} );
	} );
