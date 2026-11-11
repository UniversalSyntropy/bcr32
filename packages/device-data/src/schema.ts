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

// File name → schema. `required` files must exist in every device folder.
export const FILES = {
  "device.json": { schema: DeviceFile, required: true },
  "elements.json": { schema: ElementsFile, required: true },
  "modes.json": { schema: ModesFile, required: false },
  "values.json": { schema: ValuesFile, required: false },
  "functions.json": { schema: FunctionsFile, required: false },
  "glossary.json": { schema: GlossaryFile, required: false },
  "section-map.json": { schema: SectionMapFile, required: false },
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

export interface DeviceData {
  device: DeviceFile;
  elements: Element[];
  modes: Mode[];
  valueSets: ValueSet[];
  functions: DeviceFunction[];
  glossary: GlossaryFile["terms"];
  sectionMap: SectionMapItem[];
}
