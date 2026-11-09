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
		settings: { react: { version: '19.0' } },
		rules: {
			// El tema vive fuera de esta carpeta: se fija el formato de WordPress aquí
			// para que Prettier no busque un .prettierrc junto a los archivos.
			'prettier/prettier': [ 'error', prettierConfig, { usePrettierrc: false } ],
		},
	},
];
