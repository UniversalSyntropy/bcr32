// Click sounds (B5): the numbers and the plan. Pure; the Web Audio part is in sound.ts.
export type ClickKind = "knob" | "button";
export type ClickPhase = "down" | "up";

// A knob push is a low, longer click. A button press is a high, shorter click.
export const KNOB_PUSH = { freqHz: 70, ms: 40 } as const;
export const BUTTON_PRESS = { freqHz: 1800, ms: 20 } as const;
export const CLICK_GAIN = 0.35;
export const RELEASE_GAIN_FACTOR = 0.5; // a key up is half as loud

export interface ClickPlan {
  freqHz: number;
  ms: number;
  gain: number;
}

export function clickPlan(kind: ClickKind, phase: ClickPhase): ClickPlan {
  const t = kind === "knob" ? KNOB_PUSH : BUTTON_PRESS;
  return { freqHz: t.freqHz, ms: t.ms, gain: phase === "down" ? CLICK_GAIN : CLICK_GAIN * RELEASE_GAIN_FACTOR };
}
