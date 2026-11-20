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

/**
 * Cola de productores por reindexar al final de la petición (una sola vez cada uno). Sirve
 * para los cambios que llegan fuera de un guardado completo (Edición rápida, REST, wp-cli) o
 * antes de que SCF escriba sus campos: en shutdown todo está escrito y, si el texto no
 * cambió, indexar no escribe nada.
 *
 * @param int $post_id Productor a anotar (0 solo lee la cola).
 * @return list<int> Productores en cola.
 */
function lapaz_catalogo_cola( int $post_id = 0 ): array {
	/**
	 * Productores en cola.
	 *
	 * @var array<int, true> $cola
	 */
	static $cola = array();

	if ( $post_id > 0 ) {
		if ( array() === $cola ) {
			add_action( 'shutdown', 'lapaz_catalogo_vaciar_cola' );
		}
		$cola[ $post_id ] = true;
	}

	return array_keys( $cola );
}

/**
 * Reindexa los productores en cola (acción shutdown).
 */
function lapaz_catalogo_vaciar_cola(): void {
	foreach ( lapaz_catalogo_cola() as $id ) {
		lapaz_catalogo_indexar( $id );
	}
}

/**
 * Cambio de términos del productor (departamento o categoría).
 *
 * @param int    $object_id Entrada.
 * @param mixed  $terms     Términos (no se usa).
 * @param mixed  $tt_ids    Ids de term_taxonomy (no se usa).
 * @param string $taxonomy  Taxonomía.
 */
function lapaz_catalogo_al_cambiar_terminos( int $object_id, mixed $terms, mixed $tt_ids, string $taxonomy ): void {
	if ( in_array( $taxonomy, array( 'departamento', 'categoria_productor' ), true ) && 'productor' === get_post_type( $object_id ) ) {
		lapaz_catalogo_cola( $object_id );
	}
}
add_action( 'set_object_terms', 'lapaz_catalogo_al_cambiar_terminos', 10, 4 );

/**
 * Guardado de campos SCF de un productor.
 *
 * @param int|string $post_id Entrada (o `options`, `user_1`…).
 */
function lapaz_catalogo_al_guardar_campos( int|string $post_id ): void {
	if ( is_numeric( $post_id ) && 'productor' === get_post_type( (int) $post_id ) ) {
		lapaz_catalogo_cola( (int) $post_id );
	}
}
add_action( 'acf/save_post', 'lapaz_catalogo_al_guardar_campos', 20 );
