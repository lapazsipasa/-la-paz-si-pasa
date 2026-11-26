<?php
/**
 * Plugin Name: La Paz Sí Pasa · Manuales
 * Description: Enlaza en wp-admin el manual en PDF de cada tipo de contenido (caja «Ayuda» al editar y
 *              aviso en el listado). Los PDF van horneados en la imagen fuera del docroot y solo se
 *              sirven a quien puede editar.
 * Version: 0.1.0
 * Author: William Moreno
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Carpeta de los PDF en la imagen (apps/wp-fse/manuales/, copiada por el Dockerfile): fuera de /var/www/html.
 */
const LAPAZ_MANUALES_DIR = '/opt/lapaz/manuales';

/**
 * Tipo de contenido => [slug del manual, «¿Dudas con …?», nombre del manual]. El orden da el número
 * (01–10, el de TIPOS en generar-manual.py y el de las secciones del manual general; 00 es el general).
 */
const LAPAZ_MANUALES = array(
	'boletin'      => array( 'boletin', 'el boletín', 'Boletín' ),
	'historia'     => array( 'historia', 'la historia del mes', 'Historia del mes' ),
	'productor'    => array( 'productores', 'el catálogo de productores', 'Catálogo de productores' ),
	'noticia'      => array( 'noticias', 'las noticias', 'Noticias' ),
	'retrato'      => array( 'retratos', 'los retratos', 'Retratos de la Paz' ),
	'video'        => array( 'videos', 'los videos', 'Videos' ),
	'audio_relato' => array( 'relatos-sonoros', 'los relatos sonoros', 'Relatos sonoros' ),
	'feria'        => array( 'ferias', 'las ferias', 'Ferias' ),
	'subcuenta'    => array( 'subcuentas', 'las subcuentas', 'Subcuentas' ),
	'page'         => array( 'paginas', 'las páginas', 'Páginas Inicio y Proyectos destacados' ),
);

/**
 * Slug del manual => «06 · Videos» (número y nombre). Incluye el general (00).
 *
 * @return array<string, string>
 */
function lapaz_manuales_numerados(): array {
	$lista = array( 'general' => '00 · ' . __( 'Manual general', 'lapaz' ) );
	foreach ( array_values( LAPAZ_MANUALES ) as $i => [ $slug, , $nombre ] ) {
		$lista[ $slug ] = sprintf( '%02d · %s', $i + 1, $nombre );
	}

	return $lista;
}

/**
 * Enlace a un manual, «Manual 06 · Videos (PDF)», en pestaña nueva (avisado al lector de pantalla).
 *
 * @param string $slug Slug del manual.
 */
function lapaz_manual_enlace( string $slug ): string {
	return sprintf(
		'<a href="%s" target="_blank" rel="noopener">%s<span class="screen-reader-text"> %s</span></a>',
		esc_url( admin_url( 'admin-post.php?action=lapaz_manual&manual=' . $slug ) ),
		/* translators: %s: número y nombre del manual, por ejemplo «06 · Videos». */
		esc_html( sprintf( __( 'Manual %s (PDF)', 'lapaz' ), lapaz_manuales_numerados()[ $slug ] ?? '' ) ),
		esc_html__( '(se abre en una pestaña nueva)', 'lapaz' )
	);
}

/**
 * Caja lateral «Ayuda» al crear o editar (en el editor de bloques sale en la barra lateral).
 */
function lapaz_manual_registrar_caja(): void {
	add_meta_box( 'lapaz-ayuda', __( 'Ayuda', 'lapaz' ), 'lapaz_manual_caja', array_keys( LAPAZ_MANUALES ), 'side', 'high' );
}
add_action( 'add_meta_boxes', 'lapaz_manual_registrar_caja' );

/**
 * Contenido de la caja «Ayuda».
 *
 * @param WP_Post $post Entrada en edición.
 */
