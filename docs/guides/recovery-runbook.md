---
title: Recovery runbook
description: How to get a BCR32 back to a working state, from the least invasive procedure to the most invasive, with what the vendor documents and what stays unknown.
status: draft
last_updated: 2026-11-11
---

# Recovery runbook

Use this runbook when a BCR32 behaves in a way you cannot explain. It follows the [unit safety protocol](../project/unit-safety.md). The owner runs every procedure. No tool or script runs one.

Source labels: "manual" is the official manual, Rev1 (2026-04-06). "repo, demo firmware" is the vendor's open-source repository, which holds demo firmware and not the production firmware. "Unverified" means nobody has tried it on a unit.

## Read this first

> **Warning:** do not unplug the unit while it stores, imports, restores or updates. Wait until the display and LEDs return to normal.
>
> **Warning:** do not start a factory restore or a firmware update before you take a checked backup. The only exception is a unit that is already unusable. A factory restore erases memory. The manual does not say exactly what it erases, so assume it erases everything.

- **Stop first.** If the unit freezes, restarts or shows a message that is not in the manual, stop. Write down what you see.
- **One procedure at a time.** Do the procedures in the order below. After each one, check whether the unit works. If it does, stop.
- **Owner's yes.** Procedures 3 and 4 change memory. They need the owner's yes for that session (tier 2 in the safety protocol).
- **Unknown stays unknown.** The vendor documents no recovery mode for the production firmware. Rows marked "unknown" are gaps, not guesses.

## Never do these

- **Never send** the bootloader commands `0x74` (mode query) or `0x77` (enter bootloader). The project does not send them.
- **Never run** the update tool in the vendor repository. It sends `0x77` and then writes a demo image. A demo image replaces the production firmware, and no production image is available.
- **Never hold** T1, T2, T3 and T4 together. This key combination enters the bootloader. Wait until the vendor confirms a recovery procedure that uses it.

## Recovery ladder

| Procedure | Action | Erases memory | Source |
| --- | --- | --- | --- |
| 1 | Power cycle | no | general practice, unverified |
| 2 | Reload from memory | unknown | not documented |
| 3 | Import the backup | replaces memory | manual, section 9.3 |
| 4 | Factory restore | yes | manual, section 9.1 |
| 5 | Firmware reinstall with Control Tribe | unknown | manual, section 9.5 |
| 6 | Check for the bootloader, then contact the vendor | no | repo, demo firmware, unverified |

### Procedure 1: Power cycle

1. Disconnect both USB-C cables, J69 and J70.
2. Wait 10 seconds.
3. Connect the cables again.
4. Wait for the display to show its start screen.

**Expect:** the unit starts in the mode set in Global Settings (device mode, B5). If the unit works, stop.

### Procedure 2: Reload from memory

The manual describes no command that reloads the last saved state. This procedure is unknown. Do not look for one by trying keys.

### Procedure 3: Import the backup

Use this procedure only when you hold a checked backup and the owner has said yes for this session.

1. Hold B1 for 3 seconds. The unit opens Global Settings.
2. Check that B7 (operation mode) is USB or MIXED. Do not change it. If it shows STDL, stop: STDL turns USB off.
3. Press B1 to leave Global Settings.
4. Select the mode that the backup came from: ZAQ or CTRL.
5. Press STORE (B61).
6. Hold SELECT (SEL) and push E33. The unit waits for SysEx.
7. Send the backup file from a SysEx tool to the port of J70 (USB).
8. Wait until the display returns to normal.
9. Press B60 to exit.

**Expect (unverified):** the unit loads the data and the display returns to normal.

> **Warning:** the manual does not say what the unit does with a file that it cannot read. Send only the unit's own unmodified export.

### Procedure 4: Factory restore

> **Warning:** this procedure erases memory. Do it only after a checked backup, or when the unit is already unusable. Do not press B8 in Global Settings: B8 starts CV calibration.

1. Hold B1 for 3 seconds. The unit opens Global Settings.
2. Press one lit button and read its name on the display.
3. Press B1 to leave without a change, or press the next lit button. Do not turn or push SEL yet: SEL changes the value of a setting.
4. Repeat steps 2 and 3 until the display shows factory restore.

Firmware 1.0.3 lights three more buttons than the manual lists, so B12 may not be the factory restore.

> **Warning:** do not touch the unit or a cable after you push SEL on OK, until the unit restarts. The restore takes over a minute.

When the display shows factory restore:

1. Turn SEL to OK.
2. Push SEL.

**Expect (unverified):** the unit restarts with factory settings.

Control Tribe also has a **Factory Reset** button on its Device Settings page (see the [troubleshooting guide](troubleshooting.md)). Nobody has compared it with the unit's own factory restore. Use the unit's own factory restore first.

### Procedure 5: Firmware reinstall with Control Tribe

The manual says Control Tribe installs firmware updates. It gives no steps for a reinstall of the same version. These facts are unknown:

- Whether Control Tribe offers a reinstall of the version that is on the unit.
- Whether a firmware file exists outside the app.
- What the unit shows during the update.
- What to do if the unit freezes during an update, and how long to wait.

If you do this procedure, follow these rules:

1. Get Control Tribe from the official download only. Version 1.12.4 is the one listed on the product page.
2. Close every capture tool, DAW and monitor that holds the MIDI ports.
3. Connect the unit with a direct cable on J70. Do not use a hub.
4. Update only through Control Tribe. Never store or replay update messages.

The owner does this procedure. Contact the vendor before it, because the steps are unknown.

### Procedure 6: Check for the bootloader, then contact the vendor

The repo describes a bootloader. The repo holds demo firmware, so these facts are unverified for production firmware.

| Fact | Detail | Source |
| --- | --- | --- |
| Automatic start | The bootloader starts by itself after a reset when no valid application is in flash, "for example after an interrupted update" | repo, demo firmware |
| USB identity | In the bootloader the unit appears with product ID `12CE` and one MIDI port | repo, demo firmware |
| Application ID | The demo application uses product ID `12CF`. The production application ID is unknown | repo, demo firmware |
| Leave | Without an update, a power cycle (procedure 1) starts the application again | repo, demo firmware |
| Key combination | T1, T2, T3 and T4 held together enter the bootloader. The repo says this is for "when no host software can send SysEx, or when the application does not respond" | repo, demo firmware |

This procedure only observes. The project does not enter the bootloader.

1. Connect the unit to the computer with J70.
2. Open System Information on the Mac and select USB.
3. Find the entry with vendor ID `1397`.
4. Read the product ID.

**Expect:** the product name is the same in both modes. Only the product ID shows whether the unit is in the bootloader (`12CE`).

Then stop. Contact Behringer support and the vendor repository community before you do anything else. Do not open Control Tribe first, because it may start a transfer.

## What stays unknown

| Question | Why it matters |
| --- | --- |
| What a factory restore erases | It decides whether a backup is enough to restore the unit |
| Whether Control Tribe can reinstall the same firmware | It decides whether procedure 5 exists |
| Whether the production bootloader matches the repo | Procedure 6 depends on it |
| What the display shows in the bootloader | You need it to know you are in the bootloader |
| What to do if an update freezes | It is the worst case |
| Whether a vendor support route exists for a failed update | It is the last option |

## After a recovery

1. Write down which procedures you did and what the unit showed.
2. Read the firmware version from the display (Global Settings, B11 on firmware 1.0.3).
3. Export the memory again and compare the export, byte for byte, with the checked backup.
4. Tell the owner before any further test.
