# Changelog

## Unreleased

- Verify the packed npm artifact by installing it into an isolated prefix and running the documented CLI, and publish tagged releases to npm with provenance.
- Parse CLI boolean and value-taking options explicitly so flags can safely precede positional paths, with clear errors for missing values and unknown options.
- Accept LF and CRLF line endings in `SKILL.md` frontmatter.
- Reject invalid or escaping `pack` skill names before checking, removing, or writing output.

## 0.1.0

- Initial local-first MVP with validation, install, report, and pack commands.
