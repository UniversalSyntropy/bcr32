// DemoEngine (D1 section 5.2, D3 section 4): the mode logic of the panel, read from modes.json.
// Pure. No timer, no clock call, no DOM. The `t` of each event is the only clock (D69).
// Rules come from data. A mode whose action does not parse is a load error.
import type { Element, LitCondition, Mode, Timing } from "@bcr32/device-data";

import { elementIndex, parseAction, type Action, type Simple, type Target } from "./action.ts";
import type { ClockTick, ControlEvent, Engine, PanelView, RingState } from "./view.ts";

export interface DemoData {
  elements: readonly Pick<Element, "id" | "kind">[];
  modes: readonly Mode[];
  timing: Timing;
}

// Modes the data does not let us start. Each starts with `press B61` and has no `from`, so the
// data does not say which state they open from. The engine does not guess (B5 brief 5.2).
export const NOT_SIMULATED: Readonly<Record<string, string>> = {
  "memory-erase": "its enter action has no 'from' and starts with the same press as two other modes",
  "sysex-export": "its enter action has no 'from' and starts with the same press as two other modes",
  "sysex-import": "its enter action has no 'from' and starts with the same press as two other modes",
};

// One step of a trigger. Event atoms fire on an event. `hold` fires on a tick.
type Atom =
  | { k: "press"; id: string }
  | { k: "tap"; id: string } // release of a short press
  | { k: "late"; id: string } // release of a press that no other rule used (a press that waits for a combo)
  | { k: "release"; id: string }
  | { k: "hold"; id: string; ms: number }
  | { k: "turn"; id: string | null; dir?: 1 | -1 } // id null: any encoder
  | { k: "combo"; held: string; then: Atom }
  | { k: "chord"; a: string; b: string };

export interface DemoRule {
  mode: string;
  kind: "enter" | "exit";
  from?: string;
  actions: Action[];
  steps: Atom[];
  text: string;
}

export interface DemoRules {
  rules: DemoRule[]; // every rule of a simulated mode
  enters: DemoRule[];
  exits: Map<string, DemoRule[]>;
  base: string;
  modes: ReadonlyMap<string, Mode>;
  encoders: string[];
  timing: Timing;
}

export interface DemoState {
  stack: string[]; // base mode first, the open item last
  down: Record<string, number>; // held controls and their press time
  fired: string[]; // held controls that a rule used already; they fire nothing more
  seq: { rule: number; next: number; t: number } | null; // a sequence that waits for its next step
  rings: Record<string, RingState>;
}

const fail = (m: Mode, list: string, i: number, text: string, why: string): never => {
  throw new Error(`modes.json: mode '${m.id}' ${list}[${i}] '${text}': ${why}`);
};

function atomOf(s: Simple, written: string, holdMs: number): Atom {
  const id = "id" in s.target ? s.target.id : null;
  if (s.count !== undefined) throw new Error("a repeat count is not simulated");
  if (s.verb === "turn") return { k: "turn", id, ...(s.dir === undefined ? {} : { dir: s.dir === "cw" ? (1 as const) : (-1 as const) }) };
  if (id === null) throw new Error("a group target is for 'turn' only");
  if (s.verb === "push") return { k: "press", id };
  if (s.verb === "release") return { k: "release", id };
  if (s.verb === "hold") return { k: "hold", id, ms: holdMs };
  return written === "tap" ? { k: "tap", id } : { k: "press", id };
}

const idOf = (t: Target): string => {
  if (!("id" in t)) throw new Error("a group target is for 'turn' only");
  return t.id;
};

function atomsOf(a: Action, holdMs: number): Atom[] {
  switch (a.kind) {
    case "simple":
      return [atomOf(a, a.written ?? "", holdMs)];
    case "timed":
      return [{ k: "hold", id: idOf(a.target), ms: a.seconds * 1000 }];
    case "combo": {
      const then = atomOf(a.then, a.then.written ?? "", holdMs);
      if (then.k === "hold") throw new Error("'hold' after '+' is not simulated");
      return [{ k: "combo", held: idOf(a.hold), then }];
    }
    case "chord":
      return [{ k: "chord", a: idOf(a.targets[0]), b: idOf(a.targets[1]) }];
    case "sequence":
      return [...atomsOf(a.first, holdMs), ...atomsOf(a.then, holdMs)];
  }
}

const cache = new WeakMap<DemoData, DemoRules>();

