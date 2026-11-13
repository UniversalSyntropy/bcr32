---
title: 14. Generated tables and indexes
description: "Chapter 14 of the BCR32 manual: the control table of each mode, an index by control and an index by function. Written from the device data."
status: draft
last_updated: 2026-11-11
source: Generated from data/devices/bcr32 by tools/gen-tables
---

# 14. Generated tables and indexes

A tool writes every table in this chapter from the device data. Do not edit a table by hand. To change a table, change the data in `data/devices/bcr32/` and run `npm run gen:tables`.

The three indexes of the manual are:

- **By control:** [Index by control](#index-by-control).
- **By function:** [Index by function](#index-by-function).
- **By task:** [chapter 10](10-quick-lookup-how-do-i.md). A person writes it, because the device data holds no tasks.

## Control tables by mode

Each table lists the functions of one mode. The Source column shows where the fact comes from.

### ZAQ (sequencer)

<!-- gen:functions mode=zaq -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B1` | Go to CTRL mode | `tap B1` | — | — | — | manual |
| `E25`–`E56` | Step value of the selected parameter | `turn E` | — | — | — | manual |
| `B59`, `E25`–`E56` | Change all steps together | `hold B59 + turn E` | — | — | — | manual |
| `B5` | Pitch | `press B5` | Step pitch | 60 | — | manual |
| `B6` | Velocity | `press B6` | Velocity | 100 | — | manual |
| `B7` | Step mute | `press B7` | Step play or mute | play | — | manual |
| `B8` | Timing shift | `press B8` | Timing shift | 0 | — | manual |
| `B9` | Note length | `press B9` | Note length | 32 | — | manual |
| `B10` | MIDI CTRL α value | `press B10` | MIDI CTRL lane value | — | — | manual |
| `B11` | MIDI CTRL β value | `press B11` | MIDI CTRL lane value | — | — | manual |
| `B12` | Wave generator | `hold B12` | — | — | — | manual |
| `B12`, `E33` | Wave generator shape | `hold B12 + turn E33` | Wave generator shape | — | — | manual |
| `B12`, `E34` | Wave generator gain | `hold B12 + turn E34` | Wave generator gain | 50 | — | manual |
| `B12`, `E35` | Wave generator rate | `hold B12 + turn E35` | Wave generator rate | 5 | — | manual |
| `B12`, `E36` | Wave generator offset | `hold B12 + turn E36` | Wave generator offset | 63 | — | manual |
| `B12`, `B5`–`B11` | Apply the wave generator to a lane | `hold B12 + press B5` | — | — | — | manual |
| `B13` | Chord | `press B13` | Chord type | Off | — | manual |
| `B14` | Step skip | `press B14` | Step play or skip | play | — | manual |
| `B15` | Start step | `press B15` | Step number | 1 | — | manual |
| `B16` | Track length | `press B16` | Step number | 32 | — | manual |
| `B17` | Track offset | `press B17` | Step offset | 0 | — | manual |
| `B18`, `SEL` | Clock divider | `press B18` | Clock divider | 16 | — | manual |
| `B19`, `E30` | Shuffle, even steps | `press B19` | Shuffle, even steps | 0 | — | manual |
| `B19`, `E31` | Shuffle, odd steps | `press B19` | Shuffle, odd steps | 0 | — | manual |
| `B20`, `SEL` | Play direction | `press B20` | Play direction | Forward | — | manual |
| `B21`–`B24` | Select a track | `press B21` | — | — | — | manual |
| `B21`–`B24` | Copy a track | `hold B21 + press B22` | — | — | — | manual |
| `B10`, `B11` | Write the scale into the notes | `press B10 and B11 together` | — | — | — | manual |
| `B59` | Open the ZAQ Global page | `press B59` | — | — | — | manual |
| `B59`, `B61` | Open ZAQ Settings | `hold B59 + B61` | — | — | — | manual |
| `B60` | Exit | `press B60` | — | — | — | manual |
| `B61` | Open the pattern store view | `hold B61` | — | — | — | manual |
| `SEL`, `B61` | Make the stored patterns permanent | `hold SEL + press B61` | — | — | — | manual |
| `B62` | Open the pattern load view | `press B62` | — | — | — | manual |
| `B65` | Real-time record on or off | `press B65` | — | — | — | manual |
| `B66` | Open the mixer | `press B66` | — | — | — | manual |
| `B67` | Go back to step 1 | `press B67` | — | — | — | manual |
| `B68` | Start or stop the sequencer | `press B68` | — | — | — | manual |
| `J74` | Footswitch 1: start or stop | — | — | — | — | manual |
| `J75` | Footswitch 2: next pattern | — | — | — | — | manual |

<!-- gen:end -->

### CTRL (controller)

<!-- gen:functions mode=ctrl -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B1` | Go to ZAQ mode | `tap B1` | — | — | — | manual |
| `B5`–`B24`, `E25`–`E56`, `B65`–`B68` | Send the assigned MIDI message | — | — | — | ch 1: CC 5, 7, 9, 12, 14–18, 40–42, 44–53, 65–80, 85, 87–90, 97–98 | manual |
| `J74`, `J75` | Footswitch: send the assigned MIDI message | — | — | — | — | manual |
| `B59`, `B5`–`B24`, `E25`–`E56`, `B65`–`B68` | Assign a control | `hold B59 + turn E` | — | — | ch 1: CC 5, 7, 9, 12, 14–18, 40–42, 44–53, 65–80, 85, 87–90, 97–98 | manual |
| `B62`, `B5`–`B24`, `E25`–`E56`, `B65`–`B68` | Learn a MIDI message | `hold B62 + turn E` | — | — | ch 1: CC 5, 7, 9, 12, 14–18, 40–42, 44–53, 65–80, 85, 87–90, 97–98 | manual |
| `B59`, `B61` | Open CTRL Settings | `hold B59 + B61` | — | — | — | manual |
| `B63` | Previous preset | `press B63` | Controller preset | — | — | manual |
| `B64` | Next preset | `press B64` | Controller preset | — | — | manual |
| `B61` | Open the preset store view | `press B61` | — | — | — | manual |
| `SEL`, `B61` | Make the stored presets permanent | `hold SEL + press B61` | — | — | — | manual |
| `B60` | Exit | `press B60` | — | — | — | manual |

<!-- gen:end -->

### Global Settings

<!-- gen:functions mode=global-settings -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `SEL` | Change and save a setting | `turn SEL` | — | — | — | manual |
| `B5` | Device mode at power-up | `press B5` | Device mode at power-up | — | — | manual |
| `B6` | Device ID | `press B6` | Device ID | — | — | manual |
| `B7` | Operation mode | `press B7` | Operation mode | — | — | unit, firmware 1.0.3 |
| `B8` | Start CV calibration | `press B8` | — | — | — | manual |
| `B9` | Footswitch 1 use | `press B9` | Footswitch 1 use | — | — | manual |
| `B10` | Footswitch 2 use | `press B10` | Footswitch 2 use | — | — | manual |
| `B11` | Show the firmware version | `press B11` | — | — | — | unit, firmware 1.0.3 |
| `B12` | Factory restore | `press B12` | Confirm | — | — | manual |
| `B13` | Pattern change channel | `press B13` | — | — | — | unit, firmware 1.0.3 |
| `B14` | Encoder acceleration | `press B14` | — | — | — | unit, firmware 1.0.3 |
| `B15` | Footswitch polarity | `press B15` | — | — | — | unit, firmware 1.0.3 |
| `B1` | Exit | `tap B1` | — | — | — | manual |

<!-- gen:end -->

### CV calibration

<!-- gen:functions mode=cv-calibration -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `E25`–`E28` | Select CV output 1 to 4 | `turn E25` | — | — | — | manual |
| `B5`–`B16`, `B19`, `B20` | Number pad | — | — | — | — | manual |
| `E33`–`E36` | First meter reading, CV output 1 to 4 | `turn E33` | — | — | — | manual |
| `E41`–`E44` | Second meter reading, CV output 1 to 4 | `turn E41` | — | — | — | manual |
| `E25`–`E28` | Test the output | `push E25` | — | — | — | manual |
| `B1` | Finish | `press B1` | — | — | — | manual |

<!-- gen:end -->

### ZAQ Settings

<!-- gen:functions mode=zaq-settings -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B5` | Gate output level | `press B5` | Gate output level | — | — | manual |
| `B6` | Sync input clock rate | `press B6` | Sync clock rate | — | — | manual |
| `B7` | Sync output clock rate | `press B7` | Sync clock rate | — | — | manual |
| `B8` | Sync input start | `press B8` | Sync input start | — | — | unit, firmware 1.0.3 |
| `B60` | Exit | `press B60` | — | — | — | manual |

<!-- gen:end -->

### CTRL Settings

<!-- gen:functions mode=ctrl-settings -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B5` | Output routing | `press B5` | MIDI output routing | — | — | manual |
| `B6`, `E28` | MIDI thru source | `press B6` | MIDI thru source | — | — | manual |
| `B6`, `SEL` | MIDI thru destination | `press B6` | MIDI thru destination | — | — | manual |
| `B7` | Echo dead time | `press B7` | — | — | — | unit, firmware 1.0.3 |
| `B60` | Exit | `press B60` | — | — | — | manual |

<!-- gen:end -->

### ZAQ Global page

<!-- gen:functions mode=zaq-global -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `E25` | Tempo | `turn E25` | Tempo | — | — | manual |
| `E26` | Clock source | `turn E26` | Clock source | — | — | manual |
| `E27` | Clock output | `turn E27` | Clock output | Off | — | manual |
| `E28` | MIDI thru source | `turn E28` | MIDI thru source | — | — | manual |
| `E28`, `SEL` | MIDI thru destination | `push SEL` | MIDI thru destination | — | — | manual |
| `E29` | Note display | `turn E29` | Note display | — | — | manual |
| `E30` | Scale | `turn E30` | Scale | OFF | — | manual |
| `E31` | Scale base note | `turn E31` | Scale base note | — | — | manual |
| `B10`, `E41`–`E52` | Set the user scale | `hold B10` | — | — | — | manual |
| `E32` | Transpose input | `turn E32` | Transpose input | Off | — | manual |
| `E33` | Pattern switch by CC: channel | `turn E33` | MIDI channel or off | — | — | manual |
| `E34` | Pattern switch by CC: CC number | `turn E34` | CC number | — | — | manual |
| `E35` | Quantize rate | `turn E35` | Note length | 32 | — | manual |
| `E36` | Quantize on or off | `turn E36` | On or off | on | — | manual |
| `E37`–`E40` | Track mode, tracks 1 to 4 | `turn E37` | Track mode | Chord | — | manual |
| `E41`, `E43`, `E45`, `E47` | MIDI output, tracks 1 to 4 | `turn E41` | MIDI output routing | — | — | manual |
| `E42`, `E44`, `E46`, `E48` | MIDI channel, tracks 1 to 4 | `turn E42` | MIDI channel | — | — | manual |
| `E49`, `E51`, `E53`, `E55` | MIDI CTRL α target, tracks 1 to 4 | `turn E49` | MIDI CTRL lane target | off | — | manual |
| `E50`, `E52`, `E54`, `E56` | MIDI CTRL β target, tracks 1 to 4 | `turn E50` | MIDI CTRL lane target | off | — | manual |
| `B63`, `E25`–`E56` | Show a value with no change | `hold B63 + turn E` | — | — | — | manual |
| `B21`–`B24`, `E25`–`E40` | Drum voice pitch | `hold B21 + turn E25` | Step pitch | — | — | manual |
| `B60` | Exit | `press B60` | — | — | — | manual |

<!-- gen:end -->

### ZAQ Mixer

<!-- gen:functions mode=zaq-mixer -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B21`–`B24` | Mute a track | `press B21` | — | — | — | manual |
| `B5`–`B20` | Mute a drum voice | `press B5` | — | — | — | manual |
| `B64`, `E25`–`E56` | Note repeat rate | `hold B64 + turn E` | Note repeat rate | — | — | manual |
| `B64`, `B21`–`B24`, `B5`–`B20` | Note repeat on a track or a drum voice | `hold B64 + press B21` | — | — | — | manual |
| `B66`, `B60` | Leave the mixer | `press B66` | — | — | — | manual |

<!-- gen:end -->

### Real-time record

<!-- gen:functions mode=zaq-record -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B64` | Record sub-mode | `press B64` | Real-time record sub-mode | NOTE | — | manual |
| `B6`, `B7`, `B9`–`B11`, `B13`–`B20` | Virtual keyboard | `press B13` | — | — | — | inference |
| `B63`, `B5`–`B20` | Erase notes while the pattern plays | `hold B63 + press B13` | — | — | — | manual |
| `B5`–`B20` | Select a drum voice | `press B5` | Drum voice | — | — | manual |
| `E25`–`E56` | Set or remove a drum step | `turn E` | — | — | — | manual |
| `B5`–`B20`, `E25`–`E56` | Fill or clear all steps of a drum voice | `hold B5 + turn E` | — | — | — | manual |
| `B65`, `B12` | Random steps for a drum voice | `hold B65 + press B12` | — | — | — | manual |
| `B65` | Leave real-time record | `press B65` | — | — | — | manual |

<!-- gen:end -->

### ZAQ pattern store

<!-- gen:functions mode=zaq-store -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B63`, `B64` | Pattern page | `press B64` | Pattern page | — | — | manual |
| `B5`–`B20` | Store to a slot | `press B5` | Pattern slot | — | — | manual |

<!-- gen:end -->

### ZAQ pattern load

<!-- gen:functions mode=zaq-load -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B63`, `B64` | Pattern page | `press B64` | Pattern page | — | — | manual |
| `B5`–`B20` | Load a slot | `press B5` | Pattern slot | — | — | manual |
| `B5`–`B20` | Chain patterns | `hold B5 + press B6` | — | — | — | manual |

<!-- gen:end -->

### CTRL Edit

<!-- gen:functions mode=ctrl-edit -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `SEL` | Message type | `turn SEL` | Control message type | — | — | manual |
| `B63`, `B64` | Previous or next setup field | `press B64` | — | — | — | manual |
| `SEL` | Value of the setup field | `turn SEL` | — | — | — | manual |
| `SEL` | Button mode field | `turn SEL` | Button mode | — | — | manual |
| `SEL` | Encoder mode field | `turn SEL` | Encoder mode | — | — | manual |
| `SEL` | LED ring style field | `turn SEL` | LED ring style | 1dot_in | — | manual |
| `SEL` | GS parameter field | `turn SEL` | GS parameter | — | — | manual |
| `SEL` | MMC command field | `turn SEL` | MMC command | — | — | manual |
| `SEL` | MMC frame rate field | `turn SEL` | MMC frame rate | — | — | manual |
| `B60` | Finish | `press B60` | — | — | — | manual |

<!-- gen:end -->

### CTRL Learn

<!-- gen:functions mode=ctrl-learn -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B60` | Exit | `press B60` | — | — | — | manual |

<!-- gen:end -->

### CTRL preset store

<!-- gen:functions mode=ctrl-store -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B63`, `B64` | Preset location | `press B64` | Controller preset | — | — | manual |
| `B61` | Confirm and write | `press B61` | — | — | — | manual |

<!-- gen:end -->

### Erase menu

<!-- gen:functions mode=memory-erase -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `E31` | Reset the sequencer global settings | `push E31` | — | — | — | manual |
| `E32` | Erase all patterns, keep the global settings | `push E32` | — | — | — | manual |
| `E32` | Erase all controller memory | `push E32` | — | — | — | manual |
| `B60` | Exit | `press B60` | — | — | — | manual |

<!-- gen:end -->

### SysEx export menu

<!-- gen:functions mode=sysex-export -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `E29` | Export all ZAQ memory | `push E29` | — | — | — | manual |
| `E30` | Export the 12 pattern pages | `push E30` | — | — | — | manual |
| `E31` | Export the current pattern page | `push E31` | — | — | — | manual |
| `E32` | Export the current pattern | `push E32` | — | — | — | manual |
| `E31` | Export all 64 presets | `push E31` | — | — | — | manual |
| `E32` | Export the current preset | `push E32` | — | — | — | manual |
| `B60` | Exit | `press B60` | — | — | — | manual |

<!-- gen:end -->

### SysEx import

<!-- gen:functions mode=sysex-import -->

| Controls | Function | Action | Values | Default | MIDI seen (firmware 1.0.3) | Source |
| --- | --- | --- | --- | --- | --- | --- |
| `B60` | Exit | `press B60` | — | — | — | manual |

<!-- gen:end -->

## Index by control

Find a control, then read what it does in each mode. A control with no function row is described in [chapter 3](03-top-panel-control-map.md) or [chapter 4](04-rear-panel.md).

<!-- gen:index-controls -->

| Control | Kind | Functions (mode: function) |
| --- | --- | --- |
| `B1` | Button | ZAQ (sequencer): Go to CTRL mode; CTRL (controller): Go to ZAQ mode; Global Settings: Exit; CV calibration: Finish |
| `L2.in` | LED | — |
| `L2.a` | LED | — |
| `L2.b` | LED | — |
| `L3.1` | LED | — |
| `L3.2` | LED | — |
| `L4` | LED | — |
| `B5` | Button | ZAQ (sequencer): Pitch; ZAQ (sequencer): Apply the wave generator to a lane; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; ZAQ Settings: Gate output level; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CTRL Settings: Output routing; Global Settings: Device mode at power-up; CV calibration: Number pad |
| `B6` | Button | ZAQ (sequencer): Velocity; ZAQ (sequencer): Apply the wave generator to a lane; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; ZAQ Settings: Sync input clock rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CTRL Settings: MIDI thru source; CTRL Settings: MIDI thru destination; Global Settings: Device ID; CV calibration: Number pad |
| `B7` | Button | ZAQ (sequencer): Step mute; ZAQ (sequencer): Apply the wave generator to a lane; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; ZAQ Settings: Sync output clock rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CTRL Settings: Echo dead time; Global Settings: Operation mode; CV calibration: Number pad |
| `B8` | Button | ZAQ (sequencer): Timing shift; ZAQ (sequencer): Apply the wave generator to a lane; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; ZAQ Settings: Sync input start; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; Global Settings: Start CV calibration; CV calibration: Number pad |
| `B9` | Button | ZAQ (sequencer): Note length; ZAQ (sequencer): Apply the wave generator to a lane; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; Global Settings: Footswitch 1 use; CV calibration: Number pad |
| `B10` | Button | ZAQ (sequencer): MIDI CTRL α value; ZAQ (sequencer): Apply the wave generator to a lane; ZAQ (sequencer): Write the scale into the notes; ZAQ Global page: Set the user scale; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; Global Settings: Footswitch 2 use; CV calibration: Number pad |
| `B11` | Button | ZAQ (sequencer): MIDI CTRL β value; ZAQ (sequencer): Apply the wave generator to a lane; ZAQ (sequencer): Write the scale into the notes; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; Global Settings: Show the firmware version; CV calibration: Number pad |
| `B12` | Button | ZAQ (sequencer): Wave generator; ZAQ (sequencer): Wave generator shape; ZAQ (sequencer): Wave generator gain; ZAQ (sequencer): Wave generator rate; ZAQ (sequencer): Wave generator offset; ZAQ (sequencer): Apply the wave generator to a lane; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; Real-time record: Random steps for a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; Global Settings: Factory restore; CV calibration: Number pad |
| `B13` | Button | ZAQ (sequencer): Chord; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; Global Settings: Pattern change channel; CV calibration: Number pad |
| `B14` | Button | ZAQ (sequencer): Step skip; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; Global Settings: Encoder acceleration; CV calibration: Number pad |
| `B15` | Button | ZAQ (sequencer): Start step; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; Global Settings: Footswitch polarity; CV calibration: Number pad |
| `B16` | Button | ZAQ (sequencer): Track length; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: Number pad |
| `B17` | Button | ZAQ (sequencer): Track offset; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `B18` | Button | ZAQ (sequencer): Clock divider; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `B19` | Button | ZAQ (sequencer): Shuffle, even steps; ZAQ (sequencer): Shuffle, odd steps; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: Number pad |
| `B20` | Button | ZAQ (sequencer): Play direction; Real-time record: Virtual keyboard; Real-time record: Erase notes while the pattern plays; Real-time record: Select a drum voice; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Mute a drum voice; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Store to a slot; ZAQ pattern load: Load a slot; ZAQ pattern load: Chain patterns; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: Number pad |
| `B21` | Button | ZAQ (sequencer): Select a track; ZAQ (sequencer): Copy a track; ZAQ Global page: Drum voice pitch; ZAQ Mixer: Mute a track; ZAQ Mixer: Note repeat on a track or a drum voice; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `B22` | Button | ZAQ (sequencer): Select a track; ZAQ (sequencer): Copy a track; ZAQ Global page: Drum voice pitch; ZAQ Mixer: Mute a track; ZAQ Mixer: Note repeat on a track or a drum voice; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `B23` | Button | ZAQ (sequencer): Select a track; ZAQ (sequencer): Copy a track; ZAQ Global page: Drum voice pitch; ZAQ Mixer: Mute a track; ZAQ Mixer: Note repeat on a track or a drum voice; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `B24` | Button | ZAQ (sequencer): Select a track; ZAQ (sequencer): Copy a track; ZAQ Global page: Drum voice pitch; ZAQ Mixer: Mute a track; ZAQ Mixer: Note repeat on a track or a drum voice; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E25` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Tempo; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: Select CV output 1 to 4; CV calibration: Test the output |
| `E26` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Clock source; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: Select CV output 1 to 4; CV calibration: Test the output |
| `E27` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Clock output; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: Select CV output 1 to 4; CV calibration: Test the output |
| `E28` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: MIDI thru source; ZAQ Global page: MIDI thru destination; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CTRL Settings: MIDI thru source; CV calibration: Select CV output 1 to 4; CV calibration: Test the output |
| `E29` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Note display; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; SysEx export menu: Export all ZAQ memory |
| `E30` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ (sequencer): Shuffle, even steps; ZAQ Global page: Scale; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; SysEx export menu: Export the 12 pattern pages |
| `E31` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ (sequencer): Shuffle, odd steps; ZAQ Global page: Scale base note; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; Erase menu: Reset the sequencer global settings; SysEx export menu: Export the current pattern page; SysEx export menu: Export all 64 presets |
| `E32` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Transpose input; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; Erase menu: Erase all patterns, keep the global settings; Erase menu: Erase all controller memory; SysEx export menu: Export the current pattern; SysEx export menu: Export the current preset |
| `E33` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ (sequencer): Wave generator shape; ZAQ Global page: Pattern switch by CC: channel; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: First meter reading, CV output 1 to 4 |
| `E34` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ (sequencer): Wave generator gain; ZAQ Global page: Pattern switch by CC: CC number; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: First meter reading, CV output 1 to 4 |
| `E35` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ (sequencer): Wave generator rate; ZAQ Global page: Quantize rate; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: First meter reading, CV output 1 to 4 |
| `E36` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ (sequencer): Wave generator offset; ZAQ Global page: Quantize on or off; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: First meter reading, CV output 1 to 4 |
| `E37` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Track mode, tracks 1 to 4; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E38` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Track mode, tracks 1 to 4; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E39` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Track mode, tracks 1 to 4; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E40` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Track mode, tracks 1 to 4; ZAQ Global page: Show a value with no change; ZAQ Global page: Drum voice pitch; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E41` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI output, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: Second meter reading, CV output 1 to 4 |
| `E42` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI channel, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: Second meter reading, CV output 1 to 4 |
| `E43` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI output, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: Second meter reading, CV output 1 to 4 |
| `E44` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI channel, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message; CV calibration: Second meter reading, CV output 1 to 4 |
| `E45` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI output, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E46` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI channel, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E47` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI output, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E48` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI channel, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E49` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI CTRL α target, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E50` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI CTRL β target, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E51` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI CTRL α target, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E52` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: Set the user scale; ZAQ Global page: MIDI CTRL β target, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E53` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: MIDI CTRL α target, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E54` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: MIDI CTRL β target, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E55` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: MIDI CTRL α target, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `E56` | Encoder | ZAQ (sequencer): Step value of the selected parameter; ZAQ (sequencer): Change all steps together; ZAQ Global page: MIDI CTRL β target, tracks 1 to 4; ZAQ Global page: Show a value with no change; Real-time record: Set or remove a drum step; Real-time record: Fill or clear all steps of a drum voice; ZAQ Mixer: Note repeat rate; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `DISP` | Display | — |
| `SEL` | Encoder | ZAQ (sequencer): Clock divider; ZAQ (sequencer): Play direction; ZAQ (sequencer): Make the stored patterns permanent; ZAQ Global page: MIDI thru destination; CTRL (controller): Make the stored presets permanent; CTRL Edit: Message type; CTRL Edit: Value of the setup field; CTRL Edit: Button mode field; CTRL Edit: Encoder mode field; CTRL Edit: LED ring style field; CTRL Edit: GS parameter field; CTRL Edit: MMC command field; CTRL Edit: MMC frame rate field; CTRL Settings: MIDI thru destination; Global Settings: Change and save a setting |
| `B59` | Button | ZAQ (sequencer): Change all steps together; ZAQ (sequencer): Open the ZAQ Global page; ZAQ (sequencer): Open ZAQ Settings; CTRL (controller): Assign a control; CTRL (controller): Open CTRL Settings |
| `B60` | Button | ZAQ (sequencer): Exit; ZAQ Global page: Exit; ZAQ Mixer: Leave the mixer; ZAQ Settings: Exit; CTRL (controller): Exit; CTRL Edit: Finish; CTRL Learn: Exit; CTRL Settings: Exit; Erase menu: Exit; SysEx export menu: Exit; SysEx import: Exit |
| `B61` | Button | ZAQ (sequencer): Open ZAQ Settings; ZAQ (sequencer): Open the pattern store view; ZAQ (sequencer): Make the stored patterns permanent; CTRL (controller): Open CTRL Settings; CTRL (controller): Open the preset store view; CTRL (controller): Make the stored presets permanent; CTRL preset store: Confirm and write |
| `B62` | Button | ZAQ (sequencer): Open the pattern load view; CTRL (controller): Learn a MIDI message |
| `B63` | Button | ZAQ Global page: Show a value with no change; Real-time record: Erase notes while the pattern plays; ZAQ pattern store: Pattern page; ZAQ pattern load: Pattern page; CTRL (controller): Previous preset; CTRL Edit: Previous or next setup field; CTRL preset store: Preset location |
| `B64` | Button | Real-time record: Record sub-mode; ZAQ Mixer: Note repeat rate; ZAQ Mixer: Note repeat on a track or a drum voice; ZAQ pattern store: Pattern page; ZAQ pattern load: Pattern page; CTRL (controller): Next preset; CTRL Edit: Previous or next setup field; CTRL preset store: Preset location |
| `B65` | Button | ZAQ (sequencer): Real-time record on or off; Real-time record: Random steps for a drum voice; Real-time record: Leave real-time record; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `B66` | Button | ZAQ (sequencer): Open the mixer; ZAQ Mixer: Leave the mixer; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `B67` | Button | ZAQ (sequencer): Go back to step 1; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `B68` | Button | ZAQ (sequencer): Start or stop the sequencer; CTRL (controller): Send the assigned MIDI message; CTRL (controller): Assign a control; CTRL (controller): Learn a MIDI message |
| `J69` | Jack | — |
| `J70` | Jack | — |
| `J71` | Jack | — |
| `J72` | Jack | — |
| `J73` | Jack | — |
| `J74` | Jack | ZAQ (sequencer): Footswitch 1: start or stop; CTRL (controller): Footswitch: send the assigned MIDI message |
| `J75` | Jack | ZAQ (sequencer): Footswitch 2: next pattern; CTRL (controller): Footswitch: send the assigned MIDI message |
| `J76` | Jack | — |
| `J77` | Jack | — |
| `J78` | Jack | — |
| `J79` | Jack | — |
| `J80` | Jack | — |
| `J81` | Jack | — |
| `J82` | Jack | — |
| `J83` | Jack | — |
| `J84` | Jack | — |
| `J85` | Jack | — |

<!-- gen:end -->

## Index by function

Find a function by name. The table lists the mode, the controls and the action.

<!-- gen:index-functions -->

| Function | Mode | Controls | Action |
| --- | --- | --- | --- |
| Apply the wave generator to a lane | ZAQ (sequencer) | `B12`, `B5`–`B11` | `hold B12 + press B5` |
| Assign a control | CTRL (controller) | `B59`, `B5`–`B24`, `E25`–`E56`, `B65`–`B68` | `hold B59 + turn E` |
| Button mode field | CTRL Edit | `SEL` | `turn SEL` |
| Chain patterns | ZAQ pattern load | `B5`–`B20` | `hold B5 + press B6` |
| Change all steps together | ZAQ (sequencer) | `B59`, `E25`–`E56` | `hold B59 + turn E` |
| Change and save a setting | Global Settings | `SEL` | `turn SEL` |
| Chord | ZAQ (sequencer) | `B13` | `press B13` |
| Clock divider | ZAQ (sequencer) | `B18`, `SEL` | `press B18` |
| Clock output | ZAQ Global page | `E27` | `turn E27` |
| Clock source | ZAQ Global page | `E26` | `turn E26` |
| Confirm and write | CTRL preset store | `B61` | `press B61` |
| Copy a track | ZAQ (sequencer) | `B21`–`B24` | `hold B21 + press B22` |
| Device ID | Global Settings | `B6` | `press B6` |
| Device mode at power-up | Global Settings | `B5` | `press B5` |
| Drum voice pitch | ZAQ Global page | `B21`–`B24`, `E25`–`E40` | `hold B21 + turn E25` |
| Echo dead time | CTRL Settings | `B7` | `press B7` |
| Encoder acceleration | Global Settings | `B14` | `press B14` |
| Encoder mode field | CTRL Edit | `SEL` | `turn SEL` |
| Erase all controller memory | Erase menu | `E32` | `push E32` |
| Erase all patterns, keep the global settings | Erase menu | `E32` | `push E32` |
| Erase notes while the pattern plays | Real-time record | `B63`, `B5`–`B20` | `hold B63 + press B13` |
| Exit | CTRL (controller) | `B60` | `press B60` |
| Exit | CTRL Learn | `B60` | `press B60` |
| Exit | CTRL Settings | `B60` | `press B60` |
| Exit | Global Settings | `B1` | `tap B1` |
| Exit | Erase menu | `B60` | `press B60` |
| Exit | SysEx export menu | `B60` | `press B60` |
| Exit | SysEx import | `B60` | `press B60` |
| Exit | ZAQ (sequencer) | `B60` | `press B60` |
| Exit | ZAQ Global page | `B60` | `press B60` |
| Exit | ZAQ Settings | `B60` | `press B60` |
| Export all 64 presets | SysEx export menu | `E31` | `push E31` |
| Export all ZAQ memory | SysEx export menu | `E29` | `push E29` |
| Export the 12 pattern pages | SysEx export menu | `E30` | `push E30` |
| Export the current pattern | SysEx export menu | `E32` | `push E32` |
| Export the current pattern page | SysEx export menu | `E31` | `push E31` |
| Export the current preset | SysEx export menu | `E32` | `push E32` |
| Factory restore | Global Settings | `B12` | `press B12` |
| Fill or clear all steps of a drum voice | Real-time record | `B5`–`B20`, `E25`–`E56` | `hold B5 + turn E` |
| Finish | CTRL Edit | `B60` | `press B60` |
| Finish | CV calibration | `B1` | `press B1` |
| First meter reading, CV output 1 to 4 | CV calibration | `E33`–`E36` | `turn E33` |
| Footswitch 1 use | Global Settings | `B9` | `press B9` |
| Footswitch 1: start or stop | ZAQ (sequencer) | `J74` | — |
| Footswitch 2 use | Global Settings | `B10` | `press B10` |
| Footswitch 2: next pattern | ZAQ (sequencer) | `J75` | — |
| Footswitch polarity | Global Settings | `B15` | `press B15` |
| Footswitch: send the assigned MIDI message | CTRL (controller) | `J74`, `J75` | — |
| Gate output level | ZAQ Settings | `B5` | `press B5` |
| Go back to step 1 | ZAQ (sequencer) | `B67` | `press B67` |
| Go to CTRL mode | ZAQ (sequencer) | `B1` | `tap B1` |
| Go to ZAQ mode | CTRL (controller) | `B1` | `tap B1` |
| GS parameter field | CTRL Edit | `SEL` | `turn SEL` |
| Learn a MIDI message | CTRL (controller) | `B62`, `B5`–`B24`, `E25`–`E56`, `B65`–`B68` | `hold B62 + turn E` |
| Leave real-time record | Real-time record | `B65` | `press B65` |
| Leave the mixer | ZAQ Mixer | `B66`, `B60` | `press B66` |
| LED ring style field | CTRL Edit | `SEL` | `turn SEL` |
| Load a slot | ZAQ pattern load | `B5`–`B20` | `press B5` |
| Make the stored patterns permanent | ZAQ (sequencer) | `SEL`, `B61` | `hold SEL + press B61` |
| Make the stored presets permanent | CTRL (controller) | `SEL`, `B61` | `hold SEL + press B61` |
| Message type | CTRL Edit | `SEL` | `turn SEL` |
| MIDI channel, tracks 1 to 4 | ZAQ Global page | `E42`, `E44`, `E46`, `E48` | `turn E42` |
| MIDI CTRL α target, tracks 1 to 4 | ZAQ Global page | `E49`, `E51`, `E53`, `E55` | `turn E49` |
| MIDI CTRL α value | ZAQ (sequencer) | `B10` | `press B10` |
| MIDI CTRL β target, tracks 1 to 4 | ZAQ Global page | `E50`, `E52`, `E54`, `E56` | `turn E50` |
| MIDI CTRL β value | ZAQ (sequencer) | `B11` | `press B11` |
| MIDI output, tracks 1 to 4 | ZAQ Global page | `E41`, `E43`, `E45`, `E47` | `turn E41` |
| MIDI thru destination | CTRL Settings | `B6`, `SEL` | `press B6` |
| MIDI thru destination | ZAQ Global page | `E28`, `SEL` | `push SEL` |
| MIDI thru source | CTRL Settings | `B6`, `E28` | `press B6` |
| MIDI thru source | ZAQ Global page | `E28` | `turn E28` |
| MMC command field | CTRL Edit | `SEL` | `turn SEL` |
| MMC frame rate field | CTRL Edit | `SEL` | `turn SEL` |
| Mute a drum voice | ZAQ Mixer | `B5`–`B20` | `press B5` |
| Mute a track | ZAQ Mixer | `B21`–`B24` | `press B21` |
| Next preset | CTRL (controller) | `B64` | `press B64` |
| Note display | ZAQ Global page | `E29` | `turn E29` |
| Note length | ZAQ (sequencer) | `B9` | `press B9` |
| Note repeat on a track or a drum voice | ZAQ Mixer | `B64`, `B21`–`B24`, `B5`–`B20` | `hold B64 + press B21` |
| Note repeat rate | ZAQ Mixer | `B64`, `E25`–`E56` | `hold B64 + turn E` |
| Number pad | CV calibration | `B5`–`B16`, `B19`, `B20` | — |
| Open CTRL Settings | CTRL (controller) | `B59`, `B61` | `hold B59 + B61` |
| Open the mixer | ZAQ (sequencer) | `B66` | `press B66` |
| Open the pattern load view | ZAQ (sequencer) | `B62` | `press B62` |
| Open the pattern store view | ZAQ (sequencer) | `B61` | `hold B61` |
| Open the preset store view | CTRL (controller) | `B61` | `press B61` |
| Open the ZAQ Global page | ZAQ (sequencer) | `B59` | `press B59` |
| Open ZAQ Settings | ZAQ (sequencer) | `B59`, `B61` | `hold B59 + B61` |
| Operation mode | Global Settings | `B7` | `press B7` |
| Output routing | CTRL Settings | `B5` | `press B5` |
| Pattern change channel | Global Settings | `B13` | `press B13` |
| Pattern page | ZAQ pattern load | `B63`, `B64` | `press B64` |
| Pattern page | ZAQ pattern store | `B63`, `B64` | `press B64` |
| Pattern switch by CC: CC number | ZAQ Global page | `E34` | `turn E34` |
| Pattern switch by CC: channel | ZAQ Global page | `E33` | `turn E33` |
| Pitch | ZAQ (sequencer) | `B5` | `press B5` |
| Play direction | ZAQ (sequencer) | `B20`, `SEL` | `press B20` |
| Preset location | CTRL preset store | `B63`, `B64` | `press B64` |
| Previous or next setup field | CTRL Edit | `B63`, `B64` | `press B64` |
| Previous preset | CTRL (controller) | `B63` | `press B63` |
| Quantize on or off | ZAQ Global page | `E36` | `turn E36` |
| Quantize rate | ZAQ Global page | `E35` | `turn E35` |
| Random steps for a drum voice | Real-time record | `B65`, `B12` | `hold B65 + press B12` |
| Real-time record on or off | ZAQ (sequencer) | `B65` | `press B65` |
| Record sub-mode | Real-time record | `B64` | `press B64` |
| Reset the sequencer global settings | Erase menu | `E31` | `push E31` |
| Scale | ZAQ Global page | `E30` | `turn E30` |
| Scale base note | ZAQ Global page | `E31` | `turn E31` |
| Second meter reading, CV output 1 to 4 | CV calibration | `E41`–`E44` | `turn E41` |
| Select a drum voice | Real-time record | `B5`–`B20` | `press B5` |
| Select a track | ZAQ (sequencer) | `B21`–`B24` | `press B21` |
| Select CV output 1 to 4 | CV calibration | `E25`–`E28` | `turn E25` |
| Send the assigned MIDI message | CTRL (controller) | `B5`–`B24`, `E25`–`E56`, `B65`–`B68` | — |
| Set or remove a drum step | Real-time record | `E25`–`E56` | `turn E` |
| Set the user scale | ZAQ Global page | `B10`, `E41`–`E52` | `hold B10` |
| Show a value with no change | ZAQ Global page | `B63`, `E25`–`E56` | `hold B63 + turn E` |
| Show the firmware version | Global Settings | `B11` | `press B11` |
| Shuffle, even steps | ZAQ (sequencer) | `B19`, `E30` | `press B19` |
| Shuffle, odd steps | ZAQ (sequencer) | `B19`, `E31` | `press B19` |
| Start CV calibration | Global Settings | `B8` | `press B8` |
| Start or stop the sequencer | ZAQ (sequencer) | `B68` | `press B68` |
| Start step | ZAQ (sequencer) | `B15` | `press B15` |
| Step mute | ZAQ (sequencer) | `B7` | `press B7` |
| Step skip | ZAQ (sequencer) | `B14` | `press B14` |
| Step value of the selected parameter | ZAQ (sequencer) | `E25`–`E56` | `turn E` |
| Store to a slot | ZAQ pattern store | `B5`–`B20` | `press B5` |
| Sync input clock rate | ZAQ Settings | `B6` | `press B6` |
| Sync input start | ZAQ Settings | `B8` | `press B8` |
| Sync output clock rate | ZAQ Settings | `B7` | `press B7` |
| Tempo | ZAQ Global page | `E25` | `turn E25` |
| Test the output | CV calibration | `E25`–`E28` | `push E25` |
| Timing shift | ZAQ (sequencer) | `B8` | `press B8` |
| Track length | ZAQ (sequencer) | `B16` | `press B16` |
| Track mode, tracks 1 to 4 | ZAQ Global page | `E37`–`E40` | `turn E37` |
| Track offset | ZAQ (sequencer) | `B17` | `press B17` |
| Transpose input | ZAQ Global page | `E32` | `turn E32` |
| Value of the setup field | CTRL Edit | `SEL` | `turn SEL` |
| Velocity | ZAQ (sequencer) | `B6` | `press B6` |
| Virtual keyboard | Real-time record | `B6`, `B7`, `B9`–`B11`, `B13`–`B20` | `press B13` |
| Wave generator | ZAQ (sequencer) | `B12` | `hold B12` |
| Wave generator gain | ZAQ (sequencer) | `B12`, `E34` | `hold B12 + turn E34` |
| Wave generator offset | ZAQ (sequencer) | `B12`, `E36` | `hold B12 + turn E36` |
| Wave generator rate | ZAQ (sequencer) | `B12`, `E35` | `hold B12 + turn E35` |
| Wave generator shape | ZAQ (sequencer) | `B12`, `E33` | `hold B12 + turn E33` |
| Write the scale into the notes | ZAQ (sequencer) | `B10`, `B11` | `press B10 and B11 together` |

<!-- gen:end -->
