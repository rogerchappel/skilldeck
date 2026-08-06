export function parseFrontmatter(markdown: string): { data: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)^---(?:\r?\n|$)/m.exec(markdown);
  if (!match || match.index !== 0) return { data: {}, body: markdown };
  const raw = match[1].trim();
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
  return { data, body: markdown.slice(match[0].length) };
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
