import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { checkAll, checkDocument, parsePending } from "./check.ts";
import { actionShapeError } from "./action.ts";
import { anchors, slug, splitLines } from "./markdown.ts";
import type { Env } from "./types.ts";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));
const CLI = fileURLToPath(new URL("./cli.ts", import.meta.url));

const IDS = new Set(["B1", "B5", "B20", "B21", "B22", "E25", "E49", "E51", "E53", "E55", "SEL", "DISP", "J69", "L2.in", "L2.a", "L3.1", "L4"]);

function memoryEnv(files: Record<string, string> = {}): Env {
  return {
    exists: (p) => p in files || Object.keys(files).some((f) => f.startsWith(`${p}/`)),
    read: (p) => files[p],
    controlIds: IDS,
  };
}

const FRONT = "---\ntitle: Test\ndescription: A test document.\nstatus: draft\nlast_updated: 2026-11-11\n---\n\n";
const doc = (body: string, front = FRONT): string => `${front}# Test\n\n${body}\n`;

// Rule IDs found in a document. An empty list means the document passes.
const rulesOf = (path: string, text: string, files: Record<string, string> = {}): string[] =>
  [...new Set(checkDocument(path, text, memoryEnv(files)).map((f) => f.rule))];

test("the clean document passes every rule", () => {
  assert.deepEqual(rulesOf("docs/a.md", doc("Press the button B5. The unit sends a message.")), []);
});

const GLOSSARY = `${FRONT}# Glossary\n\n### Pattern\n\nA saved set of notes.\n\n### Control change (CC)\n\nA MIDI message.\n`;
const GFILES = { "docs/manual/13-glossary.md": GLOSSARY };
const glossaryOf = (path: string, body: string, files: Record<string, string> = GFILES): string[] =>
  checkDocument(path, doc(body), memoryEnv(files)).filter((f) => f.rule === "glossary").map((f) => `${f.line}:${f.message}`);
const LINKED = "[pattern](13-glossary.md#pattern)";

test("glossary: a linked first use passes, an unlinked first use fails", () => {
  assert.deepEqual(glossaryOf("docs/manual/a.md", `Store the ${LINKED}. Load the pattern.`), []);
  assert.equal(glossaryOf("docs/manual/a.md", "Store the pattern.").length, 1);
});

test("glossary: the link must come before a plain use, and each term gives one finding", () => {
  assert.equal(glossaryOf("docs/manual/a.md", `The pattern plays. The ${LINKED} stops.`).length, 1);
  assert.equal(glossaryOf("docs/manual/a.md", "A pattern. Another pattern.\n\nA third pattern.").length, 1);
});

test("glossary: plural forms and abbreviations count, other words do not", () => {
  assert.equal(glossaryOf("docs/manual/a.md", "Three patterns.").length, 1);
  assert.equal(glossaryOf("docs/manual/a.md", "Send a CC message.").length, 1);
  assert.equal(glossaryOf("docs/manual/a.md", "Send a cc message.").length, 0);
  assert.equal(glossaryOf("docs/manual/a.md", "The patterned wall. A control change.").length, 1);
});

test("glossary: headings, code, other links and fenced code do not count as use", () => {
  assert.deepEqual(glossaryOf("docs/manual/a.md", "## The pattern page\n\nText."), []);
  assert.deepEqual(glossaryOf("docs/manual/a.md", "Type `pattern` here."), []);
  assert.deepEqual(glossaryOf("docs/manual/a.md", "See [patterns](other.md)."), []);
  assert.deepEqual(glossaryOf("docs/manual/a.md", "```\npattern\n```"), []);
});

test("glossary: text between gen markers is generated and not checked, text after the end marker is", () => {
  assert.deepEqual(glossaryOf("docs/manual/a.md", "<!-- gen:modes -->\n\nA pattern.\n<!-- gen:end -->"), []);
  assert.equal(glossaryOf("docs/manual/a.md", "<!-- gen:modes -->\n<!-- gen:end -->\n\nA pattern.").length, 1);
});

