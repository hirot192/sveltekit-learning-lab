# Changelog

このプロジェクトの主な変更を記録します。形式は[Keep a Changelog](https://keepachangelog.com/ja/1.1.0/)を参考にし、Semantic Versioningに従います。

## [Unreleased]

## [0.2.0] - 2026-06-28

### Added

- 各章の前に読むSvelteKit基礎編
- 全9章の操作課題、新概念、よくある誤解、理解度チェック
- 基礎編と章本文を対象にしたアクセシビリティE2E検査
- clone後に環境生成、migration、seed、起動まで行う`quickstart.sh`
- リポジトリのダウンロードから起動までをつなぐ`install.sh`
- デスクトップ表示に合わせたREADMEスクリーンショット
- Ubuntu CIでの一コマンド導入smoke test

## [0.1.0] - 2026-06-28

### Added

- ソースマップと実験を備えた全9章のSvelteKit教材
- PostgreSQL、Drizzle migration、メモCRUD、タグ、検索、ページネーション
- Argon2id、DBセッション、Cookie、端末別・一括セッション失効
- repository境界の所有者認可と水平権限昇格テスト
- server load、Remote query、HTTP APIの比較デモ
- error boundary、空状態、フォーカス表示、axeアクセシビリティ検査
- adapter-nodeのmulti-stage imageとproduction Compose
- healthcheck、graceful shutdown、deploy、rollback、backup、restore
- CaddyによるTLS reverse proxy例とLinux運用runbook

[Unreleased]: https://github.com/hirot192/sveltekit-learning-lab/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/hirot192/sveltekit-learning-lab/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/hirot192/sveltekit-learning-lab/releases/tag/v0.1.0
