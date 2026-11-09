/**
 * core/navigation no cierra el overlay al tocar un ancla de la misma página
 * (/#lo-que-hacemos); Nav.astro sí lo hacía. Se reutiliza el botón nativo de cerrar,
 * que devuelve el foco y libera el scroll.
 */
document.addEventListener( 'click', ( event ) => {
	if ( ! ( event.target instanceof Element ) ) {
		return;
	}
	const link = event.target.closest(
		'.lapaz-nav-mobile .is-menu-open a[href*="#"]'
	);
	if ( ! link ) {
		return;
	}
	const close = link
		.closest( '.wp-block-navigation__responsive-container' )
		?.querySelector( '.wp-block-navigation__responsive-container-close' );
	if ( close instanceof HTMLElement ) {
		close.click();
	}
} );
