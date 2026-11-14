// Zod schemas for one device folder under data/devices/. Source of truth: TS types
// and data/schema/*.schema.json derive from these. No device-specific field names.
import { z } from "zod";

export const SCHEMA_VERSION = 1 as const;

// Printed-control ID as the manual numbers it: B5, E25, SEL, L2.in, J70.
export const ElementId = z.string().regex(/^[A-Z][A-Za-z0-9]*(\.[a-z0-9]+)?$/);
// Lowercase key for views, groups, modes, functions, value sets: zaq, zaq-global, zaq.pitch.
export const Key = z.string().regex(/^[a-z][a-z0-9-]*(\.[a-z0-9-]+)*$/);
const Text = z.string().min(1);
const SemVer = z.string().regex(/^\d+\.\d+\.\d+$/);

// Where a fact comes from. A unit-tested fact names the firmware it was tested on.
export const Source = z
  .strictObject({
    source: z.enum(["manual", "unit", "community", "inference"]),
    firmware: Text.optional(),
    ref: Text.optional(), // manual section or page, URL, or test ID
    note: Text.optional(),
  })
  .refine((s) => s.source !== "unit" || s.firmware !== undefined, {
    message: "source 'unit' needs a firmware version",
    path: ["firmware"],
  });

const fileHeader = { $schema: z.string().optional() };

// device.json
export const DeviceFile = z.strictObject({
  ...fileHeader,
  schemaVersion: z.literal(SCHEMA_VERSION),
  dataVersion: SemVer,
  id: Key,
  name: Text,
  manufacturer: Text,
  manual: z.strictObject({ title: Text, version: Text, pages: Text.optional() }),
  firmware: Text.optional(), // newest firmware any 'unit' fact was tested on
  counts: z.strictObject({ callouts: z.int().positive(), elements: z.int().positive() }),
  views: z
    .array(
      z.strictObject({
        id: Key,
        name: Text,
        size: z.strictObject({ w: z.number().positive(), h: z.number().positive() }).optional(),
      }),
    )
    .min(1),
  groups: z.array(z.strictObject({ id: Key, name: Text, view: Key, note: Text.optional() })).min(1),
  ledColours: z.array(Key).min(1), // named states an LED or lit button can show; includes "off"
  labelColours: z.array(Key).min(1), // named print colours of panel labels
  note: Text.optional(),
});

// elements.json
export const ElementKind = z.enum(["button", "encoder", "led", "display", "jack"]);

export const Label = z.strictObject({
  text: Text,
  placement: z.enum(["on", "above", "below", "left", "right", "legend"]),
  colour: Key.optional(),
  role: Text.optional(), // what the label names, when a control carries more than one
});

export const Element = z.strictObject({
  id: ElementId,
  callout: z.int().positive(),
  kind: ElementKind,
  view: Key,
  group: Key,
  labels: z.array(Label),
  panelNumber: z.int().optional(), // number printed at the control, when it differs from the callout
  grid: z.strictObject({ row: z.int().min(0), col: z.int().min(0) }).optional(), // row and column inside the group
  position: z.strictObject({ x: z.number(), y: z.number() }).optional(), // panel units; entered with geometry
  size: z.strictObject({ w: z.number().positive(), h: z.number().positive() }).optional(),
  push: z.boolean().optional(), // encoder has a push switch
  ringLeds: z.int().positive().optional(), // LED count of an encoder ring
  colours: z.array(Key).optional(), // colours this LED or lit button can show
  connector: Text.optional(), // jack connector type
  signal: Text.optional(), // jack signal
  note: Text.optional(),
  source: Source,
});

export const ElementsFile = z.strictObject({ ...fileHeader, elements: z.array(Element).min(1) });

// modes.json
const ModeStep = z.strictObject({ action: Text, from: Key.optional(), note: Text.optional() });

