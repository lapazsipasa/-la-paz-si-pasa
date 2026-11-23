<?php
/**
 * Boletín: figura de la columna de medios. Incluido desde render.php (comparte sus variables).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variable del bucle de articulo.php.
 *
 * @var array{img: string, credito: string} $lapaz_foto_fila Foto lista para pintar.
 */
?>
<figure>
	<?php echo $lapaz_foto_fila['img']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() ya escapa. ?>
	<?php if ( '' !== $lapaz_foto_fila['credito'] ) : ?>
		<figcaption class="credito"><?php echo esc_html( $lapaz_foto_fila['credito'] ); ?></figcaption>
	<?php endif; ?>
</figure>
