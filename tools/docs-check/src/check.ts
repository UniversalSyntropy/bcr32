// Runs every rule on documents and applies the STE pending list.
import { checkActions } from "./action.ts";
import { checkControlIds } from "./control-id.ts";
import { checkFrontMatter } from "./front-matter.ts";
import { checkGlossary } from "./glossary.ts";
import { checkLinks } from "./links.ts";
import { checkContractions, checkSentences } from "./ste.ts";
import { checkTitle } from "./title.ts";
import type { Env, Finding } from "./types.ts";

export const PENDING_PATH = "tools/docs-check/ste-pending.txt";

export const isSte = (f: Finding): boolean => f.rule.startsWith("ste-");

// All rules for one document, the ste rules included.
export function checkDocument(path: string, text: string, env: Env): Finding[] {
  return [
    ...checkFrontMatter(path, text),
    ...checkTitle(path, text),
    ...checkLinks(path, text, env),
    ...checkControlIds(path, text, env),
    ...checkActions(path, text),
    ...checkGlossary(path, text, env),
    ...checkContractions(path, text),
    ...checkSentences(path, text),
  ];
}

export interface PendingEntry {
  path: string;
  line: number;
}

// One repo-relative path per line. Lines that start with # and empty lines are ignored.
export function parsePending(text: string): PendingEntry[] {
  const entries: PendingEntry[] = [];
  text.split(/\r?\n/).forEach((l, i) => {
    const path = l.replace(/\s+#.*$/, "").trim();
    if (path !== "" && !path.startsWith("#")) entries.push({ path, line: i + 1 });
  });
  return entries;
}

// Documents on the pending list skip the ste rules (decision D60). The list must not go stale.
export function checkAll(paths: string[], env: Env, pendingText = "", pendingPath = PENDING_PATH): Finding[] {
  const pending = parsePending(pendingText);
  const pendingSet = new Set(pending.map((p) => p.path));
  const findings: Finding[] = [];
  const passedSte = new Set<string>();
  for (const path of paths) {
    const text = env.read(path);
    if (text === undefined) {
      findings.push({ path, line: 1, rule: "link", message: "file cannot be read" });
      continue;
    }
    const all = checkDocument(path, text, env);
    if (pendingSet.has(path)) {
      if (!all.some(isSte)) passedSte.add(path);
      findings.push(...all.filter((f) => !isSte(f)));
    } else findings.push(...all);
  }
  for (const p of pending) {
    if (!env.exists(p.path))
      findings.push({ path: pendingPath, line: p.line, rule: "ste-pending", message: `listed file '${p.path}' does not exist` });
    else if (passedSte.has(p.path))
      findings.push({
        path: pendingPath,
        line: p.line,
        rule: "ste-pending",
        message: `'${p.path}' now passes the ste rules; remove it from the list`,
      });
  }
  return findings;
}
