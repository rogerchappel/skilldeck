import assert from "node:assert/strict";
import { test } from "node:test";
import path from "node:path";
import { validateSkillPack } from "../src/validator.js";

const valid = path.join(process.cwd(), "fixtures/valid-pack");
const invalid = path.join(process.cwd(), "fixtures/invalid-pack");
const singleSkill = path.join(valid, "skills/review-code");

test("validates a deterministic skill pack", async () => {
  const result = await validateSkillPack(valid, { strict: true });
  assert.equal(result.ok, true);
  assert.deepEqual(result.skills.map((skill) => skill.name), ["review-code", "write-tests"]);
  assert.deepEqual(result.skills.map((skill) => skill.path), [
    path.join(valid, "skills/review-code"),
    path.join(valid, "skills/write-tests")
  ]);
  assert.equal(result.diagnostics.length, 0);
});

test("validates a single skill directory as the skill itself", async () => {
  const result = await validateSkillPack(singleSkill, { strict: true });
  assert.equal(result.ok, true);
  assert.equal(result.root, singleSkill);
  assert.deepEqual(result.skills.map((skill) => ({
    name: skill.name,
    path: skill.path,
    skillMdPath: skill.skillMdPath
  })), [{
    name: "review-code",
    path: singleSkill,
    skillMdPath: path.join(singleSkill, "SKILL.md")
  }]);
  assert.equal(result.diagnostics.length, 0);
});

test("reports invalid metadata", async () => {
  const result = await validateSkillPack(invalid, { strict: true });
  assert.equal(result.ok, false);
  assert.ok(result.diagnostics.some((diag) => diag.code === "invalid-name"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-description"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-version"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-side-effect-metadata"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-approval-metadata"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "vague-activation"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-when-to-use"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-inputs"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-side-effects"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-approval"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-examples"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-validation"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-validation-notes"));
});

test("normalizes target and tag metadata for portable reports", async () => {
  const result = await validateSkillPack(valid, { strict: true });
  const reviewCode = result.skills.find((skill) => skill.name === "review-code");
  assert.equal(result.ok, true);
  assert.deepEqual(reviewCode?.metadata.targets, ["codex", "claude", "openclaw", "agents"]);
  assert.deepEqual(reviewCode?.metadata.tags, ["review", "quality"]);
});

test("keeps activation and side-effect metadata in validation results", async () => {
  const result = await validateSkillPack(valid, { strict: true });
  const writeTests = result.skills.find((skill) => skill.name === "write-tests");
  assert.equal(result.ok, true);
  assert.deepEqual(writeTests?.metadata.activation, ["add regression tests", "create fixture-backed coverage"]);
  assert.deepEqual(writeTests?.metadata.sideEffects, ["edits tests and fixtures"]);
  assert.deepEqual(writeTests?.metadata.approvalRequired, ["dependency installs", "broad snapshot updates"]);
});
