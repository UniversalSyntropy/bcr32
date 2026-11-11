// Control-ID rule: a token that looks like a control ID must be an element ID of the device.
import { isProse, splitLines } from "./markdown.ts";
import type { Env, Finding } from "./types.ts";

// B, E and J with digits; SEL and DISP; L with digits and an optional part such as L2.in.
// Tokens such as CV1, T1, R1_14 and E(24+k) do not match.
const TOKEN = /(?<!\w)(?:[BEJ]\d+|L\d+(?:\.\w+)?|SEL|DISP)(?!\w)/g;

export function isKnownId(token: string, ids: ReadonlySet<string>): boolean {
  if (ids.has(token)) return true;
  // L2 and L3 are callout-level IDs: they are valid when a part L<n>.<part> exists.
  if (/^L\d+$/.test(token)) for (const id of ids) if (id.startsWith(`${token}.`)) return true;
  return false;
}

export function checkControlIds(path: string, text: string, env: Env): Finding[] {
  const findings: Finding[] = [];
  for (const l of splitLines(text)) {
    if (!isProse(l)) continue;
    for (const m of l.text.matchAll(TOKEN))
      if (!isKnownId(m[0], env.controlIds))
        findings.push({ path, line: l.n, rule: "control-id", message: `'${m[0]}' is not an element ID in the device data` });
  }
  return findings;
}
