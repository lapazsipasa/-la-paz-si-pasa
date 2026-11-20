<?php
/**
 * Guía de estilos viva: lee el sistema visual de theme.json en tiempo de ejecución.
 * Nada se copia a mano; si cambia theme.json, cambia la página.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

const LAPAZ_GUIA_SLUG = 'guia-de-estilos';

/**
 * Texto de un valor mixto ('' si no es cadena ni número).
 *
 * @param mixed $valor Valor.
 */
function lapaz_guia_texto( $valor ): string {
	return is_string( $valor ) || is_numeric( $valor ) ? (string) $valor : '';
}

/**
 * Ajustes globales del tema (theme.json fusionado con el usuario).
 *
 * @return array<mixed>
 */
function lapaz_guia_ajustes(): array {
	return (array) wp_get_global_settings();
}

/**
 * Lista del origen `theme` de un ajuste (paleta, familias, tamaños, espaciado).
 *
 * @param string ...$ruta Ruta dentro de los ajustes globales, p. ej. 'color', 'palette'.
 * @return list<array<mixed>>
 */
function lapaz_guia_lista( string ...$ruta ): array {
	$nodo = lapaz_guia_ajustes();
	foreach ( $ruta as $clave ) {
		$nodo = is_array( $nodo[ $clave ] ?? null ) ? $nodo[ $clave ] : array();
	}
	$lista = is_array( $nodo['theme'] ?? null ) ? $nodo['theme'] : array();
	$items = array();
	foreach ( $lista as $item ) {
		if ( is_array( $item ) ) {
			$items[] = $item;
		}
	}
	return $items;
}

/**
 * Colores de la paleta del tema.
 *
 * @return list<array{nombre: string, slug: string, hex: string, var: string}>
 */
function lapaz_guia_colores(): array {
	$colores = array();
	foreach ( lapaz_guia_lista( 'color', 'palette' ) as $c ) {
		$slug = lapaz_guia_texto( $c['slug'] ?? '' );
		if ( '' !== $slug ) {
			$colores[] = array(
				'nombre' => lapaz_guia_texto( $c['name'] ?? $slug ),
				'slug'   => $slug,
				'hex'    => lapaz_guia_texto( $c['color'] ?? '' ),
				'var'    => '--wp--preset--color--' . $slug,
			);
		}
	}
	return $colores;
}

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

/**
 * Familias con los pesos que theme.json declara de verdad en `fontFace`.
 *
 * @return list<array{nombre: string, slug: string, pesos: list<array{valor: int, nombre: string, token: string}>}>
 */
function lapaz_guia_familias(): array {
	$ajustes = lapaz_guia_ajustes();
	$custom  = is_array( $ajustes['custom'] ?? null ) && is_array( $ajustes['custom']['font-weight'] ?? null ) ? $ajustes['custom']['font-weight'] : array();
	$tokens  = array();
	foreach ( $custom as $nombre => $valor ) {
		$tokens[ (int) lapaz_guia_texto( $valor ) ] = (string) $nombre;
	}
	$familias = array();
	foreach ( lapaz_guia_lista( 'typography', 'fontFamilies' ) as $f ) {
		$valores = array();
		$caras   = is_array( $f['fontFace'] ?? null ) ? $f['fontFace'] : array();
		foreach ( $caras as $cara ) {
			$valores[] = is_array( $cara ) ? (int) lapaz_guia_texto( $cara['fontWeight'] ?? 400 ) : 0;
		}
		$valores = array_unique( array_filter( $valores ) );
		sort( $valores );
		$pesos = array();
		foreach ( $valores as $valor ) {
			$pesos[] = array(
				'valor'  => $valor,
				'nombre' => $tokens[ $valor ] ?? '',
				'token'  => isset( $tokens[ $valor ] ) ? '--wp--custom--font-weight--' . $tokens[ $valor ] : '',
			);
		}
		$familias[] = array(
			'nombre' => lapaz_guia_texto( $f['name'] ?? '' ),
			'slug'   => lapaz_guia_texto( $f['slug'] ?? '' ),
			'pesos'  => $pesos,
		);
	}
	return $familias;
}

/**
 * Escala de tamaños: los fontSizes de theme.json y los de los encabezados en styles.
 *
 * @return list<array{nombre: string, valor: string, var: string, titulo: bool}>
 */
