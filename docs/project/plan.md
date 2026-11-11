---
title: Project plan
description: Phases, deliverables, acceptance tests, routing and estimates for the BCR32 manual, the BCR2000 and Zaquencer guide, and the web panel.
status: draft
last_updated: 2026-11-11
---

# Project plan

This plan covers four goals in one repo. Work is approved per release, not per phase. Inside an approved release, work stops only for an overrun or for a step that needs the owner's yes: making the repo public, a non-permissive or paid dependency, content close to official artwork or text, writing to the unit's memory, or a larger budget.

Design detail lives in the [architecture note](architecture.md). Reasons for each choice live in the [decision log](decisions.md).

## Goals

| Goal | Deliverable | Status |
| --- | --- | --- |
| G1 | Full BCR32 manual: complete, indexed, with glossary and errata | Draft reference exists |
| G2 | Lineage and "what transfers" guide: BCR2000 → Zaquencer firmware → BCR32 | Not started |
| G3 | Web panel: a working replica of the top and rear panels with a label overlay and guided steps | Not started |
| G4 | Virtual unit engine and live MIDI mirror | Design only; build needs separate approval |

## Aims

- **Early:** be among the first public references for the BCR32.
- **Trusted:** a reader can see where each fact comes from and whether it was tested.
- **A base for tools:** the device data is a stable, versioned set that other tools can build on.

### How the plan serves trust

- **Source label on every fact:** official manual, tested on a unit (with firmware version), community report, or inference.
- **Status on every page:** draft or verified, in the front matter and the index.
- **Open registers:** manual errata and known issues are public, dated and linked to sources.
- **Checks in CI:** coverage, links, control IDs and generated tables are proved on every change.
- **Corrections welcome:** an issue template for "the manual says X, my unit does Y", with firmware version required.

### How the plan serves tools

- **Stable IDs:** control IDs and data field names don't change without a version bump and a changelog line.
- **Versioned data:** `data/devices/bcr32/` carries a semantic version and a published JSON Schema.
- **Permissive data licence:** data files use the MIT licence, so any tool can embed them.
- **MIDI facts as data:** capture findings from the unit session are recorded in a machine-readable file as well as in prose.

## Releases

The first aim is to publish the manual early. The scope of each release is fixed when it is approved; later ideas go to the parking file.

| Release | Contains | Phases | Estimate (tokens) | Result |
| --- | --- | --- | --- | --- |
| R1a | Checked draft manual: device data, check tools, CI, unit session, errata tested, firmware version recorded | P1, P3 | 335k | Repo ready to make public early |
| R1b | Complete manual: chapters, glossary, indexes, second source pass, known issues, panel diagrams | P2 | 530k | Full manual, improved in public |
| R1c | MIDI implementation reference: every message the unit sends and accepts, per function, including setup and editor messages | capture steps 4.1–4.7 in the playbook | 235k | MIDI chapter and `midi.json` |
| R2 | Web panel with label overlay and guided steps | P4, P5 | 990k | Panel app |
| R3 | BCR2000 and Zaquencer lineage section | P6 | 300k | Lineage guide |
| R4 | Docs site with the panel embedded | P7 | 150k | Hosted site |
| R5 | Engine and live mirror | P8 | re-estimate after R1 | Separate approval |

R1a exists so that publishing doesn't wait for the full rewrite. The current draft already covers the whole official manual; R1a adds proof, tested errata and honest status labels.

### R1 scope, fixed

- **In:** device data without geometry, four check tools, CI, every manual chapter, glossary, three indexes, errata register, known-issues register with one research pass, unit session, `llms.txt` and `llms-full.txt`.
- **Out:** panel geometry, any React code, lineage content, docs site, MIDI tools beyond a passive monitor.
- **Close:** a publish checklist (history scan, licence and trademark notes, privacy check on the whole tree). Making the repo public needs the owner's yes.

## Phase order

