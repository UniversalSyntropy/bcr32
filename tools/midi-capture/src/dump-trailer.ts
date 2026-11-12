// BCR32 SysEx dump messages end with a 16-bit trailer (4 nibbles, high first, before F7).
// Rule (proved on 8,266 messages, firmware 1.0.3): trailer = sum of every byte from F0
// up to the last data nibble, modulo 65536. Run: node dump-trailer.ts <file.syx>...

import { readFileSync } from "node:fs";

export function splitMessages(bytes: Uint8Array): Uint8Array[] {
  const out: Uint8Array[] = [];
  let start = 0;
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0xf7) {
      out.push(bytes.subarray(start, i + 1));
      start = i + 1;
    }
  }
  return out;
}

/** Trailer value computed from the message body (everything before the 4 trailer nibbles). */
export function computeTrailer(msg: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < msg.length - 5; i++) sum += msg[i] ?? 0;
  return sum & 0xffff;
}

/** Trailer value stored in the message (last 4 nibbles before F7). */
export function storedTrailer(msg: Uint8Array): number {
  const n = Array.from(msg.subarray(msg.length - 5, msg.length - 1), (x) => x & 15);
  return ((n[0] ?? 0) << 12) | ((n[1] ?? 0) << 8) | ((n[2] ?? 0) << 4) | (n[3] ?? 0);
}

/** Indexes of messages whose stored trailer differs from the computed one. */
export function badTrailers(bytes: Uint8Array): number[] {
  return splitMessages(bytes).flatMap((m, i) => (computeTrailer(m) === storedTrailer(m) ? [] : [i]));
}

if (import.meta.main) {
  let failed = false;
  for (const file of process.argv.slice(2)) {
    const bytes = readFileSync(file);
    const bad = badTrailers(bytes);
    console.log(`${bad.length === 0 ? "✅" : "❌"} ${file}: ${splitMessages(bytes).length} messages, ${bad.length} bad`);
    if (bad.length) failed = true;
  }
  process.exit(failed ? 1 : 0);
}
