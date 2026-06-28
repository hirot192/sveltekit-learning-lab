import 'dotenv/config';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { Pool } from 'pg';

const TEST_EMAIL = 'e2e-accessibility@example.test';
const TEST_PASSWORD = 'correct horse battery staple';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function expectNoAccessibilityViolations(page: Page) {
	const results = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
		.analyze();
	expect(results.violations).toEqual([]);
}

test.beforeAll(async () => {
	await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
});

test.afterAll(async () => {
	await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL]);
	await pool.end();
});

test('has no automatically detectable WCAG A/AA violations on representative pages', async ({
	page
}) => {
	await page.goto('/');
	await expectNoAccessibilityViolations(page);

	await page.goto('/register');
	await expectNoAccessibilityViolations(page);
	await page.getByLabel('表示名').fill('アクセシビリティ検査');
	await page.getByLabel('メールアドレス').fill(TEST_EMAIL);
	await page.getByLabel('パスワード').fill(TEST_PASSWORD);
	await page.getByRole('button', { name: '登録して始める' }).click();

	await expect(page).toHaveURL(/\/notes$/);
	await expectNoAccessibilityViolations(page);

	await page.goto('/compare');
	await expect(page.getByRole('heading', { name: 'Remote query', exact: true })).toBeVisible();
	await expectNoAccessibilityViolations(page);
});

test('renders a safe and accessible 404 page', async ({ page }) => {
	const response = await page.goto('/learn/not-found');

	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('ページが見つかりません');
	await expect(page.getByText('Chapter not found')).toHaveCount(0);
	await expectNoAccessibilityViolations(page);
});
