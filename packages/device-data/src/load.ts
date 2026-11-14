// Loads one device folder, validates each file, then checks references across files.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { FILES, type DeviceData, type FileName } from "./schema.ts";

export interface Issue {
  file: string;
  path: string;
  message: string;
}

export type LoadResult = { ok: true; data: DeviceData; issues: [] } | { ok: false; issues: Issue[] };

type RawFiles = Partial<Record<FileName, unknown>>;

// Validates already-parsed JSON. Tests use this to break a file in memory.
export function validateDevice(raw: RawFiles): LoadResult {
  const issues: Issue[] = [];
  const parsed: Record<string, unknown> = {};

  for (const [name, spec] of Object.entries(FILES)) {
    const value = raw[name as FileName];
    if (value === undefined) {
      if (spec.required) issues.push({ file: name, path: "", message: "required file is missing" });
      continue;
    }
    const result = spec.schema.safeParse(value);
    if (result.success) parsed[name] = result.data;
    else
      for (const i of result.error.issues)
        issues.push({ file: name, path: i.path.join("."), message: i.message });
  }
  if (issues.length > 0) return { ok: false, issues };

  const data: DeviceData = {
    device: parsed["device.json"] as DeviceData["device"],
    elements: (parsed["elements.json"] as { elements: DeviceData["elements"] }).elements,
    modes: (parsed["modes.json"] as { modes: DeviceData["modes"] } | undefined)?.modes ?? [],
    valueSets: (parsed["values.json"] as { valueSets: DeviceData["valueSets"] } | undefined)?.valueSets ?? [],
    functions: (parsed["functions.json"] as { functions: DeviceData["functions"] } | undefined)?.functions ?? [],
    glossary: (parsed["glossary.json"] as { terms: DeviceData["glossary"] } | undefined)?.terms ?? [],
    sectionMap: (parsed["section-map.json"] as { items: DeviceData["sectionMap"] } | undefined)?.items ?? [],
    midi: parsed["midi.json"] as DeviceData["midi"],
    geometry: parsed["geometry.json"] as DeviceData["geometry"],
    rings: (parsed["rings.json"] as { styles: DeviceData["rings"] } | undefined)?.styles ?? [],
  };

  issues.push(...crossCheck(data));
  return issues.length > 0 ? { ok: false, issues } : { ok: true, data, issues: [] };
}

export function loadDevice(dir: string): LoadResult {
  const raw: RawFiles = {};
  const issues: Issue[] = [];
  for (const name of Object.keys(FILES) as FileName[]) {
    const path = join(dir, name);
    if (!existsSync(path)) continue;
    try {
      raw[name] = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      issues.push({ file: name, path: "", message: `not valid JSON: ${(error as Error).message}` });
    }
  }
  return issues.length > 0 ? { ok: false, issues } : validateDevice(raw);
}

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const id of ids) (seen.has(id) ? dup : seen).add(id);
  return [...dup];
}

