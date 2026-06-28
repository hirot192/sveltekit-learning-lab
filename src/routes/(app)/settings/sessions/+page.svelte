<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';

	let { data } = $props();

	const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
</script>

<svelte:head><title>セッション管理 | SvelteKit Learning Lab</title></svelte:head>

<div class="sessions-shell shell">
	<header class="settings-heading">
		<div>
			<p class="eyebrow"><span aria-hidden="true"></span> Session repository</p>
			<h1>ログイン中の端末</h1>
			<p>DBレコードを削除すると、対象のトークンは次のリクエストから利用できなくなります。</p>
		</div>
		<form method="POST" action="?/revokeAll" use:enhance>
			<button class="button danger" type="submit">すべてログアウト</button>
		</form>
	</header>

	<div class="session-list">
		{#each data.sessions as session (session.id)}
			<article class="session-card">
				<div>
					<h2>
						{session.id === data.currentSessionId ? 'この端末' : '別のセッション'}
						{#if session.id === data.currentSessionId}<span>現在</span>{/if}
					</h2>
					<p class="user-agent">{session.userAgent ?? 'User-Agent情報なし'}</p>
					<dl>
						<div>
							<dt>作成</dt>
							<dd>{dateFormatter.format(session.createdAt)}</dd>
						</div>
						<div>
							<dt>最終確認</dt>
							<dd>{dateFormatter.format(session.lastSeenAt)}</dd>
						</div>
						<div>
							<dt>有効期限</dt>
							<dd>{dateFormatter.format(session.expiresAt)}</dd>
						</div>
					</dl>
				</div>
				<form method="POST" action="?/revoke" use:enhance>
					<input type="hidden" name="sessionId" value={session.id} />
					<button class="button secondary" type="submit">
						{session.id === data.currentSessionId ? 'この端末をログアウト' : '失効させる'}
					</button>
				</form>
			</article>
		{/each}
	</div>

	<a class="back-link" href={resolve('/notes')}>← メモへ戻る</a>
</div>
