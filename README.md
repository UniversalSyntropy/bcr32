# bcr32

Unofficial documentation and tools for the Behringer BCR32 MIDI controller and step sequencer.

The BCR32 combines two devices: a 4-track, 32-step sequencer (the "Zaquencer", with MIDI, USB-MIDI and CV/gate outputs) and a 32-encoder MIDI controller. This repo restructures the official manual into a quick, searchable reference, and adds setup guides and tools as they're written.

> **Note:** This project is not affiliated with or endorsed by Behringer or Music Tribe. Behringer and Music Tribe are trademarks of their owners.

## Start here

| If you want to | Read |
| --- | --- |
| Look up a control, menu or procedure | [BCR32 manual](docs/manual/README.md) |
| Connect the BCR32 to Ableton Live | [Connect to Ableton Live](docs/guides/connect-to-ableton-live.md) |
| Fix a problem | [Troubleshooting](docs/guides/troubleshooting.md) |
| See what is planned | [Project plan](docs/project/plan.md) |
| See where the work is | [Playbook and live status](docs/project/playbook.md) |
| See every document | [Documentation index](docs/README.md) |
| Contribute or edit docs | [CONTRIBUTING.md](CONTRIBUTING.md) |

## Repository layout

| Path | Contents |
| --- | --- |
| `docs/reference/` | Structured reference built from the official manual |
| `docs/guides/` | Task-based guides: setup, DAW connection, troubleshooting |
| `docs/project/` | Project plan, architecture note, decision log |
| `tools/` | Check tools: privacy, documentation standard, manual coverage, generated tables |
| `reference/` | Local copy of the official PDF manual; PDFs are git-ignored |
| `local/` | Your own setup notes; git-ignored apart from its README |
| `llms.txt` | Index of the docs for LLM tools |

## Status

- **Documentation:** draft. The reference covers the full English section of the official manual V2.0. Guides marked "unverified" haven't been tested on a unit yet.
- **Firmware covered:** the official manual doesn't state a firmware version. Facts marked verified were tested on firmware 1.0.3.
- **Tools:** four check tools; see the [tools index](tools/README.md).

## Official sources

- **User manual:** Behringer BCR32 User Manual V2.0, dated 2026-04-06. Download it from the product page on behringer.com and save it in `reference/`.
- **Editor and firmware updates:** the Control Tribe app from Behringer.

## License

- **Documentation** (`docs/`, `README.md`, `llms.txt` and other prose): [Creative Commons Attribution 4.0](LICENSE-docs) (CC BY 4.0). Reuse it with credit to "bcr32 contributors".
- **Code** (`tools/`, `packages/`) and **device data** (`data/`): [MIT](LICENSE).
- **Official Behringer material** isn't covered by these licenses and isn't included in the repo.
