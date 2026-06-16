import assert from "node:assert/strict";
import { test } from "node:test";
import path from "node:path";
import { validateSkillPack } from "../src/validator.js";

const valid = path.join(process.cwd(), "fixtures/valid-pack");
const invalid = path.join(process.cwd(), "fixtures/invalid-pack");

test("validates a deterministic skill pack", async () => {
  const result = await validateSkillPack(valid, { strict: true });
  assert.equal(result.ok, true);
  assert.deepEqual(result.skills.map((skill) => skill.name), ["review-code", "write-tests"]);
  assert.equal(result.diagnostics.length, 0);
});

test("reports invalid metadata", async () => {
  const result = await validateSkillPack(invalid, { strict: true });
  assert.equal(result.ok, false);
  assert.ok(result.diagnostics.some((diag) => diag.code === "invalid-name"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-description"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-version"));
  assert.ok(result.diagnostics.some((diag) => diag.code === "missing-validation-notes"));
});
