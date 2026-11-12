---
title: Unit session findings, firmware 1.0.3
description: What the first session at a real BCR32 proved, which MIDI messages the unit sent, and what stays open.
status: draft
last_updated: 2026-11-11
---

# Unit session findings, firmware 1.0.3

The owner ran the [unit session script](../guides/unit-session-script.md) on 2026-11-11. The unit had firmware 1.0.3. Nothing was sent to the unit. The unit ended in ZAQ mode, stopped.

This page lists the results. The MIDI facts are also in `data/devices/bcr32/midi.json`. The [manual](../manual/README.md) holds the corrected controls.

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
| C Photos | pass | 15 photos and 7 burst frames. The photos stay on the owner's computer. The top-panel photo (P1) shows the control order of the drawing in manual section 3.5. |
| D1 Identity request | blocked | It needs the backup and the capture tool. |

## MIDI facts

- **USB ports:** the unit shows "BCR-32 CTRL" and "BCR-32 ZAQ". Each port has an input and an output.
- **Idle unit:** it sends no clock and no active sensing.
- **ZAQ mode:** the virtual keyboard and the transport sent nothing on USB. Operation mode was USB, which has no internal clock.
- **CTRL mode:** the unit sent controller changes on the CTRL port, channel 1.
- **Preset names:** when the vendor editor opens the controller area, the unit sends its preset names as SysEx. The layout is in `midi.json`.

## Outbound map (step 4.3)

Verified on firmware 1.0.3 on 2026-11-12, in CTRL mode, with the guided `map` tool. The tool listens only. Nothing was sent to the unit. The rows are in `midi.json`.

| Result | Detail |
| --- | --- |
| Buttons B5 to B20 | Each sends one controller change on channel 1, value 127. B5 to B20 send CC 65 to CC 80 in preset 1 ("all controls"). Preset 4 ("Reason Subtractor") sends other numbers |
| Knobs E25 to E56 | 29 of 32 send one controller change each, in preset 4. Clockwise raises the value. Counter-clockwise lowers it |
| Silent knobs | E30, E31 and E38 (knobs printed 6, 7 and 14) send nothing. They have no lit LED ring. Preset 4 has no assignment for them |
| Silent buttons | B21 to B24 and B65 to B68 send nothing, on any port, in four runs |
| Preset buttons | B64 and B63 sent nothing. The display was not read |
| Knob pushes | 28 of 32 pushes sent nothing. E36 sent a MIDI Machine Control play message. E25, E26 and E42 sent controller changes that match other controls. A repeat run is open |

**The preset decides the message.** The backup export holds five controller presets: "all controls", "multi synth", "gm/gs/xg synth", "Reason Subtractor" and "Mackie Control Universal". The run results match the stored assignments in the `.bcl` file: 16 of 16 buttons with preset 1, 29 of 29 knobs with preset 4. Run 1 matched preset 4 for the buttons.

- **Preset change in run 2:** the buttons matched preset 1 and the knobs matched preset 4. The preset changed between B20 and E25. The cause is unproven. The silent buttons B21 to B24 or B65 to B68 may switch the preset.
- **Earlier guess:** the first session listed CC 97 and CC 98 with a guessed control. These rows stay in `midi.json` as "likely". No stored preset explains them.
- **Not tested:** presets 2, 3 and 5, the DIN port and the inbound direction (step 4.4).

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

## Backup exports (step 4.2)

Verified on firmware 1.0.3 on 2026-11-11, with the unit in USB operation mode.

| Fact | Result |
| --- | --- |
| Panel export | STORE (B61), hold SEL, push the knob printed 1 (E25). The display shows "export mode". Then push the knob printed 5 (E29). The display does not change. The unit sent no message on USB in three variants of the second push |
| Cause | Unknown. The dump may leave by a port that the capture tool cannot see |
| Editor export | Control Tribe 1.12.4 saves the memory as `.syx` and as `.bcl` |
| Message size | Each SysEx message holds 273 bytes, from F0 to F7. All data bytes are 7-bit |
| Sequencer memory | 1920 messages, 524,160 bytes. The header is `F0 00 20 32 7F 64 04 0B` |
| Controller memory | 512 messages, 139,776 bytes. This is 64 presets of 8 messages. The header ends in `0C` |
| One preset | The "current preset" file holds 10 messages. It is not a block inside the all-presets file |
| `.bcl` file | ASCII text with CRLF line ends. It starts with `$rev BCR32` and `$global`, and holds the same data as the `.syx` file |
| Repeat exports | Two exports of unchanged memory are identical, for the sequencer and for the controller |
| Clock source | The clock source is part of the sequencer file. Changing it from INT to USB changed 2 bytes. Setting it back gave a file identical to the first |

> **Warning:** The knob printed 25 (E49) opens the erase menu. The manual calls it "the 25th encoder (50)". Use the printed number and the ID together in every instruction.

