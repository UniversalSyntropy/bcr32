---
title: device-data package
description: Schema, loader and validation commands for the device data under data/devices/.
status: draft
last_updated: 2026-11-11
---

# device-data

The Zod schemas in `src/schema.ts` define every device data file. TypeScript types and the JSON Schema files in `data/schema/` come from them.

## Data files

Each device has one folder under `data/devices/`.

| File | Required | Holds |
| --- | --- | --- |
| `device.json` | yes | name, manual version, data version, callout and element counts, views, groups, colour names |
| `elements.json` | yes | one record per element: ID, callout, kind, group, printed labels, source |
| `modes.json` | no | modes and menus: how to enter and exit, which buttons light |
| `values.json` | no | named value sets: options, a numeric range, or both |
| `functions.json` | no | per mode and element: function name, value set, default |
| `glossary.json` | no | terms, definitions, aliases |
| `section-map.json` | no | the parts of the official manual, with the page and the heading in our documents that covers each one |

## Commands

Run these from the repo root. They need Node.js 24 or later.

| Command | Result |
| --- | --- |
| `npm run validate:data` | validates every folder under `data/devices/`; exits 1 and lists each issue when a file is wrong |
| `npm run gen:schema` | writes `data/schema/*.schema.json` from the Zod schemas |
| `npm run check:schema` | exits 1 when a JSON Schema file differs from the Zod schemas |

## What validation proves

- **Shape:** every field has the right type, and an unknown field is an error.
- **Source label:** every element, mode, value set and function names its source. A fact tested on a unit names the firmware version.
- **Counts:** the element count matches `device.json`, and every callout number has at least one element.
- **References:** views, groups, colours, modes, elements and value sets that a record names all exist.
- **Section map:** each item has one or more anchors, or a reason why the documents do not cover it. The `coverage-check` tool proves that each anchor exists.
- **Defaults:** a function's default is an option or lies inside the range of its value set.

The JSON Schema files cover shape only. Use `loadDevice` or `npm run validate:data` for the full check.

## Use from code

```ts
import { loadDevice } from "@bcr32/device-data";

const result = loadDevice("data/devices/bcr32");
if (!result.ok) console.error(result.issues);
```
