---
title: 13. Glossary
description: Chapter 13 of the BCR32 manual: the terms of the manual, each with one meaning. The first use of a term in each chapter links here.
status: draft
last_updated: 2026-11-11
source: Behringer BCR32 User Manual V2.0 (2026-04-06), English pages 14–35; terms marked "verified" were seen on firmware 1.0.3
---

# 13. Glossary

Each term has one meaning in this manual. Use the term, not a synonym. The first use of a term in each chapter links to its entry.

## Unit and panel

### ZAQ mode

The mode in which the unit is a step sequencer. Button B1 is pink. The panel also prints ZAQ and ZQR. Tap B1 to change mode.

### CTRL mode

The mode in which the unit is a MIDI controller. Button B1 is amber.

### Control ID

The fixed name of one control in this manual, such as B5, E25 or J70. The IDs follow the callout numbers of the official manual.

### Callout

A number in the panel drawing of the official manual. It points to one control. The control ID uses it.

### Encoder

A knob with a push switch and a ring of LEDs. The unit has 32 encoders (E25 to E56). Turn an encoder to change a value. Push it to switch or confirm.

### Ring LED

The ring of LEDs around an encoder. It shows a value, a note or the playhead.

### Display (DISP)

The screen of the unit. It shows the parameter and its value.

### Select encoder (SEL)

The large encoder near the display. Turn it to pick a value. Push it to confirm.

### Footswitch

A pedal on jack J74 or J75. Global Settings sets what it does.

## Sequencer

### Track

One of four independent lines of the sequencer. Buttons B21 to B24 select it. Each track has its own MIDI port and channel.

### Step

One of 32 positions in a track. Step k is encoder E(24+k).

### Pattern

The notes and settings of all four tracks, kept together. A pattern is stored in a slot. The official manual also uses the word sequence for this. This manual uses pattern.

### Page

A group of 16 slots. There are 12 pages. Buttons B63 and B64 change the page.

### Slot

One of the 16 places on a page that can hold a pattern. Buttons B5 to B20 select it.

### Chord

Several notes played from one step. Button B13 sets the chord type of each step. It works on MIDI output only.

### Drum track

A track in Drum mode. Buttons B5 to B20 then select 16 drum voices.

### Drum voice

One of the 16 sounds of a drum track. Each voice has its own note.

### Playhead

The step that plays now. The last three LEDs of the ring show it.

### Mixer

The view in which you mute tracks and drum voices. Press B66 while the sequencer is stopped.

### Real-time record

The mode in which the unit records notes while the pattern plays. Press B65 to start it.

### Note repeat

The function that repeats a note at a set rate. Hold B64 and turn an encoder to set the rate.

### Wave generator

A source of values for the parameter lanes, such as pitch and velocity. Button B12 controls it. The panel prints WAVE GEN.

### Scale

A set of allowed notes. The unit bends the notes to the scale at playback. The stored notes do not change.

### Shuffle

A delay of the even steps or the odd steps. Button B19 sets it.

### Quantize

The function that moves recorded notes to the nearest step grid.

### Transpose

The function that shifts the notes of a track when the unit receives MIDI notes.

### Control lane

A row of values that sends a MIDI control change on each step. Buttons B10 and B11 set the lanes alpha and beta.

## Controller

### Preset

A saved set of controller assignments. The unit holds 64 presets. The editor files also call a sequencer pattern a preset.

### Learn

The mode in which the unit copies an assignment from an incoming MIDI message. Hold B62 and use a control.

### Permanent store

The extra step that keeps a pattern or a preset after power-off. Hold SEL and press B61. Without it, the unit loses the data at power-off.

### Control change (CC)

A MIDI message with a controller number from 0 to 127 and a value.

### Program change (PC)

A MIDI message that selects a program or sound on another device.

### NRPN

A MIDI message type that addresses a parameter by a 14-bit number. The name means non-registered parameter number.

### Pitch bend (PB)

A MIDI message with a 14-bit value, made for a pitch wheel.

### Aftertouch (AT)

A MIDI message that sends the pressure on a key after the key press.

### MMC

MIDI machine control. These messages start, stop and wind a recorder. The official manual calls them MIDI machine code.

## Sync, ports and settings

### BPM

Beats per minute. The unit accepts 30 to 300 with its internal clock.

### Clock source

The origin of the tempo: Internal, MIDI, USB or Sync. Knob E26 on the ZAQ Global page sets it.

### Operation mode

The setting that decides which ports work: USB, STDL or MIXED. Global Settings button B7 sets it.

### ppqn

Pulses per quarter note. The sync jacks use it. ZAQ Settings sets the value.

### MIDI thru

The function that forwards incoming MIDI to an output.

### SysEx

System exclusive. A MIDI message that starts with F0 and ends with F7. The unit uses SysEx for backups.

### DIN MIDI

The 5-pin MIDI sockets J71 to J73.

### USB-MIDI

MIDI over the USB-C port J70.

### CV

Control voltage. The unit has four CV outputs with 1 volt per octave.

### Gate

A voltage that is on while a note plays. The level is 5 V or 10 V.

### Firmware

The software inside the unit. Global Settings button B11 shows its version.

### Global Settings

The menu for settings of the whole unit. Hold B1 for three seconds to open it.

### ZAQ Settings

The menu for sync and gate settings of the sequencer. Hold B59 and press B61 in ZAQ mode.

### CTRL Settings

The menu for settings of the controller. Hold B59 and press B61 in CTRL mode.

### ZAQ Global page

The page of sequencer settings on the encoders. Press B59 in ZAQ mode.

### Factory restore

The function that sets the unit back to its factory state. Global Settings button B12 starts it.

### Control Tribe

The editor program from the maker of the unit. It saves and loads the memory of the unit.
