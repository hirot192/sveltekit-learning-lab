import { defineConfig } from '@playwright/test';

export default defineConfig({
	expect: { timeout: 10_000 },
	webServer: { command: 'npm run build && npm run preview', port: 4173 },
	testMatch: '**/*.e2e.{ts,js}'
});
