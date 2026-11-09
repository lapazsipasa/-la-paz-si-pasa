<?php
/**
 * Datos de la página Proyectos destacados (PaisSana).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * ID de la página Proyectos destacados (la que guarda group_proyectos), 0 si no existe.
 */
function lapaz_proyectos_page_id(): int {
	$page = get_page_by_path( 'proyectos-destacados' );

	return $page instanceof WP_Post ? $page->ID : 0;
}

/**
 * Las 3 cifras de «Datos relevantes». Si un campo está vacío se usa el valor actual
 * del sitio, así la página se ve igual aunque nadie haya guardado los campos.
 *
 * @return list<array{valor: string, texto: string}>
 */
function lapaz_paisana_cifras(): array {
	$defecto = array(
		array( '450', __( 'Organizaciones y productores vigentes con acuerdos comerciales en pie.', 'lapaz' ) ),
		array( '3.402', __( 'Productos con sello de origen que garantizan calidad y procedencia.', 'lapaz' ) ),
		array( '168', __( 'Municipios sembrando el cambio en las regiones más afectadas por el conflicto.', 'lapaz' ) ),
	);
	$page_id = lapaz_proyectos_page_id();
	$cifras  = array();
	foreach ( $defecto as $i => $valores ) {
		$n        = $i + 1;
		$valor    = $page_id > 0 ? lapaz_field_text( "cifra_{$n}_valor", $page_id ) : '';
		$texto    = $page_id > 0 ? lapaz_field_text( "cifra_{$n}_texto", $page_id ) : '';
		$cifras[] = array(
			'valor' => '' !== $valor ? $valor : $valores[0],
			'texto' => '' !== $texto ? $texto : $valores[1],
		);
	}

	return $cifras;
}

/**
 * Regiones del mapa (PaisSanaMapaCarrusel.astro). Id, nombre, color y mapa son diseño
 * y quedan fijos; total y departamentos se editan en group_proyectos. Un campo vacío
 * usa el valor actual del sitio.
 *
 * @return list<array{id: string, nombre: string, color: string, total: int, deptos: list<array{nombre: string, valor: int}>}>
 */
function lapaz_paisana_regiones(): array {
	$defecto  = array(
		array(
			'id'     => 'caribe',
			'nombre' => 'CARIBE',
			'color'  => '#e88e2d',
			'total'  => 61,
			'deptos' => "LA GUAJIRA: 3\nSUCRE: 17\nCESAR: 18\nBOLÍVAR: 13\nMAGDALENA: 1\nCÓRDOBA: 8\nATLÁNTICO: 1",
		),
		array(
			'id'     => 'pacifica',
			'nombre' => 'PACÍFICA',
			'color'  => 'var(--color-nav-text, #32509d)',
			'total'  => 120,
			'deptos' => "CHOCÓ: 16\nVALLE DEL CAUCA: 34\nCAUCA: 63\nNARIÑO: 7",
		),
		array(
			'id'     => 'andina',
			'nombre' => 'ANDINA',
			'color'  => '#e65550',
			'total'  => 152,
			'deptos' => "RISARALDA: 2\nTOLIMA: 35\nCALDAS: 1\nHUILA: 11\nQUINDÍO: 1\nBOYACÁ: 10\nANTIOQUIA: 47\nBOGOTÁ: 20\nSANTANDER: 9\nCUNDINAMARCA: 1\nNORTE DE SANTANDER: 15",
		),
		array(
			'id'     => 'orinoquia',
			'nombre' => 'ORINOQUÍA',
			'color'  => '#845396',
			'total'  => 93,
			'deptos' => "ARAUCA: 57\nCASANARE: 25\nVICHADA: 0\nMETA: 11",
		),
		array(
			'id'     => 'amazonia',
			'nombre' => 'AMAZONÍA',
			'color'  => 'var(--color-loquehacemos-bg, #008861)',
			'total'  => 42,
			'deptos' => "AMAZONAS: 1\nGUAVIARE: 4\nPUTUMAYO: 9\nCAQUETÁ: 28",
		),
	);
	$page_id  = lapaz_proyectos_page_id();
	$regiones = array();
	foreach ( $defecto as $region ) {
		$total_campo = $page_id > 0 && function_exists( 'get_field' ) ? get_field( "region_{$region['id']}_total", $page_id ) : null;
		$deptos_txt  = $page_id > 0 ? lapaz_field_text( "region_{$region['id']}_deptos", $page_id ) : '';
		$regiones[]  = array(
			'id'     => $region['id'],
			'nombre' => $region['nombre'],
			'color'  => $region['color'],
			'total'  => is_numeric( $total_campo ) ? (int) $total_campo : $region['total'],
			'deptos' => lapaz_parse_deptos( '' !== trim( $deptos_txt ) ? $deptos_txt : $region['deptos'] ),
		);
	}

	return $regiones;
}

