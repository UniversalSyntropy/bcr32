import assert from "node:assert/strict";
import { test } from "node:test";

import { expandTokens, legendOf, strayBraces, tokensOf, withoutTokens } from "./guide-text.ts";

const els = [
  { id: "B59", labels: [{ text: "EDIT", placement: "on" as const }, { text: "GLOBAL", placement: "below" as const }] },
  { id: "E26", panelNumber: 2, labels: [{ text: "CLOCK INT/EXT", placement: "below" as const }, { text: "2", placement: "above" as const }] },
  { id: "B99", labels: [] },
];

test("legend: panel number, then the label on or below the control", () => {
  assert.equal(legendOf(els[0]!), "EDIT");
  assert.equal(legendOf(els[1]!), "2 CLOCK INT/EXT");
  assert.equal(legendOf(els[2]!), "");
});

test("tokens expand to legend and ID", () => {
  assert.equal(expandTokens("Hold {B59} and turn {E26}.", els), "Hold EDIT (B59) and turn 2 CLOCK INT/EXT (E26).");
});

test("a token with no legend gives the ID; an unknown ID stays as the ID", () => {
  assert.equal(expandTokens("Press {B99} or {B77}.", els), "Press B99 or B77.");
});

test("token list and token cut", () => {
  assert.deepEqual(tokensOf("Hold {B59} and turn {E26}."), ["B59", "E26"]);
  assert.equal(withoutTokens("Hold {B59} now.", "X"), "Hold X now.");
});

test("stray braces are reported", () => {
  assert.deepEqual(strayBraces("Press {b59} and {B59."), ["{b59}", "{B59."]);
  assert.deepEqual(strayBraces("Press B59} now {}"), ["B59}", "{}"]);
  assert.deepEqual(strayBraces("Press {B59}."), []);
});