function lapaz_manual_caja( WP_Post $post ): void {
	[ $slug, $tema ] = LAPAZ_MANUALES[ $post->post_type ] ?? LAPAZ_MANUALES['page'];
	/* translators: %s: tipo de contenido, por ejemplo «los videos». */
	printf( '<p>%s</p>', esc_html( sprintf( __( '¿Dudas con %s?', 'lapaz' ), $tema ) ) );
	printf( '<p>%s</p>', lapaz_manual_enlace( $slug ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapado en lapaz_manual_enlace().
	printf( '<p>%s</p>', lapaz_manual_enlace( 'general' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapado en lapaz_manual_enlace().
}

/**
 * Aviso informativo, fijo, arriba del listado de cada tipo.
 */
function lapaz_manual_aviso(): void {
	$pantalla = get_current_screen();
	if ( ! $pantalla || 'edit' !== $pantalla->base || ! isset( LAPAZ_MANUALES[ $pantalla->post_type ] ) ) {
		return;
	}
	[ $slug, $tema ] = LAPAZ_MANUALES[ $pantalla->post_type ];
	printf(
		'<div class="notice notice-info lapaz-manual-aviso"><p>%s %s</p></div>',
		/* translators: %s: tipo de contenido, por ejemplo «los videos». */
		esc_html( sprintf( __( '¿Dudas con %s?', 'lapaz' ), $tema ) ),
		lapaz_manual_enlace( $slug ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escapado en lapaz_manual_enlace().
	);
}
add_action( 'admin_notices', 'lapaz_manual_aviso' );

/**
 * Sirve el PDF por admin-post.php: solo con sesión y permiso de edición, solo slugs de la lista.
 */
function lapaz_manual_servir(): void {
	if ( ! current_user_can( 'edit_posts' ) ) {
		wp_die( esc_html__( 'No tienes permiso para ver los manuales.', 'lapaz' ), '', array( 'response' => 403 ) );
	}
	// Solo lectura: sin nonce, como cualquier enlace de wp-admin que no cambia nada.
	$valor  = wp_unslash( $_GET['manual'] ?? '' ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- descarga de solo lectura; se sanea abajo.
	$pedido = is_string( $valor ) ? sanitize_key( $valor ) : '';
	$nombre = '';
	$ruta   = '';
	// La ruta sale de la lista, nunca de lo pedido: solo se compara.
	foreach ( lapaz_manuales_numerados() as $slug => $numerado ) {
		if ( $slug === $pedido ) {
			$nombre = $numerado;
			$ruta   = LAPAZ_MANUALES_DIR . '/' . $slug . '.pdf';
		}
	}
	if ( '' === $ruta || ! is_readable( $ruta ) ) {
		wp_die( esc_html__( 'Ese manual no existe.', 'lapaz' ), '', array( 'response' => 404 ) );
	}

	defined( 'DONOTCACHEPAGE' ) || define( 'DONOTCACHEPAGE', true ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedConstantFound -- constante de WP Super Cache: nunca a la caché.
	nocache_headers(); // Cache-Control: no-cache, must-revalidate, max-age=0, no-store, private.
	header( 'Content-Type: application/pdf' );
	// «06 - Videos - La Paz Si Pasa.pdf», como los archivos de raw/manual-editor/.
	header( 'Content-Disposition: inline; filename="' . remove_accents( str_replace( ' · ', ' - ', $nombre ) ) . ' - La Paz Si Pasa.pdf"' );
	// X-Content-Type-Options: nosniff ya lo pone Apache en toda respuesta (zz-lapaz-seguridad.conf); repetirlo lo duplica.
	header( 'Content-Length: ' . (string) filesize( $ruta ) );
	readfile( $ruta ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile -- PDF de la imagen, sin WP_Filesystem.
	exit;
}
add_action( 'admin_post_lapaz_manual', 'lapaz_manual_servir' );
// Sin sesión: al inicio de sesión, y de vuelta al PDF después.
add_action( 'admin_post_nopriv_lapaz_manual', 'auth_redirect' );
