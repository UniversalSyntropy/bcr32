---
title: 12. Source errors and gaps
description: Chapter 12 of the BCR32 manual: Source errors and gaps.
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# 12. Source errors and gaps

| Location | Issue | Working assumption |
| --- | --- | --- |
| [ZAQ Settings](13-glossary.md#zaq-settings) B8 | text contains a draft tag "<CHECK?>" | [GATE](13-glossary.md#gate) = start trigger on ring; CLOCK = start on clock. Partly verified on [firmware](13-glossary.md#firmware) 1.0.3: B8 shows `SYN IN STRT` = GATE; CLOCK unseen |
| [CTRL Settings](13-glossary.md#ctrl-settings) + Global E28/E41 | "MIXED is selected using button 7 (Note Mute)" | B7 in [Global Settings](13-glossary.md#global-settings) = [Operation mode](13-glossary.md#operation-mode). Verified on firmware 1.0.3: B7 shows the operation mode (USB). MIXED is unseen |
| Erase | "25th [encoder](13-glossary.md#encoder) (50)" | E49 (all other ordinals in the source map n → E(24+n)) |
| §[ZAQ mode](13-glossary.md#zaq-mode) | NOTE LENGTH values printed inside the [CHORD](13-glossary.md#chord) list | lengths listed in §5 |
| Chord list | one printed line "Major 7th with flat 5th, 6th, 7th" (checked on the [page](13-glossary.md#page) image; the text extract only looks garbled) | possibly three entries; unverified |
| α targets | "CC0– 27" | [CC](13-glossary.md#control-change-cc) 0–127 |
| LOAD | "buttons 63 & 63" | 63 & 64. Verified on firmware 1.0.3: B64 pages up, B63 pages down |
| MIDI out list E41… | garbled with [transpose](13-glossary.md#transpose) list; "Input channel" appears | "Input channel" probably belongs to E32 |
| Copy [pattern](13-glossary.md#pattern) | ordering of presses unclear | test on the unit |
| Pattern chain | does not say which view (LOAD?) | probably LOAD view |
| User [scale](13-glossary.md#scale) | "while in SCALE mode" not defined | while E30 is the active global control |
| Virtual keyboard / number pad | key-to-note and key-to-digit maps not given | piano layout inferred (§3.1). Tested on firmware 1.0.3: the keyboard sent nothing on USB, so no note map was read; open |
| Specifications | no spec page (power draw, size, weight) | unknown |
| Global Settings | manual lists 8 settings (panel buttons 1–8); firmware 1.0.3 lights 11 buttons (1–11) | Resolved on firmware 1.0.3: panel buttons 9 to 11 (B13 to B15) are pattern change channel, encoder acceleration and [footswitch](13-glossary.md#footswitch) polarity. LED luminosity has no button |
| CTRL Settings | manual lists 2 items (B5, B6); firmware 1.0.3 has a third | Verified on firmware 1.0.3: B7 is `ECHO deadtime` (100ms seen). Not in the manual |
| LED options table (p. 26) | Sprd and Pan have the same description; the third column is headed MINIMUM/MAXIMUM and is empty | Sprd and Pan differ in a way the manual does not say; ignore the empty column. Test on the unit |
| Encoder modes | 14-bit absolute is "ABS_14" on p. 24, "A14" on pp. 28 to 32 and "A 14" on p. 32 | one mode; the data uses A14 |
| GS parameter lists | "Attack. Decay" printed with a full stop | two parameters, Attack and Decay |
| [MMC](13-glossary.md#mmc) parameter list (p. 34) | the list ends with a comma after "Out" and says "Location" | eight commands as printed; the list may be cut short; unverified |
| Note and [PB](13-glossary.md#pitch-bend-pb) tables | fields are named "Parameter (controller)" and "Value"; pitch bend has no controller number | note number and velocity for Note; the PB meaning is unknown; unverified |
| [PC](13-glossary.md#program-change-pc) tables | the parameter is named "bank number" | probably the program number; unverified |

Procedures that depend on a row in this table are unconfirmed until someone tests them on a unit. Record test results in the row and in the [changelog](../../CHANGELOG.md).
