---
title: docs-check tool
description: Fails when a Markdown document breaks the documentation standard in CONTRIBUTING.md.
status: draft
last_updated: 2026-11-11
---

# docs-check

The tool checks Markdown documents against the documentation standard. Control IDs come from the device data, so a wrong ID is an error.

## Commands

Run these from the repo root with Node.js 24 or later. The tool exits 0 when all documents pass, 1 when it finds a problem, and 2 on a usage error.

| Command | Result |
| --- | --- |
| `node tools/docs-check/src/cli.ts` | checks every tracked `.md` file |
| `node tools/docs-check/src/cli.ts <file…>` | checks the files you name |

| Option | Meaning |
| --- | --- |
| `--root <dir>` | repo root; the default is the git top level |
| `--device <dir>` | device data folder; the default is `data/devices/bcr32` |
| `--pending <file>` | pending list; the default is `tools/docs-check/ste-pending.txt` |

The tool prints one line for each finding: `path:line: rule: message`.

## Rules

| Rule | Fails when |
| --- | --- |
| `front-matter` | a file under `docs/`, `packages/<name>/` or `tools/<name>/` lacks `title`, `description`, `status` or `last_updated`, or `status` or the date is not valid |
| `title` | a document does not have exactly one `#` heading, or a heading level is skipped |
| `link` | a relative link points to a file that does not exist |
| `anchor` | the `#fragment` of a relative link matches no heading in the target file |
| `control-id` | a control ID outside a code fence is not an element ID in the device data |
| `action` | a code span that starts with the word `hold` does not have the shape `hold <control>` or `hold <control> + <action>` |
| `glossary` | in a file under `docs/manual/`, the first use of a glossary term is not a link to its entry in `13-glossary.md`. A level-3 heading in the glossary defines a term. Text between `gen:` markers is generated and is skipped |
| `ste-contraction` | prose holds a contraction such as `don't` |
| `ste-sentence` | a step has more than 20 words, or other prose has more than 25 words in a sentence |
| `ste-pending` | the pending list names a file that does not exist or that now passes the `ste-*` rules |

External links (`http`, `https`, `mailto`) are not checked. The `action` rule is a minimal shape check. A stricter grammar comes in a later step.

## Control IDs

The tool checks the tokens `B<n>`, `E<n>`, `J<n>`, `SEL`, `DISP`, `L<n>` and `L<n>.<part>`. It accepts `L<n>` when a part `L<n>.<part>` exists. For a range such as `B5–B20`, it checks both ends. For a short form such as `B21–24`, it checks only the token that has the letter. Tokens such as `CV1`, `T1` and `E(24+k)` are not control IDs.

## Pending list

Decision D60 says that existing documents change to the writing rules when someone edits them. The file `tools/docs-check/ste-pending.txt` lists the documents that still fail the two `ste-*` rules. The tool skips those two rules for a listed file.

The list cannot go stale. The tool reports a listed path that does not exist. It also reports a listed file that now passes. When you edit a listed document, fix it and remove its line.

## Use from code

```ts
import { checkDocument } from "./check.ts";

const findings = checkDocument("docs/a.md", text, env);
```

The `env` object gives the rules a file reader and the set of control IDs. Tests use an in-memory version.
