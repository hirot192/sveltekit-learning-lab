import type { Handle } from '@sveltejs/kit';
import {
	deleteSessionCookie,
	SESSION_COOKIE_NAME,
	validateSessionToken
} from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.session = null;

	const token = event.cookies.get(SESSION_COOKIE_NAME);

	if (token) {
		const auth = await validateSessionToken(token);

		if (auth) {
			event.locals.user = auth.user;
			event.locals.session = auth.session;
		} else {
			deleteSessionCookie(event.cookies);
		}
	}

	return resolve(event);
};