## SysEx dump structure (step 4.6)

Offline analysis of the step 4.2 export files. Firmware 1.0.3. Nothing was sent to the unit. Every row is read from the files; no row is a test on the unit.

| Fact | Result |
| --- | --- |
| Message frame | `F0 00 20 32 7F 64 04 <memory>`, then 4 address bytes, then 260 nibbles (256 data nibbles and the 4 trailer nibbles), then `F7`. The memory byte is `0B` for the sequencer and `0C` for the controller |
| Data encoding | Each data byte is one nibble (0 to 15). Two nibbles make one byte, high nibble first. One message holds 130 bytes |
| Address bytes | `kind`, `slot high`, `slot low`, `part`. The slot number is `slot high` x 16 + `slot low` |
| Controller file | `kind` 0 only. 64 slots, 8 parts each. One slot is 1,040 bytes. Messages run in slot order, then part order |
| Sequencer file | 192 slots. Messages 0 to 1535 are `kind` 0, 8 parts per slot (1,040 bytes). Messages 1536 to 1919 are `kind` 4, 2 parts per slot (260 bytes). The two blocks are not interleaved |
| Current preset file | `kind` 1 (8 parts) and `kind` 4 (2 parts), all with slot 0. The `kind` 4 block equals the `kind` 4 block of slot 0 in the all-presets file. The `kind` 1 block differs from the `kind` 0 block of slot 0 |
| Empty controller slot | All data bytes are `FF`, except the last 2 bytes of each message (see Trailer). Slots 4 to 62 are empty |
| Used controller slots | Slots 0, 1, 2, 3 and 63 start with `05 C2 00`. This matches the five presets in the `.bcl` file |
| Controller records | In the used slots the data after `05 C2 00` is a stream of records. The records seen start with `02`. Their bytes include the CC number (for example `01` for knob 1, `51` for the first knob of the second bank) and a counter. The field meaning is not decoded |
| Names | Preset names do not appear in the 1,040 bytes of a slot. Where the unit keeps them is unknown |
| Trailer | The last 2 bytes of each message (4 nibbles) are a 16-bit sum, high byte first. The rule is proved (see below) |
| Clock source | The 2-byte change of step 4.2 is in the `kind` 4 block of sequencer slot 0, part 1. Data byte 25 went from `00` to `03`. The last byte of the block went from `08` to `0B` |
| Repeat exports | The four sequencer files form two identical pairs (files 1 and 4, files 2 and 3). The two controller files are identical |

**Trailer rule (proved, offline):** the trailer is the sum of every byte of the message from `F0` up to the last data nibble, modulo 65,536. It is written as 4 nibbles, high first, before `F7`. The sum includes the frame, the memory byte, the address bytes and the data nibbles (as raw values 0 to 15). The sum excludes the trailer and `F7`.

- **Proof:** the rule holds for all 8,266 messages in the eight backup files (2 controller, 5 sequencer, 1 current preset), with no exception. Run `node tools/midi-capture/src/dump-trailer.ts <file.syx>`.
- **Why the old tests failed:** the trailer belongs to each message, not to each slot block. Each message has its own address, so the part number and slot number change the sum. That is why empty slots differ by the slot number.
- **Clock source:** a data nibble pair from `00` to `03` raises the sum by 3. This matches the +3 seen in step 4.2.

> **Warning:** The rule describes the files. It is not proved that the unit rejects a wrong trailer, or accepts a right one. Do not send an edited dump. Restore stays with the owner, in Control Tribe.

**Limits of this analysis:** one firmware (1.0.3); five used controller slots; one sequencer change; the unit's own check is untested. The sequencer slot contents are not decoded beyond size. The `.bcl` fields are not yet matched to record bytes.

## Editor protocol (step 4.5)

Observed on firmware 1.0.3 with Control Tribe 1.12.4, on 2026-11-12. The capture tool listens only. It sees what the unit sends. It does not see what the editor sends. Every row below is the unit's side of the exchange. The log is in `local/captures/` and is not tracked.

**Frame:** `F0 00 20 32 00 64 <command> <data> F7`. Byte 4 is `00` here. The backup dumps have `7F` in that place. All messages came from the CTRL port.

| Editor action | Unit sends | Count |
| --- | --- | --- |
| Connect | One message with command `00` that ends `01 00 03`. Then about 40 short messages (commands `17` to `1F`, `23` to `28`, `30`, `50` to `57`, `74`). Then commands `29` to `2D` once for each of tracks 0 to 3. Then commands `48`, `47`, `46` and `45` | 129 in 1.6 s |
| Open the Device Settings page | Nothing | 0 |
| Open the controller area | 65 preset names (command `21`), then the current preset as BCL text (command `20`) | 322 |
| Select controller preset 2 | 65 preset names again. The current name is now "multi synth" | 65 |
| Open the sequencer area | Nothing | 0 |
| Open the track 1 tab | One message: `48 01 00` | 1 |
| Select sequencer preset 2 | `48 02 00`, then the settings, the four-track block and the pattern block as at connect | 117 |
| Select controller preset 1 | 65 preset names. The current name is "all controls" | 65 |
| Select sequencer preset 1 | Nothing | 0 |

