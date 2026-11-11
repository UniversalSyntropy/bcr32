---
title: Troubleshooting
description: Symptoms and fixes for common BCR32 problems.
status: draft
last_updated: 2026-11-11
---

# Troubleshooting

Each entry lists the symptom, the likely cause and the fixes in the order to try them. Entries marked unverified haven't been confirmed on a unit.

## Control Tribe says "stop the sequencer"

**Symptom:** in the Control Tribe app, a click on **Device Settings** shows a message about stopping the sequencer. It appears even when the sequencer is stopped, in sequencer mode and in controller mode.

**Cause:** the message is a confirmation, not a block. The app shows it every time and sends nothing to the unit until you answer.

**Fix:** press **OK** in the dialog. Device Settings opens. **Cancel** returns you to the previous area.

Verified on firmware 1.0.3 with Control Tribe for macOS, 2026-11-11, on two computers.

> **Warning:** the Device Settings page has a **Factory Reset** button. Don't click it unless you mean to erase the unit.

Device Settings shows these items on firmware 1.0.3:

| Group | Setting | Value seen |
| --- | --- | --- |
| Operating Mode | Mode | USB |
| Operating Mode | Startup App | ZAQ |
| Foot Switch | Foot Switch 1, Foot Switch 2 | CTRL |
| Foot Switch | Polarity | AUTO |
| Encoders | Acceleration | 2 |
| LEDs | Luminosity | 15 |
| SysEx | Device ID | 1 |
| Factory Reset | button | not pressed |

Polarity, Acceleration and Luminosity aren't in the official manual V2.0.

The same settings are on the unit: hold ZQR/CTRL (B1) for 3 seconds to open Global Settings. See [Global Settings](../manual/09-global-sync-memory-and-maintenance.md#91-global-settings-b1-3s-sel-to-change-push-sel-to-save).

## Stored pattern is gone after power-off

**Cause:** a first STORE is temporary. The official manual describes a second step that makes it permanent.

1. Store the pattern: hold STORE (B61), choose a page with B63 or B64, then press a slot button (B5–B20).
2. Press EXIT (B60).
3. Hold SEL and press STORE (B61). The display confirms the store.

The unit doesn't load a pattern at power-up. Load it with LOAD (B62).

## Some settings or clock sources are missing

**Cause:** the operation mode limits the available functions. `USB` disables DIN MIDI and the internal clock. `STDL` disables USB and analog sync.

Hold ZQR/CTRL (B1) for 3 seconds, press B7, and set the mode to `MIXED`.
