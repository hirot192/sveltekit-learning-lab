# 実装ロードマップ

各マイルストーンは、その時点でアプリを起動・確認できる小さな完成状態にする。後続の章が前段のコードを無言で置き換えないよう、重要な設計変更は ADR または章本文へ理由を残す。

## M0: 要件と設計

- [x] 対象読者と教材の目的を決める
- [x] MVP の機能要件と対象外を決める
- [x] 主要ルート、データモデル、セッション方式を決める
- [x] プロジェクト名とライセンスを決める
- [x] Git リポジトリを初期化する

**完了条件:** 実装範囲と受け入れ条件を文書から判断できる。

## M1: SvelteKit 基盤

- [x] SvelteKit + TypeScript の scaffold
- [x] adapter-node、lint、format、型検査、テストの設定
- [x] 共通レイアウト、教材トップ、最初の学習章
- [x] development / test / production の環境変数境界
- [x] GitHub Actions の最小 CI

**教材テーマ:** ファイルベースルーティング、SSR、hydration、layout、server-only module。

**完了条件:** 依存関係をクリーンインストールし、開発サーバー、型検査、production build が成功する。

## M2: PostgreSQL と CRUD

- [x] Compose に PostgreSQL を追加
- [x] schema、migration、seed、DB 接続管理
- [x] メモ一覧、詳細、作成、編集、削除
- [x] Form Actions と Progressive Enhancement
- [x] repository / service の最小分離

**教材テーマ:** `load`、Form Actions、validation、redirect、transaction、SQL ログ。

**完了条件:** 仮ユーザーのメモ CRUD が通常フォームと enhanced form の両方で動く。

## M3: アカウントと DB セッション

- [x] ユーザー登録、パスワード hash / verify
- [x] ログイン、セッション発行、Cookie 設定
- [x] `hooks.server.ts` でのセッション復元
- [x] `App.Locals` の型定義
- [x] ログアウト、期限切れ、セッション失効
- [x] 認証必須 route group

**教材テーマ:** authentication、Cookie、hooks、locals、DB session、環境別 Cookie 属性。

**完了条件:** 登録からログアウトまで動作し、失効済みセッションを再利用できない。

## M4: 認可と複数ユーザー

- [x] すべてのメモ操作に所有者条件を追加
- [x] 他ユーザーの存在を漏らしにくい 404 / 403 方針
- [x] 水平権限昇格を防ぐ結合テスト
- [x] ページ、Form Action、JSON APIで同じ認可境界を利用
- [x] 全端末ログアウトと個別セッション失効

**教材テーマ:** authentication と authorization の違い、IDOR、defense in depth。

**完了条件:** URL、Form Action、API のいずれからも他人のメモを取得・変更できない。

## M5: 検索、タグ、ページネーション

- [x] タイトル・本文検索
- [x] タグ作成と多対多関連
- [x] 絞り込み、並び替え、ページネーション
- [x] 検索条件を URL に保持
- [x] 適切な index と `EXPLAIN` の教材

**教材テーマ:** URL state、JOIN、index、検索クエリ、N+1。

**完了条件:** 条件を組み合わせてもユーザー境界とページ件数が正しい。

## M6: SvelteKit の処理方式比較

- [x] 既存の検索または更新を Remote Functions でも実装
- [x] 同等の `+server.ts` API を一つ実装
- [x] Form Actions、Remote Functions、HTTP API の比較章
- [x] SSR、client navigation、invalidation の観察機能

**教材テーマ:** `query` / `form` / `command`、外部 API、キャッシュ無効化、Progressive Enhancement。

**完了条件:** 三方式の利用場面とトレードオフを、動作するコードで比較できる。

## M7: 教材 UI と品質

- [x] 全章の学習目標、前提知識、処理フロー、関連ファイル、実験項目
- [x] エラー境界、loading 状態、空状態
- [x] アクセシビリティ確認
- [x] unit / integration / E2E テストの整理
- [x] 教材内リンク切れ検査

**完了条件:** 要件定義の教材機能とアクセシビリティ条件を満たす。

## M8: コンテナと Linux デプロイ

- [x] multi-stage Dockerfile
- [x] production Compose、healthcheck、persistent volume
- [x] migration、seed、deploy、backup、restore スクリプト
- [x] reverse proxy と TLS のサンプル
- [x] graceful shutdown と DB 接続終了
- [x] 新規 Linux VM 相当で再現テスト

**教材テーマ:** adapter-node、build artifact、環境変数、origin、proxy trust、永続化。

**完了条件:** README の手順だけでクリーンな Linux 環境へ起動・更新・復旧できる。

## M9: GitHub 公開

- [x] README、構成図、スクリーンショット、ライセンス
- [x] `.env.example` とセキュリティ注意事項
- [x] CI で test / build / Docker build
- [x] release tag と変更履歴
- [x] GitHub への push と公開前チェック

**完了条件:** 秘密情報を含まず、clone 直後から第三者が教材を再現できる。

## 実装順に関する判断

認証より先に、仮ユーザーを使った CRUD を実装する。これにより、初学者が SvelteKit、フォーム、DB、認証を一度に理解する負荷を避けられる。M3 で仮ユーザーを実セッションのユーザーへ置き換え、差分そのものを教材にする。

## M10: 読み物としてのカリキュラム

- [x] 各章の前提となるSvelteKit基礎編を追加する
- [x] 学習順を「操作、概念、処理フロー、コード、実験、理解度確認」に統一する
- [x] 全9章に新しい概念、よくある誤解、理解度チェックを追加する
- [x] 教材データと読み物を型付きの単一ソースとして管理する
- [x] ブラウザ、モバイル表示、アクセシビリティを確認する

**教材テーマ:** mental model、段階的開示、体験とコードリーディングの往復。

**完了条件:** 学習者が基礎編から開始し、全章を同じ学習サイクルで読み進められる。

## M11: 教材の導入体験

- [x] READMEのメイン画像をデスクトップ表示へ変更する
- [x] clone後の一コマンド起動スクリプトを追加する
- [x] ダウンロードから起動までをつなぐinstallスクリプトを追加する
- [x] 学習用起動と公開デプロイの手順を分離する
- [ ] クリーンなLinux環境相当で導入手順を再検証する

**教材テーマ:** reproducible setup、秘密情報の自動生成、localhostと公開環境の境界。

**完了条件:** 学習者が環境変数を手編集せず、clone後に一つのコマンドで教材を開ける。
