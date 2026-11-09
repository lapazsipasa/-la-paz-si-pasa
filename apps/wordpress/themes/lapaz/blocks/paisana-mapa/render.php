<?php
/**
 * Bloque lapaz/paisana-mapa: PaisSanaMapaIntro + PaisSanaMapaCarrusel + PaisSanaRegionTabBtn.
 * Mismo marcado y clases. Los paneles se identifican con data-region (no con id) para
 * que el JS quede acotado al bloque.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_regiones = lapaz_paisana_regiones();
$lapaz_img      = get_theme_file_uri( 'assets/img/paisana/' );
$lapaz_wrapper  = get_block_wrapper_attributes( array( 'class' => 'paisana-mapa' ) );
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<section class="mapa-intro">
		<div class="mapa-intro-text">
			<h2><?php esc_html_e( 'PAISSANOS EN EL MAPA', 'lapaz' ); ?></h2>
			<p><?php esc_html_e( 'Cada rincón de Colombia guarda una historia de transformación y resiliencia.', 'lapaz' ); ?></p>
			<p><?php esc_html_e( 'En este mapa interactivo reunimos los orígenes de nuestros productores, mostrando la fuerza de los territorios donde se siembra la paz todos los días.', 'lapaz' ); ?></p>

			<div class="instrucciones-navegacion">
				<h3><?php esc_html_e( '¿CÓMO NAVEGARLO?', 'lapaz' ); ?></h3>
				<p><?php esc_html_e( 'Haz', 'lapaz' ); ?> <strong><?php esc_html_e( 'clic sobre el recuadro', 'lapaz' ); ?></strong> <?php esc_html_e( 'con la región de tu interés para conocer las métricas y los departamentos donde estamos presentes.', 'lapaz' ); ?></p>
				<p class="cta-text"><?php esc_html_e( '¡Haz clic en tu región y descubre su talento!', 'lapaz' ); ?></p>
			</div>
		</div>

		<div class="mapa-intro-card">
			<div class="paper-frame">
				<img src="<?php echo esc_url( $lapaz_img . 'mapa-bg-600.webp' ); ?>" alt="" class="bg-paper" width="600" height="500" loading="lazy" decoding="async" />
				<img
					src="<?php echo esc_url( $lapaz_img . 'paisana-retrato-500.webp' ); ?>"
					srcset="<?php echo esc_attr( $lapaz_img . 'paisana-retrato-500.webp 500w, ' . $lapaz_img . 'paisana-retrato-1000.webp 1000w' ); ?>"
					sizes="(min-width: 850px) 40vw, 90vw"
					alt="<?php esc_attr_e( 'Paissanos', 'lapaz' ); ?>" class="retrato-photo" width="500" height="500" loading="lazy" decoding="async"
				/>
			</div>
		</div>
	</section>

	<section class="mapa-carrusel">
		<nav class="region-tabs" aria-label="<?php esc_attr_e( 'Navegación de regiones', 'lapaz' ); ?>">
			<?php foreach ( $lapaz_regiones as $lapaz_i => $lapaz_region ) : ?>
				<button
					type="button"
					class="tab-btn<?php echo 0 === $lapaz_i ? ' active' : ''; ?>"
					data-target="<?php echo esc_attr( $lapaz_region['id'] ); ?>"
					aria-pressed="<?php echo 0 === $lapaz_i ? 'true' : 'false'; ?>"
					style="<?php echo esc_attr( '--tab-color: ' . $lapaz_region['color'] ); ?>"
				>
					<span class="tab-label"><?php esc_html_e( 'REGIÓN', 'lapaz' ); ?></span>
					<span class="tab-name"><?php echo esc_html( $lapaz_region['nombre'] ); ?></span>
				</button>
			<?php endforeach; ?>
		</nav>

		<div class="region-content-container">
			<?php foreach ( $lapaz_regiones as $lapaz_i => $lapaz_region ) : ?>
				<div class="region-content-grid tab-content<?php echo 0 === $lapaz_i ? ' active' : ''; ?>" data-region="<?php echo esc_attr( $lapaz_region['id'] ); ?>">
					<div class="region-stats">
						<div class="total-badge">
							<span class="count"><?php echo esc_html( $lapaz_region['total'] > 0 ? (string) $lapaz_region['total'] : '00' ); ?></span>
							<span class="label"><?php esc_html_e( 'PRODUCTORES', 'lapaz' ); ?></span>
						</div>

						<ul class="deptos-list">
							<?php if ( $lapaz_region['deptos'] ) : ?>
								<?php foreach ( $lapaz_region['deptos'] as $lapaz_depto ) : ?>
									<li><span><?php echo esc_html( $lapaz_depto['nombre'] ); ?>:</span> <strong><?php echo esc_html( str_pad( (string) $lapaz_depto['valor'], 2, '0', STR_PAD_LEFT ) ); ?></strong></li>
								<?php endforeach; ?>
							<?php else : ?>
								<li class="deptos-vacio"><?php esc_html_e( 'Información en desarrollo...', 'lapaz' ); ?></li>
							<?php endif; ?>
						</ul>
					</div>

					<div class="region-map-wrapper">
						<img
							src="<?php echo esc_url( $lapaz_img . 'mapa-' . $lapaz_region['id'] . '-650.webp' ); ?>"
							alt="<?php echo esc_attr( sprintf( /* translators: %s: nombre de la región. */ __( 'Mapa Región %s', 'lapaz' ), $lapaz_region['nombre'] ) ); ?>"
							class="map-image" width="650" height="<?php echo 'pacifica' === $lapaz_region['id'] ? '1046' : '628'; ?>"
							loading="lazy" decoding="async" sizes="(min-width: 850px) 66vw, 100vw"
						/>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
	</section>
</div>
