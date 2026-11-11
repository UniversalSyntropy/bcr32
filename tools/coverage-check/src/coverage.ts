// Coverage rules. Data and document text in, findings out. No file access here.
import type { DeviceData } from "@bcr32/device-data";
import { anchors, isProse, splitLines } from "@bcr32/docs-check";

export interface Finding {
  where: string; // section map item ID, element ID or extract
  rule: "anchor" | "element" | "page" | "extract";
  message: string;
}

export interface Docs {
  read(path: string): string | undefined; // text of a repo file, or undefined when it is missing
  manualDocs: string[]; // documents that count for element coverage
}

// Each anchor of each section map item must name a heading that exists.
export function checkAnchors(data: DeviceData, docs: Docs): Finding[] {
  const findings: Finding[] = [];
  const cache = new Map<string, Set<string> | undefined>();
  for (const item of data.sectionMap)
    for (const anchor of item.anchors ?? []) {
      const [path, fragment] = anchor.split("#") as [string, string];
      if (!cache.has(path)) {
        const text = docs.read(path);
        cache.set(path, text === undefined ? undefined : anchors(splitLines(text)));
      }
      const found = cache.get(path);
      if (found === undefined) findings.push({ where: item.id, rule: "anchor", message: `document '${path}' does not exist` });
      else if (!found.has(fragment)) findings.push({ where: item.id, rule: "anchor", message: `'${path}' has no heading '#${fragment}'` });
    }
  return findings;
}

// Each element ID must appear in one manual document or more. L2 covers L2.in, L2.a and L2.b.
export function checkElements(data: DeviceData, docs: Docs): Finding[] {
  const tokens = new Set<string>();
  for (const path of docs.manualDocs)
    for (const l of splitLines(docs.read(path) ?? ""))
      if (isProse(l)) for (const m of l.text.matchAll(/(?<!\w)(?:[A-Z]+\d+(?:\.\w+)?|[A-Z]{2,})(?!\w)/g)) tokens.add(m[0]);
  // A range such as B5–B20 or E25–E56 covers the IDs between its ends.
  for (const path of docs.manualDocs)
    for (const m of (docs.read(path) ?? "").matchAll(/(?<!\w)([A-Z])(\d+)–\1?(\d+)(?!\w)/g))
      for (let n = Number(m[2]); n <= Number(m[3]); n++) tokens.add(`${m[1]}${n}`);
  return data.elements
    .filter((e) => !tokens.has(e.id) && !tokens.has(e.id.split(".")[0]!))
    .map((e) => ({ where: e.id, rule: "element" as const, message: `no manual document names element '${e.id}' (callout ${e.callout})` }));
}

// The section map must cover each two-page spread of the manual's page range.
export function checkPages(data: DeviceData, firstPage: number, lastPage: number): Finding[] {
  const pages = new Set(data.sectionMap.map((i) => i.page));
  const findings: Finding[] = [];
  for (let p = firstPage; p <= lastPage; p += 2)
    if (!pages.has(p)) findings.push({ where: `page ${p}`, rule: "page", message: `the section map has no item for the spread that starts on page ${p}` });
  return findings;
}

const squash = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();

// Local check, only when the extract of the official manual is present: each title that the map
// quotes must be in the extract. Items with a note hold a description, not a quoted title.
export function checkExtract(data: DeviceData, extract: string): Finding[] {
  const text = ` ${squash(extract)} `;
  return data.sectionMap
    .filter((i) => i.note === undefined || !i.note.includes("The title is a description"))
    .filter((i) => !i.title.split(/[,;] /).every((part) => text.includes(` ${squash(part)} `)))
    .map((i) => ({ where: i.id, rule: "extract" as const, message: `the extract of the official manual does not hold the title '${i.title}'` }));
}
