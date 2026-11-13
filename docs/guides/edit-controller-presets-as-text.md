---
title: Edit controller presets as text
description: How to write a controller preset as a BCL text file, import it with Control Tribe, store it, and read it back. For advanced users.
status: draft
last_updated: 2026-11-13
---

# Edit controller presets as text

Goal: write many control assignments in one text file and send them to the unit.

| Item | Value |
| --- | --- |
| Needs | Control Tribe, a text editor, a backup |
| Time | 20 minutes |
| Firmware tested | 1.0.3, Control Tribe 1.12.4. The method is verified |

> **Warning:** Import sends every line to the unit at once. The unit stores the preset when it reads `$store N`. A wrong preset number overwrites a preset. Back up first. Never store over preset 64 or presets 1 to 4 unless you know what you do. Leave out the `$global` block: it changes the unit's global settings.

## Step 1: back up

See [back up your BCR32](back-up-your-bcr32.md). Keep the `.bcl` file that the editor saves. It is a good model for your own file.

## Step 2: write the file

Use plain ASCII text. This file sets one knob and one button, and stores them as preset 61.

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

| Line | Meaning |
| --- | --- |
| `$encoder N` | The knob printed N. Its ID is E(24+N) |
| `$button N` | N 1 to 16: the button printed N (ID B(4+N)). N 17 to 28: the push of the knob printed 1 to 12 |
| `.easypar CC 1 20 0 127 absolute` | CC on channel 1, number 20, from 0 to 127, absolute |
| `.mode 1dot` | The ring style. See [choose encoder modes and LED rings](choose-encoder-modes-and-led-rings.md) |
| `$store 61` | Store as preset 61 |

All line forms are in the [BCL preset text format](../reference/bcl-preset-text-format.md). The unit rejected some forms. The page lists them.

## Step 3: import

1. In Control Tribe, open the General tab.
2. Press **Import**. Choose the file.
3. Read the list of rejected lines. Each has a reason. Fix the file and import again.

**Expect:** The unit accepts the lines. The editor lists none, or lists the lines that it rejects.

## Step 4: check the result

1. In Control Tribe, select the preset. The unit sends the preset back as BCL text. This is a free read-back.
2. Compare with your file.
3. Turn the control. Check the message in a MIDI monitor on the port `BCR-32 CTRL`.

## Step 5: put the unit back

After an editor session, check which preset is current. On the unit, press the keys printed TAP DELETE (B63) and TAP WRITE (B64) to choose the preset you want. Check the panel.

## Limits

- **Empty slots:** presets 5 to 63 were empty on our unit. Yours may differ. Check first.
- **Pushes:** `$button` 17 to 28 are verified. 29 to 48 are probably the pushes of the knobs printed 13 to 32. 49 and 50 are untested.
- **Keys with no number:** T1 to T4 and the keys at the right have no known `$button` number.

## Related

- [BCL preset text format](../reference/bcl-preset-text-format.md)
- [SysEx dump format](../reference/sysex-dump-format.md)

**Next step:** Add more controls to the file and import again.
