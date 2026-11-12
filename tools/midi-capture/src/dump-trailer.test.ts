import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { badTrailers, computeTrailer, splitMessages, storedTrailer } from "./dump-trailer.ts";

function build(addr: number[], data: number[]): Uint8Array {
  const body = [0xf0, 0x00, 0x20, 0x32, 0x7f, 0x64, 0x04, 0x0c, ...addr, ...data];
  const sum = body.reduce((a, b) => a + b, 0) & 0xffff;
  return Uint8Array.from([...body, sum >> 12, (sum >> 8) & 15, (sum >> 4) & 15, sum & 15, 0xf7]);
}

test("synthetic message: stored trailer equals the byte sum", () => {
  const m = build([0, 0, 4, 0], new Array(256).fill(15));
  assert.equal(computeTrailer(m), 0x1139); // value seen in the empty controller slot 4, part 0
  assert.equal(storedTrailer(m), 0x1139);
  assert.deepEqual(badTrailers(m), []);
});

test("one changed data nibble or address nibble is caught", () => {
  const m = build([0, 0, 4, 0], new Array(256).fill(15));
  const a = Uint8Array.from(m); a[20] = 14;
  const b = Uint8Array.from(m); b[11] = 1;
  assert.deepEqual(badTrailers(a), [0]);
  assert.deepEqual(badTrailers(b), [0]);
});

test("splitMessages splits on F7", () => {
  const m = build([0, 0, 0, 0], new Array(256).fill(0));
  assert.equal(splitMessages(Uint8Array.from([...m, ...m])).length, 2);
});

const dir = join(import.meta.dirname, "../../../local/backups");
const real = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".syx")) : [];
test("real backups: every trailer matches (skipped without local/backups)", { skip: real.length === 0 }, () => {
  for (const f of real) assert.deepEqual(badTrailers(readFileSync(join(dir, f))), [], f);
});
