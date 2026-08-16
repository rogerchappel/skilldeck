# skilldeck

`skilldeck` is a local-first skill pack manager for reusable agent instructions. It validates `SKILL.md` folders, installs selected skills into supported local agent directories, generates compatibility reports, and can create a starter skill from repository docs.

It does **not** call remote services, execute skill content, publish packages, or read credentials.

## Install

Until the first npm release is published, install from a source checkout:

```sh
git clone https://github.com/rogerchappel/skilldeck.git
cd skilldeck
npm ci
npm run build
npm install -g .
```

After a tagged release is published to npm, the global install is:

```sh
npm install -g skilldeck
```

## Quickstart

Validate a pack:

```sh
skilldeck validate ./fixtures/valid-pack --strict
```

Strict validation requires each `SKILL.md` to include sections for when to use the skill, required inputs, side-effect boundaries, approval requirements, examples, and validation. It also requires portable frontmatter for `activation`, `sideEffects`, and `approvalRequired` so agents can route and review skills before installation.

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
skilldeck validate ./skills/project-docs --strict
```

Skill names must contain 2–63 lowercase letters, numbers, or hyphens and start
with a letter or number. `pack` creates that named directory directly beneath
`--out`; path separators, dot segments, absolute paths, and encoded traversal
strings are rejected before any output is changed. Use `--force` only to
replace an existing validly named skill inside `--out`. The docs directory and
generated skill directory must not be equal or contain one another, including
when symbolic links resolve them to overlapping locations.

Generated skills include portable activation, side-effect, and approval
metadata plus the operational sections required by strict validation. The
embedded documentation is sorted by filename, so identical inputs produce
identical `SKILL.md` output.

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
activation: [review this pull request, audit this code change]
sideEffects: [read-only repository inspection]
approvalRequired: [network commands, branch pushes]
---

# Review Code

Instructions go here.
```

Frontmatter delimiters and content may use either LF or CRLF line endings.

For portable skills, use clear headings such as `## When To Use`, `## Inputs`, `## Side Effects`, `## Approval`, `## Examples`, and `## Validation`. These headings make review and installation safer across agent hosts. Keep activation phrases specific enough to match user intent, and list any side effects or approvals in both frontmatter and body text.

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
- Pack output is confined to a validly named child directory beneath `--out`.
- Pack refuses overlapping source and destination paths before changing output, even with `--force`.
- Existing skills are skipped unless `--force` is supplied.
- Install refuses source and destination paths that overlap, even with `--force`, so an overwrite cannot erase or recursively copy its source.
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
type checking, tests, the CLI smoke script, then packs the exact npm tarball,
installs it into an isolated prefix, and runs `skilldeck --help` plus strict
fixture validation. Tagged releases publish that checked package to npm before
creating the matching GitHub release; the workflow performs no publication on
branches or pull requests.

## License

MIT
