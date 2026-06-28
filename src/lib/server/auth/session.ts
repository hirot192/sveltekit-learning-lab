import { createHash, randomBytes } from 'node:crypto';
import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import {
	deleteSessionByTokenHash,
	findSessionAndUserByTokenHash,
	insertSession,
	touchSession
} from '$lib/server/repositories/sessions';

export const SESSION_COOKIE_NAME = 'learning_lab_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;
const TOUCH_INTERVAL_MS = 1000 * 60 * 15;

export function hashSessionToken(token: string) {
	return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string, userAgent: string | null) {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
	const [session] = await insertSession({
		tokenHash: hashSessionToken(token),
		userId,
		expiresAt,
		userAgent: userAgent?.slice(0, 500) ?? null
	});

	return { session, token };
}

export async function validateSessionToken(token: string) {
	const tokenHash = hashSessionToken(token);
	const result = await findSessionAndUserByTokenHash(tokenHash);

	if (!result) return null;

	if (result.session.expiresAt.getTime() <= Date.now()) {
		await deleteSessionByTokenHash(tokenHash);
		return null;
	}

	if (result.session.lastSeenAt.getTime() < Date.now() - TOUCH_INTERVAL_MS) {
		await touchSession(result.session.id);
	}

	return {
		user: result.user,
		session: { id: result.session.id, expiresAt: result.session.expiresAt }
	};
}

export function setSessionCookie(cookies: Cookies, token: string, expiresAt: Date) {
	cookies.set(SESSION_COOKIE_NAME, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		expires: expiresAt
	});
}

export function deleteSessionCookie(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

export async function invalidateSessionToken(token: string) {
	await deleteSessionByTokenHash(hashSessionToken(token));
}
