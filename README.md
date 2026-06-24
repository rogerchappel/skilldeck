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

Strict validation requires each `SKILL.md` to include sections for when to use the skill, required inputs, side-effect boundaries, approval requirements, examples, and validation.

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

For portable skills, use clear headings such as `## When To Use`, `## Inputs`, `## Side Effects`, `## Approval`, `## Examples`, and `## Validation`. These headings make review and installation safer across agent hosts.

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
npm run package:smoke
npm run release:check
bash scripts/validate.sh
```

`npm run release:check` is the release-readiness gate for maintainers. It runs
type checking, tests, the CLI smoke script, and a dry-run npm package review.

## License

MIT
