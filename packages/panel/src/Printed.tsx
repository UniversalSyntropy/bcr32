// The printed layer: bars and lines under the controls, text above the lights. Position, size and
// text come from the layout; colour, pen and font come from CSS tokens.
import type { CSSProperties } from "react";

import { FONT_PER_CAP, type Layout } from "./layout.ts";

export function PrintedMarks({ layout }: { layout: Layout }) {
  return (
    <g id="printed-marks">
      {layout.marks.map((m) =>
        m.kind === "line" ? (
          <line key={m.id} className={`mark-line pen-${m.pen}`} data-mark={m.id} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} />
        ) : (
          <rect key={m.id} className={`mark-bar pen-${m.pen}`} data-mark={m.id} data-kind={m.kind} x={m.x} y={m.y} width={m.w} height={m.h} rx={0.6} />
        ),
      )}
    </g>
  );
}

export function PrintedText({ layout, lit }: { layout: Layout; lit: ReadonlyMap<string, { colour: string; blink: string }> }) {
  return (
    <g id="legends">
      {layout.legends.map((l) => {
        const on = l.onPart ? lit.get(l.id) : undefined;
        const colour = l.onBar ? "bar" : (l.colour ?? "default");
        return (
          <text
            key={l.key}
            className={`legend${on === undefined ? "" : " legend-lit"}`}
            data-id={l.id}
            data-label={l.label}
            data-colour={colour}
            data-on={l.onPart ? "true" : undefined}
            data-blink={on !== undefined && on.blink !== "none" ? on.blink : undefined}
            x={l.x}
            y={l.y}
            textAnchor={l.anchor}
            dominantBaseline="central"
            fontSize={l.cap * FONT_PER_CAP}
            {...(l.rot === undefined ? {} : { transform: `rotate(${l.rot} ${l.x} ${l.y})` })}
          >
            {l.text}
          </text>
        );
      })}
      {layout.brand.map((b) => (
        <text key="brand" id="brand" className="brand" x={b.x} y={b.y} textAnchor={b.anchor} dominantBaseline="central" fontSize={b.size} style={{ fontWeight: b.weight } as CSSProperties}>
          {b.text}
        </text>
      ))}
    </g>
  );
}
