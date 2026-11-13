---
title: 6. ZAQ Global page (press B59 in ZAQ)
description: "Chapter 6 of the BCR32 manual: ZAQ Global page (press B59 in ZAQ)."
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# 6. ZAQ Global page (press B59 in ZAQ)

`hold B63 + turn E` shows a value without changing it.

| Enc | Parameter | Options | Default |
| --- | --- | --- | --- |
| E25 | [BPM](13-glossary.md#bpm) | 30–300 (internal clock) | — |
| E26 | [Clock source](13-glossary.md#clock-source) | Internal, MIDI, USB, Sync (analog) — limited by [Operation Mode](13-glossary.md#operation-mode) | — |
| E27 | Clock out | outputs that get the clock when the internal clock is the source: Off, MIDI A, MIDI B, A&B, USB, A&USB, B&USB, A&B&USB | Off |
| E28 | [MIDI thru](13-glossary.md#midi-thru) | source Off/MIDI/USB; push [SEL](13-glossary.md#select-encoder-sel) to switch to destination; dest Off, the 7 routings, or the 7 routings Filtered ("F", drops duplicated internal MIDI such as clock). With source Off, Off is the only destination. The full range needs MIXED | — |
| E29 | Note [display](13-glossary.md#display-disp) | OcMi (MIDI no. 1–127, ring = 1 oct), OCNa (octave −2 to +8 and name C to B, ring = 1 oct), AlMi (MIDI no. 1–127, ring = full range), AlNa (octave and name, ring = full range) | — |
| E30 | [Scale](13-glossary.md#scale) | OFF, Major, Minor, Dorian, Phrygian, Lydian, Mixolydian, Locrian, Whole Tone, Minor 7th, Diminished 7th, Octatonic W-H, Octatonic H-W, Major Pentatonic, Minor Pentatonic, Inverted, USER | OFF |
| E31 | Scale base | C–B | — |
| E32 | [Transpose](13-glossary.md#transpose) enable | Off; MIDI ch 1–16; [Track](13-glossary.md#track) (each track follows notes on its own channel); 1-4 … 13-16 (track 1 follows ch n, track 2 ch n+1 …) | Off |
| E33 | Trigger enable | Off or MIDI ch 1–16 for [CC](13-glossary.md#control-change-cc) [pattern](13-glossary.md#pattern) switching | — |
| E34 | Trigger CC no. | CC used to switch patterns | — |
| E35 | Rate / [quantize](13-glossary.md#quantize) | 96, t32, 32, t16 … 4b | 32 |
| E36 | Q on/off | quantize on/off | on |
| E37–E40 | Track mode T1–T4 | [Chord](13-glossary.md#chord) or Drum | Chord (inferred: the manual gives no default) |
| E41/43/45/47 | MIDI out T1–T4 | USB, MIDI A, MIDI B, A&B, USB&A, USB&B, USB&A&B (full list needs MIXED) | — |
| E42/44/46/48 | MIDI channel T1–T4 | 1–16 | — |
| E49/51/53/55 | α target T1–T4 | off, delay, ratchet, [program change](13-glossary.md#program-change-pc), [aftertouch](13-glossary.md#aftertouch-at), [pitch bend](13-glossary.md#pitch-bend-pb), CC 0–127 | off |
| E50/52/54/56 | β target T1–T4 | same as α | off |

Scale notes:

- **Non-destructive:** scale and base bend the notes at playback; the stored notes stay as they are.
- **Make permanent:** press B10 + B11 together. This rewrites the notes and cannot be undone.
- **User scale:** with SCALE (E30) active, `hold B10`. E41–E52 light up; set the 12 notes.
