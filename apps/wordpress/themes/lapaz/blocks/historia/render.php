<?php
/**
 * Bloque lapaz/historia: página de una historia PaisSana (portada, ficha, video, crónica
 * y galería con lightbox). Las secciones sin datos no se pintan.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variable del bloque.
 *
 * @var WP_Block $block
 */

$lapaz_id = isset( $block->context['postId'] ) && is_numeric( $block->context['postId'] ) ? (int) $block->context['postId'] : get_queried_object_id();
if ( 'historia' !== get_post_type( $lapaz_id ) ) {
	return;
}

$lapaz_lugar   = lapaz_field_text( 'lugar', $lapaz_id );
$lapaz_titulo  = lapaz_field_text( 'portada_titulo', $lapaz_id );
$lapaz_titulo  = '' !== $lapaz_titulo ? $lapaz_titulo : get_the_title( $lapaz_id );
$lapaz_ficha   = lapaz_historia_campo_pares( 'ficha', $lapaz_id, 'dato', 'valor' );
$lapaz_video   = lapaz_historia_video( $lapaz_id );
$lapaz_cronica = lapaz_historia_cronica( $lapaz_id );
$lapaz_galeria = lapaz_historia_galeria( $lapaz_id );
$lapaz_wrapper = get_block_wrapper_attributes();
$lapaz_ytimg   = 'youtube' === $lapaz_video['fuente'] && 0 === $lapaz_video['poster_id'];
lapaz_usa_ytimg( $lapaz_ytimg );
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<?php require __DIR__ . '/partes/portada.php'; ?>

	<?php if ( array() !== $lapaz_ficha ) : ?>
		<section class="seccion-ficha">
			<div class="wrap">
				<dl class="ficha-tec">
					<?php foreach ( $lapaz_ficha as $lapaz_par ) : ?>
						<div><dt><?php echo esc_html( $lapaz_par[0] ); ?></dt><dd><?php echo esc_html( $lapaz_par[1] ); ?></dd></div>
					<?php endforeach; ?>
				</dl>
			</div>
		</section>
	<?php endif; ?>

	<?php require __DIR__ . '/partes/video.php'; ?>
	<?php require __DIR__ . '/partes/cronica.php'; ?>
	<?php require __DIR__ . '/partes/galeria.php'; ?>
</div>
