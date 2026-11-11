# tools

Tools built for the BCR32. Each tool has one folder and its own README. Run each command from the repo root.

| Tool | Command | Proves or does |
| --- | --- | --- |
| [privacy-check](privacy-check/README.md) | `npm run check:privacy` | no tracked file holds a personal-data pattern; `npm run hooks` installs the git hooks |
| [docs-check](docs-check/README.md) | `npm run check:docs` | each document obeys the documentation standard |
| [coverage-check](coverage-check/README.md) | `npm run check:coverage` | the documents cover each part of the official manual and each element |
| [gen-tables](gen-tables/README.md) | `npm run gen:tables` | writes tables from device data into marked blocks; `npm run check:tables` reports a difference |

`npm run check` runs all four with the other checks. CI runs the same commands.
