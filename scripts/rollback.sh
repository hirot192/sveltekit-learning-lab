#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ROOT_DIR"

target_version=${1:-}
ENV_FILE=${ENV_FILE:-.env.production}
COMPOSE_FILE=${COMPOSE_FILE:-compose.production.yml}

if [[ -z "$target_version" ]]; then
	echo "Usage: scripts/rollback.sh <previous-app-version>" >&2
	exit 1
fi

if ! docker image inspect "sveltekit-learning-lab:$target_version" >/dev/null 2>&1; then
	echo "Image not found locally: sveltekit-learning-lab:$target_version" >&2
	exit 1
fi

export APP_VERSION=$target_version
compose=(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE")

"${compose[@]}" up -d --no-build --wait --wait-timeout 120 app
echo "Application rolled back to image tag: $target_version"
