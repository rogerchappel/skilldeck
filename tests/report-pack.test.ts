import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { createSkillFromDocs } from "../src/pack.js";
import { createCompatibilityReport } from "../src/report.js";

const valid = path.join(process.cwd(), "fixtures/valid-pack");

test("creates deterministic compatibility reports", async () => {
  const report = await createCompatibilityReport(valid);
  assert.equal(report.generatedAt, "1970-01-01T00:00:00.000Z");
  assert.equal(report.skillCount, 2);
  assert.ok(report.targets.codex.supported.includes("review-code"));
  assert.ok(report.targets.claude.warnings.some((warning) => warning.includes("write-tests")));
});

test("packs local docs into a SKILL.md", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "skilldeck-pack-"));
  try {
    const created = await createSkillFromDocs({ docsDir: path.join(process.cwd(), "docs"), outDir: temp, name: "project-docs" });
    const skill = await readFile(path.join(created, "SKILL.md"), "utf8");
    assert.match(skill, /name: project-docs/);
    assert.match(skill, /Use these local project instructions/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
