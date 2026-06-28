export type ChapterReading = {
	bridge: string;
	tryFirst: {
		title: string;
		steps: string[];
		observe: string;
	};
	concepts: {
		title: string;
		body: string;
		takeaway: string;
	}[];
	misconception: {
		claim: string;
		correction: string;
	};
	checkpoints: {
		question: string;
		answer: string;
	}[];
};

export const chapterReadings: Record<string, ChapterReading> = {
	routing: {
		bridge: '基礎編で見たroute規約と描画の流れを、この教材ページ自身を使って具体的に確認します。',
		tryFirst: {
			title: 'URLと画面を見比べる',
			steps: [
				'現在のURLにある /learn/routing を確認する',
				'学習マップへ戻り、同じ章をもう一度開く',
				'ブラウザを再読込し、見た目が同じでも開始地点が異なることを意識する'
			],
			observe: 'URLの章名が変わっても、共通レイアウトと一つの動的routeがページを組み立てる。'
		},
		concepts: [
			{
				title: 'ファイルベースルーティング',
				body: 'ディレクトリ構造をURLへ対応させる方式です。`[chapter]`は一つの固定名ではなく、URLの一部分をparamsとして受け取ります。',
				takeaway: 'URLを見たら、まず`src/routes`以下で対応するディレクトリを探す。'
			},
			{
				title: 'layoutとpage',
				body: 'pageはそのURL固有の内容を、layoutは複数ページで共有する外枠を担当します。子ページは親layoutの中へ描画されます。',
				takeaway: '画面に見える要素が、すべて同じSvelteファイルにあるとは限らない。'
			}
		],
		misconception: {
			claim: 'ページを移動するたびに、ブラウザは新しいHTML文書を丸ごと取得する。',
			correction:
				'SvelteKitのリンク遷移ではクライアント側で必要なデータとUIを更新できる。再読込時はSSRから始まる。'
		},
		checkpoints: [
			{
				question: '`/learn/routing`の`routing`は、どこで取得できますか？',
				answer: '`src/routes/learn/[chapter]/+page.ts`の`params.chapter`で取得できます。'
			},
			{
				question: 'ヘッダーを全ページで変更したい場合、最初にどのファイルを探しますか？',
				answer: '共通外枠を担当する`src/routes/+layout.svelte`を探します。'
			}
		]
	},
	'loading-data': {
		bridge: 'routeが決まった後、画面に必要なデータをサーバーで準備する段階へ進みます。',
		tryFirst: {
			title: 'メモ一覧のデータを観察する',
			steps: [
				'ログインしてメモ一覧を開く',
				'メモを一件作成する',
				'一覧を再読込して作成内容が残ることを確認する'
			],
			observe: 'ページコンポーネントはDBへ直接接続せず、server loadから受け取った値を表示する。'
		},
		concepts: [
			{
				title: 'server load',
				body: '`+page.server.ts`のloadはサーバーだけで実行されます。Cookie、DB、秘密情報へ触れる読み取り処理の入口になります。',
				takeaway: 'DBを読むページでは、まず`+page.server.ts`から呼び出し先を追う。'
			},
			{
				title: '直列化できるデータ',
				body: 'loadの戻り値はSvelteKitを通ってページへ渡ります。クラスやDB接続ではなく、画面に必要なデータを返します。',
				takeaway: 'loadはサーバー内部のオブジェクトをそのまま公開する境界ではない。'
			}
		],
		misconception: {
			claim: '`+page.svelte`からrepositoryをimportすれば、コードが短くなる。',
			correction: 'ブラウザへ配信される可能性があるUIからDB境界を分離し、server loadを経由する。'
		},
		checkpoints: [
			{
				question: 'DB接続コードを`.server`境界へ置く理由は何ですか？',
				answer: '秘密情報とサーバー専用依存をブラウザbundleへ入れないためです。'
			},
			{
				question: '一覧の並び順を決める責務はどこにありますか？',
				answer: 'この教材ではSQLを組み立てるrepositoryにあります。'
			}
		]
	},
	'form-actions': {
		bridge: 'データを読む経路に続いて、ブラウザの入力を検証し、DBへ書き込む経路を扱います。',
		tryFirst: {
			title: '通常のHTMLフォームとして使う',
			steps: [
				'新規メモ画面を開く',
				'タイトルを空のまま送信してエラーを見る',
				'有効な内容を入力して作成する'
			],
			observe: '同じフォームが入力エラーを表示し、成功時だけ詳細ページへredirectする。'
		},
		concepts: [
			{
				title: 'Form Actions',
				body: '`+page.server.ts`でPOSTを受け取るSvelteKitの仕組みです。FormDataの読取、検証、保存、失敗またはredirectを一つのHTTP経路として表現します。',
				takeaway: 'Actionはボタンクリックではなく、HTTP POSTを処理するサーバーコード。'
			},
			{
				title: 'Progressive Enhancement',
				body: '通常フォームを基本にし、JavaScriptが使える場合だけ送信後の更新を滑らかにします。サーバー側の検証や認可は省略しません。',
				takeaway: '`use:enhance`は正しさではなく操作体験を追加する。'
			}
		],
		misconception: {
			claim: '`required`を付けたので、サーバー側validationは不要である。',
			correction:
				'HTTPリクエストはブラウザUIを経由せず送れるため、信頼境界であるサーバーでも必ず検証する。'
		},
		checkpoints: [
			{
				question: '`fail(400)`と`redirect(303)`はどう使い分けますか？',
				answer: '入力を修正してほしい場合はfail、保存成功後にGETへ移す場合はredirectを使います。'
			},
			{
				question: '入力値をエラーと一緒に返す理由は何ですか？',
				answer: '利用者が入力を最初からやり直さず、問題箇所だけ修正できるためです。'
			}
		]
	},
	database: {
		bridge: 'Actionから呼ばれた保存処理が、PostgreSQL上の永続データになるまでを分解します。',
		tryFirst: {
			title: '再起動を越えて残る状態を見る',
			steps: [
				'メモを一件作成する',
				'開発サーバーを再起動する',
				'同じアカウントでメモが残っていることを確認する'
			],
			observe: '画面やNode processではなく、PostgreSQLが状態を保持している。'
		},
		concepts: [
			{
				title: 'schemaとmigration',
				body: 'schemaは望ましい現在形、migrationは既存DBをその形へ移す変更履歴です。宣言を変えるだけでは、すでに動くDBは更新されません。',
				takeaway: '生成されたSQLを読み、意図した変更か確認してから適用する。'
			},
			{
				title: '制約とtransaction',
				body: '型検査だけでなく、外部キーや一意制約をDBにも置きます。複数の更新を一単位にしたい場合はtransactionで全成功または全失敗にします。',
				takeaway: 'DBは保存場所であると同時に、データ整合性を守る最後の境界。'
			}
		],
		misconception: {
			claim: 'TypeScriptの型が正しければ、DBに不正な値は入らない。',
			correction: '別processや古いコードもDBへ書けるため、永続層にも制約が必要になる。'
		},
		checkpoints: [
			{
				question: 'schema変更とmigrationファイルは何が違いますか？',
				answer: 'schemaは目標状態、migrationは既存状態から目標へ移す順序付きSQLです。'
			},
			{
				question: 'seedを冪等にする利点は何ですか？',
				answer: '同じ環境で繰り返しても重複や失敗を起こさず、学習状態を再現しやすくなります。'
			}
		]
	},
	sessions: {
		bridge: 'DBへ保存できるようになった状態を使い、複数リクエストをまたぐログイン状態を作ります。',
		tryFirst: {
			title: 'ログイン状態が復元されることを見る',
			steps: [
				'アカウントを登録してログインする',
				'メモとセッション管理を行き来する',
				'ページを再読込してもログイン状態が続くことを確認する'
			],
			observe: '各リクエストでCookieが送られ、hookがDB照合から同じユーザーを復元する。'
		},
		concepts: [
			{
				title: '認証とDBセッション',
				body: '認証は資格情報から本人を確認する処理、セッションは確認済みの状態を後続リクエストへ結び付ける仕組みです。',
				takeaway: 'パスワードはログイン時に確認し、毎リクエスト送らない。'
			},
			{
				title: 'Cookie、hook、locals',
				body: 'Cookieの生トークンをhookで読み、ハッシュ化してDBと照合します。結果をlocalsへ置くことで、後続routeは検証済みユーザーを利用できます。',
				takeaway: 'Cookieの存在だけでは認証済みと判断しない。'
			}
		],
		misconception: {
			claim: 'Cookieにuser IDを保存すれば、そのIDをログインユーザーとして信用できる。',
			correction: '利用者が変更できる値は信用せず、推測不能なトークンをサーバー側状態と照合する。'
		},
		checkpoints: [
			{
				question: 'DBに生のセッショントークンを保存しない理由は何ですか？',
				answer: 'DB漏えい時に、その値をそのままCookieとして悪用されるリスクを下げるためです。'
			},
			{
				question: 'セッションを即時失効できるのはなぜですか？',
				answer: '各リクエストでDB行を確認し、削除済みトークンを拒否するためです。'
			}
		]
	},
	authorization: {
		bridge: '誰であるかを確認した後、その人が対象データを操作してよいかを別の境界で判断します。',
		tryFirst: {
			title: '二つのアカウントで境界を試す',
			steps: [
				'別々のブラウザ状態で二つのアカウントを作る',
				'片方でメモを作成してURLをコピーする',
				'もう片方から同じURLを開く'
			],
			observe: 'ログイン済みでも、他人のメモは取得できず、存在もレスポンスから判別できない。'
		},
		concepts: [
			{
				title: 'authenticationとauthorization',
				body: '認証は「誰か」、認可は「その操作を許可するか」に答えます。ログイン済みであることは、すべてのデータへアクセスできることを意味しません。',
				takeaway: '本人確認と対象リソースの権限確認を、別々の問いとして扱う。'
			},
			{
				title: '所有者条件を含むSQL',
				body: '対象IDを検索してから所有者を比較するのではなく、IDとuser IDを同じWHERE句へ含めます。取得、更新、削除の全経路で同じ境界を使います。',
				takeaway: 'UIで隠すのではなく、データを取得する時点で拒否する。'
			}
		],
		misconception: {
			claim: 'UUIDは推測しにくいため、URLを知っている人へアクセスを許可してよい。',
			correction:
				'識別子の推測困難性は認可ではない。漏えいやログから取得されても所有者条件で拒否する。'
		},
		checkpoints: [
			{
				question: '他人所有と不存在を同じ404にする理由は何ですか？',
				answer: '対象が実在するかどうかを権限のない利用者へ漏らしにくくするためです。'
			},
			{
				question: '認可テストに二人のユーザーが必要な理由は何ですか？',
				answer: '未ログイン拒否だけでなく、ログイン済み他人からの水平権限昇格を検証するためです。'
			}
		]
	},
	search: {
		bridge: '所有者境界を維持したまま、URLとSQLへ複数の検索条件を追加します。',
		tryFirst: {
			title: 'URLを検索状態として使う',
			steps: [
				'複数のメモとタグを作る',
				'キーワード、タグ、並び順を指定する',
				'結果のURLを再読込し、戻る・進むを試す'
			],
			observe: '画面の検索状態がURLへ表現され、再読込や履歴操作でも再現される。'
		},
		concepts: [
			{
				title: 'URL state',
				body: '共有・再現したい検索条件はquery parameterへ置きます。server loadはURLを入力として同じ結果を作れます。',
				takeaway: '画面内だけの変数にすると、再読込と共有で状態が失われる。'
			},
			{
				title: '検索SQLとindex',
				body: '所有者、キーワード、タグ条件を組み合わせ、COUNTとページ本体へ同じ条件を使います。indexは実際の実行計画を見て効果を確認します。',
				takeaway: 'indexが存在することと、queryで使われることは同じではない。'
			}
		],
		misconception: {
			claim: '検索条件は多いほど便利なので、すべてクライアント側で絞ればよい。',
			correction:
				'全データを配信すると認可、件数、性能の境界が崩れるため、所有者条件を含めDB側で検索する。'
		},
		checkpoints: [
			{
				question: 'ページ番号もURLへ置く理由は何ですか？',
				answer: '検索結果の位置を再読込・共有・履歴操作で再現するためです。'
			},
			{
				question: 'COUNTと一覧queryでWHEREが違うと何が起きますか？',
				answer: '総件数と実際のページ内容が一致せず、空ページや誤ったページ数が発生します。'
			}
		]
	},
	transports: {
		bridge: '同じ検索ユースケースを、SvelteKitが提供する三つの通信方式から呼び出して比較します。',
		tryFirst: {
			title: '三つの結果を切り替える',
			steps: [
				'比較画面でキーワード検索する',
				'server load、Remote query、HTTP APIの結果を開く',
				'URL、実行ID、再取得操作の違いを見る'
			],
			observe: '入口とクライアント側の扱いは違っても、認可済みserviceへ合流できる。'
		},
		concepts: [
			{
				title: '通信方式は用途で選ぶ',
				body: 'server loadはページ表示、Remote Functionsは同じSvelteKitアプリ内の型付き呼び出し、HTTP APIは外部クライアントにも公開する契約に向きます。',
				takeaway: '新しい方式を一律に採用せず、呼び出し元と公開範囲で選ぶ。'
			},
			{
				title: '共有するのは業務境界',
				body: '三つの入口が同じserviceとrepositoryを使うことで、認可や検索条件を重複させません。HTTP固有処理はroute側に残します。',
				takeaway: 'transportを共有するのではなく、その内側のユースケースを共有する。'
			}
		],
		misconception: {
			claim: 'Remote Functionsを使えば、`+server.ts`やForm Actionsは不要になる。',
			correction: 'HTMLフォーム、アプリ内RPC、外部APIでは必要な互換性と契約が異なる。'
		},
		checkpoints: [
			{
				question: '外部モバイルアプリへ公開するなら、どの方式が適していますか？',
				answer: 'HTTP statusとJSON契約を明示できる`+server.ts` APIが適しています。'
			},
			{
				question: '三方式で認可を重複実装しないために何を共有しますか？',
				answer: '認証済みuser IDを受け取るserviceと、その内側のrepository境界を共有します。'
			}
		]
	},
	deployment: {
		bridge:
			'開発中のSvelteKitアプリを、再現可能なNode processとPostgreSQLとしてLinux上で動かします。',
		tryFirst: {
			title: 'production構成を起動する',
			steps: [
				'production用環境変数を準備する',
				'deploy scriptでDB、migration、appを順に起動する',
				'/healthzとComposeの状態を確認する'
			],
			observe: 'アプリ起動、schema更新、データ永続化、TLSは別々の運用責務として構成される。'
		},
		concepts: [
			{
				title: 'build artifactとruntime',
				body: '`adapter-node`はSvelteKitをNode serverとして実行できるartifactへ変換します。multi-stage buildでbuild環境と実行環境を分けます。',
				takeaway: '開発サーバーではなく、production buildの成果物を起動する。'
			},
			{
				title: '明示的な運用順序',
				body: 'DB起動、migration、アプリ更新、healthcheckを順序づけます。backupとrestoreはデプロイとは別に失敗時の復旧経路として検証します。',
				takeaway: '起動時の暗黙処理を減らし、失敗した段階を特定できるようにする。'
			}
		],
		misconception: {
			claim: 'コンテナ化すれば、環境変数、TLS、backupを考えなくてよい。',
			correction:
				'コンテナはprocessと依存を再現するが、秘密情報、公開経路、永続データの運用は別に設計する。'
		},
		checkpoints: [
			{
				question: 'migrationをアプリ起動と分離する理由は何ですか？',
				answer: '複数instanceの競合を避け、schema変更の成否をデプロイ手順で明示するためです。'
			},
			{
				question: '/healthzがDBも確認する理由は何ですか？',
				answer: 'Node processの生存だけでなく、リクエストを処理できる依存状態も判定するためです。'
			}
		]
	}
};

export function getChapterReading(slug: string): ChapterReading | undefined {
	return chapterReadings[slug];
}
