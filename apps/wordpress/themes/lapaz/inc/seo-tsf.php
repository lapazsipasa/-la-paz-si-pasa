<?php
/**
 * The SEO Framework (`autodescription`): título, descripción, imagen, canónica y robots por
 * defecto, caja reducida para quien edita y JSON-LD sin la búsqueda falsa. Lo que el editor
 * escribe en la caja siempre gana. Sin el plugin no hace nada: el respaldo vive en `seo.php`.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'THE_SEO_FRAMEWORK_PRESENT' ) ) {
	return; // Los plugins cargan antes que el tema: aquí ya se sabe si está activo.
}

/**
 * Entrada que describe una consulta del plugin: la de `$args['id']`, o la de la página actual
 * (en /boletin/ y /historias/, la que el archivo muestra). 0 si no hay.
 *
 * @param array<mixed>|null $args Consulta del plugin; null es la página actual.
 */
function lapaz_tsf_id( ?array $args ): int {
	if ( null !== $args ) {
		return is_numeric( $args['id'] ?? null ) ? (int) $args['id'] : 0;
	}
	if ( is_post_type_archive( 'boletin' ) ) {
		return lapaz_boletin_mostrado();
	}
	if ( is_post_type_archive( 'historia' ) ) {
		return lapaz_historia_mostrada();
	}

	return is_singular() ? get_queried_object_id() : 0;
}

/**
 * Lo que el editor escribió en la caja de SEO de la entrada que muestra /boletin/ o /historias/
 * (el plugin solo lee esa caja en la página de la entrada). '' si no hay o no es ese archivo.
 *
 * @param array<mixed>|null $args  Consulta del plugin.
 * @param string            $clave Metadato de la caja.
 */
function lapaz_tsf_editor( ?array $args, string $clave ): string {
	$id = is_post_type_archive( array( 'boletin', 'historia' ) ) ? lapaz_tsf_id( $args ) : 0;
	$v  = null === $args && $id > 0 ? get_post_meta( $id, $clave, true ) : '';

	return is_string( $v ) ? trim( $v ) : '';
}

/**
 * Si la consulta es la portada.
 *
 * @param array<mixed>|null $args Consulta del plugin.
 */
function lapaz_tsf_es_portada( ?array $args ): bool {
	$inicio = get_option( 'page_on_front' );

	return is_numeric( $inicio ) && (int) $inicio > 0 && lapaz_tsf_id( $args ) === (int) $inicio;
}

/**
 * Título por defecto (el del editor lo sustituye): como el que daba el tema.
 *
 * @param string            $titulo Título generado.
 * @param array<mixed>|null $args   Consulta del plugin.
 */
function lapaz_tsf_titulo( string $titulo, ?array $args ): string {
	if ( null === $args && is_404() ) {
		return __( 'Página no encontrada', 'lapaz' );
	}
	if ( lapaz_tsf_es_portada( $args ) ) {
		return 'La Paz Sí Pasa | ' . __( 'Fondo Colombia en Paz', 'lapaz' ); // Completo: va sin la marca del plugin.
	}
	if ( isset( $args['pta'] ) ) {
		return $titulo; // Miga «Boletín»: no se llama como la edición.
	}
	$id   = lapaz_tsf_id( $args );
	$tipo = $id > 0 ? get_post_type( $id ) : false;
	$mio  = lapaz_tsf_editor( $args, '_genesis_title' );
	if ( '' !== $mio ) {
		return $mio;
	}
	if ( 'boletin' === $tipo ) {
		return lapaz_boletin_titulo( $id );
	}
	if ( 'historia' === $tipo ) {
		return get_the_title( $id );
	}
	if ( 'page' === $tipo && 'proyectos-destacados' === get_post_field( 'post_name', $id ) ) {
		return __( 'PaisSana, proyectos destacados', 'lapaz' );
	}

	return $titulo;
}
add_filter( 'the_seo_framework_title_from_generation', 'lapaz_tsf_titulo', 10, 2 );

/**
 * La portada ya lleva el nombre y el lema en su título: sin «| Nombre del sitio» detrás.
 *
 * @param bool              $usar Si se añade la marca.
 * @param array<mixed>|null $args Consulta del plugin.
 */
function lapaz_tsf_marca( bool $usar, ?array $args ): bool {
	return $usar && ! lapaz_tsf_es_portada( $args );
}
add_filter( 'the_seo_framework_use_title_branding', 'lapaz_tsf_marca', 10, 2 );

