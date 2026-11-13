---
title: BCL preset text format
description: The syntax of BCR32 preset files in BCL text, as the unit accepts it. Every line form is marked verified or unverified.
status: draft
last_updated: 2026-11-13
---

# BCL preset text format

BCL is the text language that Control Tribe uses to send a preset to the unit. A preset file is a plain ASCII text file. Control Tribe reads it with the **Import** button on the General tab.

**Verified** means the unit accepted the line on firmware 1.0.3 and a later export or capture matched it. **Unverified** means the line comes from the Control Tribe export or from an outside source, and no test on our unit confirms it. The test files are in the [findings](capture-findings.md#test-preset-a-import-and-decode-2026-11-13-verified-on-firmware-103). The byte layout in the unit is in the [SysEx dump format](sysex-dump-format.md).

> **Warning:** Import sends every line to the unit at once. Do not import a file you have not read. A `$global` block changes the unit's global settings. Leave it out of test files.

## How import works

| Fact | Result |
| --- | --- |
| Send time | Each line goes to the unit as soon as you import. The Send button is not needed |
| Check | The unit checks every line. The editor then lists each rejected line with a reason |
| Store | The line `$store N` writes the finished preset to stored preset N |
| Reply | After you select a preset, the unit sends it back as BCL text and sends all 64 preset names |
| Limit | A line holds at most 600 characters (unverified; outside source) |

## File layout

```text
$rev BCR32
$preset
  .name 'my preset'
  .snapshot off
  .request off
  .init
$encoder 1
  .easypar CC 1 20 0 127 absolute
  .showvalue on
  .mode 1dot
  .default 0
$button 1
  .easypar CC 1 30 127 0 toggleoff
  .showvalue on
$store 61
$end
```

| Line | Meaning | Status |
| --- | --- | --- |
| `$rev BCR32` | Device marker. First line | verified |
| `$global` | Global settings block. Seen in exports. Do not send it | verified in exports, never sent |
| `$preset` | Starts the preset | verified |
| `.name '<text>'` | Preset name, in single quotes. The unit stores 24 characters | verified |
| `.snapshot`, `.request` | `off` or `on`. We used `off` | verified for `off` |
| `.init` | Part of every preset header. Meaning not tested | verified as accepted |
| `$encoder N` | Starts encoder N, 1 to 32. Encoder N is the knob printed N. Its control ID number is 24 plus N | verified |
| `$button N` | Starts button N. N 1 to 16 is the button printed N (its control ID number is 4 plus N). N 17 to 28 is the push of knob 1 to 12 (verified). N 17 to 48 is probably the push of knob 1 to 32. N 49 and 50 are untested | verified for 1 to 28 |
| `$store N` | Stores the preset as preset N, 1 to 64. Use only empty presets | verified |
| `$end` | Ends the file | verified |

**Preset numbers:** Stored preset N is slot N minus 1 in the dump. Preset 1 is ID 0. Presets 5 to 63 (IDs 4 to 62) were empty on our unit.

## Lines inside an encoder

| Line | Values | Status |
| --- | --- | --- |
| `.easypar <message>` | The message and its range. See the message tables | verified |
| `.showvalue` | `on` or `off`. The display shows the value | verified |
| `.mode` | The LED ring style. See LED ring styles | partly verified |
| `.default` | A start value, 0 to 127. Stored as twice the value plus 1 | verified for 0, 1, 32, 63, 64, 65, 100, 127 |

## Lines inside a button

A button has `.easypar` and `.showvalue`. It has no `.mode` and no `.default`. Another repo reports that a `.default` line on a button is dropped by the unit (unverified).

## Message forms for encoders

| Type | Form | Notes | Status |
| --- | --- | --- | --- |
| CC | `CC <ch> <cc> <min> <max> <mode>` | Mode: `absolute`, `absolute/14`, `relative-1`, `relative-2`, `relative-3`, `relative-1/14` | verified |
| CC | mode `relative-2/14` or `relative-3/14` | Accepted, but stored as relative-2 and relative-3 | verified |
| CC | mode `inc/dec` | Rejected: invalid argument | verified |
| NRPN | `NRPN <ch> <number> <min> <max> <mode>` | Number 0 to 16383. Mode as for CC, plus `inc/dec` | verified (100 to 105) |
| PB | `PB <ch> <range>` | Range 0 to 127 | verified |
| AT | `AT <ch> <all or note> <min> <max>` | No mode word. `absolute` is rejected | verified |
| GS/XG | `GS/XG <ch> <parameter> <min> <max>` | Parameters: see below | verified for 4 names |

## Message forms for buttons

| Type | Form | Status |
| --- | --- | --- |
| CC | `CC <ch> <cc> <on> <off> toggleoff` or `toggleon` | verified |
| CC | `CC <ch> <cc> <min> <max> increment <step>` | verified |
| NOTE | `NOTE <ch> <note> <velocity> toggleoff` or `toggleon` | verified |
| PC | `PC <ch> <bank high> <bank low> <program>` | verified |
| MMC | `MMC <device or all> <command> <hh:mm:ss.ff> <rate>` | verified |
| AT | `AT <ch> <all or note> <on> <off> toggleoff` or `toggleon` | verified |
| NRPN | `NRPN <ch> <number> <on> <off> toggleoff` or `toggleon` | verified |
| GS/XG | `GS/XG <ch> <parameter> <on> <off> toggleoff` or `toggleon` | verified |

## Values

| Item | Allowed | Notes |
| --- | --- | --- |
| Channel | 1 to 16 | verified for 1, 2, 3, 4, 5, 9, 13, 16 |
| CC number | 0 to 127 | verified for 0 and 119 |
| Bank high and low | `off` or 0 to 127 | `off` stores `A5 F5`. The unit sends only the bank high part |
| Program | 0 to 127 | The unit sends the number as written |
| MMC commands | `play`, `stop`, `pause`, `fwd`, `rew`, `locate`, `punch-in`, `punch-out` | verified |
| MMC time and rate | `00:00:00.00 noloc` or `01:02:03.04 25f` | `24f`, `30df` and `30f` unverified |
| GS/XG names | `cutoff`, `resonance`, `volume`, `panorama`, `rev-send` verified. Also `v-rate`, `v-depth`, `v-delay`, `eg-attack`, `eg-decay`, `eg-release`, `modulation`, `p-time`, `crs-send`, `dly-send` | unverified for the last ten |

## LED ring styles

The `.mode` line sets the ring style of an encoder. It is the high nibble of record byte 1.

| `.mode` text | Nibble | Status |
| --- | --- | --- |
| `off` | `0` | verified |
| `1dot` | `1` | verified |
| `1dot/off` | `2` | verified |
| `12dot` | `3` | verified. The editor calls it "2DOT IN" |
| `12dot/off` | `4` | verified |
| `bar` | `5` | verified |
| `bar/off` | `6` | verified |
| `pan` | `8` | verified |
| `mcu` | `C` | verified |
| `spread` | `7` | verified |
| `qual` | `9` | verified |
| `cut` | `A` | verified |
| `damp` | `B` | verified |

The unit rejects `pan/off`, `spread/off` and `qual/off`. A rejected `.mode` line leaves the ring at `1dot`.

## Button numbers

| `$button` N | Control | Status |
| --- | --- | --- |
| 1 to 16 | The buttons printed 1 to 16 (B5 to B20) | verified |
| 17 to 28 | The push of the knob printed 1 to 12 (E25 to E36) | verified |
| 29 to 48 | The push of the knob printed 13 to 32 | not tested; same rule |
| 49, 50 | Probably the two footswitches | not tested |

The keys T1 to T4 and the right-hand keys (EDIT to PLAY/STOP) have no `$button` number that we know of. In the live test, pressing them sent nothing. B63 and B64 change the preset.

## Rejected forms

| Line | Reason shown by the editor |
| --- | --- |
| `AT 1 all 0 127 absolute` | wrong number of arguments |
| `AT 1 0 127 absolute` | not a number |
| `AT 1 0 127` | wrong number of arguments |
| `AT 1 all absolute` | wrong number of arguments |
| `AT 1 all 127` | wrong number of arguments |
