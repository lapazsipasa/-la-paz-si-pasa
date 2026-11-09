/**
 * Slider de Retratos (RetratosPazSlider.astro): anterior y siguiente recorren las
 * fotos en círculo; solo la foto y el texto actuales quedan con aria-hidden="false".
 */
document
	.querySelectorAll( '.wp-block-lapaz-retratos .retratos-slider' )
	.forEach( ( slider ) => {
		const fotos = slider.querySelectorAll( '.retratos-slider__foto' );
		const campos = slider.querySelectorAll( '.retratos-slider__campos' );
		const total = fotos.length;
		let current = 0;

		/**
		 * Muestra el slide actual y oculta los demás.
		 *
		 * @param {NodeList} items Fotos o textos con data-slide.
		 */
		const mostrar = ( items ) => {
			items.forEach( ( el ) => {
				if ( el instanceof HTMLElement ) {
					const oculto = Number( el.dataset.slide ) !== current;
					el.setAttribute( 'aria-hidden', String( oculto ) );
				}
			} );
		};

		/**
		 * @param {number} paso -1 para anterior, 1 para siguiente.
		 */
		const mover = ( paso ) => {
			current = ( current + paso + total ) % total;
			mostrar( fotos );
			mostrar( campos );
		};

		slider
			.querySelector( '.retratos-slider__arrow--prev' )
			?.addEventListener( 'click', () => mover( -1 ) );
		slider
			.querySelector( '.retratos-slider__arrow--next' )
			?.addEventListener( 'click', () => mover( 1 ) );
	} );
