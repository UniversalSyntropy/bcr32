---
title: midi-capture tool
description: Lists MIDI ports, logs timestamped messages to a file, and sends test messages to loopback ports only. Used to map what the BCR32 sends.
status: draft
last_updated: 2026-11-11
---

# midi-capture

The tool reads MIDI messages from the unit and writes them to a log file. It runs on macOS and uses CoreMIDI. It is one Swift file: `src/main.swift`.

> **Warning:** The tool never sends to the unit. The `send` command accepts loopback ports only. Close the tool before you update the firmware.

## Build

Run this from the repo root. It needs the Swift compiler from the Xcode command line tools.

| Command | Result |
| --- | --- |
| `npm run build:midi-capture` | writes the program to `tools/midi-capture/build/midi-capture` (not tracked) |

## Run it in the desktop session

CoreMIDI shows no ports to a remote shell. Run every command below in Terminal on the desktop of the computer that holds the unit.

| Command | Result |
| --- | --- |
| `npm run midi-capture -- list` | prints the sources and destinations; marks loopback destinations |
| `npm run midi-capture -- log` | logs all sources until Ctrl-C |
| `npm run midi-capture -- log --port CTRL --seconds 60` | logs sources whose name holds `CTRL` for 60 seconds |
| `npm run midi-capture -- log --skip clock,active-sensing` | leaves out the named kinds; the summary counts them |
| `npm run midi-capture -- send --to IAC 90 3C 64` | sends bytes (hex) to a loopback port |
| `npm run midi-capture -- selftest` | proves the capture path on a software port; exits 0 when all pass |

## Log file

`log` writes JSON Lines to `local/captures/capture-<date>-<time>.jsonl`. The folder is not tracked. Use `--out <file>` to choose another path.

| Field | Meaning |
| --- | --- |
| `t` | UTC time of the message, to the millisecond |
| `mono_ns` | time stamp from CoreMIDI in nanoseconds; use it for the gap between messages |
| `port` | source port name; empty for a marker |
| `hex` | the message bytes in hex |
| `kind` | `note-on`, `note-off`, `cc`, `program`, `pitch-bend`, `sysex`, `clock` and others |
| `ch` | channel 1 to 16, for channel messages |
| `d1`, `d2` | the data bytes. A pitch bend value is `d2 × 128 + d1`. For SysEx, `d1` is the byte count |
| `text` | marker text, or a note about a message the tool cannot decode |

## Mark an action

Type a line in the terminal while `log` runs, then press Enter. The tool writes a record with `kind` `mark` and your text. Type the mark just before or just after you press a control. Step 4.3 uses the marks to link each control to its message.

## Rules

- **Listen only:** `log` and `list` never send.
- **Loopback only:** `send` refuses a destination whose name holds `bcr` or `behringer`. It accepts names that start with `IAC` or hold `loopback`.
- **Private logs:** a log can hold the serial number of a unit. Keep logs in `local/`. Never commit them.
- **Plugged in later:** the tool lists ports once at start. Restart it after you plug in or remove a device.

## Tests

`npm test` builds the tool in a temporary folder and runs the tests on macOS. Other systems skip them.

| Test | Proves |
| --- | --- |
| selftest | 13 known messages, including a SysEx in three packets, come back as the expected records |
| send refusal | the unit and any other name are refused with exit code 2 |
| loopback round trip | a message sent to the IAC bus is logged with the right bytes and time stamps |

A mutation check was done when the tool was written. Six deliberate faults were put in the decoder. The selftest caught five. The sixth was a mask on a SysEx byte count that never exceeds 6, so it cannot change the result.

## Limits

- **macOS only:** the tool uses CoreMIDI.
- **MIDI 1.0 messages:** it decodes channel messages, system messages and SysEx. Other message types are logged as a note.
- **No clock of its own:** the time stamps come from CoreMIDI.
