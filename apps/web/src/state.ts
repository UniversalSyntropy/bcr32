import { DEFAULT_LAYERS, LAYERS, type LayerId } from "@bcr32/panel";

// View, theme and layer state: the URL first, then localStorage. Storage can throw; every access is guarded.
export type Theme = "device" | "flat" | "flat-light" | "flat-dark";
export type View = "top" | "rear";
export interface AppState {
  view: View;
  theme: Theme;
  layers: LayerId[]; // label layers that are on, in the fixed order of LAYERS
  engine: EngineKind; // URL only: ?engine=demo
  sound: boolean; // click sounds; off by default
}
export type EngineKind = "static" | "demo";

export const THEMES: readonly Theme[] = ["device", "flat", "flat-light", "flat-dark"];
const KEY = "bcr32-panel";
const DEFAULT: AppState = { view: "top", theme: "device", layers: [...DEFAULT_LAYERS], engine: "static", sound: false };

// "printed,id" to layers in fixed order; unknown names are dropped; "none" is the empty list.
export function parseLayers(v: unknown): LayerId[] | undefined {
  if (typeof v !== "string") return undefined;
  if (v === "none") return [];
  const names = v.split(",");
  const on = LAYERS.filter((l) => names.includes(l));
  return on.length > 0 ? on : undefined;
}

const isTheme = (v: unknown): v is Theme => THEMES.includes(v as Theme);
const isView = (v: unknown): v is View => v === "top" || v === "rear";

export function readStored(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(KEY);
    const o = raw === null ? {} : (JSON.parse(raw) as Record<string, unknown>);
    return { ...(isView(o["view"]) ? { view: o["view"] } : {}), ...(isTheme(o["theme"]) ? { theme: o["theme"] } : {}), ...(o["sound"] === true ? { sound: true } : {}), ...(Array.isArray(o["layers"]) ? { layers: LAYERS.filter((l) => (o["layers"] as unknown[]).includes(l)) } : {}) };
  } catch {
    return {};
  }
}

export function writeStored(s: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ view: s.view, theme: s.theme, layers: s.layers, sound: s.sound }));
  } catch {
    /* storage blocked: the page works without it */
  }
}

// URL wins over storage, storage over the default.
export function initialState(search: string, stored: Partial<AppState>): AppState {
  const q = new URLSearchParams(search);
  const view = q.get("view");
  const theme = q.get("theme");
  return {
    view: isView(view) ? view : (stored.view ?? DEFAULT.view),
    theme: isTheme(theme) ? theme : (stored.theme ?? DEFAULT.theme),
    layers: parseLayers(q.get("layers")) ?? stored.layers ?? DEFAULT.layers,
    engine: q.get("engine") === "demo" ? "demo" : "static",
    sound: q.has("sound") ? q.get("sound") === "1" : (stored.sound ?? false),
  };
}

export function toSearch(s: AppState): string {
  return `?view=${s.view}&theme=${s.theme}&layers=${s.layers.length === 0 ? "none" : s.layers.join(",")}${s.engine === "demo" ? "&engine=demo" : ""}${s.sound ? "&sound=1" : ""}`;
}
