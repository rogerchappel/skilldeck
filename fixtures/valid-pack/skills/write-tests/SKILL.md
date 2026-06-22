---
name: write-tests
description: Generate focused tests for deterministic local software changes.
version: 0.1.0
targets: [codex, openclaw, agents]
tags: [testing]
---

# Write Tests

## When To Use

Use this skill when a user asks for new tests, bug reproduction coverage, or fixture-backed regression checks.

## Inputs

Use the target source file, existing test style, package scripts, and fixture data already present in the repo.

## Side Effects

Limit edits to tests, fixtures, and tiny support helpers unless the user asks for implementation changes.

## Approval

Ask before installing dependencies, changing snapshots broadly, or running commands that write outside the repository.

## Examples

- Add regression tests for this parser bug.
- Cover the CLI error path with fixtures.

## Validation

Add fixtures first, cover edge cases, and keep tests runnable offline. Run the narrow test command before wider validation.
Verify by running the affected test command and recording the result.
