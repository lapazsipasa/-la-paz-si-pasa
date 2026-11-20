/**
 * Catálogo PaisSana: navegación sin recargar con el router de la Interactivity API.
 * El formulario funciona solo (GET); aquí se intercepta y se pide la URL nueva con
 * actions.navigate(), que reemplaza solo las regiones de resultados y distribución.
 * Módulo ES sin build: las dependencias se declaran en view.asset.php.
 */
/// <reference path="./interactivity.d.ts" />
import { store, withScope } from '@wordpress/interactivity';

/** @type {ReturnType<typeof setTimeout> | undefined} */
let espera;
let turno = 0;

/**
 * URL del formulario con sus valores, sin los vacíos ni el ancla (no hace saltar la página).
 *
 * @param {HTMLFormElement} form Formulario de filtros.
 * @return {string} URL.
 */
const urlDe = ( form ) => {
	const url = new URL( form.action );
	url.hash = '';
	url.search = '';
	new FormData( form ).forEach( ( valor, nombre ) => {
		if ( typeof valor === 'string' && valor.trim() !== '' ) {
			url.searchParams.append( nombre, valor );
		}
	} );
	return url.href;
};

/**
 * Deja los controles como dice la URL (tras pulsar una barra, o atrás y adelante).
 * No toca el campo que tiene el foco: es el que se está escribiendo.
 */
const sincronizar = () => {
	const form = document.querySelector(
		'.wp-block-lapaz-catalogo form.filtros'
	);
	if ( ! ( form instanceof HTMLFormElement ) ) {
		return;
	}
	const params = new URL( window.location.href ).searchParams;
	for ( const control of form.elements ) {
		if (
			control instanceof HTMLInputElement &&
			control.type === 'checkbox'
		) {
			control.checked = params
				.getAll( control.name )
				.includes( control.value );
		} else if (
			( control instanceof HTMLInputElement ||
				control instanceof HTMLSelectElement ) &&
			control.name &&
			control !== form.ownerDocument.activeElement
		) {
			control.value = params.get( control.name ) ?? '';
		}
	}
};

const { state, actions } = store( 'lapaz/catalogo', {
	state: {
		activo: false,
		cargando: false,
	},
	actions: {
		/**
		 * Navega a `href` cambiando solo las regiones del catálogo.
		 *
		 * @param {string} href URL nueva.
		 * @return {Iterator<Promise<unknown>, void, unknown>} Acción asíncrona del store.
		 */
		*ir( href ) {
			const mio = ++turno;
			state.cargando = true;
			try {
				const router =
					/** @type {typeof import('@wordpress/interactivity-router')} */ (
						yield import( '@wordpress/interactivity-router' )
					);
				// El conteo ya es una región aria-live: sin el aviso genérico del router.
				yield router.actions.navigate( href, {
					screenReaderAnnouncement: false,
				} );
			} finally {
				if ( mio === turno ) {
					state.cargando = false;
					sincronizar();
				}
			}
		},
		/** @param {SubmitEvent} event Envío del formulario. */
		enviar( event ) {
			if ( event.target instanceof HTMLFormElement ) {
				event.preventDefault();
				clearTimeout( espera );
				actions.ir( urlDe( event.target ) );
			}
		},
		/** @param {InputEvent} event Tecla en la búsqueda: espera 300 ms sin escribir. */
		escribir( event ) {
			const campo = event.target;
			if (
				campo instanceof HTMLInputElement &&
				campo.type === 'search' &&
				campo.form
			) {
				const form = campo.form;
				clearTimeout( espera );
				espera = setTimeout(
					withScope( () => actions.ir( urlDe( form ) ) ),
					300
				);
			}
		},
		/** @param {Event} event Cambio de selector o casilla. */
		cambiar( event ) {
			const control = event.target;
			if (
				( control instanceof HTMLSelectElement ||
					( control instanceof HTMLInputElement &&
						control.type === 'checkbox' ) ) &&
				control.form
			) {
				clearTimeout( espera );
				actions.ir( urlDe( control.form ) );
			}
		},
		/** @param {MouseEvent} event Clic en una barra o en «Ver más». */
		clic( event ) {
			const enlace =
				event.target instanceof Element
					? event.target.closest( 'a.barra, a.mas' )
					: null;
			if (
				! ( enlace instanceof HTMLAnchorElement ) ||
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.altKey
			) {
				return;
			}
			event.preventDefault();
			// «Ver más» no salta al inicio del catálogo; una barra sí lleva a los resultados.
			const url = new URL( enlace.href );
			if ( enlace.classList.contains( 'mas' ) ) {
				url.hash = '';
			}
			actions.ir( url.href );
		},
	},
	callbacks: {
		iniciar() {
			state.activo = true;
			// Precarga el router para que la primera búsqueda no espere la descarga.
			import( '@wordpress/interactivity-router' );
		},
		sincronizar,
	},
} );
