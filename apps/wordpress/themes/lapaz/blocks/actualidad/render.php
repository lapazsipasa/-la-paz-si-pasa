<?php
/**
 * Bloque lapaz/actualidad (ActualidadGaleria.astro): video destacado y carrusel «Ver más».
 *
 * El primer video es el destacado. Las cards guardan sus datos en data-* y view.js los
 * copia al destacado; el iframe de YouTube solo se crea al pulsar play.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_videos = lapaz_get_videos();
lapaz_usa_ytimg( array() !== $lapaz_videos );
$lapaz_destacado = $lapaz_videos[0] ?? null;
$lapaz_play_svg  = '<svg viewBox="0 0 24 24" width="%1$d" height="%1$d" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="white" opacity="0.9" /><path d="M9.5 7.5v9l7-4.5z" fill="var(--color-actualidad-bg)" /></svg>';
$lapaz_wrapper   = get_block_wrapper_attributes(
	array(
		'class'           => 'actualidad',
		'id'              => 'actualidad',
		'aria-labelledby' => 'actualidad-titulo',
	)
);
?>
<section <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<h2 id="actualidad-titulo" class="actualidad__titulo"><?php esc_html_e( 'Actualidad', 'lapaz' ); ?></h2>

	<div class="actualidad__contenedor">
		<div class="actualidad__destacado" data-destacado>
			<div class="actualidad__info">
				<h3 class="actualidad__info-titulo" data-campo="titulo"><?php echo esc_html( $lapaz_destacado['titulo'] ?? '' ); ?></h3>
				<p class="actualidad__descripcion" data-campo="descripcion"><?php echo esc_html( $lapaz_destacado['descripcion'] ?? '' ); ?></p>
				<p class="actualidad__etiquetas">
					<?php esc_html_e( 'Etiquetas:', 'lapaz' ); ?>
					<span data-campo="tags">
						<?php foreach ( $lapaz_destacado['tags'] ?? array() as $lapaz_tag ) : ?>
							<span class="actualidad__tag"><?php echo esc_html( $lapaz_tag ); ?></span>
						<?php endforeach; ?>
					</span>
				</p>
			</div>

			<div
				class="actualidad__player"
				data-player
				data-fuente="<?php echo esc_attr( $lapaz_destacado['fuente'] ?? '' ); ?>"
				data-src="<?php echo esc_url( $lapaz_destacado['video_url'] ?? '' ); ?>"
				data-thumbnail="<?php echo esc_url( $lapaz_destacado['thumbnail_url'] ?? '' ); ?>"
			>
				<?php if ( $lapaz_destacado ) : ?>
					<?php echo lapaz_video_thumb( $lapaz_destacado, $lapaz_destacado['titulo'], '(min-width: 850px) 60vw, 100vw', 'data-campo="thumbnail"' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- lapaz_video_thumb() escapa. ?>
				<?php endif; ?>
				<?php if ( $lapaz_destacado ) : ?>
					<?php /* translators: %s: título del video. */ ?>
				<button type="button" class="actualidad__play" aria-label="<?php echo esc_attr( sprintf( __( 'Reproducir %s', 'lapaz' ), $lapaz_destacado['titulo'] ) ); ?>">
					<?php printf( $lapaz_play_svg, 48 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG fijo del tema. ?>
				</button>
				<?php endif; ?>
			</div>
		</div>

		<?php if ( count( $lapaz_videos ) > 1 ) : ?>
			<div class="actualidad__carrusel">
				<h4 class="actualidad__carrusel-titulo"><?php esc_html_e( 'Ver más:', 'lapaz' ); ?></h4>
				<div class="actualidad__carrusel-fila">
					<button type="button" class="actualidad__nav" data-dir="-1" aria-label="<?php esc_attr_e( 'Anterior', 'lapaz' ); ?>">‹</button>

					<ul class="actualidad__track" data-track>
						<?php foreach ( $lapaz_videos as $lapaz_i => $lapaz_video ) : ?>
							<li<?php echo 0 === $lapaz_i ? ' data-activo="true"' : ''; ?>>
								<button
									type="button"
									class="actualidad__card"
									data-video-id="<?php echo esc_attr( (string) $lapaz_video['id'] ); ?>"
									data-titulo="<?php echo esc_attr( $lapaz_video['titulo'] ); ?>"
									data-descripcion="<?php echo esc_attr( $lapaz_video['descripcion'] ); ?>"
									data-fuente="<?php echo esc_attr( $lapaz_video['fuente'] ); ?>"
									data-src="<?php echo esc_url( $lapaz_video['video_url'] ); ?>"
									data-thumbnail="<?php echo esc_url( $lapaz_video['thumbnail_url'] ); ?>"
									data-tags="<?php echo esc_attr( (string) wp_json_encode( $lapaz_video['tags'] ) ); ?>"
								>
									<span class="actualidad__card-thumb">
										<?php echo lapaz_video_thumb( $lapaz_video, '', '280px' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- lapaz_video_thumb() escapa. ?>
										<?php printf( $lapaz_play_svg, 28 ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- SVG fijo del tema. ?>
									</span>
									<span class="actualidad__card-titulo"><?php echo esc_html( $lapaz_video['titulo'] ); ?></span>
								</button>
							</li>
						<?php endforeach; ?>
					</ul>

					<button type="button" class="actualidad__nav" data-dir="1" aria-label="<?php esc_attr_e( 'Siguiente', 'lapaz' ); ?>">›</button>
				</div>
			</div>
		<?php endif; ?>
	</div>
</section>
