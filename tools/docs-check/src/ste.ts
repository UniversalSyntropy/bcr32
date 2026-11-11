// Simplified Technical English rules: no contractions and a sentence length limit.
// Both rules skip front matter, fenced code and code spans. The length rule also skips tables and headings.
import { isProse, maskCode, splitLines, type Line } from "./markdown.ts";
import type { Finding } from "./types.ts";

export const STEP_LIMIT = 20;
export const PROSE_LIMIT = 25;

const CONTRACTION =
  /\b\w+n['’]t\b|\b\w+['’](?:re|ve|ll)\b|\b(?:it|that|there|here|what|let|who)['’]s\b/gi;

function stripLinks(text: string): string {
  return text
    .replace(/<https?:[^>]*>/g, "URL")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<\/?[A-Za-z][^>]*>/g, "");
}

export function checkContractions(path: string, text: string): Finding[] {
  const findings: Finding[] = [];
  for (const l of splitLines(text)) {
    if (!isProse(l)) continue;
    const plain = stripLinks(maskCode(l.text));
    for (const m of plain.matchAll(CONTRACTION))
      findings.push({ path, line: l.n, rule: "ste-contraction", message: `contraction '${m[0]}'; write the full words` });
  }
  return findings;
}

interface Unit {
  step: boolean;
  start: number;
  parts: { line: number; text: string }[];
}

const BREAK = "\u241E"; // marks a colon at the end of a source line

// Groups prose lines into units: one list item, or one paragraph, or one block quote paragraph.
function units(lines: Line[]): Unit[] {
  const out: Unit[] = [];
  let current: Unit | undefined;
  for (const l of lines) {
    if (!isProse(l)) {
      current = undefined;
      continue;
    }
    let text = l.text.replace(/^\s*(?:>\s?)+/, "");
    if (
      text.trim() === "" ||
      /^\s{0,3}#{1,6}\s/.test(text) ||
      /^\s*\|/.test(text) ||
      /^\s*([-*_]\s*){3,}$/.test(text) ||
      /^\s*</.test(text) ||
      /^\s{0,3}\[[^\]]+\]:\s/.test(text)
    ) {
      current = undefined;
      continue;
    }
    const item = /^\s*(?:([-*+])|(\d+[.)]))\s+(.*)$/.exec(text);
    if (item?.[3] !== undefined) {
      current = { step: item[2] !== undefined, start: l.n, parts: [] };
      out.push(current);
      text = item[3];
    } else if (current === undefined) {
      current = { step: false, start: l.n, parts: [] };
      out.push(current);
    }
    let clean = stripLinks(maskCode(text, "CODE")).replace(/[*]/g, "").trim();
    if (clean.endsWith(":")) clean += BREAK;
    current.parts.push({ line: l.n, text: clean });
  }
  return out;
}

const ABBREVIATION = /\b(?:e\.g|i\.e|etc|vs|approx|cf)\./gi;

export interface Sentence {
  line: number;
  words: number;
  text: string;
}

// Splits on . ? ! before a space or the end, and on a colon at the end of a line.
export function sentencesOf(unit: Unit): Sentence[] {
  const sentences: Sentence[] = [];
  let joined = "";
  const offsets: { at: number; line: number }[] = [];
  for (const p of unit.parts) {
    offsets.push({ at: joined.length, line: p.line });
    joined += `${p.text} `;
  }
  const masked = joined.replace(ABBREVIATION, (m) => m.replaceAll(".", "\u2024"));
  const re = /[.?!]["')\]]*(?=\s|$)|\u241E/g;
  let from = 0;
  const flush = (to: number): void => {
    const raw = masked.slice(from, to).replaceAll(BREAK, "").replaceAll("\u2024", ".");
    const words = raw.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
    if (words.length > 0) {
      const lead = masked.slice(from, to).search(/\S/);
      const at = from + Math.max(lead, 0);
      const line = [...offsets].reverse().find((o) => o.at <= at)?.line ?? unit.start;
      sentences.push({ line, words: words.length, text: raw.trim() });
    }
  };
  for (const m of masked.matchAll(re)) {
    flush(m.index ?? 0);
    from = (m.index ?? 0) + m[0].length;
  }
  flush(masked.length);
  return sentences;
}

export function checkSentences(path: string, text: string): Finding[] {
  const findings: Finding[] = [];
  for (const unit of units(splitLines(text))) {
    const limit = unit.step ? STEP_LIMIT : PROSE_LIMIT;
    for (const s of sentencesOf(unit))
      if (s.words > limit) {
        const head = s.text.split(/\s+/).slice(0, 6).join(" ");
        findings.push({
          path,
          line: s.line,
          rule: "ste-sentence",
          message: `${unit.step ? "step" : "sentence"} has ${s.words} words (limit ${limit}): "${head}…"`,
        });
      }
  }
  return findings;
}
