<?php
/**
 * Accesos desde las páginas existentes hacia el catálogo PaisSana y el boletín.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * URL del catálogo de productores (punto único: si el catálogo cambia de ruta, se cambia aquí).
 */
function lapaz_url_catalogo(): string {
	return home_url( '/paissana/#explorar' );
}

/**
 * Texto del enlace «CONOCE A LOS N PRODUCTORES» ('' si aún no hay productores publicados).
 */
function lapaz_texto_enlace_catalogo(): string {
	$total = lapaz_catalogo_total();

	/* translators: %s: número de productores publicados. */
	return $total > 0 ? sprintf( __( 'Conoce a los %s productores', 'lapaz' ), number_format_i18n( $total ) ) : '';
}
