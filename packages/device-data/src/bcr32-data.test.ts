// Checks for the BCR32 data set: counts (playbook step 1.3), reference cross-check (step 1.4).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice } from "./index.ts";

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
const reference = readFileSync(join(import.meta.dirname, "..", "..", "..", "docs", "reference", "bcr32-reference.md"), "utf8");

// First cell of each body row of the first table under a heading that starts with `heading`.
function firstCells(heading: string): string[] {
  const lines = reference.split("\n");
  const start = lines.findIndex((l) => l.startsWith(heading));
  assert.notEqual(start, -1, `heading '${heading}' is not in the reference`);
  const first = lines.findIndex((l, i) => i > start && l.startsWith("|"));
  const rows: string[] = [];
  for (let i = first + 2; lines[i]?.startsWith("|"); i++) rows.push(lines[i]!.split("|")[1]!.trim());
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
  const rows2 = firstCells("## 2. Modes and menus");
  assert.equal(rows2.length, 11);
  for (const name of rows2)
    if (name === "Erase / SysEx") for (const n of ["Erase menu", "SysEx export menu", "SysEx import"]) assert.ok(names.has(n), n);
    else assert.ok(names.has(name), `§2 row '${name}' has no mode`);

  // §5: each parameter button B5–B20 has a function in ZAQ mode.
  const rows5 = firstCells("## 5. Sequencer").flatMap(expandIds);
  assert.equal(rows5.length, 16);
  for (const id of rows5) assert.ok(has("zaq", id), `§5 ${id} has no function in mode zaq`);

  // §6: each encoder E25–E56 has a function on the ZAQ Global page.
  // §6: each row has a function on the ZAQ Global page with exactly the encoders of the row; E25–E56 are all covered.
  const rows6 = firstCells("## 6. ZAQ Global page").map(expandIds);
  assert.equal(rows6.flat().length, 32);
  for (const ids of rows6) assert.ok(hasGroup("zaq-global", ids), `§6 ${ids.join()} has no function in mode zaq-global`);

  // §9.1: each Global Settings button has a function.
  const rows91 = firstCells("### 9.1 Global Settings").flatMap(expandIds);
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
  assert.deepEqual(cc.map((m) => m.number).sort((a, b) => a! - b!), [65, 66, 97, 98]);
  assert.ok(cc.every((m) => m.port === "ctrl" && m.channel === 1));
  // Nothing in the data claims a proven control mapping before step 4.3.
  assert.ok(midi.messages.every((m) => m.trigger?.confidence !== "proven"));
  // Every record names the firmware it was seen on.
  for (const r of [...midi.ports, ...midi.messages, ...midi.silences]) assert.equal(r.source.firmware, "1.0.3", r.id);
});
