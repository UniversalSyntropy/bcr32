// Test data for the static panel. It is not a claim about a unit.
import type { PanelView, RingState } from "@bcr32/device-model";

const known = (style: RingState["style"], value: number): RingState => ({
  style, encMode: "absolute", value, min: 0, max: 127, known: true, source: "fixture",
});
const unknown: RingState = { style: "unknown", encMode: "unknown", value: null, min: 0, max: 127, known: false, source: "fixture" };

// The 32 step knobs are E25 to E56.
const rings: Record<string, RingState> = {};
for (let n = 25; n <= 56; n++) rings[`E${n}`] = unknown;
rings["E25"] = known("1dot", 0);
rings["E26"] = known("bar", 64);
rings["E27"] = known("spread", 127);

export const fixture: PanelView = {
  mode: "ctrl",
  buttons: {
    B1: { colour: "blue", blink: "none" },
    B5: { colour: "pink", blink: "none" },
    B6: { colour: "pink", blink: "none" },
    B9: { colour: "pink", blink: "slow" },
  },
  rings,
  leds: {},
  display: { lines: [], known: false },
  pressed: [],
};
