# skilldeck

Local-first skill pack manager and verifier for agent instructions across OpenClaw, Claude/Claude Code, Codex, and repo-local `AGENTS.md` workflows.

`skilldeck` treats skills as ordinary folders with a `SKILL.md` entrypoint. It validates them, packages them into inspectable local `.skillpack` files, installs them only into explicit target directories, and reports compatibility with common agent setups.

## Install

```bash
npm install -g skilldeck
```

During local development:

```bash
node src/cli.js --help
```

## Quickstart

```bash
# Validate a skill folder
skilldeck validate ./my-skill --strict

# Generate a compatibility report
skilldeck compat ./my-skill --target openclaw --json

# Package a transparent local pack
skilldeck pack ./my-skill --out ./my-skill.skillpack --strict

# Install into an explicit directory (never guessed)
skilldeck install ./my-skill.skillpack --target-dir ~/.openclaw/workspace/agents/havoc/skills
```

## Skill folder shape

```text
my-skill/
  SKILL.md
  actions/checklist.md
```

Example `SKILL.md`:

```markdown
---
name: commit-helper
description: Helps agents make small verifiable git commits.
version: 1.0.0
targets: [openclaw, claude, codex]
---
# Commit Helper

Use this skill when splitting changes into meaningful commits.

## Steps

1. Inspect the diff.
2. Stage one intent at a time.
3. Run the smallest useful verification.
```

## Commands

- `validate <skill-dir> [--strict] [--json]`
- `manifest <skill-dir> [--strict] [--json]`
- `pack <skill-dir> --out <file.skillpack> [--strict] [--force] [--json]`
- `install <skill-dir|pack.skillpack> --target-dir <dir> [--name <name>] [--strict] [--force] [--json]`
- `compat <skill-dir> [--target openclaw|claude|codex|agents-md] [--strict] [--json]`

## Safety model

- No runtime network calls.
- No marketplace, publish, or remote execution behavior.
- No implicit install destinations; `--target-dir` is required.
- No overwrite unless `--force` is explicit.
- Path traversal is rejected during installs.
- Packs are JSON and can be inspected before install.

## Verification

```bash
npm test
npm run build
npm run check
npm run smoke
bash scripts/validate.sh
```

## License

MIT
