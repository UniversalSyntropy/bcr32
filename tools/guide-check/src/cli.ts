// Usage: node cli.ts [--guides <dir>] [--device <dir>] [--root <dir>]
// Prints one line for each finding. Exit 1 on any error. Warnings print and do not fail.
import { join, resolve } from "node:path";

import { checkFolder } from "./index.ts";

const args = process.argv.slice(2);
const opt = (name: string, fallback: string): string => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1]! : fallback;
};
const known = new Set(["--guides", "--device", "--root"]);
for (let i = 0; i < args.length; i += 2) {
  if (!known.has(args[i]!)) {
    console.error(`guide-check: unknown option '${args[i]}'\nusage: cli.ts [--guides <dir>] [--device <dir>] [--root <dir>]`);
    process.exit(2);
  }
}
const root = resolve(opt("--root", process.cwd()));
const guides = resolve(opt("--guides", join(root, "docs", "guides", "data")));
const device = resolve(opt("--device", join(root, "data", "devices", "bcr32")));

const findings = checkFolder(guides, device, root);
for (const f of findings) console.error(`${f.file}: ${f.level}: ${f.check}: ${f.message}`);
const errors = findings.filter((f) => f.level === "error").length;
const warnings = findings.length - errors;
console.log(`guide-check: ${errors} errors, ${warnings} warnings`);
process.exit(errors > 0 ? 1 : 0);
