# skilldeck

`skilldeck` is a local-first skill pack manager for reusable agent instructions. It validates `SKILL.md` folders, installs selected skills into supported local agent directories, generates compatibility reports, and can create a starter skill from repository docs.

It does **not** call remote services, execute skill content, publish packages, or read credentials.

## Install

```sh
npm install -g skilldeck
```

For local development:

```sh
npm install
npm run build
node dist/src/cli.js --help
```

## Quickstart

Validate a pack:

```sh
skilldeck validate ./fixtures/valid-pack --strict
```

Preview an install:

```sh
skilldeck install ./fixtures/valid-pack --target agents --dest ./.agents/skills --dry-run
```

Install locally:

```sh
skilldeck install ./fixtures/valid-pack --target agents --dest ./.agents/skills
```

Generate a compatibility report:

```sh
skilldeck report ./fixtures/valid-pack --json
```

Create a skill from local docs:

```sh
skilldeck pack ./docs --name project-docs --out ./skills
```

## Skill layout

A pack is either a single skill folder with `SKILL.md`, or a pack with nested skills:

```text
my-pack/
  skills/
    review-code/
      SKILL.md
    write-tests/
      SKILL.md
```

`SKILL.md` uses simple YAML-like frontmatter:

```md
---
name: review-code
description: Review code changes for correctness, safety, and maintainability.
version: 0.1.0
targets: [codex, claude, openclaw, agents]
tags: [review]
---

# Review Code

Instructions go here.
```

## Supported targets

- `codex` → `~/.codex/skills`
- `claude` → `~/.claude/skills`
- `openclaw` → `~/.openclaw/skills`
- `agents` → `./.agents/skills`

Use `--dest` to override any destination. This is recommended in CI and tests.

## Safety model

- Local-first and deterministic.
- No hidden network access.
- No skill execution.
- Install is copy-only into the chosen destination.
- Existing skills are skipped unless `--force` is supplied.
- Compatibility reports use a fixed timestamp for stable output.

## Verify

```sh
npm run check
npm test
npm run smoke
bash scripts/validate.sh
```

## License

MIT
