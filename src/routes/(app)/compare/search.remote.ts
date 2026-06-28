import { error } from '@sveltejs/kit';
import { getRequestEvent, query } from '$app/server';
import { runComparisonSearch } from '$lib/server/services/comparison';
import { comparisonSearchSchema } from '$lib/server/validation/note';

export const searchNotesRemote = query(comparisonSearchSchema, async ({ q }) => {
	const { locals } = getRequestEvent();

	if (!locals.user) {
		error(401, 'Authentication required');
	}

	return runComparisonSearch(locals.user.id, q, 'remote-query');
});
