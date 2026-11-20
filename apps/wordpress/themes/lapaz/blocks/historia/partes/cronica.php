<?php
/**
 * Parte de lapaz/historia: crónica y columna lateral (fotos y ficha).
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var int $lapaz_id
 * @var array{bajada: string, entradilla: string, cuerpo: string, fuente: string, fotos: list<array{id: int, credito: string}>, ficha: list<array{0: string, 1: string}>} $lapaz_cronica
 */


$lapaz_c = $lapaz_cronica;
if ( '' === $lapaz_c['cuerpo'] && '' === $lapaz_c['bajada'] && '' === $lapaz_c['entradilla'] ) {
	return;
}

$lapaz_c_kicker = lapaz_field_text( 'cronica_antetitulo', $lapaz_id );
?>
<section class="seccion-cronica papel">
	<div class="wrap">
		<div class="sec-head">
			<h2 class="sec-title"><?php esc_html_e( 'La crónica', 'lapaz' ); ?></h2>
			<?php if ( '' !== $lapaz_c_kicker ) : ?>
				<p class="sec-kicker"><?php echo esc_html( $lapaz_c_kicker ); ?></p>
			<?php endif; ?>
		</div>
		<div class="cronica">
			<div class="texto">
				<?php if ( '' !== $lapaz_c['bajada'] ) : ?>
					<p class="bajada"><?php echo esc_html( $lapaz_c['bajada'] ); ?></p>
				<?php endif; ?>
				<?php if ( '' !== $lapaz_c['entradilla'] ) : ?>
					<p class="entradilla"><?php echo esc_html( $lapaz_c['entradilla'] ); ?></p>
				<?php endif; ?>
				<?php echo wp_kses_post( $lapaz_c['cuerpo'] ); ?>
				<?php if ( '' !== $lapaz_c['fuente'] ) : ?>
					<div class="fuente"><?php echo wp_kses_post( $lapaz_c['fuente'] ); ?></div>
				<?php endif; ?>
			</div>
			<?php if ( array() !== $lapaz_c['fotos'] || array() !== $lapaz_c['ficha'] ) : ?>
				<aside>
					<?php
					if ( isset( $lapaz_c['fotos'][0] ) ) {
						echo lapaz_historia_foto_cronica( $lapaz_c['fotos'][0] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- la función escapa.
					}
					?>
					<?php if ( array() !== $lapaz_c['ficha'] ) : ?>
						<dl class="ficha-tec una-columna">
							<?php foreach ( $lapaz_c['ficha'] as $lapaz_par ) : ?>
								<div><dt><?php echo esc_html( $lapaz_par[0] ); ?></dt><dd><?php echo esc_html( $lapaz_par[1] ); ?></dd></div>
							<?php endforeach; ?>
						</dl>
					<?php endif; ?>
					<?php foreach ( array_slice( $lapaz_c['fotos'], 1 ) as $lapaz_foto_extra ) : ?>
						<?php echo lapaz_historia_foto_cronica( $lapaz_foto_extra ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- la función escapa. ?>
					<?php endforeach; ?>
				</aside>
			<?php endif; ?>
		</div>
	</div>
</section>
