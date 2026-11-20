<?php
/**
 * Boletín: molde artículo. Incluido desde render.php (comparte sus variables).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variable de render.php.
 *
 * @var array<mixed> $lapaz_seccion Fila de la sección.
 */

$lapaz_a_color   = lapaz_boletin_str( $lapaz_seccion, 'rotulo_color' );
$lapaz_a_clase   = 'rotulo-seccion' . ( in_array( $lapaz_a_color, array( 'verde', 'azul' ), true ) ? ' ' . $lapaz_a_color : '' );
$lapaz_a_rotulo  = lapaz_boletin_str( $lapaz_seccion, 'rotulo' );
$lapaz_a_titulo  = lapaz_boletin_str( $lapaz_seccion, 'titulo' );
$lapaz_a_bajada  = lapaz_boletin_str( $lapaz_seccion, 'bajada' );
$lapaz_a_entrada = lapaz_boletin_str( $lapaz_seccion, 'entradilla' );
$lapaz_a_cuerpo  = lapaz_boletin_str( $lapaz_seccion, 'cuerpo' );
$lapaz_apertura  = lapaz_boletin_imagen( $lapaz_seccion['apertura'] ?? 0 );
$lapaz_a_cred    = lapaz_boletin_str( $lapaz_seccion, 'apertura_credito' );
$lapaz_fotos     = array();
foreach ( lapaz_boletin_filas( $lapaz_seccion, 'fotos' ) as $lapaz_foto_fila ) {
	$lapaz_foto_clase = 'panorama' === lapaz_boletin_str( $lapaz_foto_fila, 'formato' ) ? 'panorama' : 'alto';
	$lapaz_foto_img   = lapaz_boletin_imagen( $lapaz_foto_fila['imagen'] ?? 0, $lapaz_foto_clase );
	if ( '' !== $lapaz_foto_img ) {
		$lapaz_fotos[] = array(
			'img'     => $lapaz_foto_img,
			'credito' => lapaz_boletin_str( $lapaz_foto_fila, 'credito' ),
		);
	}
}
$lapaz_f_titulo = lapaz_boletin_str( $lapaz_seccion, 'ficha_titulo' );
$lapaz_hay_med  = array() !== $lapaz_fotos || '' !== $lapaz_f_titulo;
?>
<?php if ( '' !== $lapaz_apertura ) : ?>
	<figure class="apertura">
		<?php echo $lapaz_apertura; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- wp_get_attachment_image() ya escapa. ?>
		<?php if ( '' !== $lapaz_a_cred ) : ?>
			<figcaption class="credito"><?php echo esc_html( $lapaz_a_cred ); ?></figcaption>
		<?php endif; ?>
	</figure>
<?php endif; ?>
<div class="articulo<?php echo ! empty( $lapaz_seccion['fotos_izquierda'] ) ? ' invertido' : ''; ?>">
	<div class="cuerpo">
		<?php if ( '' !== $lapaz_a_rotulo ) : ?>
			<div class="<?php echo esc_attr( $lapaz_a_clase ); ?>"><?php echo esc_html( $lapaz_a_rotulo ); ?></div>
		<?php endif; ?>
		<?php if ( '' !== $lapaz_a_titulo ) : ?>
			<h2 class="titulo-art"><?php echo esc_html( $lapaz_a_titulo ); ?></h2>
		<?php endif; ?>
		<?php if ( '' !== $lapaz_a_bajada ) : ?>
			<p class="bajada"><?php echo esc_html( $lapaz_a_bajada ); ?></p>
		<?php endif; ?>
		<?php if ( '' !== $lapaz_a_entrada ) : ?>
			<p class="entradilla"><?php echo esc_html( $lapaz_a_entrada ); ?></p>
		<?php endif; ?>
		<?php echo wp_kses_post( $lapaz_a_cuerpo ); ?>
	</div>
	<?php if ( $lapaz_hay_med ) : ?>
		<div class="media">
			<?php
			// Orden de la columna: primera foto, ficha, demás fotos.
			$lapaz_antes   = array_slice( $lapaz_fotos, 0, 1 );
			$lapaz_despues = array_slice( $lapaz_fotos, 1 );
			foreach ( $lapaz_antes as $lapaz_foto_fila ) {
				require __DIR__ . '/foto.php';
			}
			if ( '' !== $lapaz_f_titulo ) {
				require __DIR__ . '/ficha.php';
			}
			foreach ( $lapaz_despues as $lapaz_foto_fila ) {
				require __DIR__ . '/foto.php';
			}
			?>
		</div>
	<?php endif; ?>
</div>
