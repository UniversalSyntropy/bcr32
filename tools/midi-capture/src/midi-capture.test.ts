// Tests for midi-capture. The tool needs macOS and CoreMIDI, so every test is skipped elsewhere.
// The tests never touch a unit: `send` refuses all but loopback ports.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { before, test } from "node:test";

const mac = process.platform === "darwin";
const source = join(import.meta.dirname, "main.swift");
const dir = mac ? mkdtempSync(join(tmpdir(), "midi-capture-test-")) : "";
const bin = join(dir, "midi-capture");

function run(args: string[], timeout = 30_000) {
  return spawnSync(bin, args, { encoding: "utf8", timeout, stdio: ["ignore", "pipe", "pipe"] });
}

before(
  () => {
    if (!mac) return;
    const build = spawnSync("swiftc", ["-O", "-swift-version", "5", "-o", bin, source], { encoding: "utf8" });
    assert.equal(build.status, 0, `swiftc failed: ${build.stderr}`);
  },
  { timeout: 240_000 },
);

test("selftest: known messages through a virtual port come back as expected records", { skip: !mac }, () => {
  const r = run(["selftest"]);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /selftest: ok 13 of 13/);
});

test("send: refuses the unit and any name that is not a loopback port", { skip: !mac }, () => {
  for (const name of ["BCR-32", "Behringer BCR-32 BCR-32 CTRL", "BCR-32 ZAQ", "Some Synth"]) {
    const r = run(["send", "--to", name, "90", "3C", "64"]);
    assert.equal(r.status, 2, `${name}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /refused/);
  }
});

test("send: a name with a loopback word does not open a way to the unit", { skip: !mac }, () => {
  const r = run(["send", "--to", "Behringer loopback", "90", "3C", "64"]);
  assert.notEqual(r.status, 0);
  assert.doesNotMatch(r.stdout, /^sent /);
});

test("send: bad hex and missing options fail with a usage error", { skip: !mac }, () => {
  assert.equal(run(["send", "--to", "IAC", "zz"]).status, 2);
  assert.equal(run(["send"]).status, 2);
});

test("list: prints sources and marks loopback destinations", { skip: !mac }, () => {
  const r = run(["list"]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^sources/m);
  assert.match(r.stdout, /^destinations/m);
  for (const line of r.stdout.split("\n")) {
    if (/bcr|behringer/i.test(line)) assert.doesNotMatch(line, /\[loopback\]/, line);
  }
});

test("log and send: a known message on the IAC loopback port is logged correctly", { skip: !mac }, async (t) => {
  const listing = run(["list"]).stdout;
  if (!/IAC/i.test(listing)) return t.skip("no IAC bus on this computer");
  const out = join(dir, "loop.jsonl");
  const logger = spawnSync("sh", ["-c", `"${bin}" log --port IAC --out "${out}" --seconds 4 </dev/null >/dev/null 2>&1 & sleep 1.5; "${bin}" send --to IAC 90 3C 64 B0 61 7F; wait`], { encoding: "utf8", timeout: 30_000 });
  assert.equal(logger.status, 0, logger.stderr);
  const rows = readFileSync(out, "utf8").trim().split("\n").map((l) => JSON.parse(l) as Record<string, unknown>);
  const kinds = rows.map((r) => `${String(r.kind)}:${String(r.hex)}`);
  assert.ok(kinds.includes("note-on:90 3C 64"), kinds.join(", "));
  assert.ok(kinds.includes("cc:B0 61 7F"), kinds.join(", "));
  assert.match(String(rows[0]?.t), /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/);
  assert.equal(typeof rows[0]?.mono_ns, "number");
});
