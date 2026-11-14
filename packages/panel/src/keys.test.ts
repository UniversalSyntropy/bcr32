// Key map tests: one effect per key, no clash on one control kind, grid moves.
import assert from "node:assert/strict";
import { test } from "node:test";

import { KEY_MAP, keyEffect, nextIndex, PAGE_STEPS } from "./keys.ts";

test("table: arrows move focus on any control", () => {
  for (const kind of ["knob", "button"] as const) {
    assert.deepEqual(keyEffect(kind, false, "ArrowLeft", false), { type: "move", move: "left" });
    assert.deepEqual(keyEffect(kind, false, "ArrowRight", false), { type: "move", move: "right" });
    assert.deepEqual(keyEffect(kind, false, "Home", false), { type: "move", move: "first" });
    assert.deepEqual(keyEffect(kind, false, "End", false), { type: "move", move: "last" });
  }
});

test("table: knob keys", () => {
  assert.deepEqual(keyEffect("knob", true, "ArrowUp", false, true), { type: "turn", steps: 1 });
  assert.deepEqual(keyEffect("knob", true, "ArrowDown", false, true), { type: "turn", steps: -1 });
  assert.deepEqual(keyEffect("knob", true, "+", false), { type: "turn", steps: 1 });
  assert.deepEqual(keyEffect("knob", true, "-", false), { type: "turn", steps: -1 });
  assert.deepEqual(keyEffect("knob", true, "PageUp", false), { type: "turn", steps: 8 });
  assert.deepEqual(keyEffect("knob", true, "PageDown", false), { type: "turn", steps: -8 });
  assert.equal(PAGE_STEPS, 8);
  assert.deepEqual(keyEffect("knob", true, "ArrowUp", false), { type: "move", move: "up" });
  assert.deepEqual(keyEffect("knob", true, "ArrowDown", false), { type: "move", move: "down" });
  assert.deepEqual(keyEffect("knob", true, "Enter", false), { type: "push" });
  assert.equal(keyEffect("knob", false, "Enter", false), undefined, "no push switch, no effect");
});

test("table: button keys press; a button has no turn keys", () => {
  assert.deepEqual(keyEffect("button", false, "Enter", false), { type: "press" });
  assert.deepEqual(keyEffect("button", false, " ", false), { type: "press" });
  for (const k of ["ArrowUp", "ArrowDown", "+", "-", "PageUp", "PageDown"]) assert.equal(keyEffect("button", false, k, false), undefined, k);
  assert.equal(keyEffect("button", false, "ArrowUp", false, true), undefined);
});

test("table: no two rows share a key on one control kind", () => {
  for (const [kind, push] of [["knob", true], ["knob", false], ["button", false]] as const) {
    const seen = new Set<string>();
    for (const r of KEY_MAP) {
      if (keyEffect(kind, push, r.key, r.ctrl, r.shift) === undefined) continue;
      const id = `${r.key}|${r.ctrl}|${r.shift}`;
      const rows = KEY_MAP.filter((x) => x.key === r.key && x.ctrl === r.ctrl && x.shift === r.shift && (x.on === "any" || x.on === kind || (x.on === "push" && kind === "knob" && push)));
      assert.equal(rows.length, 1, `${kind}: ${id} has ${rows.length} rows`);
      seen.add(id);
    }
    assert.ok(seen.size > 0);
  }
});

test("nextIndex: left, right, first, last clamp; up and down use the grid", () => {
  const cells = Array.from({ length: 16 }, (_, i) => ({ row: Math.floor(i / 8), col: i % 8 }));
  assert.equal(nextIndex(cells, 0, "left"), 0);
  assert.equal(nextIndex(cells, 15, "right"), 15);
  assert.equal(nextIndex(cells, 3, "right"), 4);
  assert.equal(nextIndex(cells, 3, "first"), 0);
  assert.equal(nextIndex(cells, 3, "last"), 15);
  assert.equal(nextIndex(cells, 3, "down"), 11);
  assert.equal(nextIndex(cells, 11, "up"), 3);
  assert.equal(nextIndex(cells, 3, "up"), 3, "no row above: focus stays");
});