function lapaz_guia_tamanos(): array {
	$tamanos = array();
	foreach ( lapaz_guia_lista( 'typography', 'fontSizes' ) as $t ) {
		$slug      = lapaz_guia_texto( $t['slug'] ?? '' );
		$tamanos[] = array(
			'nombre' => lapaz_guia_texto( $t['name'] ?? $slug ),
			'valor'  => lapaz_guia_texto( $t['size'] ?? '' ),
			'var'    => '--wp--preset--font-size--' . $slug,
			'titulo' => str_contains( $slug, 'seccion' ) || str_contains( $slug, 'titulo' ),
		);
	}
	foreach ( array( 'h1', 'h2', 'h3' ) as $h ) {
		$valor = wp_get_global_styles( array( 'elements', $h, 'typography', 'fontSize' ) );
		if ( is_string( $valor ) && '' !== $valor ) {
			$tamanos[] = array(
				'nombre' => strtoupper( $h ),
				'valor'  => $valor,
				'var'    => '',
				'titulo' => true,
			);
		}
	}
	return $tamanos;
}

/**
 * Presets de espaciado.
 *
 * @return list<array{slug: string, valor: string, var: string}>
 */
function lapaz_guia_espaciado(): array {
	$espacios = array();
	foreach ( lapaz_guia_lista( 'spacing', 'spacingSizes' ) as $e ) {
		$slug       = lapaz_guia_texto( $e['slug'] ?? '' );
		$espacios[] = array(
			'slug'  => $slug,
			'valor' => lapaz_guia_texto( $e['size'] ?? '' ),
			'var'   => '--wp--preset--spacing--' . $slug,
		);
	}
	return $espacios;
}

/**
 * Lo que hay en `settings.custom`, aplanado a dos niveles (grupo y clave).
 *
 * @return list<array{grupo: string, clave: string, valor: string, var: string}>
 */
function lapaz_guia_custom(): array {
	$ajustes = lapaz_guia_ajustes();
	$custom  = is_array( $ajustes['custom'] ?? null ) ? $ajustes['custom'] : array();
	$salida  = array();
	foreach ( $custom as $grupo => $claves ) {
		foreach ( is_array( $claves ) ? $claves : array() as $clave => $valor ) {
			$salida[] = array(
				'grupo' => (string) $grupo,
				'clave' => (string) $clave,
				'valor' => lapaz_guia_texto( $valor ),
				'var'   => '--wp--custom--' . $grupo . '--' . $clave,
			);
		}
	}
	return $salida;
}

/**
 * Declaración CSS que pinta una muestra de un valor `custom` según su grupo.
 *
 * @param string $grupo    Grupo (radius, shadow, border, letter-spacing, font-weight).
 * @param string $variable Nombre de la variable CSS.
 */
function lapaz_guia_estilo_custom( string $grupo, string $variable ): string {
	$propiedades = array(
		'radius'         => 'border-radius',
		'shadow'         => 'box-shadow',
		'letter-spacing' => 'letter-spacing',
		'font-weight'    => 'font-weight',
	);
	if ( 'border' === $grupo ) {
		return 'border: 2px solid var(' . $variable . ')';
	}
	return isset( $propiedades[ $grupo ] ) ? $propiedades[ $grupo ] . ': var(' . $variable . ')' : '';
}

/**
 * La guía es interna: sin indexar.
 *
 * @param array<string, bool|string> $robots Directivas.
 * @return array<string, bool|string>
 */
function lapaz_guia_noindex( array $robots ): array {
	if ( is_page( LAPAZ_GUIA_SLUG ) ) {
		$robots['noindex']  = true;
		$robots['nofollow'] = true;
		unset( $robots['index'], $robots['follow'] );
	}
	return $robots;
}
add_filter( 'wp_robots', 'lapaz_guia_noindex' );

/**
 * Fuera del sitemap de WordPress.
 *
 * @param array<string, mixed> $args Argumentos de WP_Query del sitemap.
 * @param string               $post_type Tipo de contenido.
 * @return array<string, mixed>
 */
function lapaz_guia_fuera_del_sitemap( array $args, string $post_type ): array {
	$pagina = 'page' === $post_type ? get_page_by_path( LAPAZ_GUIA_SLUG ) : null;
	if ( $pagina instanceof WP_Post ) {
		$args['post__not_in'] = array( $pagina->ID );
	}
	return $args;
}
add_filter( 'wp_sitemaps_posts_query_args', 'lapaz_guia_fuera_del_sitemap', 10, 2 );
