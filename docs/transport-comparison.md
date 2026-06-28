# サーバー通信方式の選択

この教材では、同じアプリ内でも用途に応じて境界を選ぶ。どれか一方式へ統一すること自体を目的にしない。

| 方式                      | 向いている用途                          | 型と契約                              | JavaScriptなし                  | cache / 再取得                              |
| ------------------------- | --------------------------------------- | ------------------------------------- | ------------------------------- | ------------------------------------------- |
| HTML form + server load   | URLで共有する検索、基本的なページ遷移   | PageDataとURL parameter               | 対応                            | URL navigationでloadを再実行                |
| Form Action               | 作成・更新・削除などHTML formの書き込み | ActionDataとFormData                  | 対応                            | redirectまたはenhance後にloadを再実行       |
| Remote `query`            | SvelteKitアプリ内の型安全な読み取り     | 引数・戻り値をend-to-endで推論        | 非対応                          | 引数をcache keyにdedupeし、`refresh()`可能  |
| Remote `form` / `command` | アプリ内の型安全な書き込み              | Standard Schemaで入力検証             | `form`は対応、`command`は非対応 | single-flight mutationでquery更新を宣言可能 |
| `+server.ts` HTTP API     | 外部クライアント、webhook、公開API      | status、header、JSON schemaを明示管理 | 呼び出し元による                | HTTP cacheやクライアント側cacheを設計       |

## この実装で揃えているもの

- 3つの検索経路はすべて `runComparisonSearch` を呼び、同じ所有者条件を利用する
- URL入力、Remote引数、API query parameterをそれぞれサーバー側で検証する
- 実行ID、実行時刻、DB処理時間を返し、どの操作がサーバー実行を発生させたか見えるようにする
- APIレスポンスはJSON互換の文字列日時、Remote queryも比較のため同じ形へ揃える

## productionでの注意

Remote Functionsは現在experimentalで、semantic versioningの対象外として変更される可能性がある。採用時はSvelteKitのversionを固定し、upgrade時に生成endpoint、validation、cache更新を回帰テストする。

HTTP APIを外部公開する場合は、教材のCookie認証だけでなく、CORS、API用認証、rate limit、versioning、schema公開、監査ログを要件に応じて追加する。
