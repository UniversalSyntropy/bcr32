---
title: 3. Top panel — control map
description: Chapter 3 of the BCR32 manual: Top panel — control map.
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# 3. Top panel — control map

Layout is a grid. Coordinates `(row, col)` are for diagram use; row 0 is the top.

## 3.1 Left block: parameter buttons (B5–B20)

| ID | Panel no. | Label | Pos | ZAQ meaning (§5) | Global Settings | ZAQ Settings | CTRL Settings |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B5 | 1 | PITCH | (0,0) | Note pitch per step | Device mode | Gate out 5/10 V | Output routing |
| B6 | 2 | VELOCITY | (0,1) | Velocity | Device ID | Sync in clock | MIDI thru |
| B7 | 3 | MUTE | (0,2) | Step mute | Operation mode | Sync out clock | — |
| B8 | 4 | DELAY | (0,3) | Micro-timing −5…+5 | CV1 measure (calibration) | Sync in start | — |
| B9 | 5 | LENGTH | (0,4) | Note length | Footswitch 1 | — | — |
| B10 | 6 | MIDI CTRL α | (0,5) | α control lane | Footswitch 2 | — | — |
| B11 | 7 | MIDI CTRL β | (0,6) | β control lane | Firmware version | — | — |
| B12 | 8 | WAVE GEN | (0,7) | Wave generator | Factory restore | — | — |
| B13 | 9 | CHORD | (1,0) | Chord per step | — | — | — |
| B14 | 10 | STEP SKIP | (1,1) | Skip per step | — | — | — |
| B15 | 11 | SEQ START | (1,2) | Start step | — | — | — |
| B16 | 12 | SEQ LENGTH | (1,3) | Length 1–32 | — | — | — |
| B17 | 13 | SEQ OFFSET | (1,4) | Offset 0–31 | — | — | — |
| B18 | 14 | CLK DIVIDER | (1,5) | Clock division | — | — | — |
| B19 | 15 | SHUFFLE | (1,6) | Shuffle | — | — | — |
| B20 | 16 | DIRECTION | (1,7) | Play direction | — | — | — |

Other roles of B5–B20:

- **Drum voices:** on a drum track, B5–B20 = drum voices 1–16.
- **Pattern slots:** in STORE / LOAD, B5–B20 = slots 1–16 of the current page. Green = slot used. Flashing = current pattern.
- **Virtual keyboard (real-time note entry):** piano layout. Black keys = B6, B7, B9, B10, B11 (C#, D#, F#, G#, A#). White keys = B13–B20 (C, D, E, F, G, A, B, C). B5, B8, B12 not used. Key-to-note mapping is inferred from the layout; the source only lists the buttons.
- **Number pad (CV calibration):** B5–B14 = digits, B15 = +, B16 = −, B19 = clear, B20 = backspace. The source does not say which button is which digit.
- **CTRL mode:** B5–B24 are assignable.

## 3.2 Track buttons and status LEDs

| ID | Label | Pos | Function |
| --- | --- | --- | --- |
| B1 | ZQR/CTRL | above B12 | Mode toggle; `×3s` = Global Settings |
| B21 | T1 | (0,8) | Select track 1 |
| B22 | T2 | (0,9) | Select track 2 |
| B23 | T3 | (1,8) | Select track 3 |
| B24 | T4 | (1,9) | Select track 4 |
| L2 | MIDI IN / A / B | top right | MIDI activity |
| L3 | FOOTSW 1 / 2 | top right | Flash on footswitch use |
| L4 | USB MODE | top right | USB activity |

Track buttons: current track flashes; green = playing, red = muted in mixer. Only one track is selected for editing. A small "DRUM NOTES" legend sits between the T rows.

## 3.3 Encoder grid (E25–E56)

Each encoder: push switch + LED ring. The step number (1–32) is printed above it. Steps 1, 5, 9 … 29 are boxed as beat markers. The label printed below is its ZAQ Global function (§6).

| Row | Encoders | Steps | Labels below (ZAQ Global) |
| --- | --- | --- | --- |
| 2 | E25–E32 | 1–8 | BPM · CLOCK INT/EXT · CLOCK OUT · MIDI THROUGH · NOTE DISPLAY · SCALE · SCALE BASE · TRANSPOSE ENBL |
| 3 | E33–E40 | 9–16 | WAVE/TRIG ENBL · GAIN/TRIG CC NR · RATE/QUANT · OFFSET/Q-MIXER · TRACKMODE T1 · T2 · T3 · T4 |
| 4 | E41–E48 | 17–24 | MIDI OUT UAB T1 · MIDI OUT CH T1 · UAB T2 · CH T2 · UAB T3 · CH T3 · UAB T4 · CH T4 |
| 5 | E49–E56 | 25–32 | MIDI CTRL α T1 · β T1 · α T2 · β T2 · α T3 · β T3 · α T4 · β T4 |

Row 3 split labels: the first half (WAVE, GAIN, RATE, OFFSET) is the Wave Gen parameter while B12 is held. The second half is the Global function. "UAB" = USB / MIDI A / MIDI B routing.

## 3.4 Right block

| ID | Label | Pos (row, col in block) | ZAQ | CTRL |
| --- | --- | --- | --- | --- |
| DISP | display | (0,0) | parameter/value | parameter/value |
| SEL (58) | SELECT | (0,1) | turn = value, push = enter/confirm | same |
| B59 | EDIT / GLOBAL | (1,0) | Global page; hold + encoder = edit all steps | hold = assign controls |
| B60 | EXIT | (1,1) | leave STORE/LOAD/GLOBAL | leave EDIT/STORE/LOAD |
| B61 | STORE | (2,0) | store pattern | store preset |
| B62 | LD/LRN | (2,1) | LOAD pattern | LEARN |
| B63 | TAP DELETE / ◄ | (3,0) | erase in real-time rec; page down; hold = peek global value | previous preset/location; previous setup option |
| B64 | TAP WRITE / ► / NOTE RPT | (3,1) | rec sub-mode; page up; in Mixer = note repeat | next preset/location; next setup option |
| B65 | INST SEL | (4,0) | real-time programming on/off | assignable |
| B66 | MIXER | (4,1) | mixer | assignable |
| B67 | RESET (↻) | (5,0) | jump to step 1 | assignable |
| B68 | PLAY/STOP | (5,1) | start/stop | assignable |

The label "◄ PAGES/PRESETS ►" sits above B63/B64.
