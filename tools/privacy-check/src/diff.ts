// Helpers for diffs and commit messages. Text in, text out.

export interface AddedLine {
  path: string;
  line: number;
  text: string;
}

// Reads a unified diff (any context size) and returns each added line with its new file line number.
export function parseAddedLines(diff: string): AddedLine[] {
  const added: AddedLine[] = [];
  let path: string | undefined;
  let line = 0;
  let inHunk = false;
  for (const raw of diff.split("\n")) {
    if (raw.startsWith("diff --git ")) {
      inHunk = false;
      path = undefined;
    } else if (!inHunk && raw.startsWith("+++ ")) {
      const name = raw.slice(4).replace(/\t.*$/, "");
      path = name === "/dev/null" ? undefined : name.replace(/^b\//, "");
    } else if (raw.startsWith("@@")) {
      const m = /^@@ -\d+(?:,\d+)? \+(\d+)/.exec(raw);
      if (m?.[1] !== undefined) line = Number(m[1]);
      inHunk = true;
    } else if (inHunk && path !== undefined) {
      if (raw.startsWith("+")) added.push({ path, line: line++, text: raw.slice(1) });
      else if (raw.startsWith(" ")) line++;
    }
  }
  return added;
}

// Blanks Co-Authored-By trailers and keeps the line numbers of the other lines.
export function dropCoAuthored(message: string): string {
  return message
    .split("\n")
    .map((l) => (/^Co-Authored-By:/i.test(l) ? "" : l))
    .join("\n");
}

// Reads the pre-push ref lines: "<local ref> <local sha> <remote ref> <remote sha>".
export function parsePushRefs(input: string): { localSha: string; remoteSha: string }[] {
  const refs: { localSha: string; remoteSha: string }[] = [];
  for (const l of input.split("\n")) {
    const [, localSha, , remoteSha] = l.trim().split(/\s+/);
    if (localSha !== undefined && remoteSha !== undefined) refs.push({ localSha, remoteSha });
  }
  return refs;
}
