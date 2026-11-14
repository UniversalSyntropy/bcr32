// Action parser (D3 section 4). One parser for the data files and the guides.
// Bad input never throws: parseAction returns { ok: false, error, at }.
import type { Element } from "@bcr32/device-data";

type ElementKind = Element["kind"];

export type ElementIndex = ReadonlyMap<string, ElementKind>;
export type Verb = "press" | "tap" | "push" | "turn" | "hold" | "release";
export type Target = { id: string } | { group: "E" };
export type Simple = {
  kind: "simple";
  verb: Exclude<Verb, "tap">; // "tap" parses to "press"
  target: Target;
  dir?: "cw" | "ccw";
  count?: number;
  written?: "tap";
};
export type Action =
  | Simple
  | { kind: "timed"; target: Target; seconds: number }
  | { kind: "combo"; hold: Target; then: Simple }
  | { kind: "chord"; targets: [Target, Target] }
  | { kind: "sequence"; first: Action; then: Action };
export type ParseResult = { ok: true; action: Action } | { ok: false; error: string; at: number };

export function elementIndex(data: { elements: readonly { id: string; kind: ElementKind }[] }): ElementIndex {
  return new Map(data.elements.map((e) => [e.id, e.kind]));
}

const VERBS = new Set<string>(["press", "tap", "push", "turn", "hold", "release"]);
const THEN = /,\s*then\s+/g;

interface Tok {
  text: string;
  at: number;
}

class Fail extends Error {
  at: number;
  constructor(message: string, at: number) {
    super(message);
    this.at = at;
  }
}

export function parseAction(text: string, els: ElementIndex): ParseResult {
  try {
    return { ok: true, action: parseTop(text, els) };
  } catch (e) {
    if (e instanceof Fail) return { ok: false, error: e.message, at: e.at };
    throw e;
  }
}

function parseTop(text: string, els: ElementIndex): Action {
  const cuts = [...text.matchAll(THEN)];
  if (cuts.length === 0) return parsePart(text, 0, els);
  if (cuts.length > 1) throw new Fail("a sequence has two actions only; found a second ', then'", cuts[1]!.index);
  const cut = cuts[0]!;
  const first = parsePart(text.slice(0, cut.index), 0, els);
  const then = parsePart(text.slice(cut.index + cut[0].length), cut.index + cut[0].length, els);
  return { kind: "sequence", first, then };
}

function tokens(text: string, base: number): Tok[] {
  return [...text.matchAll(/\S+/g)].map((m) => ({ text: m[0], at: base + m.index }));
}

function parsePart(text: string, base: number, els: ElementIndex): Action {
  const t = tokens(text, base);
  if (t.length === 0) throw new Fail("empty action", base);
  const head = t[0]!;

  if (!VERBS.has(head.text)) {
    const secs = t[1] === undefined ? null : /^×(\d+(?:\.\d+)?)s$/.exec(t[1].text);
    if (secs === null || t.length > 2) throw new Fail(`unknown verb '${head.text}'`, head.at);
    return { kind: "timed", target: target(head, els, false), seconds: Number(secs[1]) };
  }

  if (head.text === "hold" && t.some((x) => x.text === "+")) return parseCombo(t, els);
  if (head.text === "press" && t.some((x) => x.text === "and")) return parseChord(t, els);
  return parseSimple(t, 0, els);
}

function parseCombo(t: Tok[], els: ElementIndex): Action {
  const plus = t.findIndex((x) => x.text === "+");
  if (plus !== 2) throw new Fail("'hold' takes one control before '+'", (t[plus] ?? t[0]!).at);
  const hold = target(t[1]!, els, false);
  const next = t[plus + 1];
  if (next === undefined) throw new Fail("missing action after '+'", t[plus]!.at + 1);
  if (!VERBS.has(next.text)) throw new Fail(`missing verb after '+', got '${next.text}'`, next.at);
  return { kind: "combo", hold, then: parseSimple(t, plus + 1, els) };
}

function parseChord(t: Tok[], els: ElementIndex): Action {
  const [, a, and, b, together, extra] = t;
  if (a === undefined || and?.text !== "and" || b === undefined) throw new Fail("a chord reads 'press X and Y together'", (and ?? t[0]!).at);
  if (together?.text !== "together") throw new Fail("a chord ends with 'together'", (together ?? b).at + (together === undefined ? b.text.length : 0));
  if (extra !== undefined) throw new Fail(`unexpected '${extra.text}'`, extra.at);
  const x = target(a, els, false);
  const y = target(b, els, false);
  if (a.text === b.text) throw new Fail(`a chord needs two different controls, got '${a.text}' twice`, b.at);
  return { kind: "chord", targets: [x, y] };
}

function parseSimple(t: Tok[], i: number, els: ElementIndex): Simple {
  const verbTok = t[i]!;
  const written = verbTok.text as Verb;
  const verb = written === "tap" ? "press" : written;
  const idTok = t[i + 1];
  if (idTok === undefined) throw new Fail(`'${written}' needs a control`, verbTok.at + written.length);
  const tg = target(idTok, els, verb === "turn");
  const kind = "id" in tg ? els.get(tg.id) : "encoder";
  if (verb === "push" && kind !== "encoder") throw new Fail(`'push' is for an encoder, '${idTok.text}' is a ${kind}`, idTok.at);
  if (verb === "press" && kind !== "button") throw new Fail(`'${written}' is for a button, '${idTok.text}' is a ${kind}`, idTok.at);
  if (verb === "turn" && kind !== "encoder") throw new Fail(`'turn' is for an encoder, '${idTok.text}' is a ${kind}`, idTok.at);
  const out: Simple = { kind: "simple", verb, target: tg };
  if (written === "tap") out.written = "tap";
  let j = i + 2;
  const dirTok = t[j];
  if (dirTok !== undefined && (dirTok.text === "cw" || dirTok.text === "ccw")) {
    if (verb !== "turn") throw new Fail(`'${dirTok.text}' only follows 'turn'`, dirTok.at);
    out.dir = dirTok.text;
    j++;
  }
  const countTok = t[j];
  if (countTok !== undefined && /^×/.test(countTok.text)) {
    const m = /^×(\d+)$/.exec(countTok.text);
    if (m === null || Number(m[1]) < 1) throw new Fail(`bad count '${countTok.text}'; use × and a positive integer`, countTok.at);
    out.count = Number(m[1]);
    j++;
  }
  if (t[j] !== undefined) throw new Fail(`unexpected '${t[j]!.text}'`, t[j]!.at);
  return out;
}

// The group E is valid only after 'turn', also as the 'then' part of a combo.
function target(tok: Tok, els: ElementIndex, groupOk: boolean): Target {
  if (tok.text === "E") {
    if (groupOk) return { group: "E" };
    throw new Fail("the group 'E' only follows 'turn'", tok.at);
  }
  if (!els.has(tok.text)) throw new Fail(`unknown element '${tok.text}'`, tok.at);
  return { id: tok.text };
}
