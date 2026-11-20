<?php
/**
 * Bloque lapaz/historia-destacada: tarjeta «PaisSano destacado» con la historia publicada
 * más reciente. Sin historias publicadas no pinta nada.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_id = lapaz_historia_reciente();
if ( 0 === $lapaz_id ) {
	return;
}

$lapaz_antetitulo = lapaz_field_text( 'antetitulo', $lapaz_id );
$lapaz_lugar      = lapaz_field_text( 'lugar', $lapaz_id );
$lapaz_resumen    = lapaz_field_text( 'resumen', $lapaz_id );
$lapaz_foto       = lapaz_field_image_id( 'foto', $lapaz_id );
$lapaz_cifras     = lapaz_historia_campo_pares( 'cifras', $lapaz_id, 'texto', 'numero' );
$lapaz_wrapper    = get_block_wrapper_attributes();
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<section class="destacado" id="destacado">
		<div class="wrap">
			<div class="sec-head">
				<h2 class="sec-title"><?php esc_html_e( 'PaisSano destacado', 'lapaz' ); ?></h2>
				<?php if ( '' !== $lapaz_antetitulo ) : ?>
					<p class="sec-kicker"><?php echo esc_html( $lapaz_antetitulo ); ?></p>
				<?php endif; ?>
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
					<span class="badge"><?php esc_html_e( 'Historia del mes', 'lapaz' ); ?></span>
					<h3><?php echo esc_html( get_the_title( $lapaz_id ) ); ?></h3>
					<?php if ( '' !== $lapaz_lugar ) : ?>
						<div class="lugar"><?php echo esc_html( $lapaz_lugar ); ?></div>
					<?php endif; ?>
					<?php if ( '' !== $lapaz_resumen ) : ?>
						<p><?php echo esc_html( $lapaz_resumen ); ?></p>
					<?php endif; ?>
					<?php if ( array() !== $lapaz_cifras ) : ?>
						<div class="mini">
							<?php foreach ( $lapaz_cifras as $lapaz_cifra ) : ?>
								<div><span><?php echo esc_html( $lapaz_cifra[1] ); ?></span><small><?php echo esc_html( $lapaz_cifra[0] ); ?></small></div>
							<?php endforeach; ?>
						</div>
					<?php endif; ?>
					<a class="btn verde" href="<?php echo esc_url( (string) get_permalink( $lapaz_id ) ); ?>"><?php esc_html_e( 'Ver la historia completa', 'lapaz' ); ?> <span aria-hidden="true">→</span></a>
				</div>
			</div>
		</div>
	</section>
</div>
