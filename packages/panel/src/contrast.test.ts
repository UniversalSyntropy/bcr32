// Contrast of the theme token pairs, and the rule that each LED colour in data has a token.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice } from "@bcr32/device-data";

const themes = join(import.meta.dirname, "themes");
const css = (f: string) => readFileSync(join(themes, f), "utf8");

// One entry for each theme set: a name and its token map, read from the CSS text.
function sets(): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const [file, label] of [["device.css", "device"], ["flat.css", "flat"]] as const) {
    for (const m of css(file).matchAll(/(\[data-theme="[a-z]+"\](?:\[data-scheme="[a-z]+"\])?)\s*\{([^}]*)\}/g)) {
      const name = m[1]!.replace(/\[data-theme="([a-z]+)"\]/, "$1").replace(/\[data-scheme="([a-z]+)"\]/, " $1");
      const tokens: Record<string, string> = {};
      for (const t of m[2]!.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)) tokens[t[1]!] = t[2]!.trim();
      out[name] = tokens;
      assert.ok(name.startsWith(label));
    }
  }
  return out;
}

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
export const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x! + 0.05) / (y! + 0.05);
};

const loaded = loadDevice(join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32"));
assert.ok(loaded.ok);
const ledNames = [...new Set([...loaded.data.device.ledColours, ...loaded.data.elements.flatMap((e) => e.colours ?? [])])];

test("themes: device, flat light and flat dark exist", () => {
  assert.deepEqual(Object.keys(sets()).sort(), ["device", "flat dark", "flat light"]);
});

test("every theme sets the same token names", () => {
  const all = Object.values(sets()).map((t) => Object.keys(t).sort().join(","));
  assert.equal(new Set(all).size, 1);
});

test("text at least 4.5 to 1, focus ring and lit parts at least 3 to 1", () => {
  for (const [name, t] of Object.entries(sets())) {
    const min = (a: string, b: string, limit: number) => {
      const r = ratio(t[a]!, t[b]!);
      assert.ok(r >= limit, `${name}: ${a} on ${b} is ${r.toFixed(2)}, need ${limit}`);
    };
    min("legend", "face", 4.5);
    min("page-text", "page", 4.5);
    min("focus", "face", 3);
    min("focus", "page", 3);
    min("part-edge", "face", 3);
    min("hatch", "face", 3);
    min("ring-on", "face", 3);
    for (const led of ledNames.filter((n) => n !== "off")) min(`led-${led}`, "face", 3);
  }
});

test("LED names: each name in data has a token in every theme", () => {
  assert.ok(ledNames.length >= 6);
  for (const [name, t] of Object.entries(sets())) for (const led of ledNames) assert.ok(`led-${led}` in t, `${name} has no --led-${led}`);
});

const printNames = ["red", "orange", "yellow", "lime", "green", "teal", "cyan", "magenta", "white"];

test("printed colours: at least 4.5 to 1 on the face and on a part; bar text on a bar", () => {
  for (const [name, t] of Object.entries(sets())) {
    for (const c of printNames) {
      assert.ok(ratio(t[`print-${c}`]!, t["face"]!) >= 4.5, `${name}: print-${c} on face is ${ratio(t[`print-${c}`]!, t["face"]!).toFixed(2)}`);
      assert.ok(ratio(t[`print-${c}`]!, t["part"]!) >= 4.5, `${name}: print-${c} on part is ${ratio(t[`print-${c}`]!, t["part"]!).toFixed(2)}`);
    }
    assert.ok(ratio(t["bar-text"]!, t["bar"]!) >= 4.5, `${name}: bar-text on bar`);
  }
});

test("lit button: the legend colour (on-led) is at least 4.5 to 1 on every lit LED colour, in each theme", () => {
  for (const [name, t] of Object.entries(sets()))
    for (const led of ledNames.filter((n) => n !== "off")) {
      const r = ratio(t["on-led"]!, t[`led-${led}`]!);
      assert.ok(r >= 4.5, `${name}: on-led on led-${led} is ${r.toFixed(2)}`);
    }
});
