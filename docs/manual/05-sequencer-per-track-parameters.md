---
title: 5. Sequencer (ZAQ mode) — per-track parameters
description: Chapter 5 of the BCR32 manual: Sequencer (ZAQ mode) — per-track parameters.
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# 5. Sequencer (ZAQ mode) — per-track parameters

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

Chord types: Off, Minor, Major, Diminished, Augmented, Diminished 7th, Minor 7th ♭5, Minor 7th, Minor maj7, Major 7th ♭5, Major 7, Major 7 ♯5. The source text is garbled at Major 7th ♭5 and also lists "6th, 7th". Each type also has Octave − and Octave +. Intervals: minor 2nd, major 2nd, minor 3rd, major 3rd, perfect 4th, diminished 5th, perfect 5th, minor 6th, major 6th, minor 7th, major 7th.
