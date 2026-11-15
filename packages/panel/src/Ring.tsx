// Ring LEDs of one knob: 15 small shapes. A known ring lights the LEDs the ring model gives.
// An unknown ring draws outline LEDs with the hatch token and no data-lit attribute.
import { ringLit, type RingState } from "@bcr32/device-model";

import { arcAngle, DETENT_DEG, pointerAt, pointerLine, type LayoutItem } from "./layout.ts";

// `track` is the UI-only record of the turns on this knob: the pointer angle before the first turn
// (null when the ring was unknown) and the net detents since. The pointer has no end stop: it moves
// 15 degrees per detent, while the ring LEDs clamp to the range.
export interface PointerTrack { base: number | null; n: number }
export function Ring({ item, ring, track }: { item: LayoutItem; ring: RingState | undefined; track?: PointerTrack | undefined }) {
  const geom = item.ring;
  if (geom === undefined) return null;
  const known = ring !== undefined && ring.known && ring.style !== "unknown" && ring.encMode !== "unknown";
  const lit = known ? ringLit({ style: ring.style as never, encMode: ring.encMode as never, value: ring.value, min: ring.min, max: ring.max }, geom.leds.length) : [];
  const base = known ? pointerLine(item, ring.value, ring.min, ring.max) : null;
  const ptr = track === undefined ? base : pointerAt(item, (track.base ?? arcAngle(geom.arc, 0)) + track.n * DETENT_DEG);
  return (
    <g className="ring" data-id={item.id} data-known={known ? "true" : "false"}>
      {geom.leds.map((l) => {
        const on = known && lit[l.i] === true;
        return (
          <rect
            key={l.i}
            className={known ? "ring-led" : "ring-led ring-led-unknown"}
            data-i={l.i}
            {...(known ? { "data-lit": on ? "true" : "false" } : {})}
            x={l.x - l.w / 2}
            y={l.y - l.h / 2}
            width={l.w}
            height={l.h}
            transform={`rotate(${l.rot} ${l.x} ${l.y})`}
          />
        );
      })}
      {ptr === null ? null : <line className="pointer" data-deg={ptr.deg.toFixed(3)} x1={ptr.x1} y1={ptr.y1} x2={ptr.x2} y2={ptr.y2} />}
    </g>
  );
}
