<?php
/**
 * Dependencias del módulo (sin build): el runtime de la Interactivity API y su router,
 * que se carga al navegar por primera vez. Versión = fecha de modificación de view.js.
 *
 * @package lapaz
 */

$lapaz_view_mtime = file_exists( __DIR__ . '/view.js' ) ? filemtime( __DIR__ . '/view.js' ) : false;

return array(
	'dependencies' => array(
		'@wordpress/interactivity',
		array(
			'id'     => '@wordpress/interactivity-router',
			'import' => 'dynamic',
		),
	),
	'version'      => false !== $lapaz_view_mtime ? (string) $lapaz_view_mtime : '0',
);
