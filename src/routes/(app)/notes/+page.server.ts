import { requireUser } from '$lib/server/auth/guard';
import { listUserTags, searchUserNotes } from '$lib/server/services/notes';
import { noteListQueryFromUrl } from '$lib/server/validation/note';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals, url);
	const filters = noteListQueryFromUrl(url);
	const [{ notes, pagination }, tags] = await Promise.all([
		searchUserNotes(user.id, filters),
		listUserTags(user.id)
	]);

	return {
		notes,
		tags,
		filters: { ...filters, page: pagination.page },
		pagination
	};
};
