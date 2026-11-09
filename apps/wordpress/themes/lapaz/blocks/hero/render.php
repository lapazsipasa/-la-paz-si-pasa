<?php
/**
 * Bloque lapaz/hero (Hero.astro).
 *
 * La foto sale del campo SCF hero_imagen de la página de inicio; sin foto se usan
 * los JPEG del tema (sin WebP a propósito: el grano de la foto comprime peor).
 * Es el elemento LCP: eager + fetchpriority=high, y se precarga en el <head>
 * (lapaz_hero_preload), que en temas de bloques se imprime después de pintar la plantilla.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_hero = lapaz_hero_imagen();
lapaz_hero_preload( $lapaz_hero );
?>
<section <?php echo get_block_wrapper_attributes( array( 'class' => 'hero' ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapa los atributos. ?>>
	<?php if ( $lapaz_hero['id'] > 0 ) : ?>
		<?php
		echo wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapa el <img>.
			$lapaz_hero['id'],
			'full',
			false,
			array(
				'class'         => 'hero__bg',
				'sizes'         => '100vw',
				'loading'       => 'eager',
				'fetchpriority' => 'high',
			)
		);
		?>
	<?php else : ?>
		<img
			src="<?php echo esc_url( $lapaz_hero['src'] ); ?>"
			srcset="<?php echo esc_attr( $lapaz_hero['srcset'] ); ?>"
			sizes="100vw"
			width="1200"
			height="800"
			alt=""
			class="hero__bg"
			loading="eager"
			fetchpriority="high"
			decoding="async"
		/>
	<?php endif; ?>
	<a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="hero__logo-link" aria-label="<?php esc_attr_e( 'Ir al inicio', 'lapaz' ); ?>">
		<img src="<?php echo esc_url( get_theme_file_uri( 'assets/img/hero/hero-logo.svg' ) ); ?>" alt="<?php esc_attr_e( 'La Paz Sí Pasa', 'lapaz' ); ?>" class="hero__logo" width="420" />
	</a>
</section>
