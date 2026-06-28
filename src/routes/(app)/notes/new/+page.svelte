<script lang="ts">
	import { resolve } from '$app/paths';
	import NoteForm from '$lib/components/NoteForm.svelte';

	let { form } = $props();
</script>

<svelte:head><title>新しいメモ | SvelteKit Learning Lab</title></svelte:head>

<div class="editor-shell shell">
	<a class="back-link" href={resolve('/notes')}>← メモ一覧</a>
	<header>
		<p class="eyebrow"><span aria-hidden="true"></span> INSERT</p>
		<h1>新しいメモ</h1>
		<p>送信すると <code>+page.server.ts</code> のForm Actionが入力を検証し、DBへ登録します。</p>
	</header>
	<NoteForm
		title={form?.values?.title}
		body={form?.values?.body}
		tags={form?.values?.tags}
		errors={form?.errors}
		submitLabel="メモを作成"
	/>
</div>
