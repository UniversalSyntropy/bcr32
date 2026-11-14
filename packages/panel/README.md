---
title: panel package
description: Placement, SVG parts, access layer and themes of the BCR32 panel.
status: draft
last_updated: 2026-11-14
---

# @bcr32/panel

The BCR32 panel as a React component. It draws one view as one SVG in millimetres. Transparent HTML controls sit over the SVG. This package is private and not published. It has the MIT licence.

## Parts

| Part | Use |
| --- | --- |
| `layout.ts` | Places every part from `geometry.json`. The SVG part and its HTML control take the same box from it. |
| `Panel` | Draws the case, the controls, the lights, the marks and the focus ring. |
| `keys.ts` | The one key map of the access layer. |
| `a11y.ts` | Access names, roles and live-region text. English only. |
| `useEngine` | Reads an engine with `useSyncExternalStore`. |
| `themes/` | Tokens for the themes `device` and `flat`. All colours and pen widths are CSS custom properties. |

## Access

- **Tab stops:** one for each group. Inside a group, the arrow keys move the focus.
- **Knobs:** Up and Down turn one step. Page Up and Page Down turn eight steps. Enter pushes a knob that has a push switch.
- **Buttons:** a key down presses and a key up releases.
- **Roles:** a knob with a known absolute value is a slider. Any other knob is a spinbutton with a value text and no value.

## Test

Run `npm test` for the pure tests. Run `npm run test:browser` for the browser tests in Chromium and WebKit.
