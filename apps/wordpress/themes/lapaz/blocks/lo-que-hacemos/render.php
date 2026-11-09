<?php
/**
 * Bloque lapaz/lo-que-hacemos: LoQueHacemos + TextoDestacado + Subcuentas + BannerCta
 * + NoticiasTimeline de Astro, con el mismo marcado y las mismas clases.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_subcuentas = lapaz_get_subcuentas();
$lapaz_anios      = lapaz_noticias_por_anio( lapaz_get_noticias() );
$lapaz_cta        = lapaz_noticias_cta_url();
$lapaz_banner     = get_theme_file_uri( 'assets/img/hacemos/' );
$lapaz_wrapper    = get_block_wrapper_attributes(
	array(
		'class' => 'lo-que-hacemos',
		'id'    => 'lo-que-hacemos',
	)
);
?>
<section <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<h2 class="lo-que-hacemos__titulo"><?php esc_html_e( 'Lo que hacemos en el fondo', 'lapaz' ); ?></h2>

	<div class="lo-que-hacemos__grid">
		<div class="lo-que-hacemos__columna">
			<div class="destacado">
				<h3 class="destacado__titulo"><?php esc_html_e( 'Somos el principal vehículo financiero e institucional encargado de garantizar la transparencia, eficiencia y agilidad en la ejecución de los recursos para la implementación de la paz en el país.', 'lapaz' ); ?></h3>
				<p><?php esc_html_e( 'A través de subcuentas estratégicas, articulamos la inversión en proyectos de desarrollo rural, conservación ambiental, infraestructura y fortalecimiento de economías locales. Conectamos la gestión institucional y la cooperación internacional con las necesidades reales de los territorios PDET para consolidar un progreso seguro, sostenible y transparente.', 'lapaz' ); ?></p>
			</div>

			<?php if ( $lapaz_subcuentas ) : ?>
			<div id="subcuentas" class="lo-que-hacemos__subcuentas">
				<h3 class="lo-que-hacemos__subtitulo"><?php esc_html_e( 'Conoce las subcuentas:', 'lapaz' ); ?></h3>
				<div class="subcuentas" role="group" aria-label="<?php esc_attr_e( 'Subcuentas del fondo', 'lapaz' ); ?>">
					<button type="button" class="subcuentas__nav" data-dir="-1" aria-label="<?php esc_attr_e( 'Anterior', 'lapaz' ); ?>">‹</button>
					<ul class="subcuentas__track">
						<?php foreach ( $lapaz_subcuentas as $lapaz_subcuenta ) : ?>
							<li>
								<?php
								echo wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapa el <img>.
									$lapaz_subcuenta['icono_id'],
									'medium',
									false,
									array(
										'alt'     => $lapaz_subcuenta['nombre'],
										'loading' => 'lazy',
									)
								);
								?>
							</li>
						<?php endforeach; ?>
					</ul>
					<button type="button" class="subcuentas__nav" data-dir="1" aria-label="<?php esc_attr_e( 'Siguiente', 'lapaz' ); ?>">›</button>
				</div>
			</div>
			<?php endif; ?>

			<a href="<?php echo esc_url( $lapaz_cta ); ?>" class="banner-cta" target="_blank" rel="noopener">
				<picture>
					<source media="(max-width: 849px)" srcset="<?php echo esc_attr( $lapaz_banner . 'noticias-banner-640.webp 640w, ' . $lapaz_banner . 'noticias-banner-960.webp 960w' ); ?>" sizes="100vw" width="960" height="125" />
					<img src="<?php echo esc_url( $lapaz_banner . 'noticias-banner-1440.webp' ); ?>" width="1440" height="188" alt="<?php esc_attr_e( 'Más noticias del fondo aquí (abre en una pestaña nueva)', 'lapaz' ); ?>" loading="lazy" decoding="async" />
				</picture>
			</a>
		</div>

		<?php if ( $lapaz_anios ) : ?>
		<aside class="timeline" aria-labelledby="timeline-titulo">
			<button type="button" class="timeline__scroll" data-dir="-1" aria-label="<?php esc_attr_e( 'Desplazar hacia arriba', 'lapaz' ); ?>">▲</button>

			<div class="timeline__body">
				<h3 id="timeline-titulo" class="timeline__titulo"><?php esc_html_e( 'Noticias', 'lapaz' ); ?></h3>
				<div class="timeline__list">
					<?php foreach ( $lapaz_anios as $lapaz_anio => $lapaz_noticias ) : ?>
						<div class="timeline__row">
							<div class="timeline__year"><?php echo esc_html( (string) $lapaz_anio ); ?></div>
							<ul class="timeline__news">
								<?php foreach ( $lapaz_noticias as $lapaz_noticia ) : ?>
									<li>
										<a href="<?php echo esc_url( $lapaz_noticia['url'] ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $lapaz_noticia['titulo'] ); ?></a>
									</li>
								<?php endforeach; ?>
							</ul>
						</div>
					<?php endforeach; ?>
				</div>
			</div>

			<button type="button" class="timeline__scroll" data-dir="1" aria-label="<?php esc_attr_e( 'Desplazar hacia abajo', 'lapaz' ); ?>">▼</button>
		</aside>
		<?php endif; ?>
	</div>
</section>
