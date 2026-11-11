---
title: 9. Global, sync, memory and maintenance
description: Chapter 9 of the BCR32 manual: Global, sync, memory and maintenance.
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# 9. Global, sync, memory and maintenance

## 9.1 Global Settings (`B1 ×3s`; SEL to change, push SEL to save)

| Btn | Setting | Options |
| --- | --- | --- |
| B5 | Device mode | ZQR or CTRL at power-up |
| B6 | Device ID | 1–255 (unique per unit) |
| B7 | [Operation mode](13-glossary.md#operation-mode) | USB (no [DIN MIDI](13-glossary.md#din-midi), no internal clock; USB + analog sync on); STDL (DIN MIDI, MIDI sync, internal clock; no USB, no analog sync); MIXED (all) |
| B8 | CV1 measure | starts calibration (§9.4) |
| B9 | [Footswitch](13-glossary.md#footswitch) 1 | ZAQ start/stop or CTRL programmable |
| B10 | Footswitch 2 | ZAQ next [pattern](13-glossary.md#pattern) or CTRL programmable |
| B11 | [Firmware](13-glossary.md#firmware) version | [display](13-glossary.md#display-disp) only |
| B12 | [Factory restore](13-glossary.md#factory-restore) | Cancel / OK; takes over a minute |
| B13 | Pattern change channel | not in the manual; `Off` seen on firmware 1.0.3; other values unseen |
| B14 | [Encoder](13-glossary.md#encoder) acceleration | not in the manual; `2` seen on firmware 1.0.3; range unseen |
| B15 | Footswitch polarity | not in the manual; `AUTO` seen on firmware 1.0.3; other values unseen |

> **Note:** Verified on firmware 1.0.3 (2026-11-11): the menu lights B1 and B5–B15 (panel buttons 1–11) in blue, three more than the official manual lists. B11 shows the firmware version (1.0.3). B13 to B15 are the three extra settings above. LED luminosity, which the vendor editor lists, has no button. Read the display before you confirm anything on B12. The unit prints the numbers 1 to 16 above B5 to B20; the ID is the printed number plus 4.

## 9.2 ZAQ Settings (`hold B59 + B61` in ZAQ)

B5 [gate](13-glossary.md#gate) level 5 V / 10 V. B6 sync-in [ppqn](13-glossary.md#ppqn) (1, 2, 4, 24, 48). B7 sync-out ppqn (same). B8 sync-in start: GATE (trigger on ring) or CLOCK (starts when clock on tip). Push [SEL](13-glossary.md#select-encoder-sel) to confirm each choice. B60 exits to the [ZAQ Global page](13-glossary.md#zaq-global-page) (the manual says "exit the menu to the ZAQ GLOBAL menu, and return to the Zaquencer functions"; unverified). Verified on firmware 1.0.3 (2026-11-11): B8 shows `SYN IN STRT` with the value GATE. The value CLOCK was not seen.

## 9.3 Erase and SysEx (all start with B61, then `hold SEL + push E…`)

| Goal | Mode | Sequence |
| --- | --- | --- |
| Erase menu | either | B61, `hold SEL + push E49` (source says "25th encoder (50)"; 25th = E49) |
| → reset sequencer globals | ZAQ | push E31, push again to confirm |
| → erase sequences, keep globals | ZAQ | push E32, push again |
| → erase all controller memory | CTRL | push E32, push again |
| [SysEx](13-glossary.md#sysex) export menu | either | B61, `hold SEL + push E25` |
| → all ZAQ memory | ZAQ | push E29 |
| → 12 sequence [pages](13-glossary.md#page) | ZAQ | push E30 |
| → current page | ZAQ | push E31 |
| → current sequence | ZAQ | push E32 |
| → all 64 [presets](13-glossary.md#preset) | CTRL | push E31 |
| → current preset | CTRL | push E32 |
| SysEx import | either | B61, `hold SEL + push E33`; then send SysEx |

B60 returns to normal.

## 9.4 CV calibration (factory-calibrated; only if needed)

Needs a millivolt meter. For [CV](13-glossary.md#cv) output n (1–4):

1. `B1 ×3s`, press B8. DISP shows MIN.
2. Meter on CV n. Turn E(24+n). B5–B14 become a number pad (amber). B15 is + (green), B16 is − (red), B19 clears (blue), B20 is backspace (pink).
3. Turn E(32+n), enter the meter reading.
4. Turn E(40+n), enter the meter reading.
5. Push E(24+n). Turn it CCW: meter reads 0 V. Turn CW: meter reads +10 V.
6. Repeat for the next output. Press B1 to finish.

## 9.5 Control Tribe

The Behringer [Control Tribe](13-glossary.md#control-tribe) app edits most functions and installs firmware updates.
