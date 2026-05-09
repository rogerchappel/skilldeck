export function parseFrontmatter(markdown: string): { data: Record<string, unknown>; body: string } {
  if (!markdown.startsWith("---\n")) return { data: {}, body: markdown };
  const end = markdown.indexOf("\n---", 4);
  if (end === -1) return { data: {}, body: markdown };
  const raw = markdown.slice(4, end).trim();
  const data: Record<string, unknown> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    data[key] = parseValue(value);
  }
  const bodyStart = markdown.indexOf("\n", end + 4);
  return { data, body: bodyStart === -1 ? "" : markdown.slice(bodyStart + 1) };
}

function parseValue(value: string): unknown {
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((part) => stripQuotes(part.trim())).filter(Boolean);
  }
  return stripQuotes(value);
}

function stripQuotes(value: string): string {
  return value.replace(/^['\"]|['\"]$/g, "");
}
