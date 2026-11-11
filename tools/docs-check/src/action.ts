// Action rule. This is the minimal shape check only: `hold <control>` or `hold <control> + <action>`.
// A hold with no second part is valid: the text after the span gives the action.
// The strict action grammar comes in a later step and replaces this file.
import { codeSpans, isProse, splitLines } from "./markdown.ts";
import type { Finding } from "./types.ts";

export function actionShapeError(span: string): string | undefined {
  if (!span.startsWith("hold ")) return undefined;
  // Each part between plus signs must hold text, and each plus sign needs a space on both sides.
  const ok = span.split(" + ").every((part) => part.trim() !== "" && !/(^|\S)\+|\+(\S|$)/.test(part));
  return ok ? undefined : `'${span}' must have the shape 'hold <control>' or 'hold <control> + <action>'`;
}

export function checkActions(path: string, text: string): Finding[] {
  const findings: Finding[] = [];
  for (const l of splitLines(text)) {
    if (!isProse(l)) continue;
    for (const span of codeSpans(l.text)) {
      const message = actionShapeError(span.content);
      if (message !== undefined) findings.push({ path, line: l.n, rule: "action", message });
    }
  }
  return findings;
}
