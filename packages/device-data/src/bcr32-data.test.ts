// Count check for the BCR32 data set (playbook step 1.3).
import assert from "node:assert/strict";
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
