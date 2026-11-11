---
title: BCR32 structured reference
description: Every control, mode, menu and procedure of the Behringer BCR32, with fixed control IDs and key sequences.
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# BCR32 structured reference

This reference restates the official Behringer BCR32 user manual (V2.0) as structured data: fixed control IDs, mode tables and numbered key sequences. It's written to answer "how do I do X" questions quickly, for people and for LLM assistants. Where the official manual is wrong or unclear, the entry says so and [Source errors and gaps](#12-source-errors-and-gaps) lists the working assumption.

> **Note:** This is an unofficial document. It is not affiliated with or endorsed by Behringer or Music Tribe. Check the official manual for safety information.

## 0. How to read this reference

- **Control IDs** use the official manual's callout numbers: `B<n>` (button), `E<n>` (encoder), `SEL` (select encoder, 58), `DISP` (display, 57), `J<n>` (rear jack).
- **Step to encoder:** step k is `E(24+k)`. Step 1 is E25, step 32 is E56. "The nth encoder" in the official manual means E(24+n).
- **Panel label to ID:** the small number printed above each of the 16 parameter buttons (1–16) isn't the ID. ID = label + 4, so panel "1 PITCH" is B5 and panel "16 DIRECTION" is B20.
- **Action notation:** `hold X + Y` means keep X down, then press or turn Y. `X ×3s` means hold X for three seconds. `turn E` and `push E` mean rotate and press an encoder. CW and CCW mean clockwise and counter-clockwise.
- **Mode first:** most controls change meaning with the mode, so each procedure starts by naming the mode ([Modes and menus](#2-modes-and-menus-state-machine)).

## 1. What the unit is

One box with two separate devices. B1 switches between them.

| Device | Name on unit | Button colour | Purpose |
| --- | --- | --- | --- |
| Sequencer | ZAQ / ZQR / Zaquencer | pink | 4 tracks × 32 steps; MIDI, USB-MIDI and CV/gate out |
| Controller | CTRL | amber | 32 encoders + 24 buttons sending user-assigned MIDI |
| Settings menus | — | blue | global, sequencer and controller settings |

Key numbers: 4 tracks, 32 steps, 16 drum voices per drum track, 12 pattern pages × 16 slots (sequencer), 64 presets (controller), BPM 30–300, 4 CV (0 to +10 V, 1 V/oct) + 4 gate (5 V or 10 V), MIDI note range C2–G8 for pitch steps.

## 2. Modes and menus (state machine)

| Mode / menu | Enter | Exit | Lit buttons |
| --- | --- | --- | --- |
| ZAQ (sequencer) | tap B1 until pink | tap B1 | B1 + used B5–B20 pink |
| CTRL (controller) | tap B1 until amber | tap B1 | amber |
| Global Settings | `B1 ×3s` (either mode) | tap B1 | B1, B5–B12 blue |
| ZAQ Settings | in ZAQ: `hold B59 + B61` | B60 | B5–B8 blue |
| CTRL Settings | in CTRL: `hold B59 + B61` | B60 | B5–B6 blue |
| ZAQ Global page | in ZAQ: press B59 | B60 | encoders = global params (§6) |
| ZAQ Mixer | in ZAQ, sequencer stopped: press B66 | B66 / B60 | B21–24, B5–20 green/red |
| Real-time record | in ZAQ: press B65 | press B65 | — |
| CTRL Edit | in CTRL: `hold B59 + turn/push E` or `+ press B` | B60 | — |
| CTRL Learn | in CTRL: `hold B62 + press/turn control` | B60 | — |
| Erase / SysEx | `B61`, then `hold SEL + push E…` (§9) | B60 | — |

Power-up mode is set in Global Settings → B5 (DEVICE MODE).

## 3. Top panel — control map

Layout is a grid. Coordinates `(row, col)` are for diagram use; row 0 is the top.

### 3.1 Left block: parameter buttons (B5–B20)

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

### 3.2 Track buttons and status LEDs

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

### 3.3 Encoder grid (E25–E56)

Each encoder: push switch + LED ring. The step number (1–32) is printed above it. Steps 1, 5, 9 … 29 are boxed as beat markers. The label printed below is its ZAQ Global function (§6).

| Row | Encoders | Steps | Labels below (ZAQ Global) |
| --- | --- | --- | --- |
| 2 | E25–E32 | 1–8 | BPM · CLOCK INT/EXT · CLOCK OUT · MIDI THROUGH · NOTE DISPLAY · SCALE · SCALE BASE · TRANSPOSE ENBL |
| 3 | E33–E40 | 9–16 | WAVE/TRIG ENBL · GAIN/TRIG CC NR · RATE/QUANT · OFFSET/Q-MIXER · TRACKMODE T1 · T2 · T3 · T4 |
| 4 | E41–E48 | 17–24 | MIDI OUT UAB T1 · MIDI OUT CH T1 · UAB T2 · CH T2 · UAB T3 · CH T3 · UAB T4 · CH T4 |
| 5 | E49–E56 | 25–32 | MIDI CTRL α T1 · β T1 · α T2 · β T2 · α T3 · β T3 · α T4 · β T4 |

Row 3 split labels: the first half (WAVE, GAIN, RATE, OFFSET) is the Wave Gen parameter while B12 is held. The second half is the Global function. "UAB" = USB / MIDI A / MIDI B routing.

### 3.4 Right block

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

## 4. Rear panel

Left to right as seen from behind:

| ID | Jack | Type | Use |
| --- | --- | --- | --- |
| J69 | POWER | USB-C | power only |
| J70 | POWER/DATA | USB-C | power + USB-MIDI to computer |
| J71 | MIDI IN | 5-pin DIN | MIDI + clock in |
| J72 | MIDI OUT A | 5-pin DIN | MIDI + clock out |
| J73 | OUT B / THRU | 5-pin DIN | second out, or thru (mirrors MIDI IN + USB) |
| J74, J75 | FOOTSWITCH 1, 2 | 6.35 mm TS | assignable footswitches |
| J76 | SYNC IN | 3.5 mm TRS | tip = clock, ring = start/stop |
| J77 | SYNC OUT | 3.5 mm TRS | clock + start/stop out |
| J78, J80, J82, J84 | CV 1–4 | 3.5 mm TS | 1 V/oct pitch, tracks 1–4 |
| J79, J81, J83, J85 | GATE 1–4 | 3.5 mm TS | gate, tracks 1–4 |

Physical order of the output jacks: CV1, GATE1, CV2, GATE2, CV3, GATE3, CV4, GATE4.

Hook-up examples in the source:

- **Studio:** J70 → computer USB. Computer → audio interface → monitors / headphones.
- **Band:** J72 MIDI OUT → synth MIDI IN. J77 SYNC OUT → drum machine SYNC IN. GATE out → second synth GATE IN. Footswitch on J74. USB-C power adapter on J69.

## 5. Sequencer (ZAQ mode) — per-track parameters

Select the track first (B21–B24). B5–B20 settings are per track. Everything can change while playing.

General rule: press a parameter button, then turn the step encoders E25–E56. `hold B59 + turn any E` moves every step together to its max or min.

| Button | Encoders do | Range / options | Default |
| --- | --- | --- | --- |
| B5 PITCH | note per step | C2–G8; CV 0–10 V. Ring shows pitch (range set by Global E29); last 3 LEDs show playhead | C3 (MIDI 60) |
| B6 VELOCITY | velocity per step | 0–127 | 100 |
| B7 MUTE | toggle play/mute | LED lit = plays | play |
| B8 DELAY | timing shift | −5 (early) … 0 … +5 (late) | 0 |
| B9 LENGTH | note length | 96, t32, 32, t16, 16, t8, 8, t4, 4, t2, 2, t1b, 1b, t2b, 2b, 4b | 32 (32nd note) |
| B10 MIDI CTRL α | α value per step | Off, 1–127; target set by E49/51/53/55 | — |
| B11 MIDI CTRL β | β value per step | Off, 1–127; target set by E50/52/54/56 | — |
| B12 WAVE GEN | hold B12 + E33–E36 | E33 waveform (random, sine, triangle, saw, ramp, rectangle); E34 gain 0–100 (50); E35 rate 1–32 (5); E36 offset 0–127 or "add" (63) | — |
| B13 CHORD | chord per step (MIDI only) | see list below | Off |
| B14 STEP SKIP | toggle play/skip | LED lit = plays | play |
| B15 SEQ START | turn the encoder of the start step | step 1–32 | 1 |
| B16 SEQ LENGTH | E25 = 1 … E56 = 32 | 1–32 | 32 |
| B17 SEQ OFFSET | E25 = 0 … E56 = 31 | 0–31 steps | 0 |
| B18 CLK DIVIDER | SEL | 1, 2, 4, 8, 16, 32, 24, 12, 6, 3 | 16 |
| B19 SHUFFLE | E30 even, E31 odd | E 0/16/33/50/66/83; O 0/16/33/60/66/83 | 0 |
| B20 DIRECTION | SEL | Forward, Backward, Pip 0 (pendulum, ends repeated), Random, Pendulum | Forward |

Apply Wave Gen to lanes: `hold B12 + press` one or more of B5–B11 (pitch, velocity, mute, delay, length, α, β).

Chord types: Off, Minor, Major, Diminished, Augmented, Diminished 7th, Minor 7th ♭5, Minor 7th, Minor maj7, Major 7th ♭5 (source text garbled here, also lists "6th, 7th"), Major 7, Major 7 ♯5. Each also with Octave − / Octave +. Intervals: minor 2nd, major 2nd, minor 3rd, major 3rd, perfect 4th, diminished 5th, perfect 5th, minor 6th, major 6th, minor 7th, major 7th.

## 6. ZAQ Global page (press B59 in ZAQ)

`hold B63 + turn E` shows a value without changing it.

| Enc | Parameter | Options | Default |
| --- | --- | --- | --- |
| E25 | BPM | 30–300 (internal clock) | — |
| E26 | Clock source | Internal, MIDI, USB, Sync (analog) — limited by Operation Mode | — |
| E27 | Clock out | Off, MIDI A, MIDI B, A&B, USB, A&USB, B&USB, A&B&USB | Off |
| E28 | MIDI thru | source Off/MIDI/USB; push SEL to switch to destination; dest Off, the 7 routings, or the 7 routings Filtered ("F", drops duplicated internal MIDI such as clock) | — |
| E29 | Note display | OcMi (MIDI no., ring = 1 oct), OCNa (octave+name, ring = 1 oct), AlMi (MIDI no., ring = full range), AlNa (octave+name, ring = full range) | — |
| E30 | Scale | OFF, Major, Minor, Dorian, Phrygian, Lydian, Mixolydian, Locrian, Whole Tone, Minor 7th, Diminished 7th, Octatonic W-H, Octatonic H-W, Major Pentatonic, Minor Pentatonic, Inverted, USER | OFF |
| E31 | Scale base | C–B | — |
| E32 | Transpose enable | Off; MIDI ch 1–16; Track (each track follows notes on its own channel); 1-4 … 13-16 (track 1 follows ch n, track 2 ch n+1 …) | Off |
| E33 | Trigger enable | Off or MIDI ch 1–16 for CC pattern switching | — |
| E34 | Trigger CC no. | CC used to switch patterns | — |
| E35 | Rate / quantize | 96, t32, 32, t16 … 4b | 32 |
| E36 | Q on/off | quantize on/off | on |
| E37–E40 | Track mode T1–T4 | Chord or Drum | Chord |
| E41/43/45/47 | MIDI out T1–T4 | USB, MIDI A, MIDI B, A&B, USB&A, USB&B, USB&A&B (full list needs MIXED) | — |
| E42/44/46/48 | MIDI channel T1–T4 | 1–16 | — |
| E49/51/53/55 | α target T1–T4 | off, delay, ratchet, program change, aftertouch, pitch bend, CC 0–127 | off |
| E50/52/54/56 | β target T1–T4 | same as α | off |

Scale notes:

- **Non-destructive:** scale and base bend the notes at playback; the stored notes stay as they are.
- **Make permanent:** press B10 + B11 together. This rewrites the notes and cannot be undone.
- **User scale:** with SCALE (E30) active, `hold B10`. E41–E52 light up; set the 12 notes.

## 7. Sequencer procedures

### 7.1 Prepare

1. Select track (B21–B24). Confirm track mode is Chord (Global E37–E40).
2. All steps default to C3. Use that note to tune the synth (warm analog gear up first).
3. `hold B5 + turn any E` to move the default pitch to the key's root note.
4. Press B7 and mute steps you will not use.

### 7.2 Step-enter notes

1. Select track. Press B5.
2. Turn the encoder for each step. DISP shows the note.
3. Optional: press B13 and pick a chord per step.

### 7.3 Real-time record (note track)

1. Press B65. DISP shows NOTE (play notes, no recording).
2. Press B64 to cycle NOTE → MONITOR → RECORD → NOTE.
   - **MONITOR:** pattern plays (B68), you play along, nothing records.
   - **RECORD:** with playhead running, each key press or incoming MIDI note goes to the nearest step.
3. Play from the virtual keyboard (§3.1) or a MIDI keyboard.
4. Erase: in RECORD, `hold B63 + press the note key` while the playhead passes the steps. Hold for a full pattern to erase every instance.
5. Press B65 to leave.

### 7.4 Drum tracks

- **Set a track to Drum:** B59 (Global), turn E37–E40 for the track to Drum.
- **Drum voice pitches:** in Global, `hold track button (B21–24)`; E25–E40 set voices 1–16. DISP and ring show the note; the note also sounds on the track's outputs.
- **Step-enter:** B65, press drum B5–B20, turn the encoders of the steps you want. Turn again to remove. Ring LED marks programmed steps.
- **Fill all steps:** `hold drum button + turn any E CW`. Clear all: same, CCW.
- **Random:** select drum (B5–B20), `hold B65 + press B12`. Remove single steps by turning CCW.
- **Real-time:** B65, then B64 toggles MONITOR / RECORD. Erase with `hold B63 + drum button`.

### 7.5 Mixer and note repeat

1. Stop the sequencer. Press B66.
2. B21–B24 mute tracks; B5–B20 mute drum voices. Green = on, red = muted.
3. Note repeat: `hold B64 + turn any E` for rate (96, t32, 32, t16, 16, t8, 8, t4, 4). Still holding B64, press a track button (whole track) or a drum button (one voice).

### 7.6 Patterns

- **Store (temporary):** `hold B61`, page with B63/B64 (1–12), press slot B5–B20. B61 stays lit.
- **Store (permanent):** then press B60, `hold SEL + press B61`. DISP confirms. Without this step the pattern is lost at power-off.
- **Load:** press B62, page with B63/B64, press slot. Press B60. A load while playing switches at the end of the current pattern.
- **Chain:** `hold a pattern button + press another`; patterns play in order.
- **No auto-load:** nothing loads at power-up.
- **Copy track:** `hold destination track button + press source track button`.
- **Copy pattern between tracks:** press the pattern button before the source track (source wording unclear).

### 7.7 Transport

B68 play/stop. B67 back to step 1. Footswitch 1 = start/stop, footswitch 2 = next pattern (when set to ZAQ in Global).

## 8. Controller (CTRL mode)

Assignable: B5–B24, E25–E56 (turn = continuous, push = on/off), B65–B68, footswitches (when Global B9/B10 = CTRL).

### 8.1 Assign a control

1. `hold B59 + turn/push the encoder` or `+ press the button`.
2. Turn SEL to pick the type: Off, PC, CC, NRPN, PB (encoders only), Note (buttons only), AT, GS, MMC (buttons only).
3. B63/B64 step through the setup fields; SEL sets each value.
4. B60 to finish.

### 8.2 Learn

`hold B62 + press/turn the control`, then send MIDI from an external device (DIN or USB). Fine-tune afterwards with B59.

### 8.3 Presets

- **Store:** B61, pick location with B63/B64, B61 again to confirm, B61 a third time to write (temporary). Permanent: `hold SEL + press B61`.
- **Load:** B63/B64 to the location; it loads at once.

### 8.4 Setup fields per type

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

### 8.5 CTRL Settings (`hold B59 + B61` in CTRL)

- **B5 output routing:** USB, MIDI A, MIDI B, A&B, USB&A, USB&B, USB&A&B.
- **B6 MIDI thru:** source via E28 (Off, MIDI, USB); destination via SEL (Off, 7 routings, or 7 Filtered). Push SEL to save, B60 to exit.

## 9. Global, sync, memory and maintenance

### 9.1 Global Settings (`B1 ×3s`; SEL to change, push SEL to save)

| Btn | Setting | Options |
| --- | --- | --- |
| B5 | Device mode | ZQR or CTRL at power-up |
| B6 | Device ID | 1–255 (unique per unit) |
| B7 | Operation mode | USB (no DIN MIDI, no internal clock; USB + analog sync on); STDL (DIN MIDI, MIDI sync, internal clock; no USB, no analog sync); MIXED (all) |
| B8 | CV1 measure | starts calibration (§9.4) |
| B9 | Footswitch 1 | ZAQ start/stop or CTRL programmable |
| B10 | Footswitch 2 | ZAQ next pattern or CTRL programmable |
| B11 | Firmware version | display only |
| B12 | Factory restore | Cancel / OK; takes over a minute |

### 9.2 ZAQ Settings (`hold B59 + B61` in ZAQ)

B5 gate level 5 V / 10 V. B6 sync-in ppqn (1, 2, 4, 24, 48). B7 sync-out ppqn (same). B8 sync-in start: GATE (trigger on ring) or CLOCK (starts when clock on tip). B60 to exit.

### 9.3 Erase and SysEx (all start with B61, then `hold SEL + push E…`)

| Goal | Mode | Sequence |
| --- | --- | --- |
| Erase menu | either | B61, `hold SEL + push E49` (source says "25th encoder (50)"; 25th = E49) |
| → reset sequencer globals | ZAQ | push E31, push again to confirm |
| → erase sequences, keep globals | ZAQ | push E32, push again |
| → erase all controller memory | CTRL | push E32, push again |
| SysEx export menu | either | B61, `hold SEL + push E25` |
| → all ZAQ memory | ZAQ | push E29 |
| → 12 sequence pages | ZAQ | push E30 |
| → current page | ZAQ | push E31 |
| → current sequence | ZAQ | push E32 |
| → all 64 presets | CTRL | push E31 |
| → current preset | CTRL | push E32 |
| SysEx import | either | B61, `hold SEL + push E33`; then send SysEx |

B60 returns to normal.

### 9.4 CV calibration (factory-calibrated; only if needed)

Needs a millivolt meter. For CV output n (1–4):

1. `B1 ×3s`, press B8. DISP shows MIN.
2. Meter on CV n. Turn E(24+n). B5–B14 become a number pad.
3. Turn E(32+n), enter the meter reading.
4. Turn E(40+n), enter the meter reading.
5. Push E(24+n). Turn it CCW: meter reads 0 V. Turn CW: meter reads +10 V.
6. Repeat for the next output. Press B1 to finish.

### 9.5 Control Tribe

The Behringer Control Tribe app edits most functions and installs firmware updates.

## 10. Quick lookup: "how do I …"

| Task | Mode | Keys |
| --- | --- | --- |
| Switch sequencer / controller | any | B1 |
| Change tempo | ZAQ | B59, turn E25 |
| Sync to DAW over USB | ZAQ | B59, E26 = USB (Operation mode USB or MIXED) |
| Send clock to MIDI A | ZAQ | B59, E27 = MIDI A |
| Set track MIDI channel | ZAQ | B59, E42/44/46/48 |
| Set track output port | ZAQ | B59, E41/43/45/47 |
| Shorten track to 16 steps | ZAQ | select track, B16, turn E40 |
| Swing | ZAQ | B19, turn E30 (even) or E31 (odd) |
| Lock to a scale | ZAQ | B59, E30 scale, E31 root |
| Randomise velocity | ZAQ | `hold B12`, E33 = random; `hold B12 + B6` |
| Make a track a drum track | ZAQ | B59, E37–E40 = Drum |
| Mute a track live | ZAQ | B66 (stopped), press track button |
| Save pattern for good | ZAQ | `hold B61`, page, slot; B60; `hold SEL + B61` |
| Assign a CC to an encoder | CTRL | `hold B59 + turn E`, SEL = CC, B63/B64 + SEL for fields |
| Power from USB charger | — | J69 |

## 11. Display strings seen in the source

ZQR, CTRL, USB, STDL, MIXED, Cancel, OK, MIN, NOTE, MONITOR, RECORD, OcMi, OCNa, AlMi, AlNa, F (filtered thru), E/O (shuffle), Pip 0. The example display reads "drums RD-8 006".

## 12. Source errors and gaps

| Location | Issue | Working assumption |
| --- | --- | --- |
| ZAQ Settings B8 | text contains a draft tag "<CHECK?>" | GATE = start trigger on ring; CLOCK = start on clock |
| CTRL Settings + Global E28/E41 | "MIXED is selected using button 7 (Note Mute)" | B7 in Global Settings = Operation mode |
| Erase | "25th encoder (50)" | E49 (all other ordinals in the source map n → E(24+n)) |
| §ZAQ mode | NOTE LENGTH values printed inside the CHORD list | lengths listed in §5 |
| Chord list | "Major 7th with flat 5th, 6th, 7th" | possibly three entries; unverified |
| α targets | "CC0– 27" | CC 0–127 |
| LOAD | "buttons 63 & 63" | 63 & 64 |
| MIDI out list E41… | garbled with transpose list; "Input channel" appears | "Input channel" probably belongs to E32 |
| Copy pattern | ordering of presses unclear | test on the unit |
| Pattern chain | does not say which view (LOAD?) | probably LOAD view |
| User scale | "while in SCALE mode" not defined | while E30 is the active global control |
| Virtual keyboard / number pad | key-to-note and key-to-digit maps not given | piano layout inferred (§3.1) |
| Specifications | no spec page (power draw, size, weight) | unknown |

Procedures that depend on a row in this table are unconfirmed until someone tests them on a unit. Record test results in the row and in the [changelog](../../CHANGELOG.md).
