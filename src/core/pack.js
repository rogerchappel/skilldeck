import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { buildManifest } from './manifest.js';
import { validateSkill } from './validation.js';
import { listFiles, pathExists } from '../utils/fs.js';

export async function packSkill(skillDir, outFile, { force = false, strict = false } = {}) {
  const validation = await validateSkill(skillDir, { strict });
  if (!validation.ok) {
    const details = validation.issues.map((issue) => `${issue.code}: ${issue.message}`).join('\n');
    throw new Error(`Cannot pack invalid skill:\n${details}`);
  }
  if (!force && await pathExists(outFile)) throw new Error(`Refusing to overwrite existing pack: ${outFile}`);
  const manifest = await buildManifest(skillDir);
  const files = [];
  for (const relative of await listFiles(skillDir)) {
    const bytes = await readFile(path.join(skillDir, relative));
    files.push({ path: relative, encoding: 'base64', content: bytes.toString('base64') });
  }
  const pack = {
    schema: 'https://skilldeck.dev/schemas/pack-v1.json',
    createdBy: 'skilldeck',
    manifest,
    files
  };
  await mkdir(path.dirname(path.resolve(outFile)), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
  return { outFile: path.resolve(outFile), manifest, fileCount: files.length };
}

export async function readPack(packFile) {
  const raw = await readFile(packFile, 'utf8');
  const parsed = JSON.parse(raw);
  if (parsed.schema !== 'https://skilldeck.dev/schemas/pack-v1.json') throw new Error('Unsupported skill pack schema');
  return parsed;
}
