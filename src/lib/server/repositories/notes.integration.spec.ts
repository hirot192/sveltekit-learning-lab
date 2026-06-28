import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const runDatabaseTests = process.env.RUN_DB_TESTS === '1';
const TEST_USER_ID = '00000000-0000-4000-8000-000000000099';
const OTHER_USER_ID = '00000000-0000-4000-8000-000000000097';

let databaseModule: typeof import('$lib/server/db/client');
let schemaModule: typeof import('$lib/server/db/schema');
let repository: typeof import('./notes');

describe.runIf(runDatabaseTests)('notes repository with PostgreSQL', () => {
	beforeAll(async () => {
		databaseModule = await import('$lib/server/db/client');
		schemaModule = await import('$lib/server/db/schema');
		repository = await import('./notes');

		await databaseModule.db
			.insert(schemaModule.users)
			.values([
				{
					id: TEST_USER_ID,
					email: 'repository-test@example.test',
					displayName: 'Repository Test',
					passwordHash: '!test-only!'
				},
				{
					id: OTHER_USER_ID,
					email: 'repository-other@example.test',
					displayName: 'Repository Other',
					passwordHash: '!test-only!'
				}
			])
			.onConflictDoNothing();
	});

	afterAll(async () => {
		if (databaseModule && schemaModule) {
			const { inArray } = await import('drizzle-orm');
			await databaseModule.db
				.delete(schemaModule.users)
				.where(inArray(schemaModule.users.id, [TEST_USER_ID, OTHER_USER_ID]));
		}
	});

	it('creates, reads, updates and deletes a user-owned note', async () => {
		const created = await repository.insertNote(TEST_USER_ID, {
			title: 'Integration note',
			body: 'created',
			tags: ['SvelteKit', 'PostgreSQL']
		});

		expect(created.userId).toBe(TEST_USER_ID);
		expect((await repository.findNoteByIdAndUser(created.id, TEST_USER_ID))?.body).toBe('created');

		const updated = await repository.updateNoteByIdAndUser(created.id, TEST_USER_ID, {
			title: 'Integration note',
			body: 'updated',
			tags: ['SvelteKit', '検索']
		});
		expect(updated?.body).toBe('updated');

		expect(await repository.deleteNoteByIdAndUser(created.id, TEST_USER_ID)).toEqual({
			id: created.id
		});
		expect(await repository.findNoteByIdAndUser(created.id, TEST_USER_ID)).toBeUndefined();
	});

	it('keeps read, list, update and delete operations inside the owner boundary', async () => {
		const victimNote = await repository.insertNote(TEST_USER_ID, {
			title: 'Victim note',
			body: 'must stay private',
			tags: ['Private']
		});
		const attackerNote = await repository.insertNote(OTHER_USER_ID, {
			title: 'Attacker note',
			body: 'visible to attacker',
			tags: ['Private']
		});

		await expect(repository.listNotesByUser(OTHER_USER_ID)).resolves.toEqual([
			expect.objectContaining({ id: attackerNote.id, userId: OTHER_USER_ID })
		]);
		expect(await repository.findNoteByIdAndUser(victimNote.id, OTHER_USER_ID)).toBeUndefined();
		expect(
			await repository.updateNoteByIdAndUser(victimNote.id, OTHER_USER_ID, {
				title: 'Stolen',
				body: 'changed by attacker',
				tags: []
			})
		).toBeUndefined();
		expect(await repository.deleteNoteByIdAndUser(victimNote.id, OTHER_USER_ID)).toBeUndefined();

		expect(await repository.findNoteByIdAndUser(victimNote.id, TEST_USER_ID)).toMatchObject({
			title: 'Victim note',
			body: 'must stay private'
		});
	});

	it('searches, filters and paginates only inside the user boundary', async () => {
		for (let index = 1; index <= 7; index += 1) {
			await repository.insertNote(TEST_USER_ID, {
				title: `Searchable needle ${index}`,
				body: index === 7 ? 'keyword-in-body' : 'pagination fixture',
				tags: ['Database', index % 2 === 0 ? 'Even' : 'Odd']
			});
		}

		const firstPage = await repository.searchNotesByUser(TEST_USER_ID, {
			q: 'searchable NEEDLE',
			tag: 'database',
			sort: 'created_asc',
			page: 1
		});
		expect(firstPage.pagination).toMatchObject({ page: 1, pageSize: 6, total: 7, totalPages: 2 });
		expect(firstPage.notes).toHaveLength(6);
		expect(firstPage.notes.every((note) => note.tags.some((tag) => tag.name === 'Database'))).toBe(
			true
		);

		const secondPage = await repository.searchNotesByUser(TEST_USER_ID, {
			q: 'keyword-in-body',
			tag: '',
			sort: 'updated_desc',
			page: 99
		});
		expect(secondPage.pagination).toMatchObject({ page: 1, total: 1, totalPages: 1 });
		expect(secondPage.notes[0]?.body).toBe('keyword-in-body');

		const otherUserSearch = await repository.searchNotesByUser(OTHER_USER_ID, {
			q: 'Searchable needle',
			tag: 'database',
			sort: 'updated_desc',
			page: 1
		});
		expect(otherUserSearch.pagination.total).toBe(0);
	});
});
