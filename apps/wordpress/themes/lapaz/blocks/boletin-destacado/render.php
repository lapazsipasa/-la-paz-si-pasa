<?php
/**
 * Bloque lapaz/boletin-destacado: tarjeta con la edición publicada más reciente del boletín.
 * Mismo marcado y hoja (editorial.css) que lapaz/historia-destacada. Sin ediciones no pinta nada.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_id = lapaz_boletin_actual();
if ( 0 === $lapaz_id ) {
	return;
}

$lapaz_titular = lapaz_field_text( 'portada_titular', $lapaz_id );
$lapaz_sumario = wp_trim_words( lapaz_field_text( 'portada_sumario', $lapaz_id ), 30 );
$lapaz_numero  = lapaz_boletin_numero( $lapaz_id );
$lapaz_periodo = lapaz_field_text( 'periodo', $lapaz_id );
$lapaz_edicion = trim( ( '' !== $lapaz_numero ? sprintf( '%s %02d', __( 'Edición', 'lapaz' ), (int) $lapaz_numero ) : '' ) . ( '' !== $lapaz_numero && '' !== $lapaz_periodo ? ' · ' : '' ) . $lapaz_periodo );
$lapaz_foto    = lapaz_field_image_id( 'portada_foto', $lapaz_id );
$lapaz_destino = get_post_type_archive_link( 'boletin' );
$lapaz_wrapper = get_block_wrapper_attributes();
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<section class="destacado">
		<div class="wrap">
			<div class="sec-head">
				<h2 class="sec-title"><?php esc_html_e( 'Último boletín', 'lapaz' ); ?></h2>
			</div>
			<div class="dest-card">
				<?php
				echo $lapaz_foto > 0 ? wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapa el <img>.
					$lapaz_foto,
					'large',
					false,
					array(
						'loading' => 'lazy',
						'sizes'   => '(min-width: 850px) 40vw, 100vw',
					)
				) : '';
				?>
				<div class="dest-cont">
					<span class="badge"><?php esc_html_e( 'Boletín · Caminos de Transformación', 'lapaz' ); ?></span>
					<h3><?php echo esc_html( '' !== $lapaz_titular ? $lapaz_titular : get_the_title( $lapaz_id ) ); ?></h3>
					<?php if ( '' !== $lapaz_edicion ) : ?>
						<div class="lugar"><?php echo esc_html( $lapaz_edicion ); ?></div>
					<?php endif; ?>
					<?php if ( '' !== $lapaz_sumario ) : ?>
						<p><?php echo esc_html( $lapaz_sumario ); ?></p>
					<?php endif; ?>
					<a class="btn" href="<?php echo esc_url( false !== $lapaz_destino ? $lapaz_destino : (string) get_permalink( $lapaz_id ) ); ?>"><?php esc_html_e( 'Leer el boletín', 'lapaz' ); ?> <span aria-hidden="true">→</span></a>
				</div>
			</div>
		</div>
	</section>
</div>