Device data comes first because the manual tables, the panel layout, the overlay and the checks all read it.

| Phase | Goal | Outcome | Depends on | Estimate (tokens) |
| --- | --- | --- | --- | --- |
| P1 | all | Device data, schema, check tools, CI | approval | 240k |
| P2 | G1 | Complete manual in `docs/manual/`, with errata and known-issues chapters | P1 | 510k |
| P3 | G1, G4 | Unit session: firmware version, errata tests, MIDI capture | P1; runs before P2, owner at the unit | 80k + about 1 hour of owner time |
| P4 | G3 | Controls library and static panel, both views, accessible | P1 | 540k |
| P5 | G3 | Overlay, dev panel, guided steps, demo engine, visual baseline | P4 | 450k |
| P6 | G2 | Sources table, feature map, lineage guide | P2 (research can run beside P2) | 300k |
| P7 | G1, G3 | Docs site with the panel embedded | P5; hosting needs approval | 150k |
| P8 | G4 | Engine and live mirror | P3, P5; separate approval | 600k–1M, re-estimate after P3 |

Estimates are ±30 percent until P1 closes. Each phase gets a step list and a firm estimate before it starts.

## P1: foundations

### Deliverables

- **Workspace:** npm workspaces at the repo root, TypeScript, markdownlint as a dev dependency.
- **Device data:** `data/devices/bcr32/` with every panel element, group, mode, parameter and value set, validated against a schema.
- **Tools:** `privacy-check`, `docs-check`, `coverage-check` and `gen-tables` under `tools/`, each with a README.
- **CI:** one GitHub Actions workflow that runs the four tools and markdownlint.

### Acceptance

- Schema validation passes, and a deliberately broken data file fails it.
- Data holds 85 callouts and 88 elements, and every control ID in `docs/` resolves to a data entry.
- `privacy-check` fails on a planted host name, IP address and home path, then passes when they are removed.
- CI is green on the branch.

## P2: the BCR32 manual (G1)

### Deliverables

