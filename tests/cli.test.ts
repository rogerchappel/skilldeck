import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { access, cp, mkdtemp, rm } from "node:fs/promises";
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
