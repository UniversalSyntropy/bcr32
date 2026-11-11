// Builds the step list for `midi-capture map` from the device data.
// Every instruction names the printed number AND the control ID (rule from the unit safety notes).
// Usage: node map-steps.ts [--out <file>]   default: local/captures/map-steps-ctrl.json
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadDevice } from "@bcr32/device-data";

export interface Step {
  id: string; // control ID and action, for example "E25 turn-cw"
  action: string;
  say: string;
}

interface Element {
  id: string;
  kind: string;
  labels: { text: string }[];
}

// The printed number is the label made of digits only (buttons B5 to B20 and encoders carry one).
function name(e: Element): string {
  const printed = e.labels.find((l) => /^\d+$/.test(l.text))?.text;
  const text = e.labels.find((l) => !/^\d+$/.test(l.text))?.text;
  const parts = [printed === undefined ? undefined : `printed ${printed}`, text].filter((p): p is string => p !== undefined);
  return `${parts.join(", ")} (${e.id})`;
}

// Controls that send a message in CTRL mode and open no menu: B5 to B24, B65 to B68, E25 to E56.
// B1, B59 to B62 and SEL open menus or change mode, so the guided pass leaves them out.
export function buildSteps(elements: Element[]): Step[] {
  const num = (id: string) => Number(/\d+/.exec(id)?.[0]);
  const buttons = elements.filter((e) => e.kind === "button" && ((num(e.id) >= 5 && num(e.id) <= 24) || (num(e.id) >= 65 && num(e.id) <= 68)));
  const encoders = elements.filter((e) => /^E\d+$/.test(e.id));
  const steps: Step[] = buttons.map((e) => ({ id: `${e.id} press`, action: "press", say: `Press the button ${name(e)} once.` }));
  for (const e of encoders) {
    const k = name(e);
    steps.push({ id: `${e.id} turn-cw`, action: "turn-cw", say: `Turn the knob ${k} clockwise, 3 clicks.` });
    steps.push({ id: `${e.id} turn-ccw`, action: "turn-ccw", say: `Turn the knob ${k} counter-clockwise, 3 clicks.` });
    steps.push({ id: `${e.id} push`, action: "push", say: `Push the knob ${k} once. Do not turn it.` });
  }
  // B63 and B64 change the loaded preset; the second step puts it back.
  const b63 = elements.find((e) => e.id === "B63")!;
  const b64 = elements.find((e) => e.id === "B64")!;
  steps.push({ id: "B64 press", action: "press", say: `Press the button ${name(b64)} once. The unit loads the next preset.` });
  steps.push({ id: "B63 press", action: "press", say: `Press the button ${name(b63)} once. The unit loads the first preset again.` });
  return steps;
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf("--out");
  const out = outIndex >= 0 ? args[outIndex + 1] : join("local", "captures", "map-steps-ctrl.json");
  if (out === undefined || args.some((a) => a !== "--out" && a !== out)) {
    console.error("usage: map-steps.ts [--out <file>]");
    process.exit(2);
  }
  const loaded = loadDevice(join("data", "devices", "bcr32"));
  if (!loaded.ok) {
    console.error("map-steps: the device data is not valid (run: npm run validate:data)");
    process.exit(1);
  }
  const steps = buildSteps(loaded.data.elements);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(steps, null, 1) + "\n");
  console.log(`map-steps: wrote ${steps.length} steps to ${out}`);
}
