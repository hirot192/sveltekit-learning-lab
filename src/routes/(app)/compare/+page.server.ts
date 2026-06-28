import { requireUser } from '$lib/server/auth/guard';
import { runComparisonSearch } from '$lib/server/services/comparison';
import { comparisonSearchSchema } from '$lib/server/validation/note';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals, url);
	const parsed = comparisonSearchSchema.safeParse({ q: url.searchParams.get('q') ?? '' });
	const q = parsed.success ? parsed.data.q : '';

	return {
		q,
		serverResult: await runComparisonSearch(user.id, q, 'server-load')
	};
};
