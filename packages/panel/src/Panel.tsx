// The panel: one SVG in mm for one view, plus the access layer over it. Colours, pen widths and
// fonts come from CSS tokens, never from this file.
import type { DeviceFunction, Element, GeometryFile } from "@bcr32/device-data";
import type { Engine, PanelView } from "@bcr32/device-model";
import { useMemo, useState, type CSSProperties } from "react";

import { litText, MSG } from "./a11y.ts";
import { Controls } from "./Controls.tsx";
import { buildLayout, isControl, type Layout, type LayoutItem, type ViewBox, type ViewId } from "./layout.ts";
import { Ring } from "./Ring.tsx";
import { useEngine } from "./useEngine.ts";

export interface PanelData {
  geometry: GeometryFile;
  elements: readonly Element[];
  functions: readonly DeviceFunction[];
  groupNames: ReadonlyMap<string, string>;
}

export interface PanelProps {
  data: PanelData;
  engine: Engine;
  view: ViewId;
  viewBox?: ViewBox; // a zoom; the same drawing, a different window
  only?: string | null; // show the controls of one group only
}

// A shape for one part, centred. `extra` grows it on every side (marks and the focus ring).
function Shape({ item, extra = 0, className, inset = 0 }: { item: LayoutItem; extra?: number; className?: string; inset?: number }) {
  const g = extra - inset;
  if (item.part.shape === "circle") return <circle className={className} cx={item.cx} cy={item.cy} r={item.w / 2 + g} />;
  return <rect className={className} x={item.cx - item.w / 2 - g} y={item.cy - item.h / 2 - g} width={item.w + 2 * g} height={item.h + 2 * g} rx={Math.min(item.h / 4, 1.5)} />;
}

function Display({ item, view }: { item: LayoutItem; view: PanelView }) {
  const win = item.part.window;
  const known = view.display.known;
  return (
    <g>
      <Shape item={item} className="part part-display" />
      {win === undefined ? null : (
        <rect className={known ? "display-window" : "display-window display-unknown"} x={item.cx - win.w / 2} y={item.cy - win.h / 2} width={win.w} height={win.h} />
      )}
      {known ? (
        <text className="display-text" x={item.cx} y={item.cy + 1} textAnchor="middle">{view.display.lines.join(" ")}</text>
      ) : (
        <text className="display-text display-unknown-text" x={item.cx} y={item.cy + 1} textAnchor="middle">? ? ?</text>
      )}
    </g>
  );
}

export function Panel({ data, engine, view, viewBox, only = null }: PanelProps) {
  const state = useEngine(engine);
  const layout: Layout = useMemo(() => buildLayout(data.geometry, data.elements, view, data.groupNames), [data, view]);
  const elements = useMemo(() => new Map(data.elements.map((e) => [e.id, e])), [data]);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [live, setLive] = useState({ n: 0, text: "" });
  const vb = viewBox ?? layout.viewBox;
  const byId = new Map(layout.items.map((i) => [i.id, i]));
  const focusItem = focusId === null ? undefined : byId.get(focusId);
  const selItem = selected === null ? undefined : byId.get(selected);

  const announce = (text: string) => setLive((l) => ({ n: l.n + 1, text }));
  const ledItems = layout.items.filter((i) => i.kind === "led");

  return (
    <div className="panel" data-view={view}>
      <div className="stage" style={{ aspectRatio: `${vb[2]} / ${vb[3]}`, ["--ar" as string]: vb[2] / vb[3] } as CSSProperties}>
        <svg className="panel-svg" aria-hidden="true" viewBox={vb.join(" ")} direction="ltr" preserveAspectRatio="xMidYMid meet" focusable="false">
          <g id="case" data-prov={layout.case.prov}>
            <rect className="case-face" x={layout.case.x} y={layout.case.y} width={layout.case.w} height={layout.case.h} rx={layout.case.r} />
            {layout.missing.length > 0 ? (
              <text className="note" x={layout.case.w / 2} y={layout.case.h / 2} textAnchor="middle">{MSG.noJacks}</text>
            ) : null}
          </g>
          <g id="legends">
            {layout.items.flatMap((item) =>
              item.legends.map((l, n) => (
                <text key={`${item.id}.${n}`} className="legend" data-id={item.id} x={item.cx} y={item.cy} textAnchor="middle" dominantBaseline="central" fontSize={l.cap / 0.7}>
                  {l.text}
                </text>
              )),
            )}
          </g>
          <g id="controls">
            {layout.items.map((item) => (
              <g key={item.id} data-id={item.id} data-kind={item.kind} data-prov={item.prov} data-pressed={state.pressed.includes(item.id) ? "true" : undefined}>
                {item.kind === "display" ? <Display item={item} view={state} /> : <Shape item={item} className={`part part-${item.part.shape === "circle" && item.kind === "encoder" ? "knob" : item.kind}`} />}
              </g>
            ))}
          </g>
          <g id="lights">
            {layout.items.map((item) => {
              const led = item.kind === "button" || item.kind === "led" ? state.buttons[item.id] ?? state.leds[item.id] : undefined;
              if (item.kind === "encoder") return <Ring key={item.id} item={item} ring={state.rings[item.id]} />;
              if (led === undefined || led.colour === "off") return null;
              return (
                <g key={item.id} data-id={item.id} className="light" data-colour={led.colour} data-blink={led.blink === "none" ? undefined : led.blink} style={{ "--c": `var(--led-${led.colour})` } as CSSProperties}>
                  <Shape item={item} inset={item.kind === "button" ? 1.2 : 0} className="light-shape" />
                </g>
              );
            })}
          </g>
          <g id="marks">
            {state.pressed.map((id) => {
              const item = byId.get(id);
              return item === undefined ? null : <g key={id} data-id={id}><Shape item={item} extra={item.kind === "encoder" ? 1 : 0.8} className="mark-press" /></g>;
            })}
          </g>
          <g id="highlight">
            {focusItem === undefined ? null : <Shape item={focusItem} extra={focusItem.kind === "encoder" ? 1.8 : 1.4} className="focus-ring" />}
          </g>
        </svg>
        <Controls
          layout={layout}
          viewBox={vb}
          view={state}
          getView={engine.getView}
          elements={elements}
          functions={data.functions}
          only={only}
          dispatch={engine.dispatch}
          announce={announce}
          onFocusId={setFocusId}
          onSelect={setSelected}
        />
      </div>
      {layout.missing.length > 0 ? <p className="rear-note">{MSG.noJacks}</p> : null}
      {selItem === undefined || !isControl(selItem.kind) || selItem.kind !== "encoder" ? null : (
        <div className="knob-tools" role="group" aria-label={`${selItem.id} buttons`}>
          <button type="button" onClick={() => engine.dispatch({ type: "turn", id: selItem.id, steps: -1, t: Math.round(performance.now()) })}>-</button>
          <span>{selItem.id}</span>
          <button type="button" onClick={() => engine.dispatch({ type: "turn", id: selItem.id, steps: 1, t: Math.round(performance.now()) })}>+</button>
        </div>
      )}
      <ul className="sr-only" aria-label="Status LEDs and display">
        {ledItems.map((i) => (
          <li key={i.id}>{litText(i.id, state.leds[i.id]) ?? `${i.id} off`}</li>
        ))}
        <li>Display {state.display.known ? state.display.lines.join(" ") : MSG.unknown}</li>
      </ul>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        <span key={live.n}>{live.text}</span>
      </div>
    </div>
  );
}
