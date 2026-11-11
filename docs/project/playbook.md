---
title: Playbook and live status
description: The one task list for the project, with the current step, what is done, what remains and the handover notes.
status: draft
last_updated: 2026-11-11
---

# Playbook and live status

This is the one place that shows the steps, where the work is, and how many steps remain. Update it when a step closes, in the same commit as the work.

The [project plan](plan.md) explains why; this page tracks what and when.

## Now

| Field | Value |
| --- | --- |
| Release in progress | R1, approved 2026-11-11, started 2026-11-11 |
| Current step | none (2.2 closed on branch `r1b/p2-source-pass-14-25`, not merged) |
| Next step | 2.3 Source pass, pages 26–35 (R1b) or 4.1 Capture tool (R1c) |
| R1 progress | 13 of 27 steps done, 14 remain |
| Tokens used in R1 | about 350k of 1,100k (approved 2026-11-11) |
| Blocked on | nothing. The repo is public since 2026-11-11 |
| Last updated | 2026-11-11 |

## Status key

| Mark | Meaning |
| --- | --- |
| ☐ | not started |
| ▶ | in progress |
| ✅ | done and its gate passed |
| ⛔ | blocked; the reason is in the notes column |

## Done before R1

| Step | Outcome | Status |
| --- | --- | --- |
| 0.1 | Draft reference for the full official manual, 13 errata rows | ✅ |
| 0.2 | Plan, architecture note, decision log, this playbook | ✅ |

## R1a: checked draft, ready to publish (11 steps, 335k)

Goal: prove the current draft with data, checks and a unit session, so the repo can go public early.

### P1: foundations

| Step | Task | Goal | Gate | Est. | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1.1 | Workspace and CI | npm workspace, TypeScript, markdownlint, one CI workflow | CI green | 40k | 40k | ✅ | branch `r1a/p1-foundations`; the four check tools join CI in step 1.5 |
| 1.2 | Schema | Zod schema, generated types and JSON Schema | a broken data file fails | 40k | 35k | ✅ | 22 broken-data cases fail; geometry fields are optional until R2 |
| 1.3 | Element data | 85 callouts, 88 elements, groups, labels, colours | count check | 20k | 20k | ✅ | label colours come from the manual's illustration; not checked on a unit |
| 1.4 | Mode and function data | modes, functions, value sets with source labels | cross-check against the reference | 50k | 45k | ✅ | 17 modes, 56 value sets, 142 functions; sources cite reference sections until the page pass in steps 2.2 and 2.3 |
| 1.5 | Check tools | privacy-check, docs-check, coverage-check, gen-tables | planted-fault tests | 50k | 180k | ✅ | above the estimate: see the handover note; 66 tool tests, 10 rules switched off in turn |
| 1.6 | P1 verification | rerun every check, read the diff, hand over | all green | 40k | 20k | ✅ | P1 merged to `main`; P1 used about 245k more than the 105k of steps 1.1 to 1.3 |

### P3: unit session

| Step | Task | Goal | Gate | Est. | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3.0 | Recovery runbook | factory restore, firmware reinstall and recovery-mode facts from official sources; rules in the [unit safety protocol](unit-safety.md) | runbook reviewed by the owner before any message is sent | 15k | not measured | ✅ | [runbook](../guides/recovery-runbook.md) reviewed once by Opus, accepted by the owner 2026-11-11; its facts are unverified until tried; PLAY/STOP confirmed STOP |
| 3.1 | Session script | ordered test list: firmware version, 13 errata rows, MIDI capture | owner can follow it without help | 15k | not measured | ✅ | [script](../guides/unit-session-script.md) read and accepted by the owner 2026-11-11; tier 0 only, tier 1 test D1 blocked until the backup exists; 7 of 13 errata rows need tier 2 and wait; Part D waits for the backup |
| 3.2 | Session at the unit | run the script; about 1 hour of owner time | every test has a result | 25k | not measured | ✅ | run 2026-11-11 on firmware 1.0.3; tests A1 to A7, H1, H2 passed; H3 partial; D1 blocked; 15 photos plus 7 burst frames; results in `local/session-results.md` |
| 3.3 | Record results | errata rows updated, capture findings note, MIDI facts data file | docs-check | 30k | not measured | ✅ | [findings](../reference/capture-findings.md); `midi.json` with schema and 12 tests; Global Settings and CTRL Settings corrected; legend colours not changed, see the findings page |
| 3.4 | Publish checklist | full-history leak scan, whole-tree privacy check, licence and trademark notes, correction issue template, repo description and topics, draft announcement text | checklist all passed | 10k | not measured | ✅ | [checklist](publish-checklist.md): all checks passed; 5 decisions wait for the owner (P1 to P5) |

