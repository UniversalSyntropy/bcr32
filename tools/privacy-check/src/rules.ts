// Personal-data rules. Text in, findings out. No file or git access here.

export interface LineFinding {
  line: number;
  rule: string;
  text: string;
}

interface Rule {
  id: string;
  re: RegExp;
}

// Same patterns as the old shell leak guard, plus e-mail.
export const RULES: readonly Rule[] = [
  { id: "home-path", re: /\/Users\/[a-z]|\/home\/[a-z]|C:\\Users\\[a-z]/gi },
  { id: "private-ip", re: /(?<![0-9.])(?:10\.[0-9]+|172\.(?:1[6-9]|2[0-9]|3[01])|192\.168)\.[0-9]+\.[0-9]+/gi },
  { id: "local-hostname", re: /[a-z0-9-]+\.local(?![a-z])/gi },
  { id: "mac-address", re: /(?:[0-9a-f]{2}:){5}[0-9a-f]{2}/gi },
  { id: "email", re: /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi },
];

// One fixed string per line. Empty lines and lines that start with # are ignored.
export function parseLocalPatterns(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Case-insensitive, whole word (same as grep -i -w -F).
function localRules(patterns: string[]): Rule[] {
  return patterns.map((p) => ({
    id: "local-pattern",
    re: new RegExp(`(?<![A-Za-z0-9_])${escapeRegExp(p)}(?![A-Za-z0-9_])`, "gi"),
  }));
}

export function scanText(text: string, localPatterns: string[] = []): LineFinding[] {
  const rules = [...RULES, ...localRules(localPatterns)];
  const findings: LineFinding[] = [];
  text.split(/\r?\n/).forEach((content, index) => {
    for (const rule of rules)
      for (const m of content.matchAll(rule.re)) findings.push({ line: index + 1, rule: rule.id, text: m[0] });
  });
  return findings;
}
