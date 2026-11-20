<?php
/**
 * Boletín: molde cifras. Incluido desde render.php (comparte sus variables).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variable de render.php.
 *
 * @var array<mixed> $lapaz_seccion Fila de la sección.
 */

$lapaz_cifras = lapaz_boletin_filas( $lapaz_seccion, 'cifras' );
$lapaz_nota   = lapaz_boletin_str( $lapaz_seccion, 'nota' );
?>
<?php if ( array() !== $lapaz_cifras ) : ?>
	<div class="cifras-grid">
		<?php foreach ( $lapaz_cifras as $lapaz_i => $lapaz_cifra ) : ?>
			<div class="cifra<?php echo 0 === $lapaz_i ? ' destacada' : ''; ?>">
				<div class="n"><?php echo esc_html( lapaz_boletin_str( $lapaz_cifra, 'numero' ) ); ?></div>
				<div class="l"><?php echo esc_html( lapaz_boletin_str( $lapaz_cifra, 'texto' ) ); ?></div>
			</div>
		<?php endforeach; ?>
	</div>
<?php endif; ?>
<?php if ( '' !== $lapaz_nota ) : ?>
	<p class="nota-cifras"><?php echo esc_html( $lapaz_nota ); ?></p>
<?php endif; ?>
