import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSkillMarkdown } from '../src/core/metadata.js';

test('parses frontmatter metadata and normalizes arrays', () => {
  const metadata = parseSkillMarkdown(`---\nname: My Skill\ndescription: Does useful work for agents\nversion: 1.0.0\ntargets: [OpenClaw, codex]\n---\n# My Skill\n\nBody`);
  assert.equal(metadata.name, 'my-skill');
  assert.deepEqual(metadata.targets, ['openclaw', 'codex']);
  assert.equal(metadata.version, '1.0.0');
});

test('falls back to heading and paragraph', () => {
  const metadata = parseSkillMarkdown('# Review Bot\n\nReviews changes carefully.');
  assert.equal(metadata.name, 'review-bot');
  assert.equal(metadata.description, 'Reviews changes carefully.');
});
