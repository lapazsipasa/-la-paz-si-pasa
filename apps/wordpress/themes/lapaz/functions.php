<?php
/**
 * Funciones del tema La Paz Sí Pasa.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/inc/blocks.php';
require_once __DIR__ . '/inc/portada.php';
require_once __DIR__ . '/inc/retratos.php';
require_once __DIR__ . '/inc/lo-que-hacemos.php';
require_once __DIR__ . '/inc/videos.php';
require_once __DIR__ . '/inc/paisana.php';
require_once __DIR__ . '/inc/ferias.php';
require_once __DIR__ . '/inc/seo.php';

/**
 * Versión del tema, para invalidar la caché de los assets al publicar.
 */
function lapaz_version(): string {
	$version = wp_get_theme( 'lapaz' )->get( 'Version' );

	return is_string( $version ) ? $version : '0';
}

/**
 * CSS base también en el editor.
 */
function lapaz_setup(): void {
	add_editor_style( 'assets/css/base.css' );
}
add_action( 'after_setup_theme', 'lapaz_setup' );

/**
 * CSS base en el sitio público.
 */
function lapaz_enqueue_assets(): void {
	wp_enqueue_style(
		'lapaz-base',
		get_theme_file_uri( 'assets/css/base.css' ),
		array(),
		lapaz_version()
	);
	// Con 'path', WordPress lo puede incrustar en el HTML en vez de pedirlo aparte (no bloquea el render).
	wp_style_add_data( 'lapaz-base', 'path', get_theme_file_path( 'assets/css/base.css' ) );
}
add_action( 'wp_enqueue_scripts', 'lapaz_enqueue_assets' );

/**
 * CSS por bloque: solo se carga en páginas donde el bloque aparece.
 * Con 'path', WordPress lo incrusta inline si es pequeño.
 */
function lapaz_enqueue_block_styles(): void {
	wp_enqueue_block_style(
		'core/navigation',
		array(
			'handle' => 'lapaz-navigation',
			'src'    => get_theme_file_uri( 'assets/css/navigation.css' ),
			'path'   => get_theme_file_path( 'assets/css/navigation.css' ),
			'ver'    => lapaz_version(),
		)
	);
}
add_action( 'init', 'lapaz_enqueue_block_styles' );

/**
 * Clase CSS adicional de un bloque analizado ('' si no tiene).
 *
 * @param array<mixed> $block Bloque analizado.
 */
function lapaz_block_class( array $block ): string {
	$attrs = $block['attrs'] ?? null;
	if ( ! is_array( $attrs ) || ! is_string( $attrs['className'] ?? null ) ) {
		return '';
	}

	return $attrs['className'];
}

/**
 * Encola el JS del menú móvil solo cuando se pinta el bloque de navegación del tema.
 *
 * @param string       $block_content HTML del bloque.
 * @param array<mixed> $block         Bloque analizado.
 */
function lapaz_enqueue_navigation_script( string $block_content, array $block ): string {
	if ( str_contains( lapaz_block_class( $block ), 'lapaz-nav-mobile' ) ) {
		wp_enqueue_script(
			'lapaz-navigation',
			get_theme_file_uri( 'assets/js/navigation.js' ),
			array(),
			lapaz_version(),
			array( 'strategy' => 'defer' )
		);
	}

	return $block_content;
}
add_filter( 'render_block_core/navigation', 'lapaz_enqueue_navigation_script', 10, 2 );

/**
 * Precarga Komet 300, la fuente del texto que se ve primero.
 * WordPress no precarga fuentes de theme.json por sí solo.
 */
function lapaz_preload_fonts(): void {
	printf(
		'<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n",
		esc_url( get_theme_file_uri( 'assets/fonts/Komet_Light.woff2' ) )
	);
}
add_action( 'wp_head', 'lapaz_preload_fonts', 1 );

/**
 * ID del menú principal (wp_navigation) que guarda lapaz-setup en la opción lapaz_nav_ref.
 *
 * @return int 0 si no hay un menú publicado válido.
 */
function lapaz_nav_ref(): int {
	$option = get_option( 'lapaz_nav_ref', 0 );
	$ref    = is_numeric( $option ) ? (int) $option : 0;
	$post   = $ref > 0 ? get_post( $ref ) : null;

	if ( ! $post instanceof WP_Post || 'wp_navigation' !== $post->post_type || 'publish' !== $post->post_status ) {
		return 0;
	}

	return $ref;
}

/**
 * Asigna el menú principal a los bloques de navegación del tema (clase lapaz-nav-*)
 * que no tengan ref, para no dejar el ID del menú fijo en las plantillas.
 *
 * @param array<mixed> $parsed_block Bloque analizado.
 * @return array<mixed>
 */
function lapaz_navigation_ref( array $parsed_block ): array {
	$attrs = is_array( $parsed_block['attrs'] ?? null ) ? $parsed_block['attrs'] : array();

	if ( 'core/navigation' !== ( $parsed_block['blockName'] ?? null )
		|| ! empty( $attrs['ref'] )
		|| ! str_contains( lapaz_block_class( $parsed_block ), 'lapaz-nav-' ) ) {
		return $parsed_block;
	}

	$ref = lapaz_nav_ref();
	if ( $ref > 0 ) {
		$attrs['ref']          = $ref;
		$parsed_block['attrs'] = $attrs;
	}

	return $parsed_block;
}
add_filter( 'render_block_data', 'lapaz_navigation_ref' );

/**
 * Límite de CSS incrustado en el HTML. El de fábrica (40 KB en total) dejaba afuera la
 * navegación y los bloques de PaisSana como hojas externas que bloqueaban el render: el LCP
 * (foto del hero) se descargaba en 0,3 s y tardaba 1,8 s más en pintarse (Lighthouse móvil).
 * Es un sitio de dos páginas y el HTML viaja comprimido: todo el CSS va dentro.
 */
function lapaz_styles_inline_size_limit(): int {
	return 150000;
}
add_filter( 'styles_inline_size_limit', 'lapaz_styles_inline_size_limit' );