- **Structure:** `docs/manual/` with one file per chapter. The current single-file reference moves there; its facts keep one home each.
- **Chapters:** quick start, modes, panel controls, sequencer, controller, settings, memory and SysEx, calibration, tasks ("how do I"), glossary.
- **Errata chapter:** every error, gap and unclear passage found in the official manual, with the manual version, the working assumption and the test result.
- **Known-issues chapter:** faults and glitches in the unit itself, from our own tests and from researched user reports. See [Known issues and errata](#known-issues-and-errata).
- **Generated parts:** control tables and the three indexes (by control, by function, by task) come from device data, written between marker comments.
- **LLM files:** `llms.txt` kept current and a generated `llms-full.txt` that joins the manual into one file.
- **Second source pass:** a full re-read of English pages 14–35 against the page images, with the controller tables (pages 26–35) entered in full.

### Acceptance

- `coverage-check` proves every callout, menu, table and section of the official English manual maps to a manual anchor.
- `docs-check` passes: front matter, links, anchors, control IDs, action notation, glossary link at first use in each file.
- `gen-tables --check` reports no drift between data and docs.
- markdownlint and `privacy-check` pass.

### Known issues and errata

The unit is new, so firmware faults and manual errors are expected and later firmware is likely to fix some of them. The manual keeps two separate registers.

| Register | Holds | Each row records |
| --- | --- | --- |
| Manual errata | errors and gaps in the official manual | manual version, location, issue, working assumption, test result |
| Known issues | faults in the unit or its editor software | symptom, firmware version, source, status, workaround |

- **Sources for known issues:** our own unit tests, vendor release notes, and user reports from forums and retailers. Each row links its source and carries a reliability label.
- **Status values:** `reported` (one source, untested), `confirmed` (reproduced on a unit), `fixed in <version>`, `not reproduced`.
- **Upkeep:** recheck open rows at each firmware release and record the result in the changelog.
- **Research:** a background search runs during P2 and again at each later phase close.

## P3: unit session

This phase needs the owner at the unit for about an hour. It only listens to MIDI and reads the display; it writes nothing to the unit's memory.

### Deliverables

- **Firmware version** read from the unit (Global Settings, button 11) and recorded in the manual front matter and the changelog.
- **Known-issue tests:** each `reported` row that can be tested safely is tried on the unit.
- **Errata tests:** each row of the errata register tested and marked verified or still open.
- **MIDI capture:** a log of what the unit sends in each mode for button presses, encoder turns, transport and pattern load. A SysEx export capture is optional and read-only for the unit.
- **Findings note:** `docs/project/capture-findings.md` stating what the unit reports about its own state.

### Acceptance

- Every errata row carries a result and a firmware version.
- The findings note answers three questions: does the unit echo control use in sequencer mode, what is the second USB port for, and what does a SysEx export contain.

## P4: controls library and static panel (G3, part 1)

### Deliverables

- **Geometry:** element positions in panel units, measured from the owner's local copy of the product image. Positions are facts; no image enters the repo.
- **Package `@bcr32/panel`:** Encoder, LedRing, PadButton, Led, Display, Jack and the Panel renderer that lays elements out from device data.
- **Views:** top panel and rear panel.
- **Interaction:** encoders turn by drag, wheel and keys and push by click or Enter; buttons press, hold and release.
- **State-driven colour:** LED and button colours come from the view state, never from component code.
- **App shell:** `apps/web` with Vite, React, Tailwind and Motion.

### Acceptance

- Unit tests cover each control and the layout maths.
- Playwright runs in WebKit and Chromium: every element is reachable by keyboard, has a name and a role, and shows visible focus.
- Reduced-motion preference stops all non-required animation.
- An axe scan reports no WCAG 2.2 AA violations on both views.

## P5: overlay, guided steps and demo engine (G3, part 2)

### Deliverables

- **Overlay:** numbered leader labels for callouts 1–85, switchable all at once, by group or one at a time.
- **Dev panel:** label position editing with JSON export, debug outlines, a state inspector, and a local reference-image underlay for visual comparison.
- **Highlight and lesson API:** a lesson is a list of steps; each step names the controls to highlight and the action to expect.
- **Demo engine:** a table-driven mode machine that lights the right buttons per mode and moves ring values. It doesn't play sequences.
- **First lessons:** three procedures from the manual as proof.

### Acceptance

- Every callout 1–85 renders a label and a working control or indicator.
- Screenshot tests match an approved baseline in WebKit and Chromium.
- The owner approves a side-by-side check against the official image, using the underlay.
- Each lesson step in the three proof lessons advances on the correct action and rejects a wrong one.

## P6: BCR2000 and Zaquencer guide (G2)

No BCR2000 is available for testing, so every fact in this guide is labelled by source and none is marked verified.

The guide is kept apart from the BCR32 manual so that a reader can't mistake old-device facts for BCR32 facts.

- **Own section:** all of it lives in `docs/lineage/` with its own index. The BCR32 manual holds no BCR2000 or Zaquencer procedures.
- **Banner:** each lineage page opens with a note naming the device it describes.
- **One-way links:** the manual links to the lineage section from one "coming from a BCR2000" page. Lineage pages link to manual anchors for the BCR32 side.

### Deliverables

- **Sources table:** `docs/lineage/sources.md` with URL, date read, licence or terms, and a reliability grade for each source.
- **Feature map:** Zaquencer functions against BCR32 equivalents, generated from a data file.
- **Lineage guide:** what changed across the three generations and what trips up someone who knows the old setup.
- **"What transfers" guide:** workflows and community answers that still apply, each labelled by source.

### Acceptance

- Every claim carries a source label: official, community or inference.
- No firmware binary, no copied manual passage and no third-party image is in the repo.
- `docs-check` and `privacy-check` pass.

## P7: docs site

Build a static site from the same Markdown, with the panel embedded beside procedures. Markdown stays the canonical source and stays readable on GitHub.

Publishing the site makes content public, so hosting waits for the owner's approval to open the repo.

## P8: engine and live mirror (G4)

The design seams are in the architecture note. The build is gated on P3 findings and a separate approval, and gets its own plan.

## Routing table

Model tiers: Fable for design and verification, Sonnet for builds from a narrow brief, Haiku for mechanical work with a check script as the gate.

| Phase | Task | Model | Effort | Mode | Gate |
| --- | --- | --- | --- | --- | --- |
| P1 | Workspace, lint, CI | Sonnet | low | inline | CI green |
| P1 | Schema from the architecture note | Sonnet | medium | agent | schema tests, Fable diff read |
| P1 | Element data entry | Sonnet | low | agent | schema, count check |
| P1 | Mode and parameter data entry | Haiku | low | agent | schema, cross-check script against the reference |
| P1 | Four check tools | Sonnet | medium | agent | planted-fault tests |
| P1 | Phase verification | Fable | medium | inline | all checks rerun |
| P2 | Restructure into chapters | Sonnet | low | agent | docs-check, gen-tables check |
| P2 | Second source pass and controller tables | Sonnet | high | agent | coverage-check, Fable review of interleaved lists |
| P2 | Glossary, indexes, quick start, tasks | Sonnet | medium | agent | docs-check |
| P2 | One docs review | Fable | medium | inline | review notes resolved |
| P3 | Capture session script and analysis | Fable | medium | inline | findings note |
| P4 | Geometry data entry | Sonnet | medium | agent | schema, Fable spot check of 10 positions |
| P4 | Control components | Sonnet | medium | agent | unit tests, axe |
| P4 | Encoder interaction and accessibility review | Fable | high | inline | Playwright in WebKit |
| P5 | Overlay layout and dev panel | Sonnet | medium | agent | screenshot tests |
| P5 | Lesson API and demo engine design check | Fable | high | inline | lesson tests |
| P2 | User-reported issues research | Sonnet | medium | background agent | every row has a source link and a status |
| P6 | Web research | Sonnet | medium | background agent | sources table complete |
| P6 | Guide writing | Sonnet | medium | agent | docs-check, one Fable review |
| P7 | Site build | Sonnet | low | agent | link check, build green |

## Risks

| Risk | Effect | Mitigation |
| --- | --- | --- |
| A test damages or locks a unit | Costly, slow to replace | [Unit safety protocol](unit-safety.md): recovery runbook and backup first, risk tiers, no undocumented or replayed SysEx, no firmware traffic |
| The unit doesn't report its state over MIDI | A live mirror can't be exact | P3 runs before any engine design is final; the mirror falls back to "follow what it sends" |
| No published SysEx format or MIDI chart | Engine and editor features stay guesses | Treat capture logs as the only source; label inference |
| Safari has no Web MIDI API | Live MIDI fails in the owner's browser | A local WebSocket bridge is the main transport; Web MIDI is the second |
| Official artwork copied by accident | Copyright problem in a public repo | Own SVG drawing, no logo, underlay image stays local and git-ignored |
| Personal data in a commit | History rewrite | `privacy-check` in CI and before each commit, with a local pattern file |
| Firmware updates change behaviour | Verified facts go stale | Every verified fact names its firmware version |
| Scope growth | Budgets overrun | New ideas go to `docs/project/parking.md`; the active list changes only with approval |

## Working rules

- **One task list:** the [playbook](playbook.md) holds every step, its status and the handover notes. Update it when a step closes.
- **One approval per release:** the owner approves a release and its total once. Phases inside it run without further questions.
- **Estimate first:** each phase states steps and tokens before it starts and reports real turns and time after.
- **Overrun stop:** a step that passes its estimate by 50 percent stops for a report.
- **One handoff commit per session,** after checks pass.
- **Docs move with the work:** index, `llms.txt` and changelog change in the same commit.
