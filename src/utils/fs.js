import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { resolveInside, toPosixPath } from './path.js';

export async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') return false;
    throw error;
  }
}

export async function readText(filePath) {
  return readFile(filePath, 'utf8');
}

export async function writeText(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');
}

export async function listFiles(rootDir, { ignore = ['.git', 'node_modules', '.DS_Store'] } = {}) {
  const files = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (ignore.includes(entry.name)) continue;
      const absolute = path.join(dir, entry.name);
      const relative = toPosixPath(path.relative(rootDir, absolute));
      if (entry.isDirectory()) {
        await walk(absolute);
      } else if (entry.isFile()) {
        files.push(relative);
      }
    }
  }
  await walk(rootDir);
  return files.sort();
}

export async function copyTree(sourceDir, targetDir, { force = false } = {}) {
  const written = [];
  for (const relative of await listFiles(sourceDir)) {
    const from = resolveInside(sourceDir, relative);
    const to = resolveInside(targetDir, relative);
    if (!force && await pathExists(to)) {
      throw new Error(`Refusing to overwrite existing file: ${to}`);
    }
    await mkdir(path.dirname(to), { recursive: true });
    await copyFile(from, to);
    written.push(relative);
  }
  return written;
}