## R1b: complete manual (9 steps, 530k)

Step 2.7 starts from a web research pass on official downloads, technical data, images, diagrams and user reports. Its notes are held outside the tracked tree until reviewed.

Goal: every control, mode, menu, value and procedure, with a glossary, three indexes and two issue registers.

| Step | Task | Goal | Gate | Est. | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2.1 | Restructure | one file per chapter in `docs/manual/` | docs-check, no broken links | 50k | about 35k | ✅ | [manual index](../manual/README.md); 13 chapter files (0 to 12); the old reference file is removed; section map, tests and links point at the chapters; branch `r1b/p2-restructure`, not merged |
| 2.2 | Source pass, pages 14–25 | sequencer and settings re-read against page images | coverage-check for those pages | 100k | about 70k | ✅ | read the text of pp. 14–25 against chapters 2 to 9 and 12, plus the page images of pp. 16–19; 10 corrections or additions; 211 data `ref` values now cite manual pages; branch `r1b/p2-source-pass-14-25`, not merged |
| 2.3 | Source pass, pages 26–35 | controller tables entered in full | coverage-check for those pages | 90k | | ☐ | |
| 2.4 | Quick start and tasks | quick start, "how do I" chapter | docs-check | 60k | | ☐ | |
| 2.5 | Glossary | terms, first-use links in every file | docs-check glossary rule | 40k | | ☐ | |
| 2.6 | Generated tables and indexes | control tables, three indexes, `llms-full.txt` | gen-tables check | 40k | | ☐ | |
| 2.7 | Known issues | research user reports, build the register | every row has source, firmware, status | 60k | | ☐ | |
| 2.9 | Panel diagrams | text-grid diagrams of the top and rear panels with callout numbers, our own drawing | docs-check | 20k | | ☐ | added 2026-11-11 |
| 2.8 | Review and close | full coverage proof, one review, hand over | all checks green | 70k | | ☐ | |

## R1c: MIDI implementation reference (7 steps, 235k)

Goal: map and log every MIDI message the unit sends and accepts, per function, including the messages used to set up, control and edit its settings. No official chart exists, so every row comes from capture and carries a firmware version.

R1c can run beside R1b. Steps 4.5 and 4.6 are time-boxed: they report what the evidence supports and stop at their estimate.

| Step | Task | Goal | Gate | Est. | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 4.1 | Capture tool | `tools/midi-capture`: lists ports, logs timestamped messages to a file, sends test messages | logs a known message correctly | 40k | | ☐ | must run in the desktop session of the unit's computer; a remote shell sees no MIDI ports |
| 4.2 | Backup | SysEx export of all sequencer and controller memory, kept local only | export file saved and non-empty | 10k | | ☐ | needs the owner; done before any test that writes |
| 4.3 | Outbound map | every button and encoder in both modes, transport, clock, pattern load, footswitch | each of 88 elements has a result row | 40k | | ☐ | needs the owner, about 45 minutes |
| 4.4 | Inbound map | identity request, clock, start and stop, transpose notes, pattern-switch CC, program change | each test has a result row | 30k | | ☐ | |
| 4.5 | Editor protocol | messages between the vendor editor and the unit for each settings page; observed, never re-sent | time-boxed; findings recorded | 65k | | ☐ | observation only; no memory writes without the backup |
| 4.6 | SysEx dump structure | layout of the export files as far as the evidence shows | time-boxed; findings recorded | 30k | | ☐ | |
| 4.7 | Publish the map | MIDI implementation chapter, `midi.json`, a MIDI column in the manual's function tables | docs-check, schema | 20k | | ☐ | |

## Later releases

Steps for these are written out when the release is approved.

| Release | Contains | Est. | Status |
| --- | --- | --- | --- |
| R2 | Web panel, label overlay, guided steps (P4, P5) | 990k | ☐ |
| R3 | BCR2000 and Zaquencer lineage section (P6) | 300k | ☐ |
| R4 | Docs site with the panel embedded (P7) | 150k | ☐ |
| R5 | Engine and live mirror (P8) | re-estimate after R1 | ☐ |

## Waiting on the owner

