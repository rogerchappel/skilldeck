import path from 'node:path';
import { stat } from 'node:fs/promises';
import { listFiles, pathExists, readText } from '../utils/fs.js';
import { isUnsafeRelativePath } from '../utils/path.js';
import { readSkillMetadata } from './metadata.js';

const KNOWN_TARGETS = new Set(['openclaw', 'claude', 'claude-code', 'codex', 'agents-md', 'generic']);

export async function validateSkill(skillDir, { strict = false } = {}) {
  const issues = [];
  const root = path.resolve(skillDir);

  if (!await pathExists(root)) {
    return result(false, [{ level: 'error', code: 'MISSING_DIR', message: `Skill directory does not exist: ${root}` }]);
  }
  if (!(await stat(root)).isDirectory()) {
    return result(false, [{ level: 'error', code: 'NOT_DIRECTORY', message: `Skill path is not a directory: ${root}` }]);
  }

  const skillMd = path.join(root, 'SKILL.md');
  if (!await pathExists(skillMd)) {
    issues.push(error('MISSING_SKILL_MD', 'Skill folder must contain SKILL.md'));
    return result(false, issues);
  }

  const markdown = await readText(skillMd);
  const metadata = await readSkillMetadata(root);
  if (!metadata.name) issues.push(error('MISSING_NAME', 'Skill metadata must include a name or heading'));
  if (!metadata.description || metadata.description.length < 12) {
    issues.push(error('MISSING_DESCRIPTION', 'Skill metadata must include a useful description'));
  }
  if (!/^\d+\.\d+\.\d+(-[A-Za-z0-9.-]+)?$/.test(metadata.version)) {
    issues.push(error('BAD_VERSION', `Version must be semver-like, got ${metadata.version}`));
  }
  if (!markdown.includes('##') && strict) {
    issues.push(warn('NO_SECTIONS', 'Strict mode expects SKILL.md to contain at least one section heading'));
  }
  for (const target of metadata.targets) {
    if (!KNOWN_TARGETS.has(target)) issues.push(warn('UNKNOWN_TARGET', `Unknown target declared: ${target}`));
  }

  const files = await listFiles(root);
  if (files.length === 0) issues.push(error('EMPTY_SKILL', 'Skill folder contains no files'));
  for (const file of files) {
    if (isUnsafeRelativePath(file)) issues.push(error('UNSAFE_PATH', `Unsafe relative path: ${file}`));
    if (file.toLowerCase().includes('secret') || file.endsWith('.pem') || file.endsWith('.key')) {
      issues.push(strict ? error('SENSITIVE_FILE', `Sensitive-looking file is not allowed in strict mode: ${file}`) : warn('SENSITIVE_FILE', `Sensitive-looking file detected: ${file}`));
    }
  }

  const ok = !issues.some((issue) => issue.level === 'error');
  return { ok, issues, metadata, files };
}

export function result(ok, issues) {
  return { ok, issues, metadata: undefined, files: [] };
}

export function error(code, message) {
  return { level: 'error', code, message };
}

export function warn(code, message) {
  return { level: 'warning', code, message };
}
