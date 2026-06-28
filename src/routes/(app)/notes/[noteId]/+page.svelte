<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data } = $props();
	let deleting = $state(false);

	const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
		dateStyle: 'long',
		timeStyle: 'short'
	});
</script>

<svelte:head><title>{data.note.title} | SvelteKit Learning Lab</title></svelte:head>

<article class="note-detail shell">
	<div class="detail-toolbar">
		<a class="back-link" href={resolve('/notes')}>← メモ一覧</a>
		<div>
			<a
				class="button secondary"
				href={resolve('/(app)/notes/[noteId]/edit', { noteId: data.note.id })}
			>
				編集する
			</a>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					deleting = true;
					return async ({ update }) => update();
				}}
			>
				<button class="button danger" type="submit" disabled={deleting}>
					{deleting ? '削除中…' : '削除する'}
				</button>
			</form>
		</div>
	</div>

	<header>
		<p class="eyebrow"><span aria-hidden="true"></span> SELECT ... WHERE id</p>
		<h1>{data.note.title}</h1>
		{#if data.note.tags.length > 0}
			<div class="note-tags detail-tags" aria-label="タグ">
				{#each data.note.tags as tag (tag.id)}
					<form method="GET" action={resolve('/notes')}>
						<input type="hidden" name="tag" value={tag.normalizedName} />
						<button type="submit">#{tag.name}</button>
					</form>
				{/each}
			</div>
		{/if}
		<p>
			更新: <time datetime={data.note.updatedAt.toISOString()}
				>{dateFormatter.format(data.note.updatedAt)}</time
			>
		</p>
	</header>
	<div class="note-body">{data.note.body || '本文はありません。'}</div>
</article>
