/**
 * «Volver arriba» del footer (Footer.astro). Respeta prefers-reduced-motion.
 */
document
	.querySelector( '.wp-block-lapaz-footer .site-footer__totop' )
	?.addEventListener( 'click', () => {
		const reducido = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		window.scrollTo( { top: 0, behavior: reducido ? 'auto' : 'smooth' } );
	} );
