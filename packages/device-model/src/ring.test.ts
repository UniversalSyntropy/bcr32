// Ring model tests. The oracle table is hand-computed from D2 table 5.2 (range 0 to 127, 15 LEDs).
// Expected values are literals. The model never computes them.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { RING_RULES, RING_STYLE_IDS, ringLit, type KnownRing, type RingStyleId } from "./index.ts";

const VALUES = [0, 1, 32, 63, 64, 65, 100, 127];
const ORACLE: Record<RingStyleId, string[]> = {
  off: ["dark", "dark", "dark", "dark", "dark", "dark", "dark", "dark"],
  "1dot": ["0", "0", "3", "6", "7", "7", "11", "14"],
  "1dot/off": ["dark", "0", "3", "6", "7", "7", "11", "14"],
  "12dot": ["0", "0", "3,4", "6,7", "7", "7", "11", "14"],
  "12dot/off": ["dark", "0", "3,4", "6,7", "7", "7", "11", "14"],
  bar: ["0", "0", "0-3", "0-6", "0-7", "0-7", "0-11", "0-14"],
  "bar/off": ["dark", "0", "0-3", "0-6", "0-7", "0-7", "0-11", "0-14"],
  spread: ["7", "7", "6-8", "4-10", "4-10", "4-10", "2-12", "0-14"],
  pan: ["0-7", "0-7", "3-7", "6,7", "7", "7", "7-11", "7-14"],
  qual: ["0-14", "0-14", "2-12", "3-11", "4-10", "4-10", "6-8", "7"],
  cut: ["0-14", "0-14", "3-14", "7-14", "7-14", "7-14", "11-14", "dark"],
  damp: ["14", "14", "11-14", "8-14", "7-14", "7-14", "3-14", "0-14"],
  mcu: ["dark", "dark", "dark", "dark", "dark", "dark", "dark", "dark"],
};

// "3,4" is the list 3 and 4. "0-3" is the run 0 to 3. "dark" is no LED.
function indexes(text: string): number[] {
  if (text === "dark") return [];
  if (text.includes(",")) return text.split(",").map(Number);
  const [a, b = a] = text.split("-").map(Number);
  return Array.from({ length: b! - a! + 1 }, (_, i) => a! + i);
}
const lit = (flags: boolean[]) => flags.flatMap((on, i) => (on ? [i] : []));
const ring = (style: RingStyleId, value: number | null, min = 0, max = 127, encMode: KnownRing["encMode"] = "absolute"): KnownRing => ({ style, encMode, value, min, max });
const row = (style: RingStyleId, v: number) => lit(ringLit(ring(style, v)));

for (const style of RING_STYLE_IDS)
  VALUES.forEach((v, k) => {
    const name = `oracle: ${style} at ${v}`;
    const disagrees = (style === "12dot/off" || style === "qual") && v === 64;
    test(disagrees ? `model-disagrees: ${name}` : name, () => {
      assert.deepEqual(row(style, v), indexes(ORACLE[style][k]!));
    });
  });

test("photo: floor, not round", () => {
  assert.deepEqual(row("1dot", 63), [6]);
  assert.deepEqual(row("1dot", 64), [7]);
});

test("every ring result has the count length", () => {
  for (const style of RING_STYLE_IDS) assert.equal(ringLit(ring(style, 50)).length, 15);
  assert.equal(ringLit(ring("bar", 50), 9).length, 9);
});

test("value null: all dark, also with a relative encMode", () => {
  for (const style of RING_STYLE_IDS) {
    assert.deepEqual(lit(ringLit(ring(style, null))), [], style);
    assert.deepEqual(lit(ringLit(ring(style, null, 0, 127, "relative-1"))), [], style);
  }
});

test("encMode is not read in version 2", () => {
  assert.deepEqual(ringLit(ring("bar", 63, 0, 127, "relative-2")), ringLit(ring("bar", 63, 0, 127, "absolute")));
});

test("values outside the range are clamped", () => {
  assert.deepEqual(row("1dot", 200), [14]);
  assert.deepEqual(row("1dot", -5), [0]);
  assert.deepEqual(row("bar/off", -5), []);
});

test("min equals max: p is 0", () => {
  assert.deepEqual(lit(ringLit(ring("1dot", 5, 5, 5))), [0]);
  assert.deepEqual(lit(ringLit(ring("bar/off", 5, 5, 5))), []);
});

test("inverted range 127 to 0: 1dot at 0 is LED 14", () => {
  assert.deepEqual(lit(ringLit(ring("1dot", 0, 127, 0))), [14]);
});

test("14-bit range: 1dot at 8192 is LED 7", () => {
  assert.deepEqual(lit(ringLit(ring("1dot", 8192, 0, 16383))), [7]);
});

test("a count that is even or below 3 throws RangeError", () => {
  assert.throws(() => ringLit(ring("bar", 1), 4), RangeError);
  assert.throws(() => ringLit(ring("bar", 1), 1), RangeError);
});

test("RING_RULES keys equal the style IDs of rings.json", () => {
  const file = join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32", "rings.json");
  const ids = (JSON.parse(readFileSync(file, "utf8")) as { styles: { id: string }[] }).styles.map((s) => s.id);
  assert.deepEqual(Object.keys(RING_RULES).sort(), [...ids].sort());
  assert.deepEqual([...RING_STYLE_IDS].sort(), [...ids].sort());
});
