import assert from "node:assert/strict";
import { mkdtemp, rm, access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { installSkillPack } from "../src/install.js";

const valid = path.join(process.cwd(), "fixtures/valid-pack");

test("dry run install plans copies without writing", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "skilldeck-"));
  try {
    const result = await installSkillPack(valid, { target: "agents", destination: temp, dryRun: true });
    assert.equal(result.ok, true);
    assert.equal(result.entries.length, 2);
    await assert.rejects(access(path.join(temp, "review-code")));
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("install copies skills to a local destination", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "skilldeck-"));
  try {
    const result = await installSkillPack(valid, { target: "agents", destination: temp });
    assert.equal(result.ok, true);
    await access(path.join(temp, "review-code", "SKILL.md"));
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
