// Glossary rule: the first use of a glossary term in a manual file must link to its entry.
import { headings, isProse, maskCode, slug, splitLines } from "./markdown.ts";
import type { Env, Finding } from "./types.ts";

export const GLOSSARY_PATH = "docs/manual/13-glossary.md";

export interface GlossaryTerm {
  slug: string;
  patterns: RegExp[];
}

const LINK = /\[([^\]]*)\]\(([^)]*)\)/g;
const ABBREVIATION = /^[A-Z0-9α-ω]{2,5}$/u;

// An abbreviation matches in its own case. Other words match in any case and may end in s or es.
function toPattern(word: string): RegExp {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const abbreviation = ABBREVIATION.test(word);
  return new RegExp(`(?<![\\p{L}\\p{N}])${escaped}${abbreviation ? "" : "(?:s|es)?"}(?![\\p{L}\\p{N}])`, abbreviation ? "gu" : "giu");
}

// Each level-3 heading is one term. "Control change (CC)" gives two forms: the words and the abbreviation.
export function glossaryTerms(text: string): GlossaryTerm[] {
  const terms: GlossaryTerm[] = [];
  for (const h of headings(splitLines(text))) {
    if (h.level !== 3) continue;
    const name = h.text.replace(/`/g, "").trim();
    const paren = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(name);
    const words = paren?.[1] !== undefined && paren[2] !== undefined ? [paren[1], paren[2]] : [name];
    terms.push({ slug: slug(h.text), patterns: words.map(toPattern) });
  }
  return terms;
}

interface Hit {
  pos: number;
  term: GlossaryTerm;
  len: number;
  linked: boolean;
  text: string;
}

export function checkGlossary(path: string, text: string, env: Env): Finding[] {
  if (!path.startsWith("docs/manual/") || path === GLOSSARY_PATH) return [];
  const glossary = env.read(GLOSSARY_PATH);
  if (glossary === undefined) return [];
  const terms = glossaryTerms(glossary);
  const done = new Set<string>();
  const findings: Finding[] = [];
  for (const l of splitLines(text)) {
    if (!isProse(l) || /^ {0,3}#{1,6}\s/.test(l.text)) continue;
    const hits: Hit[] = [];
    for (const m of l.text.matchAll(LINK)) {
      const target = /13-glossary\.md#([^\s)]+)/.exec(m[2] ?? "");
      const term = terms.find((t) => t.slug === target?.[1]);
      if (term !== undefined) hits.push({ pos: m.index ?? 0, len: m[0].length, term, linked: true, text: m[1] ?? "" });
    }
    const masked = maskCode(l.text.replace(LINK, (m) => " ".repeat(m.length)));
    for (const term of terms)
      for (const p of term.patterns) for (const m of masked.matchAll(p)) hits.push({ pos: m.index ?? 0, len: m[0].length, term, linked: false, text: m[0] });
    hits.sort((a, b) => a.pos - b.pos);
    // A match inside a longer term is not a use of the shorter term: 'page' in 'ZAQ Global page'.
    const inside = (h: Hit): boolean =>
      hits.some((g) => g.term !== h.term && g.len > h.len && g.pos <= h.pos && h.pos + h.len <= g.pos + g.len);
    for (const h of hits.filter((x) => !inside(x))) {
      if (done.has(h.term.slug)) continue;
      done.add(h.term.slug);
      if (!h.linked)
        findings.push({ path, line: l.n, rule: "glossary", message: `first use of '${h.text}' must link to 13-glossary.md#${h.term.slug}` });
    }
  }
  return findings;
}
