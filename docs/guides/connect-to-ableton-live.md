---
title: Connect to Ableton Live
description: Send BCR32 sequencer notes and controller messages to Ableton Live over USB, and let Live run the clock.
status: draft
last_updated: 2026-11-18
source: BCR32 User Manual V2.0, pages 17–25; Ableton Live 12 settings; tests on a unit, firmware 1.0.3, 2026-11-18
---

# Connect to Ableton Live

This guide sends the BCR32's four sequencer tracks and its controller messages to Ableton Live over one USB cable. Live runs the clock and starts the sequencer.

> **Note:** Verified on firmware 1.0.3 (2026-11-18) with Live 12 on macOS: Live clock and start/stop, and notes from all four tracks on USB. The BCR32-as-master route in the clock table is unverified.

## Before you start

- **Cable:** a USB-C data cable from the POWER/DATA socket (J70) to your computer. The POWER socket (J69) carries power only.
- **Software:** Ableton Live 12. Other versions use the same settings with slightly different names.
- **Firmware:** update the unit with the Control Tribe app first.

## MIDI ports

The BCR32 has two USB MIDI ports. Live shows each one with the device name in front.

| Port | Name in Live | What it carries |
| --- | --- | --- |
| BCR-32 CTRL | Behringer BCR-32 (BCR-32 CTRL) | Controller messages from the unit. Clock and start/stop to the unit. |
| BCR-32 ZAQ | Behringer BCR-32 (BCR-32 ZAQ) | The sequencer port. |

Live names the ports from its own side:

- **Input port:** messages from the unit into Live.
- **Output port:** messages from Live out to the unit.

