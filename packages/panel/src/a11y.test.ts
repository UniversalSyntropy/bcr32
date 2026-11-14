// Access text tests.
import assert from "node:assert/strict";
import { test } from "node:test";

import type { DeviceFunction, Element } from "@bcr32/device-data";
import type { PanelView, RingState } from "@bcr32/device-model";

import { accessName, describeEvent, encoderAria, litText } from "./a11y.ts";

const el = (id: string, labels: string[]) => ({ id, labels: labels.map((text) => ({ text, placement: "on" })) }) as unknown as Element;
const fn = (mode: string, elements: string[], name: string) => ({ mode, elements, name }) as unknown as DeviceFunction;
const ring = (p: Partial<RingState>): RingState => ({ style: "bar", encMode: "absolute", value: 64, min: 0, max: 127, known: true, source: "fixture", ...p });

test("name: function, else label, else ID", () => {
  const fns = [fn("ctrl", ["B5"], "Send the assigned MIDI message")];
  assert.equal(accessName(el("B5", ["X"]), "ctrl", fns), "B5 Send the assigned MIDI message");
  assert.equal(accessName(el("B5", ["X"]), "zaq", fns), "B5 X");
  assert.equal(accessName(el("B5", []), "zaq", fns), "B5");
});

test("encoder aria: slider for an absolute value, spinbutton otherwise", () => {
  assert.deepEqual(encoderAria(ring({})), { role: "slider", now: 64, min: 0, max: 127, text: "64 of 127" });
  assert.deepEqual(encoderAria(ring({ encMode: "relative-1" })), { role: "spinbutton", text: "relative, no value shown" });
  assert.deepEqual(encoderAria(ring({ known: false })), { role: "spinbutton", text: "unknown" });
  assert.deepEqual(encoderAria(ring({ value: null })), { role: "spinbutton", text: "unknown" });
  assert.deepEqual(encoderAria(undefined), { role: "spinbutton", text: "unknown" });
});

test("lit text names colour and blink; off gives none", () => {
  assert.equal(litText("B9", { colour: "pink", blink: "none" }), "B9 lit pink");
  assert.equal(litText("B9", { colour: "pink", blink: "slow" }), "B9 lit pink blinks");
  assert.equal(litText("B9", { colour: "off", blink: "none" }), undefined);
});

test("live text: press, push, turn; release is silent", () => {
  const view = { rings: { E26: ring({ value: 65 }) } } as unknown as PanelView;
  assert.equal(describeEvent("B5 x", { type: "press", id: "B5", t: 0 }, view, false), "B5 x pressed");
  assert.equal(describeEvent("E26", { type: "press", id: "E26", t: 0 }, view, true), "E26 pushed");
  assert.equal(describeEvent("E26", { type: "turn", id: "E26", steps: 1, t: 0 }, view, true), "E26 65 of 127");
  assert.equal(describeEvent("B5", { type: "release", id: "B5", t: 0 }, view, false), undefined);
});