| Command | Layout | Meaning |
| --- | --- | --- |
| `21` | `00`, slot, 32 ASCII characters | Preset name. Slot `7F` is the current preset. Slots 0 to 63 are the stored presets. The list has 65 messages |
| `20` | line number (2 bytes, high first, 7 bits each), ASCII text | One line of BCL text. 257 lines (0 to 256) make a complete `$rev` to `$end` file |
| `45`, `46`, `47`, `48` | `01`, track, index, values | Sequencer data for tracks 0 to 3. Field meaning is not decoded |
| `29` to `2D` | track, values | Per-track values. Field meaning is not decoded |

**BCL text check:** the 255 lines of the current preset match the `.bcl` backup of preset 1 in 248 lines. The 7 other lines differ only in `.default` values (3 and 2 against 0). They may be live knob positions. This is unverified.

**What this means:**

- The unit sends controller presets as plain BCL text, line by line. The backup `.syx` uses another format (nibbles, `7F` in byte 4).
- The editor reads the settings and the sequencer state once at connect. It asks again only when you select a preset.
- A change of the current controller preset changes the unit's state. Step 6 of the session put it back.
- The `48` message may carry the preset number. Selecting sequencer preset 1 sent nothing, so this is not confirmed.

> **Warning:** Selecting a preset in the editor changes the unit's current preset. It does not write to the memory. Check the preset on the unit after each session.

**Limits:** the editor's own messages were not seen. They need a MIDI monitor that sits between the editor and the unit. The first step of any write is therefore still unknown. No message was re-sent to the unit.

## Inbound tests (step 4.4)

Run on firmware 1.0.3 on 2026-11-12, with the owner at the unit. Settings were as found: USB operation mode, internal clock source, pattern change channel Off, transpose Off. A listener ran on all ports for every test. The unit sent no message in reply to any test. The owner watched the display and the LEDs.

| Test | Message | Port | Effect seen |
| --- | --- | --- | --- |
| T1 | Identity request `F0 7E 7F 06 01 F7` | CTRL | None. No reply |
| T2 | Identity request `F0 7E 7F 06 01 F7` | ZAQ | None. No reply |
| T3 | Start `FA`, 3 s later Stop `FC` | ZAQ | None. PLAY/STOP did not light |
| T4 | Note on `90 3C 64`, 1 s later note off `80 3C 00` | ZAQ | None |
| T5 | CC 1 value 64 on channel 1 (bytes `0xB0 0x01 0x40`), then program change 2 (bytes `0xC0 0x02`) | ZAQ | None. The pattern did not change |

**Memory check:** after the tests, a new sequencer export was identical to the first export (1,920 messages, no difference). The tests changed no sequencer memory.

**Limits:**

- The unit may act on these messages with other settings. Start and Stop may need the USB clock source. Notes need transpose on. Program change needs pattern change on (B13). Each case needs a setting change, which is tier 2 and is not done.
- The results are for the unit's USB ports only. DIN ports are untested.
- The identity request got no reply on either port. A reply may need a different device ID. Not tested.

**Unexplained:** after the editor session the T3 and T4 LEDs differed from the photo of 2026-11-11. After a power cycle, T4 was red where the photo shows it off. The memory export is unchanged. The cause is unknown.

> **Warning:** The unit sends no reply when it ignores a message. A silent result does not prove that the unit did nothing. It proves only that the display, the LEDs and the output did not change.

## Open items

| Item | Next step |
| --- | --- |
| Control-to-message map | Step 4.3 (done) |
| Inbound effects with other settings (clock source USB, transpose on, pattern change on) | A session with the owner, tier 2, fresh backup check |
| Editor-to-unit messages (what the editor asks) | A virtual port between the editor and the unit; decide with the owner |
| Record layout of the dumps (the trailer rule is done) | Compare more changes: edit one setting in Control Tribe, export, diff (owner at the unit, step 4.5 or later) |
| Identity request (D1) | Done in step 4.4 (T1, T2): no reply. A test with another device ID needs the owner's yes |
| Seven errata rows that need a change to the unit | A later session after the backup |
| Legend colours on the parameter buttons | See below |
| Values of B13 to B15 and B7 | A later session that changes a setting |

**Legend colours:** the data holds coloured legends on some parameter buttons. They come from the manual's illustration. In the photos, the legends of B5 to B20 all look white. A close photo check must settle this. Do not change the label colours before that check.
