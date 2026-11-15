// Tests of the guide zoom box and the cue marks. Pure; no DOM.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice } from "@bcr32/device-data";
import { elementIndex, parseAction } from "@bcr32/device-model";

import { cuesOf } from "./cues.ts";
import { buildLayout, focusViewBox } from "./layout.ts";

const loaded = loadDevice(join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32"));
assert.ok(loaded.ok && loaded.data.geometry !== undefined, "device data must load");
const { geometry, elements, device } = loaded.data;
const top = buildLayout(geometry!, elements, "top", new Map(device.groups.map((g) => [g.id, g.name])));
const idx = elementIndex({ elements });
const act = (s: string) => {
  const r = parseAction(s, idx);
  assert.ok(r.ok, s);
  return r.action;
};

test("focus box: holds every focus control with the margin, inside the base view", () => {
  const ids = ["B59", "B60"];
  const [x, y, w, h] = focusViewBox(top, ids);
  for (const i of top.items.filter((t) => ids.includes(t.id))) {
    assert.ok(i.cx - i.w / 2 >= x && i.cx + i.w / 2 <= x + w, `${i.id} inside x`);
    assert.ok(i.cy - i.h / 2 >= y && i.cy + i.h / 2 <= y + h, `${i.id} inside y`);
  }
  const [bx, by, bw, bh] = top.viewBox;
  assert.ok(x >= bx && y >= by && x + w <= bx + bw + 1e-9 && y + h <= by + bh + 1e-9);
  assert.ok(w < bw && h < bh, "zoomed");
});

test("focus box: one control gets the minimum window; unknown IDs give the base view", () => {
  const [, , w, h] = focusViewBox(top, ["B1"]);
  assert.ok(w >= 48 && h >= 30);
  assert.deepEqual(focusViewBox(top, ["NOPE"]), top.viewBox);
});

test("cue marks come from the action", () => {
  assert.deepEqual(cuesOf(act("press B59"), 500), [{ kind: "press", id: "B59" }]);
  assert.deepEqual(cuesOf(act("hold B61"), 500), [{ kind: "hold", id: "B61", seconds: 0.5 }]);
  assert.deepEqual(cuesOf(act("hold B9 + turn E25 cw ×1"), 500), [{ kind: "hold", id: "B9", seconds: 0.5 }, { kind: "turn", id: "E25", dir: "cw", count: 1 }]);
  assert.deepEqual(cuesOf(act("turn E26 ccw"), 500), [{ kind: "turn", id: "E26", dir: "ccw", count: 1 }]);
  assert.deepEqual(cuesOf(undefined, 500), []);
});
