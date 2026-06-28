import { error, json } from '@sveltejs/kit';
import { runComparisonSearch } from '$lib/server/services/comparison';
import { comparisonSearchSchema } from '$lib/server/validation/note';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	const result = comparisonSearchSchema.safeParse({ q: url.searchParams.get('q') ?? '' });
	if (!result.success) {
		return json({ message: 'Invalid search query' }, { status: 400 });
	}

	return json(await runComparisonSearch(locals.user.id, result.data.q, 'http-api'));
};
