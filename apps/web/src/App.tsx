import { staticEngine } from "@bcr32/device-model";
import { buildLayout, groupViewBox, Panel } from "@bcr32/panel";
import { useEffect, useMemo, useState } from "react";

import { data } from "./data.ts";
import { fixture } from "./fixture.ts";
import { initialState, readStored, THEMES, toSearch, writeStored, type AppState, type Theme } from "./state.ts";

const THEME_LABEL: Record<Theme, string> = { device: "Device (dark)", flat: "Flat (system)", "flat-light": "Flat light", "flat-dark": "Flat dark" };
const NARROW = "(max-width: 479px)";

function useMedia(query: string): boolean {
  const [on, setOn] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const fn = () => setOn(m.matches);
    m.addEventListener("change", fn);
    fn();
    return () => m.removeEventListener("change", fn);
  }, [query]);
  return on;
}

export function App() {
  const [state, setState] = useState<AppState>(() => initialState(location.search, readStored()));
  const [showTitle, setShowTitle] = useState(true);
  const [group, setGroup] = useState<string | null>(null);
  const engine = useMemo(() => staticEngine(fixture), []);
  const narrow = useMedia(NARROW);
  const systemDark = useMedia("(prefers-color-scheme: dark)");

  const flat = state.theme.startsWith("flat");
  const scheme = state.theme === "flat-light" ? "light" : state.theme === "flat-dark" ? "dark" : flat ? (systemDark ? "dark" : "light") : "dark";
  useEffect(() => {
    document.documentElement.dataset["theme"] = flat ? "flat" : "device";
    document.documentElement.dataset["scheme"] = scheme;
  }, [flat, scheme]);
  useEffect(() => {
    writeStored(state);
    try {
      history.replaceState(null, "", toSearch(state));
    } catch {
      /* some embeds block history */
    }
  }, [state]);

  const layout = useMemo(() => buildLayout(data.geometry, data.elements, state.view, data.groupNames), [state.view]);
  const groups = layout.groups.filter((g) => g.controls.length > 0);
  const all = group === "all";
  const current = group !== null && groups.some((g) => g.id === group) ? group : (groups[0]?.id ?? null);
  const zoom = narrow && !all && current !== null ? groupViewBox(layout, current) : undefined;

  return (
    <main className="app">
      <header className="bar">
        {showTitle ? <h1>BCR32 panel</h1> : null}
        <button type="button" onClick={() => setShowTitle((v) => !v)} aria-pressed={!showTitle}>
          {showTitle ? "Hide title" : "Show title"}
        </button>
      </header>
      <div className="tools">
        <div role="group" aria-label="View" className="seg">
          {(["top", "rear"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={state.view === v} onClick={() => setState({ ...state, view: v })}>
              {v === "top" ? "Top view" : "Rear view"}
            </button>
          ))}
        </div>
        <label>
          Theme{" "}
          <select value={state.theme} onChange={(e) => setState({ ...state, theme: e.target.value as Theme })}>
            {THEMES.map((t) => (
              <option key={t} value={t}>{THEME_LABEL[t]}</option>
            ))}
          </select>
        </label>
        {narrow && groups.length > 0 ? (
          <label>
            Group{" "}
            <select value={all ? "all" : (current ?? "")} onChange={(e) => setGroup(e.target.value)}>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
              <option value="all">Whole unit (small controls)</option>
            </select>
          </label>
        ) : null}
      </div>
      <div>
        <Panel data={data} engine={engine} view={state.view} {...(zoom === undefined ? {} : { viewBox: zoom })} only={zoom === undefined ? null : current} />
      </div>
      <ul className="facts">
        <li>Fixture: not a unit state</li>
        <li>Mode of the fixture: ctrl. Three knobs show a value. The other knobs and the display are unknown.</li>
      </ul>
    </main>
  );
}
