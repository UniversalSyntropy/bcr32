// Layout tests: placement, ring geometry, group order. Pure; no DOM.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice } from "@bcr32/device-data";

import { buildLayout, controlBox, groupViewBox, isControl, VIEW_MARGIN_MM } from "./layout.ts";

const loaded = loadDevice(join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32"));
assert.ok(loaded.ok && loaded.data.geometry !== undefined, "device data must load");
const { geometry, elements, device } = loaded.data;
const names = new Map(device.groups.map((g) => [g.id, g.name]));
const top = buildLayout(geometry!, elements, "top", names);
const rear = buildLayout(geometry!, elements, "rear", names);

test("top view holds every top element and nothing else", () => {
  const want = elements.filter((e) => e.view === "top").map((e) => e.id).sort();
  assert.deepEqual(top.items.map((i) => i.id).sort(), want);
  assert.equal(top.missing.length, 0);
  assert.deepEqual(top.viewBox, [-VIEW_MARGIN_MM, -VIEW_MARGIN_MM, 304 + 2 * VIEW_MARGIN_MM, 238 + 2 * VIEW_MARGIN_MM]);
});

test("control ID list: every button and encoder, no LED and no display", () => {
  const ids = top.items.filter((i) => isControl(i.kind)).map((i) => i.id);
  assert.equal(ids.length, 64); // 31 buttons and 33 encoders
  assert.ok(ids.includes("B59") && ids.includes("SEL") && !ids.includes("DISP") && !ids.includes("L4"));
  // The group control lists and the control ID list are one set.
  assert.deepEqual(top.groups.flatMap((g) => g.controls).sort(), [...ids].sort());
});

test("missing is the 17 rear jacks J69 to J85 and nothing else", () => {
  const want = Array.from({ length: 17 }, (_, i) => `J${69 + i}`);
  assert.deepEqual([...rear.missing].sort(), [...want].sort());
  assert.equal(rear.items.length, 0);
  assert.equal(geometry!.views.rear!.prov, "measured");
  assert.ok(rear.missing.length > 0, "the rear view draws the note while jacks are missing");
});

test("480 ring LEDs on 32 knobs; SEL has no ring", () => {
  const ringed = top.items.filter((i) => i.ring !== undefined);
  assert.equal(ringed.length, 32);
  assert.equal(ringed.reduce((n, i) => n + i.ring!.leds.length, 0), 480);
  assert.equal(top.items.find((i) => i.id === "SEL")!.ring, undefined);
});

test("ring LED angles: LED 0 at -150, LED 7 at 0, LED 14 at +150 degrees, LED centre radius 11 mm (outer edge 12.5)", () => {
  const e25 = top.items.find((i) => i.id === "E25")!;
  const [l0, l7, l14] = [0, 7, 14].map((n) => e25.ring!.leds[n]!);
  const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
  // sin(150 deg) = 0.5, cos(150 deg) = -0.8660254037844386
  close(l0!.x, e25.cx - 5.5);
  close(l0!.y, e25.cy + 11 * 0.8660254037844386);
  close(l7!.x, e25.cx);
  close(l7!.y, e25.cy - 11);
  close(l14!.x, e25.cx + 5.5);
  close(l14!.y, l0!.y);
});

test("ring LEDs are 1 x 3 mm rectangles rotated to their angle", () => {
  const e25 = top.items.find((i) => i.id === "E25")!;
  for (const n of [0, 7, 14]) assert.deepEqual([e25.ring!.leds[n]!.w, e25.ring!.leds[n]!.h], [1, 3]);
  assert.equal(e25.ring!.leds[0]!.rot, -150);
  assert.equal(e25.ring!.leds[7]!.rot, 0);
  assert.equal(e25.ring!.leds[14]!.rot, 150);
});

test("legends: one text for each label with placement on; B1 shows its label", () => {
  const want = elements.filter((e) => e.view === "top").flatMap((e) => e.labels.filter((l) => l.placement === "on").map((l) => `${e.id}:${l.text}`));
  const got = top.items.flatMap((i) => i.legends.map((l) => `${i.id}:${l.text}`));
  assert.deepEqual(got.sort(), want.sort());
  assert.equal(want.length, 31);
  assert.deepEqual(top.items.find((i) => i.id === "B1")!.legends.map((l) => l.text), ["ZQR/CTRL"]);
});

test("group order is reading order of the first member", () => {
  assert.deepEqual(top.groups.map((g) => g.id), ["mode", "status", "parameters", "tracks", "steps", "display", "edit", "pages", "performance", "transport"]);
  assert.equal(top.groups.find((g) => g.id === "steps")!.name, "Step encoders");
  assert.deepEqual(top.groups.find((g) => g.id === "steps")!.ids.slice(0, 9), ["E25", "E26", "E27", "E28", "E29", "E30", "E31", "E32", "E33"]);
});

test("every placed part lies inside its view", () => {
  for (const l of [top, rear])
    for (const i of l.items) {
      assert.ok(i.cx - i.w / 2 >= 0 && i.cx + i.w / 2 <= l.case.w, i.id);
      assert.ok(i.cy - i.h / 2 >= 0 && i.cy + i.h / 2 <= l.case.h, i.id);
    }
});

test("control box matches the part box in percent of the stage", () => {
  const b = top.items.find((i) => i.id === "B1")!;
  const box = controlBox(b, top.viewBox);
  const [x, y, w, h] = top.viewBox;
  assert.ok(Math.abs((box.left / 100) * w + x - (b.cx - 12.5)) < 1e-9);
  assert.ok(Math.abs((box.top / 100) * h + y - (b.cy - 4.25)) < 1e-9);
  assert.ok(Math.abs((box.width / 100) * w - 25) < 1e-9);
});

test("group zoom covers the group and its rings", () => {
  const [x, y, w, h] = groupViewBox(top, "steps");
  for (const i of top.items.filter((i) => i.group === "steps"))
    assert.ok(i.cx - 12.5 >= x && i.cx + 12.5 <= x + w && i.cy - 12.5 >= y && i.cy + 12.5 <= y + h, i.id);
});
