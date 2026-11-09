<?php
/**
 * Bloque lapaz/footer (Footer.astro). Contenido fijo según la cotización.
 *
 * Imágenes en WebP generadas una vez al tamaño en que se muestran (×2 para retina),
 * con width/height reales para no mover el layout. Todas lazy: están al final de la página.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_wrapper = get_block_wrapper_attributes(
	array(
		'class' => 'site-footer',
		'id'    => 'contacto',
	)
);
$lapaz_img     = get_theme_file_uri( 'assets/img/footer/' );
$lapaz_redes   = array(
	array(
		'url'   => 'https://www.fcp.gov.co',
		'texto' => 'fcp.gov.co',
		'icono' => 'icono-web.webp',
	),
	array(
		'url'   => 'https://www.instagram.com/fondo_colombiaenpaz',
		'texto' => '@fondo_colombiaenpaz',
		'icono' => 'icono-insta.webp',
	),
	array(
		'url'   => 'https://x.com/fcolombiaenpaz',
		'texto' => '@fcolombiaenpaz',
		'icono' => 'icono-x.webp',
	),
);
?>
<footer <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<div class="site-footer__media">
		<img
			src="<?php echo esc_url( $lapaz_img . 'footer-foto-600.webp' ); ?>"
			srcset="<?php echo esc_attr( $lapaz_img . 'footer-foto-600.webp 600w, ' . $lapaz_img . 'footer-foto-1200.webp 1200w' ); ?>"
			sizes="(max-width: 849px) 100vw, 30vw"
			width="600" height="683" alt="" class="site-footer__photo" loading="lazy" decoding="async"
		/>
		<img src="<?php echo esc_url( $lapaz_img . 'footer-burst.webp' ); ?>" width="600" height="1199" alt="" class="site-footer__burst" aria-hidden="true" loading="lazy" decoding="async" />
	</div>

	<div class="site-footer__panel">
		<button class="site-footer__totop" type="button" aria-label="<?php esc_attr_e( 'Volver arriba', 'lapaz' ); ?>">
			<img src="<?php echo esc_url( $lapaz_img . 'footer-totop.webp' ); ?>" alt="" width="64" height="64" loading="lazy" decoding="async" />
		</button>

		<div class="site-footer__logos">
			<img src="<?php echo esc_url( $lapaz_img . 'footer-logo.webp' ); ?>" alt="<?php esc_attr_e( 'Fondo Colombia en Paz', 'lapaz' ); ?>" class="site-footer__logo" width="476" height="264" loading="lazy" decoding="async" />
			<img src="<?php echo esc_url( $lapaz_img . 'footer-paz-logo.webp' ); ?>" alt="<?php esc_attr_e( 'La Paz Sí Pasa — pasa en los territorios', 'lapaz' ); ?>" class="site-footer__paz-logo" width="1408" height="282" loading="lazy" decoding="async" />
		</div>

		<p class="site-footer__text">
			<?php esc_html_e( 'La paz no es una promesa, es el trabajo diario de nuestras regiones. La Paz Sí Pasa cuando los sueños del territorio se hacen realidad.', 'lapaz' ); ?>
		</p>

		<div class="site-footer__social">
			<p class="site-footer__social-label"><?php esc_html_e( 'SÍGUENOS:', 'lapaz' ); ?></p>
			<ul class="site-footer__links">
				<?php foreach ( $lapaz_redes as $lapaz_red ) : ?>
					<li>
						<a href="<?php echo esc_url( $lapaz_red['url'] ); ?>" target="_blank" rel="noopener noreferrer">
							<span class="site-footer__icon" aria-hidden="true">
								<img src="<?php echo esc_url( $lapaz_img . $lapaz_red['icono'] ); ?>" alt="" width="16" height="16" loading="lazy" decoding="async" />
							</span>
							<?php echo esc_html( $lapaz_red['texto'] ); ?>
						</a>
					</li>
				<?php endforeach; ?>
			</ul>
		</div>
	</div>
</footer>
