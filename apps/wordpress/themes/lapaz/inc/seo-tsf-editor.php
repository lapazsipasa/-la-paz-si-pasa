<?php
/**
 * The SEO Framework: la caja de SEO del editor. Quien no administra ve una caja reducida y no
 * cambia redirección, canónica ni robots. Sin el plugin no hace nada.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'THE_SEO_FRAMEWORK_PRESENT' ) ) {
	return; // Los plugins cargan antes que el tema: aquí ya se sabe si está activo.
}

/**
 * Caja reducida para quien no administra: sin la pestaña de visibilidad y sin los campos
 * sociales sueltos (CSS, en `lapaz_tsf_estilo_caja`).
 *
 * @param array<string, mixed> $pestanas Pestañas de la caja.
 * @return array<string, mixed>
 */
function lapaz_tsf_pestanas( array $pestanas ): array {
	if ( ! current_user_can( 'manage_options' ) ) {
		unset( $pestanas['visibility'] );
	}

	return $pestanas;
}
add_filter( 'the_seo_framework_inpost_settings_tabs', 'lapaz_tsf_pestanas' );

/** Oculta los campos sociales sueltos a quien no administra. */
function lapaz_tsf_estilo_caja(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		echo '<style>.tsf-flex-setting:has(#autodescription_og_title,#autodescription_og_description,#autodescription_twitter_title,#autodescription_twitter_description,#autodescription_twitter_card_type){display:none}</style>' . "\n";
	}
}
add_action( 'admin_head-post.php', 'lapaz_tsf_estilo_caja' );
add_action( 'admin_head-post-new.php', 'lapaz_tsf_estilo_caja' );

/**
 * Quien no administra no cambia redirección, canónica ni robots (el plugin borra lo vacío:
 * se devuelve lo ya guardado).
 *
 * @param array<string, mixed> $datos   Metadatos a guardar.
 * @param int                  $post_id Entrada.
 * @return array<string, mixed>
 */
function lapaz_tsf_bloquear_visibilidad( array $datos, int $post_id ): array {
	if ( ! current_user_can( 'manage_options' ) ) {
		foreach ( array( 'redirect', '_genesis_canonical_uri', '_genesis_noindex', '_genesis_nofollow', '_genesis_noarchive' ) as $clave ) {
			$guardado        = get_post_meta( $post_id, $clave, true );
			$datos[ $clave ] = '' === $guardado && str_starts_with( $clave, '_genesis_no' ) ? 0 : $guardado; // Robots: 0 es el valor por defecto.
		}
	}

	return $datos;
}
add_filter( 'the_seo_framework_save_post_meta', 'lapaz_tsf_bloquear_visibilidad', 10, 2 );
