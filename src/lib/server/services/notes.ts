import {
	deleteNoteByIdAndUser,
	findNoteByIdAndUser,
	insertNote,
	listTagsByUser,
	listNotesByUser,
	searchNotesByUser,
	updateNoteByIdAndUser
} from '$lib/server/repositories/notes';
import type { NoteInput, NoteListQuery } from '$lib/server/validation/note';

export function listUserNotes(userId: string) {
	return listNotesByUser(userId);
}

export function searchUserNotes(userId: string, query: NoteListQuery) {
	return searchNotesByUser(userId, query);
}

export function listUserTags(userId: string) {
	return listTagsByUser(userId);
}

export function findUserNote(userId: string, noteId: string) {
	return findNoteByIdAndUser(noteId, userId);
}

export function createUserNote(userId: string, input: NoteInput) {
	return insertNote(userId, input);
}

export function updateUserNote(userId: string, noteId: string, input: NoteInput) {
	return updateNoteByIdAndUser(noteId, userId, input);
}

export async function deleteUserNote(userId: string, noteId: string) {
	return Boolean(await deleteNoteByIdAndUser(noteId, userId));
}
