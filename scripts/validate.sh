#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run check
npm test
npm run smoke
npm run package:smoke
if command -v agent-qc >/dev/null 2>&1; then
  agent-qc ready
else
  echo "agent-qc not installed; skipping"
fi
