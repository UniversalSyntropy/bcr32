// Tests for map-steps.ts: the list is complete, and every instruction gives the printed number AND the ID.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice } from "@bcr32/device-data";

import { buildSteps } from "./map-steps.ts";

const loaded = loadDevice(join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32"));
assert.ok(loaded.ok);
const steps = buildSteps(loaded.data.elements);

test("the list has 24 button steps, 96 encoder steps and 2 preset steps", () => {
  assert.equal(steps.length, 24 + 96 + 2);
  assert.equal(new Set(steps.map((s) => s.id)).size, steps.length, "duplicate step ID");
});

test("planted fault guard: menu controls and mode switch are never in the list", () => {
  const ids = steps.map((s) => s.id.split(" ")[0]);
  for (const forbidden of ["B1", "B59", "B60", "B61", "B62", "SEL"]) assert.ok(!ids.includes(forbidden), forbidden);
});

test("every instruction names the control ID, and every knob or numbered button also gives the printed number", () => {
  for (const s of steps) {
    const id = s.id.split(" ")[0]!;
    assert.ok(s.say.includes(`(${id})`), s.say);
    const printed = /^E\d+$/.test(id) ? true : loaded.data.elements.find((e) => e.id === id)!.labels.some((l) => /^\d+$/.test(l.text));
    if (printed) assert.match(s.say, /printed \d+/, s.say);
  }
  assert.match(steps.find((s) => s.id === "E49 push")!.say, /printed 25.*\(E49\)/);
  assert.match(steps.find((s) => s.id === "B5 press")!.say, /printed 1, PITCH \(B5\)/);
});

test("every step has a picture with exactly one marked control: its own", () => {
  for (const s of steps) {
    const marks = [...s.picture.matchAll(/\[([A-Z0-9]+)\]/g)].map((m) => m[1]);
    assert.deepEqual(marks, [s.id.split(" ")[0]], s.id);
  }
});
