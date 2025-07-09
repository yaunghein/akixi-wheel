import { eventQuery } from '$lib/queries';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { loadQuery } }) => {
	const initial = await loadQuery<any>(eventQuery);
	return { initial };
};
