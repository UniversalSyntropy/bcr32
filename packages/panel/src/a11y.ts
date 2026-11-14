// Access names, roles and live-region text. Pure. English only; the keys of the message catalogue
// (B5) are the names of the constants below.
import type { DeviceFunction, Element } from "@bcr32/device-data";
import type { ControlEvent, PanelView, RingState } from "@bcr32/device-model";

export const MSG = {
  relative: "relative, no value shown",
  unknown: "unknown",
  pressed: "pressed",
  pushed: "pushed",
  lit: "lit",
  blinks: "blinks",
  ofRange: "of",
  noJacks: "17 jacks: positions not measured",
  fixture: "Fixture: not a unit state",
} as const;

// Name template: "{id} {function}". The function comes from functions.json when the mode matches,
// else the first label text, else the ID alone.
export function functionName(functions: readonly DeviceFunction[], mode: string, id: string): string | undefined {
  return functions.find((f) => f.mode === mode && f.elements.includes(id))?.name;
}

export function accessName(el: Element, mode: string, functions: readonly DeviceFunction[]): string {
  const word = functionName(functions, mode, el.id) ?? el.labels[0]?.text;
  return word === undefined ? el.id : `${el.id} ${word}`;
}

export type EncoderAria =
  | { role: "slider"; now: number; min: number; max: number; text: string }
  | { role: "spinbutton"; text: string };

// Absolute encoder with a shown value: slider. Relative or unknown: spinbutton with no value.
export function encoderAria(ring: RingState | undefined): EncoderAria {
  if (ring === undefined || !ring.known || ring.encMode === "unknown" || ring.value === null) return { role: "spinbutton", text: MSG.unknown };
  if (!ring.encMode.startsWith("absolute")) return { role: "spinbutton", text: MSG.relative };
  return { role: "slider", now: ring.value, min: ring.min, max: ring.max, text: `${ring.value} ${MSG.ofRange} ${ring.max}` };
}

export function litText(id: string, led: { colour: string; blink: string } | undefined): string | undefined {
  if (led === undefined || led.colour === "off") return undefined;
  return `${id} ${MSG.lit} ${led.colour}${led.blink === "none" ? "" : ` ${MSG.blinks}`}`;
}

// Text for the live region after one event. `name` is the access name of the control.
export function describeEvent(name: string, e: ControlEvent, view: PanelView, isKnob: boolean): string | undefined {
  if (e.type === "release") return undefined;
  if (e.type === "press") return `${name} ${isKnob ? MSG.pushed : MSG.pressed}`;
  const a = encoderAria(view.rings[e.id]);
  return `${name} ${a.text}`;
}
