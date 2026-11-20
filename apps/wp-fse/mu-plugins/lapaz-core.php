<?php
/**
 * Plugin Name: La Paz Sí Pasa · Core
 * Description: Funcionalidad del sitio que no depende del tema: modelo de contenido SCF y medios.
 * Version: 0.1.0
 * Author: William Moreno
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * CPT del sitio: contenido que se pinta dentro de bloques, sin página propia.
 */
const LAPAZ_CPTS = array( 'retrato', 'subcuenta', 'noticia', 'video', 'audio_relato', 'feria' );

/**
 * Tope de 1500 px al subir imágenes (el de fábrica es 2560): ningún bloque sirve más ancho.
 */
function lapaz_big_image_threshold(): int {
	return 1500;
}
add_filter( 'big_image_size_threshold', 'lapaz_big_image_threshold' );

/**
 * SCF guarda y lee los CPT y campos desde wp-content/scf-json, versionado en el repo.
 */
function lapaz_scf_save_json(): string {
	return WP_CONTENT_DIR . '/scf-json';
}
add_filter( 'acf/settings/save_json', 'lapaz_scf_save_json' );

/**
 * Agrega wp-content/scf-json a las rutas de carga de SCF.
 *
 * @param mixed $paths Rutas de carga.
 * @return array<int|string, string>
 */
function lapaz_scf_load_json( mixed $paths ): array {
	$paths   = is_array( $paths ) ? array_filter( $paths, 'is_string' ) : array();
	$paths[] = WP_CONTENT_DIR . '/scf-json';
	// Grupos propios del sitio FSE (no los comparte el headless): apps/wp-fse/scf-json.
	$paths[] = WP_CONTENT_DIR . '/scf-json-lapaz';

	return array_unique( $paths );
}
add_filter( 'acf/settings/load_json', 'lapaz_scf_load_json' );

/**
 * Los CPT del sitio no tienen URL propia: sus entradas solo existen dentro de bloques.
 * Sin esto, /retrato/<slug>/ respondería con una plantilla vacía y entraría al sitemap.
 * Se hace aquí y no en scf-json/ para no cambiar los JSON que comparte el headless.
 *
 * @param array<string, mixed> $args      Argumentos del CPT.
 * @param string               $post_type Tipo de contenido.
 * @return array<string, mixed>
 */
function lapaz_cpt_sin_url_publica( array $args, string $post_type ): array {
	if ( in_array( $post_type, LAPAZ_CPTS, true ) ) {
		$args['publicly_queryable'] = false;
		$args['rewrite']            = false;
		$args['query_var']          = false;
		$args['has_archive']        = false;
	}

	return $args;
}
add_filter( 'register_post_type_args', 'lapaz_cpt_sin_url_publica', 10, 2 );

/**
 * Grupos de campos que solo aplican a una página concreta: la clave del grupo y cómo
 * reconocer la página. Los JSON los ubican en todas las páginas (y group_home es
 * compartido con el headless), así que se acotan aquí. SCF 6.9 no tiene
 * acf/load_field_group: se filtra la regla de ubicación.
 *
 * @param mixed $result      Si la regla coincide.
 * @param mixed $rule        Regla evaluada.
 * @param mixed $screen      Pantalla del editor (incluye post_id).
 * @param mixed $field_group Grupo de campos.
 */
function lapaz_grupos_por_pagina( mixed $result, mixed $rule, mixed $screen, mixed $field_group ): bool {
	$key = is_array( $field_group ) && is_string( $field_group['key'] ?? null ) ? $field_group['key'] : '';
	if ( ! $result || ! in_array( $key, array( 'group_home_lapazsipasa', 'group_proyectos_lapazsipasa' ), true ) ) {
		return (bool) $result;
	}
	$post_id = is_array( $screen ) && is_numeric( $screen['post_id'] ?? null ) ? (int) $screen['post_id'] : 0;
	if ( $post_id <= 0 ) {
		return false;
	}
	if ( 'group_home_lapazsipasa' === $key ) {
		$portada = get_option( 'page_on_front' );

		return is_numeric( $portada ) && $post_id === (int) $portada;
	}

	return 'proyectos-destacados' === get_post_field( 'post_name', $post_id );
}
add_filter( 'acf/location/match_rule', 'lapaz_grupos_por_pagina', 10, 4 );

/**
 * Contenido que alimenta tarjetas y cifras de otras páginas (Inicio, Proyectos destacados, el
 * catálogo): al publicarlo, cambiarlo o borrarlo hay que vaciar la caché de página.
 */
const LAPAZ_TIPOS_EN_CACHE = array( 'productor', 'boletin', 'historia', 'page', 'wp_navigation', ...LAPAZ_CPTS );

/**
 * Taxonomías del catálogo: renombrar o borrar un término cambia barras y nombres de las tarjetas.
 */
const LAPAZ_TAXONOMIAS_EN_CACHE = array( 'departamento', 'categoria_productor', 'tiempo_operacion', 'etnia' );

/**
 * Pide vaciar la caché de página al terminar la petición. Se vacía UNA vez por petición,
 * aunque se guarden muchas entradas (el seed de 316 productores).
 *
 * @param string $post_type Tipo de contenido que cambió.
 */
function lapaz_cache_marcar( string $post_type ): void {
	static $marcado = false;
	if ( ! $marcado && in_array( $post_type, LAPAZ_TIPOS_EN_CACHE, true ) ) {
		$marcado = true;
		add_action( 'shutdown', 'lapaz_cache_vaciar' );
	}
}

/**
 * Vacía la caché de WP Super Cache, solo si está activo.
 */
function lapaz_cache_vaciar(): void {
	if ( function_exists( 'wp_cache_clear_cache' ) ) {
		wp_cache_clear_cache();
	}
}

/**
 * Publicar, actualizar, despublicar o enviar a la papelera (WordPress lanza esta acción en cada guardado).
 *
 * @param string  $nuevo   Estado nuevo.
 * @param string  $antes   Estado anterior.
 * @param WP_Post $entrada Entrada.
 */
function lapaz_cache_al_cambiar_estado( string $nuevo, string $antes, WP_Post $entrada ): void {
	if ( 'publish' === $nuevo || 'publish' === $antes ) {
		lapaz_cache_marcar( $entrada->post_type );
	}
}
add_action( 'transition_post_status', 'lapaz_cache_al_cambiar_estado', 10, 3 );

/**
 * Borrado definitivo de una entrada publicada.
 *
 * @param int     $post_id Entrada.
 * @param WP_Post $entrada Entrada borrada.
 */
function lapaz_cache_al_borrar( int $post_id, WP_Post $entrada ): void {
	if ( 'publish' === $entrada->post_status ) {
		lapaz_cache_marcar( $entrada->post_type );
	}
}
add_action( 'deleted_post', 'lapaz_cache_al_borrar', 10, 2 );

/**
 * Crear, editar o borrar un término de las taxonomías del catálogo.
 *
 * @param int    $term_id  Término.
 * @param int    $tt_id    Término en la taxonomía.
 * @param string $taxonomy Taxonomía.
 */
function lapaz_cache_al_cambiar_termino( int $term_id, int $tt_id, string $taxonomy ): void {
	if ( in_array( $taxonomy, LAPAZ_TAXONOMIAS_EN_CACHE, true ) ) {
		lapaz_cache_marcar( 'productor' );
	}
}
add_action( 'created_term', 'lapaz_cache_al_cambiar_termino', 10, 3 );
add_action( 'edited_term', 'lapaz_cache_al_cambiar_termino', 10, 3 );
add_action( 'delete_term', 'lapaz_cache_al_cambiar_termino', 10, 3 );
