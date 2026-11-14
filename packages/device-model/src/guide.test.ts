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

// Limit: a regex literal that holds a slash or a quote can hide code after it on the same line.
// The device-model sources use none. Add a regex-aware case if one is ever needed.
// One pass over the source. It drops comments, string literals and the text parts of template
// literals, and keeps the code inside ${...}. A "//" inside a string is not a comment; a word in a
// comment or a message does not fail the scan. Import specifiers are checked apart, before this runs.
function stripCommentsAndStrings(src: string): string {
  let out = "";
  let i = 0;
  // Stack of open template literals: each entry counts the braces open inside its ${ }.
  const stack: number[] = [];
  const text = (quote: string) => {
    // Inside a string or template text: skip to the closing quote. Return true if a ${ opened.
    while (i < src.length) {
      const c = src[i]!;
      if (c === "\\") i += 2;
      else if (quote === "`" && c === "$" && src[i + 1] === "{") {
        i += 2;
        stack.push(0);
        out += " ";
        return;
      } else if (c === quote) {
        i++;
        return;
      } else i++;
    }
  };
  while (i < src.length) {
    const c = src[i]!;
    const n = src[i + 1];
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== "\n") i++;
    } else if (c === "/" && n === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? src.length : end + 2;
    } else if (c === '"' || c === "'") {
      i++;
      text(c);
      out += '""';
    } else if (c === "`") {
      i++;
      text("`");
      out += '""';
    } else if (stack.length > 0 && c === "{") {
      stack[stack.length - 1]!++;
      out += c;
      i++;
    } else if (stack.length > 0 && c === "}") {
      if (stack[stack.length - 1] === 0) {
        stack.pop();
        i++;
        text("`"); // back in the template text
        out += " ";
      } else {
        stack[stack.length - 1]!--;
        out += c;
        i++;
      }
    } else {
      out += c;
      i++;
    }
  }
  return out;
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

// L2 and L3: a "//" inside a string must not hide the code after it; a template body is code.
test("purity scan L2: a slash pair inside a string does not start a comment", () => {
  assert.ok(forbiddenIn('const s = "a // b"; Math.random();').includes("Math.random"));
  assert.ok(forbiddenIn("const s = 'http://x'; Math.random();").includes("Math.random"));
});

test("purity scan L3: the body of a template literal is scanned; its text is not", () => {
  assert.ok(forbiddenIn("const s = `${Math.random()}`;").includes("Math.random"));
  assert.ok(forbiddenIn("const s = `a ${ `b ${Math.random()}` } c`;").includes("Math.random"));
  assert.ok(forbiddenIn("const s = `a ${ { x: 1 }.x } ${Math.random()}`;").includes("Math.random"));
  assert.deepEqual(forbiddenIn("const s = `Math.random and globalThis in text`;"), []);
  assert.deepEqual(forbiddenIn("const s = `a ${1 + 1} // not a comment` + 2;"), []);
});

test("purity scan: a comment that holds the word passes", () => {
  assert.deepEqual(forbiddenIn("const a = 1; // Math.random\n/* globalThis */ const b = 2;"), []);
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
