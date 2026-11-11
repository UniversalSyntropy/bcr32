---
title: Unit session script
description: Ordered test list for the first session at a real BCR32. Read the display, listen to MIDI output and take photos. Nothing writes to the unit.
status: draft
last_updated: 2026-11-11
---

# Unit session script

Use this script for the first session at a real BCR32. It has four parts: read the display, listen to MIDI output, take photos, and one gated part for tier 1 messages. The session takes about 1 hour.

The script follows the [unit safety protocol](../project/unit-safety.md). It uses tier 0 only, except Part D, which is tier 1 and is blocked until a checked backup exists. No test changes memory. No test sends a message to the unit.

Nothing in this script was tried on a unit. Every expected result is unverified until you record it.

## Stop conditions

Read these before the first test. Stop the session at once if any of them happens.

- The unit freezes, restarts, or shows a message that is not in the manual.
- A control or LED behaves differently after a test than before it.
- The display shows `MIN`. This means CV calibration started.
- The display shows `Cancel` and `OK`. This means a factory restore is open.
- PLAY/STOP (B68) is not unlit at the end of a test.

> **Warning:** if the display shows `MIN`, `Cancel` or `OK`, do not turn or push SELECT (SEL). Press ZQR/CTRL (B1) to leave. Then stop.

After a stop, write down what you see and do nothing more. The [recovery runbook](recovery-runbook.md) lists the recovery steps, least invasive first.

## Rules for every test

- **Do not turn or push SEL** unless a step says so. No step in this script says so.
- **Do not press** STORE (B61) a second time, or any pattern slot button (B5 to B20) in a STORE or LOAD view.
- **Do not unplug** a cable during the session.
- **Do not open** Control Tribe. It can start a transfer.
- **Press EXIT (B60)** to leave every menu, unless a step says otherwise.

## Before you start

