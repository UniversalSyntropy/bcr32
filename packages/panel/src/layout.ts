// Pure placement. One function places both trees: the SVG part and its HTML control
// take the same centre and size from a LayoutItem. No DOM, no React.
import type { Element, GeometryFile } from "@bcr32/device-data";

export type ViewId = "top" | "rear";
export type PartSpec = GeometryFile["parts"][string];
export type Prov = GeometryFile["place"][string]["prov"];
export type ElementKind = Element["kind"];

// Space around the case in the base viewBox, in mm. Theme-independent. Labels use it in a later batch.
export const VIEW_MARGIN_MM = 4;
// One ring LED is a rectangle: short edge toward the knob centre, long edge radial. In mm.
export const RING_LED_W_MM = 1;
export const RING_LED_H_MM = 3;
// Font size of printed text as a multiple of its cap height.
export const FONT_PER_CAP = 1 / 0.7;
// Estimated width of a text box: characters x cap height x this number. The browser test measures the real boxes.
export const TEXT_W_PER_CAP = 0.9;
// The callout, id and function layers reserve a box this much wider than the estimate, so a wider
// system font (about 25 percent) still leaves the text clear of its neighbours.
export const LAYER_WIDTH_MARGIN = 1.4;
// Cap height of the text of the callout, id and function layers, in mm.
export const LAYER_CAP_MM = 1.6;
// Padding around a group when the narrow-screen view zooms to it, in mm.
export const ZOOM_PAD_MM = 3;
// The unit has no LED ring around SELECT. The data has no per-element ring field yet.
const NO_RING = new Set(["SEL"]);

export type Arc = { zero: number; start: number; end: number };
export type RingGeom = { dia: number; arc: Arc; pointerR: number; leds: { i: number; x: number; y: number; w: number; h: number; rot: number }[] };
export type Anchor = "start" | "middle" | "end";
export type LayoutLegend = {
  key: string; // element ID and label index
  id: string;
  label: number;
  text: string;
  colour: string | undefined;
  x: number;
  y: number;
  anchor: Anchor;
  cap: number;
  rot: number | undefined;
  onPart: boolean; // the label has placement 'on': it sits on its own part
  onBar: boolean; // the text centre lies on a printed bar or box
  prov: Prov;
};
export type LayoutMark = GeometryFile["marks"][number];
export type LayoutBrand = GeometryFile["brand"][number];
export type TextBox = { x0: number; x1: number; y0: number; y1: number };
export type LayoutItem = {
  id: string;
  kind: ElementKind;
  part: PartSpec;
  cx: number;
  cy: number;
  w: number;
  h: number;
  prov: Prov;
  group: string;
  grid?: { row: number; col: number };
  ring?: RingGeom;
  crown?: { rBrim: number; rTop: number }; // knob: the two inner circles of the top view
};
export type GroupSpec = { id: string; name: string; ids: string[]; controls: string[] };
export type ViewBox = [number, number, number, number];
export type Layout = {
  view: ViewId;
  viewBox: ViewBox;
  case: { x: number; y: number; w: number; h: number; r: number; prov: Prov | undefined };
  items: LayoutItem[];
  missing: string[];
  groups: GroupSpec[];
  legends: LayoutLegend[]; // printed text that has a position in this view
  marks: LayoutMark[];
  brand: LayoutBrand[];
  unplaced: string[]; // labels of this view with no position: "ID#index"
};

// Buttons and encoders take input. Status LEDs and the display do not.
export const isControl = (kind: ElementKind) => kind === "button" || kind === "encoder";

const arcOf = (ring: NonNullable<GeometryFile["ring"]>): Arc => ({ zero: { up: 0, right: 90, down: 180, left: 270 }[ring.zeroDeg], start: ring.startDeg, end: ring.endDeg });

// Angle at a fraction (0 to 1) of the arc, in degrees clockwise from the top.
export const arcAngle = (arc: Arc, frac: number): number => arc.zero + arc.start + frac * (arc.end - arc.start);

// Angle of ring LED i in degrees, clockwise from the top.
export function ringAngle(ring: NonNullable<GeometryFile["ring"]>, i: number): number {
  return arcAngle(arcOf(ring), i / (ring.count - 1));
}

