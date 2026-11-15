---
title: Guide data files
description: Folder for the step data of guides. One JSON file per guide, checked against the guide schema and by guide-check.
status: draft
last_updated: 2026-11-15
---

# Guide data files

This folder holds one JSON file per guide. Three guides exist. All three are unverified, except the action and result of the last step of `all-steps-length`.

| File | Guide document | Steps |
| --- | --- | --- |
| [store-pattern.json](store-pattern.json) | [Save, load and chain patterns](../save-load-and-chain-patterns.md) | 4 |
| [choose-clock.json](choose-clock.json) | [Sync the sequencer to a DAW or hardware](../sync-the-sequencer-to-a-daw-or-hardware.md) | 3 |
| [all-steps-length.json](all-steps-length.json) | [Enter and play your first pattern](../enter-and-play-your-first-pattern.md) | 2 |

- **Player:** the web panel plays a guide with `?guide=<id>`. Add `&step=<n>` to start at a step.
- **Schema:** [guide.schema.json](../../../data/schema/guide.schema.json). The Zod source is `packages/device-data/src/schema.ts`.
- **File name:** the file name without `.json` equals the `id` field in the file.
- **Text:** a caption names each control with a token such as `{B59}`. The tool expands it to the printed legend and the ID. A caption has 20 words or fewer. An `expect` or `warn` text has 25 words or fewer.
- **Link from the document:** the guide document has the line ``Interactive version: `?guide=<id>` (N steps).`` The check fails when the id or the step count differs.
- **Check:** `npm run check:guides` runs [guide-check](../../../tools/guide-check/README.md). `npm run check` runs it.
- **Licence:** [CC BY 4.0](../../../LICENSE-docs), as for the other files under `docs/`.
