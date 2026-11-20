<?php
/**
 * Estado activo del menú por sección: «Proyectos destacados» también en /paissana/…
 * y «Boletín» en todo /boletin/…. Las anclas de la portada nunca se marcan.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Ruta de una URL del sitio, con barras a los lados ('' si no es una ruta propia).
 *
 * @param string $url URL absoluta o relativa.
 */
function lapaz_nav_path( string $url ): string {
	$path = wp_parse_url( $url, PHP_URL_PATH );
	$home = wp_parse_url( home_url(), PHP_URL_PATH );
	$path = is_string( $path ) ? $path : '';
	$home = is_string( $home ) ? untrailingslashit( $home ) : '';

	if ( '' !== $home && str_starts_with( $path, $home . '/' ) ) {
		$path = substr( $path, strlen( $home ) );
	}

	return trailingslashit( '/' . ltrim( $path, '/' ) );
}

/**
 * Marca el ítem del menú de la sección actual: la clase en las páginas hijas y
 * aria-current solo en la página exacta.
 *
 * @param string       $block_content HTML del enlace.
 * @param array<mixed> $block         Bloque analizado.
 */
function lapaz_nav_item_activo( string $block_content, array $block ): string {
	$attrs = is_array( $block['attrs'] ?? null ) ? $block['attrs'] : array();
	$id    = isset( $attrs['id'] ) && is_numeric( $attrs['id'] ) ? (int) $attrs['id'] : 0;
	$url   = is_string( $attrs['url'] ?? null ) ? $attrs['url'] : '';
	$link  = $id > 0 ? get_permalink( $id ) : $url;

	// Las anclas y la portada no son una sección.
	if ( ! is_string( $link ) || '' === $link || str_contains( $link, '#' ) ) {
		return $block_content;
	}

	$link_path = lapaz_nav_path( $link );
	if ( '/' === $link_path ) {
		return $block_content;
	}

	global $wp;
	$actual   = lapaz_nav_path( $wp instanceof WP ? $wp->request : '' );
	$prefijos = array( $link_path );
	if ( '/proyectos-destacados/' === $link_path ) {
		$prefijos[] = '/paissana/'; // El catálogo y las historias cuelgan de este programa.
	}

	foreach ( $prefijos as $prefijo ) {
		if ( ! str_starts_with( $actual, $prefijo ) ) {
			continue;
		}
		$html = new WP_HTML_Tag_Processor( $block_content );
		if ( $html->next_tag( array( 'tag_name' => 'li' ) ) ) {
			$html->add_class( 'current-menu-item' );
		}
		if ( $actual === $link_path && $html->next_tag( array( 'tag_name' => 'a' ) ) ) {
			$html->set_attribute( 'aria-current', 'page' );
		}
		return $html->get_updated_html();
	}

	return $block_content;
}
add_filter( 'render_block_core/navigation-link', 'lapaz_nav_item_activo', 10, 2 );
