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
| Current step | none |
| Next step | 1.2 Schema |
| R1 progress | 1 of 27 steps done, 26 remain |
| Tokens used in R1 | about 40k of 1,100k (approved 2026-11-11) |
| Blocked on | nothing |
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
| 1.2 | Schema | Zod schema, generated types and JSON Schema | a broken data file fails | 40k | | ☐ | |
| 1.3 | Element data | 85 callouts, 88 elements, groups, labels, colours | count check | 20k | | ☐ | |
| 1.4 | Mode and function data | modes, functions, value sets with source labels | cross-check against the reference | 50k | | ☐ | |
| 1.5 | Check tools | privacy-check, docs-check, coverage-check, gen-tables | planted-fault tests | 50k | | ☐ | |
| 1.6 | P1 verification | rerun every check, read the diff, hand over | all green | 40k | | ☐ | |

### P3: unit session

| Step | Task | Goal | Gate | Est. | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 3.0 | Recovery runbook | factory restore, firmware reinstall and recovery-mode facts from official sources; rules in the [unit safety protocol](unit-safety.md) | runbook reviewed by the owner before any message is sent | 15k | | ☐ | first step of all unit work |
| 3.1 | Session script | ordered test list: firmware version, 13 errata rows, MIDI capture | owner can follow it without help | 15k | | ☐ | |
| 3.2 | Session at the unit | run the script; about 1 hour of owner time | every test has a result | 25k | | ☐ | needs the owner |
| 3.3 | Record results | errata rows updated, capture findings note, MIDI facts data file | docs-check | 30k | | ☐ | |
| 3.4 | Publish checklist | full-history leak scan, whole-tree privacy check, licence and trademark notes, correction issue template, repo description and topics, draft announcement text | checklist all passed | 10k | | ☐ | ends with the owner's publish decision |

## R1b: complete manual (9 steps, 530k)

Step 2.7 starts from a web research pass on official downloads, technical data, images, diagrams and user reports. Its notes are held outside the tracked tree until reviewed.

Goal: every control, mode, menu, value and procedure, with a glossary, three indexes and two issue registers.

| Step | Task | Goal | Gate | Est. | Actual | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2.1 | Restructure | one file per chapter in `docs/manual/` | docs-check, no broken links | 50k | | ☐ | |
| 2.2 | Source pass, pages 14–25 | sequencer and settings re-read against page images | coverage-check for those pages | 100k | | ☐ | |
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
| Decision to make the repo public | after step 3.4 | agreed; decided when the repo is ready |

## Handover notes

Newest first. One entry per session: what closed, what is next, anything the next session must know.

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

- **Unit safety first:** every unit step follows the [unit safety protocol](unit-safety.md). Backup and recovery knowledge come before any message to the unit.
- **Leak guard, three layers:** local git hooks block a commit or push that holds a personal-data pattern; CI runs `privacy-check`; the publish checklist scans the full history.
- **Online material:** images and diagrams found online are linked and recorded in a sources table, never copied into the repo.
- **Official manual updates:** when a new official manual version appears, compare it with the section map, update changed facts and close errata rows it fixes.
- **Firmware updates:** recheck open known-issue rows and record the result.
