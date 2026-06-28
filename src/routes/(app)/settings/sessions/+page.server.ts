import { error, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { z } from 'zod';
import { requireUser } from '$lib/server/auth/guard';
import { deleteSessionCookie } from '$lib/server/auth/session';
import {
	deleteSessionByIdAndUser,
	deleteSessionsByUser,
	listSessionsByUser
} from '$lib/server/repositories/sessions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = requireUser(locals, url);
	return {
		sessions: await listSessionsByUser(user.id),
		currentSessionId: locals.session?.id
	};
};

export const actions: Actions = {
	revoke: async ({ cookies, locals, request, url }) => {
		const user = requireUser(locals, url);
		const formData = await request.formData();
		const sessionId = z.uuid().safeParse(formData.get('sessionId'));

		if (!sessionId.success) error(400, 'Invalid session id');

		const deleted = await deleteSessionByIdAndUser(sessionId.data, user.id);
		if (!deleted) error(404, 'Session not found');

		if (sessionId.data === locals.session?.id) {
			deleteSessionCookie(cookies);
			redirect(303, resolve('/login'));
		}
	},
	revokeAll: async ({ cookies, locals, url }) => {
		const user = requireUser(locals, url);
		await deleteSessionsByUser(user.id);
		deleteSessionCookie(cookies);
		redirect(303, resolve('/login'));
	}
};
