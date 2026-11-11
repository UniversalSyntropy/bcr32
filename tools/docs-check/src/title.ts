// Title rule: exactly one `#` heading, and no skipped heading level.
import { headings, splitLines } from "./markdown.ts";
import type { Finding } from "./types.ts";

export function checkTitle(path: string, text: string): Finding[] {
  const hs = headings(splitLines(text));
  const findings: Finding[] = [];
  const tops = hs.filter((h) => h.level === 1);
  if (tops.length === 0) findings.push({ path, line: 1, rule: "title", message: "no '#' title heading" });
  for (const extra of tops.slice(1))
    findings.push({ path, line: extra.line, rule: "title", message: `second '#' heading '${extra.text}'; use one title` });
  for (let i = 1; i < hs.length; i++) {
    const prev = hs[i - 1];
    const h = hs[i];
    if (prev !== undefined && h !== undefined && h.level > prev.level + 1)
      findings.push({
        path,
        line: h.line,
        rule: "title",
        message: `heading level jumps from ${prev.level} to ${h.level} at '${h.text}'`,
      });
  }
  return findings;
}
