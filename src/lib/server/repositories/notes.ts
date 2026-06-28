import { and, asc, count, desc, eq, inArray, or, sql, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { notes, noteTags, tags } from '$lib/server/db/schema';
import {
	NOTE_PAGE_SIZE,
	normalizeTagName,
	type NoteInput,
	type NoteListQuery
} from '$lib/server/validation/note';

function content(input: NoteInput) {
	return { title: input.title, body: input.body };
}

function likePattern(value: string) {
	return `%${value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_')}%`;
}

async function tagsForNoteIds(noteIds: string[], userId: string) {
	if (noteIds.length === 0) {
		return new Map<string, { id: string; name: string; normalizedName: string }[]>();
	}

	const rows = await db
		.select({
			noteId: noteTags.noteId,
			id: tags.id,
			name: tags.name,
			normalizedName: tags.normalizedName
		})
		.from(noteTags)
		.innerJoin(tags, eq(tags.id, noteTags.tagId))
		.where(and(inArray(noteTags.noteId, noteIds), eq(tags.userId, userId)))
		.orderBy(asc(tags.name));

	const byNote = new Map<string, { id: string; name: string; normalizedName: string }[]>();
	for (const row of rows) {
		const values = byNote.get(row.noteId) ?? [];
		values.push({ id: row.id, name: row.name, normalizedName: row.normalizedName });
		byNote.set(row.noteId, values);
	}
	return byNote;
}

export function listNotesByUser(userId: string) {
	return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.updatedAt));
}

export async function searchNotesByUser(userId: string, query: NoteListQuery) {
	const conditions: SQL[] = [eq(notes.userId, userId)];

	if (query.q) {
		const pattern = likePattern(query.q);
		conditions.push(
			or(
				sql`${notes.title} ILIKE ${pattern} ESCAPE '\\'`,
				sql`${notes.body} ILIKE ${pattern} ESCAPE '\\'`
			)!
		);
	}

	if (query.tag) {
		conditions.push(sql`exists (
			select 1 from ${noteTags}
			inner join ${tags} on ${tags.id} = ${noteTags.tagId}
			where ${noteTags.noteId} = ${notes.id}
			and ${tags.userId} = ${userId}
			and ${tags.normalizedName} = ${query.tag}
		)`);
	}

	const where = and(...conditions);
	const [{ value: total }] = await db.select({ value: count() }).from(notes).where(where);
	const totalPages = Math.max(1, Math.ceil(total / NOTE_PAGE_SIZE));
	const page = Math.min(query.page, totalPages);
	const orderBy =
		query.sort === 'created_asc'
			? asc(notes.createdAt)
			: query.sort === 'created_desc'
				? desc(notes.createdAt)
				: desc(notes.updatedAt);

	const rows = await db
		.select()
		.from(notes)
		.where(where)
		.orderBy(orderBy, desc(notes.id))
		.limit(NOTE_PAGE_SIZE)
		.offset((page - 1) * NOTE_PAGE_SIZE);
	const tagMap = await tagsForNoteIds(
		rows.map((note) => note.id),
		userId
	);

	return {
		notes: rows.map((note) => ({ ...note, tags: tagMap.get(note.id) ?? [] })),
		pagination: { page, pageSize: NOTE_PAGE_SIZE, total, totalPages }
	};
}

export async function listTagsByUser(userId: string) {
	return db
		.select({
			id: tags.id,
			name: tags.name,
			normalizedName: tags.normalizedName,
			noteCount: count(noteTags.noteId)
		})
		.from(tags)
		.innerJoin(noteTags, eq(noteTags.tagId, tags.id))
		.where(eq(tags.userId, userId))
		.groupBy(tags.id)
		.orderBy(asc(tags.name));
}

export async function findNoteByIdAndUser(noteId: string, userId: string) {
	const [note] = await db
		.select()
		.from(notes)
		.where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
		.limit(1);

	if (!note) return undefined;
	const tagMap = await tagsForNoteIds([note.id], userId);
	return { ...note, tags: tagMap.get(note.id) ?? [] };
}

export async function insertNote(userId: string, input: NoteInput) {
	const noteId = await db.transaction(async (tx) => {
		const [note] = await tx
			.insert(notes)
			.values({ userId, ...content(input) })
			.returning();

		for (const name of input.tags) {
			const [tag] = await tx
				.insert(tags)
				.values({ userId, name, normalizedName: normalizeTagName(name) })
				.onConflictDoUpdate({
					target: [tags.userId, tags.normalizedName],
					set: { name }
				})
				.returning({ id: tags.id });
			await tx.insert(noteTags).values({ noteId: note.id, tagId: tag.id });
		}

		return note.id;
	});

	return (await findNoteByIdAndUser(noteId, userId))!;
}

export async function updateNoteByIdAndUser(noteId: string, userId: string, input: NoteInput) {
	const updated = await db.transaction(async (tx) => {
		const [note] = await tx
			.update(notes)
			.set({ ...content(input), updatedAt: new Date() })
			.where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
			.returning({ id: notes.id });

		if (!note) return false;
		await tx.delete(noteTags).where(eq(noteTags.noteId, note.id));

		for (const name of input.tags) {
			const [tag] = await tx
				.insert(tags)
				.values({ userId, name, normalizedName: normalizeTagName(name) })
				.onConflictDoUpdate({
					target: [tags.userId, tags.normalizedName],
					set: { name }
				})
				.returning({ id: tags.id });
			await tx.insert(noteTags).values({ noteId: note.id, tagId: tag.id });
		}

		return true;
	});

	return updated ? findNoteByIdAndUser(noteId, userId) : undefined;
}

export async function deleteNoteByIdAndUser(noteId: string, userId: string) {
	const [deleted] = await db
		.delete(notes)
		.where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
		.returning({ id: notes.id });

	return deleted;
}
