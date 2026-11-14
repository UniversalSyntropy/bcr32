// StaticEngine: literal event list to literal view list.
import assert from "node:assert/strict";
import { test } from "node:test";

import { reduceStatic, staticEngine, type ControlEvent, type PanelView } from "./index.ts";

const ring = (value: number | null, known = true) =>
  ({ style: "bar", encMode: "absolute", value, min: 0, max: 127, known, source: "fixture" }) as const;
const start = (): PanelView => ({
  mode: "ctrl",
  buttons: { B1: { colour: "blue", blink: "none" } },
  rings: { E25: ring(64), E26: ring(126), E27: ring(1), E28: ring(null, false) },
  leds: {},
  display: { lines: [], known: false },
  pressed: [],
});
const run = (events: ControlEvent[]) => events.reduce(reduceStatic, start());

test("turn moves the value by steps", () => {
  assert.equal(run([{ type: "turn", id: "E25", steps: 1, t: 0 }]).rings["E25"]!.value, 65);
  assert.equal(run([{ type: "turn", id: "E25", steps: -8, t: 0 }]).rings["E25"]!.value, 56);
  assert.equal(
    run([{ type: "turn", id: "E25", steps: 8, t: 0 }, { type: "turn", id: "E25", steps: -1, t: 1 }]).rings["E25"]!.value, 71);
});

test("clamp at max and at min, no wrap", () => {
  assert.equal(run([{ type: "turn", id: "E26", steps: 8, t: 0 }]).rings["E26"]!.value, 127);
  assert.equal(run([{ type: "turn", id: "E27", steps: -8, t: 0 }]).rings["E27"]!.value, 0);
});

test("a turn on an unknown or missing ring does not invent a value", () => {
  const v = run([{ type: "turn", id: "E28", steps: 3, t: 0 }, { type: "turn", id: "E99", steps: 3, t: 1 }]);
  assert.equal(v.rings["E28"]!.value, null);
  assert.equal(v.rings["E99"], undefined);
});

test("press and release set and clear pressed; a repeat changes nothing", () => {
  assert.deepEqual(run([{ type: "press", id: "B1", t: 0 }]).pressed, ["B1"]);
  assert.deepEqual(run([{ type: "press", id: "B1", t: 0 }, { type: "press", id: "B1", t: 1 }]).pressed, ["B1"]);
  assert.deepEqual(run([{ type: "press", id: "B1", t: 0 }, { type: "release", id: "B1", t: 1 }]).pressed, []);
  assert.deepEqual(run([{ type: "release", id: "B1", t: 0 }]).pressed, []);
});

test("nothing else changes: mode, buttons and display stay", () => {
  const v = run([{ type: "press", id: "B1", t: 0 }, { type: "turn", id: "E25", steps: 1, t: 1 }]);
  assert.equal(v.mode, "ctrl");
  assert.deepEqual(v.buttons, start().buttons);
  assert.deepEqual(v.display, start().display);
});

test("engine notifies once per change and not for a no-op", () => {
  const e = staticEngine(start());
  let n = 0;
  const off = e.subscribe(() => n++);
  e.dispatch({ type: "turn", id: "E25", steps: 1, t: 0 });
  e.dispatch({ type: "turn", id: "E28", steps: 1, t: 1 });
  assert.equal(n, 1);
  assert.equal(e.getView().rings["E25"]!.value, 65);
  off();
  e.dispatch({ type: "press", id: "B1", t: 2 });
  assert.equal(n, 1);
});