// Parse every action. Throws on a bad action or on two enter rules that tie.
export function loadDemo(data: DemoData): DemoRules {
  const hit = cache.get(data);
  if (hit !== undefined) return hit;
  const els = elementIndex({ elements: data.elements as { id: string; kind: Element["kind"] }[] });
  const holdMs = data.timing.holdMs;
  const rules: DemoRule[] = [];
  const seen = new Map<string, string>();
  for (const m of data.modes) {
    const enterActions: Action[] = [];
    m.enter.forEach((step, i) => {
      const r = parseAction(step.action, els);
      if (!r.ok) return fail(m, "enter", i, step.action, `${r.error} (offset ${r.at})`);
      enterActions.push(r.action);
    });
    const text = m.enter.map((s) => s.action).join(", then ");
    const from = m.enter[0]!.from;
    // The enter list is one sequence. The parser reads one ', then' only, so each entry stays a step here.
    let steps: Atom[];
    try {
      steps = enterActions.flatMap((a) => atomsOf(a, holdMs));
    } catch (e) {
      return fail(m, "enter", 0, text, (e as Error).message);
    }
    const tie = `${from ?? ""}|${JSON.stringify(steps)}`;
    const other = seen.get(tie);
    if (other !== undefined) throw new Error(`modes.json: modes '${other}' and '${m.id}' tie: same enter action '${text}' and same 'from'`);
    seen.set(tie, m.id);
    const enter: DemoRule = { mode: m.id, kind: "enter", actions: enterActions, steps, text, ...(from === undefined ? {} : { from }) };
    const exits: DemoRule[] = [];
    m.exit.forEach((step, i) => {
      const r = parseAction(step.action, els);
      if (!r.ok) return fail(m, "exit", i, step.action, `${r.error} (offset ${r.at})`);
      try {
        exits.push({ mode: m.id, kind: "exit", actions: [r.action], steps: atomsOf(r.action, holdMs), text: step.action });
      } catch (e) {
        fail(m, "exit", i, step.action, (e as Error).message);
      }
    });
    if (NOT_SIMULATED[m.id] === undefined) rules.push(enter, ...exits);
  }
  // A press that is also the held key of a combo in the same state waits for the release (B59 in ZAQ).
  for (const r of rules) {
    const s = r.steps[0]!;
    if (r.kind === "enter" && r.steps.length === 1 && s.k === "press" && rules.some((o) => o !== r && o.kind === "enter" && o.from === r.from && o.steps[0]!.k === "combo" && (o.steps[0] as { held: string }).held === s.id))
      r.steps = [{ k: "late", id: s.id }];
  }
  const exits = new Map<string, DemoRule[]>();
  for (const r of rules) if (r.kind === "exit") exits.set(r.mode, [...(exits.get(r.mode) ?? []), r]);
  const modes = new Map(data.modes.map((m) => [m.id, m]));
  const base = data.modes.find((m) => m.kind === "mode")?.id;
  if (base === undefined) throw new Error("modes.json: no mode of kind 'mode'");
  const out: DemoRules = {
    rules,
    enters: rules.filter((r) => r.kind === "enter"),
    exits,
    base,
    modes,
    encoders: data.elements.filter((e) => e.kind === "encoder").map((e) => e.id),
    timing: data.timing,
  };
  cache.set(data, out);
  return out;
}

const UNKNOWN_RING: RingState = { style: "unknown", encMode: "unknown", value: null, min: 0, max: 127, known: false, source: "local" };

export function initialDemo(data: DemoData, initial?: Partial<PanelView>): DemoState {
  const rules = loadDemo(data);
  const rings: Record<string, RingState> = {};
  for (const id of rules.encoders) rings[id] = initial?.rings?.[id] ?? UNKNOWN_RING;
  const start = initial?.mode;
  const base = start !== undefined && rules.modes.get(start)?.kind === "mode" ? start : rules.base;
  return { stack: [base], down: {}, fired: [], seq: null, rings };
}

// Does the atom match this input? Event atoms match events. `hold` matches a tick.
function hits(a: Atom, e: ControlEvent | ClockTick, st: DemoState, r: DemoRules): boolean {
  const down = (id: string) => st.down[id] !== undefined;
  const unused = (id: string) => !st.fired.includes(id);
  if (e.type === "tick") return a.k === "hold" && down(a.id) && unused(a.id) && e.t - st.down[a.id]! >= a.ms;
  switch (a.k) {
    case "press":
      return e.type === "press" && e.id === a.id;
    case "release":
      return e.type === "release" && e.id === a.id;
    case "tap":
      return e.type === "release" && e.id === a.id && down(a.id) && unused(a.id) && e.t - st.down[a.id]! < r.timing.holdMs;
    case "late":
      return e.type === "release" && e.id === a.id && unused(a.id);
    case "turn":
      return e.type === "turn" && (a.id === null ? r.encoders.includes(e.id) : e.id === a.id) && (a.dir === undefined || Math.sign(e.steps) === a.dir);
    case "combo":
      return e.id !== a.held && down(a.held) && hits(a.then, e, st, r);
    case "chord":
      return e.type === "press" && ((e.id === a.a && down(a.b)) || (e.id === a.b && down(a.a)));
    case "hold":
      return false;
  }
}

