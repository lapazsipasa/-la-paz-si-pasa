<?php
/**
 * Plugin Name: La Paz Sí Pasa · Seguridad
 * Description: Evita enumerar usuarios (login, REST y archivos de autor), exige sesión para la API REST, desactiva las contraseñas de aplicación, mantiene los productores fuera de la API REST y cierra los scripts en línea del cuerpo (CSP). El resto del endurecimiento
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

/**
 * La API REST solo para usuarios con sesión. El sitio público no la consume (el catálogo navega con
 * el router de la Interactivity API, que pide HTML) y anónima entregaba medios, tipos y autores.
 * Prioridad 101: después de rest_cookie_check_errors (100), que descarta al usuario de una cookie
 * sin nonce; así una cookie sin nonce tampoco pasa. El editor y el Editor del sitio envían nonce.
 *
 * @param mixed $resultado Resultado previo de la autenticación REST.
 * @return mixed
 */
function lapaz_rest_requiere_sesion( $resultado ) {
	// El filtro de cookies de WordPress devuelve true también para anónimos: se mira la sesión, no ese valor.
	if ( is_wp_error( $resultado ) || is_user_logged_in() ) {
		return $resultado;
	}

	return new WP_Error(
		'lapaz_rest_requiere_sesion',
		__( 'La API REST requiere sesión.', 'lapaz' ),
		array( 'status' => 401 )
	);
}
add_filter( 'rest_authentication_errors', 'lapaz_rest_requiere_sesion', 101 );

/**
 * Respuesta oEmbed sin nombre ni enlace del autor (la ruta ya exige sesión; esto cubre cualquier otro camino).
 *
 * @param array<string, mixed> $datos Respuesta oEmbed.
 * @return array<string, mixed>
 */
function lapaz_oembed_sin_autor( array $datos ): array {
	unset( $datos['author_name'], $datos['author_url'] );

	return $datos;
}
add_filter( 'oembed_response_data', 'lapaz_oembed_sin_autor' );

// Mismo mensaje con usuario inexistente que con contraseña errónea: no revela qué usuarios existen.
add_filter(
	'login_errors',
	static fn (): string => __( 'Credenciales incorrectas.', 'lapaz' )
);

// Sin contraseñas de aplicación: ningún cliente externo usa la API y serían acceso persistente.
add_filter( 'wp_is_application_passwords_available', '__return_false' );

/**
 * Segunda CSP, sin 'unsafe-inline', al final del <head>. Apache la envía con 'unsafe-inline' porque
 * WordPress imprime en el <head> el import map sin nonce (y un nonce por petición no sirve con la caché
 * de página). Las políticas se suman: desde esta <meta>, ningún script en línea corre, ni en el contenido
 * ni inyectado después (tampoco javascript:). Es fija, así que la caché la guarda igual. '*' no abre nada:
 * los dominios los sigue limitando la cabecera de Apache. Sin la <meta> para quien ve Query Monitor (solo en
 * local): su panel imprime datos en un script en línea.
 */
function lapaz_csp_sin_scripts_en_linea(): void {
	if ( current_user_can( 'view_query_monitor' ) ) {
		return;
	}
	echo '<meta http-equiv="Content-Security-Policy" content="script-src * \'wasm-unsafe-eval\'">' . "\n";
}
add_action( 'wp_head', 'lapaz_csp_sin_scripts_en_linea', PHP_INT_MAX );

// Las reglas de especulación son un script en línea: pasan del pie al <head>, antes de esa <meta>.
remove_action( 'wp_footer', 'wp_print_speculation_rules' );
add_action( 'wp_head', 'wp_print_speculation_rules' );
