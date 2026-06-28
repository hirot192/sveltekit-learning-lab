import 'dotenv/config';
import { expect, test } from '@playwright/test';
import { Pool } from 'pg';

const TEST_EMAIL = 'e2e-user@example.test';
const TEST_PASSWORD = 'correct horse battery staple';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

test.beforeAll(async () => {
	await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
});

test.afterAll(async () => {
	await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
	await pool.end();
});

test('reads the primer before opening the first chapter', async ({ page }) => {
	await page.goto('/');

	await expect(page.getByRole('heading', { level: 1 })).toContainText('「なぜ？」まで');
	await page.getByRole('link', { name: '基礎編から読む' }).click();
	await expect(page).toHaveURL(/\/learn$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('SvelteKitを読むための地図');
	await page.getByRole('link', { name: '第1章へ進む' }).click();
	await expect(page).toHaveURL(/\/learn\/routing$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ルーティングと描画');
});

test('registers, manages notes and starts a new database session', async ({ page }) => {
	const title = `E2Eメモ ${Date.now()}`;

	await page.goto('/notes');
	await expect(page).toHaveURL(/\/login\?returnTo=%2Fnotes$/);
	await page.getByRole('link', { name: 'アカウント登録' }).click();
	await page.getByLabel('表示名').fill('E2E学習者');
	await page.getByLabel('メールアドレス').fill(TEST_EMAIL);
	await page.getByLabel('パスワード').fill(TEST_PASSWORD);
	await page.getByRole('button', { name: '登録して始める' }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('メモ');
	await page.getByRole('link', { name: '新しいメモ ＋' }).click();

	await page.getByLabel('タイトル').fill(title);
	await page.getByLabel('本文').fill('Form Actionで作成しました。');
	await page.getByLabel('タグ').fill('E2E, SvelteKit');
	await page.getByRole('button', { name: 'メモを作成' }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
	const noteId = new URL(page.url()).pathname.split('/').at(-1)!;
	await expect(page.getByText('#E2E')).toBeVisible();

	await page.getByRole('link', { name: '編集する' }).click();
	await page.getByLabel('本文').fill('Form Actionで更新しました。');
	await page.getByRole('button', { name: '変更を保存' }).click();
	await expect(page.getByText('Form Actionで更新しました。')).toBeVisible();

	await page.goto('/notes');
	await page.getByLabel('キーワード').fill(title);
	await page.getByRole('button', { name: '検索', exact: true }).click();
	await expect(page).toHaveURL(/q=E2E/);
	await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
	await page.getByRole('button', { name: '#E2E 1' }).click();
	await expect(page).toHaveURL(/tag=e2e/);
	await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();

	const user = await pool.query<{ id: string }>('SELECT id FROM users WHERE email = $1', [
		TEST_EMAIL
	]);
	await pool.query(
		`INSERT INTO notes (user_id, title, body)
		 SELECT $1, 'ページング用メモ ' || value, 'E2E pagination fixture'
		 FROM generate_series(1, 6) AS value`,
		[user.rows[0].id]
	);
	await page.goto('/notes');
	expect(await page.locator('.note-card').count()).toBe(6);
	await page.getByRole('button', { name: '次へ →' }).click();
	await expect(page).toHaveURL(/page=2/);
	expect(await page.locator('.note-card').count()).toBe(1);

	await page.goto(`/compare?q=${encodeURIComponent(title)}`);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('同じ検索');
	await expect(page.getByRole('heading', { name: 'Remote query', exact: true })).toBeVisible();
	await expect(page.locator('.transport-result li').getByText(title, { exact: true })).toHaveCount(
		2
	);
	await page.getByRole('button', { name: 'HTTP API', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'HTTP API', exact: true })).toBeVisible();
	await expect(page.locator('.transport-result li').getByText(title, { exact: true })).toHaveCount(
		3
	);
	await page.getByRole('button', { name: 'Remote query.refresh()', exact: true }).click();

	await page.goto(`/notes/${noteId}`);
	await page.getByRole('button', { name: '削除する' }).click();
	await expect(page).toHaveURL(/\/notes$/);
	await expect(page.getByText(title)).toHaveCount(0);

	await page.goto('/settings/sessions');
	await expect(page.getByRole('heading', { name: 'ログイン中の端末' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'この端末 現在' })).toBeVisible();

	await page.getByRole('button', { name: 'ログアウト', exact: true }).click();
	await expect(page).toHaveURL(/\/$/);
	await page.getByRole('link', { name: 'ログイン', exact: true }).click();
	await page.getByLabel('メールアドレス').fill(TEST_EMAIL);
	await page.getByLabel('パスワード').fill(TEST_PASSWORD);
	await page.getByRole('button', { name: 'ログイン' }).click();
	await expect(page).toHaveURL(/\/notes$/);
});
