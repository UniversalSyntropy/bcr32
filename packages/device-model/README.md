---
title: device-model package
description: Pure ring model, action parser and view types for the BCR32 panel.
status: draft
last_updated: 2026-11-14
---

# @bcr32/device-model

Pure model of the BCR32 panel. It holds the ring model, the action parser and the view types. This package is private and not published.

## Purity rule

The code in `src/` has no side effects. It reads no file, clock, network or screen. It imports only relative paths, `@bcr32/device-data` and `zod`. A test enforces this.

## Exports

| Export | Use |
| --- | --- |
| `ringLit` | Gives the lit LEDs of one ring from its style, value and range. |
| `RING_RULES` | Maps each of the 13 style IDs to its rule. |
| `parseAction` | Parses an action text. It returns an action or an error with an offset. |
| `elementIndex` | Builds the element index that `parseAction` needs. |
| `ViewPatch` | Zod schema of the `after` field of a guide step. |
| `checkGuideActions` | Checks that each guide action parses and names one control. |
| `checkGuideAfter` | Checks each `after` patch against the schema and the data. |
| Types | `ControlEvent`, `PanelView`, `RingState`, `DisplayState` and the style and mode names. |

## Examples

```ts
import { elementIndex, parseAction, ringLit } from "@bcr32/device-model";

// 15 flags. Value 63 of 127 lights LED 6.
ringLit({ style: "1dot", encMode: "absolute", value: 63, min: 0, max: 127 });

// { ok: true, action: { kind: "combo", ... } }
parseAction("hold B59 + press B61", elementIndex(data));

// { ok: false, error: "'push' is for an encoder, 'B5' is a button", at: 5 }
parseAction("push B5", elementIndex(data));
```

## Limits

- `encMode` is carried and not read in version 2.
- The ring rules come from one photo. They are unverified on a unit.
- The package has no engine and no panel. Event matching comes in a later batch.
