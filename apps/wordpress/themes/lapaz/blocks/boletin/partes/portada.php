<?php
/**
 * Boletín: portada de la edición. Incluido desde render.php (comparte sus variables).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var int $lapaz_id Edición.
 */

$lapaz_titular = lapaz_field_text( 'portada_titular', $lapaz_id );
$lapaz_sumario = lapaz_field_text( 'portada_sumario', $lapaz_id );
$lapaz_firma_n = lapaz_field_text( 'portada_firma_nombre', $lapaz_id );
$lapaz_firma_c = lapaz_field_text( 'portada_firma_cargo', $lapaz_id );
$lapaz_foto    = lapaz_boletin_imagen( get_field( 'portada_foto', $lapaz_id ), '', false );
$lapaz_credito = lapaz_field_text( 'portada_credito', $lapaz_id );
?>
<div class="portada" id="portada">
	<div class="wrap">
		<div>
			<div class="eyebrow"><?php esc_html_e( 'Boletín', 'lapaz' ); ?></div>
			<div class="cabecera-boletin"><?php esc_html_e( 'Caminos de Transformación', 'lapaz' ); ?></div>
			<h1 class="titular"><?php echo esc_html( '' !== $lapaz_titular ? $lapaz_titular : get_the_title( $lapaz_id ) ); ?></h1>
			<?php if ( '' !== $lapaz_sumario ) : ?>
				<p class="sumario"><?php echo esc_html( $lapaz_sumario ); ?></p>
			<?php endif; ?>
			<?php if ( '' !== $lapaz_firma_n || '' !== $lapaz_firma_c ) : ?>
				<div class="firma">
					<div class="rol">
						<?php if ( '' !== $lapaz_firma_n ) : ?>
							<strong><?php echo esc_html( $lapaz_firma_n ); ?></strong>
						<?php endif; ?>
						<?php echo esc_html( $lapaz_firma_c ); ?>
					</div>
				</div>
			<?php endif; ?>
			<a class="btn-entrar" href="#indice"><?php esc_html_e( 'Ver esta edición', 'lapaz' ); ?> <span aria-hidden="true">↓</span></a>
		</div>
		<?php if ( '' !== $lapaz_foto ) : ?>
			<figure>
				<?php echo $lapaz_foto; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() ya escapa. ?>
				<?php if ( '' !== $lapaz_credito ) : ?>
					<figcaption class="credito"><?php echo esc_html( $lapaz_credito ); ?></figcaption>
				<?php endif; ?>
			</figure>
		<?php endif; ?>
	</div>
</div>
