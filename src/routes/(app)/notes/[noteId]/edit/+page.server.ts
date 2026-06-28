import { error, fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { z } from 'zod';
import { requireUser } from '$lib/server/auth/guard';
import { parseNoteId, requireOwnedNote } from '$lib/server/http/notes';
import { updateUserNote } from '$lib/server/services/notes';
import { noteInputFromFormData, noteInputSchema } from '$lib/server/validation/note';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const user = requireUser(locals, url);
	return { note: await requireOwnedNote(user.id, params.noteId) };
};

export const actions: Actions = {
	default: async ({ locals, params, request, url }) => {
		const user = requireUser(locals, url);
		const noteId = parseNoteId(params.noteId);
		const values = noteInputFromFormData(await request.formData());
		const result = noteInputSchema.safeParse(values);

		if (!result.success) {
			return fail(400, { values, errors: z.flattenError(result.error).fieldErrors });
		}

		const note = await updateUserNote(user.id, noteId, result.data);

		if (!note) {
			error(404, 'Note not found');
		}

		redirect(303, resolve('/(app)/notes/[noteId]', { noteId: note.id }));
	}
};
