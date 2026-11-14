// View contract of the panel (D1 section 5.1). Types and the guide patch schema. No behaviour.
import { ElementId, Key } from "@bcr32/device-data";
import { z } from "zod";

export const RING_STYLE_IDS = [
  "off", "1dot", "1dot/off", "12dot", "12dot/off", "bar", "bar/off", "spread", "pan", "qual", "cut", "damp", "mcu",
] as const;
export type RingStyleId = (typeof RING_STYLE_IDS)[number];

export const ENC_MODES = ["absolute", "absolute/14", "relative-1", "relative-2", "relative-3", "relative-1/14", "inc/dec"] as const;
export type EncMode = (typeof ENC_MODES)[number];

// The named colour set comes from device.json later. A plain string until then.
export type LedColour = string;
export type BlinkRate = "none" | "slow" | "fast";

export type ControlEvent =
  | { type: "press" | "release"; id: string; t: number }
  | { type: "turn"; id: string; steps: number; t: number }; // steps: detents, + is clockwise

// Inputs only. The ring model derives the LEDs.
export interface RingState {
  style: RingStyleId | "unknown";
  encMode: EncMode | "unknown";
  value: number | null; // null: the unit keeps no value
  min: number;
  max: number;
  known: boolean; // false: draw the unknown style
  source: "local" | "host";
}

export interface DisplayState {
  lines: string[];
  known: boolean; // false: the text is a placeholder
}

interface LedState {
  colour: LedColour;
  blink: BlinkRate;
}

export interface PanelView {
  mode: string;
  buttons: Record<string, LedState>;
  rings: Record<string, RingState>;
  leds: Record<string, LedState>;
  display: DisplayState;
  pressed: string[]; // held now; drawn as the press mark
}

// Guide `after` field: a JSON Merge Patch of PanelView. null removes a key. `pressed` is not allowed.
const Blink = z.enum(["none", "slow", "fast"]);
const LedPatch = z.strictObject({ colour: z.string().min(1).nullable().optional(), blink: Blink.nullable().optional() });
const RingPatch = z.strictObject({
  style: z.union([z.enum(RING_STYLE_IDS), z.literal("unknown")]).nullable().optional(),
  encMode: z.union([z.enum(ENC_MODES), z.literal("unknown")]).nullable().optional(),
  value: z.number().nullable().optional(),
  min: z.number().nullable().optional(),
  max: z.number().nullable().optional(),
  known: z.boolean().nullable().optional(),
  source: z.enum(["local", "host"]).nullable().optional(),
});
const DisplayPatch = z.strictObject({ lines: z.array(z.string()).nullable().optional(), known: z.boolean().nullable().optional() });

export const ViewPatch = z.strictObject({
  mode: Key.nullable().optional(),
  buttons: z.record(ElementId, LedPatch.nullable()).optional(),
  rings: z.record(ElementId, RingPatch.nullable()).optional(),
  leds: z.record(ElementId, LedPatch.nullable()).optional(),
  display: DisplayPatch.nullable().optional(),
});
export type ViewPatch = z.infer<typeof ViewPatch>;
