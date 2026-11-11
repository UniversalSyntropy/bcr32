---
title: Connect to Ableton Live
description: Send BCR32 sequencer notes and controller messages to Ableton Live over USB, and choose a clock master.
status: draft
last_updated: 2026-11-11
source: BCR32 User Manual V2.0, pages 17–25; Ableton Live 12 settings
---

# Connect to Ableton Live

This guide sends the BCR32's four sequencer tracks and its controller messages to Ableton Live over one USB cable. It also sets which device runs the clock.

> **Note:** Unverified. These steps come from the official manual and Live's standard MIDI settings. They haven't been tested end to end on a unit yet.

## Before you start

- **Cable:** a USB-C data cable from the POWER/DATA socket (J70) to your computer. The POWER socket (J69) carries power only.
- **Software:** Ableton Live 12. Other versions use the same settings with slightly different names.
- **Firmware:** update the unit with the Control Tribe app first.

## MIDI ports

On macOS the BCR32 appears as two MIDI ports: "Behringer BCR-32" and "Behringer BCR-001". The official manual doesn't explain the second port. Start with "Behringer BCR-32".

<!-- UNVERIFIED: purpose of the "BCR-001" port. Port names on Windows not checked. -->

## Set up the unit

1. Hold ZQR/CTRL (B1) for 3 seconds. B1 and B5–B12 glow blue (Global Settings).
2. Press B7 (Operation mode). Turn SEL to `USB`, then push SEL. Choose `MIXED` instead if you also use the DIN MIDI or CV jacks.
3. Press B1. The unit returns to normal operation.
4. In sequencer mode (pink buttons), press GLOBAL (B59).
5. Set E41, E43, E45 and E47 to `USB`. These set the outputs for tracks 1–4.
6. Set E42, E44, E46 and E48 to channels 1, 2, 3 and 4. Press EXIT (B60).

For controller mode, also set the output routing:

1. Press B1 until the buttons glow amber (controller mode).
2. Hold EDIT (B59) and press STORE (B61). B5 and B6 glow blue.
3. Press B5. Turn SEL to `USB`, then push SEL. Press EXIT (B60).

## Set up Live

1. Open Live's Settings, then the **Link, Tempo & MIDI** tab.
2. For the input port "Behringer BCR-32", turn on **Track** (to receive notes) and **Remote** (for MIDI mapping).
3. Create four MIDI tracks. Set **MIDI From** to "Behringer BCR-32" and the channels to 1, 2, 3 and 4.
4. Set **Monitor** to **In** on each track and load an instrument.

## Choose the clock master

Only one device should run the clock.

| Master | On the unit | In Live |
| --- | --- | --- |
| Live (we recommend this when Live is the centre of the setup) | GLOBAL (B59), set E26 to `USB` | Output port "Behringer BCR-32": **Sync** on |
| BCR32 | GLOBAL (B59), set E27 to a routing that includes USB | Input port "Behringer BCR-32": **Sync** on, then turn on **EXT** in the control bar |

> **Warning:** With Live as master, Live's transport starts the BCR32 sequencer. Control Tribe blocks Device Settings while the sequencer runs. See [Troubleshooting](troubleshooting.md#control-tribe-says-stop-the-sequencer).

## Map controller encoders in Live

1. Put the unit in controller mode (amber buttons).
2. In Live, press Cmd+M (macOS) or Ctrl+M (Windows) to enter MIDI Map Mode.
3. Click a parameter in Live, then turn a BCR32 encoder.
4. Press Cmd+M or Ctrl+M again to leave MIDI Map Mode.

To change what an encoder sends, see [Assign a control](../reference/bcr32-reference.md#81-assign-a-control).

## Check it works

- **Notes:** press play on the unit (B68) or in Live, depending on the clock master. The MIDI activity meter on each Live track moves.
- **Controller:** turn an encoder in controller mode. The MIDI indicator in Live's control bar flashes.
- **No notes arrive:** set **MIDI From** to "Behringer BCR-001", then check the track channels match E42–E48.
