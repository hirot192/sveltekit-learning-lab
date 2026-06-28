import { z } from 'zod';

export const noteIdSchema = z.uuid();
export const NOTE_PAGE_SIZE = 6;

const tagNameSchema = z.string().trim().min(1).max(40, 'タグは40文字以内で入力してください');

export function normalizeTagName(value: string) {
	return value.trim().toLowerCase();
}

export function parseTagNames(value: string) {
	const uniqueTags = new Map<string, string>();

	for (const part of value.split(/[,、]/)) {
		const name = part.trim();
		if (name) uniqueTags.set(normalizeTagName(name), name);
	}

	return [...uniqueTags.values()];
}

const tagNamesSchema = z
	.array(tagNameSchema)
	.max(5, 'タグは5個まで指定できます')
	.refine((names) => new Set(names.map(normalizeTagName)).size === names.length, {
		message: '同じタグを重複して指定できません'
	});

export const noteInputSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, 'タイトルを入力してください')
		.max(160, 'タイトルは160文字以内で入力してください'),
	body: z.string().trim().max(20_000, '本文は20,000文字以内で入力してください'),
	tags: tagNamesSchema.default([])
});

export type NoteInput = z.infer<typeof noteInputSchema>;

export function noteInputFromFormData(formData: FormData): NoteInput {
	return {
		title: String(formData.get('title') ?? ''),
		body: String(formData.get('body') ?? ''),
		tags: parseTagNames(String(formData.get('tags') ?? ''))
	};
}

export const noteSortSchema = z.enum(['updated_desc', 'created_desc', 'created_asc']);
export type NoteSort = z.infer<typeof noteSortSchema>;

export const comparisonSearchSchema = z.object({
	q: z.string().trim().max(100, '検索語は100文字以内で入力してください')
});

export const noteListQuerySchema = z.object({
	q: z.string().trim().max(100).catch(''),
	tag: z.string().trim().max(40).transform(normalizeTagName).catch(''),
	sort: noteSortSchema.catch('updated_desc'),
	page: z.coerce.number().int().min(1).catch(1)
});

export type NoteListQuery = z.infer<typeof noteListQuerySchema>;

export function noteListQueryFromUrl(url: URL): NoteListQuery {
	return noteListQuerySchema.parse({
		q: url.searchParams.get('q') ?? '',
		tag: url.searchParams.get('tag') ?? '',
		sort: url.searchParams.get('sort') ?? 'updated_desc',
		page: url.searchParams.get('page') ?? '1'
	});
}
