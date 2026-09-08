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
    return splitFlowArray(inner).map((part) => parseScalar(part.trim())).filter(Boolean);
  }
  return parseScalar(value);
}

function splitFlowArray(value: string): string[] {
  const values: string[] = [];
  let start = 0;
  let quote: "'" | '"' | undefined;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote === '"' && character === "\\") {
      index += 1;
      continue;
    }
    if (quote === "'" && character === "'" && value[index + 1] === "'") {
      index += 1;
      continue;
    }
    if (character === "'" || character === '"') {
      quote = quote === character ? undefined : quote ?? character;
      continue;
    }
    if (character === "," && !quote) {
      values.push(value.slice(start, index));
      start = index + 1;
    }
  }

  values.push(value.slice(start));
  return values;
}

function parseScalar(value: string): string {
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "string") return parsed;
    } catch {
      // Preserve the existing permissive behavior for malformed quoted scalars.
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return stripQuotes(value);
}

function stripQuotes(value: string): string {
  return value.replace(/^['\"]|['\"]$/g, "");
}
