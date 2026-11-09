<?php
/**
 * Firmas de las funciones de Secure Custom Fields que usa el tema, solo para PHPStan.
 * El plugin no está en el repo (va horneado en la imagen), así que PHPStan no las ve.
 *
 * @package lapaz
 */

/**
 * Valor de un campo SCF.
 *
 * @param string          $selector     Nombre o clave del campo.
 * @param int|string|bool $post_id      Entrada.
 * @param bool            $format_value Aplicar formato de retorno.
 * @param bool            $escape_html  Escapar HTML.
 * @return mixed
 */
function get_field( $selector, $post_id = false, $format_value = true, $escape_html = false ) {}

/**
 * Todos los campos SCF de una entrada.
 *
 * @param int|string|bool $post_id      Entrada.
 * @param bool            $format_value Aplicar formato de retorno.
 * @param bool            $escape_html  Escapar HTML.
 * @return array<string, mixed>|false
 */
function get_fields( $post_id = false, $format_value = true, $escape_html = false ) {}
