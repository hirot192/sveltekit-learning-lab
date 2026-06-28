import { error } from '@sveltejs/kit';
import { chapters, getChapter } from '$lib/content/chapters';
import { getChapterReading } from '$lib/content/readings';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const chapter = getChapter(params.chapter);
	const reading = getChapterReading(params.chapter);

	if (!chapter || !reading) {
		error(404, 'Chapter not found');
	}

	return {
		chapter,
		reading,
		chapterNumber: String(chapters.findIndex((item) => item.slug === chapter.slug) + 1).padStart(
			2,
			'0'
		)
	};
};
