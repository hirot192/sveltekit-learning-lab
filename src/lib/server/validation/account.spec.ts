import { describe, expect, it } from 'vitest';
import { registerSchema } from './account';

describe('registration validation', () => {
	it('normalizes display values without altering a valid passphrase', () => {
		const result = registerSchema.parse({
			email: ' learner@example.test ',
			displayName: ' 学習者 ',
			password: 'correct horse battery staple'
		});

		expect(result).toEqual({
			email: 'learner@example.test',
			displayName: '学習者',
			password: 'correct horse battery staple'
		});
	});

	it('rejects passwords shorter than 15 characters', () => {
		expect(
			registerSchema.safeParse({
				email: 'learner@example.test',
				displayName: '学習者',
				password: 'too-short'
			}).success
		).toBe(false);
	});
});
