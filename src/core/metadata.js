import path from 'node:path';
import { readText } from '../utils/fs.js';

const FRONTMATTER = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

export function parseSkillMarkdown(markdown, fallbackName = undefined) {
  const frontmatter = markdown.match(FRONTMATTER);
  const body = frontmatter ? markdown.slice(frontmatter[0].length) : markdown;
  const data = frontmatter ? parseTinyYaml(frontmatter[1]) : {};
  const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const firstParagraph = body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .find((part) => part && !part.startsWith('#'));

  return normalizeMetadata({
    name: data.name ?? fallbackName ?? slugify(heading ?? 'skill'),
    title: data.title ?? heading,
    description: data.description ?? stripMarkdown(firstParagraph ?? ''),
    version: data.version ?? '0.1.0',
    targets: data.targets ?? data.compatibility ?? [],
    license: data.license,
    tags: data.tags ?? [],
    entry: data.entry ?? 'SKILL.md'
  });
}

export async function readSkillMetadata(skillDir) {
  const markdown = await readText(path.join(skillDir, 'SKILL.md'));
  return parseSkillMarkdown(markdown, path.basename(skillDir));
}

export function parseTinyYaml(source) {
  const result = {};
  let activeKey = null;
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && activeKey) {
      result[activeKey] = [...asArray(result[activeKey]), coerceScalar(listItem[1])];
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    activeKey = pair[1];
    const value = pair[2];
    result[activeKey] = value === '' ? [] : parseInlineValue(value);
  }
  return result;
}

export function normalizeMetadata(input) {
  return {
    name: slugify(String(input.name ?? 'skill')),
    title: input.title ? String(input.title) : undefined,
    description: String(input.description ?? '').trim(),
    version: String(input.version ?? '0.1.0'),
    targets: asArray(input.targets).map((value) => String(value).toLowerCase()),
    license: input.license ? String(input.license) : undefined,
    tags: asArray(input.tags).map((value) => String(value).toLowerCase()),
    entry: String(input.entry ?? 'SKILL.md')
  };
}

function parseInlineValue(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed.slice(1, -1).split(',').map((item) => coerceScalar(item)).filter(Boolean);
  }
  return coerceScalar(trimmed);
}

function coerceScalar(value) {
  return String(value).trim().replace(/^['"]|['"]$/g, '');
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return [];
  return [value];
}

export function slugify(value) {
  return String(value).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'skill';
}

function stripMarkdown(value) {
  return value.replace(/[`*_>#-]/g, '').trim();
}