test("glossary: only files under docs/manual/ except the glossary are checked", () => {
  assert.equal(glossaryOf("docs/guides/a.md", "A pattern.").length, 0);
  assert.equal(glossaryOf("docs/manual/13-glossary.md", "A pattern.").length, 0);
  assert.equal(glossaryOf("docs/manual/a.md", "A pattern.", {}).length, 0);
});

test("glossary: a match inside a longer term is not a use of the shorter term", () => {
  const files = { "docs/manual/13-glossary.md": `${GLOSSARY}\n### Page\n\nA group.\n\n### ZAQ Global page\n\nA settings page.\n` };
  assert.deepEqual(glossaryOf("docs/manual/a.md", "The [ZAQ Global page](13-glossary.md#zaq-global-page) shows it.", files), []);
  assert.equal(glossaryOf("docs/manual/a.md", "The ZAQ Global page shows it.", files).length, 1);
  assert.equal(glossaryOf("docs/manual/a.md", "The ZAQ Global page and a page.", files).length, 2);
});

test("front-matter: missing block, missing key, bad status, bad date", () => {
  assert.deepEqual(rulesOf("docs/a.md", "# Test\n\nText.\n"), ["front-matter"]);
  assert.deepEqual(rulesOf("docs/a.md", doc("Text.", FRONT.replace("description: A test document.\n", ""))), ["front-matter"]);
  assert.deepEqual(rulesOf("docs/a.md", doc("Text.", FRONT.replace("draft", "final"))), ["front-matter"]);
  assert.deepEqual(rulesOf("docs/a.md", doc("Text.", FRONT.replace("2026-11-11", "11/11/2026"))), ["front-matter"]);
  assert.deepEqual(rulesOf("docs/a.md", doc("Text.", FRONT.replace("2026-11-11", "2026-13-40"))), ["front-matter"]);
  assert.deepEqual(rulesOf("docs/a.md", doc("Text.", FRONT.replace("draft", "verified"))), []);
});

test("front-matter applies to docs/, packages/<name>/ and tools/<name>/ only", () => {
  const bare = "# Test\n\nText.\n";
  assert.deepEqual(rulesOf("README.md", bare), []);
  assert.deepEqual(rulesOf("tools/README.md", bare), []);
  assert.deepEqual(rulesOf("packages/x/README.md", bare), ["front-matter"]);
  assert.deepEqual(rulesOf("tools/x/README.md", bare), ["front-matter"]);
  assert.deepEqual(rulesOf("docs/deep/er/a.md", bare), ["front-matter"]);
});

test("title: none, two titles and a skipped level fail", () => {
  assert.deepEqual(rulesOf("README.md", "Text only.\n"), ["title"]);
  assert.deepEqual(rulesOf("README.md", "# One\n\n# Two\n"), ["title"]);
  assert.deepEqual(rulesOf("README.md", "# One\n\n### Three\n"), ["title"]);
  assert.deepEqual(rulesOf("README.md", "# One\n\n## Two\n\n### Three\n\n## Back\n"), []);
  assert.deepEqual(rulesOf("README.md", "# One\n\n```sh\n# a comment, not a title\n```\n"), []);
});

test("link: a missing target fails and an existing one passes", () => {
  const files = { "docs/b.md": doc("Text.") };
  assert.deepEqual(rulesOf("docs/a.md", doc("See [b](b.md)."), files), []);
  assert.deepEqual(rulesOf("docs/a.md", doc("See [b](missing.md)."), files), ["link"]);
  assert.deepEqual(rulesOf("docs/a.md", doc("See [b](../docs/b.md) and [c](./b.md)."), files), []);
  assert.deepEqual(rulesOf("docs/a.md", doc("See [x](../../outside.md)."), files), ["link"]);
});

