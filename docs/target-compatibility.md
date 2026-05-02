# Target Compatibility

`skilldeck compat` scores a skill against common agent targets.

- **OpenClaw**: native folder skill with `SKILL.md`.
- **Claude / Claude Code**: local skill folder, with setup-specific registration handled outside skilldeck.
- **Codex**: repo-local `.skilldeck/<name>` folder referenced from `AGENTS.md`.
- **AGENTS.md**: generic repo instruction workflow.

The command does not write files. It reports whether required files exist, lists validation issues, and suggests an install subdirectory.
