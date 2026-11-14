// View and theme state: the URL first, then localStorage. Storage can throw; every access is guarded.
export type Theme = "device" | "flat" | "flat-light" | "flat-dark";
export type View = "top" | "rear";
export interface AppState {
  view: View;
  theme: Theme;
}

export const THEMES: readonly Theme[] = ["device", "flat", "flat-light", "flat-dark"];
const KEY = "bcr32-panel";
const DEFAULT: AppState = { view: "top", theme: "device" };

const isTheme = (v: unknown): v is Theme => THEMES.includes(v as Theme);
const isView = (v: unknown): v is View => v === "top" || v === "rear";

export function readStored(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(KEY);
    const o = raw === null ? {} : (JSON.parse(raw) as Record<string, unknown>);
    return { ...(isView(o["view"]) ? { view: o["view"] } : {}), ...(isTheme(o["theme"]) ? { theme: o["theme"] } : {}) };
  } catch {
    return {};
  }
}

export function writeStored(s: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* storage blocked: the page works without it */
  }
}

// URL wins over storage, storage over the default.
export function initialState(search: string, stored: Partial<AppState>): AppState {
  const q = new URLSearchParams(search);
  const view = q.get("view");
  const theme = q.get("theme");
  return { view: isView(view) ? view : (stored.view ?? DEFAULT.view), theme: isTheme(theme) ? theme : (stored.theme ?? DEFAULT.theme) };
}

export function toSearch(s: AppState): string {
  return `?view=${s.view}&theme=${s.theme}`;
}
