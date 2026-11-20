<?php
/**
 * Bloques del tema y los datos que leen.
 *
 * Las funciones de datos viven aquí y no en render.php: render.php se incluye en
 * cada instancia del bloque y no debe declarar funciones.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Hoja compartida de los bloques editoriales (boletín, catálogo, historia). Cada block.json
 * la nombra en "style", así WordPress solo la carga donde hay uno de esos bloques. Se
 * registra antes que los bloques; con 'path' puede ir inline.
 */
function lapaz_register_editorial_style(): void {
	wp_register_style( 'lapaz-editorial', get_theme_file_uri( 'assets/css/editorial.css' ), array(), lapaz_version() );
	wp_style_add_data( 'lapaz-editorial', 'path', get_theme_file_path( 'assets/css/editorial.css' ) );
	// Solo lectura larga (boletín e historia): cuerpo, fichas y «Otras ediciones».
	wp_register_style( 'lapaz-lectura', get_theme_file_uri( 'assets/css/lectura.css' ), array(), lapaz_version() );
	wp_style_add_data( 'lapaz-lectura', 'path', get_theme_file_path( 'assets/css/lectura.css' ) );
}
add_action( 'init', 'lapaz_register_editorial_style', 9 );

/**
 * Registra cada carpeta de blocks/ que tenga block.json.
 * Con supports.autoRegister (WP 7.0+) aparecen en el editor sin JS.
 */
function lapaz_register_blocks(): void {
	$block_jsons = glob( get_theme_file_path( 'blocks/*/block.json' ) );
	foreach ( false === $block_jsons ? array() : $block_jsons as $block_json ) {
		register_block_type( dirname( $block_json ) );
	}
}
add_action( 'init', 'lapaz_register_blocks' );

/**
 * Texto de un campo SCF ('' si no hay valor o SCF no está activo).
 *
 * @param string $name    Nombre del campo.
 * @param int    $post_id Entrada.
 */
function lapaz_field_text( string $name, int $post_id ): string {
	if ( ! function_exists( 'get_field' ) ) {
		return '';
	}
	$value = get_field( $name, $post_id );

	return is_string( $value ) ? $value : '';
}

/**
 * ID de adjunto de un campo de imagen SCF, devuelva array, ID o URL (0 si no hay).
 *
 * @param string $name    Nombre del campo.
 * @param int    $post_id Entrada.
 */
function lapaz_field_image_id( string $name, int $post_id ): int {
	if ( ! function_exists( 'get_field' ) ) {
		return 0;
	}
	$value = get_field( $name, $post_id );

	if ( is_array( $value ) && is_numeric( $value['ID'] ?? null ) ) {
		return (int) $value['ID'];
	}
	if ( is_numeric( $value ) ) {
		return (int) $value;
	}

	return is_string( $value ) ? attachment_url_to_postid( $value ) : 0;
}
