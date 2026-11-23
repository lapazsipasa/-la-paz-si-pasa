<?php
/**
 * Guía de estilos: familias y pesos declarados, escala de tamaños y reglas de uso.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variables de render.php.
 *
 * @var list<array{nombre: string, slug: string, pesos: list<array{valor: int, nombre: string, token: string}>}> $lapaz_familias Familias.
 * @var list<array{nombre: string, valor: string, var: string, titulo: bool}> $lapaz_tamanos Tamaños.
 */
?>
<section class="guia__seccion" id="tipografia">
	<h2 class="guia__h2"><?php esc_html_e( 'Tipografía', 'lapaz' ); ?></h2>
	<?php foreach ( $lapaz_familias as $lapaz_f ) : ?>
		<?php $lapaz_es_komet = 'komet' === $lapaz_f['slug']; ?>
		<h3 class="guia__h3"><?php echo esc_html( $lapaz_f['nombre'] ); ?> <code>--wp--preset--font-family--<?php echo esc_html( $lapaz_f['slug'] ); ?></code></h3>
		<ul class="guia__pesos">
			<?php foreach ( $lapaz_f['pesos'] as $lapaz_w ) : ?>
				<li class="guia__peso">
					<span class="guia__especimen<?php echo $lapaz_es_komet ? '' : ' guia__especimen--rotulo'; ?>" style="<?php echo esc_attr( 'font-family: var(--wp--preset--font-family--' . $lapaz_f['slug'] . '); font-weight: ' . $lapaz_w['valor'] ); ?>">
						<?php echo esc_html( $lapaz_es_komet ? 'Café de origen, hecho en Colombia' : 'SECCIÓN 01' ); ?>
					</span>
					<span class="guia__peso-datos">
						<strong><?php echo esc_html( (string) $lapaz_w['valor'] ); ?></strong>
						<?php if ( '' !== $lapaz_w['nombre'] ) : ?>
							<span><?php echo esc_html( $lapaz_w['nombre'] ); ?></span>
							<code><?php echo esc_html( $lapaz_w['token'] ); ?></code>
						<?php endif; ?>
						<?php if ( $lapaz_es_komet && 900 === $lapaz_w['valor'] ) : ?>
							<em><?php esc_html_e( 'Disponible, no se usa: los títulos van en Heavy 800.', 'lapaz' ); ?></em>
						<?php endif; ?>
						<?php if ( ! $lapaz_es_komet && 400 !== $lapaz_w['valor'] ) : ?>
							<em><?php esc_html_e( 'Disponible; lo usan los encabezados del sitio actual. En las secciones nuevas los rótulos van en Regular.', 'lapaz' ); ?></em>
						<?php endif; ?>
					</span>
				</li>
			<?php endforeach; ?>
		</ul>
	<?php endforeach; ?>

	<h3 class="guia__h3"><?php esc_html_e( 'Escala de tamaños', 'lapaz' ); ?></h3>
	<ul class="guia__escala">
		<?php foreach ( $lapaz_tamanos as $lapaz_t ) : ?>
			<li class="guia__tamano">
				<span class="guia__tamano-datos">
					<strong><?php echo esc_html( $lapaz_t['nombre'] ); ?></strong>
					<code><?php echo esc_html( $lapaz_t['valor'] ); ?></code>
					<?php if ( '' !== $lapaz_t['var'] ) : ?>
						<code><?php echo esc_html( $lapaz_t['var'] ); ?></code>
					<?php endif; ?>
				</span>
				<span class="guia__tamano-muestra<?php echo $lapaz_t['titulo'] ? ' guia__tamano-muestra--titulo' : ''; ?>" style="<?php echo esc_attr( 'font-size: ' . $lapaz_t['valor'] ); ?>"><?php esc_html_e( 'Hecho en Colombia', 'lapaz' ); ?></span>
			</li>
		<?php endforeach; ?>
	</ul>

	<h3 class="guia__h3"><?php esc_html_e( 'Reglas de uso', 'lapaz' ); ?></h3>
	<div class="guia__reglas">
		<div class="guia__regla guia__regla--bien">
			<p class="guia__veredicto"><?php esc_html_e( 'Correcto', 'lapaz' ); ?></p>
			<p class="guia__ej-monique">Sección 01</p>
			<p class="guia__ej-nota"><?php esc_html_e( 'Monique Round solo en destacados cortos en mayúsculas (sección, numeración, etiqueta, botón), hoy en Regular 400.', 'lapaz' ); ?></p>
		</div>
		<div class="guia__regla guia__regla--mal">
			<p class="guia__veredicto"><?php esc_html_e( 'Evitar', 'lapaz' ); ?></p>
			<p class="guia__ej-monique guia__ej-monique--mal">Los productores de la región</p>
			<p class="guia__ej-nota"><?php esc_html_e( 'Monique en un título largo en minúsculas: no es para eso; los títulos van en Komet.', 'lapaz' ); ?></p>
		</div>
		<div class="guia__regla guia__regla--bien">
			<p class="guia__veredicto"><?php esc_html_e( 'Correcto', 'lapaz' ); ?></p>
			<p class="guia__ej-titulo">Los productores de la región</p>
			<p class="guia__ej-nota"><?php esc_html_e( 'Títulos en Komet Heavy 800; jerarquías menores en Bold 700.', 'lapaz' ); ?></p>
		</div>
		<div class="guia__regla guia__regla--mal">
			<p class="guia__veredicto"><?php esc_html_e( 'Evitar', 'lapaz' ); ?></p>
			<p class="guia__ej-titulo guia__ej-titulo--mal">Los productores de la región</p>
			<p class="guia__ej-nota"><?php esc_html_e( 'Título en Komet 300: demasiado ligero para destacar. El 300 es del cuerpo de texto.', 'lapaz' ); ?></p>
		</div>
	</div>
</section>
