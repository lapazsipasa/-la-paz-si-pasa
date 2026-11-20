<?php
/**
 * Parte de lapaz/historia: enlace de regreso y portada. Usa las variables de render.php.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var int $lapaz_id
 * @var string $lapaz_lugar
 * @var string $lapaz_titulo
 */


$lapaz_portada = lapaz_field_image_id( 'portada_foto', $lapaz_id );
$lapaz_sub     = lapaz_field_text( 'portada_subtitulo', $lapaz_id );
?>
<div class="volver-top">
	<div class="wrap"><a href="<?php echo esc_url( home_url( '/paissana/' ) ); ?>"><?php esc_html_e( '← Volver al catálogo', 'lapaz' ); ?></a></div>
</div>

<div class="port-prod">
	<?php
	echo $lapaz_portada > 0 ? wp_get_attachment_image( // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- core escapa el <img>.
		$lapaz_portada,
		'full',
		false,
		array(
			'loading'       => 'eager',
			'fetchpriority' => 'high',
			'sizes'         => '100vw',
		)
	) : '';
	?>
	<div class="sobre">
		<div class="wrap">
			<div class="et">
				<?php
				/* translators: %s: lugar de la historia. */
				echo esc_html( '' !== $lapaz_lugar ? sprintf( __( 'PaisSano destacado · %s', 'lapaz' ), $lapaz_lugar ) : __( 'PaisSano destacado', 'lapaz' ) );
				?>
			</div>
			<h1><?php echo esc_html( $lapaz_titulo ); ?></h1>
			<?php if ( '' !== $lapaz_sub ) : ?>
				<p class="sub"><?php echo esc_html( $lapaz_sub ); ?></p>
			<?php endif; ?>
		</div>
	</div>
</div>
