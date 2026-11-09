<?php
/**
 * Datos de la portada: página Inicio e imagen del hero (con su precarga).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * ID de la página de inicio (la que guarda los campos de group_home), 0 si no hay.
 */
function lapaz_front_page_id(): int {
	$id = get_option( 'page_on_front' );

	return is_numeric( $id ) ? (int) $id : 0;
}

/**
 * Imagen del hero: el adjunto de hero_imagen en Inicio o, sin él, los JPEG del tema.
 *
 * @return array{id: int, src: string, srcset: string}
 */
function lapaz_hero_imagen(): array {
	$id = lapaz_front_page_id() > 0 ? lapaz_field_image_id( 'hero_imagen', lapaz_front_page_id() ) : 0;
	if ( $id > 0 ) {
		$src    = wp_get_attachment_image_url( $id, 'full' );
		$srcset = wp_get_attachment_image_srcset( $id, 'full' );

		return array(
			'id'     => $id,
			'src'    => is_string( $src ) ? $src : '',
			'srcset' => is_string( $srcset ) ? $srcset : '',
		);
	}

	$base = get_theme_file_uri( 'assets/img/hero/' );

	return array(
		'id'     => 0,
		'src'    => $base . 'hero-1200.jpg',
		'srcset' => "{$base}hero-640.jpg 640w, {$base}hero-960.jpg 960w, {$base}hero-1200.jpg 1200w",
	);
}

/**
 * Guarda la imagen del hero para precargarla, o la devuelve si se llama sin argumento.
 *
 * @param array{id: int, src: string, srcset: string}|null $imagen Imagen a precargar.
 * @return array{id: int, src: string, srcset: string}|null
 */
function lapaz_hero_preload( ?array $imagen = null ): ?array {
	/**
	 * Imagen guardada durante la petición.
	 *
	 * @var array{id: int, src: string, srcset: string}|null $guardada
	 */
	static $guardada = null;
	if ( null !== $imagen ) {
		$guardada = $imagen;
	}

	return $guardada;
}

/**
 * Precarga la imagen LCP del hero. En temas de bloques la plantilla se pinta antes
 * de wp_head, así que aquí ya se sabe si la página tiene hero y con qué imagen.
 */
function lapaz_print_hero_preload(): void {
	$imagen = lapaz_hero_preload();
	if ( null === $imagen || '' === $imagen['src'] ) {
		return;
	}
	printf(
		'<link rel="preload" as="image" href="%s" imagesrcset="%s" imagesizes="100vw" fetchpriority="high">' . "\n",
		esc_url( $imagen['src'] ),
		esc_attr( $imagen['srcset'] )
	);
}
add_action( 'wp_head', 'lapaz_print_hero_preload', 1 );
