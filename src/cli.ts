#!/usr/bin/env node
import { createSkillFromDocs, createCompatibilityReport, installSkillPack, validateSkillPack } from "./index.js";

interface Parsed { command?: string; args: string[]; flags: Record<string, string | boolean>; }

async function main(argv: string[]): Promise<number> {
  try {
    const parsed = parse(argv);
    if (!parsed.command || parsed.command === "--help" || parsed.command === "-h" || parsed.flags.help || parsed.flags.h) { printHelp(); return 0; }
    switch (parsed.command) {
      case "validate": {
        const root = parsed.args[0] ?? ".";
        const result = await validateSkillPack(root, { strict: Boolean(parsed.flags.strict) });
        print(result, parsed.flags.json === true);
        return result.ok ? 0 : 1;
      }
      case "report": {
        const root = parsed.args[0] ?? ".";
        const report = await createCompatibilityReport(root);
        print(report, parsed.flags.json === true);
        return report.ok ? 0 : 1;
      }
      case "install": {
        const root = parsed.args[0] ?? ".";
        const target = String(parsed.flags.target ?? "agents");
        const result = await installSkillPack(root, { target, destination: stringFlag(parsed.flags.dest), dryRun: Boolean(parsed.flags["dry-run"]), force: Boolean(parsed.flags.force), strict: Boolean(parsed.flags.strict) });
        print(result, parsed.flags.json === true);
        return result.ok ? 0 : 1;
      }
      case "pack": {
        const docsDir = parsed.args[0] ?? "docs";
        const name = String(parsed.flags.name ?? "project-skill");
        const outDir = String(parsed.flags.out ?? "skills");
        const created = await createSkillFromDocs({ docsDir, outDir, name, description: stringFlag(parsed.flags.description), force: Boolean(parsed.flags.force) });
        print({ ok: true, created }, parsed.flags.json === true);
        return 0;
      }
      default:
        throw new Error(`Unknown command '${parsed.command}'.`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

function parse(argv: string[]): Parsed {
  const [command, ...rest] = argv;
  const optionSets: Record<string, { boolean: string[]; value: string[] }> = {
    validate: { boolean: ["help", "json", "strict"], value: [] },
    report: { boolean: ["help", "json"], value: [] },
    install: { boolean: ["help", "json", "strict", "dry-run", "force"], value: ["target", "dest"] },
    pack: { boolean: ["help", "json", "force"], value: ["name", "out", "description"] },
  };
  const options = optionSets[command ?? ""];
  const booleanOptions = new Set(options?.boolean ?? ["help"]);
  const valueOptions = new Set(options?.value ?? []);
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      if (booleanOptions.has(key)) flags[key] = true;
      else if (valueOptions.has(key)) {
        const next = rest[i + 1];
        if (!next || next.startsWith("-")) throw new Error(`Option '--${key}' requires a value.`);
        flags[key] = next;
        i += 1;
      } else throw new Error(`Unknown option '--${key}'.`);
    } else if (token === "-h") flags.h = true;
    else if (token.startsWith("-") && token.length > 1) throw new Error(`Unknown option '${token}'.`);
    else args.push(token);
  }
  return { command, args, flags };
}

function stringFlag(value: string | boolean | undefined): string | undefined { return typeof value === "string" ? value : undefined; }

function print(value: unknown, json: boolean): void {
  if (json) console.log(JSON.stringify(value, null, 2));
  else console.log(human(value));
}

function human(value: unknown): string {
  if (typeof value === "object" && value && "ok" in value) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function printHelp(): void {
  console.log(`skilldeck - local-first skill pack manager\n\nUsage:\n  skilldeck validate [path] [--strict] [--json]\n  skilldeck report [path] [--json]\n  skilldeck install [path] --target <codex|claude|openclaw|agents> [--dest DIR] [--dry-run] [--force]\n  skilldeck pack [docsDir] --name <skill-name> [--out skills] [--description text] [--force]\n\nSkill names must be 2-63 lowercase letters, numbers, or hyphens and start with a letter or number. Pack always creates the skill as a child of --out. The docs and generated skill directories must not overlap.\n\nNo command performs network access. Install writes only to the selected local destination.`);
}

main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
