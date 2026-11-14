import assert from "node:assert/strict";
import { test } from "node:test";

import { BUTTON_PRESS, clickPlan, CLICK_GAIN, KNOB_PUSH, RELEASE_GAIN_FACTOR } from "./sound-plan.ts";

test("knob push and button press differ: the knob is lower and longer", () => {
  const k = clickPlan("knob", "down");
  const b = clickPlan("button", "down");
  assert.notDeepEqual(k, b);
  assert.ok(k.freqHz < b.freqHz);
  assert.ok(k.ms > b.ms);
});

test("the plan equals the named constants; release gain is half", () => {
  assert.deepEqual(clickPlan("knob", "down"), { freqHz: KNOB_PUSH.freqHz, ms: KNOB_PUSH.ms, gain: CLICK_GAIN });
  assert.deepEqual(clickPlan("button", "down"), { freqHz: BUTTON_PRESS.freqHz, ms: BUTTON_PRESS.ms, gain: CLICK_GAIN });
  assert.equal(RELEASE_GAIN_FACTOR, 0.5);
  for (const kind of ["knob", "button"] as const) {
    assert.equal(clickPlan(kind, "up").gain, clickPlan(kind, "down").gain * 0.5);
    assert.equal(clickPlan(kind, "up").freqHz, clickPlan(kind, "down").freqHz);
  }
});

test("literal values: 70 Hz for 40 ms, 1800 Hz for 20 ms", () => {
  assert.deepEqual([KNOB_PUSH.freqHz, KNOB_PUSH.ms, BUTTON_PRESS.freqHz, BUTTON_PRESS.ms], [70, 40, 1800, 20]);
});
