import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { requireUser } from '$lib/server/auth/guard';
import { parseNoteId, requireOwnedNote } from '$lib/server/http/notes';
import { deleteUserNote } from '$lib/server/services/notes';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const user = requireUser(locals, url);
	return { note: await requireOwnedNote(user.id, params.noteId) };
};

export const actions: Actions = {
	delete: async ({ locals, params, url }) => {
		const user = requireUser(locals, url);
		const deleted = await deleteUserNote(user.id, parseNoteId(params.noteId));

		if (!deleted) {
			error(404, 'Note not found');
		}

		redirect(303, resolve('/notes'));
	}
};
