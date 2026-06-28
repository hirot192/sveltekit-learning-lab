<script lang="ts">
	type Result = {
		transport: string;
		invocationId: string;
		executedAt: string;
		durationMs: number;
		q: string;
		total: number;
		notes: { id: string; title: string; body: string; tags: string[]; updatedAt: string }[];
	};

	let { title, subtitle, result }: { title: string; subtitle: string; result: Result } = $props();

	const timeFormatter = new Intl.DateTimeFormat('ja-JP', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		fractionalSecondDigits: 3
	});
</script>

<article class="transport-result">
	<header>
		<div>
			<p>{result.transport}</p>
			<h2>{title}</h2>
		</div>
		<span>{result.total} results</span>
	</header>
	<p class="transport-subtitle">{subtitle}</p>
	<dl>
		<div>
			<dt>検索語</dt>
			<dd><code>{result.q || '(all)'}</code></dd>
		</div>
		<div>
			<dt>実行ID</dt>
			<dd><code>{result.invocationId.slice(0, 8)}</code></dd>
		</div>
		<div>
			<dt>サーバー実行</dt>
			<dd>{timeFormatter.format(new Date(result.executedAt))}</dd>
		</div>
		<div>
			<dt>DB処理</dt>
			<dd>{result.durationMs} ms</dd>
		</div>
	</dl>

	{#if result.notes.length === 0}
		<p class="transport-empty">一致するメモはありません。</p>
	{:else}
		<ul>
			{#each result.notes as note (note.id)}
				<li>
					<strong>{note.title}</strong>
					{#if note.tags.length > 0}<small>{note.tags.map((tag) => `#${tag}`).join(' ')}</small
						>{/if}
				</li>
			{/each}
		</ul>
	{/if}
</article>
