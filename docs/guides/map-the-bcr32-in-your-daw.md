---
title: Map the BCR32 in your DAW
description: How to connect the BCR32 as a controller to Ableton Live, Bitwig Studio and Reaper, map a knob, and fix a knob that goes the wrong way.
status: draft
last_updated: 2026-11-13
---

# Map the BCR32 in your DAW

Goal: control a parameter in your DAW with a knob or a button of the BCR32.

| Item | Value |
| --- | --- |
| Mode | CTRL |
| Time | 15 minutes |
| Firmware tested | 1.0.3 for the messages. The DAW steps come from the DAW makers and are unverified for the BCR32 |

> **Note:** No DAW has a ready-made script for the BCR32 that we know of. Use the MIDI learn function of the DAW. This is the same way that works for any generic controller.

## Before you start

1. Connect J70 to the computer. See [connect to Ableton Live](connect-to-ableton-live.md) for the ports.
2. Put the unit in CTRL mode. The button printed ZQR/CTRL (B1) must be amber.
3. Pick the knob mode. Use **Absolute** for a first test. See [choose encoder modes and LED rings](choose-encoder-modes-and-led-rings.md).
4. Check in a MIDI monitor that the knob sends on the port `BCR-32 CTRL`.

## Ableton Live

1. Open Preferences, then Link, Tempo and MIDI. For the input `BCR-32 CTRL`, switch **Remote** on. Set **Track** off.
2. Press Cmd and M (Mac) or Ctrl and M (Windows). Live enters MIDI map mode.
3. Click the parameter in Live. Move the knob of the unit.
4. The mapping shows in the Mapping Browser. Press Cmd and M again to leave.

For a relative knob, use the mode in the mapping browser that matches the table in [choose encoder modes and LED rings](choose-encoder-modes-and-led-rings.md).

## Bitwig Studio

1. Open the controller list in Preferences. Add a generic MIDI keyboard controller for the port `BCR-32 CTRL`.
2. Click the MIDI mapping button in the toolbar.
3. Click a parameter. Move the knob.
4. Mappings are saved in the project.

**Tip from a forum user (other device):** For endless knobs, set the mapping to **Relative (Bin offset)**, not **Absolute**. This fits the unit's REL2 mode.

## Reaper

1. Open the Actions list. Choose the action or the plugin parameter.
2. Use **Learn** for the shortcut, and move the knob. Or use the plugin's **Param** menu and choose **Learn**.
3. Set the mode to match the knob: absolute, or relative.

The Reaper steps are unverified. Check the Reaper manual for the menu names.

## If the knob goes the wrong way

1. Turn the knob slowly in both directions. Watch the parameter.
2. If it moves backward, change the mode in the DAW to the next relative mode.
3. If it jumps, use Absolute mode on the unit, and "takeover" or "pickup" in the DAW.

## What does not work (yet)

- **Feedback:** The rings do not follow the DAW by default. A forum review says LED feedback from the DAW does not work out of the box in Bitwig. Rings show the value that the unit itself sends.
- **Scripts:** We know of no script for the BCR32 in Ableton, Bitwig or Reaper.

## Related

- [Assign controls in CTRL mode](assign-controls-in-ctrl-mode.md)
- [MIDI implementation](../manual/16-midi-implementation.md)

**Next step:** Save the preset that holds your mapping. See [assign controls in CTRL mode](assign-controls-in-ctrl-mode.md#step-4-store-a-preset).
