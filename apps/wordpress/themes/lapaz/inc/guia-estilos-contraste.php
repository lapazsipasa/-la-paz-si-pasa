<?php
/**
 * Guía de estilos: contraste WCAG de las combinaciones de color del sitio.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Luminancia relativa WCAG de un color #rgb o #rrggbb (null si no es hex).
 *
 * @param string $hex Color.
 */
function lapaz_guia_luminancia( string $hex ): ?float {
	if ( 1 !== preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{6})$/i', $hex, $m ) ) {
		return null;
	}
	$h = 3 === strlen( $m[1] ) ? preg_replace( '/./', '$0$0', $m[1] ) : $m[1];
	$l = 0.0;
	foreach ( array( 0.2126, 0.7152, 0.0722 ) as $i => $peso ) {
		$c  = hexdec( substr( (string) $h, $i * 2, 2 ) ) / 255;
		$l += $peso * ( $c <= 0.04045 ? $c / 12.92 : ( ( $c + 0.055 ) / 1.055 ) ** 2.4 );
	}
	return $l;
}

/**
 * Relación de contraste WCAG entre dos colores hex (null si alguno no es hex).
 *
 * @param string $a Color uno.
 * @param string $b Color dos.
 */
function lapaz_guia_contraste( string $a, string $b ): ?float {
	$la = lapaz_guia_luminancia( $a );
	$lb = lapaz_guia_luminancia( $b );
	if ( null === $la || null === $lb ) {
		return null;
	}
	return ( max( $la, $lb ) + 0.05 ) / ( min( $la, $lb ) + 0.05 );
}

/**
 * Combinaciones texto/fondo que se usan en el sitio (por slug de la paleta), con su contraste.
 *
 * @param list<array{nombre: string, slug: string, hex: string, var: string}> $colores Paleta.
 * @return list<array{texto: array{nombre: string, var: string}, fondo: array{nombre: string, var: string}, ratio: float, normal: bool, grande: bool}>
 */
function lapaz_guia_pares( array $colores ): array {
	$por_slug = array_column( $colores, null, 'slug' );
	// Fondo => textos que se prueban sobre él.
	$combos = array(
		'nav-text'      => array( 'surface', 'nav-bg-active', 'papel' ),
		'azul-noche'    => array( 'surface', 'nav-bg-active' ),
		'nav-bg-active' => array( 'nav-text', 'text', 'verde-texto', 'loquehacemos-bg', 'naranja' ),
		'surface'       => array( 'nav-text', 'text', 'verde-texto', 'loquehacemos-bg', 'naranja' ),
	);
	$pares  = array();
	foreach ( $combos as $fondo => $textos ) {
		foreach ( $textos as $texto ) {
			if ( ! isset( $por_slug[ $fondo ], $por_slug[ $texto ] ) ) {
				continue;
			}
			$ratio = lapaz_guia_contraste( $por_slug[ $texto ]['hex'], $por_slug[ $fondo ]['hex'] );
			if ( null !== $ratio ) {
				$pares[] = array(
					'texto'  => $por_slug[ $texto ],
					'fondo'  => $por_slug[ $fondo ],
					'ratio'  => $ratio,
					'normal' => $ratio >= 4.5,
					'grande' => $ratio >= 3.0,
				);
			}
		}
	}
	return $pares;
}
