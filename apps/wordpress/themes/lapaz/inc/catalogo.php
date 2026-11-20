<?php
/**
 * Catálogo PaisSana: consulta de productores, filtros y conteos para los bloques lapaz/catalogo y lapaz/catalogo-portada.
 *
 * Filtros en la URL (buscar, departamento, categoria[], tiempo, ver), una sola WP_Query por
 * petición y conteos desde el campo count de cada término (get_terms), sin consultas propias.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Tarjetas por tanda («Ver más» suma otra tanda).
 */
const LAPAZ_CATALOGO_TANDA = 36;

/**
 * Términos de una taxonomía del catálogo, por nombre. Se piden una vez por petición.
 *
 * @param string $taxonomy Taxonomía.
 * @return array<string, WP_Term> Términos con productores publicados, por slug.
 */
function lapaz_catalogo_terminos( string $taxonomy ): array {
	/**
	 * Términos por taxonomía y slug.
	 *
	 * @var array<string, array<string, WP_Term>> $cache
	 */
	static $cache = array();

	if ( ! isset( $cache[ $taxonomy ] ) ) {
		$terms = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => true,
				'orderby'    => 'name',
			)
		);

		$cache[ $taxonomy ] = array();
		foreach ( is_array( $terms ) ? $terms : array() as $term ) {
			$cache[ $taxonomy ][ $term->slug ] = $term;
		}
	}

	return $cache[ $taxonomy ];
}

/**
 * Productores publicados (conteo nativo de wp_count_posts, con caché de objetos).
 */
function lapaz_catalogo_total(): int {
	$counts = wp_count_posts( 'productor' );

	return is_numeric( $counts->publish ?? null ) ? (int) $counts->publish : 0;
}

/**
 * Un parámetro de texto de la URL, saneado ('' si no viene o no es texto).
 *
 * @param string $name Parámetro.
 */
function lapaz_catalogo_param( string $name ): string {
	// phpcs:disable WordPress.Security.NonceVerification.Recommended -- filtro público por GET, sin efectos.
	if ( ! isset( $_GET[ $name ] ) || ! is_string( $_GET[ $name ] ) ) {
		return '';
	}

	return sanitize_text_field( wp_unslash( $_GET[ $name ] ) );
	// phpcs:enable
}

/**
 * Filtros de la URL, saneados. Los filtros solo aceptan slugs de términos que existen
 * y `ver` va en tandas de 36, entre 36 y la tanda que cubre el total.
 *
 * @return array{buscar: string, departamento: string, categoria: list<string>, tiempo: string, ver: int}
 */
function lapaz_catalogo_filtros(): array {
	$departamentos = lapaz_catalogo_terminos( 'departamento' );
	$tiempos       = lapaz_catalogo_terminos( 'tiempo_operacion' );
	$categorias    = lapaz_catalogo_terminos( 'categoria_productor' );

	// phpcs:disable WordPress.Security.NonceVerification.Recommended, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- filtro público por GET; cada slug se valida contra los términos que existen.
	$pedidas = isset( $_GET['categoria'] ) && is_array( $_GET['categoria'] ) ? wp_unslash( $_GET['categoria'] ) : array();
	// phpcs:enable
	$categoria = array();
	foreach ( $pedidas as $slug ) {
		if ( is_string( $slug ) && isset( $categorias[ $slug ] ) && ! in_array( $slug, $categoria, true ) ) {
			$categoria[] = $slug;
		}
	}

	$departamento = lapaz_catalogo_param( 'departamento' );
	$tiempo       = lapaz_catalogo_param( 'tiempo' );
	$ver          = lapaz_catalogo_param( 'ver' );
	$tope         = max( 1, (int) ceil( lapaz_catalogo_total() / LAPAZ_CATALOGO_TANDA ) ) * LAPAZ_CATALOGO_TANDA;
	$ver          = ctype_digit( $ver ) ? (int) ceil( (int) $ver / LAPAZ_CATALOGO_TANDA ) * LAPAZ_CATALOGO_TANDA : 0;

	return array(
		'buscar'       => mb_substr( lapaz_catalogo_param( 'buscar' ), 0, 100 ),
		'departamento' => isset( $departamentos[ $departamento ] ) ? $departamento : '',
		'categoria'    => $categoria,
		'tiempo'       => isset( $tiempos[ $tiempo ] ) ? $tiempo : '',
		'ver'          => min( $tope, max( LAPAZ_CATALOGO_TANDA, $ver ) ),
	);
}

