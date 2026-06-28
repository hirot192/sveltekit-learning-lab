import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DEMO_USER_ID } from '../src/lib/server/demo-user';
import { notes, users } from '../src/lib/server/db/schema';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required. Copy .env.example to .env first.');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

try {
	await db
		.insert(users)
		.values({
			id: DEMO_USER_ID,
			email: 'demo@example.test',
			displayName: 'デモユーザー',
			passwordHash: '!m2-demo-user-cannot-login!'
		})
		.onConflictDoUpdate({
			target: users.id,
			set: { displayName: 'デモユーザー', updatedAt: new Date() }
		});

	const existingNotes = await db
		.select({ id: notes.id })
		.from(notes)
		.where(eq(notes.userId, DEMO_USER_ID));

	if (existingNotes.length === 0) {
		await db.insert(notes).values([
			{
				userId: DEMO_USER_ID,
				title: 'SvelteKitのリクエストを追う',
				body: 'URLからrouteが選ばれ、loadでデータを読み、SvelteコンポーネントがHTMLを描画する。'
			},
			{
				userId: DEMO_USER_ID,
				title: 'Form Actionsで覚えること',
				body: 'FormDataの取得、サーバー側validation、DBへの保存、redirectまでを一つずつ確認する。'
			}
		]);
	}

	console.log(
		`Seed complete: demo user and ${existingNotes.length === 0 ? 2 : existingNotes.length} notes`
	);
} finally {
	await pool.end();
}
