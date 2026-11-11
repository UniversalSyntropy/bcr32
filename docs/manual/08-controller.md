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

Each message type has its own fields. B63 and B64 step through the fields. SEL sets the value. A dash means the control has no such field. Manual pages 24 to 34.

### 8.4.1 Button and encoder modes

| Mode | Control | Action |
| --- | --- | --- |
| Tog On | button | Latch. A press sends the maximum. The next press sends the minimum. |
| Tog Off | button | Momentary. The button sends the maximum while down and the minimum when released. |
| Inc | button | Each press raises the value by the increment, from the minimum to the maximum. |
| Absolute | encoder | 7-bit absolute value. |
| ABS_14 | encoder | 14-bit absolute value (fine control). |
| REL1 | encoder | Minimum for CCW, maximum for CW. |
| REL2 | encoder | 63 for CCW, 65 for CW. |
| REL3 | encoder | 1 for CCW, 65 for CW. |
| R1_14 | encoder | CCW: coarse 0, fine 1. CW: coarse 127, fine 127. |
| R2_14 | encoder | CCW: coarse 63, fine 127. CW: coarse 64, fine 1. |
| R3_14 | encoder | CCW: coarse 64, fine 1. CW: coarse 0, fine 1. |
| INC/DEC | encoder | CW sends increment 1. CCW sends decrement 1. |

### 8.4.2 LED options

The LED options set how the ring around an encoder shows its value. The default is 1dot_in. Manual page 26.

| Style | Ring behaviour |
| --- | --- |
| Off | The ring stays dark. |
| 1dot_in | One LED lights at a time as the encoder moves (default). |
| 1dot_ex | As 1dot_in, but all LEDs are dark at zero. |
| 2dot_in | The LED next to the lit one lights before the first goes out. The side depends on CW or CCW. |
| 2dot_ex | As 2dot_in, but all LEDs are dark at zero. |
| Bar | LEDs light and stay lit for CW. They go out one by one for CCW. |
| Bar− | As Bar, but all LEDs are dark at zero. |
| Sprd | The centre LED is lit at zero. LEDs on both sides light as the value rises. |
| Pan | The manual gives the same text as Sprd. See [Source errors and gaps](12-source-errors-and-gaps.md#12-source-errors-and-gaps). |
| Qual | All LEDs are lit at the minimum. They go out on both sides until only the centre LED stays lit at the maximum. |
| Cut | All LEDs are lit at the minimum. They go out one by one as the value rises. |
| Damp | The rightmost LED is lit at the minimum. The other LEDs light one by one as the value rises. |

### 8.4.3 PC (program control)

| Field | Button | Encoder |
| --- | --- | --- |
| MIDI channel | 1–16 | 1–16 |
| Parameter (bank number) | 0–127 | 0–127 |
| Minimum value | 0–127 | Off, 0–127 |
| Maximum value | 0–127 | 0–127 |
| Mode | Tog Off, Inc | Absolute |
| LED options | — | the 12 styles |
| Display | On, Off | On, Off |

### 8.4.4 CC (continuous controller)

| Field | Button | Encoder |
| --- | --- | --- |
| MIDI channel | 1–16 | 1–16 |
| Parameter (controller) | 0–127 | Off, 0–127 |
| Minimum value | 0–127 | 0–127 |
| Maximum value | 0–127 | 0–127 |
| Mode | Tog On, Tog Off, Inc | Absolute, A14, REL1, REL2, REL3, R1_14, R2_14, R3_14 |
| Increment options | −127 to +127 | — |
| LED options | — | the 12 styles |
| Display | On, Off | On, Off |

### 8.4.5 NRPN

| Field | Button | Encoder |
| --- | --- | --- |
| MIDI channel | 1–16 | 1–16 |
| Parameter (controller) | 0–127 | 0–16383 |
| Minimum value | 0–127 | 0–16383 |
| Maximum value | 0–127 | 0–16383 |
| Mode | Tog On, Tog Off, Inc | Absolute, A14, REL1, REL2, REL3, R1_14, R2_14, R3_14, INC/DEC |
| Increment options | −127 to +127 | — |
| LED options | — | the 12 styles |
| Display | On, Off | On, Off |

### 8.4.6 Note

Buttons only. The manual names the fields "Parameter (controller)" and "Value". Note number and velocity are the likely meanings (unverified).

| Field | Button |
| --- | --- |
| MIDI channel | 1–16 |
| Parameter (controller) | 0–127 |
| Value | 0–127 |
| Mode | Tog On, Tog Off, Inc |
| Display | On, Off |

### 8.4.7 PB (pitch bend)

Encoders only.

| Field | Encoder |
| --- | --- |
| MIDI channel | 1–16 |
| Parameter (controller) | 0–127 |
| Value | 0–127 |
| Mode | Absolute |
| LED options | the 12 styles |
| Display | On, Off |

### 8.4.8 AT (aftertouch)

| Field | Button | Encoder |
| --- | --- | --- |
| MIDI channel | 1–16 | 1–16 |
| Parameter (controller) | All, 0–127 | 0–127 |
| Minimum value | 0–127 | 0–127 |
| Maximum value | 0–127 | 0–127 |
| Mode | — | Absolute |
| Increment options | −127 to +127 (default 1) | — |
| LED options | — | the 12 styles |
| Display | On, Off | On, Off |

### 8.4.9 GS (most used parameters)

Buttons and encoders use one parameter list. The list is: Cutoff, Resonance, Rate, Depth, Delay, Attack, Decay, Release, Modulation, Portamento, Volume, Pan, Reverb, CRS, VAR.

| Field | Button | Encoder |
| --- | --- | --- |
| MIDI channel | 1–16 | 1–16 |
| Parameter | the list above | the list above |
| Minimum value | 0–127 | 0–127 |
| Maximum value | 0–127 | 0–127 |
| Mode | Tog On, Tog Off | Absolute, A14, REL1, REL2, REL3, R1_14, R2_14, R3_14, INC/DEC |
| LED options | — | the 12 styles |
| Display | On, Off | On, Off |

### 8.4.10 MMC (MIDI machine code)

Buttons only.

| Field | Button |
| --- | --- |
| MIDI device ID | 0–126, All |
| Parameter | Play, Pause, Stop, Forward, Rewind, Location, In, Out |
| Start position locate (HH:MM) | 0–127, Off |
| Start position locate (SS:FF) | 0–127, Off |
| Mode | Off, 24, 25, 30, 30d (frames per second) |
| Display | On, Off |

The printed parameter list ends with a comma. It may be cut short. See [Source errors and gaps](12-source-errors-and-gaps.md#12-source-errors-and-gaps).

## 8.5 CTRL Settings (`hold B59 + B61` in CTRL)

- **B5 output routing:** USB, MIDI A, MIDI B, A&B, USB&A, USB&B, USB&A&B.
- **B6 MIDI thru:** source via E28 (Off, MIDI, USB); destination via SEL (Off, 7 routings, or 7 Filtered). Push SEL to save, B60 to exit.
- **B7 echo dead time:** not in the manual. Verified on firmware 1.0.3: the display shows `ECHO deadtime 100ms`. The range is not recorded.

> **Note:** Verified on firmware 1.0.3 (2026-11-11): the menu has three items (B5 to B7). The display showed output port `U` (USB), thru destination off and thru source off.