// Separador «|» del título, sin depender del ajuste del plugin.
add_filter( 'the_seo_framework_title_separator', static fn (): string => '|' );

/**
 * Descripción por defecto: sumario del boletín, resumen de la historia, extracto de la página o la general.
 *
 * @param string            $descripcion Descripción generada.
 * @param array<mixed>|null $args        Consulta del plugin.
 */
function lapaz_tsf_descripcion( string $descripcion, ?array $args ): string {
	$id    = lapaz_tsf_id( $args );
	$tipo  = $id > 0 ? get_post_type( $id ) : false;
	$texto = lapaz_tsf_editor( $args, '_genesis_description' );
	if ( '' !== $texto ) {
		$tipo = false; // Gana la del editor.
	}
	if ( 'boletin' === $tipo ) {
		$texto = lapaz_field_text( 'portada_sumario', $id );
	} elseif ( 'historia' === $tipo ) {
		$texto = mb_strimwidth( wp_strip_all_tags( lapaz_field_text( 'resumen', $id ) ), 0, 155, '…' );
	} elseif ( 'page' === $tipo ) {
		$texto = get_post_field( 'post_excerpt', $id );
	}
	if ( '' !== $texto ) {
		return wp_strip_all_tags( $texto );
	}
	if ( null === $args && is_404() ) {
		return __( 'La página que buscas no existe o cambió de dirección. Vuelve al inicio para conocer la gestión del Fondo Colombia en Paz en los territorios.', 'lapaz' );
	}
	if ( $id > 0 && 'proyectos-destacados' === get_post_field( 'post_name', $id ) ) {
		return __( 'PaisSana reúne a las familias productoras de los territorios PDET: mapas por región, relatos en audio, ferias y videos del café, el cacao y las artesanías.', 'lapaz' );
	}

	return __( 'El Fondo Colombia en Paz ejecuta los recursos para implementar la paz: conoce las subcuentas, las cifras de gestión y las historias de los territorios PDET.', 'lapaz' );
}
add_filter( 'the_seo_framework_generated_description', 'lapaz_tsf_descripcion', 10, 2 );

/**
 * Imagen para compartir: la de la caja del editor (en los archivos), la foto de portada o la general.
 *
 * @param array<mixed>      $detalles Imágenes generadas.
 * @param array<mixed>|null $args     Consulta del plugin.
 * @param bool              $unica    Si se pide una sola.
 * @param string            $contexto Para qué se pide ('social', 'organization', 'oembed').
 * @return array<mixed>
 */
function lapaz_tsf_imagen( array $detalles, ?array $args, bool $unica, string $contexto ): array {
	if ( 'social' !== $contexto ) {
		return $detalles;
	}
	$id   = lapaz_tsf_id( $args );
	$tipo = $id > 0 ? get_post_type( $id ) : false;
	$url  = lapaz_tsf_editor( $args, '_social_image_url' );
	$foto = get_post_meta( $id, '_social_image_id', true );
	$foto = is_numeric( $foto ) ? (int) $foto : 0;
	if ( '' === $url ) {
		$foto = 'boletin' === $tipo || 'historia' === $tipo ? lapaz_field_image_id( 'portada_foto', $id ) : 0;
		$foto = 'historia' === $tipo && 0 === $foto ? lapaz_field_image_id( 'foto', $id ) : $foto;
	}
	$d   = $foto > 0 ? wp_get_attachment_image_src( $foto, 'full' ) : false;
	$d   = is_array( $d ) ? $d : array( '', 1200, 630 );
	$alt = 'boletin' === $tipo ? lapaz_field_text( 'portada_titular', $id ) : get_the_title( $id );
	$url = '' !== $url ? $url : (string) $d[0];
	if ( '' === $url ) {
		list( $url, $foto, $alt ) = array( get_theme_file_uri( 'assets/img/seo/og.jpg' ), 0, __( 'La Paz Sí Pasa, pasa en los territorios', 'lapaz' ) );
	}

	return array(
		array(
			'url'      => $url,
			'id'       => $foto,
			'width'    => (int) $d[1],
			'height'   => (int) $d[2],
			'alt'      => $alt,
			'caption'  => '',
			'filesize' => 0,
		),
	);
}
add_filter( 'the_seo_framework_generated_image_details', 'lapaz_tsf_imagen', 10, 4 );

