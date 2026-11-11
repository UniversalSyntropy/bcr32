// Usage: node cli.ts [tracked]              scan every tracked text file
//        node cli.ts staged                 scan the added lines of the staged diff
//        node cli.ts message <file>         scan a commit message file
//        node cli.ts push                   scan unpushed commits (pre-push ref lines on stdin)
//        node cli.ts stdin                  scan stdin
//        node cli.ts install-hooks          write the pre-commit, commit-msg and pre-push hooks
// Option: --patterns <file>                 local pattern file (default: local/privacy-patterns.txt)
// Exit: 0 clean, 1 findings, 2 usage error.
import { readFileSync } from "node:fs";

import { hooksDir, loadPatterns, repoRoot, scanMessage, scanPush, scanStaged, scanStdin, scanTracked, type Result } from "./commands.ts";
import { installHooks } from "./hooks.ts";

const USAGE = "usage: cli.ts [tracked | staged | message <file> | push | stdin | install-hooks] [--patterns <file>]";

function usage(message?: string): number {
  if (message !== undefined) console.error(message);
  console.error(USAGE);
  return 2;
}

function report(result: Result): number {
  for (const f of result.findings) console.log(`${f.path}:${f.line}: ${f.rule}: ${f.text}`);
  const files = new Set(result.findings.map((f) => f.path)).size;
  if (result.findings.length === 0) {
    console.log(`privacy-check: clean (${result.scanned} scanned)`);
    return 0;
  }
  console.log(`privacy-check: ${result.findings.length} finding(s) in ${files} file(s). Blocked.`);
  return 1;
}

function main(argv: string[]): number {
  const args = [...argv];
  let patternsFile: string | undefined;
  const at = args.indexOf("--patterns");
  if (at !== -1) {
    patternsFile = args[at + 1];
    if (patternsFile === undefined) return usage("--patterns needs a file");
    args.splice(at, 2);
  }
  const [command = "tracked", ...rest] = args;
  let root: string;
  try {
    root = repoRoot(process.cwd());
  } catch {
    return usage("run this command inside a git repository");
  }

  if (command === "install-hooks") {
    for (const line of installHooks(hooksDir(root))) console.log(line);
    return 0;
  }
  const patterns = loadPatterns(patternsFile, root);
  if (command === "tracked") return report(scanTracked(root, patterns));
  if (command === "staged") return report(scanStaged(root, patterns));
  if (command === "stdin") return report(scanStdin(readFileSync(0, "utf8"), patterns));
  if (command === "push") return report(scanPush(root, readFileSync(0, "utf8"), patterns));
  if (command === "message") {
    const file = rest[0];
    return file === undefined ? usage("message needs a file") : report(scanMessage(file, patterns));
  }
  return usage(`unknown command '${command}'`);
}

process.exitCode = main(process.argv.slice(2));
