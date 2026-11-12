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
  picture: string; // the top panel with the target control marked
}

// Rows of the top panel as in manual section 3.5 (order and grouping only). "" is a gap.
const LEFT: string[][] = [
  ["B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12"],
  ["B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20"],
  [],
  ["E25", "E26", "E27", "E28", "E29", "E30", "E31", "E32"],
  ["E33", "E34", "E35", "E36", "E37", "E38", "E39", "E40"],
  ["E41", "E42", "E43", "E44", "E45", "E46", "E47", "E48"],
  ["E49", "E50", "E51", "E52", "E53", "E54", "E55", "E56"],
];
const RIGHT: string[][] = [["B21", "B22"], ["B23", "B24"], [], ["DISP", "SEL"], ["B59", "B60"], ["B61", "B62"], ["B63", "B64"], ["B65", "B66"], ["B67", "B68"]];

// A text picture of the top panel. Only the target shows its ID, in [ ]; every other control is a dot.
export function picture(target: string): string {
  const cell = (id: string) => (id === target ? `[${id}]` : "·").padEnd(6).padStart(6);
  const rows: string[] = [];
  const height = Math.max(LEFT.length, RIGHT.length);
  for (let r = 0; r < height; r++) {
    const left = (LEFT[r] ?? []).map(cell).join("");
    const right = (RIGHT[r] ?? []).map(cell).join("");
    rows.push(`${left.padEnd(48)}   ${right}`.trimEnd());
  }
  // Words as well as the picture: the place of the target counted from the left and from the top of its block.
  const row = LEFT.findIndex((r) => r.includes(target));
  const where = row >= 0
    ? `${target} is in the ${target.startsWith("E") ? "knob" : "button"} block on the left: row ${row - (target.startsWith("E") ? 3 : 0) + 1}, column ${LEFT[row]!.indexOf(target) + 1} from the left.`
    : `${target} is in the block of two columns on the right.`;
  return `FRONT OF UNIT (user side) at the bottom of this picture\n${rows.join("\n")}\n${where}`;
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
  const steps: Step[] = buttons.map((e) => ({ id: `${e.id} press`, action: "press", say: `Press the button ${name(e)} once.`, picture: picture(e.id) }));
  for (const e of encoders) {
    const k = name(e);
    steps.push({ id: `${e.id} turn-cw`, action: "turn-cw", say: `Turn the knob ${k} clockwise, 3 clicks.`, picture: picture(e.id) });
    steps.push({ id: `${e.id} turn-ccw`, action: "turn-ccw", say: `Turn the knob ${k} counter-clockwise, 3 clicks.`, picture: picture(e.id) });
    steps.push({ id: `${e.id} push`, action: "push", say: `Push the knob ${k} once. Do not turn it.`, picture: picture(e.id) });
  }
  // B63 and B64 change the loaded preset; the second step puts it back.
  const b63 = elements.find((e) => e.id === "B63")!;
  const b64 = elements.find((e) => e.id === "B64")!;
  steps.push({ id: "B64 press", action: "press", say: `Press the button ${name(b64)} once. The unit loads the next preset.`, picture: picture("B64") });
  steps.push({ id: "B63 press", action: "press", say: `Press the button ${name(b63)} once. The unit loads the first preset again.`, picture: picture("B63") });
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
