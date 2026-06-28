import { Pool } from 'pg';

const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is required');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const client = await pool.connect();

try {
	await client.query('BEGIN');
	await client.query(
		`INSERT INTO users (id, email, display_name, password_hash)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (id) DO UPDATE
		 SET display_name = EXCLUDED.display_name, updated_at = now()`,
		[DEMO_USER_ID, 'demo@example.test', 'デモユーザー', '!m2-demo-user-cannot-login!']
	);

	const existing = await client.query(
		'SELECT count(*)::integer AS count FROM notes WHERE user_id = $1',
		[DEMO_USER_ID]
	);

	if (existing.rows[0].count === 0) {
		await client.query(
			`INSERT INTO notes (user_id, title, body) VALUES
			 ($1, $2, $3),
			 ($1, $4, $5)`,
			[
				DEMO_USER_ID,
				'SvelteKitのリクエストを追う',
				'URLからrouteが選ばれ、loadでデータを読み、SvelteコンポーネントがHTMLを描画する。',
				'Form Actionsで覚えること',
				'FormDataの取得、サーバー側validation、DBへの保存、redirectまでを一つずつ確認する。'
			]
		);
	}

	await client.query('COMMIT');
	console.log(
		`Seed complete: demo user and ${existing.rows[0].count === 0 ? 2 : existing.rows[0].count} notes`
	);
} catch (error) {
	await client.query('ROLLBACK');
	throw error;
} finally {
	client.release();
	await pool.end();
}
