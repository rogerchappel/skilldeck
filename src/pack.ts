import { promises as fs } from "node:fs";
import path from "node:path";
import { canonicalPath, pathsOverlap } from "./paths.js";
import { isValidSkillName, SKILL_NAME_CONSTRAINT } from "./skill-name.js";

export async function createSkillFromDocs(options: { docsDir: string; outDir: string; name: string; description?: string; force?: boolean }): Promise<string> {
  if (!isValidSkillName(options.name)) {
    throw new Error(`Invalid skill name '${options.name}': expected ${SKILL_NAME_CONSTRAINT}.`);
  }

  const docsDir = path.resolve(options.docsDir);
  const outputRoot = path.resolve(options.outDir);
  const outDir = path.resolve(outputRoot, options.name);
  const relativeDestination = path.relative(outputRoot, outDir);
  if (!relativeDestination || relativeDestination === ".." || relativeDestination.startsWith(`..${path.sep}`) || path.isAbsolute(relativeDestination)) {
    throw new Error(`Refusing to create skill outside the output directory: ${outDir}`);
  }

  const sourcePath = await canonicalPath(docsDir);
  const destinationPath = await canonicalPath(outDir);
  if (pathsOverlap(sourcePath, destinationPath)) {
    throw new Error(`Refusing to create skill: source and destination overlap (${docsDir}, ${outDir}).`);
  }

  if (!options.force && await exists(outDir)) throw new Error(`Refusing to overwrite existing output: ${outDir}`);
  if (options.force === true) await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });
  const files = (await fs.readdir(docsDir, { withFileTypes: true })).filter((entry) => entry.isFile() && /\.(md|txt)$/i.test(entry.name)).sort((a, b) => a.name.localeCompare(b.name));
  const sections: string[] = [];
  for (const file of files) {
    const content = await fs.readFile(path.join(docsDir, file.name), "utf8");
    sections.push(`## ${file.name}\n\n${content.trim()}\n`);
  }
  const description = options.description ?? `Skill generated from ${files.length} local documentation files.`;
  const skill = `---\nname: ${options.name}\ndescription: ${description}\nversion: 0.1.0\ntargets: [codex, claude, openclaw, agents]\ntags: [generated]\nactivation: [answer questions using these project docs, follow this project's documented conventions]\nsideEffects: [read-only use of local documentation]\napprovalRequired: [commands that modify files, network access not explicitly requested]\n---\n\n# ${options.name}\n\nUse these local project instructions when assisting in this repository.\n\n## When To Use\n\nUse this skill when a request depends on the project-specific documentation collected below.\n\n## Inputs\n\n- The user's request and relevant repository context.\n- The local documentation embedded in this skill.\n\n## Side Effects\n\nReading and applying this documentation is read-only. Treat any command or workflow described by the source material according to its own side effects.\n\n## Approval\n\nAsk before modifying files or using network access unless the user has already requested that action.\n\n## Examples\n\n- Answer a project question using the documented conventions.\n- Check an implementation plan against the local project guidance.\n\n## Validation\n\nConfirm recommendations against the embedded documentation and report when the source material does not cover the request.\n\n## Project Documentation\n\n${sections.join("\n")}`;
  await fs.writeFile(path.join(outDir, "SKILL.md"), skill, "utf8");
  return outDir;
}

async function exists(file: string): Promise<boolean> {
  try { await fs.access(file); return true; } catch { return false; }
}
