<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';
	import ComparisonResult from '$lib/components/ComparisonResult.svelte';
	import type { ComparisonSearchResult } from '$lib/server/services/comparison';
	import RemoteComparisonResult from './RemoteComparisonResult.svelte';

	let { data } = $props();
	let input = $state(untrack(() => data.q));
	let remoteRequest = $state({ q: untrack(() => data.q) });
	let apiResult = $state<ComparisonSearchResult | null>(null);
	let apiLoading = $state(false);
	let apiError = $state('');
	let remoteComparison = $state<RemoteComparisonResult>();

	function runRemote() {
		const q = input.trim();
		if (q === remoteRequest.q) {
			void remoteComparison?.refresh();
		} else {
			remoteRequest = { q };
		}
	}

	async function runApi() {
		apiLoading = true;
		apiError = '';
		try {
			const response = await fetch(
				`${resolve('/api/search')}?q=${encodeURIComponent(input.trim())}`
			);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			apiResult = await response.json();
		} catch (error) {
			apiError = error instanceof Error ? error.message : 'API request failed';
		} finally {
			apiLoading = false;
		}
	}
</script>

<svelte:head>
	<title>処理方式を比較 | SvelteKit Learning Lab</title>
	<meta
		name="description"
		content="server load、Remote Functions、HTTP APIで同じ検索を比較する教材"
	/>
</svelte:head>

<div class="compare-shell shell">
	<header class="compare-heading">
		<div>
			<p class="eyebrow"><span aria-hidden="true"></span> M6 — Three transports</p>
			<h1>同じ検索、<br />違う経路。</h1>
			<p>結果は同じでも、呼び出し方、型、キャッシュ、JavaScriptなしでの動作が異なります。</p>
		</div>
		<a class="button secondary" href={resolve('/learn/[chapter]', { chapter: 'transports' })}
			>比較の章を読む →</a
		>
	</header>

	<section class="transport-controls" aria-labelledby="transport-search-heading">
		<div>
			<p class="section-label">SAME USE CASE</p>
			<h2 id="transport-search-heading">メモを3方式で検索</h2>
		</div>
		<form method="GET" action={resolve('/compare')}>
			<label for="compare-q">検索語</label>
			<input id="compare-q" name="q" maxlength="100" bind:value={input} placeholder="メモを検索" />
			<div>
				<button class="button primary" type="submit">server load</button>
				<button class="button secondary" type="button" onclick={runRemote}>Remote query</button>
				<button class="button secondary" type="button" onclick={runApi} disabled={apiLoading}>
					{apiLoading ? 'fetch中…' : 'HTTP API'}
				</button>
			</div>
		</form>
	</section>

	<section class="observation-strip" aria-label="現在の観察値">
		<div><span>現在のURL</span><code>{page.url.pathname}{page.url.search}</code></div>
		<div><span>Remote引数</span><code>{JSON.stringify(remoteRequest)}</code></div>
		<div>
			<span>API状態</span><code>{apiLoading ? 'loading' : apiResult ? 'loaded' : 'idle'}</code>
		</div>
	</section>

	<section class="transport-grid" aria-label="検索結果の比較">
		<ComparisonResult
			title="server load"
			subtitle="GETフォームでURLが変わり、ページのloadが再実行されます。JavaScriptなしでも動作します。"
			result={data.serverResult}
		/>
		<svelte:boundary>
			<RemoteComparisonResult bind:this={remoteComparison} request={remoteRequest} />

			{#snippet pending()}
				<div class="transport-placeholder" role="status" aria-live="polite">
					<p>remote-query</p>
					<h2>Remote queryを実行中</h2>
					<span>サーバーで検索し、型付きの結果を待っています。</span>
				</div>
			{/snippet}

			{#snippet failed(error, reset)}
				<div
					class="transport-placeholder transport-failed"
					data-error-type={error instanceof Error ? 'runtime' : 'unknown'}
					role="alert"
				>
					<p>remote-query</p>
					<h2>結果を取得できませんでした</h2>
					<span>一時的な失敗です。入力を保ったまま、この部分だけ再実行できます。</span>
					<button class="button secondary" type="button" onclick={reset}>もう一度試す</button>
				</div>
			{/snippet}
		</svelte:boundary>
		<div class="api-result-slot">
			{#if apiError}
				<p class="transport-error">{apiError}</p>
			{:else if apiResult}
				<ComparisonResult
					title="HTTP API"
					subtitle="URLとJSON契約を自分で管理します。Svelte以外のクライアントからも利用できます。"
					result={apiResult}
				/>
			{:else}
				<div class="transport-placeholder">
					<p>http-api</p>
					<h2>HTTP API</h2>
					<span>ボタンを押すとブラウザのfetchから実行します。</span>
				</div>
			{/if}
		</div>
	</section>

	<section class="refresh-lab">
		<div>
			<p class="section-label">INVALIDATION LAB</p>
			<h2>同じ引数を再取得する</h2>
			<p>Remote queryの実行IDと時刻を覚えてからrefreshし、値が変わることを観察します。</p>
		</div>
		<button class="button primary" type="button" onclick={() => remoteComparison?.refresh()}>
			Remote query.refresh()
		</button>
	</section>
</div>
