# Contributing

This repo is written to be publishable at any time. Every commit must leave the docs accurate, consistent and free of personal data.

## Privacy rules

Treat the repo as public from the first commit. Git history is permanent, so personal data must never reach a commit.

### Never commit

- **People:** real names, email addresses, usernames, phone numbers, postal addresses.
- **Machines and networks:** hostnames, IP addresses, MAC addresses, Wi-Fi names, SSH aliases, local domain names.
- **Devices:** serial numbers (USB serials included), device IDs that identify one unit, licence or registration keys.
- **Paths:** absolute paths that contain a username, such as `/Users/<name>/` or `C:\Users\<name>\`.
- **Media and dumps:** screenshots, photos, audio or SysEx dumps that contain any of the above. Check image metadata (EXIF, GPS) before adding an image.

Product-level facts are fine: model names, USB vendor and product IDs, MIDI port names as the operating system shows them, firmware version numbers.

### Where personal setup notes go

Put notes about your own machines and setup in `local/`. Everything in `local/` except its README is git-ignored. Docs in `docs/` describe setups generically with placeholders.

| Instead of | Write |
| --- | --- |
| a computer's name | `<YOUR_COMPUTER>` or "your computer" |
| an IP address | `<HOST_IP>` |
| a home folder path | `~/` or `<PROJECT_DIR>` |
| your DAW project name | `<PROJECT_NAME>` |

### Check before each commit

Install the git hooks one time. They run the [privacy-check tool](tools/privacy-check/README.md) on each commit, each commit message and each push.

```bash
npm run hooks
```

The hooks stop a commit or a push that holds a personal-data pattern. Put your own names and host names in `local/privacy-patterns.txt`, one on each line. The file is git-ignored.

To scan the staged changes by hand, run this command. No output before the summary line means no match.

```bash
node tools/privacy-check/src/cli.ts staged
```

### Run the checks

The repo is an npm workspace and needs Node.js 24 or later. Install once, then run every check that CI runs.

```bash
npm ci
npm run check
```

`npm run check` runs markdownlint, the TypeScript type check, the tests, the JSON Schema freshness check and device data validation. It also runs the four [check tools](tools/README.md): generated tables, documentation standard, manual coverage and privacy. CI runs the same commands on every push and pull request.

## Documentation standard

### Where content goes

| Content | Location |
| --- | --- |
| Facts about the hardware, controls, menus, values | `docs/manual/` (one file per chapter) |
| A task from start to finish ("connect to X", "record a drum pattern") | a new file in `docs/guides/` |
| Symptoms and fixes | `docs/guides/troubleshooting.md` |
| Tool usage | `tools/<tool-name>/README.md` |

Each fact has one home. Other documents link to it instead of copying it.

### Required in every document

- **Front matter:** YAML with `title`, `description`, `status`, `last_updated`, and `source` where facts come from elsewhere.
- **Status values:** `draft` (written, not checked on a unit), `verified` (tested on a unit; name the firmware version), `deprecated`.
- **One `#` title,** sentence-case headings, no skipped heading levels.
- **Short paragraphs:** three sentences at most. Use tables for options and values, numbered lists for steps.
- **Control IDs:** use the IDs from the reference (`B61`, `E25`, `SEL`) and the panel label together the first time in a section, for example "STORE (B61)".

### Claims and accuracy

- **Official manual facts:** cite the section. If the manual is wrong or unclear, add a row to the reference's "Source errors and gaps" table.
- **Untested steps:** mark the step or the whole guide "unverified". Do not present an untested procedure as fact.
- **Tested steps:** record the firmware version and the date in the document and in `CHANGELOG.md`.
- **Other software:** name the version you tested with (for example Ableton Live 12.4).

### Writing style

- Second person and imperative mood: "Press STORE (B61)", not "The user should press".
- Plain words. No marketing language ("powerful", "seamless", "robust").
- Callouts use only `> **Note:**`, `> **Warning:**` and `> **Tip:**`. Put a warning before the step it applies to.
- File names in lowercase with hyphens. Wrap prose at about 100 characters where practical.

### Simplified Technical English

Write all documentation in Simplified Technical English. These rules are based on ASD-STE100. They add to the rules above, and where a rule here disagrees with a rule above, the rule here applies.

The rules apply to documents, READMEs, the changelog, tool messages and code comments. They do not apply to quoted text, panel labels, display strings or code.

| Rule | Limit or example |
| --- | --- |
| One instruction in each step | "Press STORE (B61)." then "Turn SELECT (SEL)." |
| Short sentences | 20 words at most in a step, 25 words at most in other text |
| One topic in each paragraph | 6 sentences at most; the 3-sentence limit above stays the target |
| Active voice | "The unit sends a message", not "A message is sent" |
| Simple verb forms | "Press", "the LED flashes"; not "pressing", "is flashing", "has been pressed" |
| One word for one meaning | Use the glossary term each time. If you write "pattern", do not change to "sequence" for the same thing |
| One meaning for each word | "Turn" is always the encoder movement. Use "change" for a setting |
| No contractions | "do not", "is not", "cannot" |
| Articles stay in | "Press the button", not "Press button" |
| Short noun groups | 3 nouns at most: "track mute button", not "track mute button LED state" |
| Result after the step | "The display shows `PIT`." |
| Condition before the instruction | "If the LED flashes, press EXIT (B60)." |
| Warning before the step | Start the warning with the command or the condition |
| No slash between words in prose | "store or load", not "store/load". Panel labels such as LD/LRN stay as printed |

Technical names are permitted as they are: control IDs, panel labels, MIDI terms, product names and glossary terms.

> **Note:** The project does not claim conformance to ASD-STE100. The rules follow its method; they do not use its dictionary.

Change an existing document to these rules when you edit it. Then remove its line from `tools/docs-check/ste-pending.txt`. The `docs-check` tool applies the sentence and contraction rules to each document that is not on that list.

### Keep it maintained

- Update `docs/README.md` and `llms.txt` when you add, rename or remove a document.
- Add a dated line to `CHANGELOG.md` for every change a reader would notice.
- Fix broken links in the same commit that breaks them.

## Copyright

Do not commit the official PDF or copy large passages from it. Restate facts in your own words and structure, and cite the manual section.

## License of contributions

By contributing, you agree that documentation you add is licensed under [CC BY 4.0](LICENSE-docs) and code under the [MIT License](LICENSE). Figures in `docs/assets/figures/` are not covered by this clause. They stay under [their own licence](docs/assets/figures/LICENSE.md). Credit goes to "bcr32 contributors"; do not add personal names to license or copyright lines.
