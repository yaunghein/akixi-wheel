import originalToast from 'svelte-french-toast';

export const TOAST_CONFIG = {
	position: 'bottom-center',
	duration: 3000,
	style: 'max-width: 90vw; word-break: break-word;'
} as const;

export const toast = {
	success: (message: string) => originalToast.success(message, TOAST_CONFIG),
	error: (message: string) => originalToast.error(message, TOAST_CONFIG)
};
