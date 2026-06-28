import 'dotenv/config';
import { expect, test, type Page } from '@playwright/test';
import { Pool } from 'pg';

const VICTIM_EMAIL = 'e2e-authorization-victim@example.test';
const ATTACKER_EMAIL = 'e2e-authorization-attacker@example.test';
const TEST_PASSWORD = 'correct horse battery staple';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function register(page: Page, displayName: string, email: string) {
	await page.goto('/register');
	await page.getByLabel('表示名').fill(displayName);
	await page.getByLabel('メールアドレス').fill(email);
	await page.getByLabel('パスワード').fill(TEST_PASSWORD);
	await page.getByRole('button', { name: '登録して始める' }).click();
	await expect(page).toHaveURL(/\/notes$/);
}

test.beforeAll(async () => {
	await pool.query('DELETE FROM users WHERE email = ANY($1)', [[VICTIM_EMAIL, ATTACKER_EMAIL]]);
});

test.afterAll(async () => {
	await pool.query('DELETE FROM users WHERE email = ANY($1)', [[VICTIM_EMAIL, ATTACKER_EMAIL]]);
	await pool.end();
});

test('rejects horizontal privilege escalation through pages, actions and the API', async ({
	browser
}) => {
	const victimContext = await browser.newContext();
	const attackerContext = await browser.newContext();
	const victimPage = await victimContext.newPage();
	const attackerPage = await attackerContext.newPage();

	try {
		await register(victimPage, '被害者ユーザー', VICTIM_EMAIL);
		await victimPage.getByRole('link', { name: '新しいメモ ＋' }).click();
		await victimPage.getByLabel('タイトル').fill('他人には見えないメモ');
		await victimPage.getByLabel('本文').fill('所有者だけが読める本文');
		await victimPage.getByRole('button', { name: 'メモを作成' }).click();
		await expect(victimPage).toHaveURL(/\/notes\/[0-9a-f-]{36}$/);
		const noteId = new URL(victimPage.url()).pathname.split('/').at(-1)!;
		const ownerApiResponse = await victimContext.request.get(`/api/notes/${noteId}`);
		expect(ownerApiResponse.status()).toBe(200);
		expect(await ownerApiResponse.json()).toEqual({
			note: expect.objectContaining({
				id: noteId,
				title: '他人には見えないメモ',
				body: '所有者だけが読める本文'
			})
		});
		expect((await attackerContext.request.get(`/api/notes/${noteId}`)).status()).toBe(401);
		expect((await attackerContext.request.get('/api/search?q=他人')).status()).toBe(401);

		await register(attackerPage, '攻撃者ユーザー', ATTACKER_EMAIL);

		const detailResponse = await attackerPage.goto(`/notes/${noteId}`);
		expect(detailResponse?.status()).toBe(404);
		const editResponse = await attackerPage.goto(`/notes/${noteId}/edit`);
		expect(editResponse?.status()).toBe(404);

		const updateStatus = await attackerPage.evaluate(async (id) => {
			const response = await fetch(`/notes/${id}/edit`, {
				method: 'POST',
				body: new URLSearchParams({ title: '奪ったメモ', body: '不正更新' })
			});
			return response.status;
		}, noteId);
		expect(updateStatus).toBe(404);
		const deleteStatus = await attackerPage.evaluate(async (id) => {
			const response = await fetch(`/notes/${id}?/delete`, {
				method: 'POST',
				body: new URLSearchParams()
			});
			return response.status;
		}, noteId);
		expect(deleteStatus).toBe(404);

		expect((await attackerContext.request.get(`/api/notes/${noteId}`)).status()).toBe(404);
		expect(
			(
				await attackerContext.request.patch(`/api/notes/${noteId}`, {
					data: { title: '奪ったメモ', body: 'APIから不正更新' }
				})
			).status()
		).toBe(404);
		expect((await attackerContext.request.delete(`/api/notes/${noteId}`)).status()).toBe(404);
		const attackerSearch = await attackerContext.request.get('/api/search?q=他人には見えないメモ');
		expect(attackerSearch.status()).toBe(200);
		expect((await attackerSearch.json()).total).toBe(0);

		await victimPage.reload();
		await expect(victimPage.getByRole('heading', { level: 1 })).toHaveText('他人には見えないメモ');
		await expect(victimPage.getByText('所有者だけが読める本文')).toBeVisible();
	} finally {
		await victimContext.close();
		await attackerContext.close();
	}
});