/**
 * La única consulta de productores de la petición.
 *
 * @param array{buscar: string, departamento: string, categoria: list<string>, tiempo: string, ver: int} $filtros Filtros saneados.
 */
function lapaz_catalogo_consulta( array $filtros ): WP_Query {
	// AND entre taxonomías; dentro de categoría basta una (IN).
	$tax_query = array( 'relation' => 'AND' );
	$claves    = array(
		'departamento'        => 'departamento',
		'categoria_productor' => 'categoria',
		'tiempo_operacion'    => 'tiempo',
	);
	foreach ( $claves as $taxonomy => $clave ) {
		$slugs = array_filter( (array) $filtros[ $clave ] );
		if ( array() !== $slugs ) {
			$tax_query[] = array(
				'taxonomy' => $taxonomy,
				'field'    => 'slug',
				'terms'    => array_values( $slugs ),
				'operator' => 'IN',
			);
		}
	}

	$args = array(
		'post_type'           => 'productor',
		'post_status'         => 'publish',
		'posts_per_page'      => $filtros['ver'],
		'orderby'             => 'title',
		'order'               => 'ASC',
		'ignore_sticky_posts' => true,
		'tax_query'           => $tax_query, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- taxonomías con índice: es el filtro del catálogo.
	);
	if ( mb_strlen( $filtros['buscar'] ) >= 2 ) {
		$args['s']              = $filtros['buscar'];
		$args['search_columns'] = array( 'post_title', 'post_content' );
	}

	return new WP_Query( $args );
}

/**
 * URL del catálogo con los filtros dados y el ancla #explorar. Omite los vacíos y `ver` = 36.
 *
 * @param array{buscar: string, departamento: string, categoria: list<string>, tiempo: string, ver: int} $filtros Filtros saneados.
 * @param array<string, mixed>                                                                           $cambios Valores que reemplazan a los de $filtros.
 */
function lapaz_catalogo_url( array $filtros, array $cambios = array() ): string {
	$params = array_merge( $filtros, $cambios );
	$query  = array();
	foreach ( array( 'buscar', 'departamento', 'tiempo' ) as $name ) {
		if ( is_string( $params[ $name ] ) && '' !== $params[ $name ] ) {
			$query[ $name ] = $params[ $name ];
		}
	}
	if ( is_array( $params['categoria'] ) && array() !== $params['categoria'] ) {
		$query['categoria'] = array_values( $params['categoria'] );
	}
	if ( is_int( $params['ver'] ) && $params['ver'] > LAPAZ_CATALOGO_TANDA ) {
		$query['ver'] = $params['ver'];
	}

	$base = get_permalink();
	$base = is_string( $base ) && is_page() ? $base : home_url( '/paissana/' );

	// categoria[]=a&categoria[]=b, como lo envía el formulario (http_build_query numera: categoria[0]).
	$query = (string) preg_replace( '/%5B\d+%5D=/', '%5B%5D=', http_build_query( $query, '', '&' ) );

	return ( '' === $query ? $base : $base . '?' . $query ) . '#explorar';
}

/**
 * Barras de distribución: departamentos (los 15 con más productores) o categorías (todas),
 * de mayor a menor, con el enlace que activa o quita el filtro.
 *
 * @param string                                                                                         $taxonomy departamento o categoria_productor.
 * @param array{buscar: string, departamento: string, categoria: list<string>, tiempo: string, ver: int} $filtros  Filtros saneados.
 * @return list<array{nombre: string, cuenta: int, ancho: string, url: string, activa: bool}>
 */