| Item | Needed for | Status |
| --- | --- | --- |
| Go for R1 at 1,100k tokens (R1a 335k, R1b 530k, R1c 235k) | step 1.1 | approved 2026-11-11 |
| Run one command in Terminal on the unit's computer | steps 3.2, 4.2–4.5 | open |
| DIN MIDI interface | DIN port tests in 4.3 and 4.4 | none available; DIN rows are marked untested |
| Multimeter with standard probes, plus a 3.5 mm cable to reach the jack contacts | CV and gate checks in 3.2 | available; owner fetches it before step 3.2 |
| Review of the recovery runbook | after step 3.0 | agreed |
| About 1 hour at the unit | step 3.2 | agreed |
| Decision to make the repo public | after step 3.4 | done 2026-11-11 |

## Handover notes

Newest first. One entry per session: what closed, what is next, anything the next session must know.

### 2026-11-11, step 2.2

- **Closed:** step 2.2 on branch `r1b/p2-source-pass-14-25`. Nothing was sent to the unit. Not merged, not pushed.
- **Proved:** `npm run check` passes (data valid, docs-check clean, coverage-check 0 findings, privacy clean).
- **Found:** the chapters match the manual on pp. 14–25 in nearly every row. Corrections and additions: clock out applies only with the internal clock (E27); MIDI thru notes for source Off and MIXED (E28); note display ranges (E29); E37 to E40 default "Chord" is inferred, not in the manual; ZAQ Settings confirm and exit; CV calibration number pad colours; the three 14-bit relative encoder modes with values. The chord line "Major 7th with flat 5th, 6th, 7th" is one printed line; the garbling was the text extractor.
- **Changed:** each `source.ref` in `modes.json`, `functions.json` and `values.json` now names manual pages and the chapter, for example `manual pp. 18–19, ch. 5`.
- **Next:** step 2.3 (pages 26–35) or step 4.1. The owner picks.
- **Know this:** page images were read only for pp. 16–17 and the chord list. Pages 14–15 (hook-up) and 24–25 were checked from text. Cross-references in chapters still say `§5`; they mean chapter 5.

### 2026-11-11, step 2.1

- **Closed:** step 2.1 on branch `r1b/p2-restructure`. Nothing was sent to the unit. Not merged, not pushed.
- **Proved:** `npm run check` passes (111 tests, docs-check clean on 40 files, coverage-check 0 findings, privacy clean).
- **Changed:** `docs/reference/bcr32-reference.md` is now 13 files in `docs/manual/`, named `NN-title.md`, plus a `README.md` index. Headings moved up one level; anchors are unchanged. The section map anchors, two tests and all links point at the chapters.
- **Next:** step 2.2 (source pass, pages 14–25) or step 4.1. The owner picks.
- **Know this:** the chapter files follow the language rules, so `docs-check` holds them to the sentence and contraction limits. Only `docs/manual/README.md` stays in `ste-pending.txt`. `capture-findings.md` stays in `docs/reference/`.

### 2026-11-11, publish

- **Done:** the branch merged to `main` (fast-forward) and was pushed. The owner made the repo public. Description, 10 topics, branch protection (required check `check`, no force push, no deletion; admin bypass on) and private vulnerability reporting are set.
- **Checked signed out:** the repo page and README return 200, CI is green on 08df28e. No photo or image was ever committed.
- **Decided:** the trademark notice names no legal entity (commit 08df28e). P1 to P5 are closed by the owner's go. The announcement is not posted.
- **Next:** step 2.1 (R1b) or step 4.1 (R1c). Both need the owner's pick.
- **Know this:** the repo is public, so every push is public. Work on a branch; merge to `main` on the owner's go.

### 2026-11-11, step 3.4

- **Closed:** step 3.4 on branch `r1a/p3-unit-session`. Nothing was sent to the unit. Label colours unchanged.
- **Proved:** the history scan (21 commits, patches, messages, authors) found only two no-reply addresses. The tree scan is clean. No image, SysEx or secret was ever committed.
- **Added:** the [publish checklist](publish-checklist.md), the [announcement draft](announcement-draft.md), the correction issue template. The README now states MIT for `packages/` and `data/`.
- **Next:** the owner decides P1 to P5 in the checklist (done, see the publish entry above).
- **Know this:** the public repo shows the GitHub account name.

### 2026-11-11, step 3.3

- **Closed:** step 3.3 on branch `r1a/p3-unit-session`. Nothing was sent to the unit.
- **Proved:** `npm run check` passes: 111 tests, data valid (145 functions), docs-check clean.
- **Added:** the [findings page](../reference/capture-findings.md), `data/devices/bcr32/midi.json` with its schema (data version 0.3.0), three Global Settings functions (B13 to B15), one CTRL Settings function (B7) and corrected reference rows. The errata table has 14 rows.
- **Next:** step 3.4, the publish checklist. It ends with the owner's publish decision.
- **Know this:** the photos show white legends on B5 to B20. The data holds coloured legends from the manual's illustration. The data is unchanged until a close photo check. The control-to-message map in `midi.json` is marked "likely" and waits for step 4.3.