/**
 * Convierte «NOMBRE: número» (una línea por departamento) en una lista. Ignora líneas
 * vacías o mal escritas; el número puede faltar (cuenta como 0).
 *
 * @param string $texto Texto del campo.
 * @return list<array{nombre: string, valor: int}>
 */
function lapaz_parse_deptos( string $texto ): array {
	$deptos = array();
	$lineas = preg_split( '/\r\n|\r|\n/', $texto );
	foreach ( false === $lineas ? array() : $lineas as $linea ) {
		if ( '' === trim( $linea ) || 1 !== preg_match( '/^\s*([^:]+?)\s*(?::\s*(\d+))?\s*$/u', $linea, $m ) ) {
			continue;
		}
		$deptos[] = array(
			'nombre' => $m[1],
			'valor'  => isset( $m[2] ) ? (int) $m[2] : 0,
		);
	}

	return $deptos;
}

/**
 * Relatos de audio publicados, por `orden` (los que no tienen orden van al final), como
 * getAudioRelatos() y mapAudioRelato.ts.
 *
 * @return list<array{productor: string, marca: string, lugar: string, audioUrl: string, duracionSegundos: int}>
 */
function lapaz_get_audio_relatos(): array {
	$posts   = get_posts(
		array(
			'post_type'      => 'audio_relato',
			'post_status'    => 'publish',
			'posts_per_page' => 100,
		)
	);
	$relatos = array();
	foreach ( $posts as $post ) {
		$audio     = function_exists( 'get_field' ) ? get_field( 'audio', $post->ID ) : null;
		$duracion  = function_exists( 'get_field' ) ? get_field( 'duracion_segundos', $post->ID ) : null;
		$orden     = function_exists( 'get_field' ) ? get_field( 'orden', $post->ID ) : null;
		$relatos[] = array(
			'productor'        => lapaz_field_text( 'productor', $post->ID ),
			'marca'            => lapaz_field_text( 'marca', $post->ID ),
			'lugar'            => lapaz_field_text( 'lugar', $post->ID ),
			'audioUrl'         => lapaz_file_url( $audio ),
			'duracionSegundos' => is_numeric( $duracion ) && (int) $duracion > 0 ? (int) $duracion : 0,
			'orden'            => is_numeric( $orden ) ? (int) $orden : PHP_INT_MAX,
		);
	}
	usort( $relatos, static fn( array $a, array $b ): int => $a['orden'] <=> $b['orden'] );

	return array_map(
		static function ( array $r ): array {
			unset( $r['orden'] );
			return $r;
		},
		$relatos
	);
}

/**
 * Duración en mm:ss (formatearDuracion de Astro). 00:00 si no hay.
 *
 * @param int $segundos Segundos.
 */
function lapaz_formatear_duracion( int $segundos ): string {
	if ( $segundos <= 0 ) {
		return '00:00';
	}

	return sprintf( '%02d:%02d', intdiv( $segundos, 60 ), $segundos % 60 );
}

/**
 * URL de un campo de archivo SCF, venga como arreglo, ID o URL ('' si no hay).
 *
 * @param mixed $valor Valor del campo.
 */
function lapaz_file_url( mixed $valor ): string {
	if ( is_array( $valor ) && is_string( $valor['url'] ?? null ) ) {
		return $valor['url'];
	}
	if ( is_numeric( $valor ) ) {
		$url = wp_get_attachment_url( (int) $valor );

		return is_string( $url ) ? $url : '';
	}

	return is_string( $valor ) ? $valor : '';
}
