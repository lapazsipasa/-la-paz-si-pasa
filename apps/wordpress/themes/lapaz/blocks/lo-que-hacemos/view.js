/**
 * Lo que hacemos: scroll del carrusel de subcuentas (LoQueHacemosSubcuentas.astro)
 * y de la lista de noticias por año (LoQueHacemosNoticiasTimeline.astro).
 */

const comportamiento = window.matchMedia( '(prefers-reduced-motion: reduce)' )
	.matches
	? 'auto'
	: 'smooth';
document
	.querySelectorAll( '.wp-block-lapaz-lo-que-hacemos .subcuentas' )
	.forEach( ( subcuentas ) => {
		const track = subcuentas.querySelector( '.subcuentas__track' );
		subcuentas.querySelectorAll( '.subcuentas__nav' ).forEach( ( btn ) => {
			btn.addEventListener( 'click', () => {
				const dir =
					btn instanceof HTMLElement ? Number( btn.dataset.dir ) : 0;
				track?.scrollBy( {
					left: dir * 180,
					behavior: comportamiento,
				} );
			} );
		} );
	} );

document
	.querySelectorAll( '.wp-block-lapaz-lo-que-hacemos .timeline' )
	.forEach( ( timeline ) => {
		const list = timeline.querySelector( '.timeline__list' );
		if ( ! ( list instanceof HTMLElement ) ) {
			return;
		}
		/** @type {HTMLElement[]} */
		const rows = [];
		timeline.querySelectorAll( '.timeline__row' ).forEach( ( row ) => {
			if ( row instanceof HTMLElement ) {
				rows.push( row );
			}
		} );
		timeline.querySelectorAll( '.timeline__scroll' ).forEach( ( btn ) => {
			btn.addEventListener( 'click', () => {
				const dir =
					btn instanceof HTMLElement ? Number( btn.dataset.dir ) : 0;
				const current = list.scrollTop;
				const target =
					dir > 0
						? rows.find( ( row ) => row.offsetTop > current + 4 )
						: [ ...rows ]
								.reverse()
								.find( ( row ) => row.offsetTop < current - 4 );
				let top = 0;
				if ( target ) {
					top = target.offsetTop;
				} else if ( dir > 0 ) {
					top = list.scrollHeight;
				}
				list.scrollTo( { top, behavior: comportamiento } );
			} );
		} );
	} );
