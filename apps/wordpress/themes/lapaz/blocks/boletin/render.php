<?php
/**
 * Bloque lapaz/boletin: una edición completa de Caminos de Transformación.
 * En /boletin/<slug>/ pinta esa edición; en /boletin/, la publicada más reciente.
 * Numeración, índice, barra de secciones, anclas y pie salen de las filas de `secciones`.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_id      = lapaz_boletin_mostrado();
$lapaz_wrapper = get_block_wrapper_attributes();
if ( 0 === $lapaz_id || ! function_exists( 'get_field' ) ) {
	?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<h1><?php esc_html_e( 'Caminos de Transformación', 'lapaz' ); ?></h1>
	<p class="sin-edicion"><?php esc_html_e( 'Todavía no hay ninguna edición publicada.', 'lapaz' ); ?></p>
</div>
	<?php
	return;
}

$lapaz_secciones  = lapaz_boletin_secciones( $lapaz_id );
$lapaz_numero     = lapaz_boletin_numero( $lapaz_id );
$lapaz_periodo    = lapaz_field_text( 'periodo', $lapaz_id );
$lapaz_edicion    = trim( ( '' !== $lapaz_numero ? sprintf( '%s %02d', __( 'Edición', 'lapaz' ), (int) $lapaz_numero ) : '' ) . ( '' !== $lapaz_numero && '' !== $lapaz_periodo ? ' · ' : '' ) . $lapaz_periodo );
$lapaz_rotulo     = lapaz_field_text( 'rotulo', $lapaz_id );
$lapaz_creditos   = lapaz_boletin_lineas( lapaz_field_text( 'creditos_foto', $lapaz_id ) );
$lapaz_anteriores = lapaz_boletin_anteriores( $lapaz_id );
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<?php if ( '' !== $lapaz_rotulo || '' !== $lapaz_edicion ) : ?>
	<div class="franja">
		<div class="wrap">
			<?php if ( '' !== $lapaz_rotulo ) : ?>
				<span class="rotulo"><?php echo esc_html( $lapaz_rotulo ); ?></span>
			<?php endif; ?>
			<?php if ( '' !== $lapaz_edicion ) : ?>
				<span class="meta"><?php echo esc_html( $lapaz_edicion ); ?></span>
			<?php endif; ?>
		</div>
	</div>
	<?php endif; ?>

	<?php require __DIR__ . '/partes/portada.php'; ?>

	<?php if ( array() !== $lapaz_secciones ) : ?>
	<nav class="nav" aria-label="<?php esc_attr_e( 'Secciones del boletín', 'lapaz' ); ?>">
		<div class="wrap">
			<a href="#indice"><?php esc_html_e( 'Índice', 'lapaz' ); ?></a>
			<?php foreach ( $lapaz_secciones as $lapaz_seccion ) : ?>
				<a href="#seccion-<?php echo absint( lapaz_boletin_num( $lapaz_seccion, 'n' ) ); ?>"><?php echo esc_html( lapaz_boletin_str( $lapaz_seccion, 'nombre' ) ); ?></a>
			<?php endforeach; ?>
		</div>
	</nav>

		<?php require __DIR__ . '/partes/indice.php'; ?>

		<?php foreach ( $lapaz_secciones as $lapaz_seccion ) : ?>
			<?php
			$lapaz_molde = in_array( $lapaz_seccion['molde'], array( 'cifras', 'tarjetas', 'agenda' ), true ) ? $lapaz_seccion['molde'] : 'articulo';
			$lapaz_clase = 'seccion';
			if ( in_array( $lapaz_molde, array( 'cifras', 'agenda' ), true ) ) {
				$lapaz_clase .= ' ' . $lapaz_molde;
			} elseif ( 0 === lapaz_boletin_num( $lapaz_seccion, 'n' ) % 2 ) {
				$lapaz_clase .= ' papel';
			}
			?>
	<section class="<?php echo esc_attr( $lapaz_clase ); ?>" id="seccion-<?php echo absint( lapaz_boletin_num( $lapaz_seccion, 'n' ) ); ?>">
		<div class="wrap">
			<div class="sec-head">
				<span class="sec-num"><?php echo esc_html( sprintf( '%02d', lapaz_boletin_num( $lapaz_seccion, 'n' ) ) ); ?></span>
				<h2 class="sec-title"><?php echo esc_html( lapaz_boletin_str( $lapaz_seccion, 'nombre' ) ); ?></h2>
				<?php if ( '' !== lapaz_boletin_str( $lapaz_seccion, 'antetitulo' ) ) : ?>
					<p class="sec-kicker"><?php echo esc_html( lapaz_boletin_str( $lapaz_seccion, 'antetitulo' ) ); ?></p>
				<?php endif; ?>
			</div>
			<?php require __DIR__ . '/partes/' . $lapaz_molde . '.php'; ?>
			<a class="volver" href="#indice"><?php esc_html_e( '↑ Volver al índice', 'lapaz' ); ?></a>
		</div>
	</section>
		<?php endforeach; ?>
	<?php endif; ?>

	<?php require __DIR__ . '/partes/pie.php'; ?>
</div>
