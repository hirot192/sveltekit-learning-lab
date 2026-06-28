#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE_FILE=${COMPOSE_FILE:-compose.production.yml}
BACKUP_DIR=${BACKUP_DIR:-backups}

if [[ ! -f "$ENV_FILE" ]]; then
	echo "Missing $ENV_FILE" >&2
	exit 1
fi

mkdir -p "$BACKUP_DIR"
backup_file="$BACKUP_DIR/sveltekit-learning-lab-$(date -u +%Y%m%dT%H%M%SZ).dump"
compose=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")

"${compose[@]}" exec -T db sh -c \
	'pg_dump --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --format=custom' \
	>"$backup_file"

if [[ ! -s "$backup_file" ]]; then
	echo "Backup is empty: $backup_file" >&2
	exit 1
fi

echo "Backup created: $backup_file"
