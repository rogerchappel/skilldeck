import os from "node:os";
import path from "node:path";
import type { AgentTarget } from "./types.js";

export const targetDescriptions: Record<AgentTarget, string> = {
  codex: "OpenAI Codex CLI skill directory",
  claude: "Claude Code skill directory",
  openclaw: "OpenClaw skill directory",
  agents: "Repository-local AGENTS skill deck"
};

export function defaultTargetDir(target: AgentTarget, cwd = process.cwd()): string {
  const home = os.homedir();
  switch (target) {
    case "codex": return path.join(home, ".codex", "skills");
    case "claude": return path.join(home, ".claude", "skills");
    case "openclaw": return path.join(home, ".openclaw", "skills");
    case "agents": return path.join(cwd, ".agents", "skills");
  }
}

export function parseTarget(value: string): AgentTarget {
  if (["codex", "claude", "openclaw", "agents"].includes(value)) return value as AgentTarget;
  throw new Error(`Unsupported target '${value}'. Use codex, claude, openclaw, or agents.`);
}
