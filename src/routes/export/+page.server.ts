import { editorClient as client } from '$lib/server/sanity';
import { error } from '@sveltejs/kit';
import type { Actions } from './$types';

export const load = async () => {
	const submissionsPromise = client.fetch(`*[_type == "submission"]`);
	const eventsPromise = client.fetch(`*[_type == "event"]`);
	const [submissions, events] = await Promise.all([submissionsPromise, eventsPromise]);
	return { submissions, events };
};

export const actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const type = formData.get('type');
		try {
			await client.delete({ query: `*[_type == "${type}"]` });
			return { success: true };
		} catch (err) {
			console.error(err);
			return error(500, { message: 'Failed to delete submissions' });
		}
	}
} satisfies Actions;
