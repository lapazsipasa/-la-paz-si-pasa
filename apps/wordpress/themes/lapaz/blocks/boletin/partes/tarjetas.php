<?php
/**
 * Boletín: molde tarjetas. Incluido desde render.php (comparte sus variables).
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

$lapaz_tarjetas = lapaz_boletin_filas( $lapaz_seccion, 'tarjetas' );
?>
<?php if ( array() !== $lapaz_tarjetas ) : ?>
	<div class="tarjetas">
		<?php foreach ( $lapaz_tarjetas as $lapaz_tarjeta ) : ?>
			<?php
			$lapaz_color    = lapaz_boletin_str( $lapaz_tarjeta, 'color' );
			$lapaz_clase    = in_array( $lapaz_color, array( 'naranja', 'verde' ), true ) ? 'tarjeta ' . $lapaz_color : 'tarjeta';
			$lapaz_etiqueta = lapaz_boletin_str( $lapaz_tarjeta, 'etiqueta' );
			$lapaz_t_titulo = lapaz_boletin_str( $lapaz_tarjeta, 'titulo' );
			$lapaz_monto    = lapaz_boletin_str( $lapaz_tarjeta, 'monto' );
			$lapaz_m_nota   = lapaz_boletin_str( $lapaz_tarjeta, 'monto_nota' );
			?>
			<article class="<?php echo esc_attr( $lapaz_clase ); ?>">
				<?php if ( '' !== $lapaz_etiqueta ) : ?>
					<div class="etiqueta"><?php echo esc_html( $lapaz_etiqueta ); ?></div>
				<?php endif; ?>
				<?php if ( '' !== $lapaz_t_titulo ) : ?>
					<h3><?php echo esc_html( $lapaz_t_titulo ); ?></h3>
				<?php endif; ?>
				<?php foreach ( lapaz_boletin_lineas( lapaz_boletin_str( $lapaz_tarjeta, 'texto' ) ) as $lapaz_parrafo ) : ?>
					<p><?php echo esc_html( $lapaz_parrafo ); ?></p>
				<?php endforeach; ?>
				<?php if ( '' !== $lapaz_monto ) : ?>
					<div class="monto"><?php echo esc_html( $lapaz_monto ); ?><?php echo '' !== $lapaz_m_nota ? '<span>' . esc_html( $lapaz_m_nota ) . '</span>' : ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- la nota va escapada. ?></div>
				<?php endif; ?>
			</article>
		<?php endforeach; ?>
	</div>
<?php endif; ?>
