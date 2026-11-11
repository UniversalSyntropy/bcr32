---
title: 6. ZAQ Global page (press B59 in ZAQ)
description: Chapter 6 of the BCR32 manual: ZAQ Global page (press B59 in ZAQ).
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# 6. ZAQ Global page (press B59 in ZAQ)

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
