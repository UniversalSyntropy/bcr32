---
title: 15. Known issues
description: "Chapter 15 of the BCR32 manual: faults and limits of the unit and its editor software, from our own unit tests and from user reports. Each row has a source, a firmware version and a status."
status: draft
last_updated: 2026-11-11
source: Unit session on firmware 1.0.3 (2026-11-11); user reports on public pages, checked 2026-11-11
---

# 15. Known issues

This chapter lists faults and limits of the unit and of its editor software. It is not the list of errors in the official manual. That list is [chapter 12](12-source-errors-and-gaps.md).

## How to read the register

- **Own test:** we saw it on our own unit. The row names the [firmware](13-glossary.md#firmware) version.
- **User report:** a person wrote it on a public [page](13-glossary.md#page). We did not test it. We name no person, only the page and the date.
- **Firmware:** the version that the source states. "Not stated" means the source gives none.
- **Newest firmware named:** 1.0.3. We found no release notes and no newer version.

| Status | Meaning |
| --- | --- |
| Open | seen, and no fix or cause is known |
| Unconfirmed | one report, or reports that disagree; we did not reproduce it |
| Limit | the unit or the software does not offer the function |
| Workaround | a reported [step](13-glossary.md#step) avoids the fault |
| Resolved | a source says the fault is fixed |

## Register

| ID | Symptom | Firmware | Source | Date | Reliability | Status | Workaround |
| --- | --- | --- | --- | --- | --- | --- | --- |
| K1 | The panel export (STORE, hold [SEL](13-glossary.md#select-encoder-sel), push the knob printed 1 (E25), then the knob printed 5 (E29)) shows "export mode". The unit then sends nothing on USB | 1.0.3 | own test, [findings](../reference/capture-findings.md#backup-exports-step-42) | 2026-11-11 | own test | Open | Export with the vendor editor |
| K2 | B5 sent no message in the first test run and [CC](13-glossary.md#control-change-cc) 65 in the second. The cause is unknown | 1.0.3 | own test, [findings](../reference/capture-findings.md#midi-facts) | 2026-11-11 | own test | Open | none |
| K3 | A push of the knob printed 1 (E25) sent no message. The push may be unassigned, or it needs a firmer push | 1.0.3 | own test, [findings](../reference/capture-findings.md#midi-facts) | 2026-11-11 | own test | Open | none |
| K4 | Turning two or more [encoders](13-glossary.md#encoder) at the same time can make the unit fall behind. One report adds a "Controller Overload" message on the [display](13-glossary.md#display-disp), once | not stated | Thomann reviews; Elektronauts thread, page 11 | 2026-10-30, 2026-11-07 | community, multiple | Unconfirmed | none reported |
| K5 | The LED display lags while the sequencer runs | not stated | Elektronauts thread, page 11 | 2026-10-04 | community, single | Unconfirmed | none reported |
| K6 | The computer or the editor does not find the unit. On Windows 11 one reviewer fixed this with the editor menu Help, Repair Driver | not stated | Elektronauts thread, page 10; Thomann reviews | 2026-09-25, 2026-09-29 | community, multiple | Workaround | Repair Driver in the editor, as one reviewer reports |
| K7 | The editor cannot copy and paste the settings of a single knob | 1.0.3 | Elektronauts thread, page 12 | 2026-11-09 | community, single | Unconfirmed | none |
| K8 | The editor has no tool for note [patterns](13-glossary.md#pattern), pitches or velocities. One reviewer could not tell how patterns are saved | not stated | Thomann reviews | 2026-10-30 | community, single | Limit | none; see the [web UI references](../project/web-ui-references.md) for a community tool |
| K9 | [SysEx](13-glossary.md#sysex) input works only when the user copies BCR2000 messages to the unit, says one reviewer. A second reviewer says SysEx in and out work | not stated | Thomann reviews | 2026-09-25, 2026-10-30 | community, multiple, conflicting | Unconfirmed | none |
| K10 | Reports of play in the encoders disagree. One reviewer reports about 1.5 mm each way. Another finds no play | not stated | Elektronauts thread, page 10; Thomann reviews | 2026-09-27, 2026-10-30 | community, multiple, conflicting | Unconfirmed | none |
| K11 | The manual was not online at launch | not stated | Elektronauts thread, page 10; Thomann reviews | 2026-09-25 to 2026-09-28 | community, multiple | Resolved | The manual Rev1 was posted 2026-09-28 |
| K12 | Reviewers call the manual hard to follow. One example is the MIDI channel set-up in three sections | not stated | Thomann reviews | 2026-10-30 | retailer reviews, multiple | Unconfirmed | Use this manual and chapter 12 |
| K13 | The press article says the launch firmware was weak. One reviewer says later updates fixed most faults and added encoder acceleration. No source names the faults | not stated | Synth Anatomy article; Thomann reviews | 2026-10-30, 2026-09-25 | press and retailer review | Unconfirmed | Update the firmware with the vendor editor |
| K14 | The QR code on the box led to a missing page. No source says that it was fixed | not stated | Elektronauts thread, page 10; Thomann reviews | 2026-09-25 to 2026-09-27 | community, multiple | Unconfirmed | Use the manual from the vendor product page |

## Claims that we could not confirm

We opened the sources again on 2026-11-11. These claims do not stand:

- **Fast-cut lag of about 50 ms:** the post says "faders", and the BCR32 has none. The thread also discusses another controller.
- **No [DIN MIDI](13-glossary.md#din-midi) output routing:** the claim came from a search snippet. We found no page.
- **Windows update fault:** we found no source for a named Windows update.
- **Unprinted functions under the knobs:** we did not find the post again.

## Sources

| Source | Address |
| --- | --- |
| Elektronauts thread, pages 10 to 12 | `https://www.elektronauts.com/t/behringer-bcr32/145603` |
| Thomann product and reviews page | `https://www.thomann.de/be/behringer_bcr32.htm` |
| Synth Anatomy article | `https://synthanatomy.com/2026/10/behringer-bcr32-bcr2000-midi-controller-comeback-with-built-in-zaquencer.html` |
| Vendor product page | `https://www.behringer.com/en/products/0715-AAW` |

User reports can be wrong. A row in "Unconfirmed" needs a test on a unit before anyone relies on it. Report a new issue with the correction issue template.
