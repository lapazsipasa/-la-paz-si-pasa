<?php
/**
 * Boletín Caminos de Transformación: datos de una edición para el bloque lapaz/boletin.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Moldes de sección y el nombre con que abre cada edición nueva (las 8 de siempre).
 *
 * @return array<int, array{0: string, 1: string}>
 */
function lapaz_boletin_secciones_iniciales(): array {
	return array(
		array( 'articulo', 'En portada' ),
		array( 'cifras', 'El Fondo en cifras' ),
		array( 'articulo', 'Historias que transforman' ),
		array( 'articulo', 'Obras que conectan' ),
		array( 'articulo', 'Paz productiva' ),
		array( 'tarjetas', 'Alianzas' ),
		array( 'articulo', 'Actualidad' ),
		array( 'agenda', 'La agenda' ),
	);
}

/**
 * Una edición nueva (borrador automático) nace con las 8 secciones vacías. No pisa
 * una edición que ya tenga secciones.
 *
 * @param int     $post_id Entrada.
 * @param WP_Post $post    Entrada.
 * @param bool    $update  Si es una actualización.
 */
function lapaz_boletin_secciones_por_defecto( int $post_id, WP_Post $post, bool $update ): void {
	if ( $update || 'boletin' !== $post->post_type || 'auto-draft' !== $post->post_status || ! function_exists( 'update_field' ) ) {
		return;
	}
	$filas = array();
	foreach ( lapaz_boletin_secciones_iniciales() as list( $molde, $nombre ) ) {
		$filas[] = array(
			'acf_fc_layout' => $molde,
			'nombre'        => $nombre,
		);
	}
	update_field( 'field_boletin_secciones', $filas, $post_id );
}
add_action( 'wp_insert_post', 'lapaz_boletin_secciones_por_defecto', 10, 3 );

/**
 * ID de la edición publicada más reciente por fecha (0 si no hay).
 */
function lapaz_boletin_actual(): int {
	/**
	 * Una consulta por petición (-1: aún sin consultar).
	 *
	 * @var int $actual
	 */
	static $actual = -1;
	if ( $actual >= 0 ) {
		return $actual;
	}
	$ids = get_posts(
		array(
			'post_type'        => 'boletin',
			'post_status'      => 'publish',
			'posts_per_page'   => 1,
			'fields'           => 'ids',
			'orderby'          => 'date',
			'order'            => 'DESC',
			'no_found_rows'    => true,
			'suppress_filters' => false,
		)
	);

	$actual = isset( $ids[0] ) ? (int) $ids[0] : 0;

	return $actual;
}

/**
 * Edición que pinta la página: la consultada en /boletin/<slug>/ y, en el archivo, la más reciente.
 */
function lapaz_boletin_mostrado(): int {
	return is_singular( 'boletin' ) ? get_queried_object_id() : lapaz_boletin_actual();
}

/**
 * Las demás ediciones publicadas, de la más nueva a la más antigua.
 *
 * @param int $excluir Edición que se está mostrando.
 * @return list<array{titulo: string, periodo: string, url: string}>
 */
function lapaz_boletin_anteriores( int $excluir ): array {
	$posts  = get_posts(
		array(
			'post_type'      => 'boletin',
			'post_status'    => 'publish',
			'posts_per_page' => 50,
			'post__not_in'   => array( $excluir ),
			'orderby'        => 'date',
			'order'          => 'DESC',
			'no_found_rows'  => true,
		)
	);
	$salida = array();
	foreach ( $posts as $post ) {
		$salida[] = array(
			'titulo'  => get_the_title( $post ),
			'periodo' => lapaz_field_text( 'periodo', $post->ID ),
			'url'     => (string) get_permalink( $post ),
		);
	}

	return $salida;
}

/**
 * Texto de una clave de un array de campos ('' si no es texto o número).
 *
 * @param array<mixed> $datos Fila de campos.
 * @param string       $clave Nombre del campo.
 */
function lapaz_boletin_str( array $datos, string $clave ): string {
	$valor = $datos[ $clave ] ?? '';

	return is_string( $valor ) || is_numeric( $valor ) ? trim( (string) $valor ) : '';
}

/**
 * Número entero de una clave de un array de campos (0 si no es numérico).
 *
 * @param array<mixed> $datos Fila de campos.
 * @param string       $clave Nombre del campo.
 */
function lapaz_boletin_num( array $datos, string $clave ): int {
	$valor = $datos[ $clave ] ?? 0;

	return is_numeric( $valor ) ? (int) $valor : 0;
}

/**
 * Filas de un repetidor dentro de una fila de campos.
 *
 * @param array<mixed> $datos Fila de campos.
 * @param string       $clave Nombre del repetidor.
 * @return list<array<mixed>>
 */
