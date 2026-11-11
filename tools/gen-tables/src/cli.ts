// Usage: node cli.ts [--check] [file…]   default files: every tracked Markdown file
// Writes each generated block from device data. With --check, writes nothing and exits 1 on a difference.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadDevice } from "@bcr32/device-data";

import { generate } from "./generate.ts";

const args = process.argv.slice(2);
const check = args.includes("--check");
const unknown = args.filter((a) => a.startsWith("--") && a !== "--check");
if (unknown.length > 0) {
  console.error(`gen-tables: unknown option ${unknown.join(", ")}\nusage: cli.ts [--check] [file…]`);
  process.exit(2);
}
const named = args.filter((a) => !a.startsWith("--"));
const files = named.length > 0 ? named : execFileSync("git", ["ls-files", "*.md"], { encoding: "utf8" }).split("\n").filter(Boolean);

const loaded = loadDevice(join("data", "devices", "bcr32"));
if (!loaded.ok) {
  console.error("gen-tables: the device data is not valid (run: npm run validate:data)");
  process.exit(1);
}

let failed = 0;
let blocks = 0;
for (const file of files) {
  const text = readFileSync(file, "utf8");
  const result = generate(text, loaded.data);
  blocks += result.blocks;
  for (const e of result.errors) console.error(`${file}:${e.line}: marker: ${e.message}`);
  if (result.errors.length > 0) {
    failed++;
    continue;
  }
  if (result.drift.length === 0) continue;
  if (check) {
    failed++;
    for (const d of result.drift) console.error(`${file}:${d.line}: drift: ${d.message} (run: npm run gen:tables)`);
  } else {
    writeFileSync(file, result.text);
    console.log(`wrote ${file}: ${result.drift.length} block(s) changed`);
  }
}
console.log(`gen-tables: ${blocks} block(s) in ${files.length} file(s), ${failed} file(s) with faults`);
process.exitCode = failed > 0 ? 1 : 0;
