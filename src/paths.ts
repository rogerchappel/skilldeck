import { promises as fs } from "node:fs";
import path from "node:path";

export async function canonicalPath(file: string): Promise<string> {
  const resolved = path.resolve(file);
  try { return await fs.realpath(resolved); } catch {
    const parent = path.dirname(resolved);
    if (parent === resolved) return resolved;
    return path.join(await canonicalPath(parent), path.basename(resolved));
  }
}

export function pathsOverlap(left: string, right: string): boolean {
  return contains(left, right) || contains(right, left);
}

function contains(parent: string, child: string): boolean {
  const relative = path.relative(parent, child);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}
