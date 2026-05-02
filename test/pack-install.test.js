import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { packSkill } from '../src/core/pack.js';
import { installSkill } from '../src/core/install.js';

test('packs and installs a skill pack', async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'skilldeck-'));
  try {
    const packFile = path.join(temp, 'commit-helper.skillpack');
    const packed = await packSkill('test/fixtures/valid-skill', packFile, { strict: true });
    assert.equal(packed.fileCount, 2);
    const installed = await installSkill(packFile, path.join(temp, 'target'));
    assert.equal(installed.metadata.name, 'commit-helper');
    const skillMd = await readFile(path.join(installed.destination, 'SKILL.md'), 'utf8');
    assert.match(skillMd, /Commit Helper/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
