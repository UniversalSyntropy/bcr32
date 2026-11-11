// Link rule (target exists) and anchor rule (heading exists in the target).
import { posix } from "node:path";

import { anchors, isProse, maskCode, splitLines } from "./markdown.ts";
import type { Env, Finding } from "./types.ts";

const INLINE = /!?\[[^\]]*\]\(\s*(<[^>]*>|[^)\s]*)(?:\s+"[^"]*")?\s*\)/g;
const DEFINITION = /^ {0,3}\[[^\]]+\]:\s*(\S+)/;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

export function extractTargets(line: string): string[] {
  const masked = maskCode(line);
  const targets = [...masked.matchAll(INLINE)].map((m) => (m[1] as string).replace(/^<|>$/g, ""));
  const def = DEFINITION.exec(masked);
  if (def?.[1] !== undefined) targets.push(def[1].replace(/^<|>$/g, ""));
  return targets;
}

function decode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

export function checkLinks(path: string, text: string, env: Env): Finding[] {
  const findings: Finding[] = [];
  const lines = splitLines(text);
  const ownAnchors = anchors(lines);
  for (const l of lines) {
    if (!isProse(l)) continue;
    for (const target of extractTargets(l.text)) {
      if (target === "" || SCHEME.test(target)) continue; // http, https, mailto and other schemes are not checked
      const hash = target.indexOf("#");
      const rawPath = (hash === -1 ? target : target.slice(0, hash)).replace(/\?.*$/, "");
      const fragment = hash === -1 ? undefined : decode(target.slice(hash + 1)).toLowerCase();
      let targetPath = path;
      let targetAnchors = ownAnchors;
      if (rawPath !== "") {
        const joined = rawPath.startsWith("/") ? rawPath.slice(1) : posix.join(posix.dirname(path), decode(rawPath));
        targetPath = posix.normalize(joined);
        if (targetPath.startsWith("..")) {
          findings.push({ path, line: l.n, rule: "link", message: `link '${target}' leaves the repository` });
          continue;
        }
        if (!env.exists(targetPath.replace(/\/$/, ""))) {
          findings.push({ path, line: l.n, rule: "link", message: `link target '${rawPath}' does not exist` });
          continue;
        }
        const body = targetPath.endsWith(".md") ? env.read(targetPath) : undefined;
        if (body === undefined) continue; // folders and other file types have no heading anchors to check
        targetAnchors = anchors(splitLines(body));
      }
      if (fragment !== undefined && fragment !== "" && !targetAnchors.has(fragment))
        findings.push({
          path,
          line: l.n,
          rule: "anchor",
          message: `no heading matches '#${fragment}' in ${rawPath === "" ? "this file" : targetPath}`,
        });
    }
  }
  return findings;
}
