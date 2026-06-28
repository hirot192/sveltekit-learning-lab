# Linuxデプロイと運用

対象はDocker EngineとCompose pluginを利用できる一般的なLinuxサーバーです。アプリとPostgreSQLはコンテナで動かし、CaddyなどのTLS reverse proxyだけがインターネットからの通信を受けます。

```text
Internet :443
  -> Caddy (TLS / compression)
    -> 127.0.0.1:3000
      -> SvelteKit app container
        -> PostgreSQL container + named volume
```

## 初回デプロイ

DNSのA/AAAAレコードをサーバーへ向け、リポジトリをcloneして次を実行します。

```bash
cp .env.production.example .env.production
$EDITOR .env.production
chmod +x scripts/*.sh
scripts/deploy.sh --seed
```

`.env.production`では少なくとも次を変更します。

- `ORIGIN`: ブラウザから見えるHTTPS URL。末尾のslashは付けない
- `POSTGRES_PASSWORD`: 長いランダム値
- `DATABASE_URL`: 同じパスワードをURL encodeし、hostはCompose service名の`db`にする
- `APP_VERSION`: release tagやcommit SHA。rollbackで参照するimage tagになる

`scripts/deploy.sh`はimage build、DB起動、明示的migration、app起動、healthcheck待機の順に進みます。seedは学習用データが必要な初回だけ`--seed`で実行します。

SvelteKitはbuild後の解析でserver moduleをimportするため、Dockerfileのbuild stageだけに接続不能なダミー`DATABASE_URL`を設定しています。DB接続は実行されず、productionの認証情報をimage buildへ渡す必要もありません。本物の値はcontainer起動時だけ注入します。

## TLS reverse proxy

ホストへCaddyをインストールし、[Caddyfile例](../deploy/Caddyfile.example)を`/etc/caddy/Caddyfile`へ配置してhostnameを書き換えます。Caddyは証明書取得・更新とHTTPSへのredirectを担当します。アプリのportはComposeで`127.0.0.1`にだけ公開されるため、外部からNodeへ直接接続できません。

本構成は固定した`ORIGIN`を使います。`PROTOCOL_HEADER`や`HOST_HEADER`は設定しません。forwarded headerを信頼する構成へ変える場合は、Nodeコンテナへ直接到達できないことを保証してから設定してください。

## 更新とrollback

更新前にbackupを取り、新しいcommitで異なる`APP_VERSION`を設定してdeployします。

```bash
scripts/backup.sh
git pull --ff-only
$EDITOR .env.production  # APP_VERSIONを新しいtag/SHAへ変更
scripts/deploy.sh
```

直前のimageがローカルに残っていれば、アプリだけを戻せます。

```bash
scripts/rollback.sh <previous-app-version>
```

DB migrationは自動的にdownしません。rollback可能にするため、列削除やrenameは「追加 → 両version対応 → 後日の削除」に分けるexpand/contract方式を使います。破壊的migration後は、検証済みbackupからのrestoreが必要です。

## Backupとrestore

backupはPostgreSQLと同じversionの`pg_dump`をDBコンテナ内で実行し、custom formatをホストの`backups/`へ保存します。

```bash
scripts/backup.sh
scripts/restore.sh backups/sveltekit-learning-lab-YYYYMMDDTHHMMSSZ.dump
```

restoreは現在のDB objectを置き換えるため確認入力が必要で、処理中はappを停止します。定期backupは別ホストまたはobject storageへ暗号化して複製し、保存世代とrestore訓練を運用側で決めてください。

## Healthcheckと終了処理

`/healthz`はNodeプロセスとDBの両方を確認し、成功時200、DBへ接続できない場合503を返します。秘密情報や例外本文は返しません。

adapter-nodeは`SIGTERM`後に新規requestを止め、処理中requestを最大`SHUTDOWN_TIMEOUT`秒待ちます。その後の`sveltekit:shutdown`でDB poolをcloseします。Composeの`stop_grace_period`はその待機時間より長く設定します。

PostgreSQL停止でidle connectionが切断された場合はpoolの`error` eventを記録し、Node processは維持します。DB復旧後のrequestでpoolが新しいconnectionを作れるため、app containerの再起動に依存しません。

```bash
docker compose --env-file .env.production -f compose.production.yml ps
curl --fail http://127.0.0.1:3000/healthz
docker compose --env-file .env.production -f compose.production.yml logs --tail=100 app
```

## Volumeを含む完全初期化

次の操作はDB volumeを削除します。backupを確認してから実行してください。

```bash
docker compose --env-file .env.production -f compose.production.yml down --volumes
scripts/deploy.sh --seed
```
