// GuideEngine (B6 brief 5.1, D3 sections 4 and 6): plays one guide on top of an inner engine. Pure.
// No timer, no clock call, no DOM. The `t` of each event is the only clock (D69).
// The state is a plain value. The same event list gives the same steps and the same views.
import type { Element, GuideFile, Timing } from "@bcr32/device-data";

import { elementIndex, parseAction, type Action, type Simple } from "./action.ts";
import { foldPatches, patchLeaves, valueAt } from "./guide-patch.ts";
import type { ClockTick, ControlEvent, Engine, PanelView } from "./view.ts";

type Evt = ControlEvent | ClockTick;
type Step = GuideFile["steps"][number];

export interface GuideData {
  elements: readonly Pick<Element, "id" | "kind">[];
  timing: Pick<Timing, "holdMs">;
}

// One field where the inner engine view differs from the `after` patch, or a check that the engine cannot make.
export interface GuideGap {
  guide: string;
  step: string;
  field: string;
  engine: unknown;
  patch: unknown;
}

export interface GuideStepState {
  index: number;
  id: string;
  phase: "cue" | "result" | "done";
  hint?: "wrong-control" | "wrong-direction" | "hold-longer";
  held: readonly string[];
}

export interface GuideEngine extends Engine {
  getStep(): GuideStepState;
  next(): void; // "Show me" in the cue phase; Next in the result phase
  back(): void; // rebuilds from the start
  restart(): void;
  getLog(): GuideGap[];
}

interface Parsed {
  step: Step;
  action: Action | undefined;
  involved: ReadonlySet<string>;
}

export interface GuideState {
  index: number;
  phase: "cue" | "result" | "done";
  hint?: GuideStepState["hint"];
  held: readonly string[];
  events: readonly Evt[]; // since the step began
  history: readonly (readonly Evt[])[]; // events of each finished step, for a rebuild
  log: readonly GuideGap[];
  t: number;
}

export interface GuideCtx {
  guide: GuideFile;
  steps: readonly Parsed[];
  holdMs: number;
  view: PanelView; // inner engine view after the event
}

export const initialGuide = (): GuideState => ({ index: 0, phase: "cue", held: [], events: [], history: [], log: [], t: 0 });

const idOf = (t: { id: string } | { group: "E" }): string => ("id" in t ? t.id : "E");

function involvedOf(a: Action): string[] {
  switch (a.kind) {
    case "simple":
    case "timed":
      return [idOf(a.target)];
    case "combo":
      return [idOf(a.hold), idOf(a.then.target)];
    case "chord":
      return a.targets.map(idOf);
    case "sequence":
      return [...involvedOf(a.first), ...involvedOf(a.then)];
  }
}

// Parse every step action. A guide step takes no sequence and no group.
export function parseSteps(guide: GuideFile, data: GuideData): Parsed[] {
  const els = elementIndex({ elements: data.elements as { id: string; kind: Element["kind"] }[] });
  return guide.steps.map((step) => {
    if (step.action === undefined) return { step, action: undefined, involved: new Set<string>() };
    const r = parseAction(step.action, els);
    if (!r.ok) throw new Error(`guide '${guide.id}', step '${step.id}': action '${step.action}': ${r.error} (offset ${r.at})`);
    if (r.action.kind === "sequence") throw new Error(`guide '${guide.id}', step '${step.id}': a guide step takes no sequence`);
    const involved = involvedOf(r.action);
    if (involved.includes("E")) throw new Error(`guide '${guide.id}', step '${step.id}': a guide step names one control, not a group`);
    return { step, action: r.action, involved: new Set(involved) };
  });
}

const sign = (n: number) => (n < 0 ? -1 : 1);

interface TurnTarget {
  value?: number;
  steps?: number;
}
const targetOf = (p: Parsed, id: string): (TurnTarget & { valueText?: string }) | undefined => {
  const t = p.step.target?.[id];
  return typeof t === "object" && t !== null ? (t as TurnTarget) : undefined;
};

