<?php
/**
 * Plugin Name: La Paz Sí Pasa · Seguridad
 * Description: Evita enumerar usuarios (REST y archivos de autor). El resto del endurecimiento
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
