import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

if (!env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required');
}

const globalForDatabase = globalThis as typeof globalThis & {
	learningLabPool?: Pool;
	learningLabPoolErrorRegistered?: boolean;
	learningLabShutdownRegistered?: boolean;
};

export const pool =
	globalForDatabase.learningLabPool ??
	new Pool({
		connectionString: env.DATABASE_URL,
		max: 10,
		idleTimeoutMillis: 30_000
	});

if (dev) {
	globalForDatabase.learningLabPool = pool;
}

if (!globalForDatabase.learningLabPoolErrorRegistered) {
	globalForDatabase.learningLabPoolErrorRegistered = true;
	pool.on('error', (error) => {
		const code = 'code' in error && typeof error.code === 'string' ? error.code : 'UNKNOWN';
		console.error(`PostgreSQL pool error (${code}): ${error.message}`);
	});
}

if (!dev && !globalForDatabase.learningLabShutdownRegistered) {
	globalForDatabase.learningLabShutdownRegistered = true;
	process.once('sveltekit:shutdown', async (reason) => {
		await pool.end();
		console.info(`Database pool closed after ${String(reason)}`);
	});
}

export const db = drizzle({ client: pool, schema, logger: dev });
