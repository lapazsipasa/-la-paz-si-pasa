<?php
/**
 * Guía de estilos: criterio de color y fondos, con un ejemplo correcto y uno a evitar.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;
?>
<section class="guia__seccion" id="fondos">
	<h2 class="guia__h2"><?php esc_html_e( 'Color y fondos', 'lapaz' ); ?></h2>
	<p class="guia__nota"><?php esc_html_e( 'Priman los fondos oscuros (el azul del sitio) con texto blanco, para que el celeste destaque como acento. Pocos colores a la vez: verde y naranja solo como acento puntual.', 'lapaz' ); ?></p>
	<div class="guia__reglas">
		<div class="guia__regla guia__regla--bien">
			<p class="guia__veredicto"><?php esc_html_e( 'Correcto', 'lapaz' ); ?></p>
			<div class="guia__panel guia__panel--azul">
				<span class="guia__etiqueta"><?php esc_html_e( 'Historia del mes', 'lapaz' ); ?></span>
				<p class="guia__ej-titulo"><?php esc_html_e( 'Del campo a la feria', 'lapaz' ); ?></p>
				<p><?php esc_html_e( 'Como la portada del boletín: panel azul, texto blanco y el celeste solo en la etiqueta y el botón.', 'lapaz' ); ?></p>
				<div class="wp-block-lapaz-boletin"><div class="portada"><span class="btn"><?php esc_html_e( 'Leer el boletín', 'lapaz' ); ?></span></div></div>
			</div>
		</div>
		<div class="guia__regla guia__regla--mal">
			<p class="guia__veredicto"><?php esc_html_e( 'Evitar', 'lapaz' ); ?></p>
			<div class="guia__panel guia__panel--celeste">
				<span class="guia__etiqueta guia__etiqueta--naranja"><?php esc_html_e( 'Historia del mes', 'lapaz' ); ?></span>
				<p class="guia__ej-titulo guia__ej-titulo--verde"><?php esc_html_e( 'Del campo a la feria', 'lapaz' ); ?></p>
				<p class="guia__ej-nota"><?php esc_html_e( 'Celeste, naranja, verde y azul juntos compiten entre sí.', 'lapaz' ); ?></p>
			</div>
		</div>
	</div>
</section>
