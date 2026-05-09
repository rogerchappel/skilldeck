#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
node "$ROOT/dist/src/cli.js" validate "$ROOT/fixtures/valid-pack" --strict --json >/tmp/skilldeck-validate.json
node "$ROOT/dist/src/cli.js" report "$ROOT/fixtures/valid-pack" --json >/tmp/skilldeck-report.json
DEST="$(mktemp -d)"
trap 'rm -rf "$DEST"' EXIT
node "$ROOT/dist/src/cli.js" install "$ROOT/fixtures/valid-pack" --target agents --dest "$DEST" --json >/tmp/skilldeck-install.json
test -f "$DEST/review-code/SKILL.md"
PACK_OUT="$(mktemp -d)"
node "$ROOT/dist/src/cli.js" pack "$ROOT/docs" --name smoke-docs --out "$PACK_OUT" --json >/tmp/skilldeck-pack.json
test -f "$PACK_OUT/smoke-docs/SKILL.md"
echo "skilldeck smoke ok"
