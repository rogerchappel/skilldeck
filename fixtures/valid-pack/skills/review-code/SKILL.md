---
name: review-code
description: Review code changes for correctness, safety, maintainability, and test coverage.
version: 0.1.0
targets: [codex, claude, openclaw, agents]
tags: [review, quality]
---

# Review Code

Use this skill when a user asks for a code review, release-readiness pass, or focused risk audit.

Start with findings ordered by severity. Ground each finding in a file and line when possible. Include missing tests or residual risk after the findings.

Do not rewrite unrelated code during a review unless the user explicitly asks for implementation work.
