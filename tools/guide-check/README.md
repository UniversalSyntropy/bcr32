---
title: guide-check tool
description: Fails when a guide data file breaks the guide format, the device data or the text limits.
status: draft
last_updated: 2026-11-15
---

# guide-check

The tool checks each file in `docs/guides/data/`. It reads the files from the working tree, so a new file that git does not track yet is checked too.

## Command

Run this from the repo root with Node.js 24 or later. The tool exits 0 when no error is found, 1 when it finds an error, and 2 on a usage error. A warning prints and does not fail.

| Command | Result |
| --- | --- |
| `npm run check:guides` | checks every guide file |
| `node tools/guide-check/src/cli.ts --guides <dir> --device <dir> --root <dir>` | checks other folders |

The tool prints one line for each finding: `file: level: check: message`. Each message names the guide and the step.

## Checks

| Check | Level | Fails when |
| --- | --- | --- |
| Schema | error | the file is not valid JSON, the schema rejects it, the id differs from the file name, or a step id repeats |
| IDs | error | `focus`, `held`, an action, a token, a key of `after`, or a mode names something that is not in the device data |
| Grammar | error | an action does not parse, names a group, or uses `push` on a button |
| After | error | `after` fails the view patch schema (a `pressed` key fails here) or names a style that is not in `rings.json` |
| Ring | error | a ring style is `pan/off`, `spread/off` or `qual/off` |
| Focus | error | a control of the action is not in `focus` |
| Tokens | error | a caption names a control with no `{ID}` token, or a brace is malformed |
| Text | error | a caption has more than 20 words, an `expect` or `warn` has more than 25, a caption has more action verbs than the action, or a text has a contraction |
| Status | error | `verified` has no firmware version, or a verified guide has a step with a source that is not a unit test |
| Drift | error | the `doc` file does not exist, does not link `?guide=<id>` with a step count, or the count differs |
| Mode path | warning | the demo engine does not reach the mode of `after` after the action |
| Unknown lit | warning | a mode of the guide has a lit rule with no `cond` |
| Not simulated | warning | a mode of the guide is one of the three modes that the demo engine does not simulate |

A token counts as one word. A combo action allows two verbs in the caption.

## Tests

`src/guide-check.test.ts` holds one planted fault for each of the 13 checks. It also tests the folder reader on a folder outside git. A replay test plays each of the three real guides to the end.
