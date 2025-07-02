import { SANITY_API_READ_TOKEN, SANITY_API_EDITOR_TOKEN } from '$env/static/private';
import { client } from '$lib/utils/sanity';

export const serverClient = client.withConfig({
	token: SANITY_API_READ_TOKEN
});

export const editorClient = client.withConfig({
	token: SANITY_API_EDITOR_TOKEN
});
