import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { z } from 'zod';
import { registerAccount } from '$lib/server/auth/account';
import { createSession, setSessionCookie } from '$lib/server/auth/session';
import { accountInputFromFormData, registerSchema } from '$lib/server/validation/account';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, resolve('/notes'));
};

export const actions: Actions = {
	default: async ({ cookies, locals, request }) => {
		if (locals.user) redirect(303, resolve('/notes'));

		const input = accountInputFromFormData(await request.formData());
		const result = registerSchema.safeParse(input);
		const values = { email: input.email, displayName: input.displayName };

		if (!result.success) {
			return fail(400, { values, errors: z.flattenError(result.error).fieldErrors });
		}

		const user = await registerAccount(result.data);

		if (!user) {
			return fail(400, {
				values,
				message: 'アカウントを作成できませんでした。入力内容を確認してください。'
			});
		}

		const { session, token } = await createSession(user.id, request.headers.get('user-agent'));
		setSessionCookie(cookies, token, session.expiresAt);
		redirect(303, resolve('/notes'));
	}
};