export function crossCheck(d: DeviceData): Issue[] {
  const issues: Issue[] = [];
  const add = (file: string, path: string, message: string) => issues.push({ file, path, message });

  const views = new Set(d.device.views.map((v) => v.id));
  const groups = new Set(d.device.groups.map((g) => g.id));
  const ledColours = new Set(d.device.ledColours);
  const labelColours = new Set(d.device.labelColours);
  const elementIds = new Set(d.elements.map((e) => e.id));
  const modeIds = new Set(d.modes.map((m) => m.id));
  const valueSets = new Map(d.valueSets.map((v) => [v.id, v]));

  // device.json
  for (const id of duplicates(d.device.views.map((v) => v.id))) add("device.json", "views", `duplicate view '${id}'`);
  for (const id of duplicates(d.device.groups.map((g) => g.id))) add("device.json", "groups", `duplicate group '${id}'`);
  for (const g of d.device.groups)
    if (!views.has(g.view)) add("device.json", `groups.${g.id}`, `unknown view '${g.view}'`);

  // elements.json
  for (const id of duplicates(d.elements.map((e) => e.id))) add("elements.json", id, "duplicate element ID");
  if (d.elements.length !== d.device.counts.elements)
    add("elements.json", "elements", `${d.elements.length} elements, device.json counts ${d.device.counts.elements}`);
  const callouts = new Set(d.elements.map((e) => e.callout));
  for (let n = 1; n <= d.device.counts.callouts; n++)
    if (!callouts.has(n)) add("elements.json", "elements", `callout ${n} has no element`);
  for (const e of d.elements) {
    if (e.callout > d.device.counts.callouts) add("elements.json", e.id, `callout ${e.callout} is above the callout count`);
    if (!views.has(e.view)) add("elements.json", e.id, `unknown view '${e.view}'`);
    if (!groups.has(e.group)) add("elements.json", e.id, `unknown group '${e.group}'`);
    for (const c of e.colours ?? []) if (!ledColours.has(c)) add("elements.json", e.id, `unknown LED colour '${c}'`);
    for (const l of e.labels)
      if (l.colour !== undefined && !labelColours.has(l.colour))
        add("elements.json", e.id, `unknown label colour '${l.colour}'`);
  }

  // modes.json
  for (const id of duplicates(d.modes.map((m) => m.id))) add("modes.json", id, "duplicate mode ID");
  for (const m of d.modes) {
    if (m.parent !== undefined && !modeIds.has(m.parent)) add("modes.json", m.id, `unknown parent '${m.parent}'`);
    for (const s of [...m.enter, ...m.exit])
      if (s.from !== undefined && !modeIds.has(s.from)) add("modes.json", m.id, `unknown mode '${s.from}' in 'from'`);
    for (const l of m.lit) {
      if (!ledColours.has(l.colour)) add("modes.json", m.id, `unknown LED colour '${l.colour}'`);
      for (const id of l.elements) if (!elementIds.has(id)) add("modes.json", m.id, `unknown element '${id}'`);
    }
  }

  // values.json
  for (const id of duplicates(d.valueSets.map((v) => v.id))) add("values.json", id, "duplicate value set ID");
  for (const v of d.valueSets)
    for (const o of duplicates((v.options ?? []).map((o) => o.value))) add("values.json", v.id, `duplicate option '${o}'`);

  // functions.json
  for (const id of duplicates(d.functions.map((f) => f.id))) add("functions.json", id, "duplicate function ID");
  for (const f of d.functions) {
    if (!modeIds.has(f.mode)) add("functions.json", f.id, `unknown mode '${f.mode}'`);
    for (const id of f.elements) if (!elementIds.has(id)) add("functions.json", f.id, `unknown element '${id}'`);
    const set = f.values === undefined ? undefined : valueSets.get(f.values);
    if (f.values !== undefined && set === undefined) add("functions.json", f.id, `unknown value set '${f.values}'`);
    if (f.default !== undefined && set !== undefined) {
      const text = String(f.default);
      const inOptions = set.options?.some((o) => o.value === text) ?? false;
      const n = typeof f.default === "number" ? f.default : Number.NaN;
      const inRange = set.range !== undefined && n >= set.range.min && n <= set.range.max;
      if (!inOptions && !inRange) add("functions.json", f.id, `default '${text}' is not in value set '${set.id}'`);
    }
  }

  // midi.json
  if (d.midi !== undefined) {
    const ports = new Set(d.midi.ports.map((p) => p.id));
    for (const id of duplicates(d.midi.ports.map((p) => p.id))) add("midi.json", id, "duplicate port ID");
    for (const id of duplicates(d.midi.messages.map((m) => m.id))) add("midi.json", id, "duplicate message ID");
    for (const id of duplicates(d.midi.silences.map((s) => s.id))) add("midi.json", id, "duplicate silence ID");
    for (const m of d.midi.messages) {
      if (!ports.has(m.port)) add("midi.json", m.id, `unknown port '${m.port}'`);
      if (!modeIds.has(m.mode)) add("midi.json", m.id, `unknown mode '${m.mode}'`);
      for (const id of m.trigger?.elements ?? []) if (!elementIds.has(id)) add("midi.json", m.id, `unknown element '${id}'`);
    }
    for (const s of d.midi.silences) {
      if (s.port !== undefined && !ports.has(s.port)) add("midi.json", s.id, `unknown port '${s.port}'`);
      if (!modeIds.has(s.mode)) add("midi.json", s.id, `unknown mode '${s.mode}'`);
    }
  }

  // geometry.json
  if (d.geometry !== undefined) issues.push(...checkGeometry(d.geometry, d.elements));

  // rings.json
  if (d.rings.length > 0) issues.push(...checkRings(d.rings));

  // section-map.json
  for (const id of duplicates(d.sectionMap.map((i) => i.id))) add("section-map.json", id, "duplicate item ID");

  return issues;
}

