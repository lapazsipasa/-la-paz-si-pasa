<?php
/**
 * Bloque lapaz/catalogo-portada: hero del catálogo PaisSana con tres cifras que salen
 * de los conteos nativos (productores publicados y términos con productores).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_img     = get_theme_file_uri( 'assets/img/catalogo/' );
$lapaz_cifras  = array(
	array( lapaz_catalogo_total(), __( 'productores registrados', 'lapaz' ) ),
	array( count( lapaz_catalogo_terminos( 'departamento' ) ), __( 'departamentos', 'lapaz' ) ),
	array( count( lapaz_catalogo_terminos( 'categoria_productor' ) ), __( 'categorías de oferta', 'lapaz' ) ),
);
$lapaz_wrapper = get_block_wrapper_attributes();
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<div class="hero">
		<div class="wrap">
			<div>
				<img class="ps-grande" src="<?php echo esc_url( $lapaz_img . 'logo-paissana-blanco.png' ); ?>" alt="<?php esc_attr_e( 'PaisSana', 'lapaz' ); ?>" width="1300" height="480">
				<h1><?php esc_html_e( 'Quienes producen la paz', 'lapaz' ); ?></h1>
				<p class="lead"><?php esc_html_e( 'PaisSana es la marca de certificación del Fondo Colombia en Paz que identifica productos y servicios de municipios PDET y ZOMAC. Este catálogo reúne el registro completo de productores vinculados, con su territorio, su categoría y lo que cultivan, transforman o fabrican.', 'lapaz' ); ?></p>
				<div class="tiles">
					<?php foreach ( $lapaz_cifras as $lapaz_cifra ) : ?>
						<div class="tile"><div class="n"><?php echo esc_html( number_format_i18n( $lapaz_cifra[0] ) ); ?></div><div class="l"><?php echo esc_html( $lapaz_cifra[1] ); ?></div></div>
					<?php endforeach; ?>
				</div>
			</div>
			<figure>
				<img
					src="<?php echo esc_url( $lapaz_img . 'cafetal-contraluz.webp' ); ?>"
					srcset="<?php echo esc_attr( $lapaz_img . 'cafetal-contraluz-800.webp 800w, ' . $lapaz_img . 'cafetal-contraluz.webp 1500w' ); ?>"
					sizes="(min-width: 850px) 45vw, 100vw" width="1500" height="844"
					alt="<?php esc_attr_e( 'Cafetal en la serranía de San Lucas, sur de Bolívar', 'lapaz' ); ?>"
					loading="eager" fetchpriority="high" decoding="async"
				>
			</figure>
		</div>
	</div>
</div>
