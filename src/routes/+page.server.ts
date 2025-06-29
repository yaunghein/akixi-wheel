import { wheelQuery } from '$lib/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { loadQuery } }) => {
	const initial = await loadQuery<any>(wheelQuery);
	return { initial };
};
