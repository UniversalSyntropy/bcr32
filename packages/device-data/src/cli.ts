// Usage: node cli.ts validate [device-dir…]   validate device folders (default: data/devices/*)
//        node cli.ts gen-schema [--check]      write or verify data/schema/*.schema.json
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { jsonSchemas } from "./json-schema.ts";
import { loadDevice } from "./load.ts";

const DEVICES = join("data", "devices");
const SCHEMA_DIR = join("data", "schema");

function validate(dirs: string[]): number {
  const targets =
    dirs.length > 0
      ? dirs
      : existsSync(DEVICES)
        ? readdirSync(DEVICES, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => join(DEVICES, d.name))
        : [];
  if (targets.length === 0) {
    console.log("validate: no device folders found");
    return 0;
  }
  let failed = 0;
  for (const dir of targets) {
    const result = loadDevice(dir);
    if (result.ok) {
      const d = result.data;
      console.log(
        `ok   ${dir}: ${d.elements.length} elements, ${d.modes.length} modes, ` +
          `${d.functions.length} functions, ${d.valueSets.length} value sets`,
      );
    } else {
      failed++;
      console.error(`FAIL ${dir}: ${result.issues.length} issue(s)`);
      for (const i of result.issues) console.error(`  ${i.file}${i.path ? ` [${i.path}]` : ""}: ${i.message}`);
    }
  }
  return failed > 0 ? 1 : 0;
}

function genSchema(check: boolean): number {
  let stale = 0;
  if (!check) mkdirSync(SCHEMA_DIR, { recursive: true });
  for (const [file, text] of jsonSchemas()) {
    const path = join(SCHEMA_DIR, file);
    if (check) {
      if (!existsSync(path) || readFileSync(path, "utf8") !== text) {
        stale++;
        console.error(`stale: ${path} (run: npm run gen:schema)`);
      }
    } else {
      writeFileSync(path, text);
      console.log(`wrote ${path}`);
    }
  }
  return stale > 0 ? 1 : 0;
}

const [command, ...rest] = process.argv.slice(2);
if (command === "validate") process.exitCode = validate(rest);
else if (command === "gen-schema") process.exitCode = genSchema(rest.includes("--check"));
else {
  console.error("usage: cli.ts validate [device-dir…] | gen-schema [--check]");
  process.exitCode = 2;
}
