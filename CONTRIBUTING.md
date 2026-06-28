# Contributing

教材の説明と実装がずれないことを最優先にします。変更時は、画面だけでなく対応する章・ソースマップ・実験も確認してください。

## 開発環境

READMEのローカル起動手順を実行し、変更前に次の品質ゲートが通ることを確認します。

```bash
npm run check
npm run lint
npm run check:content
npm run test:unit -- --run
npm run test:db
npm run build
npm run test:e2e
```

DB schemaを変更した場合は`npm run db:generate`でmigrationを生成し、SQLとsnapshotを一緒にレビューします。生成済みmigrationを書き換えず、新しいmigrationとして追加してください。

## Pull request

- 一つのPRへ無関係な変更を混ぜない
- 判断理由、利用者への影響、実行したテストを書く
- 新しい教材章には前提知識、目標、処理フロー、関連ファイル、実験を含める
- 認証・認可変更には失敗経路と別ユーザーからのテストを含める
- 秘密情報、実在する個人情報、production DBのdumpをcommitしない
