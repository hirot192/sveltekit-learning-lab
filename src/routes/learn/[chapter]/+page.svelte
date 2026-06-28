<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();

	const chapterNumber = $derived(data.chapterNumber);
</script>

<svelte:head>
	<title>{data.chapter.title} | SvelteKit Learning Lab</title>
	<meta name="description" content={data.chapter.summary} />
</svelte:head>

<div class="lesson-shell shell">
	<aside class="lesson-sidebar" aria-label="章の情報">
		<a class="back-link" href={resolve('/')}>← 学習マップ</a>
		<div class="lesson-index"><small>CHAPTER</small><strong>{chapterNumber}</strong></div>
		<nav aria-label="この章の目次">
			<a href="#goal">学習ゴール</a><a href="#flow">処理の流れ</a><a href="#source">読むソース</a><a
				href="#experiment">実験</a
			>
		</nav>
	</aside>

	<article class="lesson">
		<header class="lesson-header">
			<p class="eyebrow"><span aria-hidden="true"></span> Chapter {chapterNumber}</p>
			<h1>{data.chapter.title}</h1>
			<p>{data.chapter.summary}</p>
			<div class="topic-list">
				{#each data.chapter.topics as topic (topic)}<span>{topic}</span>{/each}
			</div>
			{#if data.chapter.prerequisites.length > 0}
				<div class="lesson-prerequisites" aria-labelledby="prerequisites-heading">
					<strong id="prerequisites-heading">この章の前提</strong>
					<ul>
						{#each data.chapter.prerequisites as prerequisite (prerequisite)}
							<li>{prerequisite}</li>
						{/each}
					</ul>
				</div>
			{/if}
			{#if data.chapter.demo === 'notes'}
				<a class="button primary lesson-demo-link" href={resolve('/notes')}
					>動くデモを開く <span>→</span></a
				>
			{:else if data.chapter.demo === 'compare'}
				<a class="button primary lesson-demo-link" href={resolve('/compare')}
					>比較デモを開く <span>→</span></a
				>
			{/if}
		</header>

		{#if data.chapter.status === 'planned'}
			<section class="notice">
				<strong>この章は準備中です。</strong>
				<p>対応するアプリ機能の実装後、処理フローと実験を追加します。</p>
			</section>
		{:else}
			<section class="lesson-section" id="goal">
				<p class="section-label">01 — GOAL</p>
				<h2>この章を終えると</h2>
				<ul class="check-list">
					{#each data.chapter.goals as goal (goal)}<li>
							<span aria-hidden="true">✓</span>{goal}
						</li>{/each}
				</ul>
			</section>

			<section class="lesson-section" id="flow">
				<p class="section-label">02 — REQUEST FLOW</p>
				<h2>URLから画面まで</h2>
				<ol class="flow-list">
					{#each data.chapter.flow as step, index (step.label)}
						<li>
							<span>{String(index + 1).padStart(2, '0')}</span>
							<div>
								<strong>{step.label}</strong>
								<p>{step.detail}</p>
							</div>
						</li>
					{/each}
				</ol>
				{#if data.chapter.snippet}
					<div class="code-block">
						<div><span>TypeScript</span><span>+page.ts</span></div>
						<pre><code>{data.chapter.snippet}</code></pre>
					</div>
				{/if}
			</section>

			<section class="lesson-section" id="source">
				<p class="section-label">03 — SOURCE MAP</p>
				<h2>この順番で読む</h2>
				<div class="source-list">
					{#each data.chapter.sourceFiles as file, index (file.path)}<div>
							<span>{index + 1}</span><code>{file.path}</code>
							<p>{file.role}</p>
						</div>{/each}
				</div>
			</section>

			<section class="experiment" id="experiment">
				<p class="section-label">04 — TRY IT</p>
				<h2>{data.chapter.experiment.title}</h2>
				<ol>
					{#each data.chapter.experiment.steps as step (step)}<li>{step}</li>{/each}
				</ol>
				<div>
					<strong>期待する結果</strong>
					<p>{data.chapter.experiment.expected}</p>
				</div>
			</section>
		{/if}
	</article>
</div>
