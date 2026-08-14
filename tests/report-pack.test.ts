import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { createSkillFromDocs } from "../src/pack.js";
import { createCompatibilityReport } from "../src/report.js";
import { validateSkillPack } from "../src/validator.js";

const valid = path.join(process.cwd(), "fixtures/valid-pack");

test("creates deterministic compatibility reports", async () => {
  const report = await createCompatibilityReport(valid);
  assert.equal(report.generatedAt, "1970-01-01T00:00:00.000Z");
  assert.equal(report.skillCount, 2);
  assert.ok(report.targets.codex.supported.includes("review-code"));
  assert.ok(report.targets.claude.warnings.some((warning) => warning.includes("write-tests")));
});

test("packs local docs into a deterministic, strictly valid SKILL.md", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "skilldeck-pack-"));
  try {
    const options = { docsDir: path.join(process.cwd(), "docs"), name: "project-docs" };
    const created = await createSkillFromDocs({ ...options, outDir: path.join(temp, "first") });
    const repeated = await createSkillFromDocs({ ...options, outDir: path.join(temp, "second") });
    const skill = await readFile(path.join(created, "SKILL.md"), "utf8");
    const repeatedSkill = await readFile(path.join(repeated, "SKILL.md"), "utf8");
    assert.match(skill, /name: project-docs/);
    assert.match(skill, /Use these local project instructions/);
    assert.equal(skill, repeatedSkill);

    const validation = await validateSkillPack(created, { strict: true });
    assert.equal(validation.ok, true, validation.diagnostics.map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`).join("\n"));
    assert.deepEqual(validation.diagnostics, []);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("rejects invalid skill names without changing the filesystem", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "skilldeck-pack-invalid-"));
  const outDir = path.join(temp, "out");
  const sentinelDir = path.join(temp, "sentinel");
  const sentinel = path.join(sentinelDir, "keep.txt");
  const invalidNames = [
    { name: "../escaped", force: false },
    { name: "../sentinel", force: true },
    { name: path.join(temp, "absolute"), force: true },
    { name: ".", force: false },
    { name: "..", force: true },
    { name: "nested/name", force: false },
    { name: "nested\\name", force: true },
    { name: "%2e%2e%2fescaped", force: true },
    { name: "..%2Fescaped", force: false }
  ];

  try {
    await mkdir(sentinelDir, { recursive: true });
    await writeFile(sentinel, "keep", "utf8");

    for (const options of invalidNames) {
      await assert.rejects(
        createSkillFromDocs({ docsDir: path.join(temp, "missing-docs"), outDir, ...options }),
        /Invalid skill name/
      );
    }

    assert.equal(await readFile(sentinel, "utf8"), "keep");
    await assert.rejects(readdir(outDir), { code: "ENOENT" });
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("keeps valid skill names inside the output directory", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "skilldeck-pack-valid-"));
  try {
    const outDir = path.join(temp, "out");
    const created = await createSkillFromDocs({
      docsDir: path.join(process.cwd(), "docs"),
      outDir,
      name: "project-docs-2"
    });

    assert.equal(created, path.join(outDir, "project-docs-2"));
    assert.match(await readFile(path.join(created, "SKILL.md"), "utf8"), /name: project-docs-2/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test("force rejects overlapping docs and output without deleting source files", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "skilldeck-pack-overlap-"));
  const cases = [
    { docsDir: path.join(temp, "equal", "project-docs"), outDir: path.join(temp, "equal") },
    { docsDir: path.join(temp, "source-parent"), outDir: path.join(temp, "source-parent") },
    { docsDir: path.join(temp, "destination-parent", "project-docs", "docs"), outDir: path.join(temp, "destination-parent") }
  ];

  try {
    for (const [index, options] of cases.entries()) {
      const sentinel = path.join(options.docsDir, `keep-${index}.txt`);
      await mkdir(options.docsDir, { recursive: true });
      await writeFile(sentinel, "keep", "utf8");

      await assert.rejects(
        createSkillFromDocs({ ...options, name: "project-docs", force: true }),
        /source and destination overlap/
      );
      assert.equal(await readFile(sentinel, "utf8"), "keep");
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