test("link: external links and code spans are not checked", () => {
  assert.deepEqual(rulesOf("docs/a.md", doc(`See [w](https://example.org/x) and [m](mailto:${["a", "b.test"].join("@")}).`)), []);
  assert.deepEqual(rulesOf("docs/a.md", doc("Write `[text](missing.md)` for a link.")), []);
  assert.deepEqual(rulesOf("docs/a.md", doc("```md\n[text](missing.md)\n```")), []);
});

test("link: a reference definition is checked", () => {
  assert.deepEqual(rulesOf("docs/a.md", doc("See [b].\n\n[b]: missing.md")), ["link"]);
});

test("anchor: a heading fragment must exist", () => {
  const files = { "docs/b.md": doc("## Two words\n\nText.") };
  assert.deepEqual(rulesOf("docs/a.md", doc("See [b](b.md#two-words)."), files), []);
  assert.deepEqual(rulesOf("docs/a.md", doc("See [b](b.md#no-such-heading)."), files), ["anchor"]);
  assert.deepEqual(rulesOf("docs/a.md", doc("## Local\n\nSee [here](#local)."), files), []);
  assert.deepEqual(rulesOf("docs/a.md", doc("See [here](#nowhere)."), files), ["anchor"]);
});

test("anchor: GitHub slug rules", () => {
  assert.equal(slug("3. Top panel — control map"), "3-top-panel--control-map");
  assert.equal(slug("12. Source errors and gaps"), "12-source-errors-and-gaps");
  assert.equal(slug("2. Modes and menus (state machine)"), "2-modes-and-menus-state-machine");
  assert.equal(slug("The `loadDevice` call_name"), "the-loaddevice-call_name");
  const lines = splitLines("# T\n\n## Same\n\n## Same\n\n## Same\n");
  assert.deepEqual([...anchors(lines)], ["t", "same", "same-1", "same-2"]);
});

test("anchor: the anchors the reference links to resolve in the real reference", () => {
  const chapter = (name: string) => anchors(splitLines(readFileSync(join(ROOT, "docs/manual", name), "utf8")));
  assert.ok(chapter("12-source-errors-and-gaps.md").has("12-source-errors-and-gaps"));
  assert.ok(chapter("02-modes-and-menus.md").has("2-modes-and-menus-state-machine"));
  assert.ok(chapter("03-top-panel-control-map.md").has("3-top-panel--control-map"));
});

test("control-id: an unknown ID fails and known IDs pass", () => {
  assert.deepEqual(rulesOf("README.md", "# T\n\nPress B99.\n"), ["control-id"]);
  assert.deepEqual(rulesOf("README.md", "# T\n\nPress B5, turn E25 and SEL. See DISP and J69.\n"), []);
  assert.deepEqual(rulesOf("README.md", "# T\n\nUse `B77` here.\n"), ["control-id"]);
  assert.deepEqual(rulesOf("README.md", "# T\n\nThe LED L9.x lights.\n"), ["control-id"]);
  assert.deepEqual(rulesOf("README.md", "# T\n\n```\nB99 is only code\n```\n"), []);
});

test("control-id: callout-level IDs, ranges and shorthand", () => {
  assert.deepEqual(rulesOf("README.md", "# T\n\nThe LEDs L2 and L3 light. L4 too.\n"), []);
  assert.deepEqual(rulesOf("README.md", "# T\n\nThe LED L7 lights.\n"), ["control-id"]);
  assert.deepEqual(rulesOf("README.md", "# T\n\nPress B5–B20.\n"), []);
  assert.deepEqual(rulesOf("README.md", "# T\n\nPress B5–B30.\n"), ["control-id"]);
  assert.deepEqual(rulesOf("README.md", "# T\n\nPress B21–24.\n"), []);
  assert.deepEqual(rulesOf("README.md", "# T\n\nTurn E49/51/53/55.\n"), []);
});

test("control-id: look-alike tokens are not flagged", () => {
  const text = "# T\n\nStep E(24+k) uses CV1, T1, D31, R1, P1, A14 and R1_14. The B2B mix and 1.0.3 pass.\n";
  assert.deepEqual(rulesOf("README.md", text), []);
});

