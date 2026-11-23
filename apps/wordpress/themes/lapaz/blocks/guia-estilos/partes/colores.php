<?php
/**
 * Guía de estilos: paleta y combinaciones texto/fondo con contraste WCAG.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var list<array{nombre: string, slug: string, hex: string, var: string}> $lapaz_colores Paleta.
 * @var list<array{texto: array{nombre: string, var: string}, fondo: array{nombre: string, var: string}, ratio: float, normal: bool, grande: bool}> $lapaz_pares Combinaciones.
 */
?>
<section class="guia__seccion" id="colores">
	<h2 class="guia__h2"><?php esc_html_e( 'Colores', 'lapaz' ); ?></h2>
	<ul class="guia__muestras">
		<?php foreach ( $lapaz_colores as $lapaz_c ) : ?>
			<li class="guia__muestra">
				<span class="guia__color" style="<?php echo esc_attr( '--c: var(' . $lapaz_c['var'] . ')' ); ?>"></span>
				<strong class="guia__nombre"><?php echo esc_html( $lapaz_c['nombre'] ); ?></strong>
				<code><?php echo esc_html( $lapaz_c['slug'] ); ?></code>
				<code><?php echo esc_html( $lapaz_c['hex'] ); ?></code>
				<code><?php echo esc_html( $lapaz_c['var'] ); ?></code>
			</li>
		<?php endforeach; ?>
	</ul>

	<h3 class="guia__h3"><?php esc_html_e( 'Combinaciones texto sobre fondo', 'lapaz' ); ?></h3>
	<p class="guia__nota"><?php esc_html_e( 'Relación de contraste WCAG calculada en PHP. AA exige 4,5 para texto normal y 3 para texto grande (desde 24 px, o 19 px en negrita).', 'lapaz' ); ?></p>
	<div class="guia__tabla-caja">
		<table class="guia__tabla">
			<thead>
				<tr>
					<th scope="col"><?php esc_html_e( 'Muestra', 'lapaz' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Texto', 'lapaz' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Fondo', 'lapaz' ); ?></th>
					<th scope="col"><?php esc_html_e( 'Contraste', 'lapaz' ); ?></th>
					<th scope="col"><?php esc_html_e( 'AA normal', 'lapaz' ); ?></th>
					<th scope="col"><?php esc_html_e( 'AA grande', 'lapaz' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( $lapaz_pares as $lapaz_p ) : ?>
					<tr>
						<td><span class="guia__par" style="<?php echo esc_attr( '--t: var(' . $lapaz_p['texto']['var'] . '); --f: var(' . $lapaz_p['fondo']['var'] . ')' ); ?>">Aa</span></td>
						<td><?php echo esc_html( $lapaz_p['texto']['nombre'] ); ?></td>
						<td><?php echo esc_html( $lapaz_p['fondo']['nombre'] ); ?></td>
						<td><?php echo esc_html( number_format_i18n( $lapaz_p['ratio'], 2 ) ); ?> : 1</td>
						<td><?php echo esc_html( $lapaz_p['normal'] ? __( 'Cumple', 'lapaz' ) : __( 'No cumple', 'lapaz' ) ); ?></td>
						<td><?php echo esc_html( $lapaz_p['grande'] ? __( 'Cumple', 'lapaz' ) : __( 'No cumple', 'lapaz' ) ); ?></td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>
	</div>
</section>
