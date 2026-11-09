<?php
/**
 * Valida el marcado de bloques de templates/ y parts/ con el parser de WordPress.
 *
 * Falla si hay: contenido suelto fuera de bloques (freeform), bloques de un
 * espacio de nombres no permitido, atributos JSON inválidos o comentarios
 * de apertura y cierre desbalanceados. Uso: php validate-templates.php <tema> <wp-includes>
 *
 * @package lapaz
 */

$theme    = rtrim( $argv[1] ?? '', '/' );
$includes = rtrim( $argv[2] ?? '/usr/src/wordpress/wp-includes', '/' );

require $includes . '/class-wp-block-parser-block.php';
require $includes . '/class-wp-block-parser-frame.php';
require $includes . '/class-wp-block-parser.php';

$allowed = '#^(core|lapaz)/[a-z0-9-]+$#';
$errors  = array();
$files   = array_merge( glob( "$theme/templates/*.html" ) ?: array(), glob( "$theme/parts/*.html" ) ?: array() );

/**
 * Revisa un bloque y sus hijos.
 *
 * @param array<string, mixed> $block  Bloque analizado.
 * @param string               $file   Archivo.
 * @param string               $allowed Patrón de nombres permitidos.
 * @param array<int, string>   $errors Errores acumulados.
 */
function lapaz_check_block( array $block, string $file, string $allowed, array &$errors ): void {
	$name = $block['blockName'];
	if ( null === $name ) {
		if ( '' !== trim( (string) $block['innerHTML'] ) ) {
			$errors[] = "$file: contenido fuera de un bloque: " . substr( trim( (string) $block['innerHTML'] ), 0, 60 );
		}
		return;
	}
	if ( ! preg_match( $allowed, (string) $name ) ) {
		$errors[] = "$file: bloque no permitido «{$name}» (solo core/* y lapaz/*)";
	}
	foreach ( (array) $block['innerBlocks'] as $inner ) {
		lapaz_check_block( (array) $inner, $file, $allowed, $errors );
	}
}

foreach ( $files as $file ) {
	$html = (string) file_get_contents( $file );
	$rel  = basename( dirname( $file ) ) . '/' . basename( $file );

	preg_match_all( '#<!--\s+wp:([a-z0-9/-]+)(\s+(\{.*?\}))?\s+(/)?-->#s', $html, $openers, PREG_SET_ORDER );
	$open_count = 0;
	foreach ( $openers as $m ) {
		if ( ! empty( $m[3] ) && null === json_decode( $m[3] ) ) {
			$errors[] = "$rel: JSON inválido en wp:{$m[1]}";
		}
		if ( empty( $m[4] ) ) {
			++$open_count;
		}
	}
	$close_count = preg_match_all( '#<!--\s+/wp:[a-z0-9/-]+\s+-->#', $html );
	if ( $open_count !== $close_count ) {
		$errors[] = "$rel: $open_count bloques abiertos y $close_count cerrados";
	}

	foreach ( ( new WP_Block_Parser() )->parse( $html ) as $block ) {
		lapaz_check_block( $block, $rel, $allowed, $errors );
	}
}

if ( $errors ) {
	fwrite( STDERR, implode( PHP_EOL, $errors ) . PHP_EOL );
	exit( 1 );
}
printf( "Plantillas OK (%d archivos)\n", count( $files ) );
