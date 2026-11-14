import { demoEngine, pathTo, staticEngine, type Engine } from "@bcr32/device-model";
import { buildLayout, createClicker, DevPanel, groupViewBox, LAYERS, LayerToggles, Panel } from "@bcr32/panel";
import { useEffect, useMemo, useState } from "react";

import { startClock } from "./clock.ts";
import { data, demoData } from "./data.ts";
import { DemoDev } from "./DemoDev.tsx";
import { fixture } from "./fixture.ts";
import { initialState, readStored, THEMES, toSearch, writeStored, type AppState, type EngineKind, type Theme } from "./state.ts";
import { useEngine } from "@bcr32/panel";

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

// Names the mode in a polite live region, so a mode change is read once.
function ModeReadout({ engine }: { engine: Engine }) {
  const mode = useEngine(engine).mode;
  const name = demoData.modes.find((m) => m.id === mode)?.name ?? mode;
  return (
    <p className="mode-readout" role="status" data-mode={mode}>
      Mode: {name}
    </p>
  );
}

export function App() {
  const [state, setState] = useState<AppState>(() => initialState(location.search, readStored()));
  const [showTitle, setShowTitle] = useState(true);
  const [group, setGroup] = useState<string | null>(null);
  const [reset, setReset] = useState<{ n: number; goto: string | null }>({ n: 0, goto: null });
  const engine = useMemo<Engine>(() => {
    if (state.engine === "static") return staticEngine(fixture);
    const initial = { rings: fixture.rings };
    const e = demoEngine(demoData, initial);
    // "Go to": a new engine that replays the shortest event list from the base.
    if (reset.goto !== null) for (const ev of pathTo(reset.goto, demoData, initial) ?? []) e.dispatch(ev);
    return e;
  }, [state.engine, reset]);
  const clicker = useMemo(() => createClicker(), []); // makes no AudioContext until its first click
  useEffect(() => (state.engine === "demo" ? startClock(engine) : undefined), [engine, state.engine]);
  const dev = useMemo(() => new URLSearchParams(location.search).get("dev") === "1", []);
  const layers = useMemo(() => new Set(state.layers), [state.layers]);
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
      history.replaceState(null, "", toSearch(state) + (dev ? "&dev=1" : ""));
    } catch {
      /* some embeds block history */
    }
  }, [state, dev]);

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
        <label>
          Engine{" "}
          <select value={state.engine} onChange={(e) => setState({ ...state, engine: e.target.value as EngineKind })}>
            <option value="static">Static fixture</option>
            <option value="demo">Demo (mode logic)</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={state.sound} onChange={(e) => setState({ ...state, sound: e.target.checked })} /> Click sounds (off by default)
        </label>
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
        <LayerToggles on={layers} onChange={(next) => setState({ ...state, layers: LAYERS.filter((l) => next.has(l)) })} />
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
      {state.engine === "demo" ? <ModeReadout engine={engine} /> : null}
      <div>
        <Panel data={data} engine={engine} {...(state.sound ? { onSound: clicker.click } : {})} view={state.view} {...(zoom === undefined ? {} : { viewBox: zoom })} only={zoom === undefined ? null : current} layers={layers} dev={dev} />
      </div>
      {dev ? <DevPanel geometry={data.geometry} engine={engine} /> : null}
      {dev && state.engine === "demo" ? <DemoDev data={demoData} onGo={(goto) => setReset((r) => ({ n: r.n + 1, goto }))} /> : null}
      <ul className="facts">
        {state.engine === "demo" ? (
          <>
            <li>Demo: the mode logic comes from the data. A light that the data does not state is drawn as unknown.</li>
            <li>Three knobs show a fixture value. The other knobs and the display are unknown.</li>
          </>
        ) : (
          <>
            <li>Fixture: not a unit state</li>
            <li>Mode of the fixture: ctrl. Three knobs show a value. The other knobs and the display are unknown.</li>
          </>
        )}
      </ul>
    </main>
  );
}
