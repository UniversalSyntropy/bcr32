# Changelog

Notable changes to the documentation and tools. Newest first. Dates are ISO 8601.

## 2026-11-11

- Verified on firmware 1.0.3: backup exports of sequencer and controller memory. Added the file layout, the repeat-export result and the panel export result to the findings page.
- Added two quick starts (sequencer and controller) and a task lookup to chapter 10 of the manual. The lookup gives key sequences and chapter links. The steps come from the manual and are unverified on a unit.
- Added a references page for web UI examples and for the public BCR32 editor `bcr32-studio`, with a note on which facts we checked.
- Added the `midi-capture` tool in `tools/midi-capture`. It lists MIDI ports, logs timestamped messages as JSON Lines, and sends test messages to loopback ports only. It has a selftest, tests and a README.
- Source pass on manual pages 26 to 35. Chapter 8.4 now holds the full setup tables for PC, CC, NRPN, Note, PB, AT, GS and MMC. It also holds the LED style table and the mode tables. Added six errata rows.
- Source pass on manual pages 14 to 25. Added the clock-out condition, MIDI thru limits, note display ranges, ZAQ Settings confirm and exit, CV calibration pad colours and the 14-bit relative encoder values. Corrected the chord list note. Data records now cite manual pages.
- Restructured the reference into the manual: 13 chapter files and an index in `docs/manual/`. Anchors are unchanged. Four sentences were shortened to meet the language rules. No fact changed.
- Added the publish checklist (`docs/project/publish-checklist.md`) with the full-history scan result, licence and trademark notes, repo description and topics. Added a correction issue template and a draft announcement. The README now states that `packages/` and `data/` are MIT.
- Verified on firmware 1.0.3: ran the unit session script. Added the findings page (`docs/reference/capture-findings.md`) and `data/devices/bcr32/midi.json` (USB IDs, two ports, four controller changes, one SysEx layout, four silent results). Added its schema and 12 tests (data version 0.3.0).
- Verified on firmware 1.0.3: Global Settings B13 to B15 are pattern change channel, encoder acceleration and footswitch polarity. CTRL Settings has a third item, echo dead time (B7). B63 and B64 page the LOAD view. B7 shows the operation mode. B8 in ZAQ Settings shows GATE. The errata table now has 14 rows; two are resolved or confirmed and three are partly confirmed.
- Added the unit session script (`docs/guides/unit-session-script.md`). It has 10 read and listen tests, a 15-shot photo list and one gated tier 1 test. A table maps the 13 errata rows to tests. Draft; nobody tried it on a unit.
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
