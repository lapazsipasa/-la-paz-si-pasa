<?php
/**
 * Barras de distribución como enlaces al filtro. Espera $lapaz_barras (lapaz_catalogo_barras()).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

if ( ! isset( $lapaz_barras ) ) {
	return;
}
/**
 * Barras.
 *
 * @var list<array{nombre: string, cuenta: int, ancho: string, url: string, activa: bool}> $lapaz_barras
 */
?>
<div class="barras">
	<?php foreach ( $lapaz_barras as $lapaz_barra ) : ?>
		<a class="barra<?php echo $lapaz_barra['activa'] ? ' on' : ''; ?>" href="<?php echo esc_url( $lapaz_barra['url'] ); ?>"<?php echo $lapaz_barra['activa'] ? ' aria-current="true"' : ''; ?>>
			<span class="nm"><?php echo esc_html( $lapaz_barra['nombre'] ); ?></span>
			<span class="pista"><span class="fill" style="width:<?php echo esc_attr( $lapaz_barra['ancho'] ); ?>%"></span></span>
			<span class="v"><?php echo esc_html( number_format_i18n( $lapaz_barra['cuenta'] ) ); ?></span>
		</a>
	<?php endforeach; ?>
</div>
