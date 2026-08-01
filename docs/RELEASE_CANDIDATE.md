# Release Candidate Notes

## Candidate

- Package: `skilldeck@0.1.0`
- Branch: `release-candidate/skilldeck`
- Classification: ship

## Included

- Local validation for single-skill folders and nested skill packs.
- Compatibility reports for Codex, Claude, OpenClaw, and repo-local `.agents` destinations.
- Strict activation, side-effect, and approval metadata checks for portable skill review.
- Copy-only installer with dry-run and destination override support.
- Documentation-to-skill pack generation for local docs.
- Public fixture pack for README examples and CLI smoke usage.

## Verification

```sh
npm install
npm run release:check
```

Expected result: TypeScript check, tests, smoke script, and an isolated install
of the produced package tarball all pass. The installed `skilldeck` executable
must print help and strictly validate the fixture pack.

## Limits

- No remote registry or marketplace integration.
- No skill execution.
- No network access in default commands.
- Existing destination entries require `--force` to overwrite.

## Release Gate

Before tagging, verify an install dry run against each documented target and
review the package contents from `npm run package:smoke`. A matching version
tag runs the release workflow, which publishes the public package to npm with
provenance before creating the GitHub release. Pull requests do not publish.
