<?php
/**
 * Parte de lapaz/historia: «Otras historias» (como «Otras ediciones» del boletín). Usa las variables de render.php.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var list<array{titulo: string, lugar: string, url: string}> $lapaz_otras Las demás historias publicadas.
 */
?>
<?php if ( array() !== $lapaz_otras ) : ?>
<section class="anteriores">
	<div class="wrap">
		<h2><?php esc_html_e( 'Otras historias', 'lapaz' ); ?></h2>
		<ul>
			<?php foreach ( $lapaz_otras as $lapaz_otra ) : ?>
				<li>
					<a href="<?php echo esc_url( $lapaz_otra['url'] ); ?>"><?php echo esc_html( $lapaz_otra['titulo'] ); ?></a>
					<?php if ( '' !== $lapaz_otra['lugar'] ) : ?>
						<span><?php echo esc_html( $lapaz_otra['lugar'] ); ?></span>
					<?php endif; ?>
				</li>
			<?php endforeach; ?>
		</ul>
	</div>
</section>
<?php endif; ?>
