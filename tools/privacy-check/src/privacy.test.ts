import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { scanPush } from "./commands.ts";
import { dropCoAuthored, parseAddedLines } from "./diff.ts";
import { installHooks } from "./hooks.ts";
import { parseLocalPatterns, scanText } from "./rules.ts";

const CLI = fileURLToPath(new URL("./cli.ts", import.meta.url));

// Planted faults are built at run time, so a scan of this file stays clean.
const host = "studio-mac" + ".lo" + "cal";
const ip = [192, 168, 1, 20].join(".");
const homePath = ["/Us", "ers/", "sam/x"].join("");
const winPath = ["C:", "\\Us", "ers\\", "sam"].join("");
const mac = ["aa", "bb", "cc", "dd", "ee", "ff"].join(":");
const email = ["sam", "example.org"].join("@");

const rules = (text: string, patterns: string[] = []) => scanText(text, patterns).map((f) => f.rule);

test("a planted host name fails and the clean text passes", () => {
  assert.deepEqual(rules(`ssh ${host} now`), ["local-hostname"]);
  assert.deepEqual(rules("ssh your computer now"), []);
  assert.deepEqual(rules("the .localized folder"), []);
});

test("a planted IP address fails and the clean text passes", () => {
  assert.deepEqual(rules(`host ${ip}`), ["private-ip"]);
  assert.deepEqual(rules("host <HOST_IP>"), []);
  assert.deepEqual(rules(`a ${[10, 0, 0, 5].join(".")} b`), ["private-ip"]);
  assert.deepEqual(rules(`a ${[172, 20, 0, 5].join(".")} b`), ["private-ip"]);
});

test("addresses outside the private ranges pass", () => {
  assert.deepEqual(rules("DNS 8.8.8.8"), []);
  assert.deepEqual(rules(`DNS ${[172, 15, 0, 1].join(".")}`), []);
  assert.deepEqual(rules("firmware 1.0.3 and version 10.1.2"), []);
  assert.deepEqual(rules(`x${[1, 192, 168, 1, 1].join(".")}`), []);
});

test("a planted home path fails and the clean text passes", () => {
  assert.deepEqual(rules(`open ${homePath}`), ["home-path"]);
  assert.deepEqual(rules(`open ${winPath}`), ["home-path"]);
  assert.deepEqual(rules(["/ho", "me/sam"].join("")), ["home-path"]);
  assert.deepEqual(rules("open ~/project or <PROJECT_DIR>"), []);
});

test("MAC address and e-mail rules", () => {
  assert.deepEqual(rules(`id ${mac}`), ["mac-address"]);
  assert.deepEqual(rules("id aa:bb:cc"), []);
  assert.deepEqual(rules(`mail ${email}`), ["email"]);
  assert.deepEqual(rules("mail <EMAIL>, at sign @ alone, a@b"), []);
});

test("findings carry line numbers and the matched text", () => {
  const found = scanText(`ok\nline ${ip} and ${host}\n`);
  assert.deepEqual(
    found.map((f) => [f.line, f.rule, f.text]),
    [
      [2, "private-ip", ip],
      [2, "local-hostname", host],
    ],
  );
});

test("local patterns match whole words, ignore case and skip comments", () => {
  const patterns = parseLocalPatterns("# comment\n\nSam Example\n  studio  \n");
  assert.deepEqual(patterns, ["Sam Example", "studio"]);
  assert.deepEqual(rules("by sam example today", patterns), ["local-pattern"]);
  assert.deepEqual(rules("The STUDIO door", patterns), ["local-pattern"]);
  assert.deepEqual(rules("a studios and studio_x", patterns), []);
  assert.deepEqual(rules("comment", patterns), []);
  assert.deepEqual(rules("a (studio) b", patterns), ["local-pattern"]);
});

test("a Co-Authored-By line is dropped from a message", () => {
  const message = `Add thing\n\nCo-Authored-By: Someone <${email}>\n`;
  assert.deepEqual(rules(message), ["email"]);
  assert.deepEqual(rules(dropCoAuthored(message)), []);
  assert.deepEqual(rules(dropCoAuthored(message.replace("Co-Authored-By", "co-authored-by"))), []);
});

test("parseAddedLines returns the new line numbers", () => {
  const diff = [
    "diff --git a/f.txt b/f.txt",
    "--- a/f.txt",
    "+++ b/f.txt",
    "@@ -1,0 +5,2 @@",
    "+first",
    "+++ looks like a header",
    "@@ -9 +20 @@",
    "-gone",
    "+later",
  ].join("\n");
  assert.deepEqual(parseAddedLines(diff), [
    { path: "f.txt", line: 5, text: "first" },
    { path: "f.txt", line: 6, text: "++ looks like a header" },
    { path: "f.txt", line: 20, text: "later" },
  ]);
});

function tempRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "privacy-check-"));
  execFileSync("git", ["init", "-q"], { cwd: dir });
  return dir;
}

function cli(cwd: string, ...args: string[]) {
  return spawnSync("node", [CLI, ...args], { cwd, encoding: "utf8" });
}

