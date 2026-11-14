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
// Cap height of a printed legend, in mm, when the geometry file gives none for it.
export const LEGEND_CAP_MM = 2;
// Padding around a group when the narrow-screen view zooms to it, in mm.
export const ZOOM_PAD_MM = 3;
// The unit has no LED ring around SELECT. The data has no per-element ring field yet.
const NO_RING = new Set(["SEL"]);

export type RingGeom = { dia: number; leds: { i: number; x: number; y: number; w: number; h: number; rot: number }[] };
export type Legend = { text: string; colour: string | undefined; cap: number };
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
  legends: Legend[]; // printed text of the labels with placement 'on'
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
};

// Buttons and encoders take input. Status LEDs and the display do not.
export const isControl = (kind: ElementKind) => kind === "button" || kind === "encoder";

// Angle of ring LED i in degrees, clockwise from the top.
export function ringAngle(ring: NonNullable<GeometryFile["ring"]>, i: number): number {
  const zero = { up: 0, right: 90, down: 180, left: 270 }[ring.zeroDeg];
  return zero + ring.startDeg + (i * (ring.endDeg - ring.startDeg)) / (ring.count - 1);
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
  return { dia, leds };
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
      legends: el.labels
        .map((l, label) => ({ l, cap: geometry.legends.find((g) => g.for === el.id && g.label === label)?.capHeight ?? LEGEND_CAP_MM }))
        .filter((x) => x.l.placement === "on")
        .map((x) => ({ text: x.l.text, colour: x.l.colour, cap: x.cap })),
    };
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