1. Check that PLAY/STOP (B68) is unlit.
2. Connect the unit with one direct cable on J70. Do not use a hub.
3. Open a listen-only MIDI monitor on the computer. It must show incoming messages and must not send any.
4. Check that the monitor shows both unit ports: "BCR-32 CTRL" and "BCR-32 ZAQ".
5. Close every DAW and every other program that holds the MIDI ports.
6. Make a copy of the [results sheet](#results-sheet) in the `local/` folder.

**Expect:** the monitor lists both ports and shows no messages while the unit is idle.

If the monitor shows messages on an idle unit, write them down and stop.

## Part A: read the display

> **Warning:** this script names buttons by ID, for example B11. The unit prints the numbers 1 to 16 above B5 to B20. The ID is the printed number plus 4. Press the button in the table below and not the button with the same printed number.

| ID | Printed number | Printed label | Note |
| --- | --- | --- | --- |
| B5 | 1 | PITCH | |
| B6 | 2 | VELOCITY | |
| B7 | 3 | MUTE | |
| B8 | 4 | DELAY | Do not press. Starts CV calibration |
| B9 | 5 | LENGTH | |
| B10 | 6 | MIDI CTRL α | |
| B11 | 7 | MIDI CTRL β | |
| B12 | 8 | WAVE GEN | Do not press. May open the factory restore |
| B13 | 9 | CHORD | |
| B14 | 10 | STEP SKIP | |
| B15 | 11 | SEQ START | |

These tests only read the display and the lit buttons. Each one starts with the unit in ZAQ mode. Press ZQR/CTRL (B1) to change mode if the pink buttons are not lit.

### A1: Firmware version

1. Hold ZQR/CTRL (B1) for 3 seconds. The unit opens Global Settings.
2. Press B11 (printed 7). The display shows the firmware version.
3. Write down the version exactly as shown.
4. Press B1 to leave Global Settings.

**Expect:** the display shows 1.0.3. This was read on 2026-11-11.

### A2: USB product ID

1. Open System Information on the Mac and select USB.
2. Select the entry with vendor ID `1397`.
3. Write down the product ID and the device release number.

**Expect:** the product ID is not `12CE`. `12CE` means the unit is in the bootloader. If you see it, stop.

The runbook lists the production product ID as unknown. This test records it for the first time.

### A3: Global Settings buttons (errata row: Global Settings)

The manual lists 8 settings. Firmware 1.0.3 lights 11 buttons. This test finds the name of each one.

> **Warning:** do not press B8 (printed 4) or B12 (printed 8). B8 starts CV calibration. B12 may open the factory restore. A neighbouring button may now hold these functions, so read each name before you press the next button.

1. Hold B1 for 3 seconds. The unit opens Global Settings.
2. Press B5. Write down the name and the value on the display.
3. Press B6. Write down the name and the value.
4. Press B7, B9, B10, B13, B14 and B15 in turn. After each press, write down the name and the value.
5. Press B1 to leave Global Settings.

**Expect:** B5 shows the device mode, B6 the device ID, B7 the operation mode, B9 and B10 the footswitches. The names of B13 to B15 are not known.

If a button shows `MIN`, `Cancel` or `OK`, follow the stop conditions.

### A4: Operation mode button (errata row: CTRL Settings and Global)

The manual says "MIXED is selected using button 7 (Note Mute)". The reference assumes the button is B7 in Global Settings.

1. Hold B1 for 3 seconds. The unit opens Global Settings.
2. Press B7. Write down the name and the value on the display. Do not change it.
3. Press B1 to leave Global Settings.

**Expect:** the value is USB, STDL or MIXED. The unit was USB on 2026-11-11.

This test confirms the button. It does not confirm that MIXED is available, because that needs a change.

### A5: ZAQ Settings, button 8 (errata row: ZAQ Settings B8)

The manual text for B8 holds a draft tag. This test reads the name and the current value only.

1. In ZAQ mode, hold EDIT / GLOBAL (B59). Press STORE (B61) once. The unit opens ZAQ Settings.
2. Press B8 (printed 4). Write down the name and the value on the display.
3. Press EXIT (B60) to leave.

**Expect:** the display shows GATE or CLOCK. The other value stays unseen, because changing the value is tier 2.

### A6: CTRL Settings routing

Encoder and button turns on 2026-11-11 sent nothing on USB. This test reads the output routing that may explain it.

> **Warning:** in CTRL mode, STORE (B61) stores a preset. Press B61 once only, while you hold B59.

1. Press B1 until the amber buttons are lit. The unit is in CTRL mode.
2. Hold B59. Press B61 once. The unit opens CTRL Settings.
3. Press B5 (printed 1). Write down the output routing on the display.
4. Press B6 (printed 2). Write down the MIDI thru value on the display.
5. Press B60 to leave.
6. Press B1 until the pink buttons are lit.

**Expect:** the routing is one of USB, MIDI A, MIDI B or a combination.

### A7: LOAD view paging (errata row: LOAD)

The manual says "buttons 63 and 63". The reference assumes B63 and B64.

> **Warning:** do not press a slot button (B5 to B20) in this test. A slot press loads a pattern.

1. In ZAQ mode, press LD/LRN (B62). The unit opens the LOAD view.
2. Press B64. Write down what the display shows.
3. Press B63. Write down what the display shows.
4. Press B60 to leave.

**Expect:** B64 pages up and B63 pages down. Write down the page numbers you see.

## Part B: listen to MIDI output

Keep the monitor open. Each test lists the port and the messages to write down. Write down "nothing seen" when no message arrives.

### H1: Virtual keyboard (errata row: Virtual keyboard)

The manual lists the keyboard buttons but not their notes. This test records the note of each button.

> **Warning:** do not press B64. B64 changes NOTE to MONITOR and RECORD. RECORD writes notes into the pattern.

1. In ZAQ mode, press INST SEL (B65). The display shows `NOTE`.
2. Press B13 (printed 9). Write down the port, the channel and the note number.
3. Repeat step 2 for B14 to B20 (printed 10 to 16).
4. Press B6, B7, B9, B10 and B11 (printed 2, 3, 5, 6 and 7) in turn. Write down the note number each time.
5. Press B5, B8 and B12 (printed 1, 4 and 8) in turn. Write down "nothing seen" or the message.
6. Press B65 to leave.

**Expect:** B13 to B20 send eight white keys in rising order. B6, B7, B9, B10 and B11 send the five black keys.

If B65 does not show `NOTE`, press B65 again and write down what you see.

### H2: Transport

The reference says USB mode has no internal clock. This test records what the unit sends on start and stop.

1. Press PLAY/STOP (B68) once. Write down the button colour and the messages on the monitor.
2. Wait 10 seconds.
3. Press B68 once. Write down the button colour and the messages.

**Expect:** B68 is unlit at the end of step 3. If B68 is red or lit, press B68 once more. If it stays lit, stop.

### H3: Controller output

1. Press B1 until the amber buttons are lit. The unit is in CTRL mode.
2. Turn E25 one step. Write down the port and the messages.
3. Push E25. Write down the port and the messages.
4. Press B5 (printed 1). Write down the port and the messages.
5. Press B1 until the pink buttons are lit.

**Expect:** the unit sends nothing, as on 2026-11-11, or it sends messages that match the routing from test A6.

## Part C: photos

Take the photos to move the label and lit colours in the data from the source "manual" to the source "unit". The photos stay in `local/photos/` and never go into a commit.

### Photo rules

- **Light:** use the same room light for every photo. Do not use a flash.
- **Position:** fix the camera over the unit. Use the same position for all top-panel photos.
- **Frame:** keep screens, windows, papers and people out of the frame.
- **Rear panel:** the photo shows the serial number. Keep it in `local/photos/` only.
- **Names:** name each file with the shot number, for example `p07-zaq-mode.jpg`.

### Shot list

| Shot | Unit state | How to reach it | What to show |
| --- | --- | --- | --- |
| P1 | ZAQ mode | Press B1 until pink | Whole top panel |
| P2 | ZAQ mode | none | Close view of B5 to B20 and their labels |
| P3 | ZAQ mode | none | Close view of the track buttons and the status LEDs |
| P4 | ZAQ mode | none | Close view of E25 to E40 and the labels |
| P5 | ZAQ mode | none | Close view of E41 to E56 and the labels |
| P6 | ZAQ mode | none | Close view of the right block, B59 to B68 |
| P7 | Rear panel | none | All jacks and their labels |
| P8 | CTRL mode | Press B1 until amber | Whole top panel |
| P9 | Global Settings | Hold B1 for 3 seconds | Whole top panel, lit buttons visible |
| P10 | ZAQ Settings | In ZAQ, hold B59 and press B61 once | Whole top panel |
| P11 | CTRL Settings | In CTRL, hold B59 and press B61 once | Whole top panel |
| P12 | ZAQ Global page | In ZAQ, press B59 | Whole top panel |
| P13 | LOAD view | In ZAQ, press B62 | Whole top panel, green slots visible |
| P14 | Real-time mode | In ZAQ, press B65 | Whole top panel |
| P15 | Mixer | Stop the sequencer, then press B66 | Whole top panel |

Press B60 after each menu shot. Press B66 to leave the Mixer. In the Mixer view, do not press a track button.

**Expect:** each photo shows the colour of every lit button. Check the photos on the computer before you leave the unit.

## Part D: tier 1 messages (blocked)

> **Warning:** do not run Part D until the owner has a checked backup of the unit (step 4.2) and says yes for this session. Part D needs the capture tool from step 4.1.

Tier 1 sends standard messages to the unit. This part holds one test. The other tier 1 messages (notes, controller changes, program change, clock) belong to the inbound map in step 4.4.

### D1: Identity request

1. Send the universal identity request `F0 7E 7F 06 01 F7` to the port "BCR-32 CTRL".
2. Write down every message that comes back.
3. Send the same request to the port "BCR-32 ZAQ". Write down every message that comes back.

**Expect:** the unit answers with an identity reply on one or both ports, or it sends nothing. Both are results.

Mark D1 "blocked" in the results sheet until the backup exists.

## Errata rows and where they stand

The reference holds 13 rows in its [Source errors and gaps](../reference/bcr32-reference.md#12-source-errors-and-gaps) table. This script covers some of them. The rest need a change to the unit and wait for the backup.

| Row | Test | Result of this script |
| --- | --- | --- |
| ZAQ Settings B8 draft tag | A5 | Reads one value. The other value needs a change |
| CTRL Settings and Global, MIXED on B7 | A4 | Confirms the button. MIXED needs a change |
| Erase, 25th encoder | none | Not tested. Erase runs only for recovery |
| ZAQ mode, NOTE LENGTH in the chord list | none | Waits. Needs an encoder turn in edit mode |
| Chord list, flat 5th | none | Waits. Needs an encoder turn in edit mode |
| Alpha targets, CC 0 to 27 | none | Waits. Needs a change of a global setting |
| LOAD, buttons 63 and 63 | A7 | Tested |
| MIDI out list, Input channel | none | Waits. Needs a change of a global setting |
| Copy pattern | none | Waits. Writes to the pattern |
| Pattern chain | none | Waits. Loads patterns |
| User scale | none | Waits. Changes a global setting |
| Virtual keyboard and number pad | H1 | Keyboard tested. Number pad waits, because CV calibration needs a meter and a change |
| Global Settings, 11 buttons | A1, A3 | Tested |

The rows that wait are tier 2. They run in a later session, after the checked backup and with the owner's yes.

## Results sheet

Copy this table into a file in `local/`. Use one of these results: pass, fail, blocked, skipped. Write down what the display or the monitor showed.

| Test | Result | What you saw | Notes |
| --- | --- | --- | --- |
| A1 Firmware version | | | |
| A2 USB product ID | | | |
| A3 Global Settings buttons | | | |
| A4 Operation mode button | | | |
| A5 ZAQ Settings B8 | | | |
| A6 CTRL Settings routing | | | |
| A7 LOAD view paging | | | |
| H1 Virtual keyboard | | | |
| H2 Transport | | | |
| H3 Controller output | | | |
| C Photos P1 to P15 | | | |
| D1 Identity request | blocked | | |

## After the session

1. Check that PLAY/STOP (B68) is unlit and the unit is in ZAQ mode.
2. Save the results sheet and the monitor log in `local/`.
3. Check that the photos are in `local/photos/` and in no other folder.
4. Tell the owner about every stop, every surprise and every "nothing seen".

Step 3.3 turns the results into updated errata rows, a capture findings note and the MIDI facts data file.
