# Agent instructions

Instructions for Claude Code and other LLM agents working in this repo. Human contributors: see [CONTRIBUTING.md](CONTRIBUTING.md).

## Public by default

- Follow the privacy rules in [CONTRIBUTING.md](CONTRIBUTING.md#privacy-rules) for every file you write, every commit message and every code comment.
- Put facts about the user's own machines, network or setup in `local/` only. Never copy them into `docs/`, `tools/`, commit messages or PR text.
- Before each commit, run the staged-changes check in CONTRIBUTING.md and read every match.

## Local context

If `local/SITE.md` exists, read it before any task. It holds the user's own setup (computers, DAW, connections). Use it to tailor answers; keep its contents out of tracked files.

## Answering BCR32 questions

1. Read [docs/manual/](docs/manual/README.md) and use its control IDs.
2. Name the mode first (ZAQ, CTRL or a settings menu). Then give numbered key steps and the expected display or LED result.
3. Check the manual's "Source errors and gaps" chapter (chapter 12). If the answer depends on a row there, say so and suggest a test on the unit.
4. If a fact is missing, read the official PDF in `reference/` (English pages 14–35), then add the fact to the matching manual chapter.

## Keeping docs current

- Follow the documentation standard in CONTRIBUTING.md.
- Write in Simplified Technical English: follow the [rules in CONTRIBUTING.md](CONTRIBUTING.md#simplified-technical-english) for every document, README, changelog line, tool message and code comment. Change an existing document to the rules when you edit it.
- When an answer reveals a fix, a tested procedure or a manual error, update the matching doc, `docs/README.md`, `llms.txt` and `CHANGELOG.md` in the same change.
- Mark results from testing on a unit "verified" with the firmware version; mark everything else "unverified".

## Tools

- New tools go in `tools/<tool-name>/` with their own README.
- Confirm each build step with the user before writing code.
