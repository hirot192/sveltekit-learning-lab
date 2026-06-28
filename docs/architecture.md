# アーキテクチャ

## 1. 全体像

一つの SvelteKit アプリに、完成アプリと教材ページを共存させる。

```text
Browser
  -> SvelteKit route / form action / remote function
    -> authentication and authorization
      -> application service
        -> repository
          -> PostgreSQL
```

Svelte コンポーネントから DB へ直接アクセスしない。DB と秘密情報を扱うコードは `src/lib/server` 以下またはサーバー専用ファイルに置く。

## 2. 技術選定

| 領域        | 採用方針                               | 理由                                                                    |
| ----------- | -------------------------------------- | ----------------------------------------------------------------------- |
| UI / Web    | Svelte 5 + SvelteKit                   | 教材の中心。SSR とクライアント遷移を同じコードベースで比較できる        |
| 言語        | TypeScript strict mode                 | リクエスト、フォーム、DB 境界の型を教材化できる                         |
| 実行環境    | Node.js LTS + `@sveltejs/adapter-node` | 一般的な Linux とコンテナで再現しやすい                                 |
| DB          | PostgreSQL                             | 制約、JOIN、トランザクション、検索を実務に近い形で扱える                |
| DB アクセス | Drizzle ORM                            | スキーマと SQL の対応を追いやすく、マイグレーションも教材化できる       |
| 入力検証    | Zod（Standard Schema 対応）            | サーバー境界で同じ検証規則を再利用し、Remote Functions とも接続しやすい |
| テスト      | Vitest + Playwright                    | ロジック、DB 結合、ブラウザ操作を分けて検証できる                       |
| 配布        | Dockerfile + Docker Compose            | ホストの Node.js や PostgreSQL に依存せず再現できる                     |

依存ライブラリの正確なバージョンは scaffold 時に公式互換性を確認し、ロックファイルとコンテナタグへ固定する。

## 3. SvelteKit 機能の扱い

### 3.1 主経路

最初の CRUD と認証は、処理経路が見えやすく JavaScript 無効時にも動く次の仕組みで実装する。

- `+page.server.ts` の `load`
- `+page.server.ts` の Form Actions
- `<form method="POST">`
- `$app/forms` の Progressive Enhancement
- `hooks.server.ts` と `event.locals`

### 3.2 比較経路

現在の SvelteKit が提供する Remote Functions を後半で追加し、同じ検索または更新処理を題材に次を比較する。

- `load` / Form Actions
- `query` / `form` / `command`
- `+server.ts` の HTTP API

どれか一つを万能な正解として扱わず、HTML フォーム、型安全なアプリ内 RPC、外部公開 API という用途の違いを示す。

## 4. 予定ルート

```text
src/routes/
  +layout.server.ts           # 現在のユーザーを全ページへ渡す
  +layout.svelte              # 共通ナビゲーション
  +page.svelte                # 教材トップ
  learn/[chapter]/            # 章本文と実験
  register/                   # 登録 form action
  login/                      # ログイン form action
  logout/                     # ログアウト処理
  (app)/                      # 認証必須の route group
    notes/                    # 一覧、検索、絞り込み
    notes/new/                # 作成
    notes/[noteId]/           # 詳細、削除
    notes/[noteId]/edit/      # 編集
    settings/sessions/        # セッション一覧と失効
  api/notes/                  # +server.ts の比較教材
  healthz/                    # コンテナ用ヘルスチェック
```

## 5. サーバー側モジュール

```text
src/lib/server/
  auth/
    password.ts               # パスワードの hash / verify
    session.ts                # セッション生成、検証、失効
  db/
    client.ts                 # DB 接続
    schema.ts                 # テーブル定義
    migrations/               # 変更履歴
  repositories/
    users.ts
    sessions.ts
    notes.ts
    tags.ts
  services/
    account.ts                # 登録・ログインのユースケース
    notes.ts                  # メモ操作と認可
  validation/
    account.ts
    note.ts
```

route は HTTP と SvelteKit 固有処理、service はユースケース、repository は SQL と永続化へ責務を限定する。ただし、小さな処理まで形式的に分割して読みづらくしない。

## 6. データモデル

### users

| カラム                  | 概要                           |
| ----------------------- | ------------------------------ |
| id                      | UUID、主キー                   |
| email                   | 正規化済みメールアドレス、一意 |
| display_name            | 表示名                         |
| password_hash           | パスワードハッシュ             |
| created_at / updated_at | 監査用時刻                     |

### sessions

| カラム       | 概要                                             |
| ------------ | ------------------------------------------------ |
| id           | UUID、画面上で失効対象を指定する主キー           |
| token_hash   | 生トークンを SHA-256 でハッシュ化した一意値      |
| user_id      | `users.id` への外部キー                          |
| created_at   | 発行時刻                                         |
| last_seen_at | 最終利用時刻。更新頻度は抑制する                 |
| expires_at   | 失効時刻                                         |
| user_agent   | 教材用の端末識別補助。信頼できる識別子にはしない |

### notes

