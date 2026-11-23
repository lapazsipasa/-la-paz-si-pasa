<?php
/**
 * Boletín: ediciones anteriores y pie de la edición. Incluido desde render.php.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var string                                                     $lapaz_edicion    «Edición NN · periodo».
 * @var list<string>                                               $lapaz_creditos   Fotógrafos.
 * @var list<array{titulo: string, periodo: string, url: string}>  $lapaz_anteriores Otras ediciones.
 */
?>
<?php if ( array() !== $lapaz_anteriores ) : ?>
<section class="anteriores">
	<div class="wrap">
		<h2><?php esc_html_e( 'Otras ediciones', 'lapaz' ); ?></h2>
		<ul>
			<?php foreach ( $lapaz_anteriores as $lapaz_anterior ) : ?>
				<li>
					<a href="<?php echo esc_url( $lapaz_anterior['url'] ); ?>"><?php echo esc_html( $lapaz_anterior['titulo'] ); ?></a>
					<?php if ( '' !== $lapaz_anterior['periodo'] ) : ?>
						<span><?php echo esc_html( $lapaz_anterior['periodo'] ); ?></span>
					<?php endif; ?>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
<?php endif; ?>

<div class="pie">
	<div class="wrap">
		<div class="pie-datos">
			<p><strong><?php esc_html_e( 'Caminos de Transformación', 'lapaz' ); ?></strong><?php echo '' !== $lapaz_edicion ? ' · ' . esc_html( $lapaz_edicion ) : ''; ?></p>
			<p><?php esc_html_e( 'Boletín elaborado por la Jefatura de Relacionamiento Estratégico y Comunicaciones del Fondo Colombia en Paz.', 'lapaz' ); ?></p>
		</div>
		<?php if ( array() !== $lapaz_creditos ) : ?>
			<div class="creditos">
				<b><?php esc_html_e( 'Fotografía', 'lapaz' ); ?></b>
				<?php echo implode( '<br>', array_map( 'esc_html', $lapaz_creditos ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- cada línea va escapada. ?>
			</div>
		<?php endif; ?>
	</div>
</div>
