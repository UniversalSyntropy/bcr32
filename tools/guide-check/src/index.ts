// guide-check: reads guide files from the working tree (readdirSync, never git ls-files) and runs the checks.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

import { loadDevice } from "@bcr32/device-data";

import { checkGuideData, type Ctx, type Finding } from "./checks.ts";

export { checkGuideData, CAPTION_LIMIT, EXPECT_LIMIT, type CheckName, type Ctx, type Finding, type Level } from "./checks.ts";

// Checks every *.json file in `guidesDir`. `root` is the repo root; `doc` paths resolve against it.
export function checkFolder(guidesDir: string, deviceDir: string, root: string): Finding[] {
  const loaded = loadDevice(deviceDir);
  if (!loaded.ok) return [{ level: "error", check: "Schema", file: deviceDir, message: "the device data is not valid; run npm run validate:data" }];
  const ctx: Ctx = {
    device: loaded.data,
    readDoc: (path) => (existsSync(join(root, path)) ? readFileSync(join(root, path), "utf8") : undefined),
  };
  if (!existsSync(guidesDir)) return [];
  const out: Finding[] = [];
  for (const name of readdirSync(guidesDir).filter((n) => n.endsWith(".json")).sort()) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(join(guidesDir, name), "utf8"));
    } catch (error) {
      out.push({ level: "error", check: "Schema", file: name, message: `not valid JSON: ${(error as Error).message}` });
      continue;
    }
    out.push(...checkGuideData(basename(name, ".json"), raw, ctx));
  }
  return out;
}