// Pointer of a knob: a line from the centre to the edge of the crown top, at the angle of the value.
// No pointer when the value is unknown or the range is empty.
export function pointerLine(item: LayoutItem, value: number | null, min: number, max: number) {
  if (item.ring === undefined || item.crown === undefined || value === null || !(max > min)) return null;
  const deg = arcAngle(item.ring.arc, Math.min(1, Math.max(0, (value - min) / (max - min))));
  const a = (deg * Math.PI) / 180;
  const r = item.ring.pointerR;
  return { deg, x1: item.cx, y1: item.cy, x2: item.cx + r * Math.sin(a), y2: item.cy - r * Math.cos(a) };
}

// Estimated box of printed text. y is the vertical centre of the text; the box is one cap height tall.
export function textBox(text: string, x: number, y: number, anchor: Anchor, cap: number, widthFactor = 1): TextBox {
  const w = [...text].length * cap * TEXT_W_PER_CAP * widthFactor;
  const x0 = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2;
  return { x0, x1: x0 + w, y0: y - cap / 2, y1: y + cap / 2 };
}

function ringGeom(ring: NonNullable<GeometryFile["ring"]>, part: PartSpec, cx: number, cy: number): RingGeom {
  const dia = part.ringDia!;
  const leds = Array.from({ length: ring.count }, (_, i) => {
    const rot = ringAngle(ring, i);
    const a = (rot * Math.PI) / 180;
    // ringDia is the outer edge of the LEDs, so the LED centre sits half an LED length inside it.
    const r = dia / 2 - RING_LED_H_MM / 2;
    return { i, x: cx + r * Math.sin(a), y: cy - r * Math.cos(a), w: RING_LED_W_MM, h: RING_LED_H_MM, rot };
  });
  return { dia, arc: arcOf(ring), pointerR: (part.crown?.diaAtTop ?? part.dia! * 0.7) / 2, leds };
}

const byGrid = (a: { grid?: { row: number; col: number } }, b: { grid?: { row: number; col: number } }) =>
  (a.grid?.row ?? 0) - (b.grid?.row ?? 0) || (a.grid?.col ?? 0) - (b.grid?.col ?? 0);
const byPos = (a: { cy: number; cx: number }, b: { cy: number; cx: number }) => a.cy - b.cy || a.cx - b.cx;

