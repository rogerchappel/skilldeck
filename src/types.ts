export type Severity = "error" | "warning" | "info";

export interface SkillMetadata {
  name: string;
  description: string;
  version?: string;
  targets?: string[];
  tags?: string[];
}

export interface Skill {
  name: string;
  path: string;
  skillMdPath: string;
  metadata: SkillMetadata;
  body: string;
}

export interface Diagnostic {
  severity: Severity;
  code: string;
  message: string;
  path?: string;
}

export interface ValidationResult {
  ok: boolean;
  root: string;
  skills: Skill[];
  diagnostics: Diagnostic[];
}

export type AgentTarget = "codex" | "claude" | "openclaw" | "agents";

export interface InstallPlanEntry {
  skill: string;
  source: string;
  destination: string;
  action: "copy" | "overwrite" | "skip";
}

export interface InstallResult {
  ok: boolean;
  target: AgentTarget;
  dryRun: boolean;
  destinationRoot: string;
  entries: InstallPlanEntry[];
  diagnostics: Diagnostic[];
}

export interface CompatibilityReport {
  ok: boolean;
  generatedAt: string;
  root: string;
  skillCount: number;
  targets: Record<AgentTarget, { supported: string[]; warnings: string[] }>;
  diagnostics: Diagnostic[];
}
