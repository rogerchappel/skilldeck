import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { copyTree, pathExists } from '../utils/fs.js';
import { resolveInside } from '../utils/path.js';
import { readSkillMetadata } from './metadata.js';
import { readPack } from './pack.js';
import { validateSkill } from './validation.js';

export async function installSkill(source, targetDir, { force = false, name = undefined, strict = false } = {}) {
  const sourcePath = path.resolve(source);
  const targetRoot = path.resolve(targetDir);
  if (sourcePath === targetRoot || targetRoot.startsWith(sourcePath + path.sep)) {
    throw new Error('Refusing to install into the source directory or one of its children');
  }
  if (source.endsWith('.skillpack') || source.endsWith('.json')) {
    return installPack(sourcePath, targetRoot, { force, name });
  }
  const validation = await validateSkill(sourcePath, { strict });
  if (!validation.ok) throw new Error(`Cannot install invalid skill: ${validation.issues.map((issue) => issue.message).join('; ')}`);
  const metadata = await readSkillMetadata(sourcePath);
  const installName = name ?? metadata.name;
  const destination = resolveInside(targetRoot, installName);
  if (!force && await pathExists(destination)) throw new Error(`Refusing to overwrite existing install: ${destination}`);
  const files = await copyTree(sourcePath, destination, { force });
  return { source: sourcePath, destination, metadata, files };
}

async function installPack(packFile, targetRoot, { force, name }) {
  const pack = await readPack(packFile);
  const metadata = pack.manifest.metadata;
  const installName = name ?? metadata.name;
  const destination = resolveInside(targetRoot, installName);
  if (!force && await pathExists(destination)) throw new Error(`Refusing to overwrite existing install: ${destination}`);
  const files = [];
  for (const file of pack.files) {
    const out = resolveInside(destination, file.path);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, Buffer.from(file.content, file.encoding));
    files.push(file.path);
  }
  return { source: packFile, destination, metadata, files };
}
