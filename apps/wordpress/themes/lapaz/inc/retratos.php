<?php
/**
 * Datos del bloque lapaz/retratos.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Retratos publicados, en el orden del adapter de Astro (fecha, más reciente primero).
 * Mismos valores por defecto que mapRetrato.ts. Se omiten los que no tienen foto.
 *
 * @return list<array{foto_id: int, descripcion: string, proyecto: string, lugar: string}>
 */
function lapaz_get_retratos(): array {
	$post_ids = get_posts(
		array(
			'post_type'      => 'retrato',
			'post_status'    => 'publish',
			'posts_per_page' => 100,
			'fields'         => 'ids',
		)
	);

	$retratos = array();
	foreach ( $post_ids as $post_id ) {
		$foto_id = lapaz_field_image_id( 'foto', $post_id );
		// Si la foto se borró de la biblioteca, el retrato se omite entero: una foto
		// faltante desalinea fotos y textos del slider (los dos se indexan por data-slide).
		if ( $foto_id <= 0 || ! wp_attachment_is_image( $foto_id ) ) {
			continue;
		}
		$proyecto   = lapaz_field_text( 'proyecto', $post_id );
		$retratos[] = array(
			'foto_id'     => $foto_id,
			'descripcion' => lapaz_field_text( 'descripcion', $post_id ),
			'proyecto'    => '' !== $proyecto ? $proyecto : 'Colombia Sostenible',
			'lugar'       => lapaz_field_text( 'lugar', $post_id ),
		);
	}

	return $retratos;
}
