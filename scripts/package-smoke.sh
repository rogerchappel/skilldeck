#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

PACK_JSON="$TMP_DIR/pack.json"
npm pack --json --pack-destination "$TMP_DIR" >"$PACK_JSON"
TARBALL_NAME="$(node -e 'const fs = require("node:fs"); const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); if (data.length !== 1 || !data[0].filename) process.exit(1); process.stdout.write(data[0].filename)' "$PACK_JSON")"
TARBALL="$TMP_DIR/$TARBALL_NAME"
PREFIX="$TMP_DIR/prefix"

npm install --global --prefix "$PREFIX" "$TARBALL"
"$PREFIX/bin/skilldeck" --help | grep -F "skilldeck validate" >/dev/null
"$PREFIX/bin/skilldeck" validate "$ROOT/fixtures/valid-pack" --strict --json >"$TMP_DIR/validate.json"
node -e 'const fs = require("node:fs"); const result = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); if (!result.ok) process.exit(1)' "$TMP_DIR/validate.json"

echo "skilldeck package install smoke ok"
