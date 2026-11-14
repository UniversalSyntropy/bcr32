// Ring model (D2 section 5). Pure: the same input always gives the same LEDs.
import type { EncMode, RingStyleId } from "./view.ts";

export type KnownRing = { style: RingStyleId; encMode: EncMode; value: number | null; min: number; max: number };
type Rule = (s: Scale) => boolean[];

// Scaled position. `num` runs 0..den after the clamp. The rules stay in integer order,
// so the edges carry no float error. n = count - 1 (last LED index), mid = n / 2.
interface Scale {
  num: number;
  den: number;
  count: number;
  n: number;
  mid: number;
}

const lit = (count: number, on: (i: number) => boolean) => Array.from({ length: count }, (_, i) => on(i));
const range = (s: Scale, a: number, b: number) => lit(s.count, (i) => i >= Math.min(a, b) && i <= Math.max(a, b));
const idx = (s: Scale) => Math.floor((s.num * s.n) / s.den);

const dark: Rule = (s) => lit(s.count, () => false);
const oneDot: Rule = (s) => range(s, idx(s), idx(s));
const twelveDot: Rule = (s) => {
  const h = Math.floor((s.num * 2 * s.n) / s.den);
  return lit(s.count, (i) => i === Math.floor(h / 2) || i === Math.ceil(h / 2));
};
const bar: Rule = (s) => range(s, 0, idx(s));
const spread: Rule = (s) => {
  const w = Math.floor((s.num * s.mid) / s.den);
  return lit(s.count, (i) => Math.abs(i - s.mid) <= w);
};
const pan: Rule = (s) => range(s, s.mid, idx(s));
const qual: Rule = (s) => {
  // Math.round rounds half up.
  const w = Math.round(((s.den - s.num) * s.mid) / s.den);
  return lit(s.count, (i) => Math.abs(i - s.mid) <= w);
};
const cut: Rule = (s) => {
  const from = Math.floor((s.num * s.count) / s.den);
  return lit(s.count, (i) => i >= from);
};
const damp: Rule = (s) => lit(s.count, (i) => i >= s.n - idx(s));
const darkAtMin = (rule: Rule): Rule => (s) => (s.num === 0 ? dark(s) : rule(s));

// One rule for each style ID in rings.json.
export const RING_RULES: Record<RingStyleId, Rule> = {
  off: dark,
  "1dot": oneDot,
  "1dot/off": darkAtMin(oneDot),
  "12dot": twelveDot,
  "12dot/off": darkAtMin(twelveDot),
  bar,
  "bar/off": darkAtMin(bar),
  spread,
  pan,
  qual,
  cut,
  damp,
  mcu: dark, // host part unknown; the panel draws known: false
};

// Returns `count` flags, true = LED lit. `encMode` is carried and not read in version 2.
export function ringLit(ring: KnownRing, count = 15): boolean[] {
  if (!Number.isInteger(count) || count < 3 || count % 2 === 0) throw new RangeError(`ring count must be odd and at least 3, got ${count}`);
  const n = count - 1;
  const base: Scale = { num: 0, den: 1, count, n, mid: n / 2 };
  if (ring.value === null) return dark(base);
  let num = ring.value - ring.min;
  let den = ring.max - ring.min;
  if (den < 0) [num, den] = [-num, -den]; // inverted range, same formula
  if (den === 0) [num, den] = [0, 1];
  num = Math.min(Math.max(num, 0), den);
  return RING_RULES[ring.style]({ ...base, num, den });
}
