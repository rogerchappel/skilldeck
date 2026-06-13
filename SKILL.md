---
name: skilldeck
description: Validate, report on, pack, and locally install reusable agent skill folders.
version: 0.1.0
targets: [codex, claude, openclaw, agents]
tags: [skills, installer, compatibility, local-first]
---

# skilldeck

Use this skill when an agent needs to inspect or move existing `SKILL.md` folders between local agent environments.

## Inputs

- A local skill folder containing `SKILL.md`, or a pack with nested `skills/<name>/SKILL.md` entries.
- A target host name: `codex`, `claude`, `openclaw`, or `agents`.
- An explicit destination path when running in CI, tests, or any shared workspace.

## Tools

- `skilldeck validate <path> --strict` validates pack structure and metadata.
- `skilldeck report <path> --json` creates a deterministic compatibility report.
- `skilldeck install <path> --target <target> --dest <dir> --dry-run` previews copied files.
- `skilldeck pack <docsDir> --name <skill-name> --out <dir>` creates a starter skill from local docs.

## Side Effects

`validate`, `report`, and dry-run `install` are read-only. Non-dry-run `install` copies files into the selected local destination. `pack` writes a new local skill directory. No command executes skill content, reads credentials, calls remote services, or publishes packages.

## Approval Boundaries

Ask for explicit approval before installing into a live agent home directory, overwriting an existing skill with `--force`, or using generated skill text as a standing workflow.

## Validation

Run:

```sh
npm run release:check
```

For a sample pack:

```sh
skilldeck validate ./fixtures/valid-pack --strict
skilldeck install ./fixtures/valid-pack --target agents --dest /tmp/skilldeck-demo --dry-run
skilldeck report ./fixtures/valid-pack --json
```

## Example

```sh
skilldeck pack ./docs --name project-docs --out ./skills
skilldeck validate ./skills/project-docs --strict
```
