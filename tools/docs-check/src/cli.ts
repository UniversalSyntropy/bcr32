// Usage: node cli.ts [file…]   check the given Markdown files (default: every tracked .md file)
// Options: --root <dir>        repository root (default: the git top level)
//          --device <dir>      device data folder (default: <root>/data/devices/bcr32)
//          --pending <file>    STE pending list (default: <root>/tools/docs-check/ste-pending.txt)
// Exit: 0 clean, 1 findings, 2 usage error.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { checkAll, PENDING_PATH } from "./check.ts";
import { fsEnv } from "./env.ts";

function usage(message: string): number {
  console.error(message);
  console.error("usage: cli.ts [file…] [--root <dir>] [--device <dir>] [--pending <file>]");
  return 2;
}

function main(argv: string[]): number {
  const files: string[] = [];
  const options: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i] as string;
    if (a === "--root" || a === "--device" || a === "--pending") {
      const value = argv[++i];
      if (value === undefined) return usage(`${a} needs a value`);
      options[a] = value;
    } else if (a.startsWith("--")) return usage(`unknown option '${a}'`);
    else files.push(a);
  }

  let root: string;
  try {
    root =
      options["--root"] !== undefined
        ? realpathSync(resolve(options["--root"]))
        : execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  } catch {
    return usage("run this command inside a git repository or pass --root");
  }

  let paths = files.map((f) => relative(root, resolve(f)).split("\\").join("/"));
  if (files.length === 0) {
    try {
      paths = execFileSync("git", ["ls-files", "-z", "*.md"], { cwd: root, encoding: "utf8" })
        .split("\0")
        .filter((p) => p !== "");
    } catch {
      return usage("cannot list files: pass file paths or run inside a git repository");
    }
  }

  const pendingFile = options["--pending"] !== undefined ? resolve(options["--pending"]) : join(root, PENDING_PATH);
  const pendingText = existsSync(pendingFile) ? readFileSync(pendingFile, "utf8") : "";
  let findings;
  try {
    findings = checkAll(paths, fsEnv(root, resolve(options["--device"] ?? join(root, "data", "devices", "bcr32"))), pendingText);
  } catch (error) {
    return usage((error as Error).message);
  }

  for (const f of findings) console.log(`${f.path}:${f.line}: ${f.rule}: ${f.message}`);
  const count = new Set(findings.map((f) => f.path)).size;
  if (findings.length === 0) {
    console.log(`docs-check: clean (${paths.length} files checked)`);
    return 0;
  }
  console.log(`docs-check: ${findings.length} finding(s) in ${count} file(s)`);
  return 1;
}

process.exitCode = main(process.argv.slice(2));
