import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import {
	deleteSessionCookie,
	invalidateSessionToken,
	SESSION_COOKIE_NAME
} from '$lib/server/auth/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	const token = cookies.get(SESSION_COOKIE_NAME);
	if (token) await invalidateSessionToken(token);
	deleteSessionCookie(cookies);
	redirect(303, resolve('/'));
};
