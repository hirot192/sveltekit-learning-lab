import { requireUser } from '$lib/server/auth/guard';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals, url }) => ({
	user: requireUser(locals, url)
});
