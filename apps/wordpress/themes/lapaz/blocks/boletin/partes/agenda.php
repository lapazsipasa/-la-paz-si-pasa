<?php
/**
 * Boletín: molde agenda. Incluido desde render.php (comparte sus variables).
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

$lapaz_hitos = lapaz_boletin_filas( $lapaz_seccion, 'hitos' );
?>
<?php if ( array() !== $lapaz_hitos ) : ?>
	<div class="linea-tiempo">
		<?php foreach ( $lapaz_hitos as $lapaz_hito ) : ?>
			<?php
			$lapaz_cuando = lapaz_boletin_str( $lapaz_hito, 'cuando' );
			$lapaz_h_tit  = lapaz_boletin_str( $lapaz_hito, 'titulo' );
			$lapaz_h_txt  = lapaz_boletin_str( $lapaz_hito, 'texto' );
			?>
			<div class="hito">
				<?php if ( '' !== $lapaz_cuando ) : ?>
					<div class="cuando"><?php echo esc_html( $lapaz_cuando ); ?></div>
				<?php endif; ?>
				<?php if ( '' !== $lapaz_h_tit ) : ?>
					<h4><?php echo esc_html( $lapaz_h_tit ); ?></h4>
				<?php endif; ?>
				<?php if ( '' !== $lapaz_h_txt ) : ?>
					<p><?php echo esc_html( $lapaz_h_txt ); ?></p>
				<?php endif; ?>
			</div>
		<?php endforeach; ?>
	</div>
<?php endif; ?>
