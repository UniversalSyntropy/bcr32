---
title: Architecture note
description: Data model, packages, state model, overlay design and MIDI adapter seams for the BCR32 docs and web panel.
status: draft
last_updated: 2026-11-11
---

# Architecture note

One device data set drives the manual tables, the web panel, the label overlay and the checks. The view never knows how state is produced, so a demo engine, a full engine or a live unit can sit behind the same panel.

This note is a design. Nothing here is built yet; see the [project plan](plan.md) for phases and the [decision log](decisions.md) for reasons.

## Repository layout

This tree shows the planned layout.

```text
data/
  devices/bcr32/      device data (JSON)
  schema/             generated JSON Schema files
  coverage/           official-manual section map
  lineage/            Zaquencer to BCR32 feature map
docs/
  manual/             BCR32 manual, one file per chapter
  guides/             task guides
  lineage/            BCR2000 and Zaquencer guide
  project/            plan, architecture, decisions
packages/
  device-data/        schema, loader, types
  device-model/       state, engines, lessons (no React)
  panel/              React controls, panel renderer, overlay
apps/
  web/                the web panel app and dev panel
tools/
  privacy-check/  docs-check/  coverage-check/  gen-tables/
```

> **Text version:** data feeds three packages; the app uses the packages; tools read data and docs.

## Device data

### Callouts and elements

The official manual numbers 85 callouts. The unit has 88 addressable elements, because callout 2 covers three LEDs and callout 3 covers two.

<!-- gen:element-kinds -->

| Kind | Count | IDs |
| --- | --- | --- |
| Button | 31 | `B1`, `B5`–`B24`, `B59`–`B68` |
| Encoder | 33 | `E25`–`E56`, `SEL` |
| LED | 6 | `L2.in`, `L2.a`, `L2.b`, `L3.1`, `L3.2`, `L4` |
| Display | 1 | `DISP` |
| Jack | 17 | `J69`–`J85` |

<!-- gen:end -->

Element IDs are stable and match the manual's control IDs. A callout maps to one or more elements.

### Files

| File | Holds |
| --- | --- |
| `device.json` | name, panel views with size in panel units, groups |
| `elements.json` | per element: id, callout, kind, printed labels, group, label colour, position, size, LED spec |
| `modes.json` | modes and menus: how to enter and exit, which buttons light and in which colour |
| `functions.json` | per mode and element: function name, value set, default, manual anchor |
| `values.json` | named value sets such as note lengths, chord types and routings |
| `overlay.json` | per callout: leader anchor, label side, manual position override |
| `glossary.json` | term, definition, aliases |

### Rules

- **Schema:** Zod schemas in `packages/device-data` are the source. TypeScript types and the JSON Schema files in `data/schema/` are generated from them. The [package README](../../packages/device-data/README.md) lists what validation proves.
- **Geometry:** positions use panel units with the origin at the top left of each view. The renderer scales units to the container.
- **Accuracy label:** each fact field can carry `source` (`manual`, `unit`, `community`, `inference`) and, for `unit`, a firmware version.
- **Device profiles:** a second device is a second folder under `data/devices/`. The schema has no BCR32-specific field names.
- **Strings:** printed panel labels live in data. App interface strings live in one message catalogue in `apps/web`.

### What data drives

| Consumer | Uses |
| --- | --- |
| Manual | control tables and indexes generated between marker comments |
| `docs-check` | control ID validation, glossary first-use links |
| Panel renderer | element kind, position, labels, colours |
| Overlay | callout numbers, anchors, groups |
| Demo engine | modes, lit buttons, value sets |
| `llms.txt` | ID scheme summary |

## Packages

| Package | Responsibility | Depends on |
| --- | --- | --- |
| `@bcr32/device-data` | schema, loader, generated types | zod |
| `@bcr32/device-model` | view state, events, engines, lesson runner; no DOM | device-data |
| `@bcr32/panel` | controls, panel renderer, overlay, highlight layer | device-data, react, motion |
| `apps/web` | app shell, dev panel, lesson player, adapters wiring | all three |

Controls and the panel renderer share one package. They split when a second consumer needs the controls alone.

## View state and events

The panel renders a `PanelView` and emits `ControlEvent`s. These two types are the whole contract between view and engine.

This sketch shows the contract.

```ts
type ControlEvent =
  | { type: "press" | "release"; id: ElementId; t: number }
  | { type: "turn"; id: ElementId; delta: number; t: number };

interface PanelView {
  buttons: Record<ElementId, { colour: LedColour; blink: boolean }>;
  rings: Record<ElementId, { lit: number[]; style: RingStyle }>;
  leds: Record<ElementId, { on: boolean }>;
  display: { lines: string[] };
}

interface Engine {
  dispatch(event: ControlEvent): void;
  getView(): PanelView;
  subscribe(listener: () => void): () => void;
}
```

### Rules

- **Colour is data:** `LedColour` is a named set (off, pink, amber, blue, green, red). CSS tokens map names to colours.
- **Hold and long press** are derived inside the engine from press and release times. The view reports only raw events.
- **React binding:** one `useSyncExternalStore` hook over `Engine`. There is no state library.
- **Purity:** engines are reducers plus a clock input, so tests replay event lists without a browser.

