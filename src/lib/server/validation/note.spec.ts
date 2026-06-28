import { describe, expect, it } from 'vitest';
import {
	comparisonSearchSchema,
	noteInputSchema,
	noteListQueryFromUrl,
	parseTagNames
} from './note';

describe('note input validation', () => {
	it('trims a valid note', () => {
		const result = noteInputSchema.parse({ title: '  学習メモ  ', body: '  本文  ' });

		expect(result).toEqual({ title: '学習メモ', body: '本文', tags: [] });
	});

	it('normalizes comma-separated tags and removes duplicates', () => {
		expect(parseTagNames(' SvelteKit, PostgreSQL、sveltekit ')).toEqual([
			'sveltekit',
			'PostgreSQL'
		]);
	});

	it('parses list state from URL parameters and falls back for invalid values', () => {
		expect(
			noteListQueryFromUrl(
				new URL('https://example.test/notes?q=kit&tag=SVELTE&sort=created_asc&page=2')
			)
		).toEqual({ q: 'kit', tag: 'svelte', sort: 'created_asc', page: 2 });

		expect(noteListQueryFromUrl(new URL('https://example.test/notes?page=-1&sort=nope'))).toEqual({
			q: '',
			tag: '',
			sort: 'updated_desc',
			page: 1
		});
	});

	it('validates the shared comparison search input', () => {
		expect(comparisonSearchSchema.parse({ q: '  Remote Functions  ' })).toEqual({
			q: 'Remote Functions'
		});
		expect(comparisonSearchSchema.safeParse({ q: 'x'.repeat(101) }).success).toBe(false);
	});

	it('rejects a blank title', () => {
		const result = noteInputSchema.safeParse({ title: '   ', body: '' });

		expect(result.success).toBe(false);
	});

	it('rejects a title longer than the database column', () => {
		const result = noteInputSchema.safeParse({ title: 'a'.repeat(161), body: '' });

		expect(result.success).toBe(false);
	});
});
