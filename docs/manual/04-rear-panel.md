---
title: 4. Rear panel
description: Chapter 4 of the BCR32 manual: Rear panel.
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# 4. Rear panel

Left to right as seen from behind:

| ID | Jack | Type | Use |
| --- | --- | --- | --- |
| J69 | POWER | USB-C | power only |
| J70 | POWER/DATA | USB-C | power + [USB-MIDI](13-glossary.md#usb-midi) to computer |
| J71 | MIDI IN | 5-pin DIN | MIDI + clock in |
| J72 | MIDI OUT A | 5-pin DIN | MIDI + clock out |
| J73 | OUT B / THRU | 5-pin DIN | second out, or thru (mirrors MIDI IN + USB) |
| J74, J75 | [FOOTSWITCH](13-glossary.md#footswitch) 1, 2 | 6.35 mm TS | assignable footswitches |
| J76 | SYNC IN | 3.5 mm TRS | tip = clock, ring = start/stop |
| J77 | SYNC OUT | 3.5 mm TRS | clock + start/stop out |
| J78, J80, J82, J84 | [CV](13-glossary.md#cv) 1–4 | 3.5 mm TS | 1 V/oct pitch, [tracks](13-glossary.md#track) 1–4 |
| J79, J81, J83, J85 | [GATE](13-glossary.md#gate) 1–4 | 3.5 mm TS | gate, tracks 1–4 |

Physical order of the output jacks: CV1, GATE1, CV2, GATE2, CV3, GATE3, CV4, GATE4.

Hook-up examples in the source:

- **Studio:** J70 → computer USB. Computer → audio interface → monitors / headphones.
- **Band:** J72 MIDI OUT → synth MIDI IN. J77 SYNC OUT → drum machine SYNC IN. GATE out → second synth GATE IN. Footswitch on J74. USB-C power adapter on J69.
