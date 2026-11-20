<?php
/**
 * Tarjeta de un productor. Espera $lapaz_tarjeta (lapaz_catalogo_tarjeta()).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

if ( ! isset( $lapaz_tarjeta ) ) {
	return;
}
/**
 * Tarjeta.
 *
 * @var array{nombre: string, ubicacion: string, productos: list<string>, categorias: list<string>, etnia: string} $lapaz_tarjeta
 */
?>
<article class="card">
	<h4><?php echo esc_html( $lapaz_tarjeta['nombre'] ); ?></h4>
	<div class="ubic"><?php echo esc_html( $lapaz_tarjeta['ubicacion'] ); ?></div>
	<?php if ( array() !== $lapaz_tarjeta['productos'] ) : ?>
		<ul>
			<?php foreach ( $lapaz_tarjeta['productos'] as $lapaz_producto ) : ?>
				<li><?php echo esc_html( $lapaz_producto ); ?></li>
			<?php endforeach; ?>
		</ul>
	<?php endif; ?>
	<div class="tags">
		<?php foreach ( $lapaz_tarjeta['categorias'] as $lapaz_categoria ) : ?>
			<span class="tag"><?php echo esc_html( $lapaz_categoria ); ?></span>
		<?php endforeach; ?>
		<?php if ( '' !== $lapaz_tarjeta['etnia'] ) : ?>
			<span class="tag et"><?php echo esc_html( $lapaz_tarjeta['etnia'] ); ?></span>
		<?php endif; ?>
	</div>
</article>
