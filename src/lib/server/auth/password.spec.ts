import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password hashing', () => {
	it('verifies the password but not a different value', async () => {
		const passwordHash = await hashPassword('correct horse battery staple');

		expect(passwordHash).toMatch(/^\$argon2id\$/);
		expect(await verifyPassword(passwordHash, 'correct horse battery staple')).toBe(true);
		expect(await verifyPassword(passwordHash, 'wrong password')).toBe(false);
	});
});
