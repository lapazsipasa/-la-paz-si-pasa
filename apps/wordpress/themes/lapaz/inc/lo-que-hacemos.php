<?php
/**
 * Datos del bloque lapaz/lo-que-hacemos: subcuentas, noticias y banner de prensa.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Subcuentas publicadas, por menu_order (como getSubcuentas()). Se omiten las que no tienen logo.
 *
 * @return list<array{nombre: string, icono_id: int}>
 */
function lapaz_get_subcuentas(): array {
	$posts = get_posts(
		array(
			'post_type'      => 'subcuenta',
			'post_status'    => 'publish',
			'posts_per_page' => 100,
			'orderby'        => 'menu_order',
			'order'          => 'ASC',
		)
	);

	$subcuentas = array();
	foreach ( $posts as $post ) {
		$icono_id = lapaz_field_image_id( 'icono', $post->ID );
		if ( $icono_id <= 0 || ! wp_attachment_is_image( $icono_id ) ) {
			continue;
		}
		$subcuentas[] = array(
			'nombre'   => get_the_title( $post ),
			'icono_id' => $icono_id,
		);
	}

	return $subcuentas;
}

/**
 * Noticias publicadas, de la más reciente a la más antigua por su fecha (como getNoticias()).
 * La fecha sale del campo SCF `fecha` o, si está vacío, de la fecha de la entrada.
 *
 * @return list<array{titulo: string, url: string, fecha: string}>
 */
function lapaz_get_noticias(): array {
	$posts = get_posts(
		array(
			'post_type'      => 'noticia',
			'post_status'    => 'publish',
			'posts_per_page' => 100,
		)
	);

	$noticias = array();
	foreach ( $posts as $post ) {
		$url = lapaz_field_text( 'url', $post->ID );
		if ( '' === $url ) {
			continue;
		}
		$fecha      = lapaz_fecha_iso( lapaz_field_text( 'fecha', $post->ID ) );
		$noticias[] = array(
			'titulo' => get_the_title( $post ),
			'url'    => $url,
			'fecha'  => '' !== $fecha ? $fecha : (string) get_the_date( 'Y-m-d', $post ),
		);
	}
	usort( $noticias, static fn( array $a, array $b ): int => strcmp( $b['fecha'], $a['fecha'] ) );

	return $noticias;
}

/**
 * Normaliza la fecha de SCF a YYYY-MM-DD, venga como Ymd o como Y-m-d (toIsoDate de Astro).
 *
 * @param string $fecha Fecha del campo.
 */
function lapaz_fecha_iso( string $fecha ): string {
	if ( 1 === preg_match( '/^(\d{4})-?(\d{2})-?(\d{2})/', $fecha, $m ) ) {
		return "{$m[1]}-{$m[2]}-{$m[3]}";
	}

	return '';
}

/**
 * Agrupa noticias por año, como máximo 3 por año, años de mayor a menor
 * (LoQueHacemosNoticiasTimeline.astro).
 *
 * @param list<array{titulo: string, url: string, fecha: string}> $noticias Noticias ordenadas.
 * @return array<string, list<array{titulo: string, url: string, fecha: string}>>
 */
function lapaz_noticias_por_anio( array $noticias ): array {
	$por_anio = array();
	foreach ( $noticias as $noticia ) {
		$anio = substr( $noticia['fecha'], 0, 4 );
		if ( 1 !== preg_match( '/^\d{4}$/', $anio ) ) {
			continue;
		}
		if ( count( $por_anio[ $anio ] ?? array() ) < 3 ) {
			$por_anio[ $anio ][] = $noticia;
		}
	}
	krsort( $por_anio, SORT_STRING );

	return $por_anio;
}

/**
 * URL del banner de prensa: campo noticias_cta_url de Inicio o la sala de prensa del fondo.
 */
function lapaz_noticias_cta_url(): string {
	$url = lapaz_front_page_id() > 0 ? lapaz_field_text( 'noticias_cta_url', lapaz_front_page_id() ) : '';

	return '' !== $url ? $url : 'https://fcp.gov.co/sala-de-prensa/';
}
