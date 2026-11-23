// Tipos mínimos de los módulos del núcleo que usa view.js. Solo para el chequeo de tipos:
// en el navegador los resuelve el import map de WordPress y el tema no instala los paquetes.
declare module '@wordpress/interactivity' {
	export function store< T extends object >(
		namespace: string,
		definition: T
	): T;
	export function withScope< F extends ( ...args: never[] ) => unknown >(
		fn: F
	): F;
}

declare module '@wordpress/interactivity-router' {
	export const actions: {
		navigate: (
			href: string,
			options?: { screenReaderAnnouncement?: boolean }
		) => Promise< void >;
	};
}
