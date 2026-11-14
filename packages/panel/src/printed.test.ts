// Printed layer, label layers and knob pointer. Pure; no DOM. The browser test measures real text boxes.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice } from "@bcr32/device-data";

import { layerLabels, obstacles } from "./labels.ts";
import { buildLayout, pointerLine, textBox, type Layout, type TextBox } from "./layout.ts";

const loaded = loadDevice(join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32"));
assert.ok(loaded.ok && loaded.data.geometry !== undefined, "device data must load");
const { geometry, elements, device, functions } = loaded.data;
const names = new Map(device.groups.map((g) => [g.id, g.name]));
const top = buildLayout(geometry!, elements, "top", names);
const rear = buildLayout(geometry!, elements, "rear", names);

const hit = (a: TextBox, b: TextBox) => a.x0 < b.x1 - 1e-9 && b.x0 < a.x1 - 1e-9 && a.y0 < b.y1 - 1e-9 && b.y0 < a.y1 - 1e-9;

// Text boxes that may overlap another box, with the reason. Empty is the goal; every entry is reported.
export const OVERLAP_EXCEPTIONS: Record<string, string> = {};

const partBoxes = (l: Layout) =>
  l.items.map((i) => {
    const r = Math.max(i.w, i.h, i.ring?.dia ?? 0) / 2;
    const round = i.part.shape === "circle" || i.ring !== undefined;
    return { id: i.id, box: round ? { x0: i.cx - r, x1: i.cx + r, y0: i.cy - r, y1: i.cy + r } : { x0: i.cx - i.w / 2, x1: i.cx + i.w / 2, y0: i.cy - i.h / 2, y1: i.cy + i.h / 2 } };
  });

export function overlapIssues(l: Layout, boxOf: (key: string) => TextBox): string[] {
  const out: string[] = [];
  const texts = l.legends.map((t) => ({ key: t.key, box: boxOf(t.key), onPart: t.onPart, id: t.id }));
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) if (hit(texts[i]!.box, texts[j]!.box)) out.push(`${texts[i]!.key} overlaps ${texts[j]!.key}`);
    for (const p of partBoxes(l)) if (!(texts[i]!.onPart && p.id === texts[i]!.id) && hit(texts[i]!.box, p.box)) out.push(`${texts[i]!.key} overlaps part ${p.id}`);
  }
  return out.filter((m) => !(m.split(" ")[0]! in OVERLAP_EXCEPTIONS));
}

const estimate = (l: Layout) => (key: string) => {
  const t = l.legends.find((x) => x.key === key)!;
  return textBox(t.text, t.x, t.y, t.anchor, t.cap);
};

test("every label of the top view has a drawn text, a shared one or an 'on' one; the rear labels are unplaced", () => {
  const topLabels = elements.filter((e) => e.view === "top").reduce((n, e) => n + e.labels.length, 0);
  const shared = geometry!.legends.filter((l) => l.sharedWith !== undefined).length;
  assert.equal(top.legends.length + shared, topLabels);
  assert.deepEqual(top.unplaced, []);
  const rearLabels = elements.filter((e) => e.view === "rear").reduce((n, e) => n + e.labels.length, 0);
  assert.equal(rear.unplaced.length, rearLabels);
  assert.equal(rear.legends.length, 0);
});

test("no printed text box overlaps another or a part (estimated boxes)", () => {
  assert.deepEqual(overlapIssues(top, estimate(top)), []);
});

test("overlap gate catches a label moved onto its neighbour", () => {
  const moved = structuredClone(top);
  const a = moved.legends.find((l) => l.key === "B5#1")!;
  const b = moved.legends.find((l) => l.key === "B6#1")!;
  a.x = b.x;
  a.y = b.y;
  assert.ok(overlapIssues(moved, estimate(moved)).length > 0);
});

test("text is never below 1.5 mm cap height", () => {
  for (const l of top.legends) assert.ok(l.cap >= 1.5, `${l.key} cap ${l.cap}`);
});

test("text sits inside the case", () => {
  for (const l of top.legends) {
    const b = textBox(l.text, l.x, l.y, l.anchor, l.cap);
    assert.ok(b.x0 >= 0 && b.y0 >= 0 && b.x1 <= top.case.w && b.y1 <= top.case.h, l.key);
  }
});

test("brand is one plain text, BCR32, and there is no other brand text", () => {
  assert.deepEqual(top.brand.map((b) => b.text), ["BCR32"]);
  assert.equal(rear.brand.length, 0);
});

test("bars: the knob strips and GLOBAL carry text; boxed beat markers frame their number", () => {
  const onBar = top.legends.filter((l) => l.onBar).map((l) => l.key);
  assert.ok(onBar.includes("E25#0") && onBar.includes("B59#1") && onBar.includes("E25#1"), onBar.join(","));
  assert.ok(!top.legends.find((l) => l.key === "B5#0")!.onBar);
  const boxes = top.marks.filter((m) => m.kind === "box");
  assert.equal(boxes.length, 8);
  for (const b of boxes) assert.ok(top.legends.find((l) => l.key === `${b.for}#${b.label}`)!.onBar, b.id);
});