function lapaz_catalogo_barras( string $taxonomy, array $filtros ): array {
	$terms = array_values( lapaz_catalogo_terminos( $taxonomy ) );
	usort( $terms, static fn( WP_Term $a, WP_Term $b ): int => array( $b->count, $a->name ) <=> array( $a->count, $b->name ) );
	if ( 'departamento' === $taxonomy ) {
		$terms = array_slice( $terms, 0, 15 );
	}

	$max    = max( 1, $terms[0]->count ?? 1 );
	$barras = array();
	foreach ( $terms as $term ) {
		if ( 'departamento' === $taxonomy ) {
			$activa = $filtros['departamento'] === $term->slug;
			$cambio = array( 'departamento' => $activa ? '' : $term->slug );
		} else {
			$activa = in_array( $term->slug, $filtros['categoria'], true );
			$cambio = array(
				'categoria' => $activa
					? array_values( array_diff( $filtros['categoria'], array( $term->slug ) ) )
					: array_merge( $filtros['categoria'], array( $term->slug ) ),
			);
		}
		$barras[] = array(
			'nombre' => $term->name,
			'cuenta' => $term->count,
			'ancho'  => number_format( $term->count / $max * 100, 1, '.', '' ),
			'url'    => lapaz_catalogo_url( $filtros, $cambio + array( 'ver' => LAPAZ_CATALOGO_TANDA ) ),
			'activa' => $activa,
		);
	}

	return $barras;
}

/**
 * Datos de una tarjeta de productor.
 *
 * @param WP_Post $post Productor.
 * @return array{nombre: string, ubicacion: string, productos: list<string>, categorias: list<string>, etnia: string}
 */
function lapaz_catalogo_tarjeta( WP_Post $post ): array {
	/**
	 * Nombres de los términos del productor en una taxonomía.
	 *
	 * @return list<string>
	 */
	$nombres = static function ( string $taxonomy ) use ( $post ): array {
		$terms = get_the_terms( $post, $taxonomy );

		return is_array( $terms ) ? array_values( array_map( static fn( WP_Term $term ): string => $term->name, $terms ) ) : array();
	};

	$departamento = $nombres( 'departamento' );
	$etnia        = $nombres( 'etnia' )[0] ?? '';
	$ubicacion    = array_filter( array( lapaz_field_text( 'municipio', $post->ID ), $departamento[0] ?? '' ) );
	$productos    = preg_split( '/\R/', lapaz_field_text( 'productos', $post->ID ) );

	return array(
		'nombre'     => get_the_title( $post ),
		'ubicacion'  => implode( ' · ', $ubicacion ),
		'productos'  => array_values( array_filter( array_map( 'trim', false === $productos ? array() : $productos ) ) ),
		'categorias' => $nombres( 'categoria_productor' ),
		'etnia'      => 'ninguno' === strtolower( $etnia ) ? '' : $etnia,
	);
}

/**
 * Texto de los filtros activos para el conteo («Cauca · Alimentos y bebidas, Artesanías»).
 *
 * @param array{buscar: string, departamento: string, categoria: list<string>, tiempo: string, ver: int} $filtros Filtros saneados.
 */
function lapaz_catalogo_resumen( array $filtros ): string {
	$partes     = array();
	$taxonomias = array(
		'departamento' => 'departamento',
		'tiempo'       => 'tiempo_operacion',
	);
	foreach ( $taxonomias as $clave => $taxonomy ) {
		$terms = lapaz_catalogo_terminos( $taxonomy );
		if ( isset( $terms[ $filtros[ $clave ] ] ) ) {
			$partes[] = $terms[ $filtros[ $clave ] ]->name;
		}
	}
	$categorias = lapaz_catalogo_terminos( 'categoria_productor' );
	$nombres    = array();
	foreach ( $filtros['categoria'] as $slug ) {
		$nombres[] = $categorias[ $slug ]->name;
	}
	if ( array() !== $nombres ) {
		$partes[] = implode( ', ', $nombres );
	}

	return implode( ' · ', $partes );
}

/**
 * Tiempos de operación de menor a mayor («Menos de 1 año» primero, luego por el primer número).
 *
 * @return list<WP_Term>
 */
function lapaz_catalogo_tiempos(): array {
	$orden = static function ( WP_Term $term ): int {
		return str_starts_with( strtolower( $term->name ), 'menos' ) || 1 !== preg_match( '/\d+/', $term->name, $numero ) ? -1 : (int) $numero[0];
	};
	$terms = array_values( lapaz_catalogo_terminos( 'tiempo_operacion' ) );
	usort( $terms, static fn( WP_Term $a, WP_Term $b ): int => $orden( $a ) <=> $orden( $b ) );

	return $terms;
}
