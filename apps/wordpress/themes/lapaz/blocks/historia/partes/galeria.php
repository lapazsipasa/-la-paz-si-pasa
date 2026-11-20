<?php
/**
 * Parte de lapaz/historia: galería y lightbox (lo abre view.js).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var list<array{id: int, alt: string, pie: string, credito: string, grande: string}> $lapaz_galeria
 */


if ( array() === $lapaz_galeria ) {
	return;
}
?>
<section class="seccion-galeria" id="galeria-sec">
	<div class="wrap">
		<div class="sec-head">
			<h2 class="sec-title"><?php esc_html_e( 'Las fotografías', 'lapaz' ); ?></h2>
			<p class="sec-kicker"><?php esc_html_e( 'Pulse una imagen para verla en grande', 'lapaz' ); ?></p>
		</div>
		<div class="galeria">
			<?php foreach ( $lapaz_galeria as $lapaz_foto ) : ?>
				<?php
				/* translators: %s: crédito de la fotografía. */
				$lapaz_credito = '' !== $lapaz_foto['credito'] ? sprintf( __( 'Fotografía: %s', 'lapaz' ), $lapaz_foto['credito'] ) : '';
				$lapaz_pie     = implode( ' — ', array_filter( array( $lapaz_foto['pie'], $lapaz_credito ) ) );
				?>
				<figure>
					<button type="button" data-grande="<?php echo esc_url( $lapaz_foto['grande'] ); ?>" data-pie="<?php echo esc_attr( $lapaz_pie ); ?>">
						<?php
						echo wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapa el <img>.
							$lapaz_foto['id'],
							'medium_large',
							false,
							array(
								'alt'     => $lapaz_foto['alt'],
								'loading' => 'lazy',
								'sizes'   => '(min-width: 850px) 30vw, 100vw',
							)
						);
						?>
					</button>
					<?php if ( '' !== $lapaz_pie ) : ?>
						<figcaption>
							<?php echo esc_html( $lapaz_foto['pie'] ); ?>
							<?php if ( '' !== $lapaz_credito ) : ?>
								<span class="credito"><?php echo esc_html( $lapaz_credito ); ?></span>
							<?php endif; ?>
						</figcaption>
					<?php endif; ?>
				</figure>
			<?php endforeach; ?>
		</div>
	</div>
</section>

<div class="lightbox" role="dialog" aria-modal="true" aria-label="<?php esc_attr_e( 'Fotografía ampliada', 'lapaz' ); ?>" hidden>
	<button class="cerrar" type="button" aria-label="<?php esc_attr_e( 'Cerrar', 'lapaz' ); ?>">×</button>
	<img alt="">
	<p></p>
</div>
