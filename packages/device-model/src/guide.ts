// Guide checks that need the parser and the view schema. Not wired into checkGuide yet.
import type { DeviceData, GuideFile, Issue } from "@bcr32/device-data";

import { parseAction, type ElementIndex } from "./action.ts";
import { ViewPatch } from "./view.ts";

const issue = (guide: GuideFile, step: string, message: string): Issue => ({
  file: `${guide.id}.json`,
  path: `${guide.id}.${step}`,
  message: `guide '${guide.id}', step '${step}': ${message}`,
});

// Each step action parses. A guide step names one control, so a group target is an issue.
export function checkGuideActions(guide: GuideFile, els: ElementIndex): Issue[] {
  const issues: Issue[] = [];
  for (const step of guide.steps) {
    if (step.action === undefined) continue;
    const r = parseAction(step.action, els);
    if (!r.ok) {
      issues.push(issue(guide, step.id, `action '${step.action}': ${r.error} (offset ${r.at})`));
      continue;
    }
    const a = r.action;
    const parts = a.kind === "sequence" ? [a.first, a.then] : [a];
    for (const p of parts) {
      const targets = p.kind === "simple" || p.kind === "timed" ? [p.target] : p.kind === "combo" ? [p.hold, p.then.target] : p.kind === "chord" ? p.targets : [];
      if (targets.some((t) => "group" in t)) issues.push(issue(guide, step.id, `action '${step.action}': a guide step names one control, not a group`));
    }
  }
  return issues;
}

// Each `after` passes ViewPatch. A ring key is an encoder. A style is a row of rings.json.
export function checkGuideAfter(guide: GuideFile, data: Pick<DeviceData, "elements" | "rings">): Issue[] {
  const issues: Issue[] = [];
  const kinds = new Map(data.elements.map((e) => [e.id, e.kind]));
  const styles = new Set(data.rings.map((r) => r.id));
  for (const step of guide.steps) {
    if (step.after === undefined) continue;
    const r = ViewPatch.safeParse(step.after);
    if (!r.success) {
      for (const i of r.error.issues) issues.push(issue(guide, step.id, `after.${i.path.join(".")}: ${i.message}`));
      continue;
    }
    for (const [id, ring] of Object.entries(r.data.rings ?? {})) {
      if (kinds.get(id) !== "encoder") issues.push(issue(guide, step.id, `after.rings.${id}: '${id}' is not an encoder`));
      const style = ring?.style;
      if (typeof style === "string" && style !== "unknown" && !styles.has(style)) issues.push(issue(guide, step.id, `after.rings.${id}.style: unknown style '${style}'`));
    }
  }
  return issues;
}
