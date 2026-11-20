<?php
/**
 * Bloque lapaz/guia-estilos: guía de estilos viva. Lee theme.json en tiempo de ejecución
 * (inc/guia-estilos.php) y la página no se indexa.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_colores   = lapaz_guia_colores();
$lapaz_pares     = lapaz_guia_pares( $lapaz_colores );
$lapaz_familias  = lapaz_guia_familias();
$lapaz_tamanos   = lapaz_guia_tamanos();
$lapaz_espaciado = lapaz_guia_espaciado();
$lapaz_custom    = lapaz_guia_custom();
$lapaz_wrapper   = get_block_wrapper_attributes( array( 'class' => 'guia' ) );
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<header class="guia__cabecera">
		<p class="guia__rotulo"><?php esc_html_e( 'Sistema visual', 'lapaz' ); ?></p>
		<h1 class="guia__titulo"><?php esc_html_e( 'Guía de estilos', 'lapaz' ); ?></h1>
		<p class="guia__intro"><?php esc_html_e( 'Los valores se leen de theme.json al cargar la página: si cambia allí, cambia aquí.', 'lapaz' ); ?></p>
		<nav class="guia__indice" aria-label="<?php esc_attr_e( 'Secciones de la guía', 'lapaz' ); ?>">
			<a href="#colores"><?php esc_html_e( 'Colores', 'lapaz' ); ?></a>
			<a href="#tipografia"><?php esc_html_e( 'Tipografía', 'lapaz' ); ?></a>
			<a href="#medidas"><?php esc_html_e( 'Espaciado y formas', 'lapaz' ); ?></a>
			<a href="#fondos"><?php esc_html_e( 'Color y fondos', 'lapaz' ); ?></a>
			<a href="#componentes"><?php esc_html_e( 'Componentes', 'lapaz' ); ?></a>
		</nav>
	</header>
	<?php
	foreach ( array( 'colores', 'tipografia', 'medidas', 'fondos', 'componentes' ) as $lapaz_parte ) {
		require __DIR__ . '/partes/' . $lapaz_parte . '.php';
	}
	?>
</div>
