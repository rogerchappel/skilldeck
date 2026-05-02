import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

test('cli validate returns json for a valid fixture', async () => {
  const { stdout } = await run(process.execPath, ['src/cli.js', 'validate', 'test/fixtures/valid-skill', '--strict', '--json']);
  const parsed = JSON.parse(stdout);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.metadata.name, 'commit-helper');
});
