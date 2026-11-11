# Changelog

Notable changes to the documentation and tools. Newest first. Dates are ISO 8601.

## 2026-11-11

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
