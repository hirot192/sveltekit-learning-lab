# SvelteKit Learning Lab

[![CI](https://github.com/hirot192/sveltekit-learning-lab/actions/workflows/ci.yml/badge.svg)](https://github.com/hirot192/sveltekit-learning-lab/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0e7a52.svg)](LICENSE)

動くメモアプリとソースコードを往復しながら、SvelteKitの「なぜ動くのか」を学ぶ教材プロジェクトです。

ファイルベースルーティングからPostgreSQL、Form Actions、ログイン、DBセッション、認可、検索、Remote Functions、DockerによるLinuxデプロイまでを、一つのアプリケーションで追跡できます。

![SvelteKit Learning Labのデスクトップ教材画面](static/screenshots/learning-map.jpg)

## まず動かす

必要なのはGit、Docker Engine、Docker Compose pluginだけです。リポジトリをcloneしたら、一つのスクリプトでアプリ、PostgreSQL、migration、学習データをまとめて準備できます。

```bash
git clone https://github.com/hirot192/sveltekit-learning-lab.git
cd sveltekit-learning-lab
./scripts/quickstart.sh
```

`http://localhost:3000`を開きます。初回だけimage buildに数分かかることがあります。再実行しても既存データを保持し、停止方法は完了時に表示します。

cloneもスクリプトへ任せる場合は、実行前に内容を確認してから起動できます。

```bash
curl -fsSL https://raw.githubusercontent.com/hirot192/sveltekit-learning-lab/main/install.sh -o install.sh
less install.sh
bash install.sh
```

## 学べること

| 章  | テーマ                    | 動かすもの                                 |
| --- | ------------------------- | ------------------------------------------ |
| 01  | ルーティングと描画        | URL、`load`、layout、SSR                   |
| 02  | サーバーからデータを読む  | server load、service、repository           |
| 03  | フォームからデータを書く  | Form Actions、Zod、progressive enhancement |
| 04  | PostgreSQLと永続化        | schema、migration、seed、index             |
| 05  | ログインとDBセッション    | Argon2id、Cookie、hooks、locals            |
| 06  | 認証と認可を分ける        | 所有者境界、IDOR対策、404方針              |
| 07  | 検索とURL state           | JOIN、タグ、ページネーション、GIN index    |
| 08  | 3つのサーバー通信を比べる | server load、Remote Functions、HTTP API    |
| 09  | Linuxへデプロイする       | adapter-node、Docker、healthcheck、backup  |

各章には、前提知識、学習目標、リクエストの処理順、読むソース、手元で試す実験があります。

## 学び方

アプリを起動して`/learn`を開き、最初に基礎編でroute規約、serverとbrowserの境界、SSR、hydration、load、Form Actionsの関係を一つの地図として整理します。

各章は次の順序で進みます。

1. 完成したアプリを操作し、観察する対象を決める
2. その章で新しく登場する概念と、よくある誤解を読む
3. ブラウザからDBまでの処理フローを追う
4. source mapの順番で実装コードを読む
5. コードや状態を小さく変更し、予測を検証する
6. 理解度チェックへ自分の言葉で答える

基礎編と章本文は`src/lib/content`の型付きデータを単一ソースとして描画し、内容とUIの不整合を検査します。

## 全体構成

```mermaid
flowchart LR
    B[Browser] --> R[SvelteKit route]
    R --> H[hooks / authentication]
    H --> S[service / authorization]
    S --> P[repository]
    P --> D[(PostgreSQL)]

    C[Caddy / TLS] --> N[adapter-node container]
    N --> R
```

SvelteコンポーネントからDBへ直接アクセスせず、HTTP境界、ユースケース、永続化を小さく分けています。抽象化そのものを目的にせず、ブラウザからSQLまでをファイル名から追える構成です。

## ソースを変更しながら起動

教材のコードを変更し、hot reloadしながら確認するときはNode.js 24、npm、Dockerを使います。

```bash
npm ci
cp .env.example .env
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

`http://localhost:5173`を開きます。seedは教材表示用の固定データを作りますが、ログイン可能なパスワードは設定しません。メモ機能は画面から学習用アカウントを登録して試してください。

## インターネットへ公開する

公開環境ではドメイン、DNS、TLS、秘密情報を明示的に設定します。一般的なLinux環境では、次の手順でadapter-nodeとPostgreSQLを起動できます。

```bash
cp .env.production.example .env.production
$EDITOR .env.production
scripts/deploy.sh --seed
```

アプリは非root・read-only containerで動き、PostgreSQLはnamed volumeへ永続化します。migrationはアプリ起動と分離したone-shot processです。更新、rollback、backup、restore、CaddyによるTLS終端は[Linuxデプロイと運用](docs/deployment.md)を参照してください。

## 品質チェック

```bash
npm run check
npm run lint
npm run check:content
npm run test:unit -- --run
npm run test:db
npm run build
npm run test:e2e
npm run docker:build
```

初回のE2E実行前に`npx playwright install chromium`でブラウザを用意します。CIでは型検査、教材リンク、unit、DB integration、E2E、アクセシビリティ、production build、Docker smoke testを実行します。

## 主な設計判断

- HTML formを主経路にして、JavaScript無効時もCRUDを維持する
- Cookieにはランダムな生トークン、DBにはSHA-256 hashだけを保存する
- すべてのメモSQLへ認証済みユーザーIDを含め、他人のデータを同じ404で隠す
- 検索条件をURLへ置き、再読込・共有・戻る操作を自然にする
- Form Actions、Remote Functions、HTTP APIを万能視せず、用途ごとに比較する
- migrationをapp起動へ埋め込まず、deployの明示的な段階として扱う

Remote FunctionsはSvelteKitのexperimental featureを有効にして教材化しています。version更新時は公式の変更点を確認してください。

## セキュリティ上の位置づけ

このrepositoryは認証内部を読むための教材です。そのまま不特定多数向けサービスへ公開することを推奨するものではありません。rate limit、メールアドレス確認、パスワード再設定、監査ログなど、要件に応じて追加すべき項目があります。

詳細は[セキュリティ設計](docs/security.md)と[脆弱性報告方針](SECURITY.md)を参照してください。秘密情報は`.env`へ置き、Gitにはcommitしません。

## ドキュメント

- [要件定義](docs/requirements.md)
- [アーキテクチャ](docs/architecture.md)
- [セキュリティ設計](docs/security.md)
- [実装ロードマップ](docs/roadmap.md)
- [テスト戦略](docs/testing.md)
- [通信方式の比較](docs/transport-comparison.md)
- [Linuxデプロイと運用](docs/deployment.md)
- [変更履歴](CHANGELOG.md)
- [コントリビューション](CONTRIBUTING.md)

## License

[MIT](LICENSE)
