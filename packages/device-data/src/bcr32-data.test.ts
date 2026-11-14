// Checks for the BCR32 data set: counts (playbook step 1.3), reference cross-check (step 1.4).
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { GeometryFile, GuideFile, RingsFile, checkGeometry, checkGuide, checkRings, loadDevice, validateDevice } from "./index.ts";

const dir = join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32");

test("BCR32 data: 85 callouts, 88 elements, expected count per kind", () => {
  const result = loadDevice(dir);
  assert.deepEqual(result.issues, []);
  assert.ok(result.ok);
  const { device, elements } = result.data;
  assert.equal(device.counts.callouts, 85);
  assert.equal(elements.length, 88);
  assert.equal(new Set(elements.map((e) => e.callout)).size, 85);

  const perKind = Object.fromEntries(
    ["button", "encoder", "led", "display", "jack"].map((k) => [k, elements.filter((e) => e.kind === k).length]),
  );
  assert.deepEqual(perKind, { button: 31, encoder: 33, led: 6, display: 1, jack: 17 });

  // Callouts 2 and 3 are the only ones with more than one element.
  const multi = [...Map.groupBy(elements, (e) => e.callout)].filter(([, es]) => es.length > 1).map(([c, es]) => [c, es.length]);
  assert.deepEqual(multi, [[2, 3], [3, 2]]);

  // An ID carries its callout number, except SEL, DISP and the split LEDs.
  for (const e of elements) {
    const n = /^[BEJL](\d+)/.exec(e.id)?.[1];
    if (n !== undefined) assert.equal(Number(n), e.callout, e.id);
  }
  assert.equal(elements.find((e) => e.id === "DISP")?.callout, 57);
  assert.equal(elements.find((e) => e.id === "SEL")?.callout, 58);
});

// Cross-check against the reference (playbook step 1.4). Reads the tables of the
// reference and proves that each row has a record in the data.
const manualDir = join(import.meta.dirname, "..", "..", "..", "docs", "manual");
const reference = readdirSync(manualDir).filter((f) => /^\d\d-.*\.md$/.test(f)).sort().map((f) => readFileSync(join(manualDir, f), "utf8")).join("\n");

