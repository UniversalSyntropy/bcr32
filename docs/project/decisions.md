---
title: Decision log
description: Design and process decisions for the bcr32 project, each with its reason and the alternative rejected.
status: draft
last_updated: 2026-11-11
---

# Decision log

Each row records one decision. A decision stays open to change until the phase that uses it starts; after that, change it with a new row.

Items marked "needs approval" are recommendations and wait for the owner.

## Scope and order

| ID | Decision | Reason | Rejected |
| --- | --- | --- | --- |
| D1 | Build device data before the manual and the panel | Tables, layout, overlay and checks all read it; entering it once removes repeated work | Manual first, data extracted later |
| D2 | Run the unit session (P3) straight after P1 | Its findings decide the engine design and verify the errata; it costs about an hour | Capture spike at the start of G4 |
| D3 | Split G3 into controls and panel (P4), then overlay and lessons (P5) | Each half has its own acceptance test and fits two to three sessions | One G3 phase |
| D4 | G2 is a lineage guide, a feature map and a "what transfers" guide (approved 2026-11-11) | About 300k tokens against about 900k for two full manuals; old-device facts can't be verified here; restating a commercial manual adds copyright risk | Full BCR2000 and Zaquencer manuals |
| D5 | No BCR2000 panel profile until someone asks | The schema allows it; building it now is speculative | BCR2000 web panel in G2 |
| D6 | New ideas go to `docs/project/parking.md` | Keeps the active list fixed between approvals | Adding to the plan as ideas arrive |

## Documentation

