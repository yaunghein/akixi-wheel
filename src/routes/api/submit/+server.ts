import { json } from '@sveltejs/kit';
import { editorClient as client } from '$lib/server/sanity';

export async function POST({ request }) {
	const data = await request.json();
	console.log('[SUBMIT] request', data);
	const document = {
		_type: data._type,
		first_name: data.first_name || 'Yaung',
		last_name: data.last_name || 'Hein',
		email: data.email || 'yaunghein@gmail.com',
		answer: data.answer || 'test',
		correct: data.correct || true,
		timestamp: data.timestamp || new Date()
	};

	try {
		const result = await client.create(document).catch((error) => {
			console.error('Sanity error:', error);
			return json({ error: 'Failed to submit' }, { status: 500 });
		});

		if (!result) {
			console.error('Sanity error:', result);
			return json({ error: 'Failed to submit' }, { status: 500 });
		}

		return json({ success: true, result });
	} catch (error) {
		console.error('Server error:', error);
		return json({ error: 'Unexpected error' }, { status: 500 });
	}
}
