// Planted faults (one for each of the 13 checks), the folder reader, and a replay of the three real guides.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { GuideFile, loadDevice } from "@bcr32/device-data";
import { demoEngine, guideEngine, type ClockTick, type ControlEvent } from "@bcr32/device-model";

import { checkFolder, checkGuideData, type CheckName, type Ctx, type Finding } from "./index.ts";

const root = join(import.meta.dirname, "..", "..", "..");
const deviceDir = join(root, "data", "devices", "bcr32");
const loaded = loadDevice(deviceDir);
assert.ok(loaded.ok && loaded.data.timing !== undefined, "device data must load");
const device = loaded.data;

const DOC = "docs/guides/demo.md";
const docs: Record<string, string> = { [DOC]: "Interactive version: `?guide=demo-guide` (2 steps).\n" };
const ctx: Ctx = { device, readDoc: (p) => docs[p] };

const base = () => ({
  id: "demo-guide", version: 1, title: { key: "guide.demo.title", en: "Demo" }, doc: DOC, firmware: "1.0.3", status: "unverified",
  start: { mode: "zaq", view: {} },
  steps: [
    { id: "open", action: "press B59", focus: ["B59", "B60"], after: { mode: "zaq-global" }, caption: { key: "guide.demo.s1", en: "Press {B59}." }, expect: { key: "guide.demo.s1x", en: "The Global page opens." }, advance: "on-action" },
    { id: "leave", action: "press B60", focus: ["B59", "B60"], after: { mode: "zaq" }, caption: { key: "guide.demo.s2", en: "Press {B60}." }, advance: "on-action" },
  ],
});
type Raw = ReturnType<typeof base>;
const run = (mut: (g: Raw) => void, c: Ctx = ctx): Finding[] => {
  const g = base();
  mut(g);
  return checkGuideData("demo-guide", g, c);
};
const errors = (f: Finding[]) => f.filter((x) => x.level === "error");

test("the base guide has no finding", () => {
  assert.deepEqual(checkGuideData("demo-guide", base(), ctx), []);
});

// One planted fault for each check: [check, level, change, step in the message].
const CASES: [CheckName, "error" | "warning", (g: Raw) => void, string][] = [
  ["Schema", "error", (g) => void delete (g as Partial<Raw>).title, ""],
  ["IDs", "error", (g) => (g.steps[0]!.focus = ["B59", "B999"]), "open"],
  ["Grammar", "error", (g) => (g.steps[0]!.action = "push B59"), "open"],
  ["After", "error", (g) => ((g.steps[0] as Record<string, unknown>).after = { pressed: ["B59"] }), "open"],
  ["Ring", "error", (g) => ((g.steps[0] as Record<string, unknown>).after = { rings: { E25: { style: "pan/off" } } }), "open"],
  ["Focus", "error", (g) => (g.steps[0]!.focus = ["B60"]), "open"],
  ["Tokens", "error", (g) => (g.steps[0]!.caption.en = "Press B59."), "open"],
  ["Text", "error", (g) => (g.steps[0]!.caption.en = "Press {B59} and then wait for the unit to show the page that you need for the next part of this task."), "open"],
  ["Status", "error", (g) => ((g.status = "verified"), (g.firmware = "latest")), ""],
  ["Mode path", "warning", (g) => (g.steps[1]!.after = { mode: "zaq-global" }), "leave"],
  ["Unknown lit", "warning", (g) => (g.steps[0]!.after = { mode: "zaq-store" }), "open"],
  ["Drift", "error", (g) => (g.doc = "docs/guides/missing.md"), ""],
  ["Not simulated", "warning", (g) => (g.steps[1]!.after = { mode: "memory-erase" }), "leave"],
];

for (const [check, level, change, step] of CASES) {
  test(`planted fault: ${check} (${level})`, () => {
    const hits = run(change).filter((f) => f.check === check);
    assert.ok(hits.length > 0, `no '${check}' finding`);
    assert.ok(hits.every((f) => f.level === level), `level of '${check}'`);
    assert.ok(hits.some((f) => f.message.includes(step === "" ? "demo-guide" : `step '${step}'`)), `the message names the guide and the step: ${hits.map((h) => h.message).join(" | ")}`);
    if (level === "warning") assert.deepEqual(errors(run(change)), [], "a warning does not fail");
    else assert.ok(errors(run(change)).length > 0);
  });
}

test("planted fault: Drift also fails on a wrong step count and a missing link", () => {
  const wrong = { ...ctx, readDoc: () => "Interactive version: `?guide=demo-guide` (3 steps).\n" };
  assert.ok(run(() => {}, wrong).some((f) => f.check === "Drift" && f.message.includes("says 3 steps")));
  const none = { ...ctx, readDoc: () => "No link here.\n" };
  assert.ok(run(() => {}, none).some((f) => f.check === "Drift"));
});

