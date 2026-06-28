import { and, desc, eq, lt } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { sessions, users } from '$lib/server/db/schema';

export function insertSession(input: {
	tokenHash: string;
	userId: string;
	expiresAt: Date;
	userAgent: string | null;
}) {
	return db.insert(sessions).values(input).returning();
}

export async function findSessionAndUserByTokenHash(tokenHash: string) {
	const [result] = await db
		.select({
			session: {
				id: sessions.id,
				expiresAt: sessions.expiresAt,
				lastSeenAt: sessions.lastSeenAt
			},
			user: {
				id: users.id,
				email: users.email,
				displayName: users.displayName
			}
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.tokenHash, tokenHash))
		.limit(1);

	return result;
}

export function touchSession(sessionId: string) {
	return db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, sessionId));
}

export function deleteSessionByTokenHash(tokenHash: string) {
	return db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export function deleteExpiredSessions() {
	return db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

export function listSessionsByUser(userId: string) {
	return db
		.select({
			id: sessions.id,
			createdAt: sessions.createdAt,
			lastSeenAt: sessions.lastSeenAt,
			expiresAt: sessions.expiresAt,
			userAgent: sessions.userAgent
		})
		.from(sessions)
		.where(eq(sessions.userId, userId))
		.orderBy(desc(sessions.lastSeenAt));
}

export async function deleteSessionByIdAndUser(sessionId: string, userId: string) {
	const [deleted] = await db
		.delete(sessions)
		.where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
		.returning({ id: sessions.id });
	return deleted;
}

export function deleteSessionsByUser(userId: string) {
	return db.delete(sessions).where(eq(sessions.userId, userId));
}
