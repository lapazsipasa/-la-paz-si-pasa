<?php
/**
 * Bloque lapaz/retratos: RetratosPaz + IntroText + RetratosPazSlider de Astro.
 *
 * Mismo marcado y clases que los componentes de apps/frontend. Los retratos salen
 * del CPT `retrato` (campos SCF foto, descripcion, proyecto, lugar). Sin retratos
 * publicados se pinta el marco vacío, como en Astro, para no descuadrar la grilla.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_retratos = lapaz_get_retratos();
$lapaz_img      = get_theme_file_uri( 'assets/img/retratos/' );
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'retratos-paz' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapa los atributos. ?>>
	<div class="retratos-texto">
		<img class="retratos-texto__sello" src="<?php echo esc_url( $lapaz_img . 'logo-fondo-paz.svg' ); ?>" width="160" height="96" alt="<?php esc_attr_e( 'Fondo Colombia en Paz', 'lapaz' ); ?>" />

		<div>
			<h1 class="retratos-texto__titulo"><?php esc_html_e( 'La Paz Sí Pasa,', 'lapaz' ); ?><br /><?php esc_html_e( 'pasa en los territorios', 'lapaz' ); ?></h1>

			<p class="retratos-texto__parrafo">
				<?php esc_html_e( 'La paz no se queda en los escritorios; la paz es una realidad tangible que se vive en las regiones y en las comunidades que lideran el cambio. Con la estrategia La Paz Sí Pasa, visibilizamos las cifras, los logros y las historias reales que demuestran que la transformación del campo colombiano es imparable. A través de crónicas y datos de gestión,', 'lapaz' ); ?>
				<strong><?php esc_html_e( 'abrimos una ventana al corazón de las regiones para mostrar los resultados de un esfuerzo que conecta la legalidad con el progreso sostenible.', 'lapaz' ); ?></strong>
			</p>

			<p class="retratos-texto__destacado">
				<?php esc_html_e( 'Porque la transformación se consolida allí donde debe pasar: en los territorios y de la mano de su gente.', 'lapaz' ); ?>
			</p>
		</div>
	</div>

		<section class="retratos-slider" aria-roledescription="<?php esc_attr_e( 'carrusel', 'lapaz' ); ?>" aria-label="<?php esc_attr_e( 'Retratos de la Paz', 'lapaz' ); ?>">
			<div class="retratos-slider__page">
				<div class="retratos-slider__visual">
					<picture class="retratos-slider__background">
						<source media="(max-width: 849px)" srcset="<?php echo esc_url( $lapaz_img . 'retratos-fondo-mb-600.webp' ); ?>" width="600" height="437" />
						<img src="<?php echo esc_url( $lapaz_img . 'retratos-fondo-1100.webp' ); ?>" width="1100" height="827" alt="" loading="lazy" decoding="async" />
					</picture>

					<?php foreach ( $lapaz_retratos as $lapaz_i => $lapaz_retrato ) : ?>
						<?php
						echo wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapa el <img>.
							$lapaz_retrato['foto_id'],
							'1536x1536',
							false,
							array(
								'class'         => 'retratos-slider__foto',
								'alt'           => $lapaz_retrato['descripcion'],
								'sizes'         => '(min-width: 850px) 45vw, 55vw',
								// La primera se carga sin esperar (en escritorio queda al borde del primer pantallazo),
								// pero sin prioridad alta: competía con el hero, que es el LCP.
								'loading'       => 0 === $lapaz_i ? 'eager' : 'lazy',
								'fetchpriority' => 'auto',
								'data-slide'    => (string) $lapaz_i,
								'aria-hidden'   => 0 === $lapaz_i ? 'false' : 'true',
							)
						);
						?>
					<?php endforeach; ?>

					<button type="button" class="retratos-slider__arrow retratos-slider__arrow--prev" aria-label="<?php esc_attr_e( 'Retrato anterior', 'lapaz' ); ?>">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.91 22.27" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.64,5.25l-5.37,4.47c-.99.86-.98,2.27.03,3.11l5.46,4.36c.35.25.76,1.15.77,1.55l.02,2.01c.01,1.3-1.33,1.97-2.34,1.23L.79,14.05c-.3-.25-.76-1.15-.77-1.6L0,10.24c0-.45.44-1.36.74-1.61L10.98.5c1-.76,2.36-.12,2.37,1.13l.02,2.06c0,.4-.39,1.31-.74,1.56ZM29,5.08l-5.37,4.47c-.99.86-.98,2.27.03,3.11l5.46,4.36c.35.25.76,1.15.77,1.55l.02,2.01c.01,1.3-1.33,1.97-2.34,1.23l-10.41-7.91c-.3-.25-.76-1.15-.77-1.6l-.02-2.21c0-.45.44-1.36.73-1.61L27.34.33c1-.76,2.36-.12,2.37,1.13l.02,2.06c0,.4-.39,1.31-.74,1.56Z"/></svg>
					</button>
					<button type="button" class="retratos-slider__arrow retratos-slider__arrow--next" aria-label="<?php esc_attr_e( 'Retrato siguiente', 'lapaz' ); ?>">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.91 22.27" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.64,5.25l-5.37,4.47c-.99.86-.98,2.27.03,3.11l5.46,4.36c.35.25.76,1.15.77,1.55l.02,2.01c.01,1.3-1.33,1.97-2.34,1.23L.79,14.05c-.3-.25-.76-1.15-.77-1.6L0,10.24c0-.45.44-1.36.74-1.61L10.98.5c1-.76,2.36-.12,2.37,1.13l.02,2.06c0,.4-.39,1.31-.74,1.56ZM29,5.08l-5.37,4.47c-.99.86-.98,2.27.03,3.11l5.46,4.36c.35.25.76,1.15.77,1.55l.02,2.01c.01,1.3-1.33,1.97-2.34,1.23l-10.41-7.91c-.3-.25-.76-1.15-.77-1.6l-.02-2.21c0-.45.44-1.36.73-1.61L27.34.33c1-.76,2.36-.12,2.37,1.13l.02,2.06c0,.4-.39,1.31-.74,1.56Z"/></svg>
					</button>
				</div>

				<div class="retratos-slider__texto">
					<h2 class="retratos-slider__titulo"><?php esc_html_e( 'Retratos de la Paz', 'lapaz' ); ?></h2>
					<p class="retratos-slider__etiqueta"><?php esc_html_e( 'Galería', 'lapaz' ); ?><br /><?php esc_html_e( 'fotográfica', 'lapaz' ); ?></p>

					<?php foreach ( $lapaz_retratos as $lapaz_i => $lapaz_retrato ) : ?>
						<div class="retratos-slider__campos" data-slide="<?php echo esc_attr( (string) $lapaz_i ); ?>" aria-hidden="<?php echo 0 === $lapaz_i ? 'false' : 'true'; ?>">
							<p class="retratos-slider__descripcion"><?php echo esc_html( $lapaz_retrato['descripcion'] ); ?></p>
							<p class="retratos-slider__campo"><strong><?php esc_html_e( 'Proyecto:', 'lapaz' ); ?></strong><br /><?php echo esc_html( $lapaz_retrato['proyecto'] ); ?></p>
							<p class="retratos-slider__campo"><strong><?php esc_html_e( 'Lugar:', 'lapaz' ); ?></strong><br /><?php echo esc_html( $lapaz_retrato['lugar'] ); ?></p>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
		</section>
</section>
