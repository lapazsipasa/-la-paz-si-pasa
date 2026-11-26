<?php
/**
 * Plugin Name: La Paz Sí Pasa · Google Tag Manager
 * Description: Carga el contenedor de Google Tag Manager en el sitio público, solo en producción y sin JavaScript en línea (lo permite la CSP).
 * Version: 0.1.0
 * Author: William Moreno
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

// ID público del contenedor. Cambiarlo o quitar GTM: wiki/despliegue-fse.md (CSP y Google Tag Manager).
const LAPAZ_GTM_ID = 'GTM-N5CHW4QZ';

/**
 * El fragmento de GTM, en dos archivos: el arranque del dataLayer (assets/js/gtm.js del tema) y gtm.js
 * con async. Solo en producción: staging, dev, local y las pruebas no envían datos. wp_enqueue_scripts
 * no corre en wp-admin ni en el login.
 */
function lapaz_gtm(): void {
	if ( 'production' !== wp_get_environment_type() ) {
		return;
	}
	wp_enqueue_script(
		'lapaz-gtm-datalayer',
		get_theme_file_uri( 'assets/js/gtm.js' ),
		array(),
		(string) filemtime( get_theme_file_path( 'assets/js/gtm.js' ) ),
		array( 'in_footer' => false )
	);
	wp_enqueue_script(
		'lapaz-gtm',
		'https://www.googletagmanager.com/gtm.js?id=' . LAPAZ_GTM_ID,
		array( 'lapaz-gtm-datalayer' ),
		null, // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion -- URL de Google: un ?ver= propio no aplica.
		array(
			'strategy'  => 'async',
			'in_footer' => false,
		)
	);
}
add_action( 'wp_enqueue_scripts', 'lapaz_gtm' );
