// Planted-fault tests for coverage-check (playbook step 1.5).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice, type DeviceData } from "@bcr32/device-data";

import { checkAnchors, checkElements, checkExtract, checkPages, type Docs } from "./coverage.ts";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const loaded = loadDevice(join(ROOT, "data", "devices", "bcr32"));
assert.ok(loaded.ok);
const real = loaded.data;

const DOC = "docs/manual.md";
const item = (over: object) => ({ id: "controls", kind: "section" as const, title: "CONTROLS", page: 16, anchors: [`${DOC}#controls`], ...over });
const withMap = (...items: object[]): DeviceData => ({ ...real, sectionMap: items as DeviceData["sectionMap"] });
const docs = (text: string): Docs => ({ read: (p) => (p === DOC ? text : undefined), manualDocs: [DOC] });

test("anchor: a heading that exists passes; duplicates get a number", () => {
  const text = "# Manual\n\n## Controls\n\n## Controls\n";
  assert.deepEqual(checkAnchors(withMap(item({})), docs(text)), []);
  assert.deepEqual(checkAnchors(withMap(item({ anchors: [`${DOC}#controls-1`] })), docs(text)), []);
});

test("planted fault: a renamed heading fails", () => {
  const findings = checkAnchors(withMap(item({})), docs("# Manual\n\n## Control map\n"));
  assert.equal(findings.length, 1);
  assert.match(findings[0]!.message, /has no heading '#controls'/);
});

test("planted fault: a heading inside a code fence does not count", () => {
  assert.equal(checkAnchors(withMap(item({})), docs("# Manual\n\n```md\n## Controls\n```\n")).length, 1);
});

test("planted fault: a missing document fails", () => {
  const findings = checkAnchors(withMap(item({ anchors: ["docs/gone.md#controls"] })), docs("# Manual\n"));
  assert.match(findings[0]!.message, /document 'docs\/gone.md' does not exist/);
});

test("an excluded item needs no anchor", () => {
  assert.deepEqual(checkAnchors(withMap({ id: "legal", kind: "section", title: "Legal", page: 2, excluded: "Legal text." }), docs("# Manual\n")), []);
});

test("element: ranges, lists and callout-level LED IDs cover their elements", () => {
  const text = "# M\n\nB1, B5–B24, E25–E56, SEL, DISP, B59–68, J69–J85, L2, L3 and L4.\n";
  assert.deepEqual(checkElements(real, docs(text)), []);
});

test("planted fault: an element that no document names fails", () => {
  const text = "# M\n\nB1, B5–B24, E25–E56, SEL, DISP, B59–B67, J69–J85, L2, L3 and L4.\n\n```\nB68\n```\n";
  const findings = checkElements(real, docs(text));
  assert.deepEqual(findings.map((f) => f.where), ["B68"]);
});

test("planted fault: a spread with no item fails", () => {
  const map = withMap(item({ page: 14 }), item({ id: "b", page: 18 }));
  assert.deepEqual(checkPages(map, 14, 18).map((f) => f.where), ["page 16"]);
  assert.deepEqual(checkPages(map, 14, 14), []);
});

test("extract: a quoted title must be in the extract; a described title is not compared", () => {
  const extract = "BCR32   Controls\nZAQ – MODE\n";
  assert.deepEqual(checkExtract(withMap(item({ title: "BCR32 CONTROLS" }), item({ id: "z", title: "ZAQ MODE" })), extract), []);
  assert.deepEqual(checkExtract(withMap(item({ title: "CTRL MODE" })), extract).map((f) => f.where), ["controls"]);
  const described = item({ title: "Rear panel, callouts", note: "The official manual prints no single heading for this part. The title is a description." });
  assert.deepEqual(checkExtract(withMap(described), extract), []);
});

test("the real section map and the real documents pass", () => {
  const run = spawnSync(process.execPath, [join(import.meta.dirname, "cli.ts")], { cwd: ROOT, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /0 finding\(s\)/);
  assert.equal(spawnSync(process.execPath, [join(import.meta.dirname, "cli.ts"), "x"], { cwd: ROOT }).status, 2);
});
