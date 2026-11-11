// Front matter rule. The parser reads simple `key: value` lines only. It is not a YAML parser.
import type { Finding } from "./types.ts";
import { splitLines } from "./markdown.ts";

export const REQUIRED_KEYS = ["title", "description", "status", "last_updated"] as const;
export const STATUSES = ["draft", "verified", "deprecated"];

// Files under docs/, packages/<name>/ and tools/<name>/ need front matter.
export function needsFrontMatter(path: string): boolean {
  return /^(docs\/|packages\/[^/]+\/|tools\/[^/]+\/)/.test(path);
}

export function parseFrontMatter(text: string): Map<string, { value: string; line: number }> | undefined {
  const lines = splitLines(text);
  const fm = lines.filter((l) => l.front);
  if (fm.length < 2) return undefined;
  const out = new Map<string, { value: string; line: number }>();
  for (const l of fm.slice(1, -1)) {
    const m = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(l.text);
    if (m?.[1] !== undefined && m[2] !== undefined)
      out.set(m[1], { value: m[2].trim().replace(/^(["'])(.*)\1$/, "$2"), line: l.n });
  }
  return out;
}

function validDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(s);
}

export function checkFrontMatter(path: string, text: string): Finding[] {
  if (!needsFrontMatter(path)) return [];
  const add = (line: number, message: string): Finding => ({ path, line, rule: "front-matter", message });
  const fm = parseFrontMatter(text);
  if (fm === undefined) return [add(1, "missing front matter (a block between two --- lines at the top)")];
  const findings: Finding[] = [];
  for (const key of REQUIRED_KEYS) {
    const entry = fm.get(key);
    if (entry === undefined || entry.value === "") findings.push(add(1, `front matter key '${key}' is missing or empty`));
  }
  const status = fm.get("status");
  if (status !== undefined && status.value !== "" && !STATUSES.includes(status.value))
    findings.push(add(status.line, `status '${status.value}' is not one of ${STATUSES.join(", ")}`));
  const date = fm.get("last_updated");
  if (date !== undefined && date.value !== "" && !validDate(date.value))
    findings.push(add(date.line, `last_updated '${date.value}' is not a date in the form YYYY-MM-DD`));
  return findings;
}
