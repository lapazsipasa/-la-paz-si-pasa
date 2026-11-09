/**
 * Pestañas de regiones (PaisSanaMapaCarrusel.astro). Acotado al bloque: en Astro
 * buscaba #tab-<id> en todo el documento, lo que solo servía con una instancia.
 */
document
	.querySelectorAll( '.wp-block-lapaz-paisana-mapa .mapa-carrusel' )
	.forEach( ( carrusel ) => {
		const tabs = carrusel.querySelectorAll( '.tab-btn' );
		const contents = carrusel.querySelectorAll( '.tab-content' );
		tabs.forEach( ( tab ) => {
			tab.addEventListener( 'click', () => {
				const destino = tab.getAttribute( 'data-target' );
				tabs.forEach( ( t ) => {
					t.classList.toggle( 'active', t === tab );
					t.setAttribute( 'aria-pressed', String( t === tab ) );
				} );
				contents.forEach( ( c ) =>
					c.classList.toggle(
						'active',
						c.getAttribute( 'data-region' ) === destino
					)
				);
			} );
		} );
	} );
