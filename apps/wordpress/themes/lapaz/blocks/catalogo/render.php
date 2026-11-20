<?php
/**
 * Bloque lapaz/catalogo: buscador, resultados y distribución del catálogo PaisSana.
 *
 * Sin JavaScript es un formulario GET que el servidor responde ya filtrado. Con JavaScript
 * (view.js), el router de la Interactivity API cambia solo las dos regiones (resultados y
 * distribución) sin recargar. Consulta y conteos en inc/catalogo.php.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_filtros    = lapaz_catalogo_filtros();
$lapaz_consulta   = lapaz_catalogo_consulta( $lapaz_filtros );
$lapaz_total      = lapaz_catalogo_total();
$lapaz_encontrado = $lapaz_consulta->found_posts;
$lapaz_resumen    = lapaz_catalogo_resumen( $lapaz_filtros );
$lapaz_accion     = lapaz_catalogo_url(
	$lapaz_filtros,
	array(
		'buscar'       => '',
		'departamento' => '',
		'categoria'    => array(),
		'tiempo'       => '',
		'ver'          => 0,
	)
);

wp_interactivity_state(
	'lapaz/catalogo',
	array(
		'activo'   => false,
		'cargando' => false,
	)
);

$lapaz_wrapper = get_block_wrapper_attributes(
	array(
		'data-wp-interactive'         => 'lapaz/catalogo',
		'data-wp-init'                => 'callbacks.iniciar',
		'data-wp-class--js-activo'    => 'state.activo',
		'data-wp-on--submit'          => 'actions.enviar',
		'data-wp-on--input'           => 'actions.escribir',
		'data-wp-on--change'          => 'actions.cambiar',
		'data-wp-on--click'           => 'actions.clic',
		'data-wp-on-window--popstate' => 'callbacks.sincronizar',
	)
);
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<section id="explorar">
		<div class="wrap">
			<div class="sec-head">
				<h2 class="sec-title"><?php esc_html_e( 'Explorar el catálogo', 'lapaz' ); ?></h2>
				<p class="sec-kicker"><?php esc_html_e( 'Filtre por territorio, categoría o nombre', 'lapaz' ); ?></p>
			</div>

			<form class="filtros" id="catalogo-filtros" method="get" action="<?php echo esc_url( $lapaz_accion ); ?>" role="search">
				<label class="busca">
					<span aria-hidden="true">⌕</span>
					<input type="search" name="buscar" value="<?php echo esc_attr( $lapaz_filtros['buscar'] ); ?>" maxlength="100" placeholder="<?php esc_attr_e( 'Productor, producto o municipio', 'lapaz' ); ?>" aria-label="<?php esc_attr_e( 'Buscar productor, producto o municipio', 'lapaz' ); ?>" autocomplete="off">
				</label>
				<select name="departamento" aria-label="<?php esc_attr_e( 'Filtrar por departamento', 'lapaz' ); ?>">
					<option value=""><?php esc_html_e( 'Todos los departamentos', 'lapaz' ); ?></option>
					<?php foreach ( lapaz_catalogo_terminos( 'departamento' ) as $lapaz_term ) : ?>
						<option value="<?php echo esc_attr( $lapaz_term->slug ); ?>"<?php selected( $lapaz_filtros['departamento'], $lapaz_term->slug ); ?>><?php echo esc_html( $lapaz_term->name ); ?></option>
					<?php endforeach; ?>
				</select>
				<select name="tiempo" aria-label="<?php esc_attr_e( 'Filtrar por tiempo de operación', 'lapaz' ); ?>">
					<option value=""><?php esc_html_e( 'Cualquier tiempo de operación', 'lapaz' ); ?></option>
					<?php foreach ( lapaz_catalogo_tiempos() as $lapaz_term ) : ?>
						<option value="<?php echo esc_attr( $lapaz_term->slug ); ?>"<?php selected( $lapaz_filtros['tiempo'], $lapaz_term->slug ); ?>><?php echo esc_html( $lapaz_term->name ); ?></option>
					<?php endforeach; ?>
				</select>
				<button type="submit" class="btn buscar"><?php esc_html_e( 'Buscar', 'lapaz' ); ?></button>
			</form>

			<div class="chips" role="group" aria-label="<?php esc_attr_e( 'Filtrar por categoría', 'lapaz' ); ?>">
				<?php foreach ( lapaz_catalogo_terminos( 'categoria_productor' ) as $lapaz_term ) : ?>
					<label class="chip">
						<input type="checkbox" form="catalogo-filtros" name="categoria[]" value="<?php echo esc_attr( $lapaz_term->slug ); ?>"<?php checked( in_array( $lapaz_term->slug, $lapaz_filtros['categoria'], true ) ); ?>>
						<span><?php echo esc_html( $lapaz_term->name ); ?></span>
					</label>
				<?php endforeach; ?>
			</div>

			<div class="resultados" data-wp-interactive="lapaz/catalogo" data-wp-router-region="lapaz-catalogo-resultados" data-wp-class--cargando="state.cargando">
				<p class="conteo" aria-live="polite">
					<?php
					echo wp_kses(
						sprintf(
							/* translators: 1: productores que coinciden, 2: total de productores. */
							esc_html__( '%1$s de %2$s productores', 'lapaz' ),
							'<b>' . esc_html( number_format_i18n( $lapaz_encontrado ) ) . '</b>',
							esc_html( number_format_i18n( $lapaz_total ) )
						) . ( '' !== $lapaz_resumen ? ' · ' . esc_html( $lapaz_resumen ) : '' ),
						array( 'b' => array() )
					);
					?>
				</p>
				<?php if ( $lapaz_consulta->have_posts() ) : ?>
					<div class="grid">
						<?php
						foreach ( $lapaz_consulta->posts ?? array() as $lapaz_post ) {
							if ( $lapaz_post instanceof WP_Post ) {
								$lapaz_tarjeta = lapaz_catalogo_tarjeta( $lapaz_post );
								require __DIR__ . '/partes/tarjeta.php';
							}
						}
						?>
					</div>
				<?php else : ?>
					<div class="vacio"><?php esc_html_e( 'No hay productores que coincidan con esos filtros. Pruebe con menos criterios.', 'lapaz' ); ?></div>
				<?php endif; ?>
				<?php if ( $lapaz_encontrado > $lapaz_filtros['ver'] ) : ?>
					<a class="btn mas" href="<?php echo esc_url( lapaz_catalogo_url( $lapaz_filtros, array( 'ver' => $lapaz_filtros['ver'] + LAPAZ_CATALOGO_TANDA ) ) ); ?>"><?php esc_html_e( 'Ver más productores', 'lapaz' ); ?></a>
				<?php endif; ?>
			</div>
		</div>
	</section>

	<section class="distribucion papel" id="distribucion" data-wp-interactive="lapaz/catalogo" data-wp-router-region="lapaz-catalogo-distribucion">
		<div class="wrap">
			<div class="sec-head">
				<h2 class="sec-title"><?php esc_html_e( 'Cómo se distribuye el registro', 'lapaz' ); ?></h2>
				<p class="sec-kicker"><?php esc_html_e( 'Pulse una barra para filtrar el catálogo', 'lapaz' ); ?></p>
			</div>
			<div class="dist">
				<div>
					<h3><?php esc_html_e( 'Productores por departamento', 'lapaz' ); ?></h3>
					<p class="nota">
						<?php
						/* translators: %s: número de departamentos con productores. */
						echo esc_html( sprintf( __( 'Departamento donde opera la unidad productiva. Se muestran los quince primeros de %s.', 'lapaz' ), number_format_i18n( count( lapaz_catalogo_terminos( 'departamento' ) ) ) ) );
						?>
					</p>
					<?php
					$lapaz_barras = lapaz_catalogo_barras( 'departamento', $lapaz_filtros );
					require __DIR__ . '/partes/barras.php';
					?>
				</div>
				<div>
					<h3><?php esc_html_e( 'Productores por categoría', 'lapaz' ); ?></h3>
					<p class="nota"><?php esc_html_e( 'Un productor puede registrar oferta en más de una categoría.', 'lapaz' ); ?></p>
					<?php
					$lapaz_barras = lapaz_catalogo_barras( 'categoria_productor', $lapaz_filtros );
					require __DIR__ . '/partes/barras.php';
					?>
				</div>
			</div>
		</div>
	</section>
</div>
