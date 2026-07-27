import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFrontmatter } from "../src/frontmatter.js";

const frontmatter = [
  "---",
  "name: review-code",
  "description: Review code safely",
  "tags: [review, quality]",
  "---",
  "## When To Use",
  "",
  "Use this skill for code review."
];

test("parses equivalent LF and CRLF frontmatter", () => {
  const lf = parseFrontmatter(frontmatter.join("\n"));
  const crlf = parseFrontmatter(frontmatter.join("\r\n"));

  assert.deepEqual(crlf.data, lf.data);
  assert.equal(lf.body, "## When To Use\n\nUse this skill for code review.");
  assert.equal(crlf.body, "## When To Use\r\n\r\nUse this skill for code review.");
});

test("leaves unclosed frontmatter untouched", () => {
  const markdown = "---\r\nname: review-code\r\n## When To Use";
  assert.deepEqual(parseFrontmatter(markdown), { data: {}, body: markdown });
});

test("does not accept malformed delimiter lines", () => {
  const markdown = "---\r\nname: review-code\r\n--- \r\nBody";
  assert.deepEqual(parseFrontmatter(markdown), { data: {}, body: markdown });
});
