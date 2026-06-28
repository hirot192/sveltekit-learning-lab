export type ChapterStatus = 'ready' | 'planned';

export type Chapter = {
	slug: string;
	title: string;
	summary: string;
	status: ChapterStatus;
	topics: string[];
	prerequisites: string[];
	goals: string[];
	flow: { label: string; detail: string }[];
	sourceFiles: { path: string; role: string }[];
	experiment: { title: string; steps: string[]; expected: string };
	snippet?: string;
	demo?: 'notes' | 'compare';
};

export const chapters: Chapter[] = [
	{
		slug: 'routing',
		title: 'ルーティングと描画',
		summary: 'URLとファイルの対応、SSRからhydrationまでの最初の流れを追います。',
		status: 'ready',
		topics: ['+page.svelte', 'layout', 'SSR'],
		prerequisites: ['HTMLの基本構造', 'URLとHTTP GETの基礎', 'TypeScriptのオブジェクト'],
		goals: [
			'URLから担当するrouteファイルを特定できる',
			'初回表示とクライアント遷移の違いを説明できる',
			'共通レイアウトが子ページを描画する位置を見つけられる'
		],
		flow: [
			{ label: 'URLを照合', detail: '/learn/routing が src/routes/learn/[chapter] に一致する' },
			{ label: 'データを準備', detail: '+page.ts が chapter パラメーターから教材データを選ぶ' },
			{ label: 'ページを描画', detail: '+page.svelte が受け取った data をHTMLへ変換する' },
			{ label: 'layoutで包む', detail: '親の +layout.svelte がヘッダーとフッターを追加する' }
		],
		sourceFiles: [
			{
				path: 'src/routes/learn/[chapter]/+page.ts',
				role: 'URLパラメーターを読み、章データを選ぶ'
			},
			{ path: 'src/routes/learn/[chapter]/+page.svelte', role: '章データを画面として描画する' },
			{ path: 'src/routes/+layout.svelte', role: 'すべてのページに共通する外枠' },
			{ path: 'src/lib/content/chapters.ts', role: '表示する教材データと型定義' }
		],
		experiment: {
			title: '存在しない章へアクセスする',
			steps: [
				'ブラウザで /learn/not-found を開く',
				'+page.ts の getChapter 呼び出しを確認する',
				'error(404) の行を一時的に別のstatusへ変えてレスポンスを比較する'
			],
			expected: '章データが見つからない場合、SvelteKitのエラーページが404として返る。'
		},
		snippet: `// src/routes/learn/[chapter]/+page.ts\nexport function load({ params }) {\n  const chapter = getChapter(params.chapter);\n\n  if (!chapter) error(404, 'Chapter not found');\n\n  return { chapter };\n}`
	},
	{
		slug: 'loading-data',
		title: 'サーバーからデータを読む',
		summary: 'load関数とserver-onlyなコードの境界を、メモ一覧で確認します。',
		status: 'ready',
		topics: ['load', '+page.server.ts', 'server-only'],
		prerequisites: ['「ルーティングと描画」章', 'async / await', 'SQLのSELECT'],
		goals: [
			'サーバー専用のloadとブラウザでも動くloadを区別できる',
			'routeからrepositoryまでデータ取得の呼び出し順を追える',
			'Dateを含む戻り値がSvelteページへ渡る仕組みを確認できる'
		],
		flow: [
			{ label: 'ページを要求', detail: 'ブラウザが /notes へGETリクエストを送る' },
			{ label: 'server loadを実行', detail: '+page.server.ts が listUserNotes を呼び出す' },
			{ label: 'DB境界へ進む', detail: 'serviceからrepositoryへ、localsのユーザーIDを渡す' },
			{ label: 'SELECTを実行', detail: 'repositoryが所有者条件と更新日時順をSQLへ組み立てる' },
			{ label: '画面へ渡す', detail: 'loadの戻り値がdata.notesとして+page.svelteへ届く' }
		],
		sourceFiles: [
			{ path: 'src/routes/(app)/notes/+page.server.ts', role: 'リクエストを受け、一覧をloadする' },
			{
				path: 'src/lib/server/services/notes.ts',
				role: 'routeから受け取ったユーザーIDをDB境界へ渡す'
			},
			{ path: 'src/lib/server/repositories/notes.ts', role: 'DrizzleでSELECTを組み立てる' },
			{ path: 'src/routes/(app)/notes/+page.svelte', role: 'data.notesをカードとして描画する' }
		],
		experiment: {
			title: '並び順を反転する',
			steps: [
				'メモ一覧を開き、先頭の更新日時を確認する',
				'repositories/notes.ts の desc を asc に変更する',
				'ページを再読込して並び順を比較する'
			],
			expected: 'Svelteコンポーネントを変更しなくても、repositoryのORDER BYだけで表示順が変わる。'
		},
		snippet: `// src/routes/(app)/notes/+page.server.ts\nexport const load = async () => {\n  return { notes: await listDemoNotes() };\n};`,
		demo: 'notes'
	},
	{
		slug: 'form-actions',
		title: 'フォームからデータを書く',
		summary: '入力、検証、DB登録、redirectをForm Actionsでつなぎます。',
		status: 'ready',
		topics: ['Form Actions', 'Zod', 'enhance'],
		prerequisites: ['「サーバーからデータを読む」章', 'HTML formとPOST', 'TypeScriptの型'],
		goals: [
			'HTML formのPOSTを受け取るファイルを特定できる',
			'クライアント側requiredとサーバー側validationの役割を区別できる',
			'failとredirectが画面へ与える違いを説明できる'
		],
		flow: [
			{ label: 'フォームをPOST', detail: 'ブラウザがtitleとbodyをFormDataとして送る' },
			{ label: '値を取り出す', detail: 'Actionがrequest.formData()から入力オブジェクトを作る' },
			{ label: 'サーバーで検証', detail: 'Zodが空文字と文字数を検査し、失敗時はfail(400)を返す' },
			{ label: 'INSERTする', detail: 'serviceとrepositoryを通して、user_id付きで保存する' },
			{ label: '詳細へ移動', detail: '作成したUUIDを使い303 redirectを返す' }
		],
		sourceFiles: [
			{ path: 'src/lib/components/NoteForm.svelte', role: 'JavaScriptなしでも送信できるHTML form' },
			{
				path: 'src/routes/(app)/notes/new/+page.server.ts',
				role: 'validation、fail、作成、redirect'
			},
			{ path: 'src/lib/server/validation/note.ts', role: '入力規則とFormData変換' },
			{ path: 'src/lib/server/repositories/notes.ts', role: 'INSERT ... RETURNINGを実行する' }
		],
		experiment: {
			title: 'ブラウザの検証を越えてみる',
			steps: [
				'NoteForm.svelteのtitleにあるrequiredを一時的に外す',
				'空のタイトルで送信する',
				'サーバーから返ったエラーと入力値の保持を確認する'
			],
			expected: 'ブラウザ側の制約がなくても、サーバー側Zod検証が空タイトルを拒否する。'
		},
		snippet: `const values = noteInputFromFormData(await request.formData());\nconst result = noteInputSchema.safeParse(values);\n\nif (!result.success) {\n  return fail(400, { values, errors });\n}\n\nconst note = await createDemoNote(result.data);\nredirect(303, resolve('/notes/[noteId]', { noteId: note.id }));`,
		demo: 'notes'
	},
	{
		slug: 'database',
		title: 'PostgreSQLと永続化',
		summary: 'schema、migration、SQL、transactionの役割を分解します。',
		status: 'ready',
		topics: ['PostgreSQL', 'Drizzle', 'migration'],
		prerequisites: ['TypeScriptのオブジェクト', 'リレーショナルDBと主キー', 'SQLの基本構文'],
		goals: [
			'TypeScript schemaとDB上のschemaの違いを説明できる',
			'generateとmigrateを使い分けられる',
			'外部キー、index、check制約が生成SQLのどこに現れるか確認できる'
		],
		flow: [
			{ label: 'schemaを宣言', detail: 'schema.tsにusersとnotesの型、制約、indexを書く' },
			{ label: '差分を生成', detail: 'drizzle-kit generateが前回snapshotとの差分をSQLにする' },
			{ label: 'SQLをレビュー', detail: 'drizzle/*.sqlを読み、意図したDDLか確認してcommitする' },
			{ label: 'DBへ適用', detail: 'drizzle-kit migrateが未適用ファイルだけを順番に実行する' },
			{ label: '学習データ投入', detail: 'seed.tsが固定ユーザーと初期メモを冪等に登録する' }
		],
		sourceFiles: [
			{ path: 'src/lib/server/db/schema.ts', role: 'コード上のDB schemaを宣言する' },
			{ path: 'drizzle/0000_sleepy_omega_sentinel.sql', role: 'レビュー可能な実際のDDL' },
			{ path: 'drizzle.config.ts', role: 'dialect、schema、migration出力先を設定する' },
			{ path: 'compose.yml', role: '同じPostgreSQL環境を再現する' },
			{ path: 'scripts/seed.ts', role: '何度実行しても壊れない初期データ投入' }
		],
		experiment: {
			title: 'schemaとmigrationの差分を見る',
			steps: [
				'notesにarchivedAtというnullable timestampを仮追加する',
				'npm run db:generateを実行して新しいSQLを読む',
				'学習後はschemaの変更と生成ファイルを元に戻す'
			],
			expected: '既存テーブルを作り直さず、ALTER TABLEで列を追加するmigrationが生成される。'
		},
		snippet: `export const notes = pgTable('notes', {\n  id: uuid('id').defaultRandom().primaryKey(),\n  userId: uuid('user_id').notNull().references(() => users.id),\n  title: varchar('title', { length: 160 }).notNull(),\n  body: text('body').notNull()\n});`,
		demo: 'notes'
	},
	{
		slug: 'sessions',
		title: 'ログインとDBセッション',
		summary: 'Cookie、hooks、localsを通してログイン状態が復元される流れを追います。',
		status: 'ready',
		topics: ['Cookie', 'hooks.server.ts', 'locals'],
		prerequisites: ['HTTP request / response', 'Cookieの役割', 'DBへの読み書き'],
		goals: [
			'パスワードハッシュとセッショントークンのハッシュ目的を区別できる',
			'Cookieからlocals.userが作られる処理順を追える',
			'DBセッションが即時失効できる理由を説明できる'
		],
		flow: [
			{
				label: '資格情報を確認',
				detail: 'ログインActionがメールアドレスを検索し、Argon2idでパスワードを検証する'
			},
			{ label: '乱数を発行', detail: 'CSPRNGで32バイトの意味を持たないトークンを生成する' },
			{ label: '保存先を分ける', detail: 'Cookieには生トークン、DBにはSHA-256ハッシュを保存する' },
			{
				label: 'hookで復元',
				detail: '各リクエストでCookieをハッシュし、sessionsとusersをJOINする'
			},
			{ label: 'localsへ格納', detail: '有効ならuserとsessionをevent.localsへ格納する' },
			{ label: '失効を強制', detail: 'ログアウトでDB行を削除し、同じCookieを次回から無効にする' }
		],
		sourceFiles: [
			{ path: 'src/hooks.server.ts', role: 'すべての動的リクエストでセッションを復元する' },
			{
				path: 'src/lib/server/auth/password.ts',
				role: 'OWASP最低設定以上のArgon2id hash / verify'
			},
			{ path: 'src/lib/server/auth/session.ts', role: 'トークン生成、Cookie属性、検証、失効' },
			{ path: 'src/lib/server/repositories/sessions.ts', role: 'sessionsとusersのDB操作' },
			{
				path: 'src/routes/(app)/settings/sessions/+page.server.ts',
				role: '端末別・全セッション失効'
			}
		],
		experiment: {
			title: 'DBから現在のセッションを失効する',
			steps: [
				'ログインしてセッション管理画面を開く',
				'「この端末をログアウト」を押してsessionsの行を削除する',
				'同じCookieのまま /notes へアクセスする'
			],
			expected: 'hookのDB照合が失敗し、Cookieが削除されてログイン画面へ移動する。'
		},
		snippet: `export const handle = async ({ event, resolve }) => {\n  const token = event.cookies.get(SESSION_COOKIE_NAME);\n  const auth = token ? await validateSessionToken(token) : null;\n\n  event.locals.user = auth?.user ?? null;\n  event.locals.session = auth?.session ?? null;\n\n  return resolve(event);\n};`,
		demo: 'notes'
	},
	{
		slug: 'authorization',
		title: '認証と認可を分ける',
		summary: '他人のメモを読めないことを、UIではなくDB境界で保証します。',
		status: 'ready',
		topics: ['authorization', 'IDOR', 'defense in depth'],
		prerequisites: ['「ログインとDBセッション」章', 'CRUDとURLパラメーター', 'SQLのWHERE条件'],
		goals: [
			'認証と認可が答える問いの違いを説明できる',
			'推測可能なリソースIDだけでアクセスを許可してはいけない理由を説明できる',
			'読み取り・更新・削除のすべてで所有者条件が必要だと確認できる'
		],
		flow: [
			{ label: '本人を特定', detail: 'hookが検証したlocals.userから、信頼できるuser.idを得る' },
			{
				label: '入力を検証',
				detail: 'URLのnoteIdがUUID形式か確認する。ただし形式の正しさは権限を意味しない'
			},
			{
				label: '所有者で絞る',
				detail: 'repositoryがnote.idとnote.user_idを一つのWHERE句に含める'
			},
			{
				label: '結果だけを見る',
				detail: '該当行がなければ「不存在」と「他人所有」を区別せず同じ404を返す'
			},
			{
				label: '全経路を検査',
				detail: 'ページ、Form Action、JSON APIを2ユーザーのE2Eテストで攻撃する'
			}
		],
		sourceFiles: [
			{
				path: 'src/lib/server/repositories/notes.ts',
				role: 'IDと所有者IDを同じSQL条件へ入れる最重要境界'
			},
			{
				path: 'src/lib/server/http/notes.ts',
				role: '所有者のメモだけを要求し、失敗を一律404にする'
			},
			{
				path: 'src/routes/api/notes/[noteId]/+server.ts',
				role: '同じ認可境界を利用するJSON API'
			},
			{
				path: 'src/lib/server/repositories/notes.integration.spec.ts',
				role: 'DB境界で他人のread / update / deleteを拒否する結合テスト'
			},
			{
				path: 'src/routes/authorization.e2e.ts',
				role: '2つのログイン状態で水平権限昇格を試すE2Eテスト'
			}
		],
		experiment: {
			title: '別アカウントのURLを開く',
			steps: [
				'ブラウザを通常ウィンドウとプライベートウィンドウで開き、別々のアカウントを登録する',
				'一方でメモを作り、URL末尾のUUIDをもう一方の /notes/{UUID} に貼り付ける',
				'詳細と /edit が同じ404になり、元の所有者からはメモが残っていることを確認する'
			],
			expected:
				'UUIDを知っていても他人のメモは取得できず、存在するかどうかもレスポンスから区別できない。'
		},
		snippet: `// IDだけで検索しない
where(and(
  eq(notes.id, noteId),
  eq(notes.userId, authenticatedUserId)
));

// 0件なら「不存在」と「権限なし」を同じ404にする
if (!note) error(404, 'Note not found');`,
		demo: 'notes'
	},
	{
		slug: 'search',
		title: '検索とURL state',
		summary: '検索、タグ、ページネーションをSQLとURLの両側から理解します。',
		status: 'ready',
		topics: ['URLSearchParams', 'many-to-many', 'GIN index'],
		prerequisites: ['メモCRUD', 'URLSearchParams', 'SQLのJOINとORDER BY'],
		goals: [
			'検索条件をURLへ置くと共有・再読込・戻る操作が自然になる理由を説明できる',
			'notes、tags、note_tagsの多対多関係をSQLまで追える',
			'件数取得、LIMIT、OFFSETからページネーションを組み立てられる'
		],
		flow: [
			{
				label: 'URLを読む',
				detail: '+page.server.tsがq、tag、sort、pageをURLSearchParamsから検証する'
			},
			{
				label: '所有者条件を固定',
				detail: 'repositoryが最初にuser_id条件を置き、その内側へ検索条件を追加する'
			},
			{
				label: '本文を検索',
				detail: 'titleとbodyへILIKEを適用し、pg_trgmのGIN indexを利用可能にする'
			},
			{
				label: 'タグを結合',
				detail: 'EXISTS副問い合わせでnote_tagsとtagsを辿り、ユーザーの正規化済みタグ名で絞る'
			},
			{
				label: 'ページを切る',
				detail: 'COUNTで総数を求め、同じWHEREへORDER BY、LIMIT、OFFSETを適用する'
			},
			{
				label: 'URLを保つ',
				detail: '次ページやタグのリンクにも現在のqとsortを引き継ぐ'
			}
		],
		sourceFiles: [
			{
				path: 'src/routes/(app)/notes/+page.server.ts',
				role: 'URLを検証し、検索結果とタグを並列取得する'
			},
			{
				path: 'src/routes/(app)/notes/+page.svelte',
				role: 'GETフォームと状態を保つリンクを描画する'
			},
			{
				path: 'src/lib/server/validation/note.ts',
				role: 'q、tag、sort、pageの既定値と上限を定義する'
			},
			{
				path: 'src/lib/server/repositories/notes.ts',
				role: '検索、EXISTS、COUNT、LIMIT / OFFSETを組み立てる'
			},
			{ path: 'src/lib/server/db/schema.ts', role: 'tagsの一意性、多対多、検索indexを宣言する' },
			{ path: 'drizzle/0003_fearless_madripoor.sql', role: 'pg_trgmとGIN indexをDBへ追加する' }
		],
		experiment: {
			title: 'URLと実行計画を観察する',
			steps: [
				'複数のメモに同じタグを付け、キーワード検索とタグ絞り込みを組み合わせる',
				'結果URLを別タブへ貼り付け、同じ条件が復元されることを確認する',
				'検索SQLの先頭へEXPLAIN (ANALYZE, BUFFERS)を付け、データ件数を増やした場合の計画を比較する'
			],
			expected:
				'画面内の一時状態に頼らずURLだけで検索を再現でき、SQLのコストとindexの役割を確認できる。'
		},
		snippet: `const filters = noteListQueryFromUrl(url);
const conditions = [eq(notes.userId, user.id)];

if (filters.q) conditions.push(titleOrBodyMatches(filters.q));
if (filters.tag) conditions.push(hasOwnedTag(filters.tag));

// COUNTと一覧取得で同じwhereを使う
const where = and(...conditions);`,
		demo: 'notes'
	},
	{
		slug: 'transports',
		title: '3つのサーバー通信を比べる',
		summary: 'server load、Remote Functions、HTTP APIで同じ検索を実行し、境界の違いを観察します。',
		status: 'ready',
		topics: ['Remote Functions', 'HTTP API', 'invalidation'],
		prerequisites: ['server loadとForm Actions', 'async / awaitとfetch', 'JSONとHTTP status'],
		goals: [
			'HTMLフォーム、Remote Functions、HTTP APIの利用場面を区別できる',
			'Remote queryがSSR、型生成、引数単位のcacheをまとめて提供する仕組みを追える',
			'refresh前後の実行IDから、cacheとinvalidationを観察できる'
		],
		flow: [
			{
				label: 'server load',
				detail: 'GETフォームがURLを変更し、+page.server.tsが検索してSSR可能なPageDataを返す'
			},
			{
				label: 'Remote query',
				detail: '.remote.tsのqueryを呼ぶと、コンパイラ生成endpointへ型付きfetchが送られる'
			},
			{
				label: 'HTTP API',
				detail: '+server.tsへ明示的にfetchし、status、URL、JSON型をクライアント側で扱う'
			},
			{
				label: 'serviceへ合流',
				detail: '3経路すべてが同じ認可済みsearch serviceとrepositoryへ到達する'
			},
			{
				label: '再取得を観察',
				detail: 'query.refresh()で同じcache keyを再取得し、実行IDと時刻が変わる'
			}
		],
		sourceFiles: [
			{ path: 'src/routes/(app)/compare/+page.server.ts', role: 'URL入力を読むserver load経路' },
			{ path: 'src/routes/(app)/compare/search.remote.ts', role: 'Zod検証付きRemote query経路' },
			{
				path: 'src/routes/api/search/+server.ts',
				role: '外部クライアントにも明示的なHTTP API経路'
			},
			{
				path: 'src/routes/(app)/compare/+page.svelte',
				role: '3経路を呼び分け、状態と結果を並べる'
			},
			{
				path: 'src/lib/server/services/comparison.ts',
				role: '3経路が共有する認可後のユースケース'
			},
			{ path: 'vite.config.ts', role: 'experimental Remote Functionsとasync compilerを有効化する' },
			{ path: 'docs/transport-comparison.md', role: '選択基準とproduction上の注意を比較する' }
		],
		experiment: {
			title: 'cache keyとrefreshを見る',
			steps: [
				'比較画面を開き、server loadとRemote queryの実行IDを確認する',
				'同じ検索語のままRemote queryボタンを押し、refreshを実行する',
				'HTTP APIボタンを押し、URLが変化しないことと3列の結果が同じことを確認する',
				'ブラウザのJavaScriptを無効にし、server loadだけがそのまま操作できることを確認する'
			],
			expected:
				'Remote queryはrefreshごとに実行IDが変わり、HTTP APIは明示的なfetchが必要で、GETフォームはJavaScriptなしでも動く。'
		},
		snippet: `// 型安全なアプリ内RPC
export const searchNotesRemote = query(schema, async ({ q }) => {
  const { locals } = getRequestEvent();
  return runComparisonSearch(locals.user.id, q, 'remote-query');
});

// 明示的なWeb API
export const GET = async ({ locals, url }) => {
  return json(await runComparisonSearch(locals.user.id, url.searchParams.get('q'), 'http-api'));
};`,
		demo: 'compare'
	},
	{
		slug: 'deployment',
		title: 'Linuxへデプロイする',
		summary: 'Node build、コンテナ、環境変数、DBの永続化を一つずつ確認します。',
		status: 'ready',
		topics: ['adapter-node', 'Docker', 'healthcheck'],
		prerequisites: ['production buildと環境変数', 'Docker imageとcontainer', 'Linuxの基本操作'],
		goals: [
			'multi-stage buildで開発依存を実行imageから除く理由を説明できる',
			'app起動とmigrationを別processとして順序づけられる',
			'TLS、healthcheck、graceful shutdown、backupの責務を追える'
		],
		flow: [
			{
				label: 'imageを組み立てる',
				detail: 'dependencies、build、production dependencies、runnerの各stageを分離する'
			},
			{
				label: 'DBを起動',
				detail: 'PostgreSQLを永続volume付きで起動し、pg_isreadyが成功するまで待つ'
			},
			{
				label: 'migrationを実行',
				detail: 'one-shot containerが未適用SQLを完了してからappを更新する'
			},
			{
				label: 'Nodeを起動',
				detail: '非rootかつread-onlyのcontainerでadapter-nodeのbuildを実行する'
			},
			{
				label: '状態を検査',
				detail: '/healthzがNodeからDBへSELECT 1を実行し、Composeへ状態を返す'
			},
			{
				label: 'TLSで公開',
				detail: 'loopback portをCaddyがreverse proxyし、証明書と圧縮を担当する'
			},
			{
				label: '安全に終了',
				detail: 'SIGTERM後にrequestを待ち、sveltekit:shutdownでDB poolをcloseする'
			}
		],
		sourceFiles: [
			{ path: 'Dockerfile', role: 'build依存と実行imageを分けるmulti-stage build' },
			{
				path: 'compose.production.yml',
				role: 'app、DB、migration、healthcheck、volumeの宣言'
			},
			{ path: 'src/routes/healthz/+server.ts', role: 'DBを含むliveness / readiness境界' },
			{ path: 'src/lib/server/db/client.ts', role: 'sveltekit:shutdownでDB poolを閉じる' },
			{ path: 'scripts/deploy.sh', role: 'build、migration、起動を明示的に順序づける' },
			{ path: 'scripts/backup.sh', role: '同じPostgreSQL versionのpg_dumpを呼ぶ' },
			{ path: 'scripts/restore.sh', role: 'app停止中にcustom format backupを復元する' },
			{ path: 'deploy/Caddyfile.example', role: 'TLS終端とreverse proxyの最小例' },
			{ path: 'docs/deployment.md', role: '初回、更新、rollback、復旧のrunbook' }
		],
		experiment: {
			title: 'containerを停止・復旧する',
			steps: [
				'production Composeを起動し、/healthzが200を返すことを確認する',
				'docker compose stop dbでDBを止め、appのhealthがunhealthyへ変わることを観察する',
				'dbを再起動し、healthがhealthyへ戻ることを確認する',
				'backupを作成してメモを変更し、restore後に元の内容へ戻ることを確認する'
			],
			expected:
				'app processが動いていてもDB障害時は503になり、DB復旧後は再び200になる。backupからデータも復元できる。'
		},
		snippet: `# deployは暗黙にmigrationしない
docker compose up -d db
docker compose run --rm migrate
docker compose up -d --wait app

# adapter-nodeがHTTPを閉じた後にDB poolを閉じる
process.once('sveltekit:shutdown', async () => {
  await pool.end();
});`
	}
];

export function getChapter(slug: string): Chapter | undefined {
	return chapters.find((chapter) => chapter.slug === slug);
}
