# Orchestration

This repository was built by an agent in an isolated working directory under `/Users/roger/Developer/my-opensource/.worktrees/skilldeck-main`.

## Guardrails

- Stay local-first: no network calls in runtime CLI commands.
- Never infer install destinations; users must pass `--target-dir`.
- Refuse overwrites unless `--force` is explicit.
- Keep pack files transparent JSON so users and agents can inspect them.
- Validate before pack/install operations.

## Verification flow

1. `npm test`
2. `npm run build`
3. `npm run check`
4. `npm run smoke`
5. `bash scripts/validate.sh`
6. Manual CLI smoke with fixture data

## Release flow

1. Keep `main` green locally.
2. Push directly to `rogerchappel/skilldeck` for the initial public release.
3. Set repository description and topics with `gh`.
