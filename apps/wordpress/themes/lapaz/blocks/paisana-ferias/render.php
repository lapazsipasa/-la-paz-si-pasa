<?php
/**
 * Bloque lapaz/paisana-ferias: PaisSanaFeriasIntro + PaisSanaFeriasAcordeon + PaisSanaFeriaItem.
 * Acordeón nativo con <details name> (una feria abierta a la vez, sin JS), galería con
 * lightbox (<dialog>) y carrusel de videos por feria.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_ferias  = lapaz_get_ferias();
$lapaz_abierta = array_search( true, array_column( $lapaz_ferias, 'abierta' ), true );
$lapaz_img     = get_theme_file_uri( 'assets/img/paisana/' );
$lapaz_wrapper = get_block_wrapper_attributes( array( 'class' => 'paisana-ferias' ) );
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<section class="ferias-intro" id="paissana-en-ferias">
		<div class="ferias-intro-grid">
			<div class="ferias-intro-text">
				<h2><?php esc_html_e( 'PAISSANA EN FERIAS:', 'lapaz' ); ?></h2>
				<h3><?php esc_html_e( 'Nuestros productores en las grandes vitrinas del país', 'lapaz' ); ?></h3>
				<p>
					<?php esc_html_e( 'Del campo a los escenarios más grandes de Colombia y el mundo. Revive el recorrido comercial de nuestras organizaciones en eventos como', 'lapaz' ); ?>
					<strong><?php esc_html_e( 'Agroexpo, ChocoShow, Cafés de Colombia, ANATO, Carnaval de Barranquilla e ICCARD', 'lapaz' ); ?></strong>.
				</p>
				<p><?php esc_html_e( 'Aquí se cruzan las miradas, las catas, los intercambios comerciales y el talento para demostrar que en la ruralidad está el futuro.', 'lapaz' ); ?></p>
			</div>

			<div class="ferias-intro-illustration">
				<div class="illustration-wrapper">
					<img
						src="<?php echo esc_url( $lapaz_img . 'ilustracion-productora-400.webp' ); ?>"
						srcset="<?php echo esc_attr( $lapaz_img . 'ilustracion-productora-400.webp 400w, ' . $lapaz_img . 'ilustracion-productora-800.webp 800w' ); ?>"
						sizes="400px" width="400" height="400" alt="<?php esc_attr_e( 'Productora Ferias', 'lapaz' ); ?>"
						class="circular-illustration" loading="lazy" decoding="async"
					/>
				</div>
			</div>
		</div>

		<div class="ferias-landscape-banner">
			<img src="<?php echo esc_url( $lapaz_img . 'paisaje.svg' ); ?>" alt="<?php esc_attr_e( 'Paisaje de Colombia', 'lapaz' ); ?>" width="1200" height="200" class="landscape-img" loading="lazy" />
		</div>
	</section>

	<section class="ferias-acordeon-list">
		<?php foreach ( $lapaz_ferias as $lapaz_i => $lapaz_feria ) : ?>
			<details class="feria-item" name="ferias-acordeon"<?php echo $lapaz_i === $lapaz_abierta ? ' open' : ''; ?>>
				<summary class="feria-header">
					<span class="feria-title"><?php echo esc_html( $lapaz_feria['titulo'] ); ?></span>
					<span class="chevron">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
					</span>
				</summary>
				<div class="feria-body-grid<?php echo array() === $lapaz_feria['videos'] ? ' sin-video' : ''; ?>">
					<div class="feria-left">
						<p class="feria-desc"><?php echo esc_html( $lapaz_feria['descripcion'] ); ?></p>
						<?php if ( $lapaz_feria['galeria'] ) : ?>
							<h3 class="gallery-title"><?php esc_html_e( 'GALERÍA FOTOGRÁFICA', 'lapaz' ); ?></h3>
							<div class="gallery-grid-3x2">
								<?php foreach ( $lapaz_feria['galeria'] as $lapaz_foto ) : ?>
									<?php /* translators: %s: descripción de la foto. */ ?>
									<button type="button" class="gallery-item" data-full-src="<?php echo esc_url( (string) wp_get_attachment_image_url( $lapaz_foto['id'], '1536x1536' ) ); ?>" aria-label="<?php echo esc_attr( sprintf( __( 'Ampliar %s', 'lapaz' ), $lapaz_foto['alt'] ) ); ?>">
										<?php
										echo wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapa el <img>.
											$lapaz_foto['id'],
											'medium_large',
											false,
											array(
												'alt'     => $lapaz_foto['alt'],
												'loading' => 'lazy',
												'sizes'   => '(min-width: 850px) 15vw, 33vw',
											)
										);
										?>
									</button>
								<?php endforeach; ?>
							</div>
						<?php endif; ?>
					</div>
					<?php if ( $lapaz_feria['videos'] ) : ?>
						<div class="feria-right">
							<div class="vertical-video-card" data-carrusel>
								<?php foreach ( $lapaz_feria['videos'] as $lapaz_v => $lapaz_video ) : ?>
									<div class="video-slide"<?php echo 0 !== $lapaz_v ? ' hidden' : ''; ?>>
										<div class="video-media" data-video-source="<?php echo esc_attr( $lapaz_video['fuente'] ); ?>" data-video-src="<?php echo esc_url( $lapaz_video['url'] ); ?>">
											<?php if ( '' !== $lapaz_video['thumbnail'] ) : ?>
												<img src="<?php echo esc_url( $lapaz_video['thumbnail'] ); ?>" alt="<?php echo esc_attr( $lapaz_video['alt'] ); ?>" width="400" height="600" loading="lazy" decoding="async" />
											<?php else : ?>
												<div class="video-media__sin-miniatura" aria-hidden="true"></div>
											<?php endif; ?>
											<?php /* translators: %s: descripción del video. */ ?>
											<button type="button" class="play-btn-overlay" aria-label="<?php echo esc_attr( sprintf( __( 'Reproducir %s', 'lapaz' ), $lapaz_video['alt'] ) ); ?>">
												<svg width="48" height="48" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
											</button>
										</div>
										<?php if ( '' !== $lapaz_video['pie'] ) : ?>
											<p class="video-pie"><?php echo esc_html( $lapaz_video['pie'] ); ?></p>
										<?php endif; ?>
									</div>
								<?php endforeach; ?>
								<?php if ( count( $lapaz_feria['videos'] ) > 1 ) : ?>
									<div class="video-nav">
										<p class="video-contador" aria-live="polite">1 / <?php echo esc_html( (string) count( $lapaz_feria['videos'] ) ); ?></p>
										<div class="video-nav-btns">
											<?php /* translators: %s: feria. */ ?>
											<button type="button" class="video-nav-btn" data-paso="-1" aria-label="<?php echo esc_attr( sprintf( __( 'Video anterior de %s', 'lapaz' ), $lapaz_feria['titulo'] ) ); ?>">
												<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"></polyline></svg>
											</button>
											<?php /* translators: %s: feria. */ ?>
											<button type="button" class="video-nav-btn" data-paso="1" aria-label="<?php echo esc_attr( sprintf( __( 'Video siguiente de %s', 'lapaz' ), $lapaz_feria['titulo'] ) ); ?>">
												<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg>
											</button>
										</div>
									</div>
								<?php endif; ?>
							</div>
						</div>
					<?php endif; ?>
				</div>
			</details>
		<?php endforeach; ?>
	</section>
</div>
