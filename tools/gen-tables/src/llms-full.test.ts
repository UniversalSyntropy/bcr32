// Tests for llms-full.ts and the two index generators.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice } from "@bcr32/device-data";

import { generate } from "./generate.ts";
import { build, chapterFiles, stripFrontMatter } from "./llms-full.ts";

test("front matter is removed, a body without it stays", () => {
  assert.equal(stripFrontMatter("---\ntitle: A\n---\n\n# A\n\nText.\n"), "# A\n\nText.\n");
  assert.equal(stripFrontMatter("---\r\ntitle: A\r\n---\r\n\r\n# A\r\n"), "# A\r\n");
  assert.equal(stripFrontMatter("# A\n\n---\n\nText.\n"), "# A\n\n---\n\nText.\n");
});

test("the chapter list comes from the README table in order", () => {
  const readme = "| No. | Chapter |\n| --- | --- |\n| 0 | [Intro](00-a.md) |\n| 1 | [Two](01-b.md#x) |\nText [x](zz.md)\n";
  assert.deepEqual(chapterFiles(readme), ["00-a.md", "01-b.md"]);
  assert.deepEqual(chapterFiles("no table"), []);
});

test("planted fault: the build changes when a chapter changes, and has one marker per chapter", () => {
  const a = build("# llms\n", [{ file: "00-a.md", text: "---\nx: 1\n---\n\n# A\n" }, { file: "01-b.md", text: "# B\n" }]);
  const b = build("# llms\n", [{ file: "00-a.md", text: "---\nx: 1\n---\n\n# A!\n" }, { file: "01-b.md", text: "# B\n" }]);
  assert.notEqual(a, b);
  assert.equal(a.match(/<!-- file: /g)?.length, 2);
  assert.ok(!a.includes("x: 1"));
});

const loaded = loadDevice(join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32"));
assert.ok(loaded.ok);

test("index by control lists every element, index by function lists every function", () => {
  const c = generate("<!-- gen:index-controls -->\n<!-- gen:end -->\n", loaded.data);
  assert.deepEqual(c.errors, []);
  assert.equal(c.text.split("\n").filter((l) => l.startsWith("| `")).length, loaded.data.elements.length);
  assert.match(c.text, /\| `B1` \| Button \| ZAQ \(sequencer\): Go to CTRL mode/);
  const f = generate("<!-- gen:index-functions -->\n<!-- gen:end -->\n", loaded.data);
  assert.deepEqual(f.errors, []);
  assert.equal(f.text.split("\n").filter((l) => /^\| [^-]/.test(l)).length - 1, loaded.data.functions.length);
  assert.match(f.text, /\| Go to CTRL mode \| ZAQ \(sequencer\) \| `B1` \| `tap B1` \|/);
});
