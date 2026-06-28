import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { chapters } from '../src/lib/content/chapters';
import { getChapterReading } from '../src/lib/content/readings';

const root = process.cwd();
const failures: string[] = [];

for (const chapter of chapters.filter((item) => item.status === 'ready')) {
	const reading = getChapterReading(chapter.slug);
	if (!reading) {
		failures.push(`${chapter.slug}: reading is missing`);
		continue;
	}

	if (reading.tryFirst.steps.length === 0)
		failures.push(`${chapter.slug}: tryFirst.steps is empty`);
	if (reading.concepts.length === 0) failures.push(`${chapter.slug}: concepts is empty`);
	if (reading.checkpoints.length === 0) failures.push(`${chapter.slug}: checkpoints is empty`);

	const requiredLists = [
		['prerequisites', chapter.prerequisites],
		['goals', chapter.goals],
		['flow', chapter.flow],
		['sourceFiles', chapter.sourceFiles],
		['experiment.steps', chapter.experiment.steps]
	] as const;

	for (const [name, value] of requiredLists) {
		if (value.length === 0) failures.push(`${chapter.slug}: ${name} is empty`);
	}

	for (const source of chapter.sourceFiles) {
		if (!existsSync(resolve(root, source.path))) {
			failures.push(`${chapter.slug}: source file not found: ${source.path}`);
		}
	}
}

const markdownFiles = [
	...readdirSync(root)
		.filter((name) => extname(name) === '.md')
		.map((name) => resolve(root, name)),
	...readdirSync(resolve(root, 'docs'))
		.filter((name) => extname(name) === '.md')
		.map((name) => resolve(root, 'docs', name))
];

for (const markdownFile of markdownFiles) {
	const markdown = readFileSync(markdownFile, 'utf8');
	for (const match of markdown.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
		const target = match[1].split('#')[0];
		if (!target || /^(?:https?:|mailto:)/.test(target)) continue;
		if (!existsSync(resolve(dirname(markdownFile), decodeURIComponent(target)))) {
			failures.push(`${markdownFile.slice(root.length + 1)}: link not found: ${target}`);
		}
	}
}

if (failures.length > 0) {
	console.error(`Content check failed:\n- ${failures.join('\n- ')}`);
	process.exitCode = 1;
} else {
	console.log(
		`Content check passed: ${chapters.length} chapters, ${markdownFiles.length} Markdown files`
	);
}
