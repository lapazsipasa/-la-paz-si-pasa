<?php
/**
 * Historias PaisSana: datos de la historia del mes para los bloques lapaz/historia y lapaz/historia-destacada.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;


/**
 * ID de la historia publicada más reciente (0 si no hay ninguna).
 */
function lapaz_historia_reciente(): int {
	$ids = get_posts(
		array(
			'post_type'      => 'historia',
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			'fields'         => 'ids',
			'no_found_rows'  => true,
		)
	);

	return (int) ( $ids[0] ?? 0 );
}

/**
 * ID de adjunto de un valor de campo SCF (ID, array con `ID` o URL); 0 si no hay.
 *
 * @param mixed $valor Valor del campo.
 */
function lapaz_historia_adjunto( mixed $valor ): int {
	if ( is_array( $valor ) && is_numeric( $valor['ID'] ?? null ) ) {
		return (int) $valor['ID'];
	}
	if ( is_numeric( $valor ) ) {
		return (int) $valor;
	}

	return is_string( $valor ) && '' !== $valor ? attachment_url_to_postid( $valor ) : 0;
}

/**
 * Filas de un repetidor como pares [rótulo, valor], sin las filas con valor vacío.
 *
 * @param mixed  $filas  Valor del repetidor.
 * @param string $rotulo Subcampo del rótulo.
 * @param string $valor  Subcampo del valor.
 * @return list<array{0: string, 1: string}>
 */
function lapaz_historia_pares( mixed $filas, string $rotulo, string $valor ): array {
	$pares = array();
	foreach ( is_array( $filas ) ? $filas : array() as $fila ) {
		if ( is_array( $fila ) && is_string( $fila[ $valor ] ?? null ) && '' !== trim( $fila[ $valor ] ) ) {
			$pares[] = array( is_string( $fila[ $rotulo ] ?? null ) ? $fila[ $rotulo ] : '', $fila[ $valor ] );
		}
	}

	return $pares;
}

/**
 * Campo de texto de un array (p. ej. del grupo `cronica`); '' si no es texto.
 *
 * @param mixed  $datos Array de campos.
 * @param string $clave Clave.
 */
function lapaz_historia_texto( mixed $datos, string $clave ): string {
	return is_array( $datos ) && is_string( $datos[ $clave ] ?? null ) ? $datos[ $clave ] : '';
}

/**
 * Video de la historia según `video_fuente`. `fuente` es ninguno (sin sección), youtube,
 * archivo o enlace; en YouTube `url` es el embed de youtube-nocookie y el póster cae a la
 * miniatura de YouTube si el editor no subió uno.
 *
 * @param int $post_id Historia.
 * @return array{fuente: string, url: string, poster_id: int, poster_url: string}
 */
function lapaz_historia_video( int $post_id ): array {
	$ninguno   = array(
		'fuente'     => 'ninguno',
		'url'        => '',
		'poster_id'  => 0,
		'poster_url' => '',
	);
	$fuente    = lapaz_field_text( 'video_fuente', $post_id );
	$poster_id = lapaz_field_image_id( 'video_poster', $post_id );
	$poster_id = $poster_id > 0 && wp_attachment_is_image( $poster_id ) ? $poster_id : 0;
	$url       = '';
	$poster    = '';

	if ( 'youtube' === $fuente ) {
		$source = lapaz_video_source( lapaz_field_text( 'video_youtube', $post_id ), '' );
		$url    = $source['video_url'];
		$poster = $source['thumbnail_url'];
	} elseif ( 'archivo' === $fuente ) {
		$archivo = lapaz_field_image_id( 'video_archivo', $post_id );
		$url     = $archivo > 0 && str_starts_with( (string) get_post_mime_type( $archivo ), 'video/' ) ? (string) wp_get_attachment_url( $archivo ) : '';
	} elseif ( 'enlace' === $fuente ) {
		$url = esc_url_raw( lapaz_field_text( 'video_enlace', $post_id ), array( 'https' ) );
	}

	return '' === $url ? $ninguno : array(
		'fuente'     => $fuente,
		'url'        => $url,
		'poster_id'  => $poster_id,
		'poster_url' => $poster_id > 0 ? '' : $poster,
	);
}

