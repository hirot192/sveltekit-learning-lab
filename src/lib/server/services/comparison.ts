import { randomUUID } from 'node:crypto';
import { searchUserNotes } from '$lib/server/services/notes';

export type ComparisonTransport = 'server-load' | 'remote-query' | 'http-api';

export async function runComparisonSearch(
	userId: string,
	q: string,
	transport: ComparisonTransport
) {
	const startedAt = Date.now();
	const result = await searchUserNotes(userId, {
		q,
		tag: '',
		sort: 'updated_desc',
		page: 1
	});

	return {
		transport,
		invocationId: randomUUID(),
		executedAt: new Date().toISOString(),
		durationMs: Date.now() - startedAt,
		q,
		total: result.pagination.total,
		notes: result.notes.map((note) => ({
			id: note.id,
			title: note.title,
			body: note.body,
			tags: note.tags.map((tag) => tag.name),
			updatedAt: note.updatedAt.toISOString()
		}))
	};
}

export type ComparisonSearchResult = Awaited<ReturnType<typeof runComparisonSearch>>;
