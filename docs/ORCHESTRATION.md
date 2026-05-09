# Orchestration

`skilldeck` is designed for deterministic local agent workflows.

## Principles

1. Validate before install.
2. Prefer dry-run plans for automation.
3. Keep generated output stable for diff review.
4. Never fetch or execute remote skill content in the MVP.

## Flow

```text
local skill pack -> validate -> report -> dry-run install -> copy to local target
```

## Agent usage

Agents can safely run:

```sh
skilldeck validate ./skills --strict --json
skilldeck report ./skills --json
skilldeck install ./skills --target agents --dest ./.agents/skills --dry-run --json
```

A human or trusted automation should review the dry-run before writing to shared skill locations.
