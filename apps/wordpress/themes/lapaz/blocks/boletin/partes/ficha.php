<?php
/**
 * Boletín: ficha del molde artículo. Incluido desde render.php (comparte sus variables).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variable de render.php.
 *
 * @var array<mixed> $lapaz_seccion  Fila de la sección.
 * @var string        $lapaz_f_titulo Título de la ficha (articulo.php).
 */

$lapaz_f_texto = lapaz_boletin_str( $lapaz_seccion, 'ficha_texto' );
$lapaz_f_datos = lapaz_boletin_filas( $lapaz_seccion, 'ficha_datos' );
?>
<div class="ficha<?php echo ! empty( $lapaz_seccion['ficha_clara'] ) ? ' clara' : ''; ?>">
	<h3><?php echo esc_html( $lapaz_f_titulo ); ?></h3>
	<?php if ( '' !== $lapaz_f_texto ) : ?>
		<p><?php echo esc_html( $lapaz_f_texto ); ?></p>
	<?php endif; ?>
	<?php if ( array() !== $lapaz_f_datos ) : ?>
		<ul>
			<?php foreach ( $lapaz_f_datos as $lapaz_dato ) : ?>
				<li><b><?php echo esc_html( lapaz_boletin_str( $lapaz_dato, 'cifra' ) ); ?></b> <?php echo esc_html( lapaz_boletin_str( $lapaz_dato, 'texto' ) ); ?></li>
			<?php endforeach; ?>
		</ul>
	<?php endif; ?>
</div>
