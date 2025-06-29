import type { LoaderLocals } from '@sanity/svelte-loader';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals extends LoaderLocals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
