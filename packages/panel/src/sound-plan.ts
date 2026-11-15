// Click sounds (B5): the numbers and the plan. Pure; the Web Audio part is in sound.ts.
export type ClickKind = "knob" | "button" | "detent";
export type ClickPhase = "down" | "up";

// A knob push is a low, longer click. A button press is a high, shorter click.
export const KNOB_PUSH = { freqHz: 70, ms: 40 } as const;
export const BUTTON_PRESS = { freqHz: 1800, ms: 20 } as const;
// One knob detent (owner count: 24 per turn): a very short, mid click, softer than a press.
export const DETENT = { freqHz: 900, ms: 8 } as const;
export const DETENT_GAIN_FACTOR = 0.6;
export const CLICK_GAIN = 0.35;
export const RELEASE_GAIN_FACTOR = 0.5; // a key up is half as loud

export interface ClickPlan {
  freqHz: number;
  ms: number;
  gain: number;
}

export function clickPlan(kind: ClickKind, phase: ClickPhase): ClickPlan {
  const t = kind === "knob" ? KNOB_PUSH : kind === "detent" ? DETENT : BUTTON_PRESS;
  const base = kind === "detent" ? CLICK_GAIN * DETENT_GAIN_FACTOR : CLICK_GAIN;
  return { freqHz: t.freqHz, ms: t.ms, gain: phase === "down" ? base : base * RELEASE_GAIN_FACTOR };
}