export const Mode = z.strictObject({
  id: Key,
  name: Text,
  kind: z.enum(["mode", "menu", "page", "state"]),
  parent: Key.optional(),
  enter: z.array(ModeStep).min(1),
  exit: z.array(ModeStep),
  lit: z.array(
    z.strictObject({
      elements: z.array(ElementId).min(1),
      colour: Key,
      blink: z.boolean().optional(),
      when: Text.optional(),
    }),
  ),
  manualAnchor: Text.optional(),
  note: Text.optional(),
  source: Source,
});

export const ModesFile = z.strictObject({ ...fileHeader, modes: z.array(Mode).min(1) });

// values.json
export const ValueSet = z
  .strictObject({
    id: Key,
    name: Text,
    // A set is a list of options, a numeric range, or both ("Off, 1–127").
    options: z
      .array(z.strictObject({ value: Text, display: Text.optional(), note: Text.optional() }))
      .min(1)
      .optional(),
    range: z
      .strictObject({ min: z.number(), max: z.number(), step: z.number().positive().optional(), unit: Text.optional() })
      .refine((r) => r.min <= r.max, { message: "min is above max" })
      .optional(),
    note: Text.optional(),
    source: Source,
  })
  .refine((v) => v.options !== undefined || v.range !== undefined, {
    message: "a value set needs options, a range, or both",
  });

export const ValuesFile = z.strictObject({ ...fileHeader, valueSets: z.array(ValueSet).min(1) });

// functions.json
export const DeviceFunction = z.strictObject({
  id: Key,
  mode: Key,
  elements: z.array(ElementId).min(1),
  name: Text,
  action: Text.optional(), // action notation: "hold B12 + turn E33"
  description: Text.optional(),
  values: Key.optional(), // value set ID
  default: z.union([z.string().min(1), z.number()]).optional(),
  scope: z.enum(["global", "track", "step", "pattern", "preset", "control"]).optional(),
  manualAnchor: Text.optional(),
  note: Text.optional(),
  source: Source,
});

export const FunctionsFile = z.strictObject({ ...fileHeader, functions: z.array(DeviceFunction).min(1) });

// glossary.json
export const GlossaryFile = z.strictObject({
  ...fileHeader,
  terms: z.array(z.strictObject({ term: Text, definition: Text, aliases: z.array(Text).optional() })).min(1),
});

