import test from 'node:test';
import assert from 'node:assert/strict';
import { compatibilityReport } from '../src/core/compatibility.js';
import { validateSkill } from '../src/core/validation.js';

test('reports compatibility for requested target', async () => {
  const validation = await validateSkill('test/fixtures/valid-skill');
  const report = compatibilityReport(validation, { target: 'openclaw' });
  assert.equal(report.ok, true);
  assert.equal(report.targets.length, 1);
  assert.equal(report.targets[0].target, 'openclaw');
});
