import { promises as fs } from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import type { Diagnostic, Skill, SkillMetadata, ValidationResult } from "./types.js";

const NAME_RE = /^[a-z0-9][a-z0-9-]{1,62}$/;
const KNOWN_TARGETS = new Set(["codex", "claude", "openclaw", "agents"]);

export async function validateSkillPack(root: string, options: { strict?: boolean } = {}): Promise<ValidationResult> {
  const absoluteRoot = path.resolve(root);
  const diagnostics: Diagnostic[] = [];
  const skillsRoot = await resolveSkillsRoot(absoluteRoot, diagnostics);
  const skills: Skill[] = [];

  if (!skillsRoot) return { ok: false, root: absoluteRoot, skills, diagnostics };
  const entries = await fs.readdir(skillsRoot, { withFileTypes: true });
  for (const entry of entries.filter((item) => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const skillDir = path.join(skillsRoot, entry.name);
    const skillMdPath = path.join(skillDir, "SKILL.md");
    try {
      const markdown = await fs.readFile(skillMdPath, "utf8");
      const parsed = parseFrontmatter(markdown);
      const metadata = normalizeMetadata(parsed.data, entry.name, diagnostics, skillMdPath);
      validateMetadata(metadata, diagnostics, skillMdPath, options.strict === true);
      validateBody(parsed.body, diagnostics, skillMdPath, options.strict === true);
      skills.push({ name: metadata.name, path: skillDir, skillMdPath, metadata, body: parsed.body });
    } catch (error) {
      diagnostics.push({ severity: "error", code: "missing-skill-md", message: `Skill ${entry.name} must contain SKILL.md`, path: skillMdPath });
    }
  }

  if (skills.length === 0) diagnostics.push({ severity: "error", code: "empty-pack", message: "No skill directories were found.", path: skillsRoot });
  const names = new Set<string>();
  for (const skill of skills) {
    if (names.has(skill.name)) diagnostics.push({ severity: "error", code: "duplicate-skill", message: `Duplicate skill name: ${skill.name}`, path: skill.path });
    names.add(skill.name);
  }
  const ok = !diagnostics.some((diag) => diag.severity === "error");
  return { ok, root: absoluteRoot, skills, diagnostics };
}

async function resolveSkillsRoot(root: string, diagnostics: Diagnostic[]): Promise<string | null> {
  const direct = path.join(root, "SKILL.md");
  try {
    await fs.access(direct);
    return path.dirname(direct);
  } catch {}
  const nested = path.join(root, "skills");
  try {
    const stat = await fs.stat(nested);
    if (stat.isDirectory()) return nested;
  } catch {}
  diagnostics.push({ severity: "error", code: "missing-skills-root", message: "Expected SKILL.md or a skills/ directory.", path: root });
  return null;
}

function normalizeMetadata(data: Record<string, unknown>, fallbackName: string, diagnostics: Diagnostic[], file: string): SkillMetadata {
  const name = asString(data.name) || fallbackName;
  const description = asString(data.description) || "";
  return {
    name,
    description,
    version: asString(data.version),
    targets: asStringArray(data.targets),
    tags: asStringArray(data.tags)
  };
}

function validateMetadata(metadata: SkillMetadata, diagnostics: Diagnostic[], file: string, strict: boolean): void {
  if (!NAME_RE.test(metadata.name)) diagnostics.push({ severity: "error", code: "invalid-name", message: `Invalid skill name: ${metadata.name}`, path: file });
  if (!metadata.description || metadata.description.length < 12) diagnostics.push({ severity: "error", code: "missing-description", message: "Skill description must be at least 12 characters.", path: file });
  if (strict && !metadata.version) diagnostics.push({ severity: "error", code: "missing-version", message: "Strict mode requires version metadata.", path: file });
  for (const target of metadata.targets ?? []) {
    if (!KNOWN_TARGETS.has(target)) diagnostics.push({ severity: "warning", code: "unknown-target", message: `Unknown target: ${target}`, path: file });
  }
}

function validateBody(body: string, diagnostics: Diagnostic[], file: string, strict: boolean): void {
  if (!body.trim()) {
    diagnostics.push({ severity: "error", code: "missing-body", message: "SKILL.md must include instructions after frontmatter.", path: file });
    return;
  }
  if (!strict) return;
  const requiredSections = [
    { code: "missing-when-to-use", pattern: /(^|\n)#{1,3}\s*(when to use|use this skill|trigger)/i, label: "when to use" },
    { code: "missing-inputs", pattern: /(^|\n)#{1,3}\s*(inputs|required inputs|requirements)/i, label: "inputs" },
    { code: "missing-side-effects", pattern: /(^|\n)#{1,3}\s*(side effects|side-effect boundaries|safety)/i, label: "side-effect boundaries" },
    { code: "missing-approval", pattern: /(^|\n)#{1,3}\s*(approval|approvals|consent)/i, label: "approval requirements" },
    { code: "missing-examples", pattern: /(^|\n)#{1,3}\s*(examples|example prompts)/i, label: "examples" },
    { code: "missing-validation", pattern: /(^|\n)#{1,3}\s*(validation|verification|verify)/i, label: "validation" }
  ];
  for (const section of requiredSections) {
    if (!section.pattern.test(body)) diagnostics.push({ severity: "error", code: section.code, message: `Strict mode requires a ${section.label} section.`, path: file });
  }
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}
