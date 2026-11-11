---
title: privacy-check tool
description: Fails when text holds a personal-data pattern. Runs as a git hook or by hand.
status: draft
last_updated: 2026-11-11
---

# privacy-check

The tool scans text for personal data. It replaces the hand-made leak guard in `.git/hooks/`. The repo is public-first, so a match blocks the commit.

## Commands

Run these from the repo root with Node.js 24 or later. Each command exits 0 when the text is clean, 1 when it finds a match, and 2 on a usage error.

| Command | Scans |
| --- | --- |
| `node tools/privacy-check/src/cli.ts tracked` | every file from `git ls-files`, except `package-lock.json` and binary files. This is the default command |
| `node tools/privacy-check/src/cli.ts staged` | the added lines of the staged diff |
| `node tools/privacy-check/src/cli.ts message <file>` | a commit message file, without `Co-Authored-By:` lines |
| `node tools/privacy-check/src/cli.ts push` | the added lines and messages of commits the remote does not have. It reads the pre-push ref lines on stdin |
| `node tools/privacy-check/src/cli.ts stdin` | text from stdin |
| `node tools/privacy-check/src/cli.ts install-hooks` | nothing. It writes the three git hooks |

Add `--patterns <file>` to use another pattern file than `local/privacy-patterns.txt`.

## Output

The tool prints one line for each finding, then one summary line.

```text
path:line: rule: matched text
```

## Rules

All rules ignore case.

| Rule | Matches |
| --- | --- |
| `home-path` | a home folder path on macOS, Linux or Windows, such as a user folder name after the folder `Users` or `home` |
| `private-ip` | an IPv4 address in the ranges 10.x.x.x, 172.16 to 172.31, or 192.168.x.x |
| `local-hostname` | a name that ends in `.local` and has no letter after it |
| `mac-address` | six pairs of hex digits, separated by colons |
| `email` | an e-mail address: a name, an at sign and a domain name |
| `local-pattern` | a line of `local/privacy-patterns.txt`, as a fixed string and as a whole word |

The file `local/privacy-patterns.txt` is git-ignored and optional. Put one name or host name on each line. A line that starts with `#` is a comment.

## Install the hooks

1. Run `node tools/privacy-check/src/cli.ts install-hooks`.
2. Expect one line for each hook: `pre-commit`, `commit-msg` and `pre-push`.

The tool writes each hook as a short `sh` script. The script runs the CLI from the repo root. If a different hook exists, the tool saves it as `<name>.bak` first. It keeps an older `.bak` file.

> **Note:** The hooks stop a commit or a push. They do not remove data that is already in history.

## Use from code

```ts
import { scanText } from "./rules.ts";

const findings = scanText("some text", ["my-name"]);
```

Each finding holds a line number, a rule ID and the matched text. Tests call these functions directly.
