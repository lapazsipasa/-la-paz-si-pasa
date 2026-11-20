<?php
/**
 * Bloque lapaz/catalogo-banner: banner que lleva al catálogo de productores, con las tres
 * cifras en vivo y un buscador que envía a /productores/?buscar=… (sin JavaScript).
 * Sin productores publicados no pinta nada.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

if ( 0 === lapaz_catalogo_total() ) {
	return;
}

$lapaz_buscar  = __( 'Buscar productor, producto o municipio', 'lapaz' );
$lapaz_wrapper = get_block_wrapper_attributes();
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<section class="cat-banner" aria-labelledby="catalogo-banner-titulo">
		<div class="cat-texto">
			<img class="cat-logo" src="<?php echo esc_url( get_theme_file_uri( 'assets/img/catalogo/logo-paissana-blanco.png' ) ); ?>" alt="<?php esc_attr_e( 'PaisSana', 'lapaz' ); ?>" width="1300" height="480" loading="lazy" decoding="async">
			<span class="eyebrow"><?php esc_html_e( 'Catálogo PaisSana', 'lapaz' ); ?></span>
			<h2 class="titular" id="catalogo-banner-titulo"><?php esc_html_e( 'Encuentra a quienes producen la paz', 'lapaz' ); ?></h2>
			<p class="apoyo"><?php esc_html_e( 'Productores de municipios PDET y ZOMAC, con su territorio, su categoría y lo que cultivan, transforman o fabrican.', 'lapaz' ); ?></p>
			<ul class="cat-cifras">
				<?php foreach ( lapaz_catalogo_cifras() as $lapaz_cifra ) : ?>
					<li><span class="n"><?php echo esc_html( number_format_i18n( $lapaz_cifra[0] ) ); ?></span><span class="l"><?php echo esc_html( $lapaz_cifra[1] ); ?></span></li>
				<?php endforeach; ?>
			</ul>
		</div>
		<div class="cat-accion">
			<form class="filtros" method="get" action="<?php echo esc_url( lapaz_url_catalogo() ); ?>" role="search">
				<label class="busca">
					<span aria-hidden="true">⌕</span>
					<input type="search" name="buscar" maxlength="100" placeholder="<?php esc_attr_e( 'Productor, producto o municipio', 'lapaz' ); ?>" aria-label="<?php echo esc_attr( $lapaz_buscar ); ?>" autocomplete="off">
				</label>
				<button type="submit" class="btn"><?php esc_html_e( 'Buscar', 'lapaz' ); ?></button>
			</form>
			<a class="btn btn-sec" href="<?php echo esc_url( lapaz_url_catalogo() ); ?>"><?php esc_html_e( 'Explorar el catálogo', 'lapaz' ); ?> <span aria-hidden="true">→</span></a>
		</div>
	</section>
</div>
