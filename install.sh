#!/usr/bin/env bash
set -Eeuo pipefail

REPOSITORY_URL=${REPOSITORY_URL:-https://github.com/hirot192/sveltekit-learning-lab.git}
INSTALL_DIR=${INSTALL_DIR:-$PWD/sveltekit-learning-lab}
REF=${REF:-main}

fail() {
	echo "install: $*" >&2
	exit 1
}

command -v git >/dev/null 2>&1 || fail "Git is required."

if [[ -e "$INSTALL_DIR" ]]; then
	fail "$INSTALL_DIR already exists. Choose another directory with INSTALL_DIR=/path/to/dir."
fi

echo "Downloading SvelteKit Learning Lab ($REF) into $INSTALL_DIR..."
git clone --depth 1 --branch "$REF" --single-branch "$REPOSITORY_URL" "$INSTALL_DIR"

cd "$INSTALL_DIR"
exec ./scripts/quickstart.sh
