// Planted-fault tests for gen-tables (playbook step 1.5).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice } from "@bcr32/device-data";

import { generate, idRanges } from "./generate.ts";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const loaded = loadDevice(join(ROOT, "data", "devices", "bcr32"));
assert.ok(loaded.ok);
const data = loaded.data;

const doc = (body: string, marker = "<!-- gen:element-kinds -->") => `# Title\n\n${marker}\n${body}<!-- gen:end -->\n\nAfter.\n`;

test("ID ranges: runs of three or more collapse, other IDs stay", () => {
  assert.equal(idRanges(["B1", "B5", "B6", "B7", "B9", "B10", "SEL"]), "`B1`, `B5`–`B7`, `B9`, `B10`, `SEL`");
  assert.equal(idRanges(["L2.in", "L2.a"]), "`L2.in`, `L2.a`");
});

test("an empty block fills from the data, and a second run changes nothing", () => {
  const first = generate(doc(""), data);
  assert.deepEqual(first.errors, []);
  assert.equal(first.drift.length, 1);
  assert.match(first.text, /\| Button \| 31 \| `B1`, `B5`–`B24`, `B59`–`B68` \|/);
  assert.match(first.text, /\| Jack \| 17 \| `J69`–`J85` \|/);
  assert.ok(first.text.endsWith("<!-- gen:end -->\n\nAfter.\n"));
  const second = generate(first.text, data);
  assert.deepEqual(second.drift, []);
  assert.equal(second.text, first.text);
});

test("planted fault: a hand edit inside a block is drift", () => {
  const good = generate(doc(""), data).text;
  const edited = good.replace("| Button | 31 |", "| Button | 30 |");
  const result = generate(edited, data);
  assert.equal(result.drift.length, 1);
  assert.equal(result.drift[0]!.line, 3);
  assert.equal(result.text, good);
});

test("planted fault: a change in the data is drift", () => {
  const good = generate(doc(""), data).text;
  const less = { ...data, elements: data.elements.filter((e) => e.id !== "B68") };
  assert.equal(generate(good, less).drift.length, 1);
});

test("each generator gives a table; parameters select the mode and the value set", () => {
  const modes = generate(doc("", "<!-- gen:modes -->"), data).text;
  assert.match(modes, /\| ZAQ Settings \| `hold B59 \+ B61` \| `press B60` \| `B5`–`B8` blue \|/);
  const functions = generate(doc("", "<!-- gen:functions mode=zaq-settings -->"), data).text;
  assert.match(functions, /\| `B5` \| Gate output level \| `press B5` \| Gate output level \| — \| manual \|/);
  assert.doesNotMatch(functions, /Tempo/);
  const values = generate(doc("", "<!-- gen:values set=lane-value -->"), data).text;
  assert.match(values, /\| Off \| — \|\n\| 1–127 \| — \|/);
});

const faults: [string, string, RegExp][] = [
  ["unknown generator", doc("", "<!-- gen:nope -->"), /unknown generator 'nope'/],
  ["start marker that is not valid", doc("", "<!-- gen:modes mode -->"), /start marker is not valid/],
  ["missing end marker", "# T\n\n<!-- gen:modes -->\n\ntext\n", /without an end marker/],
  ["second start before the end", "<!-- gen:modes -->\n<!-- gen:modes -->\n<!-- gen:end -->\n", /without an end marker/],
  ["end marker alone", "# T\n\n<!-- gen:end -->\n", /end marker without a start marker/],
  ["missing parameter", doc("", "<!-- gen:functions -->"), /parameter 'mode' is missing/],
  ["unknown mode", doc("", "<!-- gen:functions mode=nope -->"), /unknown mode 'nope'/],
  ["unknown value set", doc("", "<!-- gen:values set=nope -->"), /unknown value set 'nope'/],
];
for (const [name, text, expected] of faults)
  test(`planted fault: ${name}`, () => {
    const result = generate(text, data);
    assert.match(result.errors.map((e) => e.message).join("\n"), expected);
  });

test("markers inside a code fence are text", () => {
  const text = "# T\n\n```md\n<!-- gen:nope -->\n<!-- gen:end -->\n```\n";
  const result = generate(text, data);
  assert.deepEqual(result.errors, []);
  assert.equal(result.blocks, 0);
  assert.equal(result.text, text);
});

test("the command: --check exits 1 on drift and writes nothing; a run without it writes; then --check exits 0", () => {
  const file = join(mkdtempSync(join(tmpdir(), "gen-tables-")), "doc.md");
  writeFileSync(file, doc("| stale |\n"));
  const run = (...a: string[]) => spawnSync(process.execPath, [join(import.meta.dirname, "cli.ts"), ...a, file], { cwd: ROOT, encoding: "utf8" });
  const before = run("--check");
  assert.equal(before.status, 1, before.stderr);
  assert.match(before.stderr, /drift/);
  assert.match(readFileSync(file, "utf8"), /stale/);
  assert.equal(run().status, 0);
  assert.doesNotMatch(readFileSync(file, "utf8"), /stale/);
  assert.equal(run("--check").status, 0);
  assert.equal(spawnSync(process.execPath, [join(import.meta.dirname, "cli.ts"), "--nope"], { cwd: ROOT }).status, 2);
});