function lapaz_boletin_filas( array $datos, string $clave ): array {
	$filas = $datos[ $clave ] ?? array();
	$lista = array();
	foreach ( is_array( $filas ) ? $filas : array() as $fila ) {
		if ( is_array( $fila ) ) {
			$lista[] = $fila;
		}
	}

	return $lista;
}

/**
 * Líneas no vacías de un texto (un párrafo, un nombre o una línea por renglón).
 *
 * @param string $texto Texto de un textarea.
 * @return list<string>
 */
function lapaz_boletin_lineas( string $texto ): array {
	$lineas = preg_split( '/\R/', $texto );

	return array_values( array_filter( array_map( 'trim', false === $lineas ? array() : $lineas ), static fn( string $linea ): bool => '' !== $linea ) );
}

/**
 * ID de adjunto de un valor de campo de imagen (ID, array o nada).
 *
 * @param mixed $valor Valor del campo.
 */
function lapaz_boletin_id_imagen( mixed $valor ): int {
	if ( is_array( $valor ) ) {
		$valor = $valor['ID'] ?? 0;
	}
	$id = is_numeric( $valor ) ? (int) $valor : 0;

	return $id > 0 && wp_attachment_is_image( $id ) ? $id : 0;
}

/**
 * Imagen del adjunto con srcset, tamaño y alt del adjunto ('' si no hay).
 *
 * @param mixed  $valor  Valor del campo de imagen.
 * @param string $clase  Clase del <img>.
 * @param bool   $lazy   Carga diferida (false para la primera imagen visible).
 * @param bool   $decora Imagen decorativa: alt vacío.
 */
function lapaz_boletin_imagen( mixed $valor, string $clase = '', bool $lazy = true, bool $decora = false ): string {
	$id = lapaz_boletin_id_imagen( $valor );
	if ( 0 === $id ) {
		return '';
	}
	$atributos = $lazy ? array( 'loading' => 'lazy' ) : array(
		'loading'       => 'eager',
		'fetchpriority' => 'high',
	);
	if ( '' !== $clase ) {
		$atributos['class'] = $clase;
	}
	if ( $decora ) {
		$atributos['alt'] = '';
	}

	return wp_get_attachment_image( $id, 'large', false, $atributos );
}

/**
 * Secciones de una edición como lista de filas; cada una trae `molde`, `n` (1…N) y los campos
 * del molde Artículo ya en la fila (el clon es seamless; si llegara anidado, se aplana).
 *
 * @param int $id Edición.
 * @return list<array<mixed>>
 */
function lapaz_boletin_secciones( int $id ): array {
	$filas     = function_exists( 'get_field' ) ? get_field( 'secciones', $id ) : array();
	$secciones = array();
	foreach ( is_array( $filas ) ? $filas : array() as $fila ) {
		if ( ! is_array( $fila ) || ! is_string( $fila['acf_fc_layout'] ?? null ) ) {
			continue;
		}
		if ( is_array( $fila['articulo'] ?? null ) ) {
			$fila = array_merge( $fila, $fila['articulo'] );
		}
		$fila['molde'] = $fila['acf_fc_layout'];
		$fila['n']     = count( $secciones ) + 1;
		$secciones[]   = $fila;
	}

	return $secciones;
}

/**
 * Imagen de la tarjeta del índice: la propia o la primera foto de la sección (fotos, luego apertura).
 *
 * @param array<mixed> $seccion Fila de la sección.
 * @return int ID del adjunto (0 si no hay).
 */
function lapaz_boletin_imagen_indice( array $seccion ): int {
	$candidatas = array( $seccion['indice_imagen'] ?? 0 );
	foreach ( lapaz_boletin_filas( $seccion, 'fotos' ) as $foto ) {
		$candidatas[] = $foto['imagen'] ?? 0;
	}
	$candidatas[] = $seccion['apertura'] ?? 0;
	foreach ( $candidatas as $candidata ) {
		$id = lapaz_boletin_id_imagen( $candidata );
		if ( $id > 0 ) {
			return $id;
		}
	}

	return 0;
}

/**
 * Título de una edición para el <title>: «Caminos de Transformación, Edición 02».
 *
 * @param int $id Edición.
 */
function lapaz_boletin_titulo( int $id ): string {
	$numero = lapaz_boletin_numero( $id );
	$base   = __( 'Caminos de Transformación', 'lapaz' );

	return '' !== $numero ? sprintf( '%s, %s %02d', $base, __( 'Edición', 'lapaz' ), (int) $numero ) : $base;
}

/**
 * Número de la edición como texto ('' si no hay edición o el campo está vacío).
 *
 * @param int $id Edición.
 */
function lapaz_boletin_numero( int $id ): string {
	if ( $id <= 0 || ! function_exists( 'get_field' ) ) {
		return '';
	}

	return lapaz_boletin_str( array( 'n' => get_field( 'numero', $id ) ), 'n' );
}