// Does the event list complete the action? `seed`: controls that stay down from the step before.
function matches(p: Parsed, events: readonly Evt[], seed: readonly string[], ctx: GuideCtx): boolean {
  const a = p.action;
  if (a === undefined || a.kind === "sequence") return false;
  const down = new Map<string, number>(seed.map((id) => [id, Number.NEGATIVE_INFINITY]));
  let turned = 0;
  const heldFor = (id: string, t: number, ms: number) => {
    const t0 = down.get(id);
    return t0 !== undefined && Number.isFinite(t0) && t - t0 >= ms;
  };
  const turnNeed = (s: Simple) => targetOf(p, idOf(s.target))?.steps ?? s.count ?? 1;
  const turnHit = (s: Simple, e: Evt): boolean => {
    if (e.type !== "turn" || e.id !== idOf(s.target)) return false;
    if (s.dir !== undefined && sign(e.steps) !== (s.dir === "cw" ? 1 : -1)) return false;
    turned += Math.abs(e.steps);
    if (turned < turnNeed(s)) return false;
    const want = targetOf(p, e.id)?.value;
    const ring = ctx.view.rings[e.id];
    return typeof want !== "number" || ring === undefined || !ring.known || ring.value === null || ring.value === want;
  };
  const simpleHit = (s: Simple, e: Evt): boolean => {
    const id = idOf(s.target);
    switch (s.verb) {
      case "press":
      case "push":
        return e.type === "press" && e.id === id;
      case "release":
        return e.type === "release" && e.id === id;
      case "hold":
        return heldFor(id, e.t, ctx.holdMs);
      case "turn":
        return turnHit(s, e);
    }
  };
  for (const e of events) {
    let hit = false;
    if (a.kind === "simple") hit = simpleHit(a, e);
    else if (a.kind === "timed") hit = heldFor(idOf(a.target), e.t, a.seconds * 1000);
    else if (a.kind === "combo") {
      const hold = idOf(a.hold);
      hit = down.has(hold) && simpleHit(a.then, e);
    } else {
      const [x, y] = [idOf(a.targets[0]), idOf(a.targets[1])];
      hit = e.type === "press" && ((e.id === x && down.has(y)) || (e.id === y && down.has(x)));
    }
    if (e.type === "press" && !down.has(e.id)) down.set(e.id, e.t);
    else if (e.type === "release") down.delete(e.id);
    if (hit) return true;
  }
  return false;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// The fields of the `after` patch where the inner view differs, and the turn targets that cannot be checked.
function gapsOf(p: Parsed, ctx: GuideCtx): GuideGap[] {
  const out: GuideGap[] = [];
  const at = (field: string, engine: unknown, patch: unknown) => out.push({ guide: ctx.guide.id, step: p.step.id, field, engine, patch });
  for (const { path, value } of patchLeaves(p.step.after)) {
    const engine = valueAt(ctx.view, path);
    if (value === null && engine === undefined) continue;
    if (!same(engine, value)) at(path, engine, value);
  }
  const a = p.action;
  if (a !== undefined && a.kind === "simple" && a.verb === "turn") {
    const id = idOf(a.target);
    const t = targetOf(p, id);
    const ring = ctx.view.rings[id];
    if (t !== undefined && !(typeof t.value === "number" && ring !== undefined && ring.known && ring.value !== null)) at(`target.${id}`, "no target check", t);
  }
  return out;
}

function complete(state: GuideState, ctx: GuideCtx): GuideState {
  const p = ctx.steps[state.index]!;
  const history = [...state.history];
  history[state.index] = state.events;
  return { ...state, phase: "result", hint: undefined, held: p.step.held ?? [], events: [], history, log: [...state.log, ...gapsOf(p, ctx)] };
}

function advance(state: GuideState, ctx: GuideCtx): GuideState {
  if (state.index + 1 < ctx.steps.length) return { ...state, index: state.index + 1, phase: "cue", hint: undefined, events: [] };
  return { ...state, phase: "done", hint: undefined, events: [] };
}

// An event that does not end the result phase. The inner engine got it, so a rebuild must replay it.
// The inner view moves on (a key release opens a page), so the gaps of the step are read again.
function stay(st: GuideState, e: Evt, ctx: GuideCtx): GuideState {
  const history = [...st.history];
  history[st.index] = [...(history[st.index] ?? []), e];
  const p = ctx.steps[st.index]!;
  const log = isInput(e) ? st.log : [...st.log.filter((g) => g.step !== p.step.id), ...gapsOf(p, ctx)];
  return { ...st, history, log };
}

const isInput = (e: Evt): e is ControlEvent & { type: "press" | "turn" } => e.type === "press" || e.type === "turn";

// The pure step. `ctx.view` is the inner view after the event.
export function reduceGuide(state: GuideState, e: Evt, ctx: GuideCtx): GuideState {
  let st: GuideState = { ...state, t: e.t };
  if (st.phase === "done") return st;
  if (st.phase === "result") {
    // The user goes on: an input for the next step ends the result phase and counts for that step.
    const next = ctx.steps[st.index + 1];
    if (next === undefined || next.action === undefined || next.step.advance !== "on-action" || !isInput(e) || !(next.involved.has(e.id) || st.held.includes(e.id))) return stay(st, e, ctx);
    st = advance(st, ctx);
  }
  const p = ctx.steps[st.index]!;
  if (p.action === undefined || p.step.advance !== "on-action") return st;
  const events = [...st.events, e];
  let hint = st.hint;
  const a = p.action;
  if (isInput(e)) {
    hint = undefined;
    if (!p.involved.has(e.id) && !st.held.includes(e.id)) hint = "wrong-control";
    else if (e.type === "turn" && a.kind === "simple" && a.dir !== undefined && e.id === idOf(a.target) && sign(e.steps) !== (a.dir === "cw" ? 1 : -1)) hint = "wrong-direction";
  } else if (e.type === "release" && ((a.kind === "simple" && a.verb === "hold") || a.kind === "timed") && e.id === idOf(a.target)) hint = "hold-longer";
  st = { ...st, events, hint };
  if (matches(p, events, st.held, ctx)) return complete(st, ctx);
  return st;
}

// Events that make the action true, from time t0. `seed`: controls down already. `keep`: controls that stay down.
export function eventsForAction(a: Action, seed: readonly string[], keep: readonly string[], t0: number, holdMs: number): Evt[] {
  const out: Evt[] = [];
  let t = t0;
  const up = (id: string) => {
    if (!keep.includes(id)) out.push({ type: "release", id, t: t + 1 });
    t += 1;
  };
  const simple = (s: Simple, hold: boolean): void => {
    const id = idOf(s.target);
    if (s.verb === "turn") {
      out.push({ type: "turn", id, steps: (s.dir === "ccw" ? -1 : 1) * (s.count ?? 1), t });
    } else if (s.verb === "release") out.push({ type: "release", id, t });
    else if (s.verb === "hold") {
      out.push({ type: "press", id, t }, { type: "tick", t: t + holdMs });
      t += holdMs;
      up(id);
    } else {
      out.push({ type: "press", id, t });
      t += 1;
      if (!hold) up(id);
    }
  };
  if (a.kind === "simple") simple(a, false);
  else if (a.kind === "timed") {
    const id = idOf(a.target);
    out.push({ type: "press", id, t }, { type: "tick", t: t + a.seconds * 1000 });
    t += a.seconds * 1000;
    up(id);
  } else if (a.kind === "combo") {
    const hold = idOf(a.hold);
    if (!seed.includes(hold)) out.push({ type: "press", id: hold, t });
    t += 1;
    simple(a.then, true);
    if (a.then.verb !== "turn") up(idOf(a.then.target));
    t += 1;
    up(hold);
  } else if (a.kind === "chord") {
    const [x, y] = [idOf(a.targets[0]), idOf(a.targets[1])];
    out.push({ type: "press", id: x, t }, { type: "press", id: y, t: t + 1 });
    t += 2;
    up(y);
    up(x);
  }
  return out;
}

export function guideEngine(guide: GuideFile, inner: Engine | (() => Engine), data: GuideData): GuideEngine {
  const steps = parseSteps(guide, data);
  const holdMs = data.timing.holdMs;
  const factory = typeof inner === "function" ? inner : undefined;
  let engine: Engine = typeof inner === "function" ? inner() : inner;
  let state = initialGuide();
  const listeners = new Set<() => void>();
  const startPatch = { mode: guide.start.mode, ...guide.start.view };
  const patches = [startPatch, ...guide.steps.map((s) => s.after ?? {})];
  const ctx = (): GuideCtx => ({ guide, steps, holdMs, view: engine.getView() });
  const emit = () => {
    for (const fn of [...listeners]) fn();
  };

  let cache: { view: PanelView; applied: number; held: string; out: PanelView } | undefined;
  const applied = () => (state.phase === "cue" ? state.index : state.index + 1);

  const feed = (e: Evt): void => {
    engine.dispatch(e);
    state = reduceGuide(state, e, ctx());
  };

  // Rebuild the state at the cue of step `target`. The fold never subtracts. A factory gives a fresh inner engine. A plain Engine cannot be reset: the guide state and the fold rebuild, but the inner view keeps its later events. Pass a factory when back() must reset the panel.
  const rebuild = (target: number): void => {
    const history = state.history.slice(0, target);
    if (factory !== undefined) {
      engine = factory();
      for (const evs of history) for (const e of evs ?? []) engine.dispatch(e);
    }
    const prev = steps[target - 1];
    const dropped = new Set(guide.steps.slice(target).map((s) => s.id));
    state = { ...initialGuide(), index: target, history, held: prev?.step.held ?? [], log: state.log.filter((g) => !dropped.has(g.step)), t: state.t };
  };

  return {
    dispatch(e) {
      feed(e);
      emit();
    },
    getView() {
      const base = engine.getView();
      const n = applied();
      const held = state.held.join(",");
      if (cache !== undefined && cache.view === base && cache.applied === n && cache.held === held) return cache.out;
      const folded = foldPatches(base, patches.slice(0, n + 1));
      const out: PanelView = { ...folded, pressed: [...new Set([...base.pressed, ...state.held])] };
      cache = { view: base, applied: n, held, out };
      return out;
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
    getStep() {
      return { index: state.index, id: steps[state.index]!.step.id, phase: state.phase, ...(state.hint === undefined ? {} : { hint: state.hint }), held: state.held };
    },
    next() {
      if (state.phase === "done") return;
      if (state.phase === "result") state = advance(state, ctx());
      else {
        const p = steps[state.index]!;
        if (p.action !== undefined && p.step.advance === "on-action") {
          for (const e of eventsForAction(p.action, state.held, p.step.held ?? [], state.t + 10, holdMs)) feed(e);
        }
        if (state.phase === "cue") state = complete(state, ctx());
        if (p.action === undefined || p.step.advance === "manual") if (p.step.expect === undefined && state.phase === "result") state = advance(state, ctx());
      }
      emit();
    },
    back() {
      rebuild(state.phase === "cue" ? Math.max(0, state.index - 1) : state.index);
      emit();
    },
    restart() {
      state = { ...state, history: [], log: [] };
      rebuild(0);
      emit();
    },
    getLog: () => [...state.log],
  };
}
