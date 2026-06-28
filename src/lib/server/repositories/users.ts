import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { users } from '$lib/server/db/schema';

export async function findUserByEmail(email: string) {
	const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
	return user;
}

export async function insertUser(input: {
	email: string;
	displayName: string;
	passwordHash: string;
}) {
	const [user] = await db.insert(users).values(input).onConflictDoNothing().returning();
	return user;
}
