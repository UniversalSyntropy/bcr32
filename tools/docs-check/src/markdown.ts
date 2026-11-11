// Small Markdown helpers: line classes, headings, code spans and GitHub heading slugs.

export interface Line {
  n: number; // 1-based line number
  text: string;
  front: boolean; // inside the YAML front matter, delimiters included
  fenced: boolean; // inside a fenced code block, fences included
}

// Marks front matter and fenced code. Front matter exists only when line 1 is `---` and a closing `---` follows.
export function splitLines(text: string): Line[] {
  const raw = text.split(/\r?\n/);
  let frontEnd = -1;
  if (raw[0]?.trim() === "---") frontEnd = raw.findIndex((l, i) => i > 0 && l.trim() === "---");
  const lines: Line[] = [];
  let fence: { char: string; len: number } | undefined;
  raw.forEach((t, i) => {
    const front = i <= frontEnd;
    let fenced = false;
    if (!front) {
      const m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(t);
      if (fence !== undefined) {
        fenced = true;
        if (m?.[1] !== undefined && m[1][0] === fence.char && m[1].length >= fence.len && m[2]?.trim() === "") fence = undefined;
      } else if (m?.[1] !== undefined) {
        fenced = true;
        fence = { char: m[1][0] as string, len: m[1].length };
      }
    }
    lines.push({ n: i + 1, text: t, front, fenced });
  });
  return lines;
}

export const isProse = (l: Line): boolean => !l.front && !l.fenced;

export interface Heading {
  line: number;
  level: number;
  text: string;
}

export function headings(lines: Line[]): Heading[] {
  const found: Heading[] = [];
  for (const l of lines) {
    if (!isProse(l)) continue;
    const m = /^ {0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/.exec(l.text);
    if (m?.[1] !== undefined && m[2] !== undefined) found.push({ line: l.n, level: m[1].length, text: m[2] });
  }
  return found;
}

// GitHub slug: lowercase, keep letters, digits, spaces, hyphens and underscores, spaces to hyphens.
export function slug(headingText: string): string {
  return headingText
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[`*]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M} _-]/gu, "")
    .replace(/ /g, "-");
}

// All anchors of a document. A repeated slug gets -1, -2 and so on.
export function anchors(lines: Line[]): Set<string> {
  const seen = new Map<string, number>();
  const out = new Set<string>();
  for (const h of headings(lines)) {
    const base = slug(h.text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    out.add(count === 0 ? base : `${base}-${count}`);
  }
  return out;
}

// Inline code spans of one line, without the backticks.
export function codeSpans(text: string): { start: number; content: string }[] {
  const spans: { start: number; content: string }[] = [];
  for (const m of text.matchAll(/(`+)(.+?)\1(?!`)/g)) spans.push({ start: m.index ?? 0, content: m[2] as string });
  return spans;
}

// Replaces each code span with `with`, or with spaces of equal length when `with` is undefined.
export function maskCode(text: string, replacement?: string): string {
  return text.replace(/(`+)(.+?)\1(?!`)/g, (m) => replacement ?? " ".repeat(m.length));
}
