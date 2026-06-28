import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const runDatabaseTests = process.env.RUN_DB_TESTS === '1';
const TEST_USER_ID = '00000000-0000-4000-8000-000000000098';

let databaseModule: typeof import('$lib/server/db/client');
let schemaModule: typeof import('$lib/server/db/schema');
let sessionModule: typeof import('./session');

describe.runIf(runDatabaseTests)('database sessions', () => {
	beforeAll(async () => {
		databaseModule = await import('$lib/server/db/client');
		schemaModule = await import('$lib/server/db/schema');
		sessionModule = await import('./session');

		await databaseModule.db
			.insert(schemaModule.users)
			.values({
				id: TEST_USER_ID,
				email: 'session-test@example.test',
				displayName: 'Session Test',
				passwordHash: '!test-only!'
			})
			.onConflictDoNothing();
	});

	afterAll(async () => {
		if (databaseModule && schemaModule) {
			const { eq } = await import('drizzle-orm');
			await databaseModule.db
				.delete(schemaModule.users)
				.where(eq(schemaModule.users.id, TEST_USER_ID));
		}
	});

	it('stores only a token hash and becomes invalid immediately after revocation', async () => {
		const { session, token } = await sessionModule.createSession(TEST_USER_ID, 'Vitest');
		const { eq } = await import('drizzle-orm');
		const [stored] = await databaseModule.db
			.select()
			.from(schemaModule.sessions)
			.where(eq(schemaModule.sessions.id, session.id));

		expect(stored.tokenHash).toBe(sessionModule.hashSessionToken(token));
		expect(stored.tokenHash).not.toContain(token);
		expect((await sessionModule.validateSessionToken(token))?.user.id).toBe(TEST_USER_ID);

		await sessionModule.invalidateSessionToken(token);
		expect(await sessionModule.validateSessionToken(token)).toBeNull();
	});
});
