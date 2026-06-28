<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { form } = $props();
	let submitting = $state(false);
</script>

<svelte:head><title>アカウント登録 | SvelteKit Learning Lab</title></svelte:head>

<div class="auth-shell shell">
	<section class="auth-intro">
		<p class="eyebrow"><span aria-hidden="true"></span> M3 — Authentication</p>
		<h1>学習用アカウントを作る。</h1>
		<p>パスワードはArgon2idでハッシュ化し、登録と同時にDBセッションを発行します。</p>
		<ul>
			<li>パスワードの平文は保存しません</li>
			<li>Cookieには意味のないランダム値だけを保存します</li>
			<li>メール送信はMVPの対象外です</li>
		</ul>
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
		<h2>アカウント登録</h2>
		{#if form?.message}<p class="form-message" role="alert">{form.message}</p>{/if}

		<label for="displayName">表示名</label>
		<input
			id="displayName"
			name="displayName"
			value={form?.values?.displayName ?? ''}
			autocomplete="name"
			aria-invalid={form?.errors?.displayName ? 'true' : undefined}
			aria-describedby={form?.errors?.displayName ? 'display-name-error' : undefined}
			required
		/>
		{#if form?.errors?.displayName}<p class="field-error" id="display-name-error">
				{form.errors.displayName[0]}
			</p>{/if}

		<label for="email">メールアドレス</label>
		<input
			id="email"
			name="email"
			type="email"
			value={form?.values?.email ?? ''}
			autocomplete="email"
			aria-invalid={form?.errors?.email ? 'true' : undefined}
			aria-describedby={form?.errors?.email ? 'email-error' : undefined}
			required
		/>
		{#if form?.errors?.email}<p class="field-error" id="email-error">{form.errors.email[0]}</p>{/if}

		<label for="password">パスワード</label>
		<input
			id="password"
			name="password"
			type="password"
			minlength="15"
			maxlength="128"
			autocomplete="new-password"
			aria-invalid={form?.errors?.password ? 'true' : undefined}
			aria-describedby={form?.errors?.password ? 'password-error' : 'password-help'}
			required
		/>
		<small id="password-help">15文字以上。長いパスフレーズを推奨します。</small>
		{#if form?.errors?.password}<p class="field-error" id="password-error">
				{form.errors.password[0]}
			</p>{/if}

		<button class="button primary" type="submit" disabled={submitting}>
			{submitting ? '作成中…' : '登録して始める'}
		</button>
		<p class="auth-switch">登録済みですか？ <a href={resolve('/login')}>ログイン</a></p>
	</form>
</div>
