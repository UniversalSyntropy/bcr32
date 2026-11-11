// Usage: node cli.ts
// Proves that the section map points at headings that exist and that the documents name each element.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { loadDevice } from "@bcr32/device-data";

import { checkAnchors, checkElements, checkExtract, checkPages, type Docs, type Finding } from "./coverage.ts";

const DEVICE = join("data", "devices", "bcr32");
const EXTRACT = join("reference", "extract", "manual-raw.txt"); // git-ignored; present on the owner's computer only
const PAGES = { first: 14, last: 34 }; // English part of the official manual, by spread

if (process.argv.length > 2) {
  console.error("coverage-check: this command takes no arguments\nusage: cli.ts");
  process.exit(2);
}
const loaded = loadDevice(DEVICE);
if (!loaded.ok) {
  console.error("coverage-check: the device data is not valid (run: npm run validate:data)");
  process.exit(1);
}
const data = loaded.data;
if (data.sectionMap.length === 0) {
  console.error(`coverage-check: ${join(DEVICE, "section-map.json")} is missing or empty`);
  process.exit(1);
}

const tracked = execFileSync("git", ["ls-files", "docs/reference/*.md", "docs/manual/*.md"], { encoding: "utf8" }).split("\n").filter(Boolean);
const docs: Docs = {
  read: (path) => (existsSync(path) ? readFileSync(path, "utf8") : undefined),
  manualDocs: tracked,
};

const findings: Finding[] = [...checkAnchors(data, docs), ...checkElements(data, docs), ...checkPages(data, PAGES.first, PAGES.last)];
const local = existsSync(EXTRACT);
if (local) findings.push(...checkExtract(data, readFileSync(EXTRACT, "utf8")));

for (const f of findings) console.error(`${f.where}: ${f.rule}: ${f.message}`);
const excluded = data.sectionMap.filter((i) => i.excluded !== undefined).length;
console.log(
  `coverage-check: ${data.sectionMap.length} manual parts (${excluded} excluded with a reason), ${data.elements.length} elements, ` +
    `${tracked.length} document(s), extract check ${local ? "on" : "off (no local extract)"}, ${findings.length} finding(s)`,
);
process.exitCode = findings.length > 0 ? 1 : 0;
