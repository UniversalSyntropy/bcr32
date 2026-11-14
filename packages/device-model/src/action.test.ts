// Action parser tests: grammar, rules and the data audit.
import assert from "node:assert/strict";
import { join } from "node:path";
import { test } from "node:test";

import { loadDevice } from "@bcr32/device-data";

import { elementIndex, parseAction } from "./index.ts";

const dir = join(import.meta.dirname, "..", "..", "..", "data", "devices", "bcr32");
const loaded = loadDevice(dir);
assert.ok(loaded.ok, "device data must load");
const data = loaded.data;
const els = elementIndex(data);

const ok = (text: string) => {
  const r = parseAction(text, els);
  assert.ok(r.ok, `${text}: ${r.ok ? "" : r.error}`);
  return r.action;
};
const bad = (text: string, error: RegExp, at: number) => {
  const r = parseAction(text, els);
  assert.ok(!r.ok, `${text} must fail`);
  assert.match(r.error, error, text);
  assert.equal(r.at, at, `${text}: offset`);
};

test("parse: simple forms", () => {
  assert.deepEqual(ok("press B5"), { kind: "simple", verb: "press", target: { id: "B5" } });
  assert.deepEqual(ok("push E25"), { kind: "simple", verb: "push", target: { id: "E25" } });
  assert.deepEqual(ok("push SEL"), { kind: "simple", verb: "push", target: { id: "SEL" } });
  assert.deepEqual(ok("hold B12"), { kind: "simple", verb: "hold", target: { id: "B12" } });
  assert.deepEqual(ok("release B12"), { kind: "simple", verb: "release", target: { id: "B12" } });
  assert.deepEqual(ok("turn E25 cw ×3"), { kind: "simple", verb: "turn", target: { id: "E25" }, dir: "cw", count: 3 });
  assert.deepEqual(ok("turn E"), { kind: "simple", verb: "turn", target: { group: "E" } });
});

test("parse: tap is press with written tap", () => {
  assert.deepEqual(ok("tap B1"), { kind: "simple", verb: "press", target: { id: "B1" }, written: "tap" });
});

test("parse: timed, combo, chord and sequence", () => {
  assert.deepEqual(ok("B1 ×3s"), { kind: "timed", target: { id: "B1" }, seconds: 3 });
  assert.deepEqual(ok("hold B59 + press B61"), {
    kind: "combo", hold: { id: "B59" }, then: { kind: "simple", verb: "press", target: { id: "B61" } },
  });
  assert.deepEqual(ok("hold B59 + turn E"), {
    kind: "combo", hold: { id: "B59" }, then: { kind: "simple", verb: "turn", target: { group: "E" } },
  });
  assert.deepEqual(ok("hold SEL + push E25").kind, "combo");
  assert.deepEqual(ok("press B5 and B6 together"), { kind: "chord", targets: [{ id: "B5" }, { id: "B6" }] });
  const seq = ok("press B5, then press B6");
  assert.equal(seq.kind, "sequence");
});

test("rule: push only on an encoder", () => bad("push B5", /'push' is for an encoder/, 5));
test("rule: press and tap only on a button", () => {
  bad("press E25", /'press' is for a button/, 6);
  bad("tap E25", /'tap' is for a button/, 4);
});
test("rule: turn only on an encoder or the group E", () => bad("turn B5", /'turn' is for an encoder/, 5));
test("rule: dir only after turn", () => bad("press B5 cw", /only follows 'turn'/, 9));
test("rule: the group E only after turn", () => {
  bad("press E", /group 'E'/, 6);
  bad("hold E + press B5", /group 'E'/, 5);
});
test("rule: an unknown ID fails", () => bad("press B99", /unknown element 'B99'/, 6));
test("rule: hold X + Y with no verb fails", () => bad("hold B59 + B61", /missing verb after '\+'/, 11));
test("rule: a chord has two different IDs", () => bad("press B5 and B5 together", /two different controls/, 13));
test("rule: a sequence is one level deep", () => bad("press B5, then press B6, then press B7", /second ', then'/, 23));
test("parse: bad count and empty text give an error, not an exception", () => {
  bad("turn E25 ×0", /bad count/, 9);
  bad("", /empty action/, 0);
  bad("jump B5", /unknown verb 'jump'/, 0);
});

// Data audit: every stored action parses. midi.json holds test notes and stays out.
test("audit: every action in functions.json and modes.json parses", () => {
  const actions: string[] = data.functions.flatMap((f) => (f.action === undefined ? [] : [`functions ${f.id}: ${f.action}`]));
  for (const m of data.modes)
    for (const s of [...m.enter, ...m.exit]) actions.push(`modes ${m.id}: ${s.action}`);
  assert.equal(actions.length, 178, "140 function actions and 38 mode actions");
  const failures = actions.filter((a) => !parseAction(a.slice(a.indexOf(": ") + 2), els).ok);
  assert.deepEqual(failures, []);
});
