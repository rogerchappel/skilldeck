import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSkill } from '../src/core/validation.js';

test('valid fixture passes strict validation', async () => {
  const result = await validateSkill('test/fixtures/valid-skill', { strict: true });
  assert.equal(result.ok, true);
  assert.equal(result.metadata.name, 'commit-helper');
  assert.ok(result.files.includes('SKILL.md'));
});

test('invalid fixture fails validation', async () => {
  const result = await validateSkill('test/fixtures/invalid-skill', { strict: true });
  assert.equal(result.ok, false);
  assert.equal(result.issues[0].code, 'MISSING_SKILL_MD');
});
