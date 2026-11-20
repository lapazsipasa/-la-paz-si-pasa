<?php
/**
 * Parte de lapaz/historia: video. Con `ninguno` no hay sección. YouTube y archivo se
 * reproducen al pulsar (view.js); el enlace abre en otra pestaña.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var int $lapaz_id
 * @var string $lapaz_titulo
 * @var array{fuente: string, url: string, poster_id: int, poster_url: string} $lapaz_video
 */


if ( 'ninguno' === $lapaz_video['fuente'] ) {
	return;
}

$lapaz_video_kicker = lapaz_field_text( 'video_antetitulo', $lapaz_id );
$lapaz_es_enlace    = 'enlace' === $lapaz_video['fuente'];
$lapaz_play_texto   = $lapaz_es_enlace ? __( 'Ver el video', 'lapaz' ) : __( 'Reproducir el video', 'lapaz' );
?>
<section class="seccion-video">
	<div class="wrap">
		<div class="sec-head">
			<h2 class="sec-title"><?php esc_html_e( 'El video', 'lapaz' ); ?></h2>
			<?php if ( '' !== $lapaz_video_kicker ) : ?>
				<p class="sec-kicker"><?php echo esc_html( $lapaz_video_kicker ); ?></p>
			<?php endif; ?>
		</div>
		<div class="video-wrap" data-fuente="<?php echo esc_attr( $lapaz_video['fuente'] ); ?>" data-src="<?php echo esc_url( $lapaz_video['url'] ); ?>" data-titulo="<?php echo esc_attr( $lapaz_titulo ); ?>">
			<?php
			if ( $lapaz_video['poster_id'] > 0 ) {
				echo wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapa el <img>.
					$lapaz_video['poster_id'],
					'large',
					false,
					array(
						'class'   => 'poster',
						'loading' => 'lazy',
						'sizes'   => '(min-width: 1100px) 1100px, 100vw',
					)
				);
			} elseif ( '' !== $lapaz_video['poster_url'] ) {
				printf(
					'<img class="poster" src="%s" alt="" width="480" height="360" loading="lazy" decoding="async" />',
					esc_url( $lapaz_video['poster_url'] )
				);
			}
			$lapaz_play_html = '<span class="circ" aria-hidden="true">▶</span><span class="txt">' . esc_html( $lapaz_play_texto ) . '</span>';
			if ( $lapaz_es_enlace ) {
				printf( '<a class="play" href="%s" target="_blank" rel="noopener">%s</a>', esc_url( $lapaz_video['url'] ), $lapaz_play_html ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $lapaz_play_html ya escapado.
			} else {
				printf( '<button class="play" type="button">%s</button>', $lapaz_play_html ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $lapaz_play_html ya escapado.
			}
			?>
		</div>
	</div>
</section>
