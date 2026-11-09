<?php
/**
 * SEO y rendimiento del <head> (port de BaseLayout.astro): título, descripción, Open Graph,
 * Twitter, íconos; sitemap solo con páginas; WebP al subir; sin script de emojis.
 *
 * La descripción de cada página es su extracto (se edita en la página). Sin extracto,
 * se usan los textos de Astro. canonical y robots los imprime el core.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Extracto en páginas: es el campo donde el editor escribe la descripción para buscadores.
 */
function lapaz_page_excerpt(): void {
	add_post_type_support( 'page', 'excerpt' );
}
add_action( 'init', 'lapaz_page_excerpt' );

/**
 * Título del documento: «Página | La Paz Sí Pasa»; en la portada,
 * «La Paz Sí Pasa | Fondo Colombia en Paz» (como en Astro).
 *
 * @param array<string, string> $partes Partes del título.
 * @return array<string, string>
 */
function lapaz_document_title_parts( array $partes ): array {
	if ( is_front_page() ) {
		return array(
			'title' => 'La Paz Sí Pasa',
			'site'  => __( 'Fondo Colombia en Paz', 'lapaz' ),
		);
	}
	if ( is_404() ) {
		$partes['title'] = __( 'Página no encontrada', 'lapaz' );
	} elseif ( is_page( 'proyectos-destacados' ) ) {
		$partes['title'] = __( 'PaisSana, proyectos destacados', 'lapaz' );
	}
	unset( $partes['tagline'] );

	return $partes;
}
add_filter( 'document_title_parts', 'lapaz_document_title_parts' );

/**
 * Separador «|» del título, como en Astro.
 */
function lapaz_document_title_separator(): string {
	return '|';
}
add_filter( 'document_title_separator', 'lapaz_document_title_separator' );

/**
 * Descripción de la página: su extracto o el texto por defecto de Astro según la página.
 */
function lapaz_meta_description(): string {
	if ( is_singular() && has_excerpt() ) {
		return wp_strip_all_tags( get_the_excerpt() );
	}
	if ( is_page( 'proyectos-destacados' ) ) {
		return __( 'PaisSana reúne a las familias productoras de los territorios PDET: mapas por región, relatos en audio, ferias y videos del café, el cacao y las artesanías.', 'lapaz' );
	}
	if ( is_404() ) {
		return __( 'La página que buscas no existe o cambió de dirección. Vuelve al inicio para conocer la gestión del Fondo Colombia en Paz en los territorios.', 'lapaz' );
	}

	return __( 'El Fondo Colombia en Paz ejecuta los recursos para implementar la paz: conoce las subcuentas, las cifras de gestión y las historias de los territorios PDET.', 'lapaz' );
}

/**
 * Meta description, Open Graph, Twitter e íconos (si no hay ícono del sitio en Ajustes).
 */
function lapaz_print_meta(): void {
	$titulo      = wp_get_document_title();
	$descripcion = lapaz_meta_description();
	$url         = is_singular() ? (string) get_permalink() : home_url( '/' );
	$imagen      = get_theme_file_uri( 'assets/img/seo/og.jpg' );
	$meta        = array(
		array( 'name', 'description', $descripcion ),
		array( 'property', 'og:type', 'website' ),
		array( 'property', 'og:site_name', 'La Paz Sí Pasa' ),
		array( 'property', 'og:locale', 'es_CO' ),
		array( 'property', 'og:url', $url ),
		array( 'property', 'og:title', $titulo ),
		array( 'property', 'og:description', $descripcion ),
		array( 'property', 'og:image', $imagen ),
		array( 'property', 'og:image:width', '1200' ),
		array( 'property', 'og:image:height', '630' ),
		array( 'property', 'og:image:alt', __( 'La Paz Sí Pasa, pasa en los territorios', 'lapaz' ) ),
		array( 'name', 'twitter:card', 'summary_large_image' ),
		array( 'name', 'twitter:title', $titulo ),
		array( 'name', 'twitter:description', $descripcion ),
		array( 'name', 'twitter:image', $imagen ),
	);
	foreach ( $meta as list( $atributo, $nombre, $valor ) ) {
		printf( '<meta %s="%s" content="%s" />' . "\n", esc_attr( $atributo ), esc_attr( $nombre ), esc_attr( $valor ) );
	}
	if ( ! has_site_icon() ) {
		printf( '<link rel="icon" href="%s" type="image/svg+xml" />' . "\n", esc_url( get_theme_file_uri( 'assets/img/seo/favicon.svg' ) ) );
		printf( '<link rel="apple-touch-icon" href="%s" />' . "\n", esc_url( get_theme_file_uri( 'assets/img/seo/apple-touch-icon.png' ) ) );
	}
}
add_action( 'wp_head', 'lapaz_print_meta', 2 );

/**
 * Sitemap solo con páginas: no hay blog, y los CPT no tienen URL propia.
 *
 * @param array<string, WP_Post_Type> $tipos Tipos de contenido del sitemap.
 * @return array<string, WP_Post_Type>
 */
function lapaz_sitemap_post_types( array $tipos ): array {
	return array_intersect_key( $tipos, array( 'page' => true ) );
}
add_filter( 'wp_sitemaps_post_types', 'lapaz_sitemap_post_types' );

/**
 * Sin sitemaps de usuarios ni de taxonomías: el sitio no tiene esas páginas.
 *
 * @param mixed  $provider Proveedor.
 * @param string $name     Nombre del proveedor.
 * @return mixed
 */
function lapaz_sitemap_providers( mixed $provider, string $name ): mixed {
	return in_array( $name, array( 'users', 'taxonomies' ), true ) ? false : $provider;
}
add_filter( 'wp_sitemaps_add_provider', 'lapaz_sitemap_providers', 10, 2 );

/**
 * Las imágenes JPEG que se suben generan sus tamaños en WebP (más livianos, mismo aspecto).
 *
 * @param array<string, string> $formatos Formato de salida por tipo MIME.
 * @return array<string, string>
 */
function lapaz_image_output_format( array $formatos ): array {
	$formatos['image/jpeg'] = 'image/webp';

	return $formatos;
}
add_filter( 'image_editor_output_format', 'lapaz_image_output_format' );

/**
 * Sin el script y el CSS de emojis del core: el sitio no los usa y bloquean el <head>.
 */
function lapaz_sin_emojis(): void {
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
	remove_action( 'admin_print_styles', 'print_emoji_styles' );
}
add_action( 'init', 'lapaz_sin_emojis' );

/**
 * Fuera de producción (local, staging), noindex: un staging indexado compite con el sitio real.
 *
 * @param array<string, bool|string> $robots Directivas.
 * @return array<string, bool|string>
 */
function lapaz_noindex_fuera_de_produccion( array $robots ): array {
	if ( 'production' !== wp_get_environment_type() ) {
		$robots['noindex']  = true;
		$robots['nofollow'] = true;
	}

	return $robots;
}
add_filter( 'wp_robots', 'lapaz_noindex_fuera_de_produccion' );
