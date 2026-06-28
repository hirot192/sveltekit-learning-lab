<script lang="ts">
	import { resolve } from '$app/paths';
	import NoteForm from '$lib/components/NoteForm.svelte';

	let { data, form } = $props();
</script>

<svelte:head><title>{data.note.title}を編集 | SvelteKit Learning Lab</title></svelte:head>

<div class="editor-shell shell">
	<a class="back-link" href={resolve('/(app)/notes/[noteId]', { noteId: data.note.id })}
		>← メモ詳細</a
	>
	<header>
		<p class="eyebrow"><span aria-hidden="true"></span> UPDATE</p>
		<h1>メモを編集</h1>
		<p>更新クエリにはメモIDだけでなく、現在のデモユーザーIDも条件として含めます。</p>
	</header>
	<NoteForm
		title={form?.values?.title ?? data.note.title}
		body={form?.values?.body ?? data.note.body}
		tags={form?.values?.tags ?? data.note.tags.map((tag) => tag.name)}
		errors={form?.errors}
		submitLabel="変更を保存"
	/>
</div>
