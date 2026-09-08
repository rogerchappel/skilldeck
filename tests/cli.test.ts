import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const cli = path.join(process.cwd(), "dist/src/cli.js");
const fixture = path.join(process.cwd(), "fixtures/valid-pack");

function run(args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

test("boolean flags before paths preserve the validate and report roots", () => {
  for (const command of ["validate", "report"]) {
    const result = run([command, "--json", fixture]);
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.root, fixture);
    assert.equal(command === "report" ? output.skillCount : output.skills.length, 2);
  }
});

test("boolean install flags before a path preserve the root and JSON mode", () => {
  const result = run(["install", "--json", "--dry-run", fixture, "--target", "agents"]);
  assert.equal(result.status, 0, result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(output.target, "agents");
  assert.equal(output.dryRun, true);
  assert.ok(output.entries.every((entry: { source: string }) => entry.source.startsWith(fixture)));
});

test("force install exits nonzero without erasing an overlapping source", async () => {
  const destination = await mkdtemp(path.join(os.tmpdir(), "skilldeck-cli-"));
  const source = path.join(destination, "review-code");
  try {
    await cp(path.join(fixture, "skills", "review-code"), source, { recursive: true });
    const result = run(["install", source, "--target", "agents", "--dest", destination, "--force", "--json"]);
    assert.equal(result.status, 1);
    const output = JSON.parse(result.stdout);
    assert.equal(output.diagnostics.some((diagnostic: { code: string }) => diagnostic.code === "source-destination-overlap"), true);
    await access(path.join(source, "SKILL.md"));
  } finally {
    await rm(destination, { recursive: true, force: true });
  }
});

test("boolean pack flags before a docs path preserve the input and JSON mode", async () => {
  const out = await mkdtemp(path.join(os.tmpdir(), "skilldeck-cli-"));
  try {
    const result = run(["pack", "--json", "--force", "docs", "--name", "cli-test", "--out", out]);
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    assert.equal(output.ok, true);
    assert.equal(output.created, path.join(out, "cli-test"));
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("pack preserves multiline and YAML-like descriptions through strict validation", async () => {
  const out = await mkdtemp(path.join(os.tmpdir(), "skilldeck-cli-description-"));
  const descriptions = ["First line\nsecond line remains intact.", "false: [null] # description"];
  try {
    for (const [index, description] of descriptions.entries()) {
      const name = `cli-description-${index}`;
      const packed = run(["pack", "docs", "--name", name, "--out", out, "--description", description]);
      assert.equal(packed.status, 0, packed.stderr);
      const validated = run(["validate", path.join(out, name), "--strict", "--json"]);
      assert.equal(validated.status, 0, validated.stderr || validated.stdout);
      const result = JSON.parse(validated.stdout);
      assert.equal(result.skills[0].metadata.description, description);
    }
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("validate and report preserve quoted comma-bearing flow-array metadata", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "skilldeck-cli-flow-array-"));
  try {
    await writeFile(path.join(root, "SKILL.md"), `---
name: quoted-arrays
description: Exercise quoted flow arrays.
version: 0.1.0
activation: ["review code, tests"]
sideEffects: ["edit files, tests"]
approvalRequired: ["before publish, deploy"]
---
# Quoted Arrays
## When To Use
Review code and tests together.
## Inputs
Code and tests.
## Side Effects
Edits files and tests.
## Approval
Ask before publishing or deploying.
## Examples
Review code and tests.
## Validation
Run the test suite and record the results.
`, "utf8");
    const validated = run(["validate", root, "--strict", "--json"]);
    assert.equal(validated.status, 0, validated.stderr || validated.stdout);
    const validation = JSON.parse(validated.stdout);
    assert.deepEqual(validation.skills[0].metadata.activation, ["review code, tests"]);
    assert.deepEqual(validation.skills[0].metadata.sideEffects, ["edit files, tests"]);
    assert.deepEqual(validation.skills[0].metadata.approvalRequired, ["before publish, deploy"]);
    assert.equal(validation.diagnostics.some((diagnostic: { code: string }) => diagnostic.code === "vague-activation"), false);

    const reported = run(["report", root, "--json"]);
    assert.equal(reported.status, 0, reported.stderr || reported.stdout);
    const report = JSON.parse(reported.stdout);
    assert.equal(report.skillCount, 1);
    assert.equal(report.diagnostics.some((diagnostic: { code: string }) => diagnostic.code === "vague-activation"), false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("force pack exits nonzero without erasing overlapping docs", async () => {
  const out = await mkdtemp(path.join(os.tmpdir(), "skilldeck-cli-overlap-"));
  const docs = path.join(out, "project-docs");
  const sentinel = path.join(docs, "keep.txt");
  try {
    await cp(path.join(process.cwd(), "docs"), docs, { recursive: true });
    await writeFile(sentinel, "keep", "utf8");
    const result = run(["pack", docs, "--name", "project-docs", "--out", out, "--force"]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /source and destination overlap/);
    await access(sentinel);
  } finally {
    await rm(out, { recursive: true, force: true });
  }
});

test("value options reject missing values", () => {
  const cases = [
    ["install", "--target"], ["install", "--dest"], ["pack", "--name"],
    ["pack", "--out"], ["pack", "--description"],
  ];
  for (const args of cases) {
    const result = run(args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /requires a value/);
  }
});

test("unknown and command-inapplicable options fail clearly", () => {
  for (const args of [["validate", "--wat"], ["report", "--force"], ["pack", "-x"]]) {
    const result = run(args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unknown option/);
  }
});

test("commands reject extra positional arguments", () => {
  for (const command of ["validate", "report", "install", "pack"]) {
    const result = run([command, fixture, "unexpected-extra"]);
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(`Command '${command}' accepts at most one positional path`));
  }
});
