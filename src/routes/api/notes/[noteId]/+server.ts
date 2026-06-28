import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import { parseNoteId, requireOwnedNote } from '$lib/server/http/notes';
import { deleteUserNote, updateUserNote } from '$lib/server/services/notes';
import { noteInputSchema } from '$lib/server/validation/note';
import type { RequestHandler } from './$types';

function requireApiUser(locals: App.Locals) {
	if (!locals.user) {
		error(401, 'Authentication required');
	}

	return locals.user;
}

function publicNote(note: Awaited<ReturnType<typeof requireOwnedNote>>) {
	return {
		id: note.id,
		title: note.title,
		body: note.body,
		tags: note.tags.map((tag) => tag.name),
		createdAt: note.createdAt,
		updatedAt: note.updatedAt
	};
}

export const GET: RequestHandler = async ({ locals, params }) => {
	const user = requireApiUser(locals);
	const note = await requireOwnedNote(user.id, params.noteId);

	return json({ note: publicNote(note) });
};

export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const user = requireApiUser(locals);
	const noteId = parseNoteId(params.noteId);
	const currentNote = await requireOwnedNote(user.id, noteId);
	const input = await request.json().catch(() => null);
	const candidate =
		typeof input === 'object' && input !== null && !Array.isArray(input)
			? {
					...(input as Record<string, unknown>),
					tags:
						'tags' in input
							? (input as Record<string, unknown>).tags
							: currentNote.tags.map((tag) => tag.name)
				}
			: input;
	const result = noteInputSchema.safeParse(candidate);

	if (!result.success) {
		return json(
			{ message: 'Invalid note', errors: z.flattenError(result.error).fieldErrors },
			{ status: 400 }
		);
	}

	const note = await updateUserNote(user.id, noteId, result.data);
	if (!note) {
		error(404, 'Note not found');
	}

	return json({ note: publicNote(note) });
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	const user = requireApiUser(locals);
	const deleted = await deleteUserNote(user.id, parseNoteId(params.noteId));

	if (!deleted) {
		error(404, 'Note not found');
	}

	return new Response(null, { status: 204 });
};
