import assert from "node:assert/strict";
import { test } from "node:test";

import { foldPatches, mergePatch, patchLeaves, valueAt } from "./guide-patch.ts";

test("merge patch: objects merge key by key", () => {
  assert.deepEqual(mergePatch({ a: { b: 1, c: 2 } }, { a: { b: 5 } }), { a: { b: 5, c: 2 } });
});

test("merge patch: null removes a key", () => {
  assert.deepEqual(mergePatch({ a: 1, b: { c: 2, d: 3 } }, { a: null, b: { c: null } }), { b: { d: 3 } });
});

test("merge patch: an array replaces the old array", () => {
  assert.deepEqual(mergePatch({ lines: ["a", "b", "c"] }, { lines: ["x"] }), { lines: ["x"] });
});

test("merge patch: a new object drops its null keys (RFC 7386 example)", () => {
  assert.deepEqual(mergePatch({}, { a: { b: null, c: 1 } }), { a: { c: 1 } });
});

test("merge patch: the target is not changed", () => {
  const target = { a: { b: 1 } };
  mergePatch(target, { a: { b: 2 }, c: 3 });
  assert.deepEqual(target, { a: { b: 1 } });
});

test("fold: steps 1 to 3 equal the three patches applied in order", () => {
  const base = { mode: "zaq", buttons: { B1: { colour: "pink" } }, display: { lines: ["A"], known: true } };
  const p1 = { mode: "zaq-store", buttons: { B61: { colour: "pink", blink: "none" } } };
  const p2 = { buttons: { B1: null }, display: { lines: ["B", "C"] } };
  const p3 = { mode: "zaq", buttons: { B61: null } };
  const step = mergePatch(mergePatch(mergePatch(base, p1), p2), p3);
  assert.deepEqual(foldPatches(base, [p1, p2, p3]), step);
  assert.deepEqual(step, { mode: "zaq", buttons: {}, display: { lines: ["B", "C"], known: true } });
  assert.deepEqual(foldPatches(base, []), base);
});

test("leaves and valueAt", () => {
  const patch = { mode: "x", buttons: { B5: { colour: "red", blink: null } }, display: { lines: ["a"] } };
  assert.deepEqual(patchLeaves(patch), [
    { path: "mode", value: "x" },
    { path: "buttons.B5.colour", value: "red" },
    { path: "buttons.B5.blink", value: null },
    { path: "display.lines", value: ["a"] },
  ]);
  assert.equal(valueAt(patch, "buttons.B5.colour"), "red");
  assert.equal(valueAt(patch, "buttons.B9.colour"), undefined);
});