/**
 * Canónica de /boletin/ y /historias/: la edición o la historia que muestran.
 *
 * @param array<string, mixed> $meta Ajustes del archivo.
 * @param string               $tipo Tipo de contenido.
 * @return array<string, mixed>
 */
function lapaz_tsf_canonica_archivo( array $meta, string $tipo ): array {
	$id = 'boletin' === $tipo ? lapaz_boletin_mostrado() : ( 'historia' === $tipo ? lapaz_historia_mostrada() : 0 );
	if ( $id > 0 && empty( $meta['canonical'] ) ) {
		$meta['canonical'] = (string) get_permalink( $id );
	}

	return $meta;
}
add_filter( 'the_seo_framework_post_type_archive_meta', 'lapaz_tsf_canonica_archivo', 10, 2 );

/**
 * Robots: noindex y nofollow en la guía de estilos (también en el sitemap: el plugin pregunta por
 * entrada) y fuera de producción (solo con `$args` null: si no, el sitemap quedaría vacío); noindex
 * a secas en la búsqueda de /productores/. Filtros y `ver` no (su canónica es /productores/).
 *
 * @param array<string, string> $meta Directivas.
 * @param array<mixed>|null     $args Consulta del plugin.
 * @return array<string, string>
 */
function lapaz_tsf_robots( array $meta, ?array $args ): array {
	static $guia = null; // La guía se busca una sola vez por petición.
	if ( null === $guia ) {
		$pagina = get_page_by_path( LAPAZ_GUIA_SLUG );
		$guia   = $pagina instanceof WP_Post ? $pagina->ID : 0;
	}
	$oculto = ( $guia > 0 && lapaz_tsf_id( $args ) === $guia ) || ( null === $args && 'production' !== wp_get_environment_type() );
	if ( $oculto || ( null === $args && is_page( 'productores' ) && '' !== lapaz_catalogo_filtros()['buscar'] ) ) {
		$meta['noindex'] = 'noindex';
	}
	if ( $oculto ) {
		$meta['nofollow'] = 'nofollow';
	}

	return $meta;
}
add_filter( 'the_seo_framework_robots_meta_array', 'lapaz_tsf_robots', 10, 2 );

/**
 * Sin la acción de búsqueda del JSON-LD: el sitio no tiene buscador propio.
 *
 * @param array<mixed> $grafo Entidades del JSON-LD.
 * @return array<mixed>
 */
function lapaz_tsf_sin_busqueda( array $grafo ): array {
	return array_map( static fn ( $e ) => is_array( $e ) ? array_diff_key( $e, array( 'potentialAction' => 1 ) ) : $e, $grafo );
}
add_filter( 'the_seo_framework_schema_graph_data', 'lapaz_tsf_sin_busqueda' );

/**
 * `og:locale` con el idioma del sitio (es_CO): el plugin lo reduce a es_ES.
 *
 * @param array<mixed> $etiquetas Etiquetas que se van a imprimir.
 * @return array<mixed>
 */
function lapaz_tsf_locale( array $etiquetas ): array {
	$locale = $etiquetas['og:locale'] ?? null;
	if ( is_array( $locale ) && is_array( $locale['attributes'] ?? null ) ) {
		$locale['attributes']['content'] = get_locale();
		$etiquetas['og:locale']          = $locale;
	}

	return $etiquetas;
}
add_filter( 'the_seo_framework_meta_render_data', 'lapaz_tsf_locale' );

/**
 * Caja reducida para quien no administra: sin la pestaña de visibilidad (noindex, canónica,
 * redirección) y sin los campos sociales sueltos (CSS). El filtro solo corre al pintar la caja,
 * así que el CSS solo sale en las pantallas de edición.
 *
 * @param array<string, mixed> $pestanas Pestañas de la caja.
 * @return array<string, mixed>
 */
function lapaz_tsf_pestanas( array $pestanas ): array {
	if ( ! current_user_can( 'manage_options' ) ) {
		unset( $pestanas['visibility'] );
		echo '<style>.tsf-flex-setting:has(#autodescription_og_title,#autodescription_og_description,#autodescription_twitter_title,#autodescription_twitter_description,#autodescription_twitter_card_type){display:none}</style>' . "\n";
	}

	return $pestanas;
}
add_filter( 'the_seo_framework_inpost_settings_tabs', 'lapaz_tsf_pestanas' );