// First cell of each body row of the first table under a heading that starts with `heading`.
function firstCells(heading: string): string[] {
  const lines = reference.split("\n");
  const start = lines.findIndex((l) => l.startsWith(heading));
  assert.notEqual(start, -1, `heading '${heading}' is not in the reference`);
  const first = lines.findIndex((l, i) => i > start && l.startsWith("|"));
  const rows: string[] = [];
  for (let i = first + 2; lines[i]?.startsWith("|"); i++) rows.push(lines[i]!.split("|")[1]!.trim().replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")); // keep the text of a glossary link
  assert.ok(rows.length > 0, `no table rows under '${heading}'`);
  return rows;
}

// "E37–E40" → E37…E40; "E41/43/45/47" → E41, E43, E45, E47; "B5 PITCH" → B5.
function expandIds(cell: string): string[] {
  const range = /^([BE])(\d+)–\1(\d+)/.exec(cell);
  if (range) return Array.from({ length: Number(range[3]) - Number(range[2]) + 1 }, (_, i) => `${range[1]}${Number(range[2]) + i}`);
  const list = /^([BE])(\d+(?:\/\d+)+)/.exec(cell);
  if (list) return list[2]!.split("/").map((n) => `${list[1]}${n}`);
  const one = /^[BE]\d+/.exec(cell);
  assert.ok(one, `no control ID in '${cell}'`);
  return [one[0]];
}

test("BCR32 data: each row of the reference tables has a mode or a function", () => {
  const result = loadDevice(dir);
  assert.ok(result.ok);
  const { modes, functions } = result.data;
  // A row counts only when a function names the control first: shared use by a second function does not hide a gap.
  const has = (mode: string, id: string) => functions.some((f) => f.mode === mode && f.elements[0] === id);
  const hasGroup = (mode: string, ids: string[]) => functions.some((f) => f.mode === mode && f.elements.join() === ids.join());

  // §2: each mode or menu row is a mode with the same name. The last row covers three modes.
  const names = new Set(modes.map((m) => m.name));
  const rows2 = firstCells("# 2. Modes and menus");
  assert.equal(rows2.length, 11);
  for (const name of rows2)
    if (name === "Erase / SysEx") for (const n of ["Erase menu", "SysEx export menu", "SysEx import"]) assert.ok(names.has(n), n);
    else assert.ok(names.has(name), `§2 row '${name}' has no mode`);

  // §5: each parameter button B5–B20 has a function in ZAQ mode.
  const rows5 = firstCells("# 5. Sequencer").flatMap(expandIds);
  assert.equal(rows5.length, 16);
  for (const id of rows5) assert.ok(has("zaq", id), `§5 ${id} has no function in mode zaq`);

  // §6: each encoder E25–E56 has a function on the ZAQ Global page.
  // §6: each row has a function on the ZAQ Global page with exactly the encoders of the row; E25–E56 are all covered.
  const rows6 = firstCells("# 6. ZAQ Global page").map(expandIds);
  assert.equal(rows6.flat().length, 32);
  for (const ids of rows6) assert.ok(hasGroup("zaq-global", ids), `§6 ${ids.join()} has no function in mode zaq-global`);

  // §9.1: each Global Settings button has a function.
  const rows91 = firstCells("## 9.1 Global Settings").flatMap(expandIds);
  assert.equal(rows91.length, 11); // 8 in the manual, 3 added from the unit (B13 to B15)
  for (const id of rows91) assert.ok(has("global-settings", id), `§9.1 ${id} has no function in mode global-settings`);

  // Each mode has at least one function, and each function that takes a value names a set that is in use.
  for (const m of modes) assert.ok(functions.some((f) => f.mode === m.id), `mode '${m.id}' has no function`);
  const used = new Set(functions.map((f) => f.values));
  for (const v of result.data.valueSets) assert.ok(used.has(v.id), `value set '${v.id}' is not used by a function`);
});

// MIDI facts from the unit session (playbook step 3.3).
test("BCR32 MIDI data: ports, USB IDs and the controller messages seen in test H3", () => {
  const result = loadDevice(dir);
  assert.ok(result.ok);
  const midi = result.data.midi!;
  assert.deepEqual(midi.ports.map((p) => p.name), ["BCR-32 CTRL", "BCR-32 ZAQ"]);
  assert.equal(midi.usb.productId, "12CF");
  assert.notEqual(midi.usb.productId, "12CE"); // 12CE = bootloader
  const cc = midi.messages.filter((m) => m.type === "cc");
  assert.ok(cc.every((m) => m.port === "ctrl" && m.channel === 1));
  // The two guessed rows from test H3 stay "likely"; every proven row comes from the guided map (step 4.3).
  assert.deepEqual(midi.messages.filter((m) => m.id === "ctrl-cc97" || m.id === "ctrl-cc98").map((m) => m.trigger?.confidence), ["likely", "likely"]);
  const proven = midi.messages.filter((m) => m.trigger?.confidence === "proven");
  assert.equal(proven.length, 45);
  assert.ok(proven.every((m) => m.source.ref === "map-run2" && /^ctrl\.p[14]\.[be]\d+$/.test(m.id)));
  // One proven row for each control and preset; a control is never mapped twice in a preset.
  assert.equal(new Set(proven.map((m) => m.id)).size, proven.length);
  assert.ok(proven.every((m) => m.id.endsWith(m.trigger!.elements[0]!.toLowerCase()) && m.trigger!.elements.length === 1));
  // Silent controls: E30, E31 and E38 never appear as a trigger.
  const triggers = new Set(proven.flatMap((m) => m.trigger!.elements));
  for (const e of ["E30", "E31", "E38", "B21", "B24", "B65", "B68"]) assert.ok(!triggers.has(e), e);
  // Every record names the firmware it was seen on.
  for (const r of [...midi.ports, ...midi.messages, ...midi.silences]) assert.equal(r.source.firmware, "1.0.3", r.id);
});

// Geometry, rings and guide checks (R2 batch B1). Each planted fault gives one named issue.
const rawGeometry = () => JSON.parse(readFileSync(join(dir, "geometry.json"), "utf8"));
const rawRings = () => JSON.parse(readFileSync(join(dir, "rings.json"), "utf8"));
const bcrElements = () => {
  const r = loadDevice(dir);
  assert.ok(r.ok);
  return r.data.elements;
};
const geometryIssues = (g: any) => {
  const parsed = GeometryFile.safeParse(g);
  assert.ok(parsed.success, JSON.stringify(parsed.error?.issues));
  return checkGeometry(parsed.data, bcrElements()).map((i) => i.message);
};

// BCR32 ring set: 13 styles with codes 0 to C. Not a generic rule, so it lives here.
const ringSetIssues = (rings: { code: string }[]) => {
  const issues: string[] = [];
  if (rings.length !== 13) issues.push(`${rings.length} rows, expected 13`);
  const codes = new Set(rings.map((r) => r.code));
  for (const c of "0123456789ABC") if (!codes.has(c)) issues.push(`code '${c}' has no row`);
  return issues;
};

test("BCR32 geometry and rings: clean data gives no issue", () => {
  const r = loadDevice(dir);
  assert.deepEqual(r.issues, []);
  assert.ok(r.ok);
  assert.ok(r.data.geometry, "geometry missing");
  assert.ok(r.data.rings.length > 0, "rings missing");
  assert.deepEqual(ringSetIssues(r.data.rings), []);
  assert.equal(Object.keys(r.data.geometry!.place).length, 88);
  assert.equal(r.data.rings.length, 13);
  const prov = Object.values(r.data.geometry!.place).filter((p) => p.prov === "missing").map((p) => p.view);
  assert.equal(prov.length, 17);
  assert.ok(prov.every((v) => v === "rear"));
});

test("geometry: an extra element ID", () => {
  const g = rawGeometry();
  g.place.B99 = { view: "top", part: "button", x: 150, y: 10, prov: "assumed" };
  assert.deepEqual(geometryIssues(g), ["place 'B99' is not an element"]);
});

test("geometry: a missing element ID", () => {
  const g = rawGeometry();
  delete g.place.E30;
  assert.deepEqual(geometryIssues(g), ["element 'E30' has no place"]);
});

test("geometry: an unknown part", () => {
  const g = rawGeometry();
  g.place.E30.part = "slider";
  assert.deepEqual(geometryIssues(g), ["unknown part 'slider'"]);
});

test("geometry: an unknown view", () => {
  const g = rawGeometry();
  g.place.E30.view = "side";
  assert.deepEqual(geometryIssues(g), ["unknown view 'side'"]);
});

test("geometry: a part outside the view", () => {
  const g = rawGeometry();
  g.place.E25.x = 5; // knob dia 18 reaches x = -4
  assert.deepEqual(geometryIssues(g), ["part of 'E25' lies outside view 'top'"]);
});

test("geometry: two overlapping knobs", () => {
  const g = rawGeometry();
  g.place.E26.x = g.place.E25.x + 10;
  assert.deepEqual(geometryIssues(g), ["part of 'E25' overlaps part of 'E26'"]);
});

test("geometry: a legend with a label index that does not exist", () => {
  const g = rawGeometry();
  g.legends.push({ for: "E25", label: 9, x: 19, y: 120, anchor: "middle", capHeight: 1.8, prov: "assumed" });
  assert.deepEqual(geometryIssues(g), ["legend 0: 'E25' has no label 9"]);
});

test("geometry: schema rejects 'measured' without x, a penWidth key and a missing part with coordinates", () => {
  const noX = rawGeometry();
  delete noX.place.B1.x;
  assert.ok(!GeometryFile.safeParse(noX).success);
  const pen = rawGeometry();
  pen.penWidth = 0.5;
  assert.match(JSON.stringify(GeometryFile.safeParse(pen).error?.issues), /[Uu]nrecognized key/);
  const missing = rawGeometry();
  missing.place.J69.x = 1;
  assert.ok(!GeometryFile.safeParse(missing).success);
});

test("rings: a duplicate code", () => {
  const f = rawRings();
  f.styles[3].code = "2";
  const parsed = RingsFile.parse(f);
  assert.deepEqual(checkRings(parsed.styles).map((i) => i.message), ["duplicate code '2'"]);
  assert.deepEqual(ringSetIssues(parsed.styles), ["code '3' has no row"]);
});

test("rings: a 14th row", () => {
  const f = rawRings();
  f.styles.push({ ...f.styles[0], id: "extra", code: "D" });
  assert.ok(!RingsFile.safeParse(f).success); // code D is not a style code
  f.styles[13].code = "0";
  const styles = RingsFile.parse(f).styles;
  assert.deepEqual(checkRings(styles).map((i) => i.message), ["duplicate code '0'"]);
  assert.deepEqual(ringSetIssues(styles), ["14 rows, expected 13"]);
});

test("rings: 'verified' with no firmware", () => {
  const f = rawRings();
  f.styles[0].status = "verified"; // source is 'inference'
  assert.match(JSON.stringify(RingsFile.safeParse(f).error?.issues), /'verified' needs source 'unit' and a firmware version/);
  f.styles[0].source = { source: "unit" };
  assert.match(JSON.stringify(RingsFile.safeParse(f).error?.issues), /needs a firmware version/);
});

// Guide checks.
const manual = { source: "manual", ref: "p. 1" };
const guideFixture = (): any => ({
  id: "demo",
  version: 1,
  title: { key: "guide.demo.title", en: "Demo" },
  firmware: "1.0.3",
  status: "unverified",
  start: { mode: "zaq", view: {} },
  steps: [
    { id: "s1", action: "press B59", focus: ["B59"], caption: { key: "guide.demo.s1", en: "Press {B59}." }, advance: "on-action", source: manual },
  ],
});
const guideIssues = (g: any, name = "demo") => {
  const parsed = GuideFile.safeParse(g);
  assert.ok(parsed.success, JSON.stringify(parsed.error?.issues));
  return checkGuide(parsed.data, { elements: bcrElements() }, name).map((i) => i.message);
};
const stepOf = (n: number) => ({ id: `s${n}`, focus: ["B59"], caption: { key: `guide.demo.s${n}`, en: "Look." }, advance: "manual" });

test("guide: clean guide gives no issue", () => assert.deepEqual(guideIssues(guideFixture()), []));

test("guide: 13 steps", () => {
  const g = guideFixture();
  g.steps = Array.from({ length: 13 }, (_, i) => stepOf(i + 1));
  assert.ok(!GuideFile.safeParse(g).success);
  g.steps.pop();
  assert.ok(GuideFile.safeParse(g).success);
});

test("guide: 9 focus IDs", () => {
  const g = guideFixture();
  g.steps[0].focus = ["B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13"];
  assert.ok(!GuideFile.safeParse(g).success);
});

test("guide: an unknown ID in a caption token and in focus", () => {
  const g = guideFixture();
  g.steps[0].caption.en = "Press {B99}.";
  assert.deepEqual(guideIssues(g), ["guide 'demo', step 's1': unknown element 'B99' in text"]);
  g.steps[0].caption.en = "Press {B59}.";
  g.steps[0].focus = ["B98"];
  assert.deepEqual(guideIssues(g), ["guide 'demo', step 's1': unknown element 'B98' in focus"]);
});

test("guide: empty firmware fails the schema", () => {
  const g = guideFixture();
  g.status = "verified";
  g.firmware = "";
  assert.ok(!GuideFile.safeParse(g).success);
});

test("guide: a guide id that differs from the file name", () => {
  assert.deepEqual(guideIssues(guideFixture(), "other"), ["guide id 'demo' differs from file name 'other'"]);
});

test("guide: a duplicate step id", () => {
  const g = guideFixture();
  g.steps.push({ ...stepOf(1) });
  assert.deepEqual(guideIssues(g), ["guide 'demo': duplicate step id 's1'"]);
});

test("clean-data test names a missing rings file, not a TypeError", () => {
  const raw = Object.fromEntries(
    readdirSync(dir).filter((n) => n.endsWith(".json")).filter((n) => n !== "rings.json").map((n) => [n, JSON.parse(readFileSync(join(dir, n), "utf8"))]),
  );
  const r = validateDevice(raw);
  assert.ok(r.ok);
  assert.throws(() => assert.ok(r.data.rings.length > 0, "rings missing"), /rings missing/);
});

test("geometry: a view prov outside the enum fails", () => {
  const g = rawGeometry();
  assert.ok(GeometryFile.safeParse(g).success);
  g.views.top.prov = "maybe";
  assert.ok(!GeometryFile.safeParse(g).success);
});

test("guide: a malformed token gives one named issue each", () => {
  for (const bad of ["{b59}", "{B59", "B59}", "{}"]) {
    const g = guideFixture();
    g.steps[0].caption.en = `Press ${bad} now.`;
    assert.deepEqual(guideIssues(g), [`guide 'demo', step 's1': malformed token '${bad}' in text`], bad);
  }
});
