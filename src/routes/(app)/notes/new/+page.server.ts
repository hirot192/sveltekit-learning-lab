import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { z } from 'zod';
import { requireUser } from '$lib/server/auth/guard';
import { createUserNote } from '$lib/server/services/notes';
import { noteInputFromFormData, noteInputSchema } from '$lib/server/validation/note';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ locals, request, url }) => {
		const user = requireUser(locals, url);
		const values = noteInputFromFormData(await request.formData());
		const result = noteInputSchema.safeParse(values);

		if (!result.success) {
			return fail(400, { values, errors: z.flattenError(result.error).fieldErrors });
		}

		const note = await createUserNote(user.id, result.data);
		redirect(303, resolve('/(app)/notes/[noteId]', { noteId: note.id }));
	}
};
