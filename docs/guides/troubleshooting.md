---
title: Troubleshooting
description: Symptoms and fixes for common BCR32 problems.
status: draft
last_updated: 2026-11-11
---

# Troubleshooting

Each entry lists the symptom, the likely cause and the fixes in the order to try them. Entries marked unverified haven't been confirmed on a unit.

## Control Tribe says "stop the sequencer"

**Symptom:** the Control Tribe app opens two of its three areas, but Device Settings is blocked with a message to stop the sequencer. The sequencer looks stopped on the unit.

**Likely cause:** something is running the sequencer. The most common source is a DAW sending MIDI clock and start to the BCR32, so the sequencer runs while the DAW's transport plays. This cause isn't documented in the official manual.

<!-- UNVERIFIED: cause and fix order. Update with the step that worked. -->

Try these in order, and check Device Settings again after each:

1. Press PLAY/STOP (B68). If the sequencer was running, the playhead LEDs on the encoder rings stop moving.
2. Stop your DAW's transport.
3. Turn off MIDI clock (Sync) for the BCR32 output ports in your DAW. In Ableton Live: Settings, then **Link, Tempo & MIDI**.
4. Quit the DAW so it releases the USB MIDI port.
5. Press ZQR/CTRL (B1) until the buttons glow amber (controller mode).
6. Unplug the USB cable and plug it in again.

If Device Settings stays blocked, change the same settings on the unit: hold ZQR/CTRL (B1) for 3 seconds to open Global Settings. See [Global Settings](../reference/bcr32-reference.md#91-global-settings-b1-3s-sel-to-change-push-sel-to-save).

## Stored pattern is gone after power-off

**Cause:** a first STORE is temporary. The official manual describes a second step that makes it permanent.

1. Store the pattern: hold STORE (B61), choose a page with B63 or B64, then press a slot button (B5–B20).
2. Press EXIT (B60).
3. Hold SEL and press STORE (B61). The display confirms the store.

The unit doesn't load a pattern at power-up. Load it with LOAD (B62).

## Some settings or clock sources are missing

**Cause:** the operation mode limits the available functions. `USB` disables DIN MIDI and the internal clock. `STDL` disables USB and analog sync.

Hold ZQR/CTRL (B1) for 3 seconds, press B7, and set the mode to `MIXED`.