test("action: a hold span is one control, or parts joined by a spaced plus", () => {
  assert.deepEqual(rulesOf("README.md", "# T\n\nUse `hold B5 + B20` now.\n"), []);
  assert.deepEqual(rulesOf("README.md", "# T\n\nUse `hold B5` now.\n"), []);
  assert.deepEqual(rulesOf("README.md", "# T\n\nUse `hold B5 +` now.\n"), ["action"]);
  assert.deepEqual(rulesOf("README.md", "# T\n\nUse `hold B5+B20` now.\n"), ["action"]);
  assert.deepEqual(rulesOf("README.md", "# T\n\nUse `hold B5 + + B20` now.\n"), ["action"]);
  assert.deepEqual(rulesOf("README.md", "# T\n\nUse `tap B5` and `holder` now.\n"), []);
  assert.equal(actionShapeError("hold SEL + push E25"), undefined);
});

test("ste-contraction: contractions fail, possessives and code pass", () => {
  assert.deepEqual(rulesOf("README.md", "# T\n\nThe unit doesn't start.\n"), ["ste-contraction"]);
  assert.deepEqual(rulesOf("README.md", "# T\n\nThe unit doesn’t start.\n"), ["ste-contraction"]);
  for (const word of ["they're", "we've", "it'll", "it's", "that's", "there's", "here's", "what's", "let's", "who's"])
    assert.deepEqual(rulesOf("README.md", `# T\n\nA note: ${word} here.\n`), ["ste-contraction"], word);
  assert.deepEqual(rulesOf("README.md", "# T\n\nRead the manual's text. The unit does not start.\n"), []);
  assert.deepEqual(rulesOf("README.md", "# T\n\nType `don't` in the box.\n\n```\ncan't\n```\n"), []);
});

test("ste-sentence: a long sentence fails and a short one passes", () => {
  const long = Array.from({ length: 26 }, () => "word").join(" ");
  const ok = Array.from({ length: 25 }, () => "word").join(" ");
  assert.deepEqual(rulesOf("README.md", `# T\n\n${long}.\n`), ["ste-sentence"]);
  assert.deepEqual(rulesOf("README.md", `# T\n\n${ok}.\n`), []);
  assert.deepEqual(rulesOf("README.md", `# T\n\n- ${long}.\n`), ["ste-sentence"]);
  assert.deepEqual(rulesOf("README.md", `# T\n\n> ${long}.\n`), ["ste-sentence"]);
});

test("ste-sentence: steps allow 20 words", () => {
  const twenty = Array.from({ length: 20 }, () => "word").join(" ");
  const twentyOne = `${twenty} more`;
  assert.deepEqual(rulesOf("README.md", `# T\n\n1. ${twenty}.\n`), []);
  assert.deepEqual(rulesOf("README.md", `# T\n\n1. ${twentyOne}.\n`), ["ste-sentence"]);
  assert.deepEqual(rulesOf("README.md", `# T\n\n- ${twentyOne}.\n`), []);
});

test("ste-sentence: splitting, wrapping, code spans, links, tables and headings", () => {
  const w = (n: number) => Array.from({ length: n }, () => "word").join(" ");
  // Two sentences of 15 words are fine.
  assert.deepEqual(rulesOf("README.md", `# T\n\n${w(15)}. ${w(15)}? ${w(15)}!\n`), []);
  // A colon at the end of a line splits.
  assert.deepEqual(rulesOf("README.md", `# T\n\n${w(15)}:\n${w(15)}.\n`), []);
  // A wrapped sentence counts all its lines.
  assert.deepEqual(rulesOf("README.md", `# T\n\n${w(13)}\n${w(13)}.\n`), ["ste-sentence"]);
  // Abbreviations and numbers do not split. This one sentence has 27 words.
  assert.deepEqual(rulesOf("README.md", `# T\n\n${w(13)} e.g. firmware 1.0.3 ${w(12)}.\n`), ["ste-sentence"]);
  // A code span counts as one word.
  assert.deepEqual(rulesOf("README.md", `# T\n\n${w(24)} \`hold a very long span of text + B5 and more\`.\n`), []);
  // A link target does not count.
  assert.deepEqual(rulesOf("README.md", `# T\n\n${w(24)} [text](https://example.org/a/b/c/d/e/f/g).\n`), []);
  // Tables and headings are skipped.
  assert.deepEqual(rulesOf("README.md", `# T\n\n| a | ${w(40)} |\n| - | - |\n`), []);
  assert.deepEqual(rulesOf("README.md", `# T\n\n## ${w(40)}\n`), []);
  assert.deepEqual(rulesOf("README.md", `# T\n\n\`\`\`\n${w(40)}.\n\`\`\`\n`), []);
});

