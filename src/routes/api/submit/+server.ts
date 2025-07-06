import { json } from '@sveltejs/kit';
import { editorClient as client } from '$lib/server/sanity';

export async function POST({ request }) {
	const data = await request.json();
	console.log('[SUBMIT] request', data);
	// TODO: remove default values, maybe pass data directly
	const document = {
		_type: data._type,
		first_name: data.first_name || 'Yaung',
		last_name: data.last_name || 'Hein',
		email: data.email,
		answer: data.answer || 'test',
		correct: data.correct || true,
		timestamp: data.timestamp || new Date(),
		segment: data.segment,
		stay_in_touch: data.stay_in_touch
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
