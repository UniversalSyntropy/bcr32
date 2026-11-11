---
title: Unit safety protocol
description: Rules for testing on a real BCR32 without risk to its firmware or memory, including what must be known and backed up first.
status: draft
last_updated: 2026-11-11
---

# Unit safety protocol

A test must never leave a unit in a worse state than it found it. These rules apply to every person and every tool that talks to a real BCR32 for this project.

## Before the first interaction

Complete these in order. No message is sent to the unit until all four are done.

1. **Recovery runbook written.** Record, from official sources, how to restore factory defaults, how to reinstall firmware with the vendor editor, and whether a recovery or bootloader mode exists. Mark anything the vendor doesn't document as unknown.
2. **Firmware version recorded** from the unit display.
3. **Full backup taken:** SysEx export of all sequencer memory and all controller presets, saved to a local, git-ignored folder, with a second copy.
4. **Backup checked:** the export files are non-empty, complete SysEx messages, and a second export of unchanged memory matches the first.

## Risk tiers

| Tier | Action | Rule |
| --- | --- | --- |
| 0 | Listen to MIDI output; read the display; read USB descriptors | Allowed at any time |
| 1 | Send standard channel and system messages: notes, CC, program change, clock, start, stop, identity request | Allowed after the four steps above |
| 2 | Change memory by a documented route: store a pattern or preset, change a setting on the panel, import the unit's own backup | Only with a checked backup and the owner's yes for that session |
| 3 | Anything in the forbidden list below | Not done |

## Forbidden

- **Undocumented SysEx:** no message is sent to the unit unless an official document describes it or it is the unit's own unmodified backup.
- **Bootloader and update commands:** no message or key combination that puts the unit into a bootloader or update mode is used, even where a vendor document describes it. The only exception is recovery, by the owner, following the runbook.
- **Replay of editor traffic:** messages captured between the vendor editor and the unit are studied, never re-sent.
- **Firmware traffic:** firmware updates happen only through the vendor editor, by the owner. Capture tools are closed during an update, and update messages are never stored for replay.
- **Fuzzing:** no random, malformed or bulk-generated messages.
- **Erase and factory restore as tests:** these run only for recovery.
- **Power or cable changes during a write:** nothing is unplugged while the unit stores, imports or updates.

## Stop conditions

Stop the session and tell the owner if any of these happens.

- The unit freezes, restarts, or shows a message that is not in the manual.
- A control or LED behaves differently after a test than before it.
- A backup export differs from the last one without a known change.

After a stop, do nothing further until the owner decides. Recovery follows the runbook, least invasive step first: power cycle, reload from memory, import the backup, factory restore, firmware reinstall.

## What stays unknown

The official manual documents factory restore (Global Settings, button 12) and firmware updates through the vendor editor. It doesn't describe a recovery mode for a failed update. Until the vendor documents one, the project treats a failed firmware update as unrecoverable by us and stays away from that path.
