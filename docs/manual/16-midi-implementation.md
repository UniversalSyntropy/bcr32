---
title: MIDI implementation
description: What the BCR32 sends and accepts on its two USB MIDI ports, seen on firmware 1.0.3, with the tests that produced no result.
status: draft
last_updated: 2026-11-12
source: tests on a unit, firmware 1.0.3, 2026-11-11 and 2026-11-12
---

# MIDI implementation

No official MIDI chart exists for the BCR32. Every row in this chapter comes from a test on one unit with [firmware](13-glossary.md#firmware) 1.0.3. Nothing here is a promise for other firmware.

> **Note:** All results are from the USB ports. The DIN ports are untested, because no [DIN MIDI](13-glossary.md#din-midi) interface was available.

## 16.1 Ports

The unit shows two USB MIDI ports to the computer.

| Port | Use |
| --- | --- |
| BCR-32 CTRL | The controller part. The unit sends controller messages from here. |
| BCR-32 ZAQ | The sequencer part. The unit sends nothing here in the tests so far. |

The USB vendor ID is 1397. The product ID is 12CF in normal mode. See `data/devices/bcr32/midi.json` for the full record.

## 16.2 What the unit sends

In [CTRL mode](13-glossary.md#ctrl-mode) the unit sends the messages of the active [preset](13-glossary.md#preset). Each control sends the message that the preset assigns to it.

The table below lists every message seen. Each row names the controls, the preset it came from and how sure we are.

<!-- gen:midi-messages -->

| ID | Port | Mode | Controls | Type | Channel | Number | Values | Trigger |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ctrl-cc97` | BCR-32 CTRL | ctrl | `E25` | cc | 1 | 97 | 1, 2 | likely |
| `ctrl-cc98` | BCR-32 CTRL | ctrl | `E26` | cc | 1 | 98 | 1, 2 | likely |
| `ctrl-preset-name` | BCR-32 CTRL | ctrl | — | sysex | — | — | — | — |
| `ctrl.p1.b5` | BCR-32 CTRL | ctrl | `B5` | cc | 1 | 65 | 127 | proven |
| `ctrl.p1.b6` | BCR-32 CTRL | ctrl | `B6` | cc | 1 | 66 | 127 | proven |
| `ctrl.p1.b7` | BCR-32 CTRL | ctrl | `B7` | cc | 1 | 67 | 127 | proven |
| `ctrl.p1.b8` | BCR-32 CTRL | ctrl | `B8` | cc | 1 | 68 | 127 | proven |
| `ctrl.p1.b9` | BCR-32 CTRL | ctrl | `B9` | cc | 1 | 69 | 127 | proven |
| `ctrl.p1.b10` | BCR-32 CTRL | ctrl | `B10` | cc | 1 | 70 | 127 | proven |
| `ctrl.p1.b11` | BCR-32 CTRL | ctrl | `B11` | cc | 1 | 71 | 127 | proven |
| `ctrl.p1.b12` | BCR-32 CTRL | ctrl | `B12` | cc | 1 | 72 | 127 | proven |
| `ctrl.p1.b13` | BCR-32 CTRL | ctrl | `B13` | cc | 1 | 73 | 127 | proven |
| `ctrl.p1.b14` | BCR-32 CTRL | ctrl | `B14` | cc | 1 | 74 | 127 | proven |
| `ctrl.p1.b15` | BCR-32 CTRL | ctrl | `B15` | cc | 1 | 75 | 127 | proven |
| `ctrl.p1.b16` | BCR-32 CTRL | ctrl | `B16` | cc | 1 | 76 | 127 | proven |
| `ctrl.p1.b17` | BCR-32 CTRL | ctrl | `B17` | cc | 1 | 77 | 127 | proven |
| `ctrl.p1.b18` | BCR-32 CTRL | ctrl | `B18` | cc | 1 | 78 | 127 | proven |
| `ctrl.p1.b19` | BCR-32 CTRL | ctrl | `B19` | cc | 1 | 79 | 127 | proven |
| `ctrl.p1.b20` | BCR-32 CTRL | ctrl | `B20` | cc | 1 | 80 | 127 | proven |
| `ctrl.p4.e25` | BCR-32 CTRL | ctrl | `E25` | cc | 1 | 5 | 2, 3 | proven |
| `ctrl.p4.e26` | BCR-32 CTRL | ctrl | `E26` | cc | 1 | 40 | 2, 3 | proven |
| `ctrl.p4.e27` | BCR-32 CTRL | ctrl | `E27` | cc | 1 | 41 | 3, 4, 5 | proven |
| `ctrl.p4.e28` | BCR-32 CTRL | ctrl | `E28` | cc | 1 | 42 | 1, 2 | proven |
| `ctrl.p4.e29` | BCR-32 CTRL | ctrl | `E29` | cc | 1 | 44 | 1, 2 | proven |
| `ctrl.p4.e32` | BCR-32 CTRL | ctrl | `E32` | cc | 1 | 7 | 0, 1 | proven |
| `ctrl.p4.e33` | BCR-32 CTRL | ctrl | `E33` | cc | 1 | 87 | 0, 1 | proven |
| `ctrl.p4.e34` | BCR-32 CTRL | ctrl | `E34` | cc | 1 | 88 | 0, 1 | proven |
| `ctrl.p4.e35` | BCR-32 CTRL | ctrl | `E35` | cc | 1 | 89 | 0, 1 | proven |
| `ctrl.p4.e36` | BCR-32 CTRL | ctrl | `E36` | cc | 1 | 90 | 0, 1 | proven |
| `ctrl.p4.e37` | BCR-32 CTRL | ctrl | `E37` | cc | 1 | 85 | 0, 1 | proven |
| `ctrl.p4.e39` | BCR-32 CTRL | ctrl | `E39` | cc | 1 | 18 | 0, 1 | proven |
| `ctrl.p4.e40` | BCR-32 CTRL | ctrl | `E40` | cc | 1 | 45 | 0, 1 | proven |
| `ctrl.p4.e41` | BCR-32 CTRL | ctrl | `E41` | cc | 1 | 14 | 0, 1 | proven |
| `ctrl.p4.e42` | BCR-32 CTRL | ctrl | `E42` | cc | 1 | 15 | 0, 1 | proven |
| `ctrl.p4.e43` | BCR-32 CTRL | ctrl | `E43` | cc | 1 | 16 | 0, 1 | proven |
| `ctrl.p4.e44` | BCR-32 CTRL | ctrl | `E44` | cc | 1 | 17 | 1, 2 | proven |
| `ctrl.p4.e45` | BCR-32 CTRL | ctrl | `E45` | cc | 1 | 73 | 126, 127 | proven |
| `ctrl.p4.e46` | BCR-32 CTRL | ctrl | `E46` | cc | 1 | 9 | 0, 1 | proven |
| `ctrl.p4.e47` | BCR-32 CTRL | ctrl | `E47` | cc | 1 | 12 | 0, 1 | proven |
| `ctrl.p4.e48` | BCR-32 CTRL | ctrl | `E48` | cc | 1 | 72 | 126, 127 | proven |
| `ctrl.p4.e49` | BCR-32 CTRL | ctrl | `E49` | cc | 1 | 49 | 0, 1 | proven |
| `ctrl.p4.e50` | BCR-32 CTRL | ctrl | `E50` | cc | 1 | 50 | 0, 1 | proven |
| `ctrl.p4.e51` | BCR-32 CTRL | ctrl | `E51` | cc | 1 | 51 | 0, 1 | proven |
| `ctrl.p4.e52` | BCR-32 CTRL | ctrl | `E52` | cc | 1 | 52 | 0, 1 | proven |
| `ctrl.p4.e53` | BCR-32 CTRL | ctrl | `E53` | cc | 1 | 46 | 0, 1 | proven |
| `ctrl.p4.e54` | BCR-32 CTRL | ctrl | `E54` | cc | 1 | 47 | 1, 2 | proven |
| `ctrl.p4.e55` | BCR-32 CTRL | ctrl | `E55` | cc | 1 | 53 | 0, 1 | proven |
| `ctrl.p4.e56` | BCR-32 CTRL | ctrl | `E56` | cc | 1 | 48 | 0, 1, 2, 3 | proven |

<!-- gen:end -->

- **Proven:** the control was pressed on its own and the message was logged.
- **Likely:** the message matches the stored assignment, but the action time is not known.
- **Silent controls:** buttons B21 to B24 and B65 to B68 sent nothing on any port. The [encoders](13-glossary.md#encoder) E30, E31 and E38 are unassigned in preset 4.
- **Preset switch:** the unit changed its active preset between two runs. The cause is not proven.

## 16.3 What the unit did not do

A test with no message or no effect is a result. These tests found nothing to log.

<!-- gen:midi-silences -->

| ID | Port | Mode | Action | Result |
| --- | --- | --- | --- | --- |
| `idle` | — | zaq | Leave the unit idle with both ports open. | No clock, no active sensing and no other message. |
| `zaq-keyboard` | — | zaq-record | Press the virtual keyboard buttons in NOTE mode. | Nothing on either port. |
| `zaq-transport` | — | zaq | Press PLAY/STOP (B68) to start, then to stop. | Nothing on either port. B68 was solid red while the sequencer ran. |
| `ctrl-first-listen` | BCR-32 CTRL | ctrl | Turn encoder 1 once and press button 1 once, before the routing was read. | Nothing on USB. |
| `ctrl-silent-track-buttons` | BCR-32 CTRL | ctrl | Press B21, B22, B23 and B24 once each, in presets 1 and 4. | Nothing on any port, in four runs. |
| `ctrl-silent-right-buttons` | BCR-32 CTRL | ctrl | Press B65, B66, B67 and B68 once each. | Nothing on any port, in four runs. |
| `ctrl-silent-unassigned-knobs` | BCR-32 CTRL | ctrl | Turn E30, E31 and E38 (knobs printed 6, 7 and 14) both ways. | Nothing. The three knobs have no lit LED ring. |
| `ctrl-silent-preset-buttons` | BCR-32 CTRL | ctrl | Press B64, then B63. | Nothing on any port. |
| `ctrl-pushes` | BCR-32 CTRL | ctrl | Push each knob E25 to E56 once, without turning it. | 28 of 32 pushes sent nothing. Four pushes sent a message that is not explained. |
| `inbound-identity-ctrl` | BCR-32 CTRL | zaq | Send the identity request F0 7E 7F 06 01 F7 to the CTRL port. | No reply and no change on the unit. |
| `inbound-identity-zaq` | BCR-32 ZAQ | zaq | Send the identity request F0 7E 7F 06 01 F7 to the ZAQ port. | No reply and no change on the unit. |
| `inbound-start-stop` | BCR-32 ZAQ | zaq | Send start (FA), then 3 seconds later stop (FC), to the ZAQ port. | No reply. PLAY/STOP did not light. The unit stayed with the internal clock source. |
| `inbound-note` | BCR-32 ZAQ | zaq | Send note on (channel 1, note 60, velocity 100), then note off, to the ZAQ port. | No reply and no change. Transpose was Off. |
| `inbound-cc-pc` | BCR-32 ZAQ | zaq | Send controller change 1 value 64, then program change 2, on channel 1 to the ZAQ port. | No reply. The pattern did not change. Pattern change channel (B13) was Off. |

<!-- gen:end -->

> **Warning:** The unit sends no reply when it ignores a message. A silent result does not prove that the unit did nothing. It proves only that the output, the [display](13-glossary.md#display-disp) and the LEDs did not change.

## 16.4 What the unit accepts

Five tests sent standard messages to the unit with the settings as found. None had an effect. Section 16.3 lists them.

| Message | Needs, probably | Tested |
| --- | --- | --- |
| Start and stop | USB [clock source](13-glossary.md#clock-source) | no |
| Notes as [transpose](13-glossary.md#transpose) | Transpose on (E32) | no |
| [Program change](13-glossary.md#program-change-pc) as [pattern](13-glossary.md#pattern) switch | Pattern change channel (B13) on | no |
| Identity request | A device ID that matches | no |

Each "needs" entry is a guess from the settings. A test of each needs a setting change on the unit. That test needs a fresh backup check first. See the [unit safety protocol](../project/unit-safety.md).

## 16.5 Editor and dump format

[Control Tribe](13-glossary.md#control-tribe) reads controller presets as text, one line per [SysEx](13-glossary.md#sysex) message. It also reads the sequencer state when you connect and when you select a sequencer preset. The [findings page](../reference/capture-findings.md#editor-protocol-step-45) has the message layout.

The backup `.syx` files use another layout. The [findings page](../reference/capture-findings.md#sysex-dump-structure-step-46) describes it. The check value at the end of each [slot](13-glossary.md#slot) is a CRC-32, and the dump rules are solved. See the [SysEx dump format](../reference/sysex-dump-format.md). Do not edit a dump file without a backup.

## 16.6 How to extend this chapter

1. Test on the unit with `midi-capture`. Give the printed number and the ID of every control.
2. Add the result to `data/devices/bcr32/midi.json` with the firmware version.
3. Run `npm run gen:tables`. The tables above and the MIDI column in chapter 14 update.

## 16.7 Message forms verified in test presets

Verified on firmware 1.0.3 on 2026-11-13, USB port `BCR-32 CTRL`, with crafted test presets. The tables in 16.2 hold the first factory presets. This table holds the message forms.

| Setting | What the unit sends |
| --- | --- |
| [CC](13-glossary.md#control-change-cc) absolute | The CC value. The first click gives 1 |
| CC relative-1, relative-2, relative-3 | `01`, `41` and `01` per click clockwise |
| CC absolute 14 bit | CC n (high part), then CC n+32 (low part) |
| [NRPN](13-glossary.md#nrpn) | CC 99 (high), CC 98 (low), then CC 6 (data). Inc/dec sends CC 96 with `01` per click |
| GS/XG cutoff and resonance | NRPN `01:20` and `01:21` |
| GS/XG volume and panorama | Plain CC 7 and CC 10 |
| Encoder [AT](13-glossary.md#aftertouch-at), all notes | Channel pressure (`0xD0`) |
| Encoder AT, one note | Poly pressure (`0xA0`) |
| [Pitch bend](13-glossary.md#pitch-bend-pb) | `0xE0` and `0xE1` for channels 1 and 2 |
| Button toggle off | The value on press, the minimum on release |
| Button toggle on | The value on press only |
| Button PC | A program change with the number as written. The bank sends CC 0 only. CC 32 is never sent |
| [MMC](13-glossary.md#mmc) | `F0 7F <device> 06 <command> F7`. Locate has the longer form with the time bytes |

**Knob pushes:** The push of the knobs printed 1 to 12 (E25 to E36) is `$button` 17 to 28 in the preset text. Each push sent the message that the preset assigns to it. The pushes in 16.3 sent nothing because they had no assignment in those presets. See the [BCL preset text format](../reference/bcl-preset-text-format.md).

**Rejected by the unit:** an encoder AT line with a mode word, a CC with inc/dec, and the LED words `pan/off`, `spread/off` and `qual/off`.