| ID | Decision | Reason | Rejected |
| --- | --- | --- | --- |
| D7 | Markdown in `docs/` stays the canonical source and renders on GitHub | Zero build to read; works for LLM tools; no site lock-in | MDX sources |
| D8 | Split the reference into chapter files under `docs/manual/` | A complete manual is about four times the current 409 lines; chapters give stable anchors and smaller diffs | One long file |
| D9 | Generate control tables and indexes from data between marker comments; write prose by hand | Removes drift on the repetitive parts without a template system for prose | Generate everything; or check-only with hand tables |
| D10 | Add a docs site only in P7, using Astro Starlight | It reads plain Markdown and embeds React, so procedures can show the panel; MIT licence | VitePress (Vue, can't host the React panel directly); MkDocs Material (Python stack, no React); a hand-built Markdown renderer in the app |
| D11 | Generate `llms-full.txt` beside `llms.txt` | One file gives an LLM the whole manual | Index only |
| D12 | Coverage is proved by a section map in data | The map is a list of facts, so it can be tracked; the check runs in CI without the official PDF | Check that needs the PDF every time |
| D13 | Glossary links are required at first use per file | "First use" across the whole repo can't be defined for readers who land on any page | First use in the repo |

### Added 2026-11-11

| ID | Decision | Reason | Rejected |
| --- | --- | --- | --- |
| D34 | Keep the lineage guide in its own section with a device banner on each page and one-way links from the manual | Old-device facts must not read as BCR32 facts | Lineage notes mixed into manual chapters |
| D35 | Two registers in the manual: manual errata and known issues | An error in the document and a fault in the unit have different sources, fixes and lifetimes | One combined table |
| D36 | Known-issue rows carry firmware version, source link, reliability and status | New firmware is expected to fix faults; a row without a version goes stale | Undated problem list |
| D37 | No BCR2000 is available; lineage facts are never marked verified | Nothing can be tested | Borrowing a unit |

| D38 | Group phases into releases; R1 is the manual alone and ends ready to publish | The manual is the part worth sharing first; the panel must not delay it | One release at the end |
| D39 | Approve per release with a fixed scope, not per phase | Fewer stop-and-ask rounds; scope is set once | A go for each phase |
| D40 | Move panel geometry from P1 to P4 | The manual doesn't need positions; R1 gets 40k cheaper | All device data in P1 |

| D41 | Split R1: publish a checked draft after P1 and the unit session (R1a), finish the manual in public (R1b) | Being early matters; status labels and tested errata keep an early draft honest | Publish only when the manual is complete |
| D42 | Device data is versioned, schema-published and MIT-licensed | Other tools can depend on it | Data under the docs licence only |
| D43 | Add a correction issue template that requires a firmware version | Outside reports become usable evidence | Free-form issues |

| D44 | Add R1c: a captured MIDI implementation reference, including editor and settings messages | No official chart exists; it is the base that other tools need most | Leave MIDI mapping to the engine release |
| D45 | Export a full SysEx backup before any test that writes to the unit; keep it local | A dump can identify one unit and its contents; a write without a backup can't be undone | Test without backup |
| D46 | Editor-protocol and dump-format work is time-boxed and reports only what capture supports | Reverse-engineering effort is open-ended | Decode until complete |
| D47 | Add text-grid panel diagrams to R1b | A manual needs a panel picture; the drawn panel arrives only in R2 | No diagram until R2 |

| D48 | Leak guard in three layers: local git hooks with a private pattern file, CI check, full-history scan before publishing | One missed commit means a history rewrite | A manual grep before commits |
| D49 | Online images and diagrams are linked and listed with owner and licence, never committed | Copyright; the repo ships only its own drawings | Collecting third-party images in the repo |
| D50 | No DIN MIDI interface is available; DIN port behaviour is marked untested | Honest status beats a guess | Inferring DIN behaviour from USB |
| D51 | DAW templates and presets are parked | Tool work for after R1 | Adding them to R1 |

| D52 | Unit work follows a written safety protocol: recovery runbook and checked backup first, four risk tiers, forbidden list | A replacement unit is costly and slow to get; a bricked unit ends the project's testing | Case-by-case judgement |
| D53 | Editor traffic is observed only; nothing captured is re-sent, and capture is off during firmware updates | Replayed or partial editor messages are the likeliest way to corrupt a unit | Replay tests to confirm decoded messages |

## Data and code

| ID | Decision | Reason | Rejected |
| --- | --- | --- | --- |
| D14 | Model 85 callouts and 88 elements separately | Callouts 2 and 3 cover five LEDs; the panel needs each LED, the manual needs each callout | One record per callout |
| D15 | Zod schemas are the source; JSON Schema is generated | TypeScript types come free; one definition | Hand-written JSON Schema plus generated types |
| D16 | JSON data files split by concern | Small diffs; data entry can run in parallel | One large `controls.json` |
| D17 | npm workspaces | Already installed; three packages don't need more | pnpm or a monorepo build tool |
| D18 | Controls and panel renderer in one package | One consumer today; split on the second | Separate controls library now |
| D19 | The view contract is `PanelView` in, `ControlEvent` out | Any engine or a live unit can sit behind the panel | Components that own device logic |
| D20 | Own 30-line store with `useSyncExternalStore` | The engine interface is already a store | Redux, Zustand |
| D21 | Elements are HTML with inline SVG, one SVG layer for the overlay | Native focus and roles work in Safari; one coordinate system for labels | One large SVG for everything; canvas |
| D22 | Own control components, no third-party knob library | Push encoders with LED rings and state-driven colour fit no surveyed library; the GPL option is excluded | audiocn, ouestlabs audio-ui, NexusUI |
| D23 | Vertical drag for encoders | Radial drag is fiddly at this size, as an earlier project found | Radial drag |
| D24 | Motion only in the overlay, highlights and app shell | Base controls stay light and reduced-motion handling stays in one place | Motion inside every control |
| D25 | One action-notation parser for docs and lessons | The manual and the lesson runner agree by construction | Separate lesson format |
| D26 | Visual comparison uses a local underlay image in the dev panel | An automated diff would need the official image in the repo | Committed reference image |
| D27 | Own drawing, model name as text, no logo | Layout is fact; logos and photos are not ours to ship | Tracing the official image |
| D57 | Node 24 or later runs TypeScript source directly; `tsc` only type-checks | No build step and no output folder for packages and tools; `erasableSyntaxOnly` keeps the source runnable | A compile step; a TypeScript runner dependency |
| D58 | Tests use the built-in `node:test` runner | No test dependency; enough for schema and tool tests | Vitest, Jest |
| D59 | `markdownlint-cli2` is pinned to 0.23.x | The next minor adds a dependency with an open high-severity advisory; recheck when a fixed release appears | Latest release |

## Shared UI rules: what changed

The brief asked to follow the rules of a sister UI library and to drop what costs more than it gives here.

| Rule | Kept | Change and reason |
| --- | --- | --- |
| Parametric components, typed props, schema validation | yes | Unchanged |
| CSS tokens and `data-*` variants | yes | Unchanged |
| Layered defaults | partly | Three layers (library, device profile, props); user preference only for overlay visibility |
| Message catalogue | partly | One English catalogue for app strings; no ICU or locale switching, because panel labels are printed English |
| Logical CSS | yes | Costs nothing |
| RTL and pseudo-locales | no | The panel is a physical layout and doesn't mirror |
| Named slots and extension panels | no | No third-party extensions are planned |
| Registry row and screenshot per parameter value | no | Device data plus the dev panel gallery cover it |
| Promotion path | yes | App-specific parts move into `@bcr32/panel` on second use |
| WCAG 2.2 AA | yes | Unchanged |

## MIDI and G4

| ID | Decision | Reason | Rejected |
| --- | --- | --- | --- |
| D28 | The local bridge is the main MIDI transport, Web MIDI the second | Works in Safari and when the unit is on another computer | Chromium only |
| D29 | No engine design is final before the unit session | The unit's own MIDI output is undocumented | Design from the manual alone |
| D30 | The G3 demo engine is a mode machine, not a sequencer | Enough for labels, lessons and lit buttons; the sequencer is G4 | Partial sequencer in G3 |

### Delivery of the web panel

| ID | Decision | Reason | Rejected |
| --- | --- | --- | --- |
| D54 | The web panel ships as a static site: hosted online, and downloadable to run offline | A browser is the only requirement, so macOS, Windows and Linux work with no install | Docker as the main way to run it |
| D55 | A small container image that serves the static build is an optional extra for self-hosting, added in R2 | Cheap to add once the build exists; useful for people who host their own tools | No container at all |
| D56 | The MIDI bridge for the live mirror runs natively on each system, not in a container | Docker Desktop on macOS and Windows runs in a virtual machine and can't reach the host's USB MIDI devices | Bridge inside the container |

## Process

| ID | Decision | Reason | Rejected |
| --- | --- | --- | --- |
| D31 | `privacy-check` becomes a tool with a git-ignored local pattern file, run in CI | The grep in the contributing guide can't hold personal names without committing them | Grep by hand only |
| D32 | Tracked project docs say "the owner", never a name | Public-first rule | Names in the plan |
| D33 | Verified facts name the firmware version | Firmware updates change behaviour | Plain "verified" |
| D60 | Documentation keeps the existing documentation standard and adds Simplified Technical English rules based on ASD-STE100; where the two disagree, the STE rule applies | The standard already agrees with STE on most points; STE adds sentence limits, one word for one meaning and no contractions, which help readers who scan and readers of English as a second language | Full ASD-STE100 with its dictionary (the specification is licensed and its word list is for aerospace); the existing standard alone |
