import { promises as fs } from "node:fs";
import path from "node:path";

export async function createSkillFromDocs(options: { docsDir: string; outDir: string; name: string; description?: string; force?: boolean }): Promise<string> {
  const docsDir = path.resolve(options.docsDir);
  const outDir = path.resolve(options.outDir, options.name);
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
  const skill = `---\nname: ${options.name}\ndescription: ${description}\nversion: 0.1.0\ntargets: [codex, claude, openclaw, agents]\ntags: [generated]\n---\n\n# ${options.name}\n\nUse these local project instructions when assisting in this repository.\n\n${sections.join("\n")}`;
  await fs.writeFile(path.join(outDir, "SKILL.md"), skill, "utf8");
  return outDir;
}

async function exists(file: string): Promise<boolean> {
  try { await fs.access(file); return true; } catch { return false; }
}
