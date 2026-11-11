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
| ZAQ Settings B8 | text contains a draft tag "<CHECK?>" | GATE = start trigger on ring; CLOCK = start on clock. Partly verified on firmware 1.0.3: B8 shows `SYN IN STRT` = GATE; CLOCK unseen |
| CTRL Settings + Global E28/E41 | "MIXED is selected using button 7 (Note Mute)" | B7 in Global Settings = Operation mode. Verified on firmware 1.0.3: B7 shows the operation mode (USB). MIXED is unseen |
| Erase | "25th encoder (50)" | E49 (all other ordinals in the source map n → E(24+n)) |
| §ZAQ mode | NOTE LENGTH values printed inside the CHORD list | lengths listed in §5 |
| Chord list | one printed line "Major 7th with flat 5th, 6th, 7th" (checked on the page image; the text extract only looks garbled) | possibly three entries; unverified |
| α targets | "CC0– 27" | CC 0–127 |
| LOAD | "buttons 63 & 63" | 63 & 64. Verified on firmware 1.0.3: B64 pages up, B63 pages down |
| MIDI out list E41… | garbled with transpose list; "Input channel" appears | "Input channel" probably belongs to E32 |
| Copy pattern | ordering of presses unclear | test on the unit |
| Pattern chain | does not say which view (LOAD?) | probably LOAD view |
| User scale | "while in SCALE mode" not defined | while E30 is the active global control |
| Virtual keyboard / number pad | key-to-note and key-to-digit maps not given | piano layout inferred (§3.1). Tested on firmware 1.0.3: the keyboard sent nothing on USB, so no note map was read; open |
| Specifications | no spec page (power draw, size, weight) | unknown |
| Global Settings | manual lists 8 settings (panel buttons 1–8); firmware 1.0.3 lights 11 buttons (1–11) | Resolved on firmware 1.0.3: panel buttons 9 to 11 (B13 to B15) are pattern change channel, encoder acceleration and footswitch polarity. LED luminosity has no button |
| CTRL Settings | manual lists 2 items (B5, B6); firmware 1.0.3 has a third | Verified on firmware 1.0.3: B7 is `ECHO deadtime` (100ms seen). Not in the manual |

Procedures that depend on a row in this table are unconfirmed until someone tests them on a unit. Record test results in the row and in the [changelog](../../CHANGELOG.md).