interface Box {
  id: string;
  view: string;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

// Placed parts are boxes around their centre; a circle is the box of its diameter.
export function checkGeometry(g: NonNullable<DeviceData["geometry"]>, elements: { id: string; labels: unknown[] }[]): Issue[] {
  const elementIds = elements.map((e) => e.id);
  const issues: Issue[] = [];
  const add = (path: string, message: string) => issues.push({ file: "geometry.json", path, message });

  const want = new Set(elementIds);
  const have = new Set(Object.keys(g.place));
  for (const id of want) if (!have.has(id)) add(id, `element '${id}' has no place`);
  for (const id of have) if (!want.has(id)) add(id, `place '${id}' is not an element`);

  const boxes: Box[] = [];
  for (const [id, p] of Object.entries(g.place)) {
    const view = g.views[p.view];
    if (view === undefined) add(id, `unknown view '${p.view}'`);
    const part = p.part === undefined ? undefined : g.parts[p.part];
    if (p.part !== undefined && part === undefined) add(id, `unknown part '${p.part}'`);
    if (p.prov === "missing" || view === undefined || part === undefined || p.x === undefined || p.y === undefined) continue;
    const w = part.shape === "circle" ? part.dia! : part.w!;
    const h = part.shape === "circle" ? part.dia! : part.h!;
    const box: Box = { id, view: p.view, x0: p.x - w / 2, x1: p.x + w / 2, y0: p.y - h / 2, y1: p.y + h / 2 };
    const vh = view.depth ?? view.height!;
    if (box.x0 < 0 || box.y0 < 0 || box.x1 > view.width || box.y1 > vh) add(id, `part of '${id}' lies outside view '${p.view}'`);
    boxes.push(box);
  }

  const eps = 1e-9;
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!;
      const b = boxes[j]!;
      if (a.view === b.view && a.x0 < b.x1 - eps && b.x0 < a.x1 - eps && a.y0 < b.y1 - eps && b.y0 < a.y1 - eps)
        add(a.id, `part of '${a.id}' overlaps part of '${b.id}'`);
    }

  const labelCount = new Map(elements.map((e) => [e.id, e.labels.length]));
  g.legends.forEach((l, i) => {
    const n = labelCount.get(l.for);
    if (n === undefined) add(`legends.${i}`, `legend ${i}: unknown element '${l.for}'`);
    else if (l.label >= n) add(`legends.${i}`, `legend ${i}: '${l.for}' has no label ${l.label}`);
  });
  return issues;
}

// Generic checks only. The BCR32 set of 13 rows and codes 0 to C is checked in bcr32-data.test.ts.
export function checkRings(rings: NonNullable<DeviceData["rings"]>): Issue[] {
  const issues: Issue[] = [];
  const add = (path: string, message: string) => issues.push({ file: "rings.json", path, message });
  for (const id of duplicates(rings.map((r) => r.id))) add(id, `duplicate style id '${id}'`);
  for (const c of duplicates(rings.map((r) => r.code))) add(c, `duplicate code '${c}'`);
  return issues;
}
