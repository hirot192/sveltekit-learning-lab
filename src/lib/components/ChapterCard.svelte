<script lang="ts">
	import type { Chapter } from '$lib/content/chapters';
	import { resolve } from '$app/paths';

	let { chapter, number }: { chapter: Chapter; number: number } = $props();
</script>

<article class:available={chapter.status === 'ready'} class="chapter-card">
	<div class="chapter-meta">
		<span>{String(number).padStart(2, '0')}</span>
		<span class:ready={chapter.status === 'ready'} class="status">
			{chapter.status === 'ready' ? '公開中' : '準備中'}
		</span>
	</div>
	<h3>{chapter.title}</h3>
	<p>{chapter.summary}</p>
	<ul aria-label="この章で扱う技術">
		{#each chapter.topics as topic (topic)}
			<li>{topic}</li>
		{/each}
	</ul>
	{#if chapter.status === 'ready'}
		<a
			href={resolve('/learn/[chapter]', { chapter: chapter.slug })}
			aria-label={`${chapter.title}を読む`}
		>
			章を読む <span aria-hidden="true">→</span>
		</a>
	{:else}
		<span class="coming-soon">順次実装します</span>
	{/if}
</article>
