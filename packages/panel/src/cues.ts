// Cue marks of a guide step, derived from the action. Pure; no DOM, no React.
import type { Action, Simple, Target } from "@bcr32/device-model";

export type Cue =
  | { kind: "press"; id: string }
  | { kind: "push"; id: string }
  | { kind: "hold"; id: string; seconds?: number }
  | { kind: "turn"; id: string; dir: "cw" | "ccw"; count: number };

const idOf = (t: Target) => ("id" in t ? t.id : "");

function simpleCue(s: Simple): Cue[] {
  const id = idOf(s.target);
  if (id === "") return [];
  switch (s.verb) {
    case "turn":
      return [{ kind: "turn", id, dir: s.dir ?? "cw", count: s.count ?? 1 }];
    case "hold":
      return [{ kind: "hold", id }];
    case "push":
      return [{ kind: "push", id }];
    case "release":
      return [];
    default:
      return [{ kind: "press", id }];
  }
}

// The cue marks of an action. `holdMs`: the hold time of the data, shown as seconds on a hold mark.
export function cuesOf(a: Action | undefined, holdMs: number): Cue[] {
  if (a === undefined) return [];
  const withTime = (c: Cue): Cue => (c.kind === "hold" && c.seconds === undefined ? { ...c, seconds: holdMs / 1000 } : c);
  switch (a.kind) {
    case "simple":
      return simpleCue(a).map(withTime);
    case "timed":
      return [{ kind: "hold", id: idOf(a.target), seconds: a.seconds }];
    case "combo":
      return [withTime({ kind: "hold", id: idOf(a.hold) }), ...simpleCue(a.then)];
    case "chord":
      return a.targets.map((t) => ({ kind: "press" as const, id: idOf(t) }));
    case "sequence":
      return [...cuesOf(a.first, holdMs), ...cuesOf(a.then, holdMs)];
  }
}
