<script lang="ts">
	import { resolve } from '$app/paths';

	let { data } = $props();

	const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
</script>

<svelte:head>
	<title>メモ | SvelteKit Learning Lab</title>
	<meta name="description" content="PostgreSQLから読み込むメモ一覧の教材デモ" />
</svelte:head>

<div class="app-shell shell">
	<header class="app-heading">
		<div>
			<p class="eyebrow"><span aria-hidden="true"></span> M5 — URL state & search</p>
			<h1>メモ</h1>
			<p>この一覧は、サーバーの <code>load</code> がPostgreSQLから取得しています。</p>
		</div>
		<a class="button primary" href={resolve('/notes/new')}>新しいメモ <span>＋</span></a>
	</header>

	<aside class="demo-notice">
		<strong>{data.user.displayName} として操作中</strong>
		<span>
			検索条件にもユーザーIDを含め、URLから同じ結果を再現できます。
			<a href={resolve('/learn/[chapter]', { chapter: 'search' })}>検索の章を読む →</a>
		</span>
	</aside>

	<section class="search-panel" aria-labelledby="search-heading">
		<div>
			<p class="section-label">QUERY STATE</p>
			<h2 id="search-heading">メモを検索する</h2>
		</div>
		<form method="GET" action={resolve('/notes')}>
			<label for="q">キーワード</label>
			<input id="q" name="q" value={data.filters.q} placeholder="タイトルまたは本文" />
			<label for="sort">並び順</label>
			<select id="sort" name="sort" value={data.filters.sort}>
				<option value="updated_desc">更新が新しい順</option>
				<option value="created_desc">作成が新しい順</option>
				<option value="created_asc">作成が古い順</option>
			</select>
			{#if data.filters.tag}<input type="hidden" name="tag" value={data.filters.tag} />{/if}
			<button class="button primary" type="submit">検索</button>
			{#if data.filters.q || data.filters.tag || data.filters.sort !== 'updated_desc'}
				<a class="clear-search" href={resolve('/notes')}>条件をクリア</a>
			{/if}
		</form>

		{#if data.tags.length > 0}
			<nav class="tag-filters" aria-label="タグで絞り込む">
				<form method="GET" action={resolve('/notes')}>
					{#if data.filters.q}<input type="hidden" name="q" value={data.filters.q} />{/if}
					{#if data.filters.sort !== 'updated_desc'}<input
							type="hidden"
							name="sort"
							value={data.filters.sort}
						/>{/if}
					<button type="submit" aria-current={!data.filters.tag ? 'page' : undefined}>すべて</button
					>
				</form>
				{#each data.tags as tag (tag.id)}
					<form method="GET" action={resolve('/notes')}>
						{#if data.filters.q}<input type="hidden" name="q" value={data.filters.q} />{/if}
						{#if data.filters.sort !== 'updated_desc'}<input
								type="hidden"
								name="sort"
								value={data.filters.sort}
							/>{/if}
						<input type="hidden" name="tag" value={tag.normalizedName} />
						<button
							type="submit"
							aria-current={data.filters.tag === tag.normalizedName ? 'page' : undefined}
						>
							#{tag.name} <span>{tag.noteCount}</span>
						</button>
					</form>
				{/each}
			</nav>
		{/if}
	</section>

	<div class="result-summary" aria-live="polite">
		<strong>{data.pagination.total}</strong> 件のメモ
		{#if data.filters.q}<span>「{data.filters.q}」を検索</span>{/if}
	</div>

	{#if data.notes.length === 0}
		<section class="empty-state">
			{#if data.filters.q || data.filters.tag}
				<p>条件に一致するメモがありません。</p>
				<a href={resolve('/notes')}>検索条件をクリアする →</a>
			{:else}
				<p>まだメモがありません。</p>
				<a href={resolve('/notes/new')}>最初のメモを作成する →</a>
			{/if}
		</section>
	{:else}
		<section class="notes-grid" aria-label="メモ一覧">
			{#each data.notes as note (note.id)}
				<article class="note-card">
					<div class="note-card-meta">
						<span>NOTE</span>
						<time datetime={note.updatedAt.toISOString()}>
							{dateFormatter.format(note.updatedAt)}
						</time>
					</div>
					<h2>{note.title}</h2>
					{#if note.tags.length > 0}
						<div class="note-tags" aria-label="タグ">
							{#each note.tags as tag (tag.id)}<span>#{tag.name}</span>{/each}
						</div>
					{/if}
					<p>{note.body || '本文はありません。'}</p>
					<a href={resolve('/(app)/notes/[noteId]', { noteId: note.id })}>
						メモを読む <span aria-hidden="true">→</span>
					</a>
				</article>
			{/each}
		</section>
	{/if}

	{#if data.pagination.totalPages > 1}
		<nav class="pagination" aria-label="ページネーション">
			{#if data.pagination.page > 1}
				<form method="GET" action={resolve('/notes')}>
					<input type="hidden" name="q" value={data.filters.q} />
					<input type="hidden" name="tag" value={data.filters.tag} />
					<input type="hidden" name="sort" value={data.filters.sort} />
					<input type="hidden" name="page" value={data.pagination.page - 1} />
					<button type="submit">← 前へ</button>
				</form>
			{/if}
			<span>{data.pagination.page} / {data.pagination.totalPages} ページ</span>
			{#if data.pagination.page < data.pagination.totalPages}
				<form method="GET" action={resolve('/notes')}>
					<input type="hidden" name="q" value={data.filters.q} />
					<input type="hidden" name="tag" value={data.filters.tag} />
					<input type="hidden" name="sort" value={data.filters.sort} />
					<input type="hidden" name="page" value={data.pagination.page + 1} />
					<button type="submit">次へ →</button>
				</form>
			{/if}
		</nav>
	{/if}
</div>
