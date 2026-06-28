<script lang="ts">
	import ComparisonResult from '$lib/components/ComparisonResult.svelte';
	import { searchNotesRemote } from './search.remote';

	let { request }: { request: { q: string } } = $props();

	const remoteQuery = $derived(searchNotesRemote(request));
	const remoteResult = $derived(await remoteQuery);

	export function refresh() {
		return remoteQuery.refresh();
	}
</script>

<ComparisonResult
	title="Remote query"
	subtitle="生成された型安全なfetchを使い、同じ引数をキャッシュします。refreshで明示的に再取得できます。"
	result={remoteResult}
/>
