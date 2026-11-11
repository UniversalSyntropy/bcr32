---
title: 8. Controller (CTRL mode)
description: Chapter 8 of the BCR32 manual: Controller (CTRL mode).
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# 8. Controller (CTRL mode)

Assignable: B5–B24, E25–E56 (turn = continuous, push = on/off), B65–B68, footswitches (when Global B9/B10 = CTRL).

## 8.1 Assign a control

1. `hold B59 + turn/push the encoder` or `+ press the button`.
2. Turn SEL to pick the type. Types: Off, PC, CC, NRPN, PB (encoders only), Note (buttons only), AT, GS, MMC (buttons only).
3. B63/B64 step through the setup fields; SEL sets each value.
4. B60 to finish.

## 8.2 Learn

`hold B62 + press/turn the control`, then send MIDI from an external device (DIN or USB). Fine-tune afterwards with B59.

## 8.3 Presets

- **Store:** B61, pick location with B63/B64, B61 again to confirm, B61 a third time to write (temporary). Permanent: `hold SEL + press B61`.
- **Load:** B63/B64 to the location; it loads at once.

## 8.4 Setup fields per type

| Type | Button fields | Encoder fields |
| --- | --- | --- |
| PC | ch 1–16, bank 0–127, min, max, mode Tog Off/Inc, display | ch, bank, min Off/0–127, max, mode Absolute, LED, display |
| CC | ch, CC 0–127, min, max, mode Tog On/Tog Off/Inc, increment −127…+127, display | ch, CC Off/0–127, min, max, mode Absolute/A14/REL1-3/R1_14-R3_14, LED, display |
| NRPN | ch, param 0–127, min, max 0–127, mode, increment, display | ch, param 0–16383, min/max 0–16383, modes + INC/DEC, LED, display |
| Note | ch, note 0–127, velocity 0–127, mode, display | — |
| PB | — | ch, param, value, mode Absolute, LED, display |
| AT | ch, param All/0–127, min, max, increment (1), display | ch, param, min, max, mode Absolute, LED, display |
| GS | ch, parameter (Cutoff, Resonance, Rate, Depth, Delay, Attack, Decay, Release, Modulation, Portamento, Volume, Pan, Reverb, CRS, VAR), min, max, mode Tog On/Off, display | same params, modes Absolute/A14/REL1-3/R1_14-R3_14/INC-DEC, LED, display |
| MMC | device ID 0–126/All; Play, Pause, Stop, Forward, Rewind, Locate, In, Out; locate HH:MM and SS:FF 0–127/Off; fps Off/24/25/30/30d; display | — |

Button modes: **Tog On** = latch (max, then min on next press). **Tog Off** = momentary. **Inc** = steps up from min to max per press.

Encoder modes: **Absolute** 7-bit. **ABS_14** 14-bit. **REL1** min CCW / max CW. **REL2** 63 / 65. **REL3** 1 / 65. **R1_14, R2_14, R3_14** 14-bit relative variants. **INC/DEC** increment/decrement messages.

LED ring styles: Off, 1dot_in (default), 1dot_ex (dark at zero), 2dot_in, 2dot_ex, Bar, Bar− (dark at zero), Sprd, Pan, Qual, Cut, Damp.

## 8.5 CTRL Settings (`hold B59 + B61` in CTRL)

- **B5 output routing:** USB, MIDI A, MIDI B, A&B, USB&A, USB&B, USB&A&B.
- **B6 MIDI thru:** source via E28 (Off, MIDI, USB); destination via SEL (Off, 7 routings, or 7 Filtered). Push SEL to save, B60 to exit.
- **B7 echo dead time:** not in the manual. Verified on firmware 1.0.3: the display shows `ECHO deadtime 100ms`. The range is not recorded.

> **Note:** Verified on firmware 1.0.3 (2026-11-11): the menu has three items (B5 to B7). The display showed output port `U` (USB), thru destination off and thru source off.
