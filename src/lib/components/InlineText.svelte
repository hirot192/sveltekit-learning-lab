<script lang="ts">
	let { text }: { text: string } = $props();
	const parts = $derived(text.split(/(`[^`]+`)/g).filter(Boolean));
</script>

{#each parts as part, index (`${index}:${part}`)}
	{#if part.startsWith('`') && part.endsWith('`')}
		<code class="inline-code">{part.slice(1, -1)}</code>
	{:else}{part}{/if}
{/each}