test("Status: a verified guide with a step that is not a unit test fails", () => {
  const f = run((g) => {
    g.status = "verified";
    (g.steps[0] as Record<string, unknown>).source = { source: "manual" };
  });
  assert.ok(f.some((x) => x.check === "Status" && x.message.includes("step 'open'")));
});

test("Text: a combo action allows two verbs, a simple action one", () => {
  const combo = run((g) => {
    g.steps[0]!.action = "hold B59 + press B60";
    g.steps[0]!.caption.en = "Hold {B59} and press {B60}.";
  });
  assert.deepEqual(combo.filter((f) => f.check === "Text"), []);
  assert.ok(run((g) => (g.steps[0]!.caption.en = "Hold {B59} and press {B60}.")).some((f) => f.check === "Text"));
});

// The check reads the working tree. A folder outside git has no tracked file, so git ls-files would find none.
test("the folder reader finds a guide file that git does not track", () => {
  const tmp = mkdtempSync(join(tmpdir(), "guide-check-"));
  mkdirSync(join(tmp, "docs", "guides", "data"), { recursive: true });
  writeFileSync(join(tmp, "docs", "guides", "demo.md"), docs[DOC]!);
  const bad = base();
  bad.steps[0]!.focus = ["B60"];
  writeFileSync(join(tmp, "docs", "guides", "data", "demo-guide.json"), JSON.stringify(bad));
  const f = checkFolder(join(tmp, "docs", "guides", "data"), deviceDir, tmp);
  assert.ok(f.some((x) => x.check === "Focus" && x.file === "demo-guide.json"), JSON.stringify(f));
  writeFileSync(join(tmp, "docs", "guides", "data", "broken.json"), "{");
  assert.ok(checkFolder(join(tmp, "docs", "guides", "data"), deviceDir, tmp).some((x) => x.file === "broken.json" && x.check === "Schema"));
});

// The three real guides: no error; the warnings are listed; a literal event list plays each one to the end.
const real = checkFolder(join(root, "docs", "guides", "data"), deviceDir, root);

test("the three real guide files pass with only the listed warnings", () => {
  assert.deepEqual(errors(real), []);
  const rows = real.map((f) => `${f.file}|${f.check}`).sort();
  assert.deepEqual([...new Set(rows)], ["store-pattern.json|Unknown lit"]);
  assert.equal(real.filter((f) => f.check === "Unknown lit").length, 3);
});

type Evt = ControlEvent | ClockTick;
const press = (id: string, t: number): Evt => ({ type: "press", id, t });
const release = (id: string, t: number): Evt => ({ type: "release", id, t });
const turn = (id: string, steps: number, t: number): Evt => ({ type: "turn", id, steps, t });
const tick = (t: number): Evt => ({ type: "tick", t });

const HOLD = device.timing!.holdMs;
const demo = { elements: device.elements, modes: device.modes, timing: device.timing! };
const play = (name: string, events: Evt[], phases: string[]) => {
  const guide = GuideFile.parse(JSON.parse(readFileSync(join(root, "docs", "guides", "data", `${name}.json`), "utf8")));
  const e = guideEngine(guide, () => demoEngine(demo), demo);
  const seen: string[] = [];
  for (const ev of events) {
    e.dispatch(ev);
    seen.push(`${e.getStep().index}${e.getStep().phase[0]}`);
  }
  assert.deepEqual([...new Set(seen)].join(" "), phases.join(" "));
  e.next();
  assert.equal(e.getStep().phase, "done");
  return e;
};

test("replay: store-pattern ends in done; the log lists the engine gap", () => {
  const e = play(
    "store-pattern",
    [press("B61", 0), tick(HOLD), press("B5", 600), release("B5", 610), press("B60", 700), release("B60", 710), release("B61", 720), press("SEL", 800), press("B61", 810), release("B61", 820), release("SEL", 830)],
    ["0c", "0r", "1r", "2r", "3c", "3r"],
  );
  assert.deepEqual(e.getLog().map((g) => `${g.step} ${g.field}`), ["press-slot buttons.B61.colour", "press-slot buttons.B61.blink"]);
});

test("replay: choose-clock ends in done; the log lists the engine gap", () => {
  const e = play("choose-clock", [press("B59", 0), release("B59", 10), turn("E26", 1, 20), press("B60", 30), release("B60", 40)], ["0r", "1r", "2r"]);
  assert.deepEqual(e.getLog(), []);
});

test("replay: all-steps-length ends in done; the log is empty", () => {
  const e = play("all-steps-length", [press("B9", 0), release("B9", 10), press("B9", 20), turn("E25", 1, 30), release("B9", 40)], ["0r", "1c", "1r"]);
  assert.deepEqual(e.getLog(), []);
});
