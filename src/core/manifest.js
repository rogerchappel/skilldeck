import { createHash } from 'node:crypto';
import path from 'node:path';
import { listFiles, readText } from '../utils/fs.js';
import { readSkillMetadata } from './metadata.js';

export async function buildManifest(skillDir) {
  const metadata = await readSkillMetadata(skillDir);
  const files = [];
  for (const relative of await listFiles(skillDir)) {
    const content = await readText(path.join(skillDir, relative));
    files.push({
      path: relative,
      bytes: Buffer.byteLength(content),
      sha256: createHash('sha256').update(content).digest('hex')
    });
  }
  return {
    schema: 'https://skilldeck.dev/schemas/manifest-v1.json',
    skilldeckVersion: '0.1.0',
    metadata,
    files
  };
}
