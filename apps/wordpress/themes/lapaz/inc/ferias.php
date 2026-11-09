<?php
/**
 * Datos de las ferias PaisSana (CPT `feria`). Port de mapFeria.ts.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Ferias publicadas por `orden` (las que no tienen van al final), como getFerias() y mapFeria.ts.
 * Galería con alt «{título} {n}» si la foto no tiene; videos del repetidor `videos`, o de los
 * campos sueltos del esquema viejo si el repetidor está vacío.
 *
 * @return list<array{titulo: string, descripcion: string, galeria: list<array{id: int, alt: string}>, videos: list<array{url: string, fuente: string, alt: string, thumbnail: string, pie: string}>, abierta: bool}>
 */
function lapaz_get_ferias(): array {
	if ( ! function_exists( 'get_field' ) ) {
		return array();
	}
	$posts  = get_posts(
		array(
			'post_type'      => 'feria',
			'post_status'    => 'publish',
			'posts_per_page' => 100,
		)
	);
	$ferias = array();
	foreach ( $posts as $post ) {
		$titulo  = get_the_title( $post );
		$galeria = array();
		$fotos   = get_field( 'galeria', $post->ID );
		foreach ( is_array( $fotos ) ? array_values( $fotos ) : array() as $i => $foto ) {
			$id = is_array( $foto ) && is_numeric( $foto['ID'] ?? null ) ? (int) $foto['ID'] : ( is_numeric( $foto ) ? (int) $foto : 0 );
			if ( $id <= 0 || ! wp_attachment_is_image( $id ) ) {
				continue;
			}
			$alt       = is_array( $foto ) && is_string( $foto['alt'] ?? null ) ? $foto['alt'] : '';
			$galeria[] = array(
				'id'  => $id,
				'alt' => '' !== $alt ? $alt : sprintf( '%s %d', $titulo, $i + 1 ),
			);
		}
		$orden    = get_field( 'orden', $post->ID );
		$ferias[] = array(
			'titulo'      => $titulo,
			'descripcion' => lapaz_field_text( 'descripcion', $post->ID ),
			'galeria'     => $galeria,
			'videos'      => lapaz_feria_videos( $post->ID, $titulo ),
			'abierta'     => (bool) get_field( 'abierta_por_defecto', $post->ID ),
			'orden'       => is_numeric( $orden ) ? (int) $orden : PHP_INT_MAX,
		);
	}
	usort( $ferias, static fn( array $a, array $b ): int => $a['orden'] <=> $b['orden'] );

	return array_map(
		static function ( array $f ): array {
			unset( $f['orden'] );
			return $f;
		},
		$ferias
	);
}

/**
 * Videos de una feria (mapFeriaVideos): filas del repetidor o, si está vacío, los campos sueltos.
 *
 * @param int    $post_id Feria.
 * @param string $titulo  Título de la feria, para el alt.
 * @return list<array{url: string, fuente: string, alt: string, thumbnail: string, pie: string}>
 */
function lapaz_feria_videos( int $post_id, string $titulo ): array {
	$filas = get_field( 'videos', $post_id );
	if ( ! is_array( $filas ) || array() === $filas ) {
		$filas = array( get_fields( $post_id ) );
	}
	$filas  = array_values( array_filter( $filas, 'is_array' ) );
	$total  = count( $filas );
	$videos = array();
	foreach ( $filas as $i => $fila ) {
		$yt      = is_string( $fila['video_youtube'] ?? null ) ? $fila['video_youtube'] : '';
		$archivo = $fila['video_file'] ?? null;
		$file    = is_array( $archivo ) && is_string( $archivo['url'] ?? null ) ? $archivo['url'] : '';
		if ( '' === $yt && '' === $file ) {
			continue;
		}
		$source = lapaz_video_source( $yt, $file );
		if ( 'no-disponible' === $source['estado'] ) {
			continue;
		}
		$thumb    = $fila['thumbnail_video'] ?? null;
		$thumb_id = is_array( $thumb ) && is_numeric( $thumb['ID'] ?? null ) ? (int) $thumb['ID'] : 0;
		$thumb    = $thumb_id > 0 ? wp_get_attachment_image_url( $thumb_id, '1536x1536' ) : false;
		$videos[] = array(
			'url'       => $source['video_url'],
			'fuente'    => $source['fuente'],
			/* translators: 1: número del video, 2: total, 3: feria. */
			'alt'       => $total > 1 ? sprintf( __( 'Video %1$d de %2$d de %3$s', 'lapaz' ), $i + 1, $total, $titulo ) : sprintf( /* translators: %s: feria. */ __( 'Video %s', 'lapaz' ), $titulo ),
			'thumbnail' => is_string( $thumb ) ? $thumb : $source['thumbnail_url'],
			'pie'       => is_string( $fila['pie'] ?? null ) ? $fila['pie'] : '',
		);
	}

	return $videos;
}
