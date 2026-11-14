// Label layers: printed (the unit's own text), callout, id and function. Pure placement; no DOM.
// The three added layers share one rule: put the text in the free space next to the part, nearest first.
import type { DeviceFunction } from "@bcr32/device-data";

import { LAYER_CAP_MM, TEXT_W_PER_CAP, LAYER_WIDTH_MARGIN, textBox, type Layout, type LayoutItem, type TextBox } from "./layout.ts";

export type LayerId = "printed" | "callout" | "id" | "function";
export const LAYERS: readonly LayerId[] = ["printed", "callout", "id", "function"];
export const LAYER_NAME: Record<LayerId, string> = { printed: "Printed legends", callout: "Callout numbers", id: "Control IDs", function: "Function (mode text)" };
export const DEFAULT_LAYERS: readonly LayerId[] = ["printed"];
export const isLayer = (v: unknown): v is LayerId => LAYERS.includes(v as LayerId);

// Message keys: one constant prefix. The English catalogue comes from functions.json.
export const FN_KEY_PREFIX = "fn.";
export const fnKey = (functionId: string) => `${FN_KEY_PREFIX}${functionId}`;
export const catalogue = (functions: readonly DeviceFunction[]): ReadonlyMap<string, string> => new Map(functions.map((f) => [fnKey(f.id), f.name]));

// Text of the function layer for one control in one mode. No function: no text. Nothing is invented.
export function functionText(functions: readonly DeviceFunction[], cat: ReadonlyMap<string, string>, mode: string, id: string): string | undefined {
  const f = functions.find((x) => x.mode === mode && x.elements.includes(id));
  return f === undefined ? undefined : cat.get(fnKey(f.id));
}

const KIND_WORD: Record<string, string> = { encoder: "knob", button: "button", led: "LED", display: "display", jack: "jack" };
// Control ID and printed number together: "E26 · knob 2".
export function idText(item: LayoutItem, panelNumber: number | undefined): string {
  return panelNumber === undefined ? item.id : `${item.id} · ${KIND_WORD[item.kind] ?? item.kind} ${panelNumber}`;
}

export type LayerLabel = { key: string; id: string; layer: Exclude<LayerId, "printed">; text: string; x: number; y: number; cap: number };
export type LayerResult = { placed: LayerLabel[]; unplaced: string[] };

// Furthest distance from the part edge, in mm, that a label may sit before it counts as unplaced.
export const MAX_LAYER_DISTANCE_MM = 12;
const PAD_MM = 0.5;
const STEP_MM = 0.5;

const hit = (a: TextBox, b: TextBox) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

// Boxes that a layer label must not cover: parts (with the ring), printed text, bars, lines and the brand.
export function obstacles(layout: Layout): TextBox[] {
  const out: TextBox[] = [];
  for (const i of layout.items) {
    const r = Math.max(i.w, i.h, i.ring?.dia ?? 0) / 2;
    out.push(i.part.shape === "circle" || i.ring !== undefined ? { x0: i.cx - r, x1: i.cx + r, y0: i.cy - r, y1: i.cy + r } : { x0: i.cx - i.w / 2, x1: i.cx + i.w / 2, y0: i.cy - i.h / 2, y1: i.cy + i.h / 2 });
  }
  for (const l of layout.legends) if (!l.onPart) out.push(textBox(l.text, l.x, l.y, l.anchor, l.cap, LAYER_WIDTH_MARGIN));
  for (const m of layout.marks)
    out.push(m.kind === "line" ? { x0: Math.min(m.x1!, m.x2!) - 0.3, x1: Math.max(m.x1!, m.x2!) + 0.3, y0: Math.min(m.y1!, m.y2!) - 0.3, y1: Math.max(m.y1!, m.y2!) + 0.3 } : { x0: m.x!, x1: m.x! + m.w!, y0: m.y!, y1: m.y! + m.h! });
  for (const b of layout.brand) {
    const w = [...b.text].length * b.size * 0.7;
    out.push({ x0: b.anchor === "start" ? b.x : b.anchor === "end" ? b.x - w : b.x - w / 2, x1: b.anchor === "start" ? b.x + w : b.anchor === "end" ? b.x : b.x + w / 2, y0: b.y - b.size / 2, y1: b.y + b.size / 2 });
  }
  return out;
}

// Candidate centres, nearest first: below, above, right, left, then further out.
function* candidates(item: LayoutItem, w: number, cap: number): Generator<[number, number]> {
  const ext = Math.max(item.w, item.h, item.ring?.dia ?? 0) / 2;
  const exty = item.ring !== undefined || item.part.shape === "circle" ? ext : item.h / 2;
  const extx = item.ring !== undefined || item.part.shape === "circle" ? ext : item.w / 2;
  for (let d = 0; d <= MAX_LAYER_DISTANCE_MM; d += STEP_MM) {
    yield [item.cx, item.cy + exty + PAD_MM + d + cap / 2];
    yield [item.cx, item.cy - exty - PAD_MM - d - cap / 2];
    yield [item.cx + extx + PAD_MM + d + w / 2, item.cy];
    yield [item.cx - extx - PAD_MM - d - w / 2, item.cy];
  }
}

// Place the text of one layer. `taken` holds the boxes already used (parts, printed text, other layers).
export function placeLayer(layout: Layout, layer: LayerLabel["layer"], textOf: (item: LayoutItem) => string | undefined, taken: TextBox[]): LayerResult {
  const placed: LayerLabel[] = [];
  const unplaced: string[] = [];
  const cap = LAYER_CAP_MM;
  const inside = (b: TextBox) => b.x0 >= 0 && b.y0 >= 0 && b.x1 <= layout.case.w && b.y1 <= layout.case.h;
  for (const item of layout.items) {
    const text = textOf(item);
    if (text === undefined) continue;
    const w = [...text].length * cap * TEXT_W_PER_CAP * LAYER_WIDTH_MARGIN;
    let done = false;
    for (const [x, y] of candidates(item, w, cap)) {
      const box = textBox(text, x, y, "middle", cap, LAYER_WIDTH_MARGIN);
      if (!inside(box) || taken.some((t) => hit(t, box))) continue;
      placed.push({ key: `${layer}:${item.id}`, id: item.id, layer, text, x, y, cap });
      taken.push(box);
      done = true;
      break;
    }
    if (!done) unplaced.push(`${layer}:${item.id}`);
  }
  return { placed, unplaced };
}

export interface LayerInput {
  layout: Layout;
  panelNumbers: ReadonlyMap<string, number | undefined>;
  callouts: ReadonlyMap<string, number>;
  functions: readonly DeviceFunction[];
  mode: string;
}

// All three layers, always in the same order, so a label stays where it is when another layer switches on.
export function layerLabels(inp: LayerInput): LayerResult {
  const taken = obstacles(inp.layout);
  const cat = catalogue(inp.functions);
  const out: LayerResult = { placed: [], unplaced: [] };
  const parts: [LayerLabel["layer"], (i: LayoutItem) => string | undefined][] = [
    ["callout", (i) => (inp.callouts.has(i.id) ? String(inp.callouts.get(i.id)) : undefined)],
    ["id", (i) => idText(i, inp.panelNumbers.get(i.id))],
    ["function", (i) => functionText(inp.functions, cat, inp.mode, i.id)],
  ];
  for (const [layer, fn] of parts) {
    const r = placeLayer(inp.layout, layer, fn, taken);
    out.placed.push(...r.placed);
    out.unplaced.push(...r.unplaced);
  }
  return out;
}
