// Writes the three git hooks. Each hook runs the CLI from the repo root.
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CLI = "tools/privacy-check/src/cli.ts";

export const HOOKS: Record<string, string> = {
  "pre-commit": "staged",
  "commit-msg": 'message "$1"',
  "pre-push": "push",
};

export function hookScript(args: string): string {
  return `#!/bin/sh\n# Installed by privacy-check. Re-run install-hooks to refresh.\ncd "$(git rev-parse --show-toplevel)" || exit 1\nexec node ${CLI} ${args}\n`;
}

// Returns one line per hook. A different existing hook is copied to <name>.bak once.
export function installHooks(hooksDir: string): string[] {
  mkdirSync(hooksDir, { recursive: true });
  const report: string[] = [];
  for (const [name, args] of Object.entries(HOOKS)) {
    const path = join(hooksDir, name);
    const script = hookScript(args);
    let note = "written";
    if (existsSync(path)) {
      if (readFileSync(path, "utf8") === script) note = "already current";
      else if (!existsSync(`${path}.bak`)) {
        copyFileSync(path, `${path}.bak`);
        note = "written, old hook saved as .bak";
      } else note = "written, .bak already exists and was kept";
    }
    if (note !== "already current") writeFileSync(path, script);
    chmodSync(path, 0o755);
    report.push(`${name}: ${note}`);
  }
  return report;
}
