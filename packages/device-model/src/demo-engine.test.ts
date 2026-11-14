// DemoEngine: replay tests. The mode table is generated from modes.json, never copied.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice, type Mode } from "@bcr32/device-data";

import { demoEngine, eventsOf, initialDemo, loadDemo, NOT_SIMULATED, pathTo, reduceDemo, viewOf, type ClockTick, type ControlEvent, type DemoData, type DemoState } from "./index.ts";

type In = ControlEvent | ClockTick;

const loaded = loadDevice(join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32"));
assert.ok(loaded.ok, "device data loads");
const d = loaded.data;
const real: DemoData = { elements: d.elements, modes: d.modes, timing: d.timing! };
const HOLD = real.timing.holdMs;

const run = (events: In[], data: DemoData = real, from?: DemoState): DemoState => events.reduce((s, e) => reduceDemo(s, e, data), from ?? initialDemo(data));
const top = (s: DemoState) => s.stack[s.stack.length - 1];
const press = (id: string, t: number): In => ({ type: "press", id, t });
const release = (id: string, t: number): In => ({ type: "release", id, t });
const tick = (t: number): In => ({ type: "tick", t });
const tap = (id: string, t: number): In[] => [press(id, t), release(id, t + 50)];
const rule = (mode: string, kind: "enter" | "exit", i = 0) => loadDemo(real).rules.filter((r) => r.mode === mode && r.kind === kind)[i]!;
const last = (events: In[]) => events[events.length - 1]!.t;

// A small planted device: buttons B5 to B8, two modes.
const plant = (modes: Partial<Mode>[], timing = { holdMs: 500, sequenceMs: 2000, prov: "assumed" as const }): DemoData => ({
  elements: ["B5", "B6", "B7", "B8"].map((id) => ({ id, kind: "button" as const })).concat([{ id: "E25", kind: "encoder" as never }]),
  timing,
  modes: modes.map((m) => ({ name: m.id!, kind: "state", exit: [], lit: [], source: { source: "manual", ref: "x" }, enter: [{ action: "press B5" }], ...m }) as Mode),
});
const BASE: Partial<Mode> = { id: "base", kind: "mode", enter: [{ action: "press B8" }] };

test("tap B1 swaps ZAQ and CTRL, B1 changes colour (literal replay)", () => {
  assert.equal(viewOf(run([]), real).buttons["B1"]?.colour, "pink");
  const a = run(tap("B1", 0));
  assert.equal(top(a), "ctrl");
  assert.deepEqual(viewOf(a, real).buttons["B1"], { colour: "amber", blink: "none" });
  const b = run(tap("B1", 1000), real, a);
  assert.equal(top(b), "zaq");
  assert.deepEqual(viewOf(b, real).buttons["B1"], { colour: "pink", blink: "none" });
  assert.equal(b.stack.length, 1);
});

// One named test for each mode. The expected modes come from the data.
const names = new Set(real.modes.map((m) => m.id));
for (const m of real.modes.filter((x) => NOT_SIMULATED[x.id] === undefined)) {
  test(`mode ${m.id} (${m.kind}): enter from its 'from', exit returns`, () => {
    const from = m.enter[0]!.from;
    const starts = from === undefined ? ["zaq", "ctrl"] : [from]; // no 'from': the data says any mode
    for (const start of starts) {
      const path = pathTo(start, real)!;
      assert.ok(path !== undefined, `a path to '${start}'`);
      const before = run(path);
      assert.equal(top(before), start);
      const enter = eventsOf(rule(m.id, "enter"), real, last(path.length > 0 ? path : [tick(0)]) + 5000);
      const inside = run(enter, real, before);
      assert.equal(top(inside), m.id, `'${m.enter[0]!.action}' opens '${m.id}' from '${start}'`);
      if (m.kind === "mode") continue; // the base modes swap; they have no exit
      m.exit.forEach((_, i) => {
        const out = run(eventsOf(rule(m.id, "exit", i), real, last(enter) + 5000), real, inside);
        assert.equal(top(out), start, `exit '${m.exit[i]!.action}' leaves '${m.id}'`);
      });
    }
  });
  if (m.enter[0]!.from !== undefined) {
    test(`mode ${m.id}: the enter action does nothing outside '${m.enter[0]!.from}'`, () => {
      const wrong = m.enter[0]!.from === "zaq" ? "ctrl" : "zaq";
      const before = run(pathTo(wrong, real)!);
      const out = run(eventsOf(rule(m.id, "enter"), real, 100000), real, before);
      assert.notEqual(top(out), m.id);
    });
  }
}

test("the three modes with no start state are named, not simulated, and have no rule", () => {
  const ids = Object.keys(NOT_SIMULATED).sort();
  assert.deepEqual(ids, ["memory-erase", "sysex-export", "sysex-import"]);
  for (const id of ids) {
    assert.ok(names.has(id), id);
    assert.ok(NOT_SIMULATED[id]!.length > 0);
    assert.equal(loadDemo(real).rules.some((r) => r.mode === id), false);
    assert.equal(pathTo(id, real), undefined);
  }
});

test("the path helper reaches every simulated mode and each path replays to it", () => {
  for (const m of real.modes.filter((x) => NOT_SIMULATED[x.id] === undefined)) {
    const p = pathTo(m.id, real);
    assert.ok(p !== undefined, m.id);
    assert.equal(top(run(p)), m.id);
  }
});

test("timed: B1 for 3 s fires at 3000 ms, not at 2999 ms; an early release cancels", () => {
  assert.equal(top(run([press("B1", 100), tick(3099)])), "zaq");
  assert.equal(top(run([press("B1", 100), tick(3100)])), "global-settings");
  const early = run([press("B1", 0), tick(2999), release("B1", 3000), tick(9000)]);
  assert.equal(top(early), "zaq");
  const open = run([press("B1", 0), tick(3000), release("B1", 3001)]);
  assert.deepEqual(open.stack, ["zaq", "global-settings"]);
  assert.deepEqual(Object.keys(open.down), []);
});

test("hold: 'hold B61' fires at holdMs; a quick tap does not", () => {
  assert.equal(top(run([press("B61", 0), tick(HOLD - 1)])), "zaq");
  assert.equal(top(run([press("B61", 0), tick(HOLD)])), "zaq-store");
  assert.equal(top(run([...tap("B61", 0), tick(HOLD * 3)])), "zaq");
});

test("combo: hold B59 + press B61 needs B59 down; B61 alone does nothing", () => {
  assert.equal(top(run([press("B59", 0), press("B61", 10)])), "zaq-settings");
  assert.equal(top(run([...tap("B61", 0)])), "zaq");
  // the held key and the second key are used: neither opens another page when released
  const s = run([press("B59", 0), press("B61", 10), release("B61", 20), release("B59", 30), tick(5000)]);
  assert.deepEqual(s.stack, ["zaq", "zaq-settings"]);
  // B59 alone opens the global page on release
  assert.equal(top(run(tap("B59", 0))), "zaq-global");
});

test("combo with a turn: hold B59 + turn opens CTRL Edit", () => {
  const ctrl = run(tap("B1", 0));
  const s = run([press("B59", 1000), { type: "turn", id: "E30", steps: 1, t: 1010 }], real, ctrl);
  assert.equal(top(s), "ctrl-edit");
});

test("sequence: the second step opens the mode inside sequenceMs, not after", () => {
  const data = plant([BASE, { id: "two", enter: [{ action: "press B5, then press B6", from: "base" }], exit: [{ action: "press B8" }] }]);
  assert.equal(top(run([press("B5", 0), release("B5", 1), press("B6", 1999)], data)), "two");
  assert.equal(top(run([press("B5", 0), release("B5", 1), press("B6", 2000)], data)), "two");
  assert.equal(top(run([press("B5", 0), release("B5", 1), press("B6", 2001)], data)), "base");
  assert.equal(top(run([press("B6", 0)], data)), "base");
});

test("unknown: a lit rule with no cond, or a cond the demo cannot test, is drawn unknown", () => {
  const v = viewOf(run([]), real);
  assert.equal(v.buttons["B5"], undefined); // paramInUse
  assert.ok(v.unknownLit!.includes("B5"));
  assert.ok(v.unknownLit!.includes("B21")); // trackPlays, then selectedTrack
  assert.equal(v.buttons["B21"], undefined);
  const mixer = viewOf(run(pathTo("zaq-mixer", real)!), real);
  assert.ok(mixer.unknownLit!.includes("B21")); // no cond at all
  assert.equal(mixer.buttons["B21"], undefined);
  assert.deepEqual(mixer.buttons["B1"], { colour: "pink", blink: "none" }); // zaq rule below still holds
  const noCond = plant([{ ...BASE, lit: [{ elements: ["B5"], colour: "pink" }] }]);
  assert.equal(viewOf(initialDemo(noCond), noCond).buttons["B5"], undefined);
  assert.deepEqual(viewOf(initialDemo(noCond), noCond).unknownLit, ["B5"]);
  for (const cond of ["selectedTrack", "trackPlays", "paramInUse", "selectedItem", "running"] as const) {
    const p = plant([{ ...BASE, lit: [{ elements: ["B5"], colour: "pink", cond }] }]);
    assert.equal(viewOf(initialDemo(p), p).buttons["B5"], undefined, cond);
  }
});

test("held: a button lights while it is held; always lights at once", () => {
  const p = plant([{ ...BASE, lit: [{ elements: ["B5"], colour: "green", cond: "held" }, { elements: ["B6"], colour: "pink", cond: "always" }] }]);
  assert.equal(viewOf(initialDemo(p), p).buttons["B5"], undefined);
  assert.deepEqual(viewOf(initialDemo(p), p).unknownLit, []);
  assert.equal(viewOf(initialDemo(p), p).buttons["B6"]?.colour, "pink");
  const held = run([press("B5", 0)], p);
  assert.equal(viewOf(held, p).buttons["B5"]?.colour, "green");
  assert.equal(viewOf(run([press("B5", 0), release("B5", 5)], p), p).buttons["B5"], undefined);
});

test("determinism: one event list gives one view list", () => {
  const events: In[] = [...tap("B1", 0), press("B59", 100), press("B61", 110), release("B61", 120), release("B59", 130), ...tap("B60", 200), press("B1", 5000), tick(8000)];
  const views = () => {
    const out: unknown[] = [];
    let s = initialDemo(real);
    for (const e of events) {
      s = reduceDemo(s, e, real);
      out.push(structuredClone(viewOf(s, real)));
    }
    return out;
  };
  assert.deepEqual(views(), views());
});

test("a press that matches no rule only sets the press mark", () => {
  const a = viewOf(run([]), real);
  const b = viewOf(run([press("B30", 0)]), real);
  assert.deepEqual(b.pressed, ["B30"]);
  assert.deepEqual({ ...b, pressed: [] }, a);
  const c = viewOf(run([press("B30", 0), release("B30", 10)]), real);
  assert.deepEqual(c, a);
});

test("load errors: a bad action and two tied enter rules fail at demoEngine()", () => {
  assert.throws(() => demoEngine(plant([BASE, { id: "bad", enter: [{ action: "squeeze B5", from: "base" }] }])), /mode 'bad' enter\[0\] 'squeeze B5'/);
  assert.throws(() => demoEngine(plant([BASE, { id: "bad", enter: [{ action: "press B5", from: "base" }], exit: [{ action: "press B99" }] }])), /exit\[0\] 'press B99'/);
  assert.throws(() => demoEngine(plant([BASE, { id: "m1", enter: [{ action: "press B5", from: "base" }] }, { id: "m2", enter: [{ action: "press B5", from: "base" }] }])), /'m1' and 'm2' tie/);
  // the same action from two modes is no tie
  assert.doesNotThrow(() => demoEngine(plant([BASE, { id: "m1", enter: [{ action: "press B5", from: "base" }] }, { id: "m2", enter: [{ action: "press B5", from: "m1" }] }])));
  assert.doesNotThrow(() => demoEngine(real));
});

test("a turn moves a known ring value only; an unknown ring stays unknown", () => {
  const e = demoEngine(real, { rings: { E25: { style: "1dot", encMode: "absolute", value: 126, min: 0, max: 127, known: true, source: "fixture" } } });
  e.dispatch({ type: "turn", id: "E25", steps: 5, t: 0 });
  assert.equal(e.getView().rings["E25"]!.value, 127);
  e.dispatch({ type: "turn", id: "E26", steps: 5, t: 1 });
  assert.equal(e.getView().rings["E26"]!.known, false);
  assert.equal(e.getView().display.known, false);
});

test("engine: a tick that changes nothing does not notify; a mode change does", () => {
  const e = demoEngine(real);
  let n = 0;
  e.subscribe(() => n++);
  e.dispatch(tick(10) as ClockTick);
  assert.equal(n, 0);
  for (const ev of tap("B1", 0)) e.dispatch(ev);
  assert.equal(e.getView().mode, "ctrl");
  assert.ok(n >= 2);
});
