---
title: web shell
description: Static web page that shows the BCR32 panel.
status: draft
last_updated: 2026-11-14
---

# @bcr32/web

A static page that shows the panel. It needs no server and makes no network request at run time. This package is private and not published.

## Run

| Command | Result |
| --- | --- |
| `npm run build:web` | Builds the page to `apps/web/dist`. |
| `npm run preview:web` | Serves the build on a local port. |
| `npm run test:browser` | Builds, then runs the browser tests in Chromium and WebKit. |

## Page

- **URL state:** `?view=top&theme=device`. The values for `view` are `top` and `rear`. The values for `theme` are `device`, `flat`, `flat-light` and `flat-dark`.
- **Fixture:** the panel shows test data, not a unit state. The page says so.
- **Font:** Atkinson Hyperlegible, hosted in `public/fonts` with its SIL Open Font License text.
