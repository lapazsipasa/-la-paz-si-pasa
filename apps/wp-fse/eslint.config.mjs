import wordpress from '@wordpress/eslint-plugin';
import prettierConfig from '@wordpress/prettier-config';
import globals from 'globals';

export default [
	// Código de terceros copiado tal cual (Plyr): no se lintea.
	{ ignores: [ 'assets/vendor/**' ] },
	...wordpress.configs.recommended,
	{
		languageOptions: { globals: { ...globals.browser } },
		// Sin React en el tema: se fija la versión para evitar el aviso de detección.
		settings: {
			react: { version: '19.0' },
			// Módulos del núcleo de WordPress: los resuelve el import map de la página,
			// no node_modules (los usa el bloque catalogo como viewScriptModule sin build).
			'import/core-modules': [
				'@wordpress/interactivity',
				'@wordpress/interactivity-router',
			],
		},
		rules: {
			// El tema vive fuera de esta carpeta: se fija el formato de WordPress aquí
			// para que Prettier no busque un .prettierrc junto a los archivos.
			'prettier/prettier': [ 'error', prettierConfig, { usePrettierrc: false } ],
		},
	},
];
