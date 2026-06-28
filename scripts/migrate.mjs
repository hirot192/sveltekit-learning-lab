import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const db = drizzle({ client: pool });
const migrationsFolder = fileURLToPath(new URL('../drizzle', import.meta.url));

try {
	await migrate(db, { migrationsFolder });
	console.log('Migrations complete');
} finally {
	await pool.end();
}
