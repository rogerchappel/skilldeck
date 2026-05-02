#!/usr/bin/env node
import { compatibilityReport, supportedTargets } from './core/compatibility.js';
import { installSkill } from './core/install.js';
import { buildManifest } from './core/manifest.js';
import { packSkill } from './core/pack.js';
import { validateSkill } from './core/validation.js';

const VERSION = '0.1.0';

async function main(argv) {
  const [command, ...rest] = argv;
  if (!command || command === '--help' || command === '-h') return help();
  if (command === '--version' || command === '-v') return console.log(VERSION);

  try {
    if (command === 'validate') return validateCommand(rest);
    if (command === 'manifest') return manifestCommand(rest);
    if (command === 'pack') return packCommand(rest);
    if (command === 'install') return installCommand(rest);
    if (command === 'compat') return compatCommand(rest);
    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

async function validateCommand(args) {
  const options = parseOptions(args);
  const dir = options.positionals[0] ?? process.cwd();
  const validation = await validateSkill(dir, { strict: Boolean(options.flags.strict) });
  print(validation, options);
  if (!validation.ok) process.exitCode = 1;
}

async function manifestCommand(args) {
  const options = parseOptions(args);
  const dir = options.positionals[0] ?? process.cwd();
  const validation = await validateSkill(dir, { strict: Boolean(options.flags.strict) });
  if (!validation.ok) {
    print(validation, options);
    process.exitCode = 1;
    return;
  }
  print(await buildManifest(dir), options);
}

async function packCommand(args) {
  const options = parseOptions(args);
  const dir = options.positionals[0] ?? process.cwd();
  const out = options.values.out ?? `${dir.replace(/[\\/]$/, '')}.skillpack`;
  print(await packSkill(dir, out, { force: Boolean(options.flags.force), strict: Boolean(options.flags.strict) }), options);
}

async function installCommand(args) {
  const options = parseOptions(args);
  const source = options.positionals[0];
  if (!source) throw new Error('install requires a source skill folder or .skillpack');
  const targetDir = options.values['target-dir'];
  if (!targetDir) throw new Error('install requires --target-dir <dir>; skilldeck never guesses install locations');
  print(await installSkill(source, targetDir, { force: Boolean(options.flags.force), name: options.values.name, strict: Boolean(options.flags.strict) }), options);
}

async function compatCommand(args) {
  const options = parseOptions(args);
  const dir = options.positionals[0] ?? process.cwd();
  const target = options.values.target;
  if (target && !supportedTargets().includes(target)) throw new Error(`Unsupported target "${target}". Supported: ${supportedTargets().join(', ')}`);
  const validation = await validateSkill(dir, { strict: Boolean(options.flags.strict) });
  print({ validation, compatibility: compatibilityReport(validation, { target }) }, options);
  if (!validation.ok) process.exitCode = 1;
}

function parseOptions(args) {
  const positionals = [];
  const flags = {};
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }
    const [rawKey, inline] = arg.slice(2).split('=', 2);
    if (['strict', 'force', 'json'].includes(rawKey)) {
      flags[rawKey] = true;
      continue;
    }
    const value = inline ?? args[++index];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${rawKey}`);
    values[rawKey] = value;
  }
  return { positionals, flags, values };
}

function print(data, options) {
  if (options.flags.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  if ('issues' in data) {
    console.log(`${data.ok ? 'ok' : 'failed'}: ${data.metadata?.name ?? 'skill'}`);
    for (const issue of data.issues) console.log(`${issue.level}: ${issue.code}: ${issue.message}`);
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

function help() {
  console.log(`skilldeck ${VERSION}

Local-first skill pack manager. No network access, no implicit install paths.

Commands:
  validate <skill-dir> [--strict] [--json]
  manifest <skill-dir> [--strict] [--json]
  pack <skill-dir> --out <file.skillpack> [--strict] [--force] [--json]
  install <skill-dir|pack.skillpack> --target-dir <dir> [--name <name>] [--strict] [--force] [--json]
  compat <skill-dir> [--target openclaw|claude|codex|agents-md] [--strict] [--json]
`);
}

await main(process.argv.slice(2));
