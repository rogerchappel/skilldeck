import assert from "node:assert/strict";
import { mkdtemp, rm, access, cp } from "node:fs/promises";
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

test("force refuses to overwrite a source skill with itself", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "skilldeck-"));
  const source = path.join(temp, "review-code");
  try {
    await cp(path.join(valid, "skills", "review-code"), source, { recursive: true });
    const result = await installSkillPack(source, { target: "agents", destination: temp, force: true });
    assert.equal(result.ok, false);
    assert.equal(result.diagnostics.some((diagnostic) => diagnostic.code === "source-destination-overlap"), true);
    await access(path.join(source, "SKILL.md"));
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("dry run reports source and destination overlap without mutation", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "skilldeck-"));
  const source = path.join(temp, "review-code");
  try {
    await cp(path.join(valid, "skills", "review-code"), source, { recursive: true });
    const result = await installSkillPack(source, { target: "agents", destination: temp, dryRun: true });
    assert.equal(result.ok, false);
    await access(path.join(source, "SKILL.md"));
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
