---
title: gen-tables tool
description: Writes tables from device data into marked blocks of Markdown documents and reports blocks that differ from the data.
status: draft
last_updated: 2026-11-11
---

# gen-tables

The tool keeps tables in the documents equal to the device data in `data/devices/bcr32/`. A document marks where a table goes. The tool writes the table.

## Commands

Run these from the repo root with Node.js 24 or later.

| Command | Result |
| --- | --- |
| `npm run gen:tables` | writes each marked block in each tracked Markdown file |
| `npm run check:tables` | writes nothing; exits 1 when a block differs from the data or a marker is wrong |
| `node tools/gen-tables/src/cli.ts [--check] <file>` | the same for the files that you name |

## Mark a block

Put a start marker and an end marker on their own lines. The tool replaces all text between them.

```md
<!-- gen:functions mode=zaq-settings -->
<!-- gen:end -->
```

Do not change the text between the markers by hand. Change the device data, then run `npm run gen:tables`.

## Generators

| Marker | Table |
| --- | --- |
| `gen:element-kinds` | element count and IDs for each kind |
| `gen:modes` | each mode and menu: enter action, exit action, lit buttons |
| `gen:functions mode=<mode ID>` | the functions of one mode: controls, action, values, default, source |
| `gen:values set=<value set ID>` | the options and the range of one value set |

## Faults that the tool reports

- **Drift:** the text of a block differs from the table that the data gives.
- **Marker:** an unknown generator, a missing or unknown parameter, a start marker with no end marker, or an end marker alone.

Markers inside a fenced code block are text. The tool does not read them.

## The llms-full.txt file

`npm run gen:llms-full` joins `llms.txt` and every chapter that `docs/manual/README.md` lists into `llms-full.txt`. It removes the front matter of each chapter. `npm run gen:tables` runs it after the tables. `npm run check:tables` fails in three cases:

- **Drift:** the file differs from the manual.
- **Chapter list:** the list is empty or names a missing file.
- **Untracked:** a listed chapter is not tracked by git.
