<?php
/**
 * Bloque lapaz/paisana-productores (PaisSanaProductoresVideos.astro): crónicas en video
 * con Plyr. Plyr se sirve desde el tema (assets/vendor/plyr), no desde su CDN, y se
 * carga recién cuando hace falta (ver view.js).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_videos = lapaz_get_videos_paisana();
lapaz_usa_ytimg( array() !== $lapaz_videos );
$lapaz_plyr    = get_theme_file_uri( 'assets/vendor/plyr/' );
$lapaz_wrapper = get_block_wrapper_attributes(
	array(
		'class'          => 'productores-videos',
		'id'             => 'productores-paissana',
		// Con la versión del tema en la URL: si se actualiza Plyr, el navegador no usa la copia vieja.
		'data-plyr-js'   => add_query_arg( 'ver', lapaz_version(), $lapaz_plyr . 'plyr.min.js' ),
		'data-plyr-css'  => add_query_arg( 'ver', lapaz_version(), $lapaz_plyr . 'plyr.css' ),
		'data-plyr-icon' => $lapaz_plyr . 'plyr.svg',
	)
);
?>
<section <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<div class="productores-header-grid">
		<div class="productores-header-text">
			<h2><?php esc_html_e( 'PRODUCTORES PAISSANA:', 'lapaz' ); ?></h2>
			<h3><?php esc_html_e( 'Historias que transforman: el rostro de la paz', 'lapaz' ); ?></h3>
			<p>
				<?php esc_html_e( 'Detrás de cada producto con el sello PaisSana hay hombres y mujeres valientes que creyeron en el poder de la legalidad, el trabajo asociativo y el desarrollo sostenible.', 'lapaz' ); ?>
				<strong><?php esc_html_e( 'A través de estas crónicas audiovisuales y contenidos, conoce a los verdaderos protagonistas de PaisSana:', 'lapaz' ); ?></strong>
				<?php esc_html_e( 'historias inspiradoras que demuestran cómo la producción local construye una Colombia que sana y avanza.', 'lapaz' ); ?>
			</p>
		</div>
		<div class="productores-header-tucan">
			<img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/paisana/tucan.svg' ) ); ?>" alt="<?php esc_attr_e( 'Tucán', 'lapaz' ); ?>" width="200" height="300" class="tucan-img" loading="lazy" />
		</div>
	</div>

	<div class="videos-list">
		<?php foreach ( $lapaz_videos as $lapaz_i => $lapaz_video ) : ?>
			<article class="video-row-card">
				<div class="video-thumb">
					<?php if ( 'no-disponible' === $lapaz_video['estado'] ) : ?>
						<p class="video-unavailable" role="status"><?php esc_html_e( 'Video no disponible.', 'lapaz' ); ?></p>
					<?php else : ?>
						<button
							type="button"
							class="video-placeholder js-video-placeholder"
							data-source="<?php echo esc_attr( $lapaz_video['fuente'] ); ?>"
							data-src="<?php echo esc_url( lapaz_player_url( $lapaz_video ) ); ?>"
							data-title="<?php echo esc_attr( $lapaz_video['titulo'] ); ?>"
							<?php /* translators: %s: título del video. */ ?>
							aria-label="<?php echo esc_attr( sprintf( __( 'Cargar video: %s', 'lapaz' ), $lapaz_video['titulo'] ) ); ?>"
						>
							<?php echo lapaz_video_thumb( $lapaz_video, '', '(min-width: 850px) 55vw, 100vw' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- lapaz_video_thumb() escapa. ?>
							<span aria-hidden="true">▶</span>
						</button>
					<?php endif; ?>
				</div>
				<div class="video-info">
					<h3><?php echo esc_html( $lapaz_video['titulo'] ); ?></h3>
					<?php /* translators: %d: número de la crónica. */ ?>
					<p class="video-subtitle"><?php echo esc_html( sprintf( __( 'Crónica #%d', 'lapaz' ), $lapaz_i + 1 ) ); ?></p>
					<p class="video-desc"><?php echo esc_html( $lapaz_video['descripcion'] ); ?></p>
				</div>
			</article>
		<?php endforeach; ?>
	</div>
</section>