### Engines

| Engine | Phase | Behaviour |
| --- | --- | --- |
| `StaticEngine` | P4 | fixed view; controls move their own ring value |
| `DemoEngine` | P5 | mode machine from `modes.json`: mode switches, menus, lit buttons, display text |
| `LessonEngine` | P5 | wraps another engine; applies each step's view patch and checks the expected action |
| `SequencerEngine` | P8 | full sequencer state, clock, MIDI output |
| `MirrorEngine` | P8 | view follows MIDI from a real unit, as far as the unit reports it |

## Panel rendering

- **Elements are HTML,** positioned absolutely inside a container with a fixed aspect ratio. Each control draws itself with inline SVG. This keeps native focus, roles and keyboard handling.
- **Scaling** uses container query units, so the panel fits any width without script.
- **Styling** uses CSS custom properties for tokens and `data-*` attributes for state and variants. Tailwind styles the app shell and dev panel.
- **Motion** is used for highlight pulses, label transitions and lesson steps. Base controls use CSS transitions only.
- **Artwork** is our own drawing. The panel shows the model name as plain text and no logo.

### Control behaviour

| Control | Role | Pointer | Keyboard |
| --- | --- | --- | --- |
| Encoder | `slider` with value text | vertical drag, wheel; Shift for fine steps; click to push | arrows, Page Up, Page Down, Home, End; Enter to push |
| Button | `button` | press, hold, release | Space or Enter; key down and key up map to press and release |
| LED, display | `status` or `img` with a text name | none | not focusable |
| Jack | `img` with a name | none | focusable only when the overlay is on |

Endless encoders have no minimum or maximum on the unit. The slider role reports the current function's range from `functions.json`.

Tab order follows panel groups, and arrow keys move inside a group. This keeps 88 elements from becoming 88 tab stops.

## Overlay and highlights

- **Layer:** one SVG above the panel in the same panel units, with pointer events off.
- **Labels:** numbered boxes in gutters around the panel, joined to their element by an elbow leader, as in the official diagrams. Numbers are the official callout numbers.
- **Placement:** an automatic pass assigns each label to the nearest gutter and orders labels to avoid crossings. `overlay.json` overrides single labels.
- **Visibility:** all, by group, or single callouts. The choice is kept in the URL and in local storage.
- **Accessibility:** labels are decorative. Each control's accessible name already includes its callout number and printed label.

### Highlight and lesson API

A lesson is data. This sketch shows the shape.

```ts
interface Lesson { id: string; title: string; manualAnchor: string; steps: Step[] }

interface Step {
  text: string;
  highlight: ElementId[];
  expect?: Action;            // parsed from action notation
  view?: Partial<PanelView>;  // what the unit shows after this step
  advance: "manual" | "on-action";
}
```

`Action` is the parsed form of the manual's action notation, for example `hold B59 + turn E25` or `B1 ×3s`. One parser serves `docs-check` (notation in the manual is valid) and the lesson runner (the user did the expected thing).

## Dev panel

- **Label editor:** drag a label, see its override values, export `overlay.json`.
- **Debug outlines:** element boxes, anchors and group bounds.
- **State inspector:** current `PanelView` and the event log.
- **Reference underlay:** load a local image file behind the panel with an opacity slider. The file stays in the browser and never enters the repo.

## MIDI seams for G4

The engine talks to MIDI through one port interface. This sketch shows it.

```ts
interface MidiPort {
  send(bytes: Uint8Array): void;
  onMessage(listener: (bytes: Uint8Array, t: number) => void): () => void;
}
```

| Implementation | Works in | Use |
| --- | --- | --- |
| `BridgePort` | every browser, Safari included | WebSocket to a small local bridge process that owns the MIDI ports |
| `WebMidiPort` | Chromium, Firefox | direct, when the unit is on the same computer as the browser |
| `LoopbackPort` | tests | replays capture logs |

The bridge is the main transport. It also covers a unit that is plugged into a different computer from the browser.

### Known limits

- **Safari:** no native Web MIDI API. The WebKit tracking bug has been open since 2013; a third-party extension exists but can't be assumed.
- **Unit state:** what the BCR32 sends about its own state is undocumented. The unit session (P3) decides how exact a mirror can be.
- **SysEx:** no format is published. Import to the unit changes its memory and needs approval each time.
- **Bridge security:** the bridge binds to localhost by default. LAN use is opt-in and needs a token.

## Checks

| Tool | Proves |
| --- | --- |
| `privacy-check` | no personal-data pattern in staged or tracked files; reads extra patterns from a git-ignored local file |
| `docs-check` | front matter, links, anchors, control IDs, action notation, the language rules; glossary links come with the glossary |
| `coverage-check` | each item in the official-manual section map points to a manual anchor that exists; a document names each element |
| `gen-tables` | generated blocks in docs match device data (`--check` mode for CI) |

The section map lists the official manual's callouts, menus, tables and section titles with page numbers. When the local extract of the official manual is present, `coverage-check` also compares the map against the extract's headings to catch a missing item.