// Controls that the firing step used. They fire nothing more until released.
function used(a: Atom, e: ControlEvent | ClockTick): string[] {
  switch (a.k) {
    case "press":
    case "tap":
    case "late":
    case "hold":
      return [a.id];
    case "combo":
      return [a.held, ...(e.type === "press" ? [e.id] : [])];
    case "chord":
      return [a.a, a.b];
    default:
      return [];
  }
}

// Order (D1 5.2): exits of the top, then enters that name the top in `from`, then enters with no `from`.
// An enter of a mode that is open already is skipped.
function candidates(st: DemoState, r: DemoRules): DemoRule[] {
  const top = st.stack[st.stack.length - 1]!;
  const exits = st.stack.length > 1 ? (r.exits.get(top) ?? []) : []; // the base mode has no exit
  const open = (x: DemoRule) => !st.stack.includes(x.mode);
  return [...exits, ...r.enters.filter((x) => x.from === top && open(x)), ...r.enters.filter((x) => x.from === undefined && open(x))];
}

function turnRing(st: DemoState, id: string, steps: number): DemoState {
  const ring = st.rings[id];
  if (ring === undefined || !ring.known || ring.value === null) return st; // never invent a value
  const value = Math.min(Math.max(ring.value + steps, Math.min(ring.min, ring.max)), Math.max(ring.min, ring.max));
  return value === ring.value ? st : { ...st, rings: { ...st.rings, [id]: { ...ring, value } } };
}

export function reduceDemo(state: DemoState, e: ControlEvent | ClockTick, data: DemoData): DemoState {
  const r = loadDemo(data);
  let st = state;
  if (e.type === "press") {
    if (st.down[e.id] !== undefined) return st;
    st = { ...st, down: { ...st.down, [e.id]: e.t }, fired: st.fired.filter((x) => x !== e.id) };
  } else if (e.type === "turn") st = turnRing(st, e.id, e.steps);

  // Find the first rule whose next step this input completes.
  let seq = st.seq;
  const list = candidates(st, r);
  let done: { rule: DemoRule; atom: Atom } | null = null;
  for (const rule of list) {
    const index = r.rules.indexOf(rule);
    const live = seq !== null && seq.rule === index && e.t - seq.t <= r.timing.sequenceMs;
    const at = live ? seq!.next : 0;
    const atom = rule.steps[at]!;
    if (!hits(atom, e, st, r)) continue;
    if (at + 1 < rule.steps.length) seq = { rule: index, next: at + 1, t: e.t };
    else {
      done = { rule, atom };
      break;
    }
  }
  if (seq !== st.seq && done === null) st = { ...st, seq };

  if (done !== null) {
    const { rule, atom } = done;
    const isBase = rule.kind === "enter" && r.modes.get(rule.mode)!.kind === "mode" && st.stack.length === 1;
    const stack = rule.kind === "exit" ? st.stack.slice(0, -1) : isBase ? [rule.mode] : [...st.stack, rule.mode];
    const mark = used(atom, e).filter((id) => st.down[id] !== undefined && !st.fired.includes(id));
    st = { ...st, stack, seq: null, fired: [...st.fired, ...mark] };
  }

  if (e.type === "release" && st.down[e.id] !== undefined) {
    const down = Object.fromEntries(Object.entries(st.down).filter(([id]) => id !== e.id));
    st = { ...st, down, fired: st.fired.filter((x) => x !== e.id) };
  }
  return st;
}

// Lit rules of the stack, bottom first, so the top overrides. A rule with no `cond` is unknown.
export function viewOf(st: DemoState, data: DemoData): PanelView {
  const r = loadDemo(data);
  const buttons: PanelView["buttons"] = {};
  const unknown = new Set<string>();
  for (const id of st.stack) {
    for (const lit of r.modes.get(id)!.lit) {
      const cond: LitCondition | undefined = lit.cond;
      for (const el of lit.elements) {
        if (cond === "always" || (cond === "held" && st.down[el] !== undefined)) {
          buttons[el] = { colour: lit.colour, blink: lit.blink === true ? "slow" : "none" };
          unknown.delete(el);
        } else if (cond === "held") continue; // known: this button is not held, the rule lights nothing
        else {
          delete buttons[el]; // the condition needs state the demo does not have
          unknown.add(el);
        }
      }
    }
  }
  return {
    mode: st.stack[st.stack.length - 1]!,
    buttons,
    rings: st.rings,
    leds: {},
    display: { lines: [], known: false },
    pressed: Object.keys(st.down),
    unknownLit: [...unknown],
  };
}

