// Guide files: step-by-step tasks in docs/guides/data/. They are not part of a device folder.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

import type { Issue } from "./load.ts";
import { GuideFile, type DeviceData } from "./schema.ts";

const TOKEN = /\{([A-Z][A-Za-z0-9]*(?:\.[a-z0-9]+)?)\}/g;

// Checks one parsed guide against the device. `fileName` is the file name without ".json".
export function checkGuide(guide: GuideFile, device: Pick<DeviceData, "elements">, fileName: string): Issue[] {
  const issues: Issue[] = [];
  const file = `${fileName}.json`;
  const add = (path: string, message: string) => issues.push({ file, path, message });
  const ids = new Set(device.elements.map((e) => e.id));

  if (guide.id !== fileName) add("id", `guide id '${guide.id}' differs from file name '${fileName}'`);

  const seen = new Set<string>();
  for (const step of guide.steps) {
    const at = `${guide.id}.${step.id}`;
    if (seen.has(step.id)) add(at, `guide '${guide.id}': duplicate step id '${step.id}'`);
    seen.add(step.id);
    for (const id of step.focus) if (!ids.has(id)) add(at, `guide '${guide.id}', step '${step.id}': unknown element '${id}' in focus`);
    for (const id of step.held ?? []) if (!ids.has(id)) add(at, `guide '${guide.id}', step '${step.id}': unknown element '${id}' in held`);
    for (const m of [step.caption, step.expect, step.warn])
      if (m !== undefined)
        for (const [, id] of m.en.matchAll(TOKEN))
          if (!ids.has(id!)) add(at, `guide '${guide.id}', step '${step.id}': unknown element '${id}' in text`);
  }
  return issues;
}

// Reads every *.json file in `dir`. A missing folder gives no guides.
export function loadGuides(dir: string, device: Pick<DeviceData, "elements">): Issue[] {
  const issues: Issue[] = [];
  if (!existsSync(dir)) return issues;
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".json")).sort()) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(join(dir, name), "utf8"));
    } catch (error) {
      issues.push({ file: name, path: "", message: `not valid JSON: ${(error as Error).message}` });
      continue;
    }
    const result = GuideFile.safeParse(raw);
    if (!result.success) {
      for (const i of result.error.issues) issues.push({ file: name, path: i.path.join("."), message: i.message });
      continue;
    }
    issues.push(...checkGuide(result.data, device, basename(name, ".json")));
  }
  return issues;
}
