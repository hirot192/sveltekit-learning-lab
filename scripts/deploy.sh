#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE_FILE=${COMPOSE_FILE:-compose.production.yml}
SEED=false

if [[ ${1:-} == "--seed" ]]; then
	SEED=true
fi

if [[ ! -f "$ENV_FILE" ]]; then
	echo "Missing $ENV_FILE. Copy .env.production.example and set production values." >&2
	exit 1
fi

compose=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")

"${compose[@]}" config --quiet
"${compose[@]}" build app
"${compose[@]}" up -d db
"${compose[@]}" run --rm migrate

if [[ "$SEED" == true ]]; then
	"${compose[@]}" run --rm seed
fi

"${compose[@]}" up -d --wait --wait-timeout 120 app
"${compose[@]}" ps
