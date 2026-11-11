---
title: Unit session findings, firmware 1.0.3
description: What the first session at a real BCR32 proved, which MIDI messages the unit sent, and what stays open.
status: draft
last_updated: 2026-11-11
---

# Unit session findings, firmware 1.0.3

The owner ran the [unit session script](../guides/unit-session-script.md) on 2026-11-11. The unit had firmware 1.0.3. Nothing was sent to the unit. The unit ended in ZAQ mode, stopped.

This page lists the results. The MIDI facts are also in `data/devices/bcr32/midi.json`. The [reference](bcr32-reference.md) holds the corrected controls.

## Results

| Test | Result | Finding |
| --- | --- | --- |
| A1 Firmware version | pass | B11 shows 1.0.3. |
| A2 USB product ID | pass | The product ID is `12CF` in application mode. The bootloader ID is `12CE`, so the unit was not in the bootloader. |
| A3 Global Settings | pass | The menu has 11 settings. B13 to B15 are pattern change channel, encoder acceleration and footswitch polarity. LED luminosity has no button. |
| A4 Operation mode | pass | B7 shows the operation mode. USB was set. |
| A5 ZAQ Settings B8 | pass | B8 shows sync-in start with the value GATE. CLOCK was not seen. |
| A6 CTRL Settings | pass | Output port is USB. MIDI thru is off. B7 is a third item, echo dead time, set to 100 ms. |
| A7 LOAD paging | pass | B64 pages up. B63 pages down. |
| H1 Virtual keyboard | pass, no output | The unit sent nothing on USB. No note map was read. |
| H2 Transport | pass, no output | B68 was solid red while the sequencer ran. The unit sent no message on USB. |
| H3 Controller output | partial | The unit sent four controller changes. The control for each change is not proven. |
| C Photos | pass | 15 photos and 7 burst frames. The photos stay on the owner's computer. |
| D1 Identity request | blocked | It needs the backup and the capture tool. |

## MIDI facts

- **USB ports:** the unit shows "BCR-32 CTRL" and "BCR-32 ZAQ". Each port has an input and an output.
- **Idle unit:** it sends no clock and no active sensing.
- **ZAQ mode:** the virtual keyboard and the transport sent nothing on USB. Operation mode was USB, which has no internal clock.
- **CTRL mode:** the unit sent controller changes on the CTRL port, channel 1.
- **Preset names:** when the vendor editor opens the controller area, the unit sends its preset names as SysEx. The layout is in `midi.json`.

| Controller | Name | Values seen | Likely control |
| --- | --- | --- | --- |
| CC 97 | Data Decrement | 1, 2 | E25 turn |
| CC 65 | Portamento On/Off | 127 | B5 |
| CC 66 | Sustenuto Pedal | 127, 0 | B6 (toggle) |
| CC 98 | NRPN LSB | 1, 2 | E26 turn |

> **Note:** the owner gave no action times. The "likely control" column is a guess. Step 4.3 maps each control to its message.

Two facts need a second run:

- **B5:** run 1 sent no message for B5. Run 2 sent CC 65. The cause is unknown.
- **E25 push:** the owner pushed E25 and saw no message. The push may be unassigned, or it needs a firmer push.

## Corrections to the reference

- **Global Settings:** three rows added (B13 to B15). The errata row is resolved.
- **CTRL Settings:** one row added (B7, echo dead time). A new errata row records it.
- **LOAD:** B63 and B64 are confirmed.
- **Operation mode:** B7 is confirmed. The value MIXED is untested.
- **ZAQ Settings B8:** the name and one value are confirmed. The draft tag in the manual stays until CLOCK is seen.
- **Virtual keyboard:** the row stays open, because the unit sent no notes.

## What the photos show

- **Selected item flashes:** in a settings menu, the button of the selected item flashes. A photo can show it off. CTRL Settings shows B6 and B7 blue and B5 off while B5 is selected.
- **Flashing buttons:** STORE (B61), LD/LRN (B62), INST SEL (B65) and MIXER (B66) flash while selected. Two shots (P13 and P14) do not show the flash.
- **Lit colours:** the CTRL Settings lit buttons are now sourced from the unit.

## Open items

| Item | Next step |
| --- | --- |
| Control-to-message map | Step 4.3 |
| Identity request (D1) | Steps 4.1 and 4.2, then the owner's yes |
| Seven errata rows that need a change to the unit | A later session after the backup |
| Legend colours on the parameter buttons | See below |
| Values of B13 to B15 and B7 | A later session that changes a setting |

**Legend colours:** the data holds coloured legends on some parameter buttons. They come from the manual's illustration. In the photos, the legends of B5 to B20 all look white. A close photo check must settle this. Do not change the label colours before that check.
