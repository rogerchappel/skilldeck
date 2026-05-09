import { validateSkillPack } from "./validator.js";
import type { AgentTarget, CompatibilityReport } from "./types.js";

const targets: AgentTarget[] = ["codex", "claude", "openclaw", "agents"];

export async function createCompatibilityReport(root: string): Promise<CompatibilityReport> {
  const validation = await validateSkillPack(root, { strict: false });
  const result: CompatibilityReport["targets"] = {
    codex: { supported: [], warnings: [] },
    claude: { supported: [], warnings: [] },
    openclaw: { supported: [], warnings: [] },
    agents: { supported: [], warnings: [] }
  };
  for (const skill of validation.skills) {
    for (const target of targets) {
      if (!skill.metadata.targets || skill.metadata.targets.length === 0 || skill.metadata.targets.includes(target)) result[target].supported.push(skill.name);
      else result[target].warnings.push(`${skill.name} does not declare ${target} support`);
    }
  }
  return {
    ok: validation.ok,
    generatedAt: new Date(0).toISOString(),
    root: validation.root,
    skillCount: validation.skills.length,
    targets: result,
    diagnostics: validation.diagnostics
  };
}
