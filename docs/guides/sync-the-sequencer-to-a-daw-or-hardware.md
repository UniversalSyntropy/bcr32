---
title: Sync the sequencer to a DAW or hardware
description: How to make the BCR32 sequencer follow an outside clock from a DAW over USB or DIN, or from analog sync, and how to send its own clock out.
status: draft
last_updated: 2026-11-13
---

# Sync the sequencer to a DAW or hardware

Goal: make the sequencer run on the tempo of your DAW or of another machine, or make it send its own clock.

| Item | Value |
| --- | --- |
| Mode | ZAQ |
| Time | 15 minutes |
| Firmware tested | 1.0.3. The clock source names are verified. The sync from a DAW is unverified |

## Step 1: choose the operation mode

Global Settings, button printed 3 MUTE (B7), decides which clock sources exist. See [set MIDI ports, channels and routing](set-midi-ports-channels-and-routing.md#step-1-choose-the-operation-mode).

| Operation mode | Clock sources that work |
| --- | --- |
| USB | USB clock, analog sync |
| STDL | Internal clock, MIDI (DIN) clock |
| MIXED | All |

## Step 2: choose the clock source

1. Press the key printed EDIT (B59). The ZAQ Global page opens.
2. Turn the knob printed 2 CLOCK INT/EXT (E26) to the source.
3. Press the key printed EXIT (B60).

**Verified in USB mode:** E26 has two values. INT shows a BPM number (30.0 on our unit). EXT USB IN waits for clock from USB. The manual lists Internal, MIDI, USB and Sync.

## Step 3: send the clock from the DAW

**Ableton Live** (unverified on the BCR32):

1. Open Preferences, then Link, Tempo and MIDI.
2. In the MIDI Ports list, find the output `BCR-32 ZAQ`. Set **Sync** to On.
3. Set the tempo. Press Play in Live.

**Expect:** The playhead moves on the rings. The display shows the tempo. In external mode the start and stop come from the DAW.

**Other DAWs:** Switch on "send clock" or "MIDI sync" for the output port `BCR-32 ZAQ`.

## Step 4: send the clock out

To make the BCR32 the master, choose the internal clock in step 2. Then set the knob printed 3 CLOCK OUT (E27) to the output. Seen in USB mode: OFF and U.

For analog gear, use J77 SYNC OUT. It carries clock and start/stop. J76 SYNC IN takes clock on the tip and start/stop on the ring. Set the ppqn in ZAQ Settings: hold EDIT (B59) and press STORE (B61). B6 is the sync-in rate. B7 is the sync-out rate. The values are 1, 2, 4, 24 and 48.

## If the sequencer does not follow

Community advice from the ZAQ Audio forum for the BCR2000 firmware. Check each item. These are not tests on the BCR32.

- **Clock source:** the clock source is still INT.
- **Port:** the DAW sends the clock on another port.
- **Mute:** the track is muted in the mixer. A muted track shows red. See [program drums and note repeat](program-drums-and-note-repeat.md).
- **Track output:** the output port or the channel of the track does not match the synth.
- **Start:** in external mode the start and stop come from the DAW, not from the unit.
- **Cheap interface:** a cheap USB MIDI interface on a DIN link can add jitter of up to 20 ms. The BCR32 has its own USB port. Use it for the clock.

> **Note:** A forum report says external clock together with transpose on can give stray notes when the DAW also sends notes to the unit. The cause is not known. See [lock notes to a scale and transpose](lock-notes-to-a-scale-and-transpose.md).

## Related

- [ZAQ Global page](../manual/06-zaq-global-page.md)
- [Connect to Ableton Live](connect-to-ableton-live.md)

**Next step:** Enter a pattern. See [enter and play your first pattern](enter-and-play-your-first-pattern.md).
