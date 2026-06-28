<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';
	import '../app.css';

	let { data, children } = $props();

	const navigation = [
		{ href: resolve('/'), label: 'ホーム' },
		{ href: resolve('/learn'), label: '教材を読む' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="動くアプリとソースコードを往復して学ぶ SvelteKit 教材" />
</svelte:head>

<a class="skip-link" href="#main-content">本文へ移動</a>

<header class="site-header">
	<div class="shell header-inner">
		<a class="brand" href={resolve('/')} aria-label="SvelteKit Learning Lab ホーム">
			<span class="brand-mark" aria-hidden="true">S</span>
			<span>
				<strong>Learning Lab</strong>
				<small>SvelteKitを分解する</small>
			</span>
		</a>

		<nav aria-label="メインナビゲーション">
			{#each navigation as item (item.href)}
				<a href={item.href} aria-current={page.url.pathname === item.href ? 'page' : undefined}>
					{item.label}
				</a>
			{/each}
			{#if data.user}
				<a
					href={resolve('/notes')}
					aria-current={page.url.pathname === '/notes' ? 'page' : undefined}>メモ</a
				>
				<a class="nav-sessions" href={resolve('/settings/sessions')}>セッション</a>
				<a class="nav-compare" href={resolve('/compare')}>比較</a>
				<form method="POST" action={resolve('/logout')}>
					<button type="submit">ログアウト</button>
				</form>
			{:else}
				<a
					href={resolve('/login')}
					aria-current={page.url.pathname === '/login' ? 'page' : undefined}>ログイン</a
				>
				<a class="nav-register" href={resolve('/register')}>登録</a>
			{/if}
		</nav>
	</div>
</header>

<main id="main-content">
	{@render children()}
</main>

<footer class="site-footer">
	<div class="shell footer-inner">
		<p>SvelteKit Learning Lab</p>
		<p>画面 → サーバー → DB の流れを、コードでたどる。</p>
	</div>
</footer>
