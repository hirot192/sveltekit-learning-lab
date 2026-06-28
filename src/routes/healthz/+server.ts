import { json } from '@sveltejs/kit';
import { pool } from '$lib/server/db/client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		await pool.query('SELECT 1');
		return json({ status: 'ok', database: 'ok' }, { headers: { 'cache-control': 'no-store' } });
	} catch {
		return json(
			{ status: 'unavailable', database: 'unavailable' },
			{ status: 503, headers: { 'cache-control': 'no-store' } }
		);
	}
};
