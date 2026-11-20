<?php
/**
 * Plugin Name: La Paz Sí Pasa · Catálogo
 * Description: Texto de búsqueda de cada productor PaisSana. La búsqueda nativa (`s`) mira título y
 *              contenido, no campos ni términos: al guardar un productor se escriben en post_content
 *              su municipio, departamento, categorías y productos. El editor no ve ese campo.
 * Version: 0.1.0
 * Author: William Moreno
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Guarda en post_content el texto de búsqueda del productor. El seed la llama tras crear cada
 * productor; desde el admin se llama al terminar el guardado (campos SCF y términos ya escritos).
 *
 * @param int $post_id Productor.
 */
function lapaz_catalogo_indexar( int $post_id ): void {
	static $guardando = false;

	$post = get_post( $post_id );
	if ( $guardando || ! $post instanceof WP_Post || 'productor' !== $post->post_type ) {
		return;
	}

	$partes = array();
	foreach ( array( 'municipio', 'productos' ) as $campo ) {
		$valor    = function_exists( 'get_field' ) ? get_field( $campo, $post_id, false ) : get_post_meta( $post_id, $campo, true );
		$partes[] = is_string( $valor ) ? $valor : '';
	}
	foreach ( array( 'departamento', 'categoria_productor' ) as $taxonomy ) {
		$terms = wp_get_object_terms( $post_id, $taxonomy, array( 'fields' => 'names' ) );
		if ( is_array( $terms ) ) {
			$partes[] = implode( "\n", array_map( 'strval', $terms ) );
		}
	}

	$texto = trim( implode( "\n", array_filter( array_map( 'trim', $partes ) ) ) );
	if ( $texto === $post->post_content ) {
		return;
	}

	// El guardado vuelve a disparar wp_after_insert_post: la bandera evita el bucle.
	$guardando = true;
	wp_update_post(
		array(
			'ID'           => $post_id,
			'post_content' => $texto,
		)
	);
	$guardando = false;
}

/**
 * Reindexa al terminar cualquier guardado de un productor (admin, editor de bloques, REST).
 * wp_after_insert_post llega después de save_post, donde SCF escribe sus campos.
 *
 * @param int     $post_id Entrada.
 * @param WP_Post $post    Entrada.
 */
function lapaz_catalogo_al_guardar( int $post_id, WP_Post $post ): void {
	if ( 'productor' === $post->post_type && ! wp_is_post_revision( $post_id ) && ! wp_is_post_autosave( $post_id ) ) {
		lapaz_catalogo_indexar( $post_id );
	}
}
add_action( 'wp_after_insert_post', 'lapaz_catalogo_al_guardar', 10, 2 );
