---
title: 7. Sequencer procedures
description: Chapter 7 of the BCR32 manual: Sequencer procedures.
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# 7. Sequencer procedures

## 7.1 Prepare

1. Select track (B21–B24). Confirm track mode is Chord (Global E37–E40).
2. All steps default to C3. Use that note to tune the synth (warm analog gear up first).
3. `hold B5 + turn any E` to move the default pitch to the key's root note.
4. Press B7 and mute steps you will not use.

## 7.2 Step-enter notes

1. Select track. Press B5.
2. Turn the encoder for each step. DISP shows the note.
3. Optional: press B13 and pick a chord per step.

## 7.3 Real-time record (note track)

1. Press B65. DISP shows NOTE (play notes, no recording).
2. Press B64 to cycle NOTE → MONITOR → RECORD → NOTE.
   - **MONITOR:** pattern plays (B68), you play along, nothing records.
   - **RECORD:** with playhead running, each key press or incoming MIDI note goes to the nearest step.
3. Play from the virtual keyboard (§3.1) or a MIDI keyboard.
4. Erase: in RECORD, `hold B63 + press the note key` while the playhead passes the steps. Hold for a full pattern to erase every instance.
5. Press B65 to leave.

## 7.4 Drum tracks

- **Set a track to Drum:** B59 (Global), turn E37–E40 for the track to Drum.
- **Drum voice pitches:** in Global, `hold track button (B21–24)`; E25–E40 set voices 1–16. DISP and ring show the note; the note also sounds on the track's outputs.
- **Step-enter:** B65, press drum B5–B20, turn the encoders of the steps you want. Turn again to remove. Ring LED marks programmed steps.
- **Fill all steps:** `hold drum button + turn any E CW`. Clear all: same, CCW.
- **Random:** select drum (B5–B20), `hold B65 + press B12`. Remove single steps by turning CCW.
- **Real-time:** B65, then B64 toggles MONITOR / RECORD. Erase with `hold B63 + drum button`.

## 7.5 Mixer and note repeat

1. Stop the sequencer. Press B66.
2. B21–B24 mute tracks; B5–B20 mute drum voices. Green = on, red = muted.
3. Note repeat: `hold B64 + turn any E` for rate (96, t32, 32, t16, 16, t8, 8, t4, 4). Still holding B64, press a track button (whole track) or a drum button (one voice).

## 7.6 Patterns

- **Store (temporary):** `hold B61`, page with B63/B64 (1–12), press slot B5–B20. B61 stays lit.
- **Store (permanent):** then press B60, `hold SEL + press B61`. DISP confirms. Without this step the pattern is lost at power-off.
- **Load:** press B62, page with B63/B64, press slot. Press B60. A load while playing switches at the end of the current pattern.
- **Chain:** `hold a pattern button + press another`; patterns play in order.
- **No auto-load:** nothing loads at power-up.
- **Copy track:** `hold destination track button + press source track button`.
- **Copy pattern between tracks:** press the pattern button before the source track (source wording unclear).

## 7.7 Transport

B68 play/stop. B67 back to step 1. Footswitch 1 = start/stop, footswitch 2 = next pattern (when set to ZAQ in Global).