| カラム                  | 概要                            |
| ----------------------- | ------------------------------- |
| id                      | UUID、主キー                    |
| user_id                 | 所有者。`users.id` への外部キー |
| title                   | タイトル                        |
| body                    | 本文                            |
| created_at / updated_at | 作成・更新時刻                  |

### tags / note_tags

- `tags` は表示名とは別に小文字化した `normalized_name` を持ち、ユーザー単位で一意にする
- `note_tags` はメモとタグの多対多を表す
- メモとタグの所有者が一致することを service とトランザクションで保証する
- タイトル・本文の部分一致には `pg_trgm` の GIN index を用意する

## 7. 代表的な処理フロー

### 7.1 ログイン済みリクエスト

1. ブラウザがセッション Cookie を付けてリクエストする
2. `hooks.server.ts` が Cookie から生トークンを読む
3. 生トークンをハッシュ化し、`sessions` と `users` を検索する
4. 有効なら公開可能なユーザー情報を `event.locals.user` に格納する
5. route の `load` または action が `locals.user` を使って認証を確認する
6. repository は `user_id` を条件に含めて DB を操作する

### 7.2 メモ作成

1. ブラウザが通常の HTML form として POST する
2. Form Action が `request.formData()` を読む
3. サーバー側で入力を検証する
4. service がログインユーザーとタグの整合性を確認する
5. transaction 内でメモ、タグ、関連行を保存する
6. 詳細ページへ redirect する
7. JavaScript 有効時のみ `use:enhance` が画面遷移を滑らかにする

### 7.3 所有者限定のメモ取得

1. `hooks.server.ts` がセッションを検証し、信頼できる `locals.user.id` を作る
2. route は URL の `noteId` を入力として受け取るが、これだけでは認可しない
3. repository は `notes.id = noteId AND notes.user_id = locals.user.id` を同じ SQL に含める
4. 0件なら、実在しないIDと他人所有のIDを区別せず 404 を返す
5. page load、Form Action、JSON API のすべてがこの境界を利用する

### 7.4 メモ検索

1. GETフォームが `q`、`tag`、`sort` をURLへ書き込む
2. server loadがURL値をZodで検証し、不正なpageやsortを既定値へ戻す
3. repositoryが`user_id`、キーワード、タグを一つのWHERE条件へまとめる
4. COUNTで総件数を取得し、ページ番号を範囲内へ収める
5. 同じWHEREへORDER BY、LIMIT、OFFSETを適用して現在ページを取得する
6. ページリンクが現在の検索条件を引き継ぐ

### 7.5 3つの検索経路

1. HTML GET formはURLを更新し、`+page.server.ts`のloadを再実行する
2. Remote queryは`.remote.ts`から生成されたendpointを呼び、引数単位でdedupeする
3. HTTP APIは`+server.ts`へfetchし、statusとJSONを明示的に処理する
4. 3経路は`runComparisonSearch`へ合流し、同じ認可・repository境界を使う
5. Remote queryの`refresh()`は同じcache keyを再取得し、実行IDの変化として観察できる

## 8. セッション設計

- Cookie には意味を持たないランダムな生トークンのみを入れる
- DB には生トークンではなくハッシュを保存する
- パスワードは Argon2id（19 MiB、反復 2、並列度 1）で保存する
- セッションは DB 照合方式とし、即時失効を可能にする
- 絶対有効期限を設け、必要なら利用中の期限延長を別段階で実装する
- ログアウトは DB レコード削除と Cookie 削除の両方を行う
- Cookie の `path` は `/`、`HttpOnly` は常時、`Secure` は本番、`SameSite` は `Lax` とする
- URL の `returnTo` は同一オリジンの相対パスだけを許可し、オープンリダイレクトを防ぐ

## 9. デプロイ構成

```text
Internet
  -> TLS reverse proxy
    -> SvelteKit Node container
      -> PostgreSQL container / managed PostgreSQL
```

- Dockerfile は multi-stage build とし、実行イメージに開発依存を含めない
- アプリは非 root ユーザーで実行する
- Compose では永続 volume、healthcheck、再起動ポリシーを定義する
- migration はアプリ起動と暗黙に競合させず、デプロイ手順の明示的ステップにする
- `ORIGIN` または信頼済みプロキシヘッダーを正しく設定する
- TLS 終端とバックアップはアプリ外の運用責務として手順を示す

## 10. 公式資料との整合

設計時点の SvelteKit 公式資料では、DB セッションは即時失効できる一方、各リクエストで DB 照合が必要と説明されている。また、Cookie の確認を server hook で行い、ユーザーを `locals` に保存する統合方法が案内されている。本教材はこの経路を明示的に実装する。

Node 配布には公式の `@sveltejs/adapter-node` を利用する。reverse proxy 配下では `ORIGIN` または信頼できる forwarded header の設定が Form Actions のオリジン判定にも関係するため、デプロイ章で検証する。

参考:

- https://svelte.dev/docs/kit/auth
- https://svelte.dev/docs/kit/form-actions
- https://svelte.dev/docs/kit/remote-functions
- https://svelte.dev/docs/kit/hooks
- https://svelte.dev/docs/kit/adapter-node
