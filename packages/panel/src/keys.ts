// The key map of the access layer as data and pure functions. One table.
export type Target = "any" | "knob" | "button" | "push";
export type Effect =
  | { type: "move"; move: "left" | "right" | "up" | "down" | "first" | "last" }
  | { type: "turn"; steps: number }
  | { type: "press" }
  | { type: "push" };

export interface KeyRow {
  key: string;
  ctrl: boolean;
  shift: boolean;
  on: Target;
  effect: Effect;
}

// Detents for Page Up and Page Down.
export const PAGE_STEPS = 8;

// "push" is a knob or SELECT with a push switch. Enter on it presses then releases the push.
export const KEY_MAP: readonly KeyRow[] = [
  { key: "ArrowLeft", ctrl: false, shift: false, on: "any", effect: { type: "move", move: "left" } },
  { key: "ArrowRight", ctrl: false, shift: false, on: "any", effect: { type: "move", move: "right" } },
  { key: "Home", ctrl: false, shift: false, on: "any", effect: { type: "move", move: "first" } },
  { key: "End", ctrl: false, shift: false, on: "any", effect: { type: "move", move: "last" } },
  { key: "ArrowUp", ctrl: false, shift: false, on: "knob", effect: { type: "move", move: "up" } },
  { key: "ArrowDown", ctrl: false, shift: false, on: "knob", effect: { type: "move", move: "down" } },
  { key: "ArrowUp", ctrl: false, shift: true, on: "knob", effect: { type: "turn", steps: 1 } },
  { key: "ArrowDown", ctrl: false, shift: true, on: "knob", effect: { type: "turn", steps: -1 } },
  { key: "+", ctrl: false, shift: false, on: "knob", effect: { type: "turn", steps: 1 } },
  { key: "-", ctrl: false, shift: false, on: "knob", effect: { type: "turn", steps: -1 } },
  { key: "PageUp", ctrl: false, shift: false, on: "knob", effect: { type: "turn", steps: PAGE_STEPS } },
  { key: "PageDown", ctrl: false, shift: false, on: "knob", effect: { type: "turn", steps: -PAGE_STEPS } },
  { key: "Enter", ctrl: false, shift: false, on: "push", effect: { type: "push" } },
  { key: "Enter", ctrl: false, shift: false, on: "button", effect: { type: "press" } },
  { key: " ", ctrl: false, shift: false, on: "button", effect: { type: "press" } },
];

export type ControlKind = "knob" | "button";

// Which table rows apply to a control: "any" always; "push" only for a knob with a push switch.
export function keyEffect(kind: ControlKind, push: boolean, key: string, ctrl: boolean, shift = false): Effect | undefined {
  return KEY_MAP.find(
    (r) => r.key === key && r.ctrl === ctrl && r.shift === shift && (r.on === "any" || r.on === kind || (r.on === "push" && kind === "knob" && push)),
  )?.effect;
}

type Cell = { row: number; col: number };

// Target index inside one group after a move. Clamped, no wrap. Up and down move between grid rows
// and keep the column; with no cell in that row, the focus stays.
export function nextIndex(cells: readonly Cell[], i: number, move: "left" | "right" | "up" | "down" | "first" | "last"): number {
  const last = cells.length - 1;
  if (move === "first") return 0;
  if (move === "last") return last;
  if (move === "left") return Math.max(0, i - 1);
  if (move === "right") return Math.min(last, i + 1);
  const at = cells[i];
  if (at === undefined) return i;
  const row = at.row + (move === "up" ? -1 : 1);
  const j = cells.findIndex((c) => c.row === row && c.col === at.col);
  return j === -1 ? i : j;
}
