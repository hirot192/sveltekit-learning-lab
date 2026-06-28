import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { authenticateAccount } from '$lib/server/auth/account';
import { safeReturnTo } from '$lib/server/auth/guard';
import { createSession, setSessionCookie } from '$lib/server/auth/session';
import { accountInputFromFormData, loginSchema } from '$lib/server/validation/account';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(303, resolve('/notes'));
	return { returnTo: safeReturnTo(url.searchParams.get('returnTo')) };
};

export const actions: Actions = {
	default: async ({ cookies, locals, request }) => {
		if (locals.user) redirect(303, resolve('/notes'));

		const formData = await request.formData();
		const input = accountInputFromFormData(formData);
		const returnTo = safeReturnTo(String(formData.get('returnTo') ?? ''));
		const result = loginSchema.safeParse({ email: input.email, password: input.password });

		if (!result.success) {
			return fail(400, {
				values: { email: input.email, returnTo },
				message: 'メールアドレスまたはパスワードが正しくありません。'
			});
		}

		const user = await authenticateAccount(result.data.email, result.data.password);

		if (!user) {
			return fail(400, {
				values: { email: input.email, returnTo },
				message: 'メールアドレスまたはパスワードが正しくありません。'
			});
		}

		const { session, token } = await createSession(user.id, request.headers.get('user-agent'));
		setSessionCookie(cookies, token, session.expiresAt);
		redirect(303, returnTo);
	}
};
