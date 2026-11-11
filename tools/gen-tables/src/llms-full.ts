// Builds llms-full.txt: llms.txt plus every manual chapter in README order, front matter removed.
// Usage: node llms-full.ts [--check]   Writes llms-full.txt; with --check, exits 1 when the file differs.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const OUT = "llms-full.txt";

export function stripFrontMatter(text: string): string {
  return text.startsWith("---\n") ? text.replace(/^---\n[\s\S]*?\n---\n\n?/, "") : text;
}

// Chapter files in README order: the links of the "Chapters" table.
export function chapterFiles(readme: string): string[] {
  return [...readme.matchAll(/^\| \d+ \| \[[^\]]+\]\(([^)#]+\.md)(?:#[^)]*)?\)/gm)].map((m) => m[1]!);
}

export function build(llms: string, chapters: { file: string; text: string }[]): string {
  const parts = [llms.trimEnd(), ...chapters.map((c) => `<!-- file: docs/manual/${c.file} -->\n\n${stripFrontMatter(c.text).trimEnd()}`)];
  return parts.join("\n\n---\n\n") + "\n";
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.some((a) => a !== "--check")) {
    console.error("usage: llms-full.ts [--check]");
    process.exit(2);
  }
  const dir = "docs/manual/";
  const files = chapterFiles(readFileSync(`${dir}README.md`, "utf8"));
  const missing = files.filter((f) => !existsSync(dir + f));
  if (files.length === 0 || missing.length > 0) {
    console.error(`llms-full: chapter list is empty or names a missing file: ${missing.join(", ") || "none found"}`);
    process.exit(1);
  }
  // Tracked files only, as for the other tools: an unstaged chapter would be silently left out.
  const tracked = new Set(execFileSync("git", ["ls-files", dir], { encoding: "utf8" }).split("\n"));
  const untracked = files.filter((f) => !tracked.has(dir + f));
  if (untracked.length > 0) {
    console.error(`llms-full: chapter not tracked by git (stage it): ${untracked.join(", ")}`);
    process.exit(1);
  }
  const text = build(readFileSync("llms.txt", "utf8"), files.map((file) => ({ file, text: readFileSync(dir + file, "utf8") })));
  if (process.argv.includes("--check")) {
    const present = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
    if (present !== text) {
      console.error(`llms-full: ${OUT} differs from the manual (run: npm run gen:llms-full)`);
      process.exit(1);
    }
    console.log(`llms-full: ${OUT} is current (${files.length} chapters)`);
  } else {
    writeFileSync(OUT, text);
    console.log(`llms-full: wrote ${OUT} (${files.length} chapters)`);
  }
}
