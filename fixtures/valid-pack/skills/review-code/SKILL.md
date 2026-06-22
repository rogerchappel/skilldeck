---
name: review-code
description: Review code changes for correctness, safety, maintainability, and test coverage.
version: 0.1.0
targets: [codex, claude, openclaw, agents]
tags: [review, quality]
---

# Review Code

## When To Use

Use this skill when a user asks for a code review, release-readiness pass, or focused risk audit.

## Inputs

Use the repository diff, relevant tests, and any linked issue or PR context. Prefer local files and command output over memory.

## Side Effects

This skill is read-only by default. Do not rewrite unrelated code during a review unless the user explicitly asks for implementation work.

## Approval

Ask before running expensive, networked, or destructive commands. Do not push branches or change repo state during review-only work.

## Examples

- Review this PR for correctness and missing tests.
- Do a release-readiness pass on this package.

## Validation

Start with findings ordered by severity. Ground each finding in a file and line when possible. Include missing tests or residual risk after the findings.
Validate by checking the referenced diff and confirming every finding has a file path.
