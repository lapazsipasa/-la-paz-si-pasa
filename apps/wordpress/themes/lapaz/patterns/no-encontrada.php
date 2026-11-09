<?php
/**
 * Title: Página no encontrada
 * Slug: lapaz/no-encontrada
 * Inserter: no
 *
 * Contenido de 404.astro. Patrón PHP para que los textos sean traducibles.
 *
 * @package lapaz
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"tagName":"section","className":"not-found"} -->
<section class="wp-block-group not-found">
	<!-- wp:group -->
	<div class="wp-block-group">
		<!-- wp:heading {"level":1} -->
		<h1 class="wp-block-heading"><?php esc_html_e( 'Página no encontrada', 'lapaz' ); ?></h1>
		<!-- /wp:heading -->

		<!-- wp:paragraph -->
		<p><?php esc_html_e( 'El contenido solicitado no existe o cambió de dirección.', 'lapaz' ); ?></p>
		<!-- /wp:paragraph -->

		<!-- wp:paragraph -->
		<p><a href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Volver al inicio', 'lapaz' ); ?></a></p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->
</section>
<!-- /wp:group -->
