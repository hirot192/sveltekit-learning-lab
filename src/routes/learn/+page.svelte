<script lang="ts">
	import { resolve } from '$app/paths';
	import InlineText from '$lib/components/InlineText.svelte';
	import { primer } from '$lib/content/primer';
</script>

<svelte:head>
	<title>{primer.title} | SvelteKit Learning Lab</title>
	<meta name="description" content={primer.summary} />
</svelte:head>

<div class="lesson-shell primer-shell shell">
	<aside class="lesson-sidebar" aria-label="基礎編の目次">
		<a class="back-link" href={resolve('/')}>← 学習マップ</a>
		<div class="lesson-index"><small>PART</small><strong>00</strong></div>
		<nav aria-label="この基礎編の目次">
			<a href="#goals">学習ゴール</a>
			{#each primer.sections as section (section.id)}
				<a href={`#${section.id}`}>{section.title}</a>
			{/each}
		</nav>
	</aside>

	<article class="lesson primer">
		<header class="lesson-header primer-header">
			<p class="eyebrow"><span aria-hidden="true"></span> Part 00 — Orientation</p>
			<h1>{primer.title}</h1>
			<p>{primer.summary}</p>
			<div class="primer-position" aria-label="学習の順序">
				<strong>この基礎編</strong><span aria-hidden="true">→</span><span>アプリを触る</span><span
					aria-hidden="true">→</span
				><span>コードを読む</span>
			</div>
		</header>

		<section class="lesson-section" id="goals">
			<p class="section-label">BEFORE YOU START</p>
			<h2>この基礎編を終えると</h2>
			<ul class="check-list">
				{#each primer.goals as goal (goal)}
					<li><span aria-hidden="true">✓</span>{goal}</li>
				{/each}
			</ul>
		</section>

		{#each primer.sections as section (section.id)}
			<section class="lesson-section reading-section" id={section.id}>
				<p class="section-label">{section.kicker}</p>
				<h2>{section.title}</h2>
				<div class="reading-copy">
					{#each section.paragraphs as paragraph (paragraph)}
						<p><InlineText text={paragraph} /></p>
					{/each}
				</div>

				{#if section.points}
					<ul class="reading-points">
						{#each section.points as point (point)}
							<li><InlineText text={point} /></li>
						{/each}
					</ul>
				{/if}

				{#if section.flow}
					<ol class="flow-list primer-flow">
						{#each section.flow as step, index (step.label)}
							<li>
								<span>{String(index + 1).padStart(2, '0')}</span>
								<div>
									<strong>{step.label}</strong>
									<p>{step.detail}</p>
								</div>
							</li>
						{/each}
					</ol>
				{/if}
			</section>
		{/each}

		<section class="primer-next">
			<p class="section-label">NEXT</p>
			<h2>地図を持って、最初のrouteへ。</h2>
			<p>第1章では、いま読んでいる教材ページのURLとソースコードを実際に対応させます。</p>
			<a class="button inverted" href={resolve('/learn/[chapter]', { chapter: 'routing' })}
				>第1章へ進む <span>→</span></a
			>
		</section>
	</article>
</div>