> **Warning:** If Live or Audio MIDI Setup shows only one port named "Behringer BCR-32", or a port named "BCR-001", macOS has an old copy of the port list. Fix it before you continue. See [Only one BCR32 port in Live](#only-one-bcr32-port-in-live).

## Set up the unit

1. Hold ZQR/CTRL (B1) for 3 seconds. B1 and B5–B12 glow blue (Global Settings).
2. Press B7 (Operation mode). Turn SEL to `USB`, then push SEL. Choose `MIXED` instead if you also use the DIN MIDI or CV jacks.
3. Press B1. The unit returns to normal operation.
4. In sequencer mode (pink buttons), press EDIT (B59). The ZAQ Global page opens.
5. Turn the knob printed 2 (E26) to `EXT USB IN`. The unit now waits for Live's clock.
6. Set the knobs printed 17, 19, 21 and 23 (E41, E43, E45, E47) to `U` (USB). These set the outputs for tracks 1–4.
7. Set the knobs printed 18, 20, 22 and 24 (E42, E44, E46, E48) to channels 1, 2, 3 and 4. Press EXIT (B60).

**Verified on firmware 1.0.3 (2026-11-18):** after a change of the Operation mode, E26 can show a different clock source. Read E26 again after step 2.

For controller mode, also set the output routing:

1. Press B1 until the buttons glow amber (controller mode).
2. Hold EDIT (B59) and press STORE (B61). B5 and B6 glow blue.
3. Press B5. Turn SEL to `USB`, then push SEL. Press EXIT (B60).

## Set up Live

1. Open Live's Settings, then the **Link, Tempo & MIDI** tab.
2. Set the four ports as in the table below.
3. Create four MIDI tracks. Set **MIDI From** to "BCR-32 ZAQ" and the channels to 1, 2, 3 and 4.
4. Set **Monitor** to **In** on each track and load an instrument.

| Port | Track | Sync | Remote |
| --- | --- | --- | --- |
| Input BCR-32 ZAQ | on | off | off |
| Input BCR-32 CTRL | on | off | on |
| Output BCR-32 CTRL | off | **on** | off |
| Output BCR-32 ZAQ | off | off | off |

**Verified on firmware 1.0.3 (2026-11-18):** the sequencer follows clock and start/stop from the **CTRL** output port. With Sync on the ZAQ output port only, the sequencer did not start.

- **Remote:** Live needs Remote on for Cmd+M mapping of the encoders.
- **MIDI Clock Type:** Pattern suits a step sequencer. Song also worked in the test.

## Choose the clock master

Only one device should run the clock.

| Master | On the unit | In Live | Status |
| --- | --- | --- | --- |
| Live (we recommend this) | GLOBAL (B59), set E26 to `EXT USB IN` | Output "BCR-32 CTRL": **Sync** on | verified, firmware 1.0.3 |
| BCR32 | GLOBAL (B59), set E26 to the internal clock and E27 to a routing that includes USB | Input port: **Sync** on, then turn on **EXT** in the control bar | unverified |

With Live as master:

- **Start and stop:** they come from Live. PLAY/STOP (B68) on the unit flashes and does not start the sequencer.
- **After a settings change:** press Stop, then Play in Live. The unit needs a new start message.
- **Hardware start:** to start from a control, map it to Live's Play with Cmd+M. B68 sends no MIDI, so you cannot map it.

> **Warning:** With Live as master, Live's transport starts the BCR32 sequencer. Control Tribe blocks Device Settings while the sequencer runs. See [Troubleshooting](troubleshooting.md#control-tribe-says-stop-the-sequencer).

### Use another app's tempo through Ableton Link

To follow the tempo of a DJ app or another Link app, turn on Link in that app and in Live. Live then passes the shared tempo to the BCR32 as MIDI clock. Keep the other app's own MIDI clock output off, so the unit gets only one clock.

Some Link apps share tempo but not start and stop. Then Live's Play still starts the BCR32.

## Map controller encoders in Live

1. Put the unit in controller mode (amber buttons).
2. In Live, press Cmd+M (macOS) or Ctrl+M (Windows) to enter MIDI Map Mode.
3. Click a parameter in Live, then turn a BCR32 encoder.
4. Press Cmd+M or Ctrl+M again to leave MIDI Map Mode.

To change what an encoder sends, see [Assign a control](../manual/08-controller.md#81-assign-a-control).

## Check it works

- **Clock:** press Play in Live. The sequencer runs and the playhead moves on the rings.
- **Notes:** the MIDI activity meter on each Live track moves.
- **Controller:** turn an encoder in controller mode. The MIDI indicator in Live's control bar flashes.

## If it does not work

### Only one BCR32 port in Live

macOS can keep an old port list for the unit. This was seen on one computer: it showed one port, "Behringer BCR-32", and an offline device "Behringer BCR-001".

> **Warning:** After this fix, Live forgets its settings for the BCR32 ports. Set them again as in [Set up Live](#set-up-live).

1. Quit Live. Unplug the BCR32 USB cable.
2. Open Audio MIDI Setup, then Window > Show MIDI Studio.
3. Select each grey BCR32 icon and press Delete.
4. Plug the BCR32 in again.

**Expect:** one BCR32 icon with two ports, BCR-32 CTRL and BCR-32 ZAQ.

### The sequencer runs but sends no notes

1. **Track mute:** stop the sequencer. Press MIXER (B66). The manual says a muted track shows red; the colours are unverified on firmware 1.0.3. Press the track button (T1–T4, B21–B24) to unmute it. Press EXIT (B60).
2. **Track mode:** press EDIT (B59). Set the knob printed 13 (E37) to `CHORD` for a pitch pattern. A drum track uses its own voice buttons.
3. **Quick test:** set the knob printed 17 (E41) to `A&B`. The MIDI A and B lights (top right) flash on each step if the track makes notes. Set E41 back to `U`.

**Verified on firmware 1.0.3 (2026-11-18):** a track muted in the mixer sends no notes on any output. The mute was the cause of "no notes" in the test.

### The sequencer does not start from Live

- **Clock port:** turn on Sync for the output "BCR-32 CTRL", not only "BCR-32 ZAQ".
- **Clock source:** E26 must show `EXT USB IN`.
- **Fresh start:** press Stop, then Play in Live.
