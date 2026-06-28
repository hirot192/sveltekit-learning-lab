import { hashPassword, verifyPassword } from '$lib/server/auth/password';
import { findUserByEmail, insertUser } from '$lib/server/repositories/users';

export function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

export async function registerAccount(input: {
	email: string;
	displayName: string;
	password: string;
}) {
	const passwordHash = await hashPassword(input.password);
	return insertUser({
		email: normalizeEmail(input.email),
		displayName: input.displayName.trim(),
		passwordHash
	});
}

export async function authenticateAccount(email: string, password: string) {
	const user = await findUserByEmail(normalizeEmail(email));

	if (!user) {
		// Keep missing-account requests computationally expensive to reduce timing disclosure.
		await hashPassword(password);
		return null;
	}

	if (!(await verifyPassword(user.passwordHash, password))) return null;

	return {
		id: user.id,
		email: user.email,
		displayName: user.displayName
	};
}
