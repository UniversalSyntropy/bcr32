---
title: SysEx dump format
description: The byte layout of the BCR32 All Presets export file (.syx), with the slot, record, name, CRC and trailer rules read from firmware 1.0.3.
status: draft
last_updated: 2026-11-13
---

# SysEx dump format

The editor writes a `.syx` file when you export. The file is a list of SysEx messages. This page shows how to read the controller file. It lists what is verified on firmware 1.0.3 and what stays open.

The text form of a preset is in the [BCL preset text format](bcl-preset-text-format.md). The first analysis is in the [findings](capture-findings.md#sysex-dump-structure-step-46).

> **Warning:** Do not send an edited dump to the unit. We do not know if the unit rejects a wrong checksum. Restore stays with the owner, in Control Tribe.

## File

| Item | Value |
| --- | --- |
| Export type | All Presets, format SYX |
| Size | 139,776 bytes for the controller. 524,160 bytes for the sequencer |
| Messages | 512 for the controller: 64 slots of 8 messages |
| Order | Slot order, then part order |

## Message

```text
F0 00 20 32 7F 64 04 0C <kind> <slot high> <slot low> <part> <260 nibbles> F7
```

| Field | Meaning |
| --- | --- |
| `04` | Dump command |
| `0C` | Controller memory. The sequencer uses `0B` |
| `kind` | `0` for the controller slots |
| Slot number | `slot high` times 16, plus `slot low`. Slot 0 is preset 1 (ID 0). Slot 63 is preset 64 (ID 63) |
| `part` | 0 to 7. A slot has 8 parts |
| Nibbles | 256 data nibbles, then 4 trailer nibbles. Each nibble holds 0 to 15 |

**Data bytes:** Join two nibbles, high first, to make one byte. One message holds 128 data bytes. A slot holds 1,024 data bytes after you join its 8 parts.

**Message trailer:** The 4 trailer nibbles are one 16-bit sum, high byte first. The sum is every byte of the message from `F0` to the last data nibble, modulo 65,536. Nibbles count as raw values 0 to 15. The sum includes the address bytes. Verified for all 8,266 messages of eight files.

## Slot

| Slot bytes | Content |
| --- | --- |
| 0 to 2 | Start marker `05 C2 00` for a used slot |
| 3 onward | Records of 11 bytes each, up to the first `FF` |
| 996 to 1019 | Preset name, 24 ASCII characters, padded with spaces |
| 1020 to 1023 | CRC-32 of slot bytes 0 to 1019, little-endian |

**Empty slot:** Every data byte is `FF`. Slots 4 to 62 were empty on our unit. Slots 0 to 3 and 63 were used.

**Unstable byte:** Slot 63, byte 99 changed between early exports without an edit. Ignore it when you compare files. The CRC changes with it.

**Maximum records:** The area from byte 3 to byte 995 holds up to 90 records.

## Record

A record has 11 bytes. A record exists only for a control with a function.

| Byte | Meaning |
| --- | --- |
| 0, low 3 bits | Type: `1` PC, `2` CC, `3` NRPN, `4` NOTE or PB, `5` AT, `6` GS/XG, `7` MMC |
| 0, high 5 bits | Channel minus 1. For MMC: device number, low 5 bits |
| 1, encoder, high nibble | LED ring style: `0` off, `1` 1dot, `2` 1dot/off, `3` 12dot, `4` 12dot/off, `5` bar, `6` bar/off, `7` spread, `8` pan, `9` qual, `A` cut, `B` damp, `C` mcu |
| 1, encoder, low nibble | `0` absolute, `1` absolute/14, `2` relative-1, `3` relative-2, `4` relative-3, `5` relative-1/14, `8` inc/dec |
| 1, button | `20` show value, `04` toggleoff, `08` increment. Toggleon has no mode bit |
| 1, MMC | `0C` plus the device number divided by 32, plus `20` for show value. Rate `25f` adds `08` |
| 2 and 3 | Controller, note or NRPN number as 16 bits, little-endian. GS/XG parameter index. AT "all" is `FF FF`. PC "off" is `A5 F5` |
| 4 | Minimum or first value. MMC locate: minutes |
| 6 | Maximum or second value. 14-bit maximum uses bytes 6 and 7 |
| 8 | Button increment step. Encoders: the default value times 2, plus 1, as 8 bits (default 64 gives `81`, 127 gives `FF`). Pitch bend always shows `81` |
| 10 | Element id. Encoders 1 to 32 use ids 1 to 32. Button ids are not contiguous |

**MMC command byte (byte 2):** `0` play, `1` pause, `2` stop, `3` fast forward, `4` rewind, `5` locate, `6` punch-in, `7` punch-out.

**Not decoded:**

- **Bytes:** 3, 5, 7 and 9 for most types.
- **LED nibbles:** `D` to `F`.
- **Last record:** byte 10 of the last record reads `FF`.
- **Pitch bend:** bytes 6 and 7 hold `5A FA`.
- **Other:** the default value rule, and the sequencer slots.

## Read it with a script

Our scratch decoder joins the nibbles, splits the slots, and cuts the records. The rules above are enough to write one. Check each message trailer first. Then check each used slot CRC. Then read the records.
