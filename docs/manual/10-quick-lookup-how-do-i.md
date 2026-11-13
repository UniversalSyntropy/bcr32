---
title: "10. Quick lookup: \"how do I …\""
description: "Chapter 10 of the BCR32 manual: a quick start for the sequencer and the controller, and a lookup of common tasks with key sequences."
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35
---

# 10. Quick lookup: "how do I …"

This chapter has two quick starts and a task lookup. Each task links to the chapter that holds the detail.

> **Note:** The [steps](13-glossary.md#step) come from the official manual. They are unverified on a unit unless a line says "verified" with a [firmware](13-glossary.md#firmware) version. Read [Source errors and gaps](12-source-errors-and-gaps.md#12-source-errors-and-gaps) if a step does not give the result shown.

## 10.1 Quick start: play a pattern in ZAQ mode

Goal: enter a short note [pattern](13-glossary.md#pattern) on [track](13-glossary.md#track) 1 and hear it. The steps need a synth that takes [CV](13-glossary.md#cv) and [gate](13-glossary.md#gate), or MIDI.

### Connect the unit

1. Connect J70 (POWER/DATA) to a computer or a USB power supply. The unit starts.
2. Connect the synth. Use one of the two routes in the table.

| Route | Connect | Note |
| --- | --- | --- |
| CV and gate | J78 (CV 1) to the pitch input. J80 (CV 2) is track 2, and so on. J79 (GATE 1) to the gate input | CV is 1 V per octave. Gate is 5 V or 10 V ([ZAQ Settings](09-global-sync-memory-and-maintenance.md#92-zaq-settings-hold-b59--b61-in-zaq)) |
| MIDI | J72 (MIDI OUT A) to the synth MIDI IN | Set the track port and channel in step 6 |

### Enter the notes

1. Tap B1 until the button is pink. The unit is in [ZAQ mode](13-glossary.md#zaq-mode).
2. Press B21 (T1). The track 1 button flashes.
3. Press B5 (PITCH). [DISP](13-glossary.md#display-disp) shows the pitch of a step.
4. Turn E25. DISP shows the note of step 1. All steps start at C3.
5. Turn E26 to E32 for steps 2 to 8. Step k is E(24+k).
6. If you use MIDI, press B59. Turn E41 to pick the port. Turn E42 to pick the channel. Press B60 to leave.
7. Press B7 (MUTE). Toggle each unused step. The LED of a muted step goes dark.
8. Press B68 (PLAY/STOP). The pattern plays. The [playhead](13-glossary.md#playhead) moves on the [ring LEDs](13-glossary.md#ring-led).
9. Press B68 again. The pattern stops.

> **Note:** The manual says "toggle" for mute and skip. It does not say whether to turn or push the [encoder](13-glossary.md#encoder). Test it on the unit.

**Tip:** `hold B5 + turn any E` moves all steps together. Use it to set the key root first.

### Shape the pattern

Press a parameter button, then turn the step encoders. The change takes effect while the pattern plays.

| Press | Turn the encoders to change | Range |
| --- | --- | --- |
| B6 (VELOCITY) | velocity of each step | 0 to 127 |
| B9 (LENGTH) | note length of each step | 96 to 4b |
| B8 (DELAY) | timing of each step | −5 to +5 |
| B16 (SEQ LENGTH) | the last step (E25 is 1, E56 is 32) | 1 to 32 |

Chapter [5](05-sequencer-per-track-parameters.md#5-sequencer-zaq-mode--per-track-parameters) lists all 16 parameters.

### Save the pattern

> **Warning:** The unit loses a pattern at power-off if you do not store it permanently. Nothing loads at power-up.

1. Hold B61 (STORE). [Page](13-glossary.md#page) with B63 and B64 to pick a page from 1 to 12.
2. Press a [slot](13-glossary.md#slot) button from B5 to B20. B61 stays lit.
3. Press B60 (EXIT).
4. Hold [SEL](13-glossary.md#select-encoder-sel) and press B61. DISP confirms the store.

To load the pattern, press B62, page with B63 and B64, press the slot, then press B60. See [Patterns](07-sequencer-procedures.md#76-patterns).

## 10.2 Quick start: send a MIDI control from CTRL mode

Goal: make encoder E25 send a [CC](13-glossary.md#control-change-cc) (control change) message.

1. Tap B1 until the button is amber. The unit is in [CTRL mode](13-glossary.md#ctrl-mode).
2. Hold B59 and turn E25. The unit enters CTRL Edit.
3. Turn SEL to pick CC. The type changes.
4. Press B64 to move to the next field. Turn SEL to set the value. Repeat for each field.
5. Press B60. The setup ends.
6. Turn E25. The unit sends the CC message on the port and channel you set.

[Learn](13-glossary.md#learn) mode is faster if a device can send the message. Hold B62 and turn E25. Then send the message from the other device. See [Learn](08-controller.md#82-learn).

> **Note:** Verified on firmware 1.0.3 (2026-11-11): the first factory [preset](13-glossary.md#preset) sent CC 97, 65, 66 and 98 on channel 1 of the port `BCR-32 CTRL`. Which control sends which message is not mapped yet.

Store the setup in a preset. See [Presets](08-controller.md#83-presets). The field lists for each type are in [Setup fields per type](08-controller.md#84-setup-fields-per-type).

## 10.3 Task lookup

Each row shows the mode, the key sequence and the chapter. The notation is in [How to read this manual](00-how-to-read-this-manual.md#0-how-to-read-this-manual).

### Play and edit the sequencer

| Task | Mode | Keys | Detail |
| --- | --- | --- | --- |
| Switch between sequencer and controller | any | tap B1 | [2](02-modes-and-menus.md#2-modes-and-menus-state-machine) |
| Start or stop the pattern | ZAQ | B68 | [7.7](07-sequencer-procedures.md#77-transport) |
| Go back to step 1 | ZAQ | B67 | [7.7](07-sequencer-procedures.md#77-transport) |
| Change the note of a step | ZAQ | B5, turn the step encoder | [7.2](07-sequencer-procedures.md#72-step-enter-notes) |
| Move all notes together | ZAQ | `hold B5 + turn any E` | [5](05-sequencer-per-track-parameters.md#5-sequencer-zaq-mode--per-track-parameters) |
| Add a [chord](13-glossary.md#chord) to a step | ZAQ | B13, turn the step encoder | [5](05-sequencer-per-track-parameters.md#5-sequencer-zaq-mode--per-track-parameters) |
| Skip a step | ZAQ | B14, toggle the step | [5](05-sequencer-per-track-parameters.md#5-sequencer-zaq-mode--per-track-parameters) |
| Shorten a track to 16 steps | ZAQ | select the track, B16, turn E40 | [5](05-sequencer-per-track-parameters.md#5-sequencer-zaq-mode--per-track-parameters) |
| Change the play direction | ZAQ | B20, turn SEL | [5](05-sequencer-per-track-parameters.md#5-sequencer-zaq-mode--per-track-parameters) |
| Add swing | ZAQ | B19, turn E30 (even steps) or E31 (odd steps) | [5](05-sequencer-per-track-parameters.md#5-sequencer-zaq-mode--per-track-parameters) |
| Make random velocities | ZAQ | `hold B12`, turn E33 to random, then `hold B12 + B6` | [5](05-sequencer-per-track-parameters.md#5-sequencer-zaq-mode--per-track-parameters) |
| Record notes in real time | ZAQ | B65, B64 to RECORD, B68, play the keys | [7.3](07-sequencer-procedures.md#73-real-time-record-note-track) |
| Make a track a [drum track](13-glossary.md#drum-track) | ZAQ | B59, turn E37 to E40 to Drum | [7.4](07-sequencer-procedures.md#74-drum-tracks) |
| Mute a track | ZAQ | stop, B66, press the track button | [7.5](07-sequencer-procedures.md#75-mixer-and-note-repeat) |
| Repeat notes | ZAQ | `hold B64 + turn any E`, then press a track button | [7.5](07-sequencer-procedures.md#75-mixer-and-note-repeat) |
| Copy a track | ZAQ | `hold` the destination track button, press the source | [7.6](07-sequencer-procedures.md#76-patterns) |
| Chain two patterns | ZAQ | `hold` a pattern button, press another | [7.6](07-sequencer-procedures.md#76-patterns) |
| Store a pattern for good | ZAQ | `hold B61`, page, slot, B60, `hold SEL + B61` | [7.6](07-sequencer-procedures.md#76-patterns) |
| Load a pattern | ZAQ | B62, page, slot, B60 | [7.6](07-sequencer-procedures.md#76-patterns) |

### Tempo, clock and routing

| Task | Mode | Keys | Detail |
| --- | --- | --- | --- |
| Change the tempo | ZAQ | B59, turn E25 | [6](06-zaq-global-page.md#6-zaq-global-page-press-b59-in-zaq) |
| Sync to a DAW over USB | ZAQ | B59, E26 to USB. [Operation mode](13-glossary.md#operation-mode) must be USB or MIXED | [6](06-zaq-global-page.md#6-zaq-global-page-press-b59-in-zaq), [9.1](09-global-sync-memory-and-maintenance.md#91-global-settings-b1-3s-sel-to-change-push-sel-to-save) |
| Send clock to MIDI A | ZAQ | B59, E27 to MIDI A. The [clock source](13-glossary.md#clock-source) must be Internal | [6](06-zaq-global-page.md#6-zaq-global-page-press-b59-in-zaq) |
| Set the MIDI channel of a track | ZAQ | B59, turn E42, E44, E46 or E48 | [6](06-zaq-global-page.md#6-zaq-global-page-press-b59-in-zaq) |
| Set the output port of a track | ZAQ | B59, turn E41, E43, E45 or E47 | [6](06-zaq-global-page.md#6-zaq-global-page-press-b59-in-zaq) |
| Lock the notes to a [scale](13-glossary.md#scale) | ZAQ | B59, E30 for the scale, E31 for the root | [6](06-zaq-global-page.md#6-zaq-global-page-press-b59-in-zaq) |
| Set the gate level (5 V or 10 V) | [ZAQ Settings](13-glossary.md#zaq-settings) | `hold B59 + B61`, B5 | [9.2](09-global-sync-memory-and-maintenance.md#92-zaq-settings-hold-b59--b61-in-zaq) |
| Use the sync jacks | ZAQ Settings | `hold B59 + B61`, B6 to B8 | [9.2](09-global-sync-memory-and-maintenance.md#92-zaq-settings-hold-b59--b61-in-zaq) |
| Power the unit from a charger | any | connect J69 | [4](04-rear-panel.md#4-rear-panel) |

### Controller

| Task | Mode | Keys | Detail |
| --- | --- | --- | --- |
| Assign a control | CTRL | `hold B59 + turn E`, turn SEL to the type, B64 for the next field | [8.1](08-controller.md#81-assign-a-control) |
| Learn a control from incoming MIDI | CTRL | `hold B62 + turn E`, send the message | [8.2](08-controller.md#82-learn) |
| Store a preset | CTRL | B61, B63 or B64 for the location, B61, B61 | [8.3](08-controller.md#83-presets) |
| Store a preset for good | CTRL | after the store, `hold SEL + B61` | [8.3](08-controller.md#83-presets) |
| Load a preset | CTRL | B63 or B64 to the location | [8.3](08-controller.md#83-presets) |
| Assign a [footswitch](13-glossary.md#footswitch) | CTRL | [Global Settings](13-glossary.md#global-settings): B9 or B10 to CTRL | [9.1](09-global-sync-memory-and-maintenance.md#91-global-settings-b1-3s-sel-to-change-push-sel-to-save) |

### Settings and maintenance

> **Warning:** B8 in Global Settings starts CV calibration. B12 starts a [factory restore](13-glossary.md#factory-restore). Read the display before you push SEL.

| Task | Mode | Keys | Detail |
| --- | --- | --- | --- |
| Open Global Settings | any | `B1 ×3s` | [9.1](09-global-sync-memory-and-maintenance.md#91-global-settings-b1-3s-sel-to-change-push-sel-to-save) |
| Set the power-up mode | Global Settings | B5, turn SEL, push SEL | [9.1](09-global-sync-memory-and-maintenance.md#91-global-settings-b1-3s-sel-to-change-push-sel-to-save) |
| Read the firmware version | Global Settings | B11 | [9.1](09-global-sync-memory-and-maintenance.md#91-global-settings-b1-3s-sel-to-change-push-sel-to-save) |
| Export all ZAQ memory (backup) | ZAQ | B61, `hold SEL + push E25`, push E29 | [9.3](09-global-sync-memory-and-maintenance.md#93-erase-and-sysex-all-start-with-b61-then-hold-sel--push-e) |
| Erase memory | either | start with B61. The steps destroy data | [9.3](09-global-sync-memory-and-maintenance.md#93-erase-and-sysex-all-start-with-b61-then-hold-sel--push-e) |
| Calibrate the CV outputs | Global Settings | B8. The unit is calibrated at the factory | [9.4](09-global-sync-memory-and-maintenance.md#94-cv-calibration-factory-calibrated-only-if-needed) |
| Recover a unit that does not start | — | see the [recovery runbook](../guides/recovery-runbook.md) | — |
| Fix a connection or sync fault | — | see [troubleshooting](../guides/troubleshooting.md) | — |