export function buildLayout(
  geometry: GeometryFile,
  elements: readonly Element[],
  view: ViewId,
  groupNames: ReadonlyMap<string, string> = new Map(),
): Layout {
  const v = geometry.views[view];
  if (v === undefined) throw new Error(`geometry has no view '${view}'`);
  const height = (v.depth ?? v.height)!;
  const items: LayoutItem[] = [];
  const missing: string[] = [];
  const elementsById = new Map(elements.map((e) => [e.id, e]));
  for (const el of elements) {
    const place = geometry.place[el.id];
    if (place === undefined) throw new Error(`element '${el.id}' has no place`);
    if (place.view !== view) continue;
    if (place.prov === "missing") {
      missing.push(el.id);
      continue;
    }
    const part = geometry.parts[place.part!]!;
    const cx = place.x!;
    const cy = place.y!;
    const item: LayoutItem = {
      id: el.id, kind: el.kind, part, cx, cy,
      w: part.shape === "circle" ? part.dia! : part.w!,
      h: part.shape === "circle" ? part.dia! : part.h!,
      prov: place.prov, group: el.group,
    };
    if (part.crown !== undefined) item.crown = { rBrim: part.crown.diaAtBrim / 2, rTop: part.crown.diaAtTop / 2 };
    if (el.grid !== undefined) item.grid = el.grid;
    if (el.kind === "encoder" && geometry.ring !== undefined && part.ringDia !== undefined && !NO_RING.has(el.id))
      item.ring = ringGeom(geometry.ring, part, cx, cy);
    items.push(item);
  }

  // Group order: reading order of the first member (smallest y, then x); a tie goes by grid.
  const byGroup = new Map<string, LayoutItem[]>();
  for (const it of items) (byGroup.get(it.group) ?? byGroup.set(it.group, []).get(it.group)!).push(it);
  const groups = [...byGroup.entries()]
    .map(([id, members]) => {
      const sorted = members.every((m) => m.grid !== undefined) ? [...members].sort(byGrid) : [...members].sort(byPos);
      const first = [...members].sort(byPos)[0]!;
      return { id, sorted, first };
    })
    .sort((a, b) => byPos(a.first, b.first) || byGrid(a.first, b.first) || a.id.localeCompare(b.id));
  const ordered = groups.flatMap((g) => g.sorted);

  // Printed text. A label that another label draws (sharedWith) has an entry and no second drawing.
  const marks = geometry.marks.filter((mk) => mk.view === view);
  const bars = marks.filter((mk) => mk.kind !== "line");
  const centres = new Map(items.map((i) => [i.id, i]));
  const legends: LayoutLegend[] = [];
  const unplaced: string[] = [];
  for (const g of geometry.legends) {
    const el = elementsById.get(g.for)!;
    if (geometry.place[g.for]!.view !== view) continue;
    if (g.sharedWith !== undefined) continue;
    const lab = el.labels[g.label]!;
    const it = centres.get(g.for);
    const x = g.x ?? it?.cx;
    const y = g.y ?? it?.cy;
    if (g.prov === "missing" || x === undefined || y === undefined) {
      unplaced.push(`${g.for}#${g.label}`);
      continue;
    }
    const box = textBox(lab.text, x, y, g.anchor, g.capHeight);
    const [mx, my] = [(box.x0 + box.x1) / 2, y];
    legends.push({
      key: `${g.for}#${g.label}`, id: g.for, label: g.label, text: lab.text, colour: lab.colour, x, y, anchor: g.anchor, cap: g.capHeight, rot: g.rot,
      onPart: lab.placement === "on",
      onBar: bars.some((b) => mx >= b.x! && mx <= b.x! + b.w! && my >= b.y! && my <= b.y! + b.h!),
      prov: g.prov,
    });
  }

  const m = VIEW_MARGIN_MM;
  return {
    view,
    viewBox: [-m, -m, v.width + 2 * m, height + 2 * m],
    case: { x: 0, y: 0, w: v.width, h: height, r: v.cornerRadius ?? 0, prov: v.prov },
    items: ordered,
    missing,
    groups: groups.map((g) => ({
      id: g.id,
      name: groupNames.get(g.id) ?? g.id,
      ids: g.sorted.map((i) => i.id),
      controls: g.sorted.filter((i) => isControl(i.kind)).map((i) => i.id),
    })),
    legends,
    marks,
    brand: geometry.brand.filter((b) => b.view === view),
    unplaced,
  };
}

// Box of an HTML control as percent of the stage. The SVG part uses the same centre and size.
export function controlBox(item: LayoutItem, vb: ViewBox) {
  const [x, y, w, h] = vb;
  return {
    left: ((item.cx - item.w / 2 - x) / w) * 100,
    top: ((item.cy - item.h / 2 - y) / h) * 100,
    width: (item.w / w) * 100,
    height: (item.h / h) * 100,
  };
}

// ViewBox that shows one group, with its rings. A change of viewBox only.
export function groupViewBox(layout: Layout, groupId: string, pad = ZOOM_PAD_MM): ViewBox {
  const group = layout.groups.find((g) => g.id === groupId);
  const members = layout.items.filter((i) => group?.ids.includes(i.id));
  if (members.length === 0) return layout.viewBox;
  const ext = (i: LayoutItem) => Math.max(i.w, i.h, i.ring?.dia ?? 0) / 2;
  const x0 = Math.min(...members.map((i) => i.cx - ext(i))) - pad;
  const x1 = Math.max(...members.map((i) => i.cx + ext(i))) + pad;
  const y0 = Math.min(...members.map((i) => i.cy - ext(i))) - pad;
  const y1 = Math.max(...members.map((i) => i.cy + ext(i))) + pad;
  return [x0, y0, x1 - x0, y1 - y0];
}