### 2026-11-11, step 3.2

- **Closed:** step 3.2. The owner ran the [session script](../guides/unit-session-script.md) on firmware 1.0.3. Nothing was sent to the unit. The unit ended in ZAQ mode, stopped.
- **Proved:** every test has a result, kept in `local/session-results.md`. The unit stayed normal after the session.
- **Found:** the Global Settings list has 11 settings. The extra three are the pattern-change channel (printed 9), encoder acceleration (10) and footswitch polarity (11). LED luminosity has no button. CTRL Settings has a third item, ECHO deadtime (printed 3). Product ID is `12CF` in application mode. LOAD paging is B63 down and B64 up. Sync-in start shows GATE.
- **MIDI:** CTRL mode sends controller changes on port "BCR-32 CTRL", channel 1 (CC 97, 65, 66, 98). ZAQ mode and transport send nothing on USB. The mapping of control to message is not proven; step 4.3 maps it.
- **Mistake to avoid:** the script named buttons by ID and the unit prints numbers 1 to 16. The owner pressed printed 4 and 8 (CV1 measure and factory restore) and left each with B1, with no change. The script now has a table of both numbers.
- **Next:** step 3.3. Update the errata rows, write the capture findings note, and make the MIDI facts data file. Move label and lit colours from the manual to the unit source where the photos show them.
- **Know this:** flashing LEDs mean a selected mode for STORE, LD/LRN, INST SEL and MIXER. P13 and P14 do not show them. The photos are in `local/photos/` and stay there.

### 2026-11-11, step 3.1

- **Closed:** step 3.1. The owner accepted the [session script](../guides/unit-session-script.md) on branch `r1a/p3-unit-session`.
- **Proved:** `npm run check` passes. Nothing was sent to the unit.
- **Next:** step 3.2, the session at the unit. It needs the owner for about 1 hour.
- **Know this:** the script uses tier 0 only. Test D1 (identity request) is blocked until the backup exists, and it needs the tool from step 4.1. Five errata rows get a test, seven wait for tier 2, and the erase row is not tested. Running steps 4.1 and 4.2 before 3.2 would open the blocked tests.

### 2026-11-11, step 3.0

- **Closed:** step 3.0. The owner accepted the [recovery runbook](../guides/recovery-runbook.md) on branch `r1a/p3-unit-session`.
- **Proved:** one Opus review found five damage risks and several unsupported claims; all are fixed. `npm run check` passes. Nothing was sent to the unit.
- **Next:** step 3.1, the session script.
- **Know this:** the bootloader facts come from demo firmware and are unverified for production. Factory restore on firmware 1.0.3 may not be on B12, so read the display. Procedures 3 and 4 need the owner's yes for each session. The owner confirmed the sequencer is stopped (PLAY/STOP unlit).

### 2026-11-11, step 1.6, P1 closed

- **Closed:** step 1.6 and phase P1. The branch `r1a/p1-foundations` is merged to `main`.
- **Proved:** `npm run check` passes: markdownlint, type check, 99 tests, schema, data, generated tables, documentation standard, manual coverage, privacy. CI is green. All tool code was read after the build.
- **P1 acceptance:** a broken data file fails; the data holds 85 callouts and 88 elements; each control ID in the documents is in the data; `privacy-check` fails on a planted host name, IP address and home path.
- **Next:** step 3.0, the recovery runbook. The owner reviews it before any message goes to the unit.
- **Know this:** P1 used about 350k tokens against 240k. The R1 total stays at 1,100k until the owner changes it; re-estimate the tool steps 2.6 and 4.1 before they start.

### 2026-11-11, step 1.5

- **Closed:** step 1.5. The four tools are in `tools/`, and `npm run check` and CI run them.
- **Proved:** each rule has a planted-fault test. Ten rules were switched off in turn and their tests failed. In the repo, a commit with a planted host name and IP address was blocked.
- **Estimate:** the step used about 180k tokens against 50k. A builder agent used 120k of that for `privacy-check` and `docs-check`. The estimate did not count four tools with tests as four builds.
- **Next:** step 1.6, P1 verification and the merge to `main`. The run stopped here because step 1.5 passed its estimate by more than 50 percent.
- **Know this:** `npm run hooks` installs the git hooks on a new clone. `tools/docs-check/ste-pending.txt` lists 11 documents that do not yet follow the language rules. The section map (`section-map.json`, 36 parts) points at the reference; step 2.1 moves the anchors to the manual chapters. The extract rule of `coverage-check` runs only where the local extract is present.

