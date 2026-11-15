// The highlight layer of a guide step: a cue mark for each control of the action. Pure drawing, no state.
// The marks are static. Only the pulse ring moves, and the style sheet stops it under reduced motion.
import type { Cue } from "./cues.ts";
import type { LayoutItem } from "./layout.ts";

const radius = (i: LayoutItem) => Math.max(i.w, i.h, i.ring?.dia ?? 0) / 2;

// A curved arrow over the knob: 70 degrees of arc, the head at the end of the turn.
function TurnArrow({ item, dir }: { item: LayoutItem; dir: "cw" | "ccw" }) {
  const r = radius(item) + 2.4;
  const at = (deg: number) => [item.cx + r * Math.sin((deg * Math.PI) / 180), item.cy - r * Math.cos((deg * Math.PI) / 180)] as const;
  const [a0, a1] = dir === "cw" ? [-35, 35] : [35, -35];
  const [x0, y0] = at(a0);
  const [x1, y1] = at(a1);
  const s = dir === "cw" ? 1 : -1;
  // Head: two short strokes back from the end point, along the tangent.
  const t = ((a1 + (s > 0 ? 90 : -90)) * Math.PI) / 180;
  const hx = (k: number) => x1 - 2.2 * Math.sin(t + k);
  const hy = (k: number) => y1 + 2.2 * Math.cos(t + k);
  return (
    <g className="cue cue-turn" data-cue="turn" data-dir={dir}>
      <path d={`M ${x0} ${y0} A ${r} ${r} 0 0 ${dir === "cw" ? 1 : 0} ${x1} ${y1}`} />
      <path d={`M ${hx(0.5)} ${hy(0.5)} L ${x1} ${y1} L ${hx(-0.5)} ${hy(-0.5)}`} />
    </g>
  );
}

function Mark({ cue, item }: { cue: Cue; item: LayoutItem }) {
  const round = item.part.shape === "circle";
  const r = radius(item);
  const grow = cue.kind === "turn" ? 0 : 1.6;
  const ring = round ? <circle cx={item.cx} cy={item.cy} r={r + grow} /> : <rect x={item.cx - item.w / 2 - grow} y={item.cy - item.h / 2 - grow} width={item.w + 2 * grow} height={item.h + 2 * grow} rx={Math.min(item.h / 4, 1.5) + grow} />;
  switch (cue.kind) {
    case "turn":
      return <TurnArrow item={item} dir={cue.dir} />;
    case "push":
      return (
        <g className="cue cue-push" data-cue="push">
          <circle cx={item.cx} cy={item.cy} r={1.2} />
        </g>
      );
    case "hold":
      return (
        <g className="cue cue-hold" data-cue="hold">
          {ring}
          {cue.seconds === undefined ? null : (
            <text className="cue-time" x={item.cx} y={item.cy - item.h / 2 - 2.6} textAnchor="middle">{`${cue.seconds} s`}</text>
          )}
        </g>
      );
    default:
      return (
        <g className="cue cue-press" data-cue="press">
          {ring}
          <g className="cue-pulse">{ring}</g>
        </g>
      );
  }
}

export function Highlight({ items, cues }: { items: ReadonlyMap<string, LayoutItem>; cues: readonly Cue[] }) {
  return (
    <>
      {cues.map((c) => {
        const item = items.get(c.id);
        return item === undefined ? null : <Mark key={`${c.kind}-${c.id}`} cue={c} item={item} />;
      })}
    </>
  );
}
