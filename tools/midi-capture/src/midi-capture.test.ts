// Tests for midi-capture. The tool needs macOS and CoreMIDI, so every test is skipped elsewhere.
// The tests never touch a unit: `send` refuses all but loopback ports.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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

test("map --auto: records the message after a step, none after Enter, none after a timeout, and skips clock", { skip: !mac }, (t) => {
  if (!/IAC/i.test(run(["list"]).stdout)) return t.skip("no IAC bus on this computer");
  const steps = join(dir, "steps.json");
  const out = join(dir, "map.jsonl");
  writeFileSync(steps, JSON.stringify([
    { id: "a", action: "press", say: "step a" },
    { id: "b", action: "press", say: "step b" },
    { id: "c", action: "press", say: "step c" },
  ]));
  const script = `
    (sleep 1.5; "${bin}" send --to IAC 90 3C 64) &
    (sleep 4.2; "${bin}" send --to IAC F8) &
    (sleep 3.3; echo) | "${bin}" map --steps "${steps}" --port IAC --out "${out}" --auto --quiet 0.4 --timeout 1.8
    wait`;
  const r = spawnSync("sh", ["-c", script], { encoding: "utf8", timeout: 40_000 });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const rows = readFileSync(out, "utf8").trim().split("\n").map((l) => JSON.parse(l) as { id: string; result: string; messages: { hex: string }[] });
  assert.deepEqual(rows.map((x) => `${x.id}:${x.result}`), ["a:messages", "b:none", "c:none"], r.stdout);
  assert.deepEqual(rows[0]?.messages.map((m) => m.hex), ["90 3C 64"]);
  assert.match(r.stdout, /done: 3 of 3 steps, 1 with messages, 2 with none/);
});

test("map: saves on Enter, c clears a wrong control, n saves none", { skip: !mac }, (t) => {
  if (!/IAC/i.test(run(["list"]).stdout)) return t.skip("no IAC bus on this computer");
  const steps = join(dir, "steps-confirm.json");
  const out = join(dir, "map-confirm.jsonl");
  writeFileSync(steps, JSON.stringify([
    { id: "a", action: "press", say: "step a" },
    { id: "b", action: "press", say: "step b" },
    { id: "c", action: "press", say: "step c" },
  ]));
  const script = `
    (sleep 1.2; "${bin}" send --to IAC 90 3C 64) &
    (sleep 2.6; "${bin}" send --to IAC 90 3D 64) &
    (sleep 4.5; "${bin}" send --to IAC 90 3E 64) &
    (sleep 2; echo; sleep 1.8; echo c; sleep 1.5; echo; sleep 0.8; echo n) | "${bin}" map --steps "${steps}" --port IAC --out "${out}"
    wait`;
  const r = spawnSync("sh", ["-c", script], { encoding: "utf8", timeout: 40_000 });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  const rows = readFileSync(out, "utf8").trim().split("\n").map((l) => JSON.parse(l) as { id: string; result: string; messages: { hex: string }[] });
  assert.deepEqual(rows.map((x) => `${x.id}:${x.result}`), ["a:messages", "b:messages", "c:none"], r.stdout);
  assert.deepEqual(rows[1]?.messages.map((m) => m.hex), ["90 3E 64"]);
});

test("map: a bad steps file or a missing option is a usage error", { skip: !mac }, () => {
  assert.equal(run(["map"]).status, 2);
  const bad = join(dir, "bad.json");
  writeFileSync(bad, JSON.stringify([{ id: "a" }]));
  assert.equal(run(["map", "--steps", bad]).status, 2);
  assert.equal(run(["map", "--steps", join(dir, "missing.json")]).status, 2);
});

test("unit-send: allows only tier 1 messages (dry run, no port opened)", { skip: !mac }, () => {
  const ok = [
    ["F0", "7E", "7F", "06", "01", "F7"],
    ["FA"], ["FC"], ["F8"],
    ["90", "3C", "64"], ["80", "3C", "00"], ["B0", "01", "40"], ["C0", "05"], ["E0", "00", "40"],
  ];
  for (const m of ok) {
    const r = run(["unit-send", "--to", "ZAQ", "--dry-run", "--confirm", m.join(" "), ...m]);
    assert.equal(r.status, 0, `${m.join(" ")}: ${r.stderr}`);
    assert.match(r.stdout, /dry run/);
  }
});

test("unit-send: refuses SysEx, system messages, channel mode CC, bad data and wrong confirm", { skip: !mac }, () => {
  const bad = [
    ["F0", "00", "20", "32", "7F", "64", "74", "00", "F7"],
    ["F0", "7E", "7F", "06", "01"],
    ["FF"], ["F9"], ["F1", "00"], ["F1", "00", "00"], ["F2", "00", "00"], ["B0", "7B", "00"], ["B0", "78", "00"],
    ["90", "3C"], ["90", "80", "64"], ["C0", "05", "05"], ["FA", "FA"],
  ];
  for (const m of bad) {
    const r = run(["unit-send", "--to", "CTRL", "--dry-run", "--confirm", m.join(" "), ...m]);
    assert.equal(r.status, 2, `${m.join(" ")}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /refused/);
  }
  const wrong = run(["unit-send", "--to", "CTRL", "--dry-run", "--confirm", "90 3C 65", "90", "3C", "64"]);
  assert.equal(wrong.status, 2);
  const noConfirm = run(["unit-send", "--to", "CTRL", "--dry-run", "90", "3C", "64"]);
  assert.equal(noConfirm.status, 2);
  const badPort = run(["unit-send", "--to", "IAC", "--dry-run", "--confirm", "90 3C 64", "90", "3C", "64"]);
  assert.equal(badPort.status, 2);
});
