<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data, form } = $props();
	let submitting = $state(false);
</script>

<svelte:head><title>ログイン | SvelteKit Learning Lab</title></svelte:head>

<div class="auth-shell shell">
	<section class="auth-intro">
		<p class="eyebrow"><span aria-hidden="true"></span> Welcome back</p>
		<h1>セッションを再開する。</h1>
		<p>認証後にランダムなセッショントークンを発行し、各リクエストのhookでユーザーを復元します。</p>
	</section>

	<form
		method="POST"
		class="auth-form"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
			};
		}}
	>
		<h2>ログイン</h2>
		<input type="hidden" name="returnTo" value={form?.values?.returnTo ?? data.returnTo} />
		{#if form?.message}<p class="form-message" role="alert">{form.message}</p>{/if}

		<label for="email">メールアドレス</label>
		<input
			id="email"
			name="email"
			type="email"
			value={form?.values?.email ?? ''}
			autocomplete="email"
			required
		/>

		<label for="password">パスワード</label>
		<input
			id="password"
			name="password"
			type="password"
			maxlength="128"
			autocomplete="current-password"
			required
		/>

		<button class="button primary" type="submit" disabled={submitting}>
			{submitting ? '確認中…' : 'ログイン'}
		</button>
		<p class="auth-switch">初めてですか？ <a href={resolve('/register')}>アカウント登録</a></p>
	</form>
</div>