test("front matter is skipped by the ste rules", () => {
  const front = FRONT.replace("A test document.", "It doesn't matter " + "word ".repeat(30));
  assert.deepEqual(rulesOf("docs/a.md", doc("Text.", front)), []);
});

test("findings carry path, line, rule and message", () => {
  const found = checkDocument("README.md", "# T\n\nOK.\nPress B99.\n", memoryEnv());
  assert.deepEqual(found, [
    { path: "README.md", line: 4, rule: "control-id", message: "'B99' is not an element ID in the device data" },
  ]);
});

test("pending list: a listed file skips the ste rules", () => {
  const bad = "# T\n\nThe unit doesn't start.\n";
  const files = { "README.md": bad };
  assert.deepEqual(checkAll(["README.md"], memoryEnv(files), "").map((f) => f.rule), ["ste-contraction"]);
  assert.deepEqual(checkAll(["README.md"], memoryEnv(files), "# note\nREADME.md\n"), []);
});

test("pending list: a listed file still gets the other rules", () => {
  const files = { "README.md": "# T\n\nThe unit doesn't start. Press B99.\n" };
  assert.deepEqual(checkAll(["README.md"], memoryEnv(files), "README.md\n").map((f) => f.rule), ["control-id"]);
});

test("pending list: a missing file is a finding", () => {
  const found = checkAll([], memoryEnv(), "# c\n\ngone.md\n", "list.txt");
  assert.deepEqual(found, [
    { path: "list.txt", line: 3, rule: "ste-pending", message: "listed file 'gone.md' does not exist" },
  ]);
});

test("pending list: a listed file that now passes is a finding", () => {
  const files = { "README.md": "# T\n\nThe unit starts.\n" };
  const found = checkAll(["README.md"], memoryEnv(files), "README.md\n", "list.txt");
  assert.deepEqual(found.map((f) => [f.path, f.line, f.rule]), [["list.txt", 1, "ste-pending"]]);
  assert.match(found[0]?.message ?? "", /now passes/);
});

test("pending list: parsing ignores comments and blank lines", () => {
  assert.deepEqual(parsePending("# c\n\na.md\n  b.md  # why\n"), [
    { path: "a.md", line: 3 },
    { path: "b.md", line: 4 },
  ]);
});

test("a file that cannot be read is a finding", () => {
  assert.equal(checkAll(["gone.md"], memoryEnv()).length, 1);
});

test("CLI: exit 0 for a clean folder, 1 for findings, 2 for a usage error", () => {
  const dir = mkdtempSync(join(tmpdir(), "docs-check-"));
  const write = (path: string, text: string) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  };
  const device = join(ROOT, "data/devices/bcr32");
  const run = (...args: string[]) =>
    spawnSync("node", [CLI, "--root", dir, "--device", device, ...args], { cwd: dir, encoding: "utf8" });
  write("good.md", "# Good\n\nPress B5.\n");
  write("bad.md", "# Bad\n\nPress B999. See [x](nowhere.md).\n");
  assert.equal(run("good.md").status, 0);
  const bad = run("bad.md");
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /^bad\.md:3: control-id: /m);
  assert.match(bad.stdout, /^bad\.md:3: link: /m);
  assert.equal(run("--nope").status, 2);
  assert.equal(run("--pending").status, 2);
});