test("staged fails with a planted line and passes after its removal", () => {
  const dir = tempRepo();
  const file = join(dir, "note.md");
  writeFileSync(file, `one\ntwo ${ip}\n`);
  execFileSync("git", ["add", "note.md"], { cwd: dir });
  const bad = cli(dir, "staged");
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, new RegExp(`note\\.md:2: private-ip: ${ip.replaceAll(".", "\\.")}`));
  writeFileSync(file, "one\ntwo\n");
  execFileSync("git", ["add", "note.md"], { cwd: dir });
  assert.equal(cli(dir, "staged").status, 0);
});

test("tracked scans committed files and skips package-lock.json and binary files", () => {
  const dir = tempRepo();
  writeFileSync(join(dir, "package-lock.json"), `${ip}\n`);
  writeFileSync(join(dir, "blob.bin"), Buffer.concat([Buffer.from(`${ip}\n`), Buffer.from([0])]));
  writeFileSync(join(dir, "a.txt"), "clean\n");
  execFileSync("git", ["add", "."], { cwd: dir });
  assert.equal(cli(dir, "tracked").status, 0);
  assert.equal(cli(dir).status, 0);
  writeFileSync(join(dir, "b.txt"), `x ${host}\n`);
  execFileSync("git", ["add", "b.txt"], { cwd: dir });
  const bad = cli(dir, "tracked");
  assert.equal(bad.status, 1);
  assert.match(bad.stdout, /^b\.txt:1: local-hostname: /m);
});

test("message and stdin commands, the --patterns option and usage errors", () => {
  const dir = tempRepo();
  const msg = join(dir, "MSG");
  writeFileSync(msg, `Fix\n\nCo-Authored-By: A <${email}>\n`);
  assert.equal(cli(dir, "message", msg).status, 0);
  writeFileSync(msg, `Fix ${ip}\n`);
  assert.equal(cli(dir, "message", msg).status, 1);
  const stdin = spawnSync("node", [CLI, "stdin"], { cwd: dir, encoding: "utf8", input: `at ${homePath}\n` });
  assert.equal(stdin.status, 1);
  const patterns = join(dir, "p.txt");
  writeFileSync(patterns, "secretword\n");
  const withPatterns = spawnSync("node", [CLI, "stdin", "--patterns", patterns], {
    cwd: dir,
    encoding: "utf8",
    input: "a SecretWord b\n",
  });
  assert.equal(withPatterns.status, 1);
  assert.match(withPatterns.stdout, /stdin:1: local-pattern: SecretWord/);
  assert.equal(cli(dir, "bogus").status, 2);
  assert.equal(cli(dir, "message").status, 2);
});

test("push scans messages and added lines of commits the remote lacks", () => {
  const dir = tempRepo();
  const git = (...args: string[]) =>
    execFileSync("git", ["-c", "user.name=t", "-c", `user.email=${["t", "t.test"].join("@")}`, ...args], {
      cwd: dir,
      encoding: "utf8",
    });
  writeFileSync(join(dir, "a.txt"), "clean\n");
  git("add", ".");
  git("commit", "-q", "-m", "first");
  const base = git("rev-parse", "HEAD").trim();
  writeFileSync(join(dir, "a.txt"), `clean\n${ip}\n`);
  git("commit", "-q", "-a", "-m", `second ${host}`, "-m", `Co-Authored-By: A <${email}>`);
  const head = git("rev-parse", "HEAD").trim();
  const zero = "0".repeat(40);
  const result = scanPush(dir, `refs/heads/x ${head} refs/heads/x ${base}\n`, []);
  assert.deepEqual(result.findings.map((f) => f.rule).sort(), ["local-hostname", "private-ip"]);
  assert.equal(scanPush(dir, `refs/heads/x ${base} refs/heads/x ${zero}\n`, []).findings.length, 0);
  assert.equal(scanPush(dir, `(delete) ${zero} refs/heads/x ${base}\n`, []).findings.length, 0);
});

test("install-hooks writes three executable hooks and keeps a .bak of an existing one", () => {
  const dir = tempRepo();
  const hooks = join(dir, ".git", "hooks");
  writeFileSync(join(hooks, "pre-commit"), "#!/bin/sh\necho old\n");
  const run = cli(dir, "install-hooks");
  assert.equal(run.status, 0);
  for (const name of ["pre-commit", "commit-msg", "pre-push"]) {
    assert.ok(statSync(join(hooks, name)).mode & 0o100, `${name} is executable`);
    assert.match(readFileSync(join(hooks, name), "utf8"), /tools\/privacy-check\/src\/cli\.ts/);
  }
  assert.match(readFileSync(join(hooks, "commit-msg"), "utf8"), /cli\.ts message "\$1"/);
  assert.match(readFileSync(join(hooks, "pre-push"), "utf8"), /cli\.ts push/);
  assert.equal(readFileSync(join(hooks, "pre-commit.bak"), "utf8"), "#!/bin/sh\necho old\n");
  assert.ok(!existsSync(join(hooks, "commit-msg.bak")));
  // A second run keeps the first .bak and reports the hooks as current.
  writeFileSync(join(hooks, "pre-commit"), "#!/bin/sh\necho newer\n");
  installHooks(hooks);
  assert.equal(readFileSync(join(hooks, "pre-commit.bak"), "utf8"), "#!/bin/sh\necho old\n");
  assert.deepEqual(
    installHooks(hooks).map((l) => l.split(": ")[1]),
    ["already current", "already current", "already current"],
  );
});