/**
 * Fotos de la galería: pie = leyenda del adjunto, crédito = su descripción.
 *
 * @param int $post_id Historia.
 * @return list<array{id: int, alt: string, pie: string, credito: string, grande: string}>
 */
function lapaz_historia_galeria( int $post_id ): array {
	$ids   = function_exists( 'get_field' ) ? get_field( 'galeria', $post_id ) : array();
	$fotos = array();
	foreach ( is_array( $ids ) ? $ids : array() as $valor ) {
		$id     = lapaz_historia_adjunto( $valor );
		$grande = $id > 0 ? wp_get_attachment_image_url( $id, '1536x1536' ) : false;
		if ( false === $grande ) {
			continue;
		}
		$leyenda = wp_get_attachment_caption( $id );
		$pie     = trim( wp_strip_all_tags( is_string( $leyenda ) ? $leyenda : '' ) );
		$meta    = get_post_meta( $id, '_wp_attachment_image_alt', true );
		$alt     = trim( is_string( $meta ) ? $meta : '' );
		$fotos[] = array(
			'id'      => $id,
			'alt'     => '' !== $alt ? $alt : $pie,
			'pie'     => $pie,
			'credito' => trim( wp_strip_all_tags( get_post_field( 'post_content', $id ) ) ),
			'grande'  => $grande,
		);
	}

	return $fotos;
}

/**
 * Crónica (grupo `cronica`, molde Artículo) normalizada para pintarla.
 *
 * @param int $post_id Historia.
 * @return array{bajada: string, entradilla: string, cuerpo: string, fuente: string, fotos: list<array{id: int, credito: string}>, ficha: list<array{0: string, 1: string}>}
 */
function lapaz_historia_cronica( int $post_id ): array {
	$c     = function_exists( 'get_field' ) ? get_field( 'cronica', $post_id ) : array();
	$fotos = array();
	foreach ( is_array( $c ) && is_array( $c['fotos'] ?? null ) ? $c['fotos'] : array() as $fila ) {
		$id = is_array( $fila ) ? lapaz_historia_adjunto( $fila['imagen'] ?? null ) : 0;
		if ( $id > 0 && wp_attachment_is_image( $id ) ) {
			$fotos[] = array(
				'id'      => $id,
				'credito' => lapaz_historia_texto( $fila, 'credito' ),
			);
		}
	}

	return array(
		'bajada'     => lapaz_historia_texto( $c, 'bajada' ),
		'entradilla' => lapaz_historia_texto( $c, 'entradilla' ),
		'cuerpo'     => lapaz_historia_texto( $c, 'cuerpo' ),
		'fuente'     => lapaz_field_text( 'cronica_fuente', $post_id ),
		'fotos'      => $fotos,
		'ficha'      => lapaz_historia_pares( is_array( $c ) ? ( $c['ficha_datos'] ?? null ) : null, 'cifra', 'texto' ),
	);
}

/**
 * `<figure>` de una foto de la crónica, con su crédito si lo tiene.
 *
 * @param array{id: int, credito: string} $foto Foto.
 */
function lapaz_historia_foto_cronica( array $foto ): string {
	$imagen  = wp_get_attachment_image(
		$foto['id'],
		'large',
		false,
		array(
			'loading' => 'lazy',
			'sizes'   => '(min-width: 850px) 380px, 100vw',
		)
	);
	$credito = '' !== $foto['credito'] ? '<figcaption class="credito">' . esc_html( $foto['credito'] ) . '</figcaption>' : '';

	return '<figure>' . $imagen . $credito . '</figure>';
}

/**
 * Pares [rótulo, valor] de un repetidor SCF de la historia, sin las filas vacías.
 *
 * @param string $campo  Nombre del repetidor.
 * @param int    $post_id Historia.
 * @param string $rotulo Subcampo del rótulo.
 * @param string $valor  Subcampo del valor.
 * @return list<array{0: string, 1: string}>
 */
function lapaz_historia_campo_pares( string $campo, int $post_id, string $rotulo, string $valor ): array {
	return lapaz_historia_pares( function_exists( 'get_field' ) ? get_field( $campo, $post_id ) : null, $rotulo, $valor );
}
