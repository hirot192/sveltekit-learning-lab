<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		title = '',
		body = '',
		tags = [],
		errors = {},
		submitLabel
	}: {
		title?: string;
		body?: string;
		tags?: string[];
		errors?: { title?: string[]; body?: string[]; tags?: string[] };
		submitLabel: string;
	} = $props();

	let submitting = $state(false);
</script>

<form
	method="POST"
	class="note-form"
	use:enhance={() => {
		submitting = true;

		return async ({ update }) => {
			await update();
			submitting = false;
		};
	}}
>
	<label for="title">タイトル</label>
	<input
		id="title"
		name="title"
		value={title}
		maxlength="160"
		required
		aria-invalid={errors.title ? 'true' : undefined}
		aria-describedby={errors.title ? 'title-error' : undefined}
	/>
	{#if errors.title}
		<p class="field-error" id="title-error">{errors.title[0]}</p>
	{/if}

	<label for="body">本文</label>
	<textarea
		id="body"
		name="body"
		rows="14"
		maxlength="20000"
		aria-invalid={errors.body ? 'true' : undefined}
		aria-describedby={errors.body ? 'body-error' : undefined}>{body}</textarea
	>
	{#if errors.body}
		<p class="field-error" id="body-error">{errors.body[0]}</p>
	{/if}

	<label for="tags">タグ</label>
	<input
		id="tags"
		name="tags"
		value={tags.join(', ')}
		placeholder="SvelteKit, PostgreSQL, 認可"
		aria-invalid={errors.tags ? 'true' : undefined}
		aria-describedby={errors.tags ? 'tags-error' : 'tags-help'}
	/>
	<p class="field-help" id="tags-help">
		カンマ区切り、5個まで。大文字・小文字は同じタグとして扱います。
	</p>
	{#if errors.tags}
		<p class="field-error" id="tags-error">{errors.tags[0]}</p>
	{/if}

	<div class="form-actions">
		<button class="button primary" type="submit" disabled={submitting}>
			{submitting ? '保存中…' : submitLabel}
		</button>
	</div>
</form>
