// The access layer: one transparent HTML control over each SVG part, same box (from layout).
// One tab stop per group, roving tabindex inside it, one key map (keys.ts).
import type { DeviceFunction, Element } from "@bcr32/device-data";
import type { ControlEvent, PanelView } from "@bcr32/device-model";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { accessName, describeEvent, encoderAria, litText } from "./a11y.ts";
import { keyEffect, nextIndex } from "./keys.ts";
import type { ClickKind, ClickPhase } from "./sound-plan.ts";
import { controlBox, type Layout, type LayoutItem, type ViewBox } from "./layout.ts";

// Vertical drag: one detent for this many CSS pixels. Below DRAG_MIN the gesture is a click.
const DRAG_PX = 2;
const DRAG_MIN = 4;

export interface ControlsProps {
  layout: Layout;
  viewBox: ViewBox;
  view: PanelView;
  getView: () => PanelView; // view after the last dispatch
  elements: ReadonlyMap<string, Element>;
  functions: readonly DeviceFunction[];
  only: string | null; // show one group only (narrow screens)
  dispatch: (e: ControlEvent) => void;
  announce: (text: string) => void;
  onFocusId: (id: string | null) => void;
  onSelect: (id: string) => void;
  onSound?: (kind: ClickKind, phase: ClickPhase) => void; // set only while click sounds are on
}

const now = () => Math.round(performance.now());

export function Controls(p: ControlsProps) {
  const [active, setActive] = useState<Record<string, number>>({});
  const refs = useRef(new Map<string, HTMLElement>());
  const held = useRef(new Set<string>());
  const drag = useRef<{ id: string; y: number; acc: number; moved: boolean } | null>(null);
  const skipClick = useRef(false);
  const byId = new Map(p.layout.items.map((i) => [i.id, i]));

  const name = (id: string) => accessName(p.elements.get(id)!, p.view.mode, p.functions);
  const fire = (e: ControlEvent, item: LayoutItem) => {
    p.dispatch(e);
    const text = describeEvent(name(item.id), e, p.getView(), item.kind === "encoder");
    if (text !== undefined) p.announce(text);
  };
  const turn = (item: LayoutItem, steps: number) => fire({ type: "turn", id: item.id, steps, t: now() }, item);
  const press = (item: LayoutItem) => {
    if (held.current.has(item.id)) return;
    held.current.add(item.id);
    p.onSound?.(item.kind === "encoder" ? "knob" : "button", "down");
    fire({ type: "press", id: item.id, t: now() }, item);
  };
  const release = (item: LayoutItem) => {
    if (!held.current.delete(item.id)) return;
    p.onSound?.(item.kind === "encoder" ? "knob" : "button", "up");
    fire({ type: "release", id: item.id, t: now() }, item);
  };

  return (
    <>
      {p.layout.groups
        .filter((g) => g.controls.length > 0 && (p.only === null || p.only === g.id))
        .map((g) => {
          const items = g.controls.map((id) => byId.get(id)!);
          const cells = items.map((i, n) => i.grid ?? { row: 0, col: n });
          const act = Math.min(active[g.id] ?? 0, items.length - 1);
          return (
            <div key={g.id} role="group" aria-label={g.name} className="ctl-group" data-group={g.id}>
              {items.map((item, n) => {
                const box = controlBox(item, p.viewBox);
                const style = { left: `${box.left}%`, top: `${box.top}%`, width: `${box.width}%`, height: `${box.height}%` };
                const el = p.elements.get(item.id)!;
                const isKnob = item.kind === "encoder";
                const lit = litText(item.id, p.view.buttons[item.id]);
                const unknownLit = p.view.unknownLit?.includes(item.id) === true;
                const common = {
                  "data-id": item.id,
                  className: "ctl",
                  style,
                  tabIndex: n === act ? 0 : -1,
                  ref: (node: HTMLElement | null) => void (node === null ? refs.current.delete(item.id) : refs.current.set(item.id, node)),
                  onFocus: () => {
                    setActive((a) => ({ ...a, [g.id]: n }));
                    p.onFocusId(item.id);
                  },
                  onBlur: () => p.onFocusId(null),
                };
                const onKeyDown = (ev: KeyboardEvent) => {
                  const fx = keyEffect(isKnob ? "knob" : "button", el.push === true, ev.key, ev.ctrlKey, ev.shiftKey);
                  if (fx === undefined) return;
                  ev.preventDefault();
                  if (fx.type === "move") refs.current.get(items[nextIndex(cells, n, fx.move)]!.id)?.focus();
                  else if (fx.type === "turn") turn(item, fx.steps);
                  else if (fx.type === "push") {
                    if (!ev.repeat) {
                      press(item);
                      release(item);
                    }
                  } else if (!ev.repeat) press(item);
                };
                const onKeyUp = (ev: KeyboardEvent) => {
                  if (!isKnob && (ev.key === "Enter" || ev.key === " ")) {
                    ev.preventDefault();
                    release(item);
                  }
                };
                if (!isKnob) {
                  return (
                    <button
                      {...common}
                      key={item.id}
                      type="button"
                      aria-label={lit === undefined ? (unknownLit ? `${name(item.id)}, light unknown` : name(item.id)) : `${name(item.id)}, ${lit.slice(item.id.length + 1)}`}
                      onKeyDown={onKeyDown}
                      onKeyUp={onKeyUp}
                      onPointerDown={() => {
                        skipClick.current = true;
                        press(item);
                      }}
                      onPointerUp={() => release(item)}
                      onPointerCancel={() => release(item)}
                      onClick={() => {
                        if (skipClick.current) skipClick.current = false;
                        else {
                          // Screen reader activation: a click with no key or pointer event before it.
                          press(item);
                          release(item);
                        }
                      }}
                    />
                  );
                }
                const a = encoderAria(p.view.rings[item.id]);
                const aria =
                  a.role === "slider"
                    ? { role: "slider", "aria-valuenow": a.now, "aria-valuemin": a.min, "aria-valuemax": a.max, "aria-valuetext": a.text }
                    : { role: "spinbutton", "aria-valuetext": a.text };
                return (
                  <div
                    {...common}
                    {...aria}
                    key={item.id}
                    aria-label={name(item.id)}
                    onKeyDown={onKeyDown}
                    onPointerDown={(ev: PointerEvent) => {
                      (ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId);
                      ev.preventDefault(); // stops text selection during a drag
                      drag.current = { id: item.id, y: ev.clientY, acc: 0, moved: false };
                    }}
                    onPointerMove={(ev: PointerEvent) => {
                      const d = drag.current;
                      if (d === null || d.id !== item.id) return;
                      d.acc += d.y - ev.clientY;
                      d.y = ev.clientY;
                      if (Math.abs(d.acc) >= DRAG_MIN) d.moved = true;
                      const steps = Math.trunc(d.acc / DRAG_PX);
                      if (steps !== 0) {
                        d.acc -= steps * DRAG_PX;
                        turn(item, steps);
                      }
                    }}
                    onPointerUp={() => {
                      const d = drag.current;
                      drag.current = null;
                      if (d !== null && !d.moved) {
                        refs.current.get(item.id)?.focus();
                        p.onSelect(item.id);
                      }
                    }}
                    onPointerCancel={() => void (drag.current = null)}
                  />
                );
              })}
            </div>
          );
        })}
    </>
  );
}
