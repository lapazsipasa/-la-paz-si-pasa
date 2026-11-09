<?php
/**
 * Plugin Name: La Paz Sí Pasa · SMTP
 * Description: Envía wp_mail() por SMTP (Resend en producción) para que lleguen los correos de
 *              recuperación de contraseña. Sin SMTP_HOST no hace nada (local usa mail() de PHP).
 * Version: 0.1.0
 * Author: William Moreno
 *
 * Port de apps/wordpress/mu-plugins/headless-smtp.php con tipos estrictos.
 *
 * @package lapaz
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Variable de entorno como texto ('' si no existe).
 *
 * @param string $nombre Nombre de la variable.
 */
function lapaz_env( string $nombre ): string {
	$valor = getenv( $nombre );

	return is_string( $valor ) ? $valor : '';
}

if ( '' === lapaz_env( 'SMTP_HOST' ) ) {
	return;
}

/**
 * Configura PHPMailer con el proveedor SMTP.
 *
 * @param PHPMailer\PHPMailer\PHPMailer $phpmailer Instancia de PHPMailer.
 */
function lapaz_smtp( PHPMailer\PHPMailer\PHPMailer $phpmailer ): void {
	$puerto = (int) ( lapaz_env( 'SMTP_PORT' ) ?: '587' ); // phpcs:ignore Universal.Operators.DisallowShortTernary.Found -- '' cae al puerto por defecto.

	$phpmailer->isSMTP();
	$phpmailer->Host       = lapaz_env( 'SMTP_HOST' ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- propiedad de PHPMailer.
	$phpmailer->Port       = $puerto; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$phpmailer->SMTPAuth   = true; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$phpmailer->Username   = lapaz_env( 'SMTP_USER' ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$phpmailer->Password   = lapaz_env( 'SMTP_PASS' ); // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
	$phpmailer->SMTPSecure = 465 === $puerto ? 'ssl' : 'tls'; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
}
add_action( 'phpmailer_init', 'lapaz_smtp' );

/**
 * Remitente en el dominio firmado con DKIM; si no, DMARC falla y el correo cae en spam.
 *
 * @param string $from Remitente por defecto.
 */
function lapaz_mail_from( string $from ): string {
	return lapaz_env( 'SMTP_FROM' ) ?: $from; // phpcs:ignore Universal.Operators.DisallowShortTernary.Found
}
add_filter( 'wp_mail_from', 'lapaz_mail_from' );

/**
 * Nombre del remitente.
 *
 * @param string $name Nombre por defecto.
 */
function lapaz_mail_from_name( string $name ): string {
	return lapaz_env( 'SMTP_FROM_NAME' ) ?: $name; // phpcs:ignore Universal.Operators.DisallowShortTernary.Found
}
add_filter( 'wp_mail_from_name', 'lapaz_mail_from_name' );

/**
 * WordPress dice «enviado» aunque falle: el error queda en los logs del contenedor.
 *
 * @param WP_Error $error Error de envío.
 */
function lapaz_mail_failed( WP_Error $error ): void {
	error_log( '[lapaz-smtp] ' . $error->get_error_message() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- diagnóstico en producción.
}
add_action( 'wp_mail_failed', 'lapaz_mail_failed' );
