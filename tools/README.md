# tools

Tools built for the BCR32. Each tool has one folder and its own README. Run each command from the repo root.

| Tool | Command | Proves or does |
| --- | --- | --- |
| [privacy-check](privacy-check/README.md) | `npm run check:privacy` | no tracked file holds a personal-data pattern; `npm run hooks` installs the git hooks |
| [docs-check](docs-check/README.md) | `npm run check:docs` | each document obeys the documentation standard |
| [coverage-check](coverage-check/README.md) | `npm run check:coverage` | the documents cover each part of the official manual and each element |
| [gen-tables](gen-tables/README.md) | `npm run gen:tables` | writes tables from device data into marked blocks; `npm run check:tables` reports a difference |
| [midi-capture](midi-capture/README.md) | `npm run build:midi-capture`, then `npm run midi-capture -- list` | lists MIDI ports and logs what the unit sends (macOS, desktop session); sends to loopback ports only |

`npm run check` runs the four checks with the other checks. CI runs the same commands. `midi-capture` is a tool for you to run, not a check. Its tests run in `npm test` on macOS only.
