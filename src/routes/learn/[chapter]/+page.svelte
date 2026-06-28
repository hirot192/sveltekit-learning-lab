<script lang="ts">
	import { resolve } from '$app/paths';
	import InlineText from '$lib/components/InlineText.svelte';

	let { data } = $props();

	const chapterNumber = $derived(data.chapterNumber);
</script>

<svelte:head>
	<title>{data.chapter.title} | SvelteKit Learning Lab</title>
	<meta name="description" content={data.chapter.summary} />
</svelte:head>

<div class="lesson-shell shell">
	<aside class="lesson-sidebar" aria-label="章の情報">
		<a class="back-link" href={resolve('/learn')}>← SvelteKit基礎編</a>
		<div class="lesson-index"><small>CHAPTER</small><strong>{chapterNumber}</strong></div>
		<nav aria-label="この章の目次">
			<a href="#goal">学習ゴール</a>
			<a href="#try-first">まず操作する</a>
			<a href="#concepts">新しい概念</a>
			<a href="#flow">処理の流れ</a>
			<a href="#source">読むソース</a>
			<a href="#experiment">実験</a>
			<a href="#check">理解度チェック</a>
		</nav>
	</aside>

	<article class="lesson">
		<header class="lesson-header">
			<p class="eyebrow"><span aria-hidden="true"></span> Chapter {chapterNumber}</p>
			<h1>{data.chapter.title}</h1>
			<p>{data.chapter.summary}</p>
			<p class="lesson-bridge">{data.reading.bridge}</p>
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

			<section class="lesson-section" id="try-first">
				<p class="section-label">02 — TOUCH THE APP</p>
				<h2>{data.reading.tryFirst.title}</h2>
				<ol class="try-first-list">
					{#each data.reading.tryFirst.steps as step, index (step)}
						<li>
							<span>{String(index + 1).padStart(2, '0')}</span>
							<p>{step}</p>
						</li>
					{/each}
				</ol>
				<div class="observation-note">
					<strong>観察すること</strong>
					<p>{data.reading.tryFirst.observe}</p>
				</div>
			</section>

			<section class="lesson-section" id="concepts">
				<p class="section-label">03 — NEW CONCEPTS</p>
				<h2>操作の中で登場した概念</h2>
				<div class="concept-list">
					{#each data.reading.concepts as concept (concept.title)}
						<section>
							<h3>{concept.title}</h3>
							<p><InlineText text={concept.body} /></p>
							<div>
								<strong>要点</strong><span><InlineText text={concept.takeaway} /></span>
							</div>
						</section>
					{/each}
				</div>
				<aside class="misconception">
					<p>
						<strong>よくある誤解</strong>「<InlineText text={data.reading.misconception.claim} />」
					</p>
					<p><InlineText text={data.reading.misconception.correction} /></p>
				</aside>
			</section>

			<section class="lesson-section" id="flow">
				<p class="section-label">04 — REQUEST FLOW</p>
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
				<p class="section-label">05 — SOURCE MAP</p>
				<h2>この順番で読む</h2>
				<div class="source-list">
					{#each data.chapter.sourceFiles as file, index (file.path)}<div>
							<span>{index + 1}</span><code>{file.path}</code>
							<p>{file.role}</p>
						</div>{/each}
				</div>
			</section>

			<section class="experiment" id="experiment">
				<p class="section-label">06 — CHANGE IT</p>
				<h2>{data.chapter.experiment.title}</h2>
				<ol>
					{#each data.chapter.experiment.steps as step (step)}<li>{step}</li>{/each}
				</ol>
				<div>
					<strong>期待する結果</strong>
					<p>{data.chapter.experiment.expected}</p>
				</div>
			</section>

			<section class="lesson-section checkpoint-section" id="check">
				<p class="section-label">07 — CHECK</p>
				<h2>自分の言葉で確認する</h2>
				<div class="checkpoint-list">
					{#each data.reading.checkpoints as checkpoint, index (checkpoint.question)}
						<details>
							<summary
								><span>{String(index + 1).padStart(2, '0')}</span><InlineText
									text={checkpoint.question}
								/></summary
							>
							<p><InlineText text={checkpoint.answer} /></p>
						</details>
					{/each}
				</div>
			</section>
		{/if}
	</article>
</div>
