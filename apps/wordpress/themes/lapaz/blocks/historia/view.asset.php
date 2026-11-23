<?php
/**
 * Versión del script = fecha de modificación, para invalidar la caché al cambiarlo.
 *
 * @package lapaz
 */

$lapaz_view_mtime = file_exists( __DIR__ . '/view.js' ) ? filemtime( __DIR__ . '/view.js' ) : false;

return array(
	'dependencies' => array(),
	'version'      => false !== $lapaz_view_mtime ? (string) $lapaz_view_mtime : '0',
);