test("pointer angle: value 0 is -150, 64 is about 1.18, 127 is +150 degrees", () => {
  const e25 = top.items.find((i) => i.id === "E25")!;
  assert.ok(Math.abs(pointerLine(e25, 0, 0, 127)!.deg - -150) < 1e-9);
  assert.ok(Math.abs(pointerLine(e25, 64, 0, 127)!.deg - (-150 + (300 * 64) / 127)) < 1e-9);
  assert.ok(Math.abs(pointerLine(e25, 64, 0, 127)!.deg - 1.1811) < 1e-3);
  assert.ok(Math.abs(pointerLine(e25, 127, 0, 127)!.deg - 150) < 1e-9);
});

test("pointer geometry: from the centre to the crown top edge (radius 6.2 mm)", () => {
  const e25 = top.items.find((i) => i.id === "E25")!;
  const p = pointerLine(e25, 0, 0, 127)!;
  assert.deepEqual([p.x1, p.y1], [e25.cx, e25.cy]);
  // -150 degrees: sin = -0.5, cos = -0.866025
  assert.ok(Math.abs(p.x2 - (e25.cx - 3.1)) < 1e-9);
  assert.ok(Math.abs(p.y2 - (e25.cy + 6.2 * 0.8660254037844386)) < 1e-9);
});

test("no pointer when the value is null, the range is empty, or the knob has no ring", () => {
  const e25 = top.items.find((i) => i.id === "E25")!;
  assert.equal(pointerLine(e25, null, 0, 127), null);
  assert.equal(pointerLine(e25, 5, 10, 10), null);
  assert.equal(pointerLine(top.items.find((i) => i.id === "SEL")!, 5, 0, 127), null);
});

test("knob crown: three circles 18, 14.5 and 12.4 mm; SEL has them too", () => {
  for (const id of ["E25", "E56", "SEL"]) {
    const c = top.items.find((i) => i.id === id)!;
    assert.deepEqual([c.w, c.crown!.rBrim * 2, c.crown!.rTop * 2], [18, 14.5, 12.4]);
  }
});

const input = (mode: string) => ({
  layout: top,
  panelNumbers: new Map(elements.map((e) => [e.id, e.panelNumber])),
  callouts: new Map(elements.map((e) => [e.id, e.callout])),
  functions,
  mode,
});

test("layers: callout, id and function text do not overlap parts, printed text or each other", () => {
  const r = layerLabels(input("ctrl"));
  const taken = obstacles(top);
  const boxes = r.placed.map((l) => ({ key: l.key, box: textBox(l.text, l.x, l.y, "middle", l.cap) }));
  const printedAndParts = taken;
  for (let i = 0; i < boxes.length; i++) {
    for (const t of printedAndParts) assert.ok(!hit(boxes[i]!.box, t), `${boxes[i]!.key} overlaps a part or a printed item`);
    for (let j = i + 1; j < boxes.length; j++) assert.ok(!hit(boxes[i]!.box, boxes[j]!.box), `${boxes[i]!.key} overlaps ${boxes[j]!.key}`);
  }
});

test("layers: every top element has a callout and an id text; the unplaced list is the reported one", () => {
  const r = layerLabels(input("ctrl"));
  assert.equal(r.placed.filter((l) => l.layer === "callout").length + r.unplaced.filter((u) => u.startsWith("callout")).length, top.items.length);
  assert.equal(r.placed.filter((l) => l.layer === "id").length + r.unplaced.filter((u) => u.startsWith("id")).length, top.items.length);
  assert.deepEqual(r.unplaced, EXPECTED_UNPLACED);
});

test("function layer: text only where the data has a function in that mode; none invented", () => {
  const ctrl = layerLabels(input("ctrl")).placed.filter((l) => l.layer === "function");
  const zaq = layerLabels(input("zaq")).placed.filter((l) => l.layer === "function");
  const names = new Set(functions.map((f) => f.name));
  for (const l of [...ctrl, ...zaq]) assert.ok(names.has(l.text), l.text);
  assert.equal(layerLabels(input("no-such-mode")).placed.filter((l) => l.layer === "function").length, 0);
  assert.ok(zaq.length > 0);
});

test("id text puts the ID and the printed number together", () => {
  const r = layerLabels(input("ctrl"));
  assert.equal(r.placed.find((l) => l.key === "id:E26")!.text, "E26 · knob 2");
  assert.equal(r.placed.find((l) => l.key === "callout:E26")!.text, "26");
});

// Layer labels that found no free spot within the distance limit. Reported, not hidden.
const EXPECTED_UNPLACED = ["B5", "B13", "B22", "B24", "E25", "E33", "E35", "E37", "E39", "E41", "E43", "E45", "E47", "E49", "SEL", "B66", "B68"].map((id) => `function:${id}`);
