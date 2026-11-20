<?php
/**
 * Guía de estilos: componentes compartidos, con el marcado real de los bloques editoriales
 * y la hoja lapaz-editorial (declarada en block.json). Cada muestra va dentro del
 * contenedor del bloque al que pertenece, que es lo que esa hoja espera.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;
?>
<section class="guia__seccion" id="componentes">
	<h2 class="guia__h2"><?php esc_html_e( 'Componentes compartidos', 'lapaz' ); ?></h2>
	<p class="guia__nota"><?php esc_html_e( 'Hoja lapaz-editorial, con el marcado de los bloques boletín e historia. Solo se muestran las piezas que esa hoja resuelve por sí sola.', 'lapaz' ); ?></p>
	<div class="guia__comps">
		<div class="guia__comp wp-block-lapaz-boletin">
			<p class="guia__veredicto"><?php esc_html_e( 'Cabecera de sección', 'lapaz' ); ?></p>
			<div class="sec-head">
				<span class="sec-num">01</span>
				<h2 class="sec-title"><?php esc_html_e( 'Voces del campo', 'lapaz' ); ?></h2>
				<p class="sec-kicker"><?php esc_html_e( 'Historias de quienes cultivan', 'lapaz' ); ?></p>
			</div>
		</div>
		<div class="guia__comp wp-block-lapaz-boletin">
			<p class="guia__veredicto"><?php esc_html_e( 'Etiqueta y botón', 'lapaz' ); ?></p>
			<div class="eyebrow"><?php esc_html_e( 'Boletín', 'lapaz' ); ?></div>
			<a class="btn" href="#componentes"><?php esc_html_e( 'Leer más', 'lapaz' ); ?></a>
		</div>
		<div class="guia__comp guia__comp--azul wp-block-lapaz-boletin">
			<p class="guia__veredicto"><?php esc_html_e( 'Botón sobre panel azul', 'lapaz' ); ?></p>
			<div class="portada">
				<h3 class="titular"><?php esc_html_e( 'Caminos de transformación', 'lapaz' ); ?></h3>
				<a class="btn-entrar" href="#componentes"><?php esc_html_e( 'Ver esta edición', 'lapaz' ); ?> <span aria-hidden="true">↓</span></a>
			</div>
		</div>
		<div class="guia__comp wp-block-lapaz-boletin">
			<p class="guia__veredicto"><?php esc_html_e( 'Ficha y crédito', 'lapaz' ); ?></p>
			<div class="ficha">
				<h3><?php esc_html_e( 'Datos de la edición', 'lapaz' ); ?></h3>
				<p><?php esc_html_e( 'Ficha en celeste con título en Komet.', 'lapaz' ); ?></p>
			</div>
			<span class="credito"><?php esc_html_e( 'Foto: nombre del fotógrafo', 'lapaz' ); ?></span>
		</div>
		<div class="guia__comp guia__comp--ancho wp-block-lapaz-boletin">
			<p class="guia__veredicto"><?php esc_html_e( 'Cuerpo editorial y cita', 'lapaz' ); ?></p>
			<div class="cuerpo">
				<p class="bajada"><?php esc_html_e( 'La bajada resume el artículo en dos líneas.', 'lapaz' ); ?></p>
				<p><?php esc_html_e( 'El texto del cuerpo va en Komet Light, con', 'lapaz' ); ?> <strong><?php esc_html_e( 'énfasis en Heavy', 'lapaz' ); ?></strong>.</p>
				<h3><?php esc_html_e( 'Un subtítulo del artículo', 'lapaz' ); ?></h3>
				<blockquote>
					<p><?php esc_html_e( 'Una cita destacada, en Komet Bold.', 'lapaz' ); ?></p>
					<p><?php esc_html_e( 'Nombre de quien habla', 'lapaz' ); ?></p>
				</blockquote>
			</div>
		</div>
	</div>
</section>