export function demoEngine(data: DemoData, initial?: Partial<PanelView>): Engine {
  loadDemo(data); // a bad action fails here
  let state = initialDemo(data, initial);
  let view = viewOf(state, data);
  const listeners = new Set<() => void>();
  return {
    dispatch(e) {
      const next = reduceDemo(state, e, data);
      if (next === state) return;
      state = next;
      view = viewOf(state, data);
      for (const fn of [...listeners]) fn();
    },
    getView: () => view,
    subscribe(fn) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
  };
}

// Events that replay one rule, from time t0. Short holds stay below holdMs; a hold waits for its time.
export function eventsOf(rule: DemoRule, data: DemoData, t0: number): (ControlEvent | ClockTick)[] {
  const r = loadDemo(data);
  const short = Math.max(1, Math.floor(r.timing.holdMs / 2));
  const enc = r.encoders[0]!;
  const out: (ControlEvent | ClockTick)[] = [];
  let t = t0;
  const go = (a: Action): void => {
    if (a.kind === "sequence") {
      go(a.first);
      t += 10;
      go(a.then);
    } else if (a.kind === "timed") {
      const id = idOf(a.target);
      out.push({ type: "press", id, t }, { type: "tick", t: t + a.seconds * 1000 }, { type: "release", id, t: t + a.seconds * 1000 + 1 });
      t += a.seconds * 1000 + 1;
    } else if (a.kind === "chord") {
      const [x, y] = [idOf(a.targets[0]), idOf(a.targets[1])];
      out.push({ type: "press", id: x, t }, { type: "press", id: y, t: t + 1 }, { type: "release", id: y, t: t + 2 }, { type: "release", id: x, t: t + 3 });
      t += 3;
    } else if (a.kind === "combo") {
      const held = idOf(a.hold);
      out.push({ type: "press", id: held, t });
      t += 1;
      simple(a.then);
      out.push({ type: "release", id: held, t: t + 1 });
      t += 1;
    } else simple(a);
  };
  const simple = (s: Simple): void => {
    const id = "id" in s.target ? s.target.id : enc;
    if (s.verb === "turn") out.push({ type: "turn", id, steps: s.dir === "ccw" ? -1 : 1, t });
    else if (s.verb === "hold") out.push({ type: "press", id, t }, { type: "tick", t: t + r.timing.holdMs }, { type: "release", id, t: t + r.timing.holdMs + 1 }), (t += r.timing.holdMs + 1);
    else if (s.written === "tap" || s.verb === "release") out.push({ type: "press", id, t }, { type: "release", id, t: t + short }), (t += short);
    else out.push({ type: "press", id, t }, { type: "release", id, t: t + 1 }), (t += 1);
  };
  const actions = rule.actions;
  actions.forEach((a, i) => {
    if (i > 0) t += 10;
    go(a);
  });
  return out;
}

const GAP_MS = 3000; // more than sequenceMs, so a step never joins the step before it

// Shortest event list that opens `mode` from the base. A breadth-first search over the data's own rules.
export function pathTo(mode: string, data: DemoData, initial?: Partial<PanelView>): (ControlEvent | ClockTick)[] | undefined {
  const r = loadDemo(data);
  const start = initialDemo(data, initial);
  const key = (s: DemoState) => s.stack.join("/");
  const seen = new Set([key(start)]);
  let queue: { st: DemoState; events: (ControlEvent | ClockTick)[]; t: number }[] = [{ st: start, events: [], t: 0 }];
  while (queue.length > 0) {
    const next: typeof queue = [];
    for (const q of queue) {
      if (q.st.stack[q.st.stack.length - 1] === mode) return q.events;
      for (const rule of r.enters) {
        const top = q.st.stack[q.st.stack.length - 1]!;
        if (rule.from !== undefined && rule.from !== top) continue;
        const evs = eventsOf(rule, data, q.t + GAP_MS);
        const st = evs.reduce((s, e) => reduceDemo(s, e, data), q.st);
        if (seen.has(key(st))) continue;
        seen.add(key(st));
        next.push({ st, events: [...q.events, ...evs], t: evs[evs.length - 1]!.t });
      }
    }
    queue = next;
  }
  return undefined;
}
