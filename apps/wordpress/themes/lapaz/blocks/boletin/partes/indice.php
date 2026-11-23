<?php
/**
 * Boletín: índice «En esta edición» con una tarjeta por sección. Incluido desde render.php.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var int                          $lapaz_id        Edición.
 * @var list<array<mixed>>   $lapaz_secciones Secciones.
 */

$lapaz_intro = lapaz_field_text( 'indice_intro', $lapaz_id );
?>
<section class="indice" id="indice">
	<div class="wrap">
		<div class="indice-intro">
			<h2><?php esc_html_e( 'En esta edición', 'lapaz' ); ?></h2>
			<?php if ( '' !== $lapaz_intro ) : ?>
				<p><?php echo esc_html( $lapaz_intro ); ?></p>
			<?php endif; ?>
		</div>
		<div class="indice-grid">
			<?php foreach ( $lapaz_secciones as $lapaz_tema ) : ?>
				<?php
				$lapaz_t_titulo  = lapaz_boletin_str( $lapaz_tema, 'indice_titulo' );
				$lapaz_t_titulo  = '' !== $lapaz_t_titulo ? $lapaz_t_titulo : lapaz_boletin_str( $lapaz_tema, 'titulo' );
				$lapaz_t_titulo  = '' !== $lapaz_t_titulo ? $lapaz_t_titulo : lapaz_boletin_str( $lapaz_tema, 'nombre' ); // Último respaldo: ninguna tarjeta sin enlace.
				$lapaz_t_resumen = lapaz_boletin_str( $lapaz_tema, 'indice_resumen' );
				$lapaz_t_id      = lapaz_boletin_imagen_indice( $lapaz_tema );
				// Tarjetas de ~300 px (4 columnas), ~400 px (2) o a todo el ancho (1): no hace falta el tamaño `large`.
				$lapaz_t_imagen = $lapaz_t_id > 0 ? wp_get_attachment_image(
					$lapaz_t_id,
					'medium_large',
					false,
					array(
						'alt'     => '',
						'loading' => 'lazy',
						'sizes'   => '(min-width: 1200px) 25vw, (min-width: 850px) 50vw, 100vw',
					)
				) : '';
				?>
				<article class="tema">
					<div class="thumb">
						<?php echo $lapaz_t_imagen; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() ya escapa. ?>
						<span class="num"><?php echo esc_html( sprintf( '%02d', lapaz_boletin_num( $lapaz_tema, 'n' ) ) ); ?></span>
					</div>
					<div class="cont">
						<div class="nombre"><?php echo esc_html( lapaz_boletin_str( $lapaz_tema, 'nombre' ) ); ?></div>
						<?php if ( '' !== $lapaz_t_titulo ) : ?>
							<h3><a href="#seccion-<?php echo absint( lapaz_boletin_num( $lapaz_tema, 'n' ) ); ?>"><?php echo esc_html( $lapaz_t_titulo ); ?></a></h3>
						<?php endif; ?>
						<?php if ( '' !== $lapaz_t_resumen ) : ?>
							<p><?php echo esc_html( $lapaz_t_resumen ); ?></p>
						<?php endif; ?>
						<span class="ir" aria-hidden="true"><?php esc_html_e( 'Ir a la sección', 'lapaz' ); ?> <span class="flecha">→</span></span>
					</div>
				</article>
			<?php endforeach; ?>
		</div>
	</div>
</section>
