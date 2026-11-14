// Ring LEDs of one knob: 15 small shapes. A known ring lights the LEDs the ring model gives.
// An unknown ring draws outline LEDs with the hatch token and no data-lit attribute.
import { ringLit, type RingState } from "@bcr32/device-model";

import { type LayoutItem } from "./layout.ts";

export function Ring({ item, ring }: { item: LayoutItem; ring: RingState | undefined }) {
  const geom = item.ring;
  if (geom === undefined) return null;
  const known = ring !== undefined && ring.known && ring.style !== "unknown" && ring.encMode !== "unknown";
  const lit = known ? ringLit({ style: ring.style as never, encMode: ring.encMode as never, value: ring.value, min: ring.min, max: ring.max }, geom.leds.length) : [];
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
    </g>
  );
}
