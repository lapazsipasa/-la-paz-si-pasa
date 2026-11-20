<?php
/**
 * SEO y rendimiento del <head> (port de BaseLayout.astro): título, descripción, Open Graph,
 * Twitter, íconos; sitemap con páginas, boletín e historias; WebP al subir; sin script de emojis.
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
 * Si la página es una edición del boletín o el archivo /boletin/ (que pinta la más reciente).
 */
function lapaz_es_boletin(): bool {
	return is_singular( 'boletin' ) || is_post_type_archive( 'boletin' );
}

/**
 * Si la página es una historia o el archivo /historias/ (que pinta la más reciente).
 */
function lapaz_es_historia(): bool {
	return is_singular( 'historia' ) || is_post_type_archive( 'historia' );
}

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
	} elseif ( lapaz_es_boletin() ) {
		$partes['title'] = lapaz_boletin_titulo( lapaz_boletin_mostrado() );
	} elseif ( is_post_type_archive( 'historia' ) && lapaz_historia_mostrada() > 0 ) {
		$partes['title'] = get_the_title( lapaz_historia_mostrada() );
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
	if ( lapaz_es_boletin() && lapaz_boletin_mostrado() > 0 ) {
		$sumario = lapaz_field_text( 'portada_sumario', lapaz_boletin_mostrado() );
		if ( '' !== $sumario ) {
			return wp_strip_all_tags( $sumario );
		}
	}
	if ( lapaz_es_historia() ) {
		$resumen = lapaz_field_text( 'resumen', lapaz_historia_mostrada() );
		if ( '' !== $resumen ) {
			return wp_strip_all_tags( $resumen );
		}
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
	$ancho       = 1200;
	$alto        = 630;
	$alt         = __( 'La Paz Sí Pasa, pasa en los territorios', 'lapaz' );
	$edicion     = lapaz_es_boletin() ? lapaz_boletin_mostrado() : 0;
	if ( $edicion > 0 ) {
		$url  = (string) get_permalink( $edicion );
		$foto = wp_get_attachment_image_src( lapaz_field_image_id( 'portada_foto', $edicion ), 'large' );
		if ( is_array( $foto ) ) {
			list( $imagen, $ancho, $alto ) = $foto;
			$alt                           = lapaz_field_text( 'portada_titular', $edicion );
		}
	}
	$tipo     = 'website';
	$historia = lapaz_es_historia() ? lapaz_historia_mostrada() : 0;
	if ( $historia > 0 ) {
		$tipo    = 'article';
		$url     = (string) get_permalink( $historia );
		$portada = lapaz_field_image_id( 'portada_foto', $historia );
		$foto    = wp_get_attachment_image_src( $portada > 0 ? $portada : lapaz_field_image_id( 'foto', $historia ), 'large' );
		if ( is_array( $foto ) ) {
			list( $imagen, $ancho, $alto ) = $foto;
			$alt                           = get_the_title( $historia );
		}
	}
	$meta = array(
		array( 'name', 'description', $descripcion ),
		array( 'property', 'og:type', $tipo ),
		array( 'property', 'og:site_name', 'La Paz Sí Pasa' ),
		array( 'property', 'og:locale', 'es_CO' ),
		array( 'property', 'og:url', $url ),
		array( 'property', 'og:title', $titulo ),
		array( 'property', 'og:description', $descripcion ),
		array( 'property', 'og:image', $imagen ),
		array( 'property', 'og:image:width', (string) $ancho ),
		array( 'property', 'og:image:height', (string) $alto ),
		array( 'property', 'og:image:alt', $alt ),
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
 * /boletin/ y /historias/ declaran como canónica la URL de la edición o la historia que muestran
 * (el core ya lo hace en cada una).
 */
function lapaz_archivo_canonical(): void {
	$edicion = is_post_type_archive( 'boletin' ) ? lapaz_boletin_mostrado() : 0;
	$edicion = is_post_type_archive( 'historia' ) ? lapaz_historia_mostrada() : $edicion;
	if ( $edicion > 0 ) {
		printf( '<link rel="canonical" href="%s" />' . "\n", esc_url( (string) get_permalink( $edicion ) ) );
	}
}
add_action( 'wp_head', 'lapaz_archivo_canonical', 3 );

/**
 * Sitemap con páginas, ediciones del boletín e historias: el resto de los CPT no tiene URL propia.
 *
 * @param array<string, WP_Post_Type> $tipos Tipos de contenido del sitemap.
 * @return array<string, WP_Post_Type>
 */
function lapaz_sitemap_post_types( array $tipos ): array {
	return array_intersect_key(
		$tipos,
		array(
			'page'     => true,
			'boletin'  => true,
			'historia' => true,
		)
	);
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
