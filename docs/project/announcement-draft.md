---
title: Announcement draft
description: Draft text to announce the public repo, in a short and a long form, for the owner to edit before posting.
status: draft
last_updated: 2026-11-11
---

# Announcement draft

The owner edits and posts this text. Nothing here is posted yet. Keep the notice that the project is unofficial in every version.

## Short form

> I started an unofficial, open reference for the Behringer BCR32: every control, mode, menu and value in one place, as readable text and as JSON. Facts marked "verified" were tested on a real unit (firmware 1.0.3). Corrections are welcome through the issue template. Not affiliated with Behringer or Music Tribe. Link: `<REPO_URL>`

## Long form

**Title:** An unofficial reference and device data for the Behringer BCR32

The BCR32 is a MIDI controller and 4-track, 32-step sequencer. The official manual is short and has some gaps. This project collects what is known, and checks it on a unit.

### What is in the repo now

- **Reference:** every control, mode, menu, value range and procedure, with known errors in the official manual listed.
- **Device data:** 88 elements, 17 modes, 145 functions and 56 value sets as JSON, with a schema. Each record names its source.
- **First MIDI facts:** USB IDs, the two USB MIDI ports, and the controller changes seen in CTRL mode. ZAQ mode and transport send nothing on USB.
- **Guides:** Ableton Live setup, troubleshooting and a recovery runbook. Some are still unverified. Each says so.
- **Tools:** checks that keep the docs and data consistent.

### What is not there yet

- The full MIDI map of every control. It needs more capture work.
- A web panel and a docs site. They are planned.
- DIN MIDI results. The project had no DIN interface to test with.

### How you can help

- Report a wrong fact with the correction template.
- Report a result from a different firmware version.
- Tell us which control sends which message on your unit.

**Please do not** post a serial number, a photo that shows one, or files from the vendor.

*This project is unofficial. It is not affiliated with or endorsed by Behringer or Music Tribe. Behringer and Music Tribe are trademarks of their owners.*

## Before you post

1. Replace `<REPO_URL>`.
2. Check each number in the long form against the README and the data.
3. Check that the repo is public and the notice shows on its first page.
