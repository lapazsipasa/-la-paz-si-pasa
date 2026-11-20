<?php
/**
 * Plugin Name: La Paz Sí Pasa · Seguridad
 * Description: Evita enumerar usuarios (REST y archivos de autor) y mantiene los productores fuera de la API REST. El resto del endurecimiento
 *              vive en la imagen (Apache, PHP, wp-config) para que aplique antes de WordPress.
 * Version: 0.1.0
 * Author: William Moreno
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * /wp/v2/users solo para usuarios conectados: sin sesión revelaba los nombres de usuario
 * (la mitad de un intento de login). El editor de bloques sigue funcionando porque va con sesión.
 *
 * @param array<string, mixed> $endpoints Rutas de la API REST.
 * @return array<string, mixed>
 */
function lapaz_rest_sin_usuarios( array $endpoints ): array {
	if ( is_user_logged_in() ) {
		return $endpoints;
	}
	foreach ( array_keys( $endpoints ) as $ruta ) {
		if ( str_starts_with( $ruta, '/wp/v2/users' ) ) {
			unset( $endpoints[ $ruta ] );
		}
	}

	return $endpoints;
}
add_filter( 'rest_endpoints', 'lapaz_rest_sin_usuarios' );

/**
 * ?author=N y /author/<usuario>/ también revelan nombres de usuario. El sitio no tiene
 * archivos de autor: van al inicio.
 */
function lapaz_sin_archivos_de_autor(): void {
	if ( is_author() || isset( $_GET['author'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- solo se lee para redirigir.
		wp_safe_redirect( home_url( '/' ), 301 );
		exit;
	}
}
add_action( 'template_redirect', 'lapaz_sin_archivos_de_autor', 1 );

/**
 * Productores y sus taxonomías (incluida «poblacion») nunca van por REST: el sitio decidió no
 * mostrar esos datos y la API los entregaría completos. Aplica aunque un grupo, tipo o taxonomía
 * se importe desde el panel de SCF con show_in_rest activo.
 *
 * @param array<string, mixed> $args Argumentos de registro.
 * @param string               $nombre Slug del tipo o la taxonomía.
 * @return array<string, mixed>
 */
function lapaz_sin_rest_productores( array $args, string $nombre ): array {
	if ( in_array( $nombre, array( 'productor', 'departamento', 'categoria_productor', 'tiempo_operacion', 'etnia', 'poblacion' ), true ) ) {
		$args['show_in_rest'] = false;
	}

	return $args;
}
add_filter( 'register_post_type_args', 'lapaz_sin_rest_productores', 10, 2 );
add_filter( 'register_taxonomy_args', 'lapaz_sin_rest_productores', 10, 2 );
