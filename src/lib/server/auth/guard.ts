import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export function safeReturnTo(value: string | null | undefined) {
	if (!value || !value.startsWith('/') || value.startsWith('//')) return resolve('/notes');
	return value;
}

export function requireUser(locals: App.Locals, url: URL) {
	if (!locals.user) {
		const loginUrl = new URL(resolve('/login'), url.origin);
		loginUrl.searchParams.set('returnTo', `${url.pathname}${url.search}`);
		redirect(303, `${loginUrl.pathname}${loginUrl.search}`);
	}

	return locals.user;
}
