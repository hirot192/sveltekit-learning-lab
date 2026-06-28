<script lang="ts">
	import ChapterCard from '$lib/components/ChapterCard.svelte';
	import { chapters } from '$lib/content/chapters';
	import { resolve } from '$app/paths';

	const readyCount = chapters.filter((chapter) => chapter.status === 'ready').length;
</script>

<svelte:head>
	<title>SvelteKit Learning Lab</title>
</svelte:head>

<section class="hero shell">
	<div class="hero-copy">
		<p class="eyebrow"><span aria-hidden="true"></span> Source-first SvelteKit course</p>
		<h1><span>動いた。その次の</span><span><em>「なぜ？」</em>まで。</span></h1>
		<p class="hero-lead">
			完成したメモアプリを分解しながら、URLへのアクセスがどのファイルを通り、
			データがどこでHTMLになるのかを追跡する教材です。
		</p>
		<div class="hero-actions">
			<a class="button primary" href={resolve('/learn/[chapter]', { chapter: 'routing' })}
				>最初の章を読む <span>→</span></a
			>
			<a class="button secondary" href="#curriculum">学習マップを見る</a>
		</div>
	</div>

	<div class="request-map" aria-label="リクエストの流れ">
		<div class="map-header">
			<span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span>
			<code>GET /notes</code>
		</div>
		<ol>
			<li>
				<span>01</span>
				<div><strong>Browser</strong><small>URLへアクセス</small></div>
				<code>request</code>
			</li>
			<li>
				<span>02</span>
				<div><strong>hooks.server.ts</strong><small>セッションを復元</small></div>
				<code>locals</code>
			</li>
			<li>
				<span>03</span>
				<div><strong>+page.server.ts</strong><small>データを読み込む</small></div>
				<code>load()</code>
			</li>
			<li>
				<span>04</span>
				<div><strong>PostgreSQL</strong><small>所有者のメモを検索</small></div>
				<code>SELECT</code>
			</li>
			<li class="map-result">
				<span>05</span>
				<div><strong>+page.svelte</strong><small>HTMLを描画</small></div>
				<code>200 OK</code>
			</li>
		</ol>
	</div>
</section>

<section class="principles shell" aria-label="教材の特徴">
	<div>
		<span class="principle-number">01</span><strong>触ってから読む</strong>
		<p>まず挙動を確認し、その直後に担当コードを開きます。</p>
	</div>
	<div>
		<span class="principle-number">02</span><strong>境界を追いかける</strong>
		<p>ブラウザ、サーバー、DBをまたぐ値の変化を可視化します。</p>
	</div>
	<div>
		<span class="principle-number">03</span><strong>壊して確かめる</strong>
		<p>小さな実験で、規約やセキュリティの理由を確かめます。</p>
	</div>
</section>

<section class="curriculum shell" id="curriculum">
	<div class="section-heading">
		<div>
			<p class="eyebrow"><span aria-hidden="true"></span> Curriculum</p>
			<h2>一つのアプリを、層ごとに理解する。</h2>
		</div>
		<p><strong>{readyCount}</strong> / {chapters.length} 章を公開中</p>
	</div>
	<div class="chapter-grid">
		{#each chapters as chapter, index (chapter.slug)}<ChapterCard
				{chapter}
				number={index + 1}
			/>{/each}
	</div>
</section>

<section class="next-step shell">
	<div>
		<p class="eyebrow light"><span aria-hidden="true"></span> Start here</p>
		<h2>最初のリクエストを<br />追いかけよう。</h2>
	</div>
	<div>
		<p>第1章ではファイルベースルーティングを扱います。このページ自身が、最初の実例です。</p>
		<a class="button inverted" href={resolve('/learn/[chapter]', { chapter: 'routing' })}
			>第1章へ進む <span>→</span></a
		>
	</div>
</section>
