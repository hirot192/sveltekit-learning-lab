import { error } from '@sveltejs/kit';
import { findUserNote } from '$lib/server/services/notes';
import { noteIdSchema } from '$lib/server/validation/note';

export function parseNoteId(value: string) {
	const result = noteIdSchema.safeParse(value);

	if (!result.success) {
		error(404, 'Note not found');
	}

	return result.data;
}

export async function requireOwnedNote(userId: string, noteId: string) {
	const note = await findUserNote(userId, parseNoteId(noteId));

	if (!note) {
		error(404, 'Note not found');
	}

	return note;
}