// section-map.json: the parts of the official manual and where our documents cover each one.
export const SectionMapItem = z
  .strictObject({
    id: Key,
    kind: z.enum(["section", "menu", "table", "list", "figure"]),
    title: Text, // title as the official manual prints it
    page: z.int().positive(), // left page of the two-page spread
    anchors: z.array(z.string().regex(/^[^#\s]+\.md#[a-z0-9][a-z0-9_-]*$/)).optional(), // repo path + heading slug
    excluded: Text.optional(), // why our documents do not cover the item
    note: Text.optional(),
  })
  .refine((i) => (i.anchors !== undefined && i.anchors.length > 0) !== (i.excluded !== undefined), {
    message: "an item needs anchors or an exclusion reason, not both",
  });

export const SectionMapFile = z.strictObject({ ...fileHeader, items: z.array(SectionMapItem).min(1) });

// midi.json: MIDI facts seen at the unit. Every record carries its firmware (source 'unit').
const MidiNumber = z.int().min(0).max(127);

export const MidiPort = z.strictObject({
  id: Key,
  name: Text, // name the operating system shows
  direction: z.array(z.enum(["in", "out"])).min(1), // seen from the computer
  note: Text.optional(),
  source: Source,
});

export const MidiMessage = z
  .strictObject({
    id: Key,
    port: Key,
    mode: Key, // mode or menu the unit was in
    direction: z.enum(["out", "in"]), // out = the unit sends
    type: z.enum(["cc", "note", "program-change", "clock", "start", "stop", "sysex"]),
    channel: z.int().min(1).max(16).optional(),
    number: MidiNumber.optional(), // controller number, note number or program number
    name: Text.optional(), // standard name of the controller number
    values: z.array(MidiNumber).min(1).optional(), // data bytes seen, in order
    pattern: Text.optional(), // sysex only: byte layout
    trigger: z
      .strictObject({
        elements: z.array(ElementId).min(1),
        confidence: z.enum(["proven", "likely", "unproven"]),
      })
      .optional(),
    note: Text.optional(),
    source: Source,
  })
  .refine((m) => m.type !== "cc" || (m.channel !== undefined && m.number !== undefined), {
    message: "a cc message needs a channel and a number",
  })
  .refine((m) => (m.type === "sysex") === (m.pattern !== undefined), {
    message: "a sysex message needs a pattern, and no other message has one",
  });

// A test that produced no message. Silence is a result.
export const MidiSilence = z.strictObject({
  id: Key,
  port: Key.optional(), // omitted when no port showed anything
  mode: Key,
  action: Text,
  result: Text,
  note: Text.optional(),
  source: Source,
});

export const MidiFile = z.strictObject({
  ...fileHeader,
  usb: z.strictObject({
    vendorId: z.string().regex(/^[0-9A-F]{4}$/),
    productId: z.string().regex(/^[0-9A-F]{4}$/),
    release: Text,
    mode: Text, // unit state when read: application or bootloader
    source: Source,
  }),
  ports: z.array(MidiPort).min(1),
  messages: z.array(MidiMessage),
  silences: z.array(MidiSilence),
});

// geometry.json: where each element sits, in mm, centre point. Layout facts only; no drawing style.
export const Provenance = z.enum(["measured", "derived", "owner", "assumed", "missing"]);

const GeometryView = z
  .strictObject({
    width: z.number().positive(),
    depth: z.number().positive().optional(), // plan view
    height: z.number().positive().optional(), // side or rear view
    cornerRadius: z.number().min(0).optional(),
    origin: Text.optional(), // where x and y start, and which way they grow
    prov: Provenance.optional(), // how the view size is known
  })
  .refine((v) => (v.depth !== undefined) !== (v.height !== undefined), {
    message: "a view needs a depth or a height, not both",
  });

const GeometryPart = z
  .strictObject({
    shape: z.enum(["circle", "rect"]),
    dia: z.number().positive().optional(), // circle
    w: z.number().positive().optional(), // rect
    h: z.number().positive().optional(), // rect
    ringDia: z.number().positive().optional(), // diameter of an LED ring around the part
    window: z.strictObject({ w: z.number().positive(), h: z.number().positive() }).optional(),
  })
  .refine((p) => (p.shape === "circle" ? p.dia !== undefined && p.w === undefined && p.h === undefined : p.dia === undefined && p.w !== undefined && p.h !== undefined), {
    message: "a circle needs dia only; a rect needs w and h only",
  });

const GeometryRing = z.strictObject({
  count: z.int().positive(),
  startDeg: z.number(),
  endDeg: z.number(),
  zeroDeg: z.enum(["up", "down", "left", "right"]), // direction of zero degrees; angles grow clockwise
  prov: z.record(Key, Provenance),
});

const GeometryPlace = z
  .strictObject({
    view: Key,
    part: Key.optional(), // absent only when prov is 'missing'
    x: z.number().optional(), // centre of the part
    y: z.number().optional(),
    prov: Provenance,
  })
  .refine((p) => (p.prov === "missing" ? p.x === undefined && p.y === undefined : p.x !== undefined && p.y !== undefined && p.part !== undefined), {
    message: "'missing' has no x, y; every other provenance needs part, x and y",
  });

const GeometryLegend = z.strictObject({
  for: ElementId,
  label: z.int().min(0), // index into the labels of that element
  x: z.number(),
  y: z.number(),
  anchor: z.enum(["start", "middle", "end"]),
  capHeight: z.number().positive(),
  prov: Provenance,
});

export const GeometryFile = z.strictObject({
  ...fileHeader,
  version: SemVer,
  units: z.literal("mm"),
  views: z.record(Key, GeometryView),
  parts: z.record(Key, GeometryPart),
  ring: GeometryRing.optional(),
  place: z.record(ElementId, GeometryPlace),
  legends: z.array(GeometryLegend),
});

// rings.json: one row per LED ring style.
export const RingStyle = z.strictObject({
  id: Text, // word in the preset text file: 1dot/off
  code: z.string().regex(/^[0-9A-C]$/), // stored code, one hex digit
  name: Text,
  rule: Key, // name of the rule in the ring model
  status: z.enum(["model-unverified", "model-disagrees", "unknown", "verified"]),
  source: Source,
});

export const RingsFile = z.strictObject({
  ...fileHeader,
  styles: z.array(RingStyle).min(1),
  // position (0 to 100 percent as text) → lit LED indexes; filled by the ring test pass
  table: z.record(Text, z.array(z.int().min(0))).optional(),
}).superRefine((f, ctx) => {
  f.styles.forEach((s, i) => {
    if (s.status === "verified" && (s.source.source !== "unit" || s.source.firmware === undefined))
      ctx.addIssue({ code: "custom", path: ["styles", i, "source"], message: "'verified' needs source 'unit' and a firmware version" });
  });
});

// Guide files live in docs/guides/data/, not in a device folder (see guide.ts).
const Message = z.strictObject({ key: Key, en: Text });

export const GuideStep = z.strictObject({
  id: Key,
  action: Text.optional(), // grammar is checked by the action parser
  focus: z.array(ElementId).min(1).max(8),
  target: z.record(z.string(), z.unknown()).optional(),
  after: z.record(z.string(), z.unknown()).optional(), // patch of the panel view
  held: z.array(ElementId).optional(),
  caption: Message,
  expect: Message.optional(),
  advance: z.enum(["on-action", "manual"]),
  warn: Message.optional(),
  source: Source.optional(),
});

export const GuideFile = z
  .strictObject({
    ...fileHeader,
    id: Key,
    version: z.int().positive(),
    title: Message,
    doc: Text.optional(),
    firmware: Text,
    status: z.enum(["verified", "unverified"]),
    start: z.strictObject({ mode: Key, view: z.record(z.string(), z.unknown()) }),
    steps: z.array(GuideStep).min(1).max(12),
  });

// File name → schema. `required` files must exist in every device folder.
export const FILES = {
  "device.json": { schema: DeviceFile, required: true },
  "elements.json": { schema: ElementsFile, required: true },
  "modes.json": { schema: ModesFile, required: false },
  "values.json": { schema: ValuesFile, required: false },
  "functions.json": { schema: FunctionsFile, required: false },
  "glossary.json": { schema: GlossaryFile, required: false },
  "section-map.json": { schema: SectionMapFile, required: false },
  "midi.json": { schema: MidiFile, required: false },
  "geometry.json": { schema: GeometryFile, required: false },
  "rings.json": { schema: RingsFile, required: false },
} as const;

export type FileName = keyof typeof FILES;
export type ElementId = z.infer<typeof ElementId>;
export type Source = z.infer<typeof Source>;
export type DeviceFile = z.infer<typeof DeviceFile>;
export type Element = z.infer<typeof Element>;
export type ElementsFile = z.infer<typeof ElementsFile>;
export type Mode = z.infer<typeof Mode>;
export type ModesFile = z.infer<typeof ModesFile>;
export type ValueSet = z.infer<typeof ValueSet>;
export type ValuesFile = z.infer<typeof ValuesFile>;
export type DeviceFunction = z.infer<typeof DeviceFunction>;
export type FunctionsFile = z.infer<typeof FunctionsFile>;
export type GlossaryFile = z.infer<typeof GlossaryFile>;
export type SectionMapItem = z.infer<typeof SectionMapItem>;
export type RingStyle = z.infer<typeof RingStyle>;
export type MidiFile = z.infer<typeof MidiFile>;
export type GeometryFile = z.infer<typeof GeometryFile>;
export type RingsFile = z.infer<typeof RingsFile>;
export type GuideFile = z.infer<typeof GuideFile>;

export interface DeviceData {
  device: DeviceFile;
  elements: Element[];
  modes: Mode[];
  valueSets: ValueSet[];
  functions: DeviceFunction[];
  glossary: GlossaryFile["terms"];
  sectionMap: SectionMapItem[];
  midi: MidiFile | undefined;
  geometry: GeometryFile | undefined;
  rings: RingStyle[];
}
