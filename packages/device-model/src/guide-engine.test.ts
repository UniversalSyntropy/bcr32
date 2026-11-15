import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import { GuideFile, loadDevice } from "@bcr32/device-data";

import { demoEngine } from "./demo-engine.ts";
import { eventsForAction, guideEngine, type GuideEngine } from "./guide-engine.ts";
import { foldPatches } from "./guide-patch.ts";
import { parseAction, elementIndex } from "./action.ts";
import type { ClockTick, ControlEvent, PanelView } from "./view.ts";

const loaded = loadDevice(join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32"));
assert.ok(loaded.ok && loaded.data.timing !== undefined, "device data must load");
const data = loaded.data;
const demo = { elements: data.elements, modes: data.modes, timing: data.timing! };
const HOLD = data.timing!.holdMs;

type Evt = ControlEvent | ClockTick;
const press = (id: string, t: number): Evt => ({ type: "press", id, t });
const release = (id: string, t: number): Evt => ({ type: "release", id, t });
const turn = (id: string, steps: number, t: number): Evt => ({ type: "turn", id, steps, t });
const tick = (t: number): Evt => ({ type: "tick", t });

const step = (id: string, extra: Record<string, unknown>) => ({
  id, focus: ["B59"], caption: { key: `guide.t.${id}`, en: "Look." }, advance: "on-action", ...extra,
});
const make = (steps: Record<string, unknown>[], start: Record<string, unknown> = {}): GuideFile =>
  GuideFile.parse({
    id: "t", version: 1, title: { key: "guide.t.title", en: "T" }, firmware: "1.0.3", status: "unverified",
    start: { mode: "zaq", view: start }, steps,
  });
const run = (g: GuideFile, events: Evt[]): GuideEngine => {
  const e = guideEngine(g, () => demoEngine(demo), demo);
  for (const ev of events) e.dispatch(ev);
  return e;
};
const phase = (e: GuideEngine) => `${e.getStep().index}:${e.getStep().phase}`;

// Matching tables: one case for each kind that parseAction gives.
const TABLE: { action: string; good: Evt[]; bad: Evt[] }[] = [
  { action: "press B5", good: [press("B5", 1)], bad: [release("B5", 1), tick(2)] },
  { action: "tap B5", good: [press("B5", 1), release("B5", 5)], bad: [press("B6", 1)] },
  { action: "push E25", good: [press("E25", 1)], bad: [turn("E25", 1, 1)] },
  { action: "release B5", good: [press("B5", 1), release("B5", 5)], bad: [press("B5", 1)] },
  { action: "turn E25 cw", good: [turn("E25", 1, 1)], bad: [turn("E25", -1, 1), turn("E26", 1, 2)] },
  { action: "turn E25 cw ×2", good: [turn("E25", 1, 1), turn("E25", 1, 2)], bad: [turn("E25", 1, 1)] },
  { action: "hold B61", good: [press("B61", 0), tick(HOLD)], bad: [press("B61", 0), tick(HOLD - 1)] },
  { action: "B1 ×3s", good: [press("B1", 0), tick(3000)], bad: [press("B1", 0), tick(2999), release("B1", 2999)] },
  { action: "hold B9 + press B5", good: [press("B9", 0), press("B5", 5)], bad: [press("B5", 5), press("B9", 6)] },
  { action: "hold B9 + turn E25 cw", good: [press("B9", 0), turn("E25", 1, 5)], bad: [turn("E25", 1, 5), press("B9", 6)] },
  { action: "hold SEL + push E25", good: [press("SEL", 0), press("E25", 4)], bad: [press("E25", 4)] },
  { action: "press B5 and B6 together", good: [press("B5", 0), press("B6", 5)], bad: [press("B5", 0), release("B5", 1), press("B6", 5)] },
];

for (const row of TABLE) {
  test(`matching: '${row.action}' accepts its events and rejects others`, () => {
    const g = make([step("s1", { action: row.action, focus: ["B5", "B6", "B9", "B61", "B1", "E25", "SEL"] })]);
    assert.equal(phase(run(g, row.good)), "0:result", "good list");
    assert.equal(run(g, row.bad).getStep().phase, "cue", "bad list");
  });
}

test("a wrong control gives a hint and never advances", () => {
  const g = make([step("s1", { action: "press B5" })]);
  const e = run(g, [press("B7", 1)]);
  assert.equal(e.getStep().phase, "cue");
  assert.equal(e.getStep().hint, "wrong-control");
  e.dispatch(press("B5", 2));
  assert.equal(e.getStep().phase, "result");
  assert.equal(e.getStep().hint, undefined);
});

test("a wrong direction gives its hint; a short hold gives its hint", () => {
  const e = run(make([step("s1", { action: "turn E25 cw", focus: ["E25"] })]), [turn("E25", -1, 1)]);
  assert.equal(e.getStep().hint, "wrong-direction");
  const h = run(make([step("s1", { action: "hold B61", focus: ["B61"] })]), [press("B61", 0), release("B61", 10)]);
  assert.equal(h.getStep().hint, "hold-longer");
  assert.equal(h.getStep().phase, "cue");
});

test("a release or a tick never fails a step", () => {
  const g = make([step("s1", { action: "press B5" })]);
  assert.equal(phase(run(g, [release("B9", 1), tick(2), release("B5", 3), press("B5", 4), release("B5", 5), tick(6)])), "0:result");
  const e = run(g, [release("B5", 1), tick(2)]);
  assert.equal(e.getStep().hint, undefined);
  assert.equal(e.getStep().phase, "cue");
});

test("turn: a target value advances only when the ring reaches it", () => {
  const g = make(
    [step("s1", { action: "turn E25 cw", focus: ["E25"], target: { E25: { value: 3 } } })],
    { rings: { E25: { style: "bar", encMode: "absolute", value: 1, min: 0, max: 127, known: true, source: "fixture" } } },
  );
  const withRing = () => demoEngine(demo, { rings: { E25: { style: "bar", encMode: "absolute", value: 1, min: 0, max: 127, known: true, source: "fixture" } } });
  const e = guideEngine(g, withRing, demo);
  e.dispatch(turn("E25", 1, 1));
  assert.equal(e.getStep().phase, "cue", "value 2, target 3");
  e.dispatch(turn("E25", 1, 2));
  assert.equal(e.getStep().phase, "result");
  assert.deepEqual(e.getLog(), []);
});

test("turn: a ring with no value advances on direction and count and logs 'no target check'", () => {
  const g = make([step("s1", { action: "turn E26 cw", focus: ["E26"], target: { E26: { valueText: "USB" } } })]);
  const e = run(g, [turn("E26", 1, 1)]);
  assert.equal(phase(e), "0:result");
  assert.deepEqual(e.getLog().map((x) => [x.step, x.field, x.engine]), [["s1", "target.E26", "no target check"]]);
});

test("gap log: an after that disagrees with the demo engine is logged; one that agrees is not", () => {
  const g = make([
    step("s1", { action: "press B59", after: { mode: "zaq-global" } }),
    step("s2", { action: "press B60", after: { mode: "ctrl" } }),
  ]);
  const e = run(g, [press("B59", 1), release("B59", 2), press("B60", 3)]);
  assert.deepEqual(e.getLog().map((x) => [x.step, x.field, x.engine, x.patch]), [["s2", "mode", "zaq", "ctrl"]]);
  assert.equal(e.getView().mode, "ctrl", "the patch wins");
});

test("the next step starts when the user does its action in the result phase", () => {
  const g = make([step("s1", { action: "press B59" }), step("s2", { action: "press B5", focus: ["B5"] })]);
  const e = run(g, [press("B59", 1)]);
  assert.equal(phase(e), "0:result");
  e.dispatch(press("B7", 2));
  assert.equal(phase(e), "0:result", "an input for no step is ignored");
  e.dispatch(press("B5", 3));
  assert.equal(phase(e), "1:result");
});

test("held: a key that stays down serves the combo of the next step", () => {
  const g = make([
    step("s1", { action: "hold B9", focus: ["B9"], held: ["B9"] }),
    step("s2", { action: "hold B9 + turn E25 cw", focus: ["B9", "E25"] }),
  ]);
  const e = run(g, [press("B9", 0), tick(HOLD)]);
  assert.deepEqual(e.getStep().held, ["B9"]);
  assert.ok(e.getView().pressed.includes("B9"));
  e.dispatch(turn("E25", 1, HOLD + 5));
  assert.equal(phase(e), "1:result");
});

test("steps: Show me applies the step; the last Next gives done; Next on a manual step", () => {
  const g = make([
    step("s1", { action: "hold B61", focus: ["B61"], after: { mode: "zaq-store" } }),
    step("s2", { focus: ["B60"], advance: "manual", after: { display: { lines: ["X"], known: true } }, expect: { key: "guide.t.s2x", en: "Done." } }),
  ]);
  const e = guideEngine(g, () => demoEngine(demo), demo);
  e.next();
  assert.equal(phase(e), "0:result");
  assert.equal(e.getView().mode, "zaq-store");
  assert.deepEqual(e.getLog(), []);
  e.next();
  assert.equal(phase(e), "1:cue");
  e.next();
  assert.equal(phase(e), "1:result");
  assert.deepEqual(e.getView().display, { lines: ["X"], known: true });
  e.next();
  assert.equal(e.getStep().phase, "done");
  e.next();
  assert.equal(e.getStep().phase, "done");
});

// Back equals a fresh fold: the view of step 3 cue is the three start patches in order.
test("back() rebuilds from the start and equals a fresh fold", () => {
  const g = make(
    [
      step("s1", { action: "press B59", after: { mode: "zaq-global", buttons: { B59: { colour: "pink", blink: "slow" } } } }),
      step("s2", { action: "press B60", after: { mode: "zaq", buttons: { B59: null } } }),
      step("s3", { action: "press B61", after: { display: { lines: ["A"], known: true } } }),
    ],
    { display: { lines: [], known: false } },
  );
  const e = run(g, [press("B59", 1), release("B59", 2), press("B60", 3), release("B60", 4)]);
  assert.equal(phase(e), "1:result");
  e.next();
  assert.equal(phase(e), "2:cue");
  e.next(); // Show me step 3
  assert.equal(phase(e), "2:result");
  assert.deepEqual(e.getView().display, { lines: ["A"], known: true });
  e.back(); // result of 3 to cue of 3
  assert.equal(phase(e), "2:cue");
  assert.deepEqual(e.getView().display, { lines: [], known: false });
  const fresh = guideEngine(g, () => demoEngine(demo), demo);
  for (const ev of [press("B59", 1), release("B59", 2), press("B60", 3), release("B60", 4)]) fresh.dispatch(ev);
  fresh.next();
  assert.deepEqual(e.getView(), fresh.getView());
  e.back(); // cue of 3 to cue of 2
  assert.equal(phase(e), "1:cue");
  assert.equal(e.getView().mode, "zaq-global");
  assert.deepEqual(e.getView().buttons.B59, { colour: "pink", blink: "slow" });
  assert.deepEqual(e.getLog().map((x) => x.step), e.getLog().filter((x) => x.step === "s1").map((x) => x.step));
  e.restart();
  assert.equal(phase(e), "0:cue");
  assert.equal(e.getView().mode, "zaq");
  assert.deepEqual(e.getLog(), []);
});

test("replay: the same event list twice gives equal steps and equal views", () => {
  const g = make([
    step("s1", { action: "hold B61", focus: ["B61"], held: ["B61"], after: { mode: "zaq-store" } }),
    step("s2", { action: "press B5", focus: ["B5"] }),
  ]);
  const list = [press("B61", 0), tick(HOLD), press("B5", HOLD + 5), release("B5", HOLD + 6)];
  const a = run(g, list);
  const b = run(g, list);
  assert.deepEqual(a.getStep(), b.getStep());
  assert.deepEqual(a.getView(), b.getView());
  assert.deepEqual(a.getLog(), b.getLog());
  assert.equal(phase(a), "1:result");
});

test("the view is the fold of the patches over the inner view", () => {
  const g = make([step("s1", { action: "press B59", after: { mode: "zaq-global", display: { lines: ["G"], known: true } } })], { buttons: { B1: { colour: "blue", blink: "none" } } });
  const e = run(g, [press("B59", 1)]);
  const inner = demoEngine(demo);
  inner.dispatch(press("B59", 1));
  const want = foldPatches<PanelView>(inner.getView(), [{ mode: "zaq", buttons: { B1: { colour: "blue", blink: "none" } } }, { mode: "zaq-global", display: { lines: ["G"], known: true } }]);
  assert.deepEqual({ ...e.getView(), pressed: [] }, { ...want, pressed: [] });
});

test("subscribers hear each change; a bad action fails at load", () => {
  const e = guideEngine(make([step("s1", { action: "press B59" })]), () => demoEngine(demo), demo);
  let n = 0;
  const off = e.subscribe(() => n++);
  e.dispatch(press("B59", 1));
  e.back();
  off();
  e.restart();
  assert.equal(n, 2);
  assert.throws(() => guideEngine(make([step("s1", { action: "push B5" })]), () => demoEngine(demo), demo), /guide 't', step 's1'/);
  assert.throws(() => guideEngine(make([step("s1", { action: "turn E" })]), () => demoEngine(demo), demo), /not a group/);
  assert.throws(() => guideEngine(make([step("s1", { action: "press B5, then press B6" })]), () => demoEngine(demo), demo), /no sequence/);
});

test("eventsForAction gives events that complete the action", () => {
  const els = elementIndex(data);
  for (const row of TABLE) {
    const r = parseAction(row.action, els);
    assert.ok(r.ok);
    const g = make([step("s1", { action: row.action, focus: ["B5", "B6", "B9", "B61", "B1", "E25", "SEL"] })]);
    assert.equal(phase(run(g, eventsForAction(r.action, [], [], 100, HOLD))), "0:result", row.action);
  }
});
