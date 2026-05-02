# AGENTS.md Integration

For agents that read repo-local instructions, install skills into the repository and reference them from `AGENTS.md`:

```bash
skilldeck install ./commit-helper.skillpack --target-dir ./.skilldeck
```

Then add a short instruction:

```markdown
## Skills

- Commit helper: read `.skilldeck/commit-helper/SKILL.md` before splitting commits.
```

This keeps reusable behavior versioned with the project without requiring global agent configuration.
