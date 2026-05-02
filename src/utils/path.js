import path from 'node:path';
import { SkilldeckError } from '../core/errors.js';

export function resolveInside(baseDir, candidate) {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, candidate);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new SkilldeckError(`Path escapes base directory: ${candidate}`, { code: 'PATH_ESCAPE' });
  }
  return resolved;
}

export function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

export function isUnsafeRelativePath(value) {
  return path.isAbsolute(value) || value.split(/[\\/]+/).includes('..') || value === '';
}
