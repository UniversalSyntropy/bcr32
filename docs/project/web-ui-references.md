---
title: Web UI and prior art references
description: Links to public projects that draw a hardware panel in the browser or edit the BCR32, with what we checked and what we did not.
status: draft
last_updated: 2026-11-11
---

# Web UI and prior art references

This page lists public projects for reference. We link to them and describe the technique in our own words. We never copy code, images or text from them.

**Checked** means we read the fact on the date shown. **Unverified** means we did not read the source.

## Prior art for the BCR32

| Project | What it is | Checked 2026-11-11 | Unverified |
| --- | --- | --- | --- |
| [bcr32-studio](https://github.com/TheLazyGeekGuy/bcr32-studio) | Browser editor for the BCR32 with a live front panel, assignments, MIDI Learn and presets | MIT licence (the LICENSE file was read). Last push 2026-11-09. TypeScript. React and Vite. No Tailwind or Motion in the dependencies | how it draws the panel; how correct its protocol notes are; the file THIRD_PARTY_NOTICES.md that its README links (the root path gave 404) |

The repo has protocol notes for firmware 1.0.2 and 1.0.3. They are in its `docs/` folder: `BCR32-PROTOCOL-1.0.2.md`, `BCR32-PROTOCOL-1.0.3.md`, `ZAQUENCER-PATTERN.md` and two firmware JSON maps. Steps 4.5 and 4.6 of the [playbook](playbook.md) study the same protocol.

> **Warning:** Treat those notes as claims, not facts. Our own capture must confirm each one before it enters this repo. The [unit safety protocol](unit-safety.md) still applies. We observe editor traffic. We never replay it, and we never send a message from another project to the unit.

**Licence:** MIT, copyright 2026 TheLazyGeekGuy and the BCR32 Studio contributors. MIT allows reuse if the copyright notice stays with the copied part. We do not copy. We read the notes and describe facts in our own words. Its firmware audit says the vendor's open demo firmware is AGPL-3.0-or-later. That is a separate licence, and nothing from it may enter our MIT files.

How to use it:

- **Before step 4.5:** read the notes. Use them to know what to look for in our capture.
- **After capture:** record each message as "confirmed by capture" or "not seen" in the MIDI chapter.
- **Credit:** name the project in the MIDI chapter when its notes led us to a result.

## Web UI examples

Your list from a search tool. We checked only that each link answers (HTTP 200).

| Project | Link | Checked | Unverified |
| --- | --- | --- | --- |
| open-audiovisual | [repo](https://github.com/frank890417/open-audiovisual) and [controllers page](https://openaudiovisual.com/controllers/) | MIT licence. Last push 2026-11-05. Described as a web framework for audiovisual performance with MIDI input | stack; how the controllers page draws a controller |
| mix-cn | [page](https://www.shadcn.io/awesome/item/mix-cn) | link answers | everything else |
| audio-ui | [site](https://www.audio-ui.dev/) | link answers | licence; stack; knob and LED ring technique |
| audiocn | [components](https://www.audiocn.dev/docs/components) | link answers | licence; stack |
| synth-demo | [demo](https://szabadkai.github.io/synth-demo/) | link answers | licence; stack |

## Questions to answer when we read them

These come from the panel design in the [architecture](architecture.md). Answer them in R2 step P4, not before.

- **Geometry:** how does the project store panel positions?
- **Encoder ring:** how does it draw an LED ring (SVG arcs, canvas, CSS)?
- **Mode colours:** how does it show lit states that change with the mode?
- **Access:** how does it handle keyboard use, focus and screen readers?
- **Safari:** what does it do where Web MIDI is missing?
- **Motion:** how does it animate highlights?

## Add more

Add a row with the link, the licence and the date you checked. Put the date of the last commit for a repo. Do not add a row for a link you did not open.
