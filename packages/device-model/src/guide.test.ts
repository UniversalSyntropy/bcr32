// Guide checks, ViewPatch and the purity rule of the package.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { GuideFile, loadDevice } from "@bcr32/device-data";

import { checkGuideActions, checkGuideAfter, elementIndex, ViewPatch } from "./index.ts";

const loaded = loadDevice(join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32"));
assert.ok(loaded.ok, "device data must load");
const data = loaded.data;
const els = elementIndex(data);

const guide = (step: Record<string, unknown>): GuideFile =>
  GuideFile.parse({
    id: "demo", version: 1, title: { key: "guide.demo.title", en: "Demo" }, firmware: "1.0.3", status: "unverified",
    start: { mode: "zaq", view: {} },
    steps: [{ id: "s1", focus: ["B59"], caption: { key: "guide.demo.s1", en: "Look." }, advance: "manual", ...step }],
  });
const messages = (issues: { message: string }[]) => issues.map((i) => i.message);

test("guide actions: a good action gives no issue; a step with no action is a look step", () => {
  assert.deepEqual(checkGuideActions(guide({ action: "press B59" }), els), []);
  assert.deepEqual(checkGuideActions(guide({}), els), []);
});

test("guide actions: a bad action names guide, step and offset", () => {
  assert.deepEqual(messages(checkGuideActions(guide({ action: "push B5" }), els)), [
    "guide 'demo', step 's1': action 'push B5': 'push' is for an encoder, 'B5' is a button (offset 5)",
  ]);
});

test("guide actions: a group target is an issue", () => {
  assert.deepEqual(messages(checkGuideActions(guide({ action: "turn E" }), els)), [
    "guide 'demo', step 's1': action 'turn E': a guide step names one control, not a group",
  ]);
  assert.equal(checkGuideActions(guide({ action: "hold B59 + turn E" }), els).length, 1);
});

test("guide after: a good patch gives no issue", () => {
  const after = { mode: "zaq", rings: { E25: { style: "bar", value: 40, min: 0, max: 127 } }, buttons: { B5: { colour: "red", blink: "slow" } }, display: null };
  assert.deepEqual(checkGuideAfter(guide({ after }), data), []);
});

test("guide after: pressed is not allowed", () => {
  assert.equal(checkGuideAfter(guide({ after: { pressed: ["B5"] } }), data).length, 1);
});

test("guide after: a ring key must be an encoder", () => {
  assert.deepEqual(messages(checkGuideAfter(guide({ after: { rings: { B5: { value: 1 } } } }), data)), [
    "guide 'demo', step 's1': after.rings.B5: 'B5' is not an encoder",
  ]);
});

test("guide after: a style must be a row of rings.json", () => {
  const issues = checkGuideAfter(guide({ after: { rings: { E25: { style: "wave" } } } }), data);
  assert.equal(issues.length, 1);
});

test("ViewPatch: null removes a key; an unknown key fails", () => {
  assert.ok(ViewPatch.safeParse({ rings: { E25: null }, display: null }).success);
  assert.ok(ViewPatch.safeParse({ rings: { E25: { value: null, style: null } } }).success);
  assert.ok(!ViewPatch.safeParse({ rings: { E25: { speed: 1 } } }).success);
  assert.ok(!ViewPatch.safeParse({ extra: 1 }).success);
});

// Purity: the model reads no file, clock, random source, network or DOM.
const FORBIDDEN = [
  "node:", "react", "document", "window", "setTimeout", "setInterval", "Date.now", "fetch",
  "import(", "require(", "import (", "require (", "new Date", "Date(", "Math.random", "performance.", "globalThis", "process.",
];

// Removes comments and string literals, so a word in a comment or a message does not fail the scan.
// Import specifiers are checked apart, before this runs.
function stripCommentsAndStrings(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""');
}

const forbiddenIn = (src: string) => FORBIDDEN.filter((w) => stripCommentsAndStrings(src).includes(w));

test("purity scan: each forbidden form fails and a comment passes", () => {
  const planted: Record<string, string> = {
    "import(": 'const m = await import("x");',
    "require(": 'const m = require("x");',
    "new Date": "const t = new Date();",
    "Date(": "const t = Date();",
    "Math.random": "const r = Math.random();",
    "performance.": "const t = performance.now();",
    globalThis: "globalThis.x = 1;",
    "process.": "process.exit(1);",
  };
  for (const [word, src] of Object.entries(planted)) assert.ok(forbiddenIn(src).includes(word), `${word} must fail`);
  assert.deepEqual(forbiddenIn("// new Date and Math.random\n/* process. import( */ const a = 'globalThis';"), []);
});

test("purity: source files import only relative paths, device-data and zod", () => {
  const files = readdirSync(import.meta.dirname).filter((n) => n.endsWith(".ts") && !n.endsWith(".test.ts"));
  assert.ok(files.length >= 5);
  for (const f of files) {
    const text = readFileSync(join(import.meta.dirname, f), "utf8");
    for (const m of text.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
      const spec = m[1]!;
      assert.ok(spec.startsWith("./") || spec === "@bcr32/device-data" || spec === "zod", `${f} imports '${spec}'`);
    }
    assert.deepEqual(forbiddenIn(text), [], `${f} holds a forbidden form`);
  }
});
