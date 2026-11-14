---
title: Guide data files
description: Folder for the step data of guides. One JSON file per guide, checked against the guide schema.
status: draft
last_updated: 2026-11-14
---

# Guide data files

This folder holds one JSON file per guide. No guide file exists yet.

- **Schema:** [guide.schema.json](../../../data/schema/guide.schema.json). The Zod source is `packages/device-data/src/schema.ts`.
- **File name:** the file name without `.json` equals the `id` field in the file.
- **Check:** `loadGuides` in `@bcr32/device-data` checks each file. Every control ID in `focus` and in caption text must exist in the device data. `npm run check` does not call it yet. Batch B6 adds it.
- **Licence:** [CC BY 4.0](../../../LICENSE-docs), as for the other files under `docs/`.
