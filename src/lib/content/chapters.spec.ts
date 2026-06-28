import { describe, expect, it } from 'vitest';
import { chapters, getChapter } from './chapters';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('chapter catalog', () => {
	it('uses unique slugs', () => {
		const slugs = chapters.map((chapter) => chapter.slug);

		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('finds the routing chapter', () => {
		expect(getChapter('routing')).toMatchObject({ title: 'ルーティングと描画', status: 'ready' });
	});

	it('publishes the authorization chapter with its attack experiment', () => {
		expect(getChapter('authorization')).toMatchObject({
			title: '認証と認可を分ける',
			status: 'ready',
			experiment: { title: '別アカウントのURLを開く' }
		});
	});

	it('publishes the search chapter with URL state and index material', () => {
		expect(getChapter('search')).toMatchObject({
			title: '検索とURL state',
			status: 'ready',
			experiment: { title: 'URLと実行計画を観察する' }
		});
	});

	it('publishes the transport comparison chapter', () => {
		expect(getChapter('transports')).toMatchObject({
			title: '3つのサーバー通信を比べる',
			status: 'ready',
			demo: 'compare'
		});
	});

	it('returns undefined for an unknown chapter', () => {
		expect(getChapter('not-found')).toBeUndefined();
	});

	it('keeps every published chapter complete and its source map valid', () => {
		for (const chapter of chapters.filter((item) => item.status === 'ready')) {
			expect(chapter.prerequisites, chapter.slug).not.toHaveLength(0);
			expect(chapter.goals, chapter.slug).not.toHaveLength(0);
			expect(chapter.flow, chapter.slug).not.toHaveLength(0);
			expect(chapter.sourceFiles, chapter.slug).not.toHaveLength(0);
			expect(chapter.experiment.steps, chapter.slug).not.toHaveLength(0);
			expect(chapter.experiment.expected, chapter.slug).not.toBe('');

			for (const source of chapter.sourceFiles) {
				expect(existsSync(resolve(process.cwd(), source.path)), source.path).toBe(true);
			}
		}
	});
});
