/**
 * Arranque de Google Tag Manager: lo que el fragmento de Google pone en línea, en un archivo para que
 * la CSP no necesite 'unsafe-inline'. Lo encola mu-plugins/lapaz-gtm.php (solo en producción) antes de gtm.js.
 */
( () => {
	/** @type {Window & { dataLayer?: unknown[] }} */
	const ventana = window;
	const dataLayer = ( ventana.dataLayer = ventana.dataLayer || [] );
	function gtag() {
		// GTM distingue el objeto arguments de un array: el fragmento oficial empuja arguments.
		dataLayer.push( arguments );
	}
	gtag( 'js', new Date() );
} )();
