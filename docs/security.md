# セキュリティ設計

このプロジェクトは、認証とセッションの内部構造をソースから学ぶため、DB セッション方式を明示的に実装している。独自認証をすべての本番サービスへ推奨するものではない。本番では要件に応じて Better Auth、外部 IdP、パスキーなどの実績ある仕組みも検討する。

## M3〜M4 で実装済み

- パスワードを Argon2id でハッシュ化する
  - memory: 19 MiB
  - iterations: 2
  - parallelism: 1
- パスワードは 15〜128 文字とし、Unicode と空白を許可する
- 32 バイトの暗号学的乱数からセッショントークンを生成する
- Cookie には生トークン、DB には SHA-256 ハッシュだけを保存する
- Cookie に `HttpOnly`、`SameSite=Lax`、本番で `Secure`、`Path=/` を設定する
- server hook でセッションとユーザーを復元し、`event.locals` へ格納する
- 保護された load と Form Action の両方でログインを要求する
- メモの DB 操作に必ずユーザー ID を含める
- URL の UUID を権限として扱わず、認証済みユーザー ID と組み合わせて検索する
- 存在しないメモと他人所有のメモを同じ 404 応答にする
- ページ、Form Action、JSON API が同じ所有者スコープ付き service / repository を使う
- 2ユーザーのDB結合テストとE2Eテストで水平権限昇格を検査する
- ログアウト、端末別失効、全セッション失効で DB レコードを削除する
- ログイン失敗メッセージからアカウントの存在を区別しにくくする
- ログイン後の遷移先を同一サイト内の相対パスへ制限する
- サーバー側 Zod validation を必須にする

## M8 で追加済み

- TLS reverse proxyとHSTSのCaddy設定例
- 非root・read-onlyのapp container
- DBを含むhealthcheckとgraceful shutdown
- migration、backup、restoreを分離した運用手順
- DependabotとCIの依存関係監査

## 公開サービスへ転用する前に追加するもの

- IP とアカウントを組み合わせたログイン試行制限
- 監査ログ、認証失敗の監視と通知
- メールアドレスの所有確認
- 安全なパスワード再設定
- 漏えい済み・頻出パスワードの検査
- MFA またはパスキー
- CSP などのレスポンスヘッダー
- セッションのアイドルタイムアウト方針
- Cookie 名への `__Host-` prefix 適用可否の検討

## 参照した指針

- https://svelte.dev/docs/kit/auth
- https://svelte.dev/docs/kit/hooks
- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
