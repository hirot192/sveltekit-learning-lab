#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE_FILE=${COMPOSE_FILE:-compose.production.yml}
backup_file=${1:-}
confirmation=${2:-}

if [[ -z "$backup_file" || ! -f "$backup_file" ]]; then
	echo "Usage: scripts/restore.sh backups/file.dump [--yes]" >&2
	exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
	echo "Missing $ENV_FILE" >&2
	exit 1
fi

if [[ "$confirmation" != "--yes" ]]; then
	read -r -p "This replaces the current database contents. Type RESTORE to continue: " answer
	if [[ "$answer" != "RESTORE" ]]; then
		echo "Restore cancelled"
		exit 1
	fi
fi

compose=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")

"${compose[@]}" stop app
restart_app() {
	"${compose[@]}" up -d app >/dev/null 2>&1 || true
}
trap restart_app EXIT

"${compose[@]}" exec -T db sh -c \
	'pg_restore --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges' \
	<"$backup_file"

"${compose[@]}" up -d --wait --wait-timeout 120 app
trap - EXIT
echo "Restore complete: $backup_file"
