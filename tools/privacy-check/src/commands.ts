// Command logic: collect text from git or files, run the rules, return findings with paths.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { dropCoAuthored, parseAddedLines, parsePushRefs } from "./diff.ts";
import { parseLocalPatterns, scanText } from "./rules.ts";

export interface Finding {
  path: string;
  line: number;
  rule: string;
  text: string;
}

export interface Result {
  findings: Finding[];
  scanned: number;
}

const EXCLUDE_LOCK = ["--", ".", ":(exclude)package-lock.json"];
const ZERO = /^0+$/;

function git(root: string, args: string[]): string {
  return execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
}

export function repoRoot(cwd: string): string {
  return git(cwd, ["rev-parse", "--show-toplevel"]).trim();
}

export function hooksDir(root: string): string {
  return resolve(root, git(root, ["rev-parse", "--git-path", "hooks"]).trim());
}

export function loadPatterns(file: string | undefined, root: string): string[] {
  const path = file ?? join(root, "local", "privacy-patterns.txt");
  return existsSync(path) ? parseLocalPatterns(readFileSync(path, "utf8")) : [];
}

function scan(path: string, text: string, patterns: string[]): Finding[] {
  return scanText(text, patterns).map((f) => ({ path, ...f }));
}

function scanAdded(diff: string, patterns: string[]): Result {
  const added = parseAddedLines(diff);
  const findings: Finding[] = [];
  for (const a of added)
    for (const f of scanText(a.text, patterns)) findings.push({ path: a.path, line: a.line, rule: f.rule, text: f.text });
  return { findings, scanned: new Set(added.map((a) => a.path)).size };
}

export function scanTracked(root: string, patterns: string[]): Result {
  const files = git(root, ["ls-files", "-z"]).split("\0").filter((f) => f !== "" && f !== "package-lock.json");
  const findings: Finding[] = [];
  let scanned = 0;
  for (const file of files) {
    let data: Buffer;
    try {
      data = readFileSync(join(root, file));
    } catch {
      continue; // tracked but deleted in the working tree
    }
    if (data.includes(0)) continue; // binary
    scanned++;
    findings.push(...scan(file, data.toString("utf8"), patterns));
  }
  return { findings, scanned };
}

export function scanStaged(root: string, patterns: string[]): Result {
  return scanAdded(git(root, ["diff", "--cached", "-U0", ...EXCLUDE_LOCK]), patterns);
}

export function scanMessage(file: string, patterns: string[]): Result {
  return { findings: scan(file, dropCoAuthored(readFileSync(file, "utf8")), patterns), scanned: 1 };
}

export function scanStdin(input: string, patterns: string[]): Result {
  return { findings: scan("stdin", input, patterns), scanned: 1 };
}

// Scans the added lines and the messages of every commit that the remote does not have yet.
export function scanPush(root: string, refLines: string, patterns: string[]): Result {
  const findings: Finding[] = [];
  let scanned = 0;
  for (const { localSha, remoteSha } of parsePushRefs(refLines)) {
    if (ZERO.test(localSha)) continue; // delete push
    const range = ZERO.test(remoteSha) ? localSha : `${remoteSha}..${localSha}`;
    const shas = git(root, ["rev-list", range]).split("\n").filter((s) => s !== "");
    for (const sha of shas) {
      scanned++;
      const label = sha.slice(0, 8);
      findings.push(...scan(`${label} (message)`, dropCoAuthored(git(root, ["log", "-1", "--format=%B", sha])), patterns));
      const diff = git(root, ["show", "-U0", "--format=", sha, ...EXCLUDE_LOCK]);
      findings.push(...scanAdded(diff, patterns).findings.map((f) => ({ ...f, path: `${label}:${f.path}` })));
    }
  }
  return { findings, scanned };
}
