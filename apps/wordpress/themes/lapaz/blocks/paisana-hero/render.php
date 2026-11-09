<?php
/**
 * Bloque lapaz/paisana-hero: .paisana-header de proyectos-destacados.astro, con
 * ProyectosNav y PaisSanaHero. Mismo marcado y clases; las cifras salen de
 * group_proyectos (lapaz_paisana_cifras) y el resto del copy es fijo.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$lapaz_cifras  = lapaz_paisana_cifras();
$lapaz_img     = get_theme_file_uri( 'assets/img/paisana/' );
$lapaz_iconos  = array(
	1 => array( 'icon.svg', __( 'Sello', 'lapaz' ) ),
	2 => array( 'leaf.svg', __( 'Municipios', 'lapaz' ) ),
);
$lapaz_wrapper = get_block_wrapper_attributes( array( 'class' => 'paisana-header' ) );
?>
<div <?php echo $lapaz_wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- get_block_wrapper_attributes() ya escapa. ?>>
	<nav class="proyectos-nav" aria-label="<?php esc_attr_e( 'Navegación de proyectos', 'lapaz' ); ?>">
		<ul class="nav-list">
			<li><a href="#" class="btn-project btn-blue"><?php esc_html_e( 'PAISSANA', 'lapaz' ); ?></a></li>
			<li><a href="#" class="btn-project btn-green"><?php esc_html_e( 'PROGRAMA COLOMBIA SOSTENIBLE', 'lapaz' ); ?></a></li>
			<li><a href="#" class="btn-project btn-orange"><?php esc_html_e( 'PROGRAMA PILOTO DE INVERSIONES PRIORITARIAS', 'lapaz' ); ?></a></li>
		</ul>
	</nav>

	<section class="paisana-hero">
		<div class="hero-top-grid">
			<div class="hero-brand">
				<img src="<?php echo esc_url( $lapaz_img . 'logo-paisana.svg' ); ?>" alt="PaisSana" width="350" height="116" class="brand-logo" />
				<h1><?php esc_html_e( 'Un país que sana desde la tierra', 'lapaz' ); ?></h1>
				<p><?php esc_html_e( 'PaisSana no es solo una marca; es la voz, las manos y el orgullo de miles de familias productoras que decidieron transformar la historia de sus territorios.', 'lapaz' ); ?></p>
				<p>
					<?php esc_html_e( 'Detrás de cada grano de café, de cada barra de cacao, de la miel o de las artesanías que nacen en las regiones PDET, hay un relato de', 'lapaz' ); ?>
					<strong><?php esc_html_e( 'resiliencia, trabajo honesto y esperanza renovada.', 'lapaz' ); ?></strong>
					<?php esc_html_e( 'Aquí, el comercio se convierte en una herramienta para construir equidad y los frutos de la tierra en el reflejo de un país que florece en paz.', 'lapaz' ); ?>
				</p>
			</div>

			<div class="hero-stats">
				<div class="flor-content">
					<img src="<?php echo esc_url( $lapaz_img . 'flor.svg' ); ?>" alt="<?php esc_attr_e( 'Flor', 'lapaz' ); ?>" class="flor-img" width="300" height="300" />
				</div>
				<h3><?php esc_html_e( 'Datos relevantes:', 'lapaz' ); ?></h3>
				<ul class="stats-list">
					<?php foreach ( $lapaz_cifras as $lapaz_i => $lapaz_cifra ) : ?>
						<li>
							<?php if ( isset( $lapaz_iconos[ $lapaz_i ] ) ) : ?>
								<div class="stat-icon-wrapper">
									<img src="<?php echo esc_url( $lapaz_img . $lapaz_iconos[ $lapaz_i ][0] ); ?>" width="48" height="48" alt="<?php echo esc_attr( $lapaz_iconos[ $lapaz_i ][1] ); ?>" />
								</div>
								<div class="stat-content">
									<span class="stat-number"><?php echo esc_html( $lapaz_cifra['valor'] ); ?></span>
									<span class="stat-text"><?php echo esc_html( $lapaz_cifra['texto'] ); ?></span>
								</div>
							<?php else : ?>
								<span class="stat-number"><?php echo esc_html( $lapaz_cifra['valor'] ); ?></span>
								<span class="stat-text"><?php echo esc_html( $lapaz_cifra['texto'] ); ?></span>
							<?php endif; ?>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>
		</div>

		<div class="hero-bottom-grid">
			<div class="hero-benefits">
				<h3><?php esc_html_e( 'Beneficios para los productores:', 'lapaz' ); ?></h3>
				<ul class="benefits-list">
					<li><?php esc_html_e( 'Registro ante la Superintendencia de Industria y Comercio.', 'lapaz' ); ?></li>
					<li><?php esc_html_e( 'Acompañamiento ante el INVIMA: asistencia técnica especializada para trámites y requisitos.', 'lapaz' ); ?></li>
					<li><?php esc_html_e( 'Acompañamiento ante el ICA: capacitaciones en normatividad y apoyo en la certificación.', 'lapaz' ); ?></li>
					<li><?php esc_html_e( 'Alianzas estratégicas con Fondo Emprender y CampeSENA para acceso a capital semilla.', 'lapaz' ); ?></li>
					<li><?php esc_html_e( 'Conexión con comercializadoras y plataformas de mercado nacional e internacional.', 'lapaz' ); ?></li>
				</ul>
			</div>
			<div class="hero-photo">
				<img
					src="<?php echo esc_url( $lapaz_img . 'paisana-hero-600.webp' ); ?>"
					srcset="<?php echo esc_attr( $lapaz_img . 'paisana-hero-600.webp 600w, ' . $lapaz_img . 'paisana-hero-1200.webp 1200w' ); ?>"
					sizes="(min-width: 850px) 50vw, 100vw"
					width="600" height="600" alt="<?php esc_attr_e( 'Productora PaisSana', 'lapaz' ); ?>" loading="lazy" decoding="async"
				/>
			</div>
		</div>

		<nav class="hero-nav" aria-label="<?php esc_attr_e( 'Navegación de secciones PaisSana', 'lapaz' ); ?>">
			<ul class="hero-nav__list">
				<li><a href="#escucha-el-corazon-del-campo"><?php esc_html_e( 'ESCUCHA EL CORAZÓN DEL CAMPO', 'lapaz' ); ?></a></li>
				<li><a href="#paissana-en-ferias"><?php esc_html_e( 'PAISSANA EN FERIAS', 'lapaz' ); ?></a></li>
				<li><a href="#productores-paissana"><?php esc_html_e( 'PRODUCTORES PAISSANA', 'lapaz' ); ?></a></li>
			</ul>
		</nav>
	</section>
</div>
