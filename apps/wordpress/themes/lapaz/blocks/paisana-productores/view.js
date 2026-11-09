/**
 * Productores PaisSana (PaisSanaProductoresVideos.astro): monta Plyr sobre cada video
 * cuando se acerca a la pantalla, como en Astro. Plyr y su sprite de íconos se sirven
 * desde el tema (data-plyr-*), no desde cdn.plyr.io.
 */

/** @type {Promise<void> | undefined} */
let plyrListo;

/**
 * Carga el JS y el CSS de Plyr una sola vez.
 *
 * @param {HTMLElement} seccion Bloque con las URLs en data-plyr-js y data-plyr-css.
 * @return {Promise<void>} Resuelve cuando Plyr está disponible.
 */
const cargarPlyr = ( seccion ) => {
	if ( plyrListo ) {
		return plyrListo;
	}
	/**
	 * @param {HTMLScriptElement | HTMLLinkElement} el Elemento a insertar.
	 * @return {Promise<void>} Resuelve al cargar.
	 */
	const insertar = ( el ) =>
		new Promise( ( resolve, reject ) => {
			el.onload = () => resolve();
			el.onerror = () => reject( new Error( 'No se pudo cargar Plyr' ) );
			document.head.append( el );
		} );
	const script = document.createElement( 'script' );
	script.src = seccion.dataset.plyrJs ?? '';
	const css = document.createElement( 'link' );
	css.rel = 'stylesheet';
	css.href = seccion.dataset.plyrCss ?? '';
	plyrListo = Promise.all( [ insertar( script ), insertar( css ) ] ).then(
		() => undefined
	);
	return plyrListo;
};

document
	.querySelectorAll( '.wp-block-lapaz-paisana-productores' )
	.forEach( ( seccion ) => {
		if ( ! ( seccion instanceof HTMLElement ) ) {
			return;
		}

		/** @param {HTMLElement} placeholder Botón con los datos del video. */
		const montar = async ( placeholder ) => {
			try {
				await cargarPlyr( seccion );
				const { source, src, title = 'Video' } = placeholder.dataset;
				if ( ! src ) {
					return;
				}
				/** @type {HTMLElement} */
				let player;
				if ( source === 'youtube' ) {
					player = document.createElement( 'div' );
					player.className = 'plyr__video-embed';
					const iframe = document.createElement( 'iframe' );
					iframe.src = src;
					iframe.title = title;
					iframe.allow =
						'autoplay; encrypted-media; picture-in-picture';
					iframe.allowFullscreen = true;
					player.append( iframe );
				} else {
					const video = document.createElement( 'video' );
					video.src = src;
					video.controls = true;
					player = video;
				}
				placeholder.replaceWith( player );
				// Plyr lo deja cargar() en window: se tipa para que el chequeo estricto lo acepte.
				const { Plyr } =
					/** @type {{ Plyr: new ( el: HTMLElement, opciones: Record<string, unknown> ) => unknown }} */ (
						/** @type {unknown} */ ( window )
					);

				new Plyr( player, {
					controls: [
						'play-large',
						'play',
						'progress',
						'current-time',
						'mute',
						'volume',
						'fullscreen',
					],
					iconUrl: seccion.dataset.plyrIcon,
				} );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.warn( error );
			}
		};

		const observer = new IntersectionObserver(
			( entries ) => {
				entries
					.filter( ( entry ) => entry.isIntersecting )
					.forEach( ( entry ) => {
						observer.unobserve( entry.target );
						if ( entry.target instanceof HTMLElement ) {
							montar( entry.target );
						}
					} );
			},
			{ rootMargin: '300px' }
		);
		seccion
			.querySelectorAll( '.js-video-placeholder' )
			.forEach( ( placeholder ) => observer.observe( placeholder ) );
	} );
