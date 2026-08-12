import { promises as fs } from "node:fs";
import path from "node:path";
import { defaultTargetDir, parseTarget } from "./targets.js";
import { validateSkillPack } from "./validator.js";
import type { AgentTarget, Diagnostic, InstallPlanEntry, InstallResult } from "./types.js";

export async function installSkillPack(root: string, options: { target: string; destination?: string; dryRun?: boolean; force?: boolean; strict?: boolean }): Promise<InstallResult> {
  const target = parseTarget(options.target);
  const validation = await validateSkillPack(root, { strict: options.strict });
  const diagnostics: Diagnostic[] = [...validation.diagnostics];
  const destinationRoot = path.resolve(options.destination ?? defaultTargetDir(target));
  const entries: InstallPlanEntry[] = [];
  if (!validation.ok) return { ok: false, target, dryRun: options.dryRun === true, destinationRoot, entries, diagnostics };

  for (const skill of validation.skills) {
    const destination = path.join(destinationRoot, skill.name);
    const sourcePath = await canonicalPath(skill.path);
    const destinationPath = await canonicalPath(destination);
    const exists = await pathExists(destination);
    const action = exists ? (options.force ? "overwrite" : "skip") : "copy";
    entries.push({ skill: skill.name, source: skill.path, destination, action });
    if (pathsOverlap(sourcePath, destinationPath)) {
      diagnostics.push({ severity: "error", code: "source-destination-overlap", message: `Refusing to install ${skill.name}: source and destination overlap.`, path: destination });
    }
    if (exists && !options.force) diagnostics.push({ severity: "warning", code: "destination-exists", message: `Skipping existing skill ${skill.name}; use --force to overwrite.`, path: destination });
  }

  if (!options.dryRun && !diagnostics.some((diag) => diag.severity === "error")) {
    await fs.mkdir(destinationRoot, { recursive: true });
    for (const entry of entries) {
      if (entry.action === "skip") continue;
      if (entry.action === "overwrite") await fs.rm(entry.destination, { recursive: true, force: true });
      await copyDir(entry.source, entry.destination);
    }
  }
  return { ok: !diagnostics.some((diag) => diag.severity === "error"), target, dryRun: options.dryRun === true, destinationRoot, entries, diagnostics };
}

async function canonicalPath(file: string): Promise<string> {
  const resolved = path.resolve(file);
  try { return await fs.realpath(resolved); } catch {
    const parent = path.dirname(resolved);
    if (parent === resolved) return resolved;
    return path.join(await canonicalPath(parent), path.basename(resolved));
  }
}

function pathsOverlap(left: string, right: string): boolean {
  const relative = path.relative(left, right);
  const reverse = path.relative(right, left);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative)) || (!reverse.startsWith("..") && !path.isAbsolute(reverse));
}

async function pathExists(file: string): Promise<boolean> {
  try { await fs.access(file); return true; } catch { return false; }
}

async function copyDir(source: string, destination: string): Promise<void> {
  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) await copyDir(from, to);
    else if (entry.isFile()) await fs.copyFile(from, to);
  }
}
