<?php
/**
 * Plugin Name: La Paz Sí Pasa · Limpieza
 * Description: Quita lo que WordPress trae y este sitio no usa: blog, comentarios, feeds, XML-RPC,
 *              metadatos de descubrimiento en el <head>, presets por defecto de theme.json y paneles
 *              del escritorio. Menos HTML, menos superficie de ataque y un admin más simple.
 * Version: 0.1.0
 * Author: William Moreno
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/*
 * <head>: metadatos de descubrimiento que nadie consume aquí.
 * Se quedan canonical, robots y lo que imprime el tema (SEO, precargas).
 */
remove_action( 'wp_head', 'wp_generator' );                  // Versión de WordPress: información para atacantes.
remove_action( 'wp_head', 'rsd_link' );                      // EditURI (XML-RPC).
remove_action( 'wp_head', 'wp_shortlink_wp_head' );          // ?p=ID.
remove_action( 'wp_head', 'rest_output_link_wp_head' );      // <link rel="https://api.w.org/">.
remove_action( 'wp_head', 'wp_oembed_add_discovery_links' ); // oEmbed: el sitio no se embebe en otros.
remove_action( 'wp_head', 'feed_links', 2 );                 // RSS: no hay blog.
remove_action( 'wp_head', 'feed_links_extra', 3 );
remove_action( 'template_redirect', 'rest_output_link_header', 11 ); // Header Link: <…/wp-json/>.
remove_action( 'template_redirect', 'wp_shortlink_header', 11 );
add_filter( 'the_generator', '__return_empty_string' );

/*
 * XML-RPC y pingbacks: no se usan y son un vector clásico de fuerza bruta.
 */
add_filter( 'xmlrpc_enabled', '__return_false' );

/**
 * Sin cabecera X-Pingback.
 *
 * @param array<string, string> $headers Cabeceras.
 * @return array<string, string>
 */
function lapaz_sin_pingback_header( array $headers ): array {
	unset( $headers['X-Pingback'] );

	return $headers;
}
add_filter( 'wp_headers', 'lapaz_sin_pingback_header' );

/*
 * Sin blog ni comentarios: el contenido vive en páginas y CPT.
 */

/**
 * Quita el soporte de comentarios y trackbacks de todos los tipos de contenido.
 */
function lapaz_sin_comentarios(): void {
	foreach ( get_post_types() as $tipo ) {
		remove_post_type_support( $tipo, 'comments' );
		remove_post_type_support( $tipo, 'trackbacks' );
	}
}
add_action( 'init', 'lapaz_sin_comentarios', 100 );
add_filter( 'comments_open', '__return_false', 20 );
add_filter( 'pings_open', '__return_false', 20 );
add_filter( 'comments_array', '__return_empty_array', 10 );

/**
 * Feeds: no hay blog; cualquier /feed/ vuelve al inicio.
 */
function lapaz_sin_feeds(): void {
	wp_safe_redirect( home_url( '/' ), 301 );
	exit;
}
foreach ( array( 'do_feed', 'do_feed_rdf', 'do_feed_rss', 'do_feed_rss2', 'do_feed_atom', 'do_feed_rss2_comments', 'do_feed_atom_comments' ) as $lapaz_feed ) {
	add_action( $lapaz_feed, 'lapaz_sin_feeds', 1 );
}

/**
 * Admin: sin Entradas ni Comentarios en el menú. Los editores solo ven lo que se usa.
 */
function lapaz_menu_admin(): void {
	remove_menu_page( 'edit.php' );
	remove_menu_page( 'edit-comments.php' );
}
add_action( 'admin_menu', 'lapaz_menu_admin' );

/**
 * Barra superior: sin «Comentarios» ni «+ Nueva entrada».
 *
 * @param WP_Admin_Bar $barra Barra de administración.
 */
function lapaz_barra_admin( WP_Admin_Bar $barra ): void {
	$barra->remove_node( 'comments' );
	$barra->remove_node( 'new-post' );
}
add_action( 'admin_bar_menu', 'lapaz_barra_admin', 999 );

/**
 * Escritorio: sin noticias/eventos de WordPress, borrador rápido ni actividad de comentarios.
 */
function lapaz_escritorio(): void {
	remove_meta_box( 'dashboard_primary', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
	remove_meta_box( 'dashboard_activity', 'dashboard', 'normal' );
	remove_action( 'welcome_panel', 'wp_welcome_panel' );
}
add_action( 'wp_dashboard_setup', 'lapaz_escritorio' );

/**
 * Quita de theme.json los presets por defecto del core (paleta, degradados, duotono, tamaños,
 * espaciados, sombras, proporciones). El tema define los suyos; los del core igual se
 * imprimían como variables CSS en cada página (unos 17 KB de global-styles).
 *
 * @param WP_Theme_JSON_Data $datos Datos del origen «default».
 */
function lapaz_sin_presets_core( WP_Theme_JSON_Data $datos ): WP_Theme_JSON_Data {
	$vacio = array(
		'version'  => 3,
		'settings' => array(
			'color'      => array(
				'palette'   => array(),
				'gradients' => array(),
				'duotone'   => array(),
			),
			'typography' => array( 'fontSizes' => array() ),
			'spacing'    => array( 'spacingSizes' => array() ),
			'shadow'     => array( 'presets' => array() ),
			'dimensions' => array( 'aspectRatios' => array() ),
		),
	);

	return $datos->update_with( $vacio );
}
add_filter( 'wp_theme_json_data_default', 'lapaz_sin_presets_core' );
