// Guide text: tokens like {B59} in stored captions expand to the printed legend and the ID. Pure.
import type { Element } from "@bcr32/device-data";

// Same token form as the guide check in device-data.
const TOKEN = /\{([A-Z][A-Za-z0-9]*(?:\.[a-z0-9]+)?)\}/g;
// A brace piece that is left after the valid tokens are removed: "{b59}", "{B59", "B59}" or "{}".
const STRAY = /\{[^{}\s]*\}?|[^{}\s]*\}/g;

type Legendary = Pick<Element, "id" | "labels" | "panelNumber">;

// The printed legend: the number printed at the control, then the label on or below it.
// An element with no printed legend gives "".
export function legendOf(el: Legendary): string {
  const label = el.labels.find((l) => l.placement === "on") ?? el.labels.find((l) => l.placement === "below");
  return [el.panelNumber === undefined ? "" : String(el.panelNumber), label?.text ?? ""].filter((s) => s !== "").join(" ");
}

// Element IDs named by tokens, in order.
export function tokensOf(text: string): string[] {
  return [...text.matchAll(TOKEN)].map((m) => m[1]!);
}

// The text with each valid token cut out. A token counts as one word for the length rules.
export function withoutTokens(text: string, replacement = " "): string {
  return text.replace(TOKEN, replacement);
}

// Malformed brace pieces.
export function strayBraces(text: string): string[] {
  return [...withoutTokens(text).matchAll(STRAY)].map((m) => m[0]);
}

// "Hold {B59}" gives "Hold EDIT (B59)". With no printed legend, or no element, the ID stays alone.
export function expandTokens(text: string, elements: readonly Legendary[]): string {
  const byId = new Map(elements.map((e) => [e.id, e]));
  return text.replace(TOKEN, (_, id: string) => {
    const el = byId.get(id);
    const legend = el === undefined ? "" : legendOf(el);
    return legend === "" ? id : `${legend} (${id})`;
  });
}
