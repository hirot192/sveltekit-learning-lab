export type PrimerSection = {
	id: string;
	kicker: string;
	title: string;
	paragraphs: string[];
	points?: string[];
	flow?: { label: string; detail: string }[];
};

export type Primer = {
	title: string;
	summary: string;
	goals: string[];
	sections: PrimerSection[];
};

export const primer: Primer = {
	title: 'SvelteKitを読むための地図',
	summary:
		'個別のAPIを覚える前に、SvelteKitがリクエストをどのように受け取り、サーバーとブラウザへ仕事を分けるのかを整理します。',
	goals: [
		'SvelteとSvelteKitの役割の違いを説明できる',
		'ファイル名から、そのコードが動く場所とタイミングを予測できる',
		'SSR、hydration、クライアント遷移を一つの流れとして捉えられる',
		'この教材でコードを読む順番を理解する'
	],
	sections: [
		{
			id: 'what-is-sveltekit',
			kicker: '01 — FRAMEWORK',
			title: 'SvelteKitは、リクエストを扱うための枠組み',
			paragraphs: [
				'Svelteはコンポーネントから画面を作る仕組みです。SvelteKitはその外側で、URLとページの対応、サーバーでのデータ取得、フォーム送信、エラー処理、ビルドとデプロイを担当します。',
				'そのためSvelteKitのコードを読むときは、画面だけを見るのではなく「このURLを誰が受け取り、どこでデータを作り、どこへ渡したか」を追う必要があります。'
			],
			points: [
				'Svelte: UIとリアクティビティを担当する',
				'SvelteKit: URL、HTTP、サーバー処理、ビルドを担当する',
				'一つの機能が複数のファイルに分かれるのは、実行場所と責務を分けるため'
			]
		},
		{
			id: 'route-files',
			kicker: '02 — ROUTE FILES',
			title: 'ファイル名が、実行場所を教えてくれる',
			paragraphs: [
				'`src/routes`以下のディレクトリがURLを表し、先頭に`+`が付くファイルがSvelteKitの規約です。同じURLのためのコードでも、表示、データ取得、HTTP APIでは担当ファイルが異なります。',
				'特に`.server`を含むファイルはブラウザへ配信されません。DB接続や秘密情報を扱うコードは、このサーバー境界の内側に置きます。'
			],
			points: [
				'`+page.svelte`: ページのUI',
				'`+page.ts`: ページ用データ。サーバーとブラウザの両方で動く可能性がある',
				'`+page.server.ts`: サーバーだけで動くloadとForm Actions',
				'`+layout.svelte`: 子ルートを包む共通UI',
				'`+server.ts`: HTTPメソッドを直接扱うAPI'
			]
		},
		{
			id: 'request-lifecycle',
			kicker: '03 — REQUEST',
			title: '最初に追うのは、データではなくリクエスト',
			paragraphs: [
				'ブラウザがURLを開くと、SvelteKitはルートを照合する前後でhook、load、コンポーネントを順に実行します。ログイン済みか、どのデータを読めるか、何をHTMLへ埋め込むかは、この流れの途中で決まります。',
				'各章では入口から出口へ順番に読みます。途中の関数から読み始めるより、値がどこで信頼され、どこで変化したかを見失いにくくなります。'
			],
			flow: [
				{ label: 'Browser', detail: 'URL、Cookie、フォーム値を含むHTTPリクエストを送る' },
				{ label: 'hooks.server.ts', detail: '共通処理を実行し、セッションからlocalsを作る' },
				{ label: 'route', detail: 'load、Action、API handlerが入力を受け取る' },
				{ label: 'service / repository', detail: 'ユースケースとDB操作を実行する' },
				{ label: 'response', detail: 'HTML、JSON、redirect、errorのいずれかを返す' }
			]
		},
		{
			id: 'rendering',
			kicker: '04 — RENDERING',
			title: 'SSRとhydrationは、別々のアプリではない',
			paragraphs: [
				'初回アクセスでは、サーバーがloadの結果を使ってHTMLを生成します。ブラウザはそのHTMLをすぐ表示し、その後JavaScriptがイベント処理を接続します。この接続がhydrationです。',
				'以後のリンク遷移では、SvelteKitが必要なデータを取得してページを差し替えます。ただし再読込すれば、再びサーバーから始まります。コードを読むときは「初回表示か、ブラウザ内の遷移か」を区別します。'
			],
			points: [
				'SSR: サーバーで最初のHTMLを作る',
				'hydration: 既存HTMLへクライアント側の振る舞いを接続する',
				'client navigation: ページ全体を再読込せず、必要なroute dataとUIを更新する'
			]
		},
		{
			id: 'data-and-mutations',
			kicker: '05 — DATA',
			title: '読み取りと書き込みを分けて考える',
			paragraphs: [
				'ページ表示に必要な読み取りは主に`load`、HTMLフォームからの書き込みは主にForm Actionsが担当します。成功後にredirectすれば、再読込による二重送信も避けやすくなります。',
				'JavaScriptが有効なら`use:enhance`で操作感を改善できますが、HTTPとしての正しさは通常のフォームだけでも成立させます。これがProgressive Enhancementの基本です。'
			],
			points: [
				'GETとloadは、表示に必要な状態を読む',
				'POSTとActionは、入力を検証して状態を変更する',
				'enhanceは基本動作を置き換えず、成功・失敗時の画面更新を改善する'
			]
		},
		{
			id: 'reading-method',
			kicker: '06 — HOW TO READ',
			title: 'この教材では、毎章同じ順番で読む',
			paragraphs: [
				'概念を暗記してからコードへ進むのではなく、最小限の地図を持って動作を観察し、その直後に担当コードを読みます。最後に一部を変更し、予測と結果を比較します。',
				'分からない構文があっても、最初は処理の入口、値の受け渡し、レスポンスの出口を優先します。構文の詳細は、処理全体の中で役割が見えてから調べます。'
			],
			points: [
				'1. 新しい概念の概要を読む',
				'2. 完成したアプリを操作する',
				'3. リクエストの処理順を追う',
				'4. 関連ファイルを入口から読む',
				'5. 小さく壊して、予測を検証する'
			]
		}
	]
};
