# Changelog

Notable changes to the documentation and tools. Newest first. Dates are ISO 8601.

## 2026-11-11

- Added the recovery runbook (`docs/guides/recovery-runbook.md`): six recovery steps, least invasive first, with what the vendor documents and what stays unknown. Draft for the owner's review; nothing in it was tried on a unit.
- Added four check tools in `tools/`: `privacy-check`, `docs-check`, `coverage-check` and `gen-tables`. `npm run check` and CI run them. `npm run hooks` installs git hooks that stop a commit with personal data.
- Added the section map of the official manual in `data/devices/bcr32/section-map.json`: 36 parts with page numbers, each with the heading that covers it.
- Added BCR32 mode, value and function data in `data/devices/bcr32/`: 17 modes and menus, 56 value sets, 142 functions (data version 0.2.0). Each record names its source. A test compares the data with the tables of the reference.
- Documentation now follows Simplified Technical English rules, based on ASD-STE100. The rules are in the contributing guide. Existing documents change to the rules when they are next edited.
- Added BCR32 element data in `data/devices/bcr32/`: 85 callouts, 88 elements, 15 groups, printed labels and label colours (data version 0.1.0). Label colours come from the manual's illustration and are not checked on a unit.
- Added the device data schema in `packages/device-data`: Zod schemas, a loader with cross-file checks, generated JSON Schema files in `data/schema/` and the `npm run validate:data` command. No device data yet.
- Added the npm workspace, TypeScript configuration and a CI workflow that runs markdownlint, the type check and the tests. `npm run check` runs the same checks locally.
- Verified on firmware 1.0.3: Control Tribe's "stop the sequencer" message before Device Settings is a confirmation; press OK. Rewrote the troubleshooting entry and listed the Device Settings items, three of which the official manual omits.
- Verified on firmware 1.0.3: Global Settings lights 11 buttons, three more than the official manual lists; button 7 shows the firmware version. Added an errata row.
- Added the playbook and live status page in `docs/project/`, including a planned MIDI implementation reference.
- Added the project plan, architecture note and decision log in `docs/project/` (design only; nothing built). The plan includes separate manual errata and known-issues registers.
- Added the structured reference for the full English section of the official manual V2.0, with a "Source errors and gaps" table (13 entries).
- Added the guide for connecting to Ableton Live (unverified).
- Added troubleshooting for Control Tribe's "stop the sequencer" message (unverified).
- Added licenses: CC BY 4.0 for documentation, MIT for code.
- Added the contributing guide with privacy rules and the documentation standard.
