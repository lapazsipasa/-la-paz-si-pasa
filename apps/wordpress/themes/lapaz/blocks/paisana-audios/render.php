<?php
/**
 * Bloque lapaz/paisana-audios (PaisSanaAudioPlayer.astro): reproductor de relatos sonoros
 * sobre el <audio> nativo. Mismo marcado y clases; los relatos van serializados en
 * data-relatos para view.js.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_relatos = lapaz_get_audio_relatos();
$lapaz_inicial = $lapaz_relatos[0] ?? null;
$lapaz_wrapper = get_block_wrapper_attributes(
	array(
		'class'        => 'corazon-campo',
		'id'           => 'escucha-el-corazon-del-campo',
		'data-relatos' => (string) wp_json_encode( $lapaz_relatos ),
	)
);
?>
<section <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<div class="audio-header">
		<div class="header-left">
			<h2>
				<?php esc_html_e( 'EL CORAZÓN', 'lapaz' ); ?><br /><?php esc_html_e( 'DEL CAMPO:', 'lapaz' ); ?><br />
				<span class="highlight"><?php esc_html_e( 'La voz del territorio', 'lapaz' ); ?></span>
			</h2>
		</div>
		<div class="header-right">
			<p>
				<?php esc_html_e( 'Nadie narra la transformación mejor que quienes la viven día a día en el surco, la parcela o el taller.', 'lapaz' ); ?>
				<strong><?php esc_html_e( 'Te invitamos a cerrar los ojos y escuchar estos relatos sonoros grabados directamente en el territorio.', 'lapaz' ); ?></strong>
			</p>
			<p><?php esc_html_e( 'En sus propias voces, las y los productores nos comparten sus memorias, sus sueños y la emoción de ver cómo el trabajo de la tierra está transformando el futuro de sus familias.', 'lapaz' ); ?></p>
		</div>
	</div>

	<div class="audio-player-wrapper">
		<div class="audio-player-card">
			<div class="player-left">
				<div class="producer-info-container">
					<button type="button" class="play-pause-btn" aria-label="<?php esc_attr_e( 'Reproducir audio', 'lapaz' ); ?>" data-audio="play">
						<svg class="icon-play" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
						<svg class="icon-pause" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
					</button>

					<div class="producer-info">
						<h4 data-audio="productor"><?php echo esc_html( $lapaz_inicial['productor'] ?? '' ); ?></h4>
						<p class="brand" data-audio="marca"><?php echo esc_html( $lapaz_inicial['marca'] ?? '' ); ?></p>
						<p class="location" data-audio="lugar"><?php echo esc_html( $lapaz_inicial['lugar'] ?? '' ); ?></p>
					</div>
				</div>
			</div>

			<div class="player-right">
				<div class="timeline">
					<input
						type="range" min="0" value="0" step="1" class="progress-bar" data-audio="progreso"
						max="<?php echo esc_attr( (string) ( $lapaz_inicial['duracionSegundos'] ?? 0 ) ); ?>"
						aria-label="<?php esc_attr_e( 'Progreso del relato', 'lapaz' ); ?>"
					/>
					<div class="timestamps">
						<span data-audio="actual">00:00</span>
						<span data-audio="duracion"><?php echo esc_html( lapaz_formatear_duracion( $lapaz_inicial['duracionSegundos'] ?? 0 ) ); ?></span>
					</div>
				</div>

				<div class="nav-controls">
					<button type="button" class="nav-btn nav-prev" data-audio="anterior" aria-label="<?php esc_attr_e( 'Anterior audio', 'lapaz' ); ?>">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
					</button>
					<button type="button" class="nav-btn nav-next" data-audio="siguiente" aria-label="<?php esc_attr_e( 'Siguiente audio', 'lapaz' ); ?>">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
					</button>
				</div>
			</div>
		</div>
	</div>

	<audio preload="metadata" data-audio="elemento"<?php echo ! empty( $lapaz_inicial['audioUrl'] ) ? ' src="' . esc_url( $lapaz_inicial['audioUrl'] ) . '"' : ''; ?>></audio>
</section>
