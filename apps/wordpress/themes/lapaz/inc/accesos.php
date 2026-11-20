<?php
/**
 * Accesos desde las páginas existentes hacia el catálogo PaisSana y el boletín.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * URL de la página del catálogo de productores (punto único: sale del slug de la página).
 */
function lapaz_url_catalogo_base(): string {
	$pagina = get_page_by_path( 'productores' );
	$url    = $pagina instanceof WP_Post ? get_permalink( $pagina ) : false;

	return is_string( $url ) ? $url : home_url( '/productores/' );
}

/**
 * URL del catálogo de productores, en la zona del buscador.
 */
function lapaz_url_catalogo(): string {
	return lapaz_url_catalogo_base() . '#explorar';
}

/**
 * Texto del enlace «CONOCE A LOS N PRODUCTORES» ('' si aún no hay productores publicados).
 */
function lapaz_texto_enlace_catalogo(): string {
	$total = lapaz_catalogo_total();

	/* translators: %s: número de productores publicados. */
	return $total > 0 ? sprintf( __( 'Conoce a los %s productores', 'lapaz' ), number_format_i18n( $total ) ) : '';
}

/**
 * Las tres cifras del catálogo (productores, departamentos y categorías con productores).
 *
 * @return array<int, array{0: int, 1: string}> Pares número y rótulo.
 */
function lapaz_catalogo_cifras(): array {
	return array(
		array( lapaz_catalogo_total(), __( 'productores registrados', 'lapaz' ) ),
		array( count( lapaz_catalogo_terminos( 'departamento' ) ), __( 'departamentos', 'lapaz' ) ),
		array( count( lapaz_catalogo_terminos( 'categoria_productor' ) ), __( 'categorías de oferta', 'lapaz' ) ),
	);
}
