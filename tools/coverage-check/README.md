---
title: coverage-check tool
description: Proves that the documents cover each part of the official manual and name each element of the unit.
status: draft
last_updated: 2026-11-11
---

# coverage-check

The tool reads the section map in `data/devices/bcr32/section-map.json`. The section map lists the parts of the official manual: sections, menus, tables, lists and figures. Each part names the page and the headings in our documents that cover it.

## Command

Run this from the repo root with Node.js 24 or later. The command exits 0 when all rules pass and 1 when it finds a fault.

| Command | Result |
| --- | --- |
| `npm run check:coverage` | prints one line for each finding, then one summary line |

## Rules

| Rule | Fails when |
| --- | --- |
| `anchor` | a section map item names a document or a heading that does not exist |
| `element` | no document in `docs/reference/` or `docs/manual/` names an element ID from the device data |
| `page` | the section map has no item for a two-page spread of English pages 14 to 35 |
| `extract` | a title in the section map is not in the local extract of the official manual |

A range such as `B5–B20` covers each ID between its ends. `L2` covers `L2.in`, `L2.a` and `L2.b`.

## Limits

- **Excluded parts:** an item can hold a reason in `excluded` and no anchor. Safety and legal text use this.
- **Extract rule:** the extract of the official manual is git-ignored. The rule runs only where the extract is present, so CI does not run it.
- **Depth:** the tool proves that a heading exists. It does not prove that the text below the heading is complete. The source passes in the playbook do that.
- **Titles:** some parts of the official manual have no printed heading. Their item holds a description and a note, and the extract rule does not compare it.