### 2026-11-11, step 1.4

- **Closed:** step 1.4. `data/devices/bcr32/` holds `modes.json`, `values.json` and `functions.json`.
- **Proved:** a test reads the tables of reference sections 2, 5, 6 and 9.1. Four planted gaps in the data each failed the test.
- **Next:** step 1.5, the four check tools.
- **Know this:** each `source.ref` cites a section of the reference, not a page of the official manual. Steps 2.2 and 2.3 add the pages. The lit buttons of Global Settings carry the source `unit`; all other lit colours come from the manual.

### 2026-11-11, step 1.3 and the language rule

- **Closed:** step 1.3. `data/devices/bcr32/` holds `device.json` and `elements.json`; the count test passes.
- **Added rule:** documentation follows Simplified Technical English (decision D60). The rules are in the contributing guide.
- **Next:** step 1.4, mode and function data.
- **Know this:** element records carry no lit colours and no ring LED count, because the manual does not give them per element. Lit colours go in `modes.json`. Step 1.5 adds the language checks to `docs-check`. Steps 2.1 to 2.8 change the existing documents to the language rules.

### 2026-11-11, step 1.2

- **Closed:** step 1.2. Schemas, loader, JSON Schema files and the validate command are in `packages/device-data`.
- **Proved:** 22 broken-data cases each fail with the expected message. Two validator rules were switched off in turn and their tests failed.
- **Next:** step 1.3, element data in `data/devices/bcr32/`.
- **Know this:** `overlay.json` has no schema yet; it arrives with geometry in R2. The JSON Schema files carry no absolute URL until the repo is public.

### 2026-11-11, step 1.1

- **Closed:** step 1.1. The workspace, TypeScript configuration and CI workflow are on branch `r1a/p1-foundations`; CI is green.
- **Proved:** a planted type error, a planted failing test and a planted Markdown fault each failed their check.
- **Next:** step 1.2, the Zod schema in `packages/device-data`.
- **Know this:** P1 work stays on the branch and merges to `main` at step 1.6. One moderate advisory remains in a linter dependency (development only); decision D59 holds the pin.

### 2026-11-11

- **Unit probe (read-only):** the unit is present on USB as "Behringer BCR-32", vendor 0x1397, device release 2.02 in the USB descriptor. Whether 2.02 equals the firmware version is unconfirmed until the display is read.
- **Firmware version read from the display:** 1.0.3. The USB descriptor's 2.02 is not the firmware version.
- **USB MIDI ports on firmware 1.0.3:** "BCR-32 CTRL" and "BCR-32 ZAQ". An idle unit sends no clock or other messages.
- **Resolved:** the vendor editor's "stop the sequencer" message before Device Settings is a confirmation dialog; OK opens the page. Recorded in the troubleshooting guide.
- **First decoded message:** the unit sends its controller preset names as SysEx when the editor opens the controller area. Notes are held locally until the MIDI reference steps.
- **Limit found:** a remote shell on the unit's computer sees no MIDI ports. Capture must run in the desktop session.

- **Closed:** steps 0.1 and 0.2.
- **Next:** step 1.1, after the owner's go.
- **Know this:** panel geometry is not part of R1; it moves to R2. The firmware version is still unread and is the first test in step 3.2.

## How to keep this page current

1. Set a step to ▶ when it starts and update the "Now" table.
2. When its gate passes, set ✅, fill "Actual", and update the progress count.
3. If a step passes its estimate by 50 percent, set ⛔, write the reason, and stop.
4. At the end of each session, add a handover entry and commit.
5. Put new ideas in the [parking file](parking.md), not in this list.

## Standing rules

- **Language:** all documentation follows the Simplified Technical English rules in the [contributing guide](../../CONTRIBUTING.md#simplified-technical-english). Change an existing document to the rules when you edit it.
- **Unit safety first:** every unit step follows the [unit safety protocol](unit-safety.md). Backup and recovery knowledge come before any message to the unit.
- **Leak guard, three layers:** local git hooks block a commit or push that holds a personal-data pattern; CI runs `privacy-check`; the publish checklist scans the full history.
- **Online material:** images and diagrams found online are linked and recorded in a sources table, never copied into the repo.
- **Official manual updates:** when a new official manual version appears, compare it with the section map, update changed facts and close errata rows it fixes.
- **Firmware updates:** recheck open known-issue rows and record the result.
