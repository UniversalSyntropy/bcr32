---
title: Publish checklist
description: The checks to pass before the repo goes public, with results, licence and trademark notes, repo description and topics, and the decisions that belong to the owner.
status: draft
last_updated: 2026-11-11
---

# Publish checklist

This page is the gate for step 3.4. Each row is a check, its result and its evidence. The owner decides to publish after the last row. Nothing in this step merges, pushes or changes the repo visibility.

## Results

Scan date 2026-11-11, branch `r1a/p3-unit-session`, 21 commits.

| # | Check | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Full-history scan: patches, commit messages and author lines of all commits | ✅ pass | `privacy-check stdin` on `git log --all -p`: 61 matches, all the `email` rule on two addresses (see notes 1 and 2). No other rule matched |
| 2 | Whole-tree privacy check | ✅ pass | `npm run check:privacy`: clean, 89 files |
| 3 | Files ever committed | ✅ pass | No image, SysEx, MIDI log or archive in any commit. `local/` holds only its README |
| 4 | Secret and token scan of history | ✅ pass | No key, token or private-key pattern in the patches |
| 5 | Unit serial number | ✅ pass | Not in tracked files or history. `midi.json` states that it is not recorded |
| 6 | Official Behringer material | ✅ pass | `reference/` is git-ignored except its README. The repo holds no manual page, image or firmware file |
| 7 | Licence files and statements | ⚠ fixed | The README did not name the licence of `packages/` and `data/`. See the licence notes. Fixed in this step |
| 8 | Trademark notice | ✅ pass | README note present. See the trademark notes |
| 9 | Correction issue template | ✅ done | `.github/ISSUE_TEMPLATE/correction.yml` and `config.yml` |
| 10 | Repo description and topics | ✅ drafted | See below. The owner sets them in GitHub |
| 11 | Announcement text | ✅ drafted | [Announcement draft](announcement-draft.md) |
| 12 | `npm run check` | see playbook | Run after staging the new files |

### Notes on the scan

1. **GitHub no-reply address.** All 21 commits carry the owner's GitHub no-reply address as author and committer. It holds a numeric account ID and the account name. GitHub shows it on every public commit. This is normal, but it links the commits to the account.
2. **Co-author address.** The Anthropic no-reply address appears in commit trailers. It is a public, shared address.
3. **Account name in the remote.** The remote URL names the owner's GitHub account. The account name is the same as in note 1. The repo is private now. A public repo shows the account name on its page.
4. **History is permanent.** The hooks stop new leaks but cannot remove old ones. The scan found none to remove.

## Decisions for the owner

| # | Decision | Recommendation |
| --- | --- | --- |
| P1 | Publish the history as it is, with the no-reply author address | Yes. It holds no personal data. A squash to one commit is only needed if the owner does not want the 21-commit history to show |
| P2 | Publish under the current GitHub account | Owner decides. The account name becomes public. A move to another account or organisation is easier before the first public push than after |
| P3 | Publish the unit-session findings and `midi.json` | Yes. They hold product facts only: firmware version, USB IDs, port names, four controller changes |
| P4 | Make the repo public now or after R1b | The README states "draft" status. Public now fits the aim to be among the first. The owner decides |
| P5 | Announcement venues | Owner decides. See the announcement draft |

## Licence notes

| Part | Licence | Where stated |
| --- | --- | --- |
| Documentation (`docs/`, `README.md`, `llms.txt`, other prose) | CC BY 4.0 | `LICENSE-docs`, README |
| Code (`tools/`, `packages/`) | MIT | `LICENSE`, each `package.json` |
| Device data (`data/`) | MIT (decision D42) | `LICENSE`. The README now says so |
| Official Behringer manual, images, firmware, Control Tribe | Not ours. Not in the repo | README, `reference/README.md` |
| Vendor open-source repository | AGPL-3.0 | Facts only. No code, text or image is copied. Do not copy code from it into an MIT file |

- **Copyright holder.** `LICENSE` names "bcr32 contributors". This is a group name, not a person. The owner can keep it.
- **Facts versus text.** The reference restates facts from the official manual in our own words. A fact is not protected. Do not paste manual sentences, tables or figures. A reviewer should spot-check this before the announcement.
- **Online images.** Decision D49: link them and record the owner and licence. Never commit them.
- **CC BY 4.0 and STE.** ASD-STE100 is a specification with its own licence. We follow its rules in style only. We do not copy its text or dictionary (decision D60).

## Trademark notes

- **Names.** "Behringer", "Music Tribe", "BCR32", "Zaquencer" and "Control Tribe" belong to their owners. The repo uses them to name the product it documents.
- **Notice.** The README states: not affiliated with or endorsed by Behringer or Music Tribe. Keep this notice on every public page, the repo description and the announcement.
- **Owner of the mark.** The README names Music Tribe Global Brands Ltd as the owner of the Behringer mark. Check this against the current legal footer on the vendor site before publishing.
- **Name of the repo.** `bcr32` is the model name. The description says "unofficial". Do not use a vendor logo or a vendor colour scheme as branding.
- **Panel drawings.** R2 draws the panel in our own style from our own data. Do not trace or copy the vendor illustration.

## Repo description and topics

**Description (one line, 348 characters or fewer):**

> Unofficial documentation, device data and tools for the Behringer BCR32 MIDI controller and step sequencer. Not affiliated with Behringer or Music Tribe.

**Topics:** `behringer`, `bcr32`, `midi`, `midi-controller`, `step-sequencer`, `documentation`, `device-data`, `json-schema`, `hardware`, `unofficial`.

**Other settings for the owner:**

- **Website field:** leave empty until the docs site exists (R4).
- **Issues:** on. Use the correction template.
- **Discussions, wiki, projects:** off.
- **Branch protection on `main`:** require the CI check before a merge.
- **Security policy:** private vulnerability reporting on. The repo has no service, so the risk is low.

## Correction issue template

Readers use it to report a wrong fact. It asks for the document, the claim, the evidence, the firmware version and whether the reader tested on a unit. It warns against posting a serial number, a photo with one, or a vendor file. File: `.github/ISSUE_TEMPLATE/correction.yml`.

## After the owner says yes

1. Merge `r1a/p3-unit-session` to `main`.
2. Push `main`.
3. Set the description and topics in GitHub.
4. Change the repo to public.
5. Open the repo in a signed-out browser. Expect the README, the notice and no private file.
6. Post the announcement.
