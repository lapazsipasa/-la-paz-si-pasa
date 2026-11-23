<?php
/**
 * Guía de estilos: espaciado y valores de settings.custom con su muestra.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var list<array{slug: string, valor: string, var: string}> $lapaz_espaciado Espaciado.
 * @var list<array{grupo: string, clave: string, valor: string, var: string}> $lapaz_custom Valores custom.
 */
?>
<section class="guia__seccion" id="medidas">
	<h2 class="guia__h2"><?php esc_html_e( 'Espaciado, radios y sombras', 'lapaz' ); ?></h2>
	<h3 class="guia__h3"><?php esc_html_e( 'Espaciado', 'lapaz' ); ?></h3>
	<ul class="guia__espacios">
		<?php foreach ( $lapaz_espaciado as $lapaz_e ) : ?>
			<li class="guia__espacio">
				<code><?php echo esc_html( $lapaz_e['slug'] ); ?></code>
				<span class="guia__barra" style="<?php echo esc_attr( 'inline-size: var(' . $lapaz_e['var'] . ')' ); ?>"></span>
				<code><?php echo esc_html( $lapaz_e['valor'] ); ?></code>
				<code><?php echo esc_html( $lapaz_e['var'] ); ?></code>
			</li>
		<?php endforeach; ?>
	</ul>

	<h3 class="guia__h3"><?php esc_html_e( 'Valores personalizados', 'lapaz' ); ?></h3>
	<ul class="guia__custom">
		<?php foreach ( $lapaz_custom as $lapaz_v ) : ?>
			<?php
			$lapaz_estilo   = lapaz_guia_estilo_custom( $lapaz_v['grupo'], $lapaz_v['var'] );
			$lapaz_es_texto = in_array( $lapaz_v['grupo'], array( 'letter-spacing', 'font-weight' ), true );
			?>
			<li class="guia__valor">
				<span class="guia__valor-muestra<?php echo $lapaz_es_texto ? ' guia__valor-muestra--texto' : ''; ?>" style="<?php echo esc_attr( $lapaz_estilo ); ?>"><?php echo $lapaz_es_texto ? 'AaBb' : ''; ?></span>
				<strong><?php echo esc_html( $lapaz_v['grupo'] . ' · ' . $lapaz_v['clave'] ); ?></strong>
				<code><?php echo esc_html( $lapaz_v['valor'] ); ?></code>
				<code><?php echo esc_html( $lapaz_v['var'] ); ?></code>
			</li>
		<?php endforeach; ?>
	</ul>
</section>
