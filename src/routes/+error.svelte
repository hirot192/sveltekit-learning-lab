<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const isNotFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{page.status} | SvelteKit Learning Lab</title>
	<meta
		name="description"
		content={isNotFound
			? '指定されたページは見つかりませんでした。'
			: 'ページを表示できませんでした。'}
	/>
</svelte:head>

<div class="error-shell shell">
	<p class="section-label">ERROR {page.status}</p>
	<h1>{isNotFound ? 'ページが見つかりません' : 'ページを表示できませんでした'}</h1>
	<p>
		{isNotFound
			? 'URLが正しいか確認するか、学習マップから章を選び直してください。'
			: '時間をおいて再読み込みしてください。問題が続く場合はサーバーログを確認します。'}
	</p>
	<div class="error-actions">
		<a class="button primary" href={resolve('/')}>学習マップへ戻る</a>
		<a class="button secondary" href={resolve('/learn/[chapter]', { chapter: 'routing' })}
			>エラー処理の章を見る</a
		>
	</div>
</div>
