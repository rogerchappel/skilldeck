#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
node "$ROOT/dist/src/cli.js" --help | grep -F "Skill names must be 2-63 lowercase letters" >/dev/null
node "$ROOT/dist/src/cli.js" validate "$ROOT/fixtures/valid-pack" --strict --json >/tmp/skilldeck-validate.json
node "$ROOT/dist/src/cli.js" report "$ROOT/fixtures/valid-pack" --json >/tmp/skilldeck-report.json
DEST="$(mktemp -d)"
PACK_OUT="$(mktemp -d)"
trap 'rm -rf "$DEST" "$PACK_OUT"' EXIT
node "$ROOT/dist/src/cli.js" install "$ROOT/fixtures/valid-pack" --target agents --dest "$DEST" --json >/tmp/skilldeck-install.json
test -f "$DEST/review-code/SKILL.md"
node "$ROOT/dist/src/cli.js" pack "$ROOT/docs" --name smoke-docs --out "$PACK_OUT" --json >/tmp/skilldeck-pack.json
test -f "$PACK_OUT/smoke-docs/SKILL.md"
mkdir -p "$DEST/out" "$DEST/sentinel"
printf 'keep\n' >"$DEST/sentinel/keep.txt"
if node "$ROOT/dist/src/cli.js" pack "$ROOT/docs" --name ../sentinel --out "$DEST/out" --force 2>"$DEST/pack-error.txt"; then
  echo "unsafe pack name unexpectedly succeeded" >&2
  exit 1
fi
grep -F "Invalid skill name '../sentinel'" "$DEST/pack-error.txt" >/dev/null
test "$(cat "$DEST/sentinel/keep.txt")" = keep
test ! -e "$DEST/sentinel/SKILL.md"
echo "skilldeck smoke ok"
