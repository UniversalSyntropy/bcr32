// The guide player: the panel zoomed to the focus of one step, and a card with the text and the buttons.
// The state is in the guide engine (device-model). This file only draws it and feeds it ticks.
import type { GuideFile } from "@bcr32/device-data";
import { demoEngine, expandTokens, guideEngine, parseSteps, type Engine, type GuideEngine } from "@bcr32/device-model";
import { buildLayout, cuesOf, DevPanel, focusViewBox, Panel, type LayerId, type PanelData, type ViewBox } from "@bcr32/panel";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { startClock } from "./clock.ts";
import { demoData } from "./data.ts";
import { fixture } from "./fixture.ts";

const ZOOM_MS = 250;

// The guide engine and the inner demo engine. The factory lets back() and restart() reset the panel.
export function makeGuide(guide: GuideFile, startStep: number): { engine: GuideEngine; inner: { current: Engine } } {
  const inner = { current: demoEngine(demoData, { rings: fixture.rings }) };
  const engine = guideEngine(
    guide,
    () => (inner.current = demoEngine(demoData, { rings: fixture.rings })),
    { elements: demoData.elements, timing: demoData.timing },
  );
  // Deep link: apply the steps before `startStep` as if the person had done them.
  for (let guard = 0; guard < 200 && engine.getStep().phase !== "done" && engine.getStep().index < startStep - 1; guard++) engine.next();
  return { engine, inner };
}

function useStep(engine: GuideEngine) {
  const key = useSyncExternalStore(
    engine.subscribe,
    () => {
      const s = engine.getStep();
      return `${s.index}|${s.phase}|${s.hint ?? ""}|${s.held.join(",")}|${engine.getLog().length}`;
    },
  );
  void key;
  return engine.getStep();
}

// The window of the panel. A reduced-motion setting makes it jump; otherwise it moves in a short tween.
function useZoom(target: ViewBox, reduced: boolean): ViewBox {
  const [vb, setVb] = useState<ViewBox>(target);
  const from = useRef<ViewBox>(target);
  const tkey = target.join(" ");
  useEffect(() => {
    if (reduced) {
      from.current = target;
      setVb(target);
      return;
    }
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ZOOM_MS);
      const e = k * (2 - k);
      const cur = start.map((v, i) => v + (target[i]! - v) * e) as ViewBox;
      from.current = cur;
      setVb(cur);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tkey, reduced]);
  return reduced ? target : vb;
}

function useReducedMotion(): boolean {
  const q = "(prefers-reduced-motion: reduce)";
  const [on, setOn] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const fn = () => setOn(m.matches);
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  return on;
}

const HINT: Record<string, string> = {
  "wrong-control": "That is not the control in this step. Use the marked control.",
  "wrong-direction": "Turn the other way.",
  "hold-longer": "Keep the control down for longer.",
};

export interface GuidePlayerProps {
  guide: GuideFile;
  engine: GuideEngine;
  inner: { current: Engine };
  data: PanelData;
  view: "top" | "rear";
  layers: ReadonlySet<LayerId>;
  dev: boolean;
  sound?: (kind: "button" | "knob", phase: "down" | "up") => void;
  onStep: (n: number) => void; // 1-based
}

export function GuidePlayer({ guide, engine, inner, data, view, layers, dev, sound, onStep }: GuidePlayerProps) {
  const step = useStep(engine);
  const reduced = useReducedMotion();
  const parsed = useMemo(() => parseSteps(guide, { elements: demoData.elements, timing: demoData.timing }), [guide]);
  const gstep = guide.steps[step.index]!;
  const layout = useMemo(() => buildLayout(data.geometry, data.elements, view, data.groupNames), [data, view]);
  const target = useMemo(() => focusViewBox(layout, gstep.focus), [layout, gstep]);
  const vb = useZoom(target, reduced);
  const cues = useMemo(() => (step.phase === "cue" ? cuesOf(parsed[step.index]!.action, demoData.timing.holdMs) : []), [parsed, step.index, step.phase]);
  const total = guide.steps.length;
  const text = (m: { en: string }) => expandTokens(m.en, data.elements);
  const done = step.phase === "done";
  const [live, setLive] = useState("");

  // The clock reads the inner demo engine for held controls, so a guide `held` mark does not keep it running.
  useEffect(() => {
    const clockEngine: Engine = { dispatch: engine.dispatch, subscribe: engine.subscribe, getView: () => inner.current.getView() };
    return startClock(clockEngine);
  }, [engine, inner]);

  useEffect(() => {
    onStep(Math.min(step.index + 1, total));
  }, [step.index, total, onStep]);

  // New step: say it, and move focus to its first control. After the result: say the expect text.
  const lastIndex = useRef(-1);
  useEffect(() => {
    if (step.phase === "cue" && lastIndex.current !== step.index) {
      lastIndex.current = step.index;
      setLive(`Step ${step.index + 1} of ${total}. ${text(gstep.caption)}${gstep.warn === undefined ? "" : ` Warning: ${text(gstep.warn)}`}`);
      document.querySelector<HTMLElement>(`.ctl[data-id="${gstep.focus[0]}"]`)?.focus({ preventScroll: true });
    } else if (step.phase === "result" && gstep.expect !== undefined) setLive(text(gstep.expect));
    else if (done) setLive("The guide is finished.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.index, step.phase]);

  const src = gstep.source;
  const banner =
    src?.source === "unit"
      ? `This step: tested on a unit, firmware ${src.firmware ?? guide.firmware}.`
      : guide.status === "unverified"
        ? `Unverified: not tested on a unit. Firmware ${guide.firmware}.`
        : `Verified on a unit, firmware ${guide.firmware}.`;
  const gaps = engine.getLog();
  const idx = done ? total : step.index + 1;

  return (
    <div className="guide-layout" data-guide={guide.id} data-step={idx} data-phase={step.phase} data-target-vb={target.map((v) => v.toFixed(2)).join(" ")}>
      <div className="guide-panel">
        <Panel data={data} engine={engine} view={view} viewBox={vb} layers={layers} dev={dev} guide={{ focus: done ? [] : gstep.focus, cues }} {...(sound === undefined ? {} : { onSound: sound })} />
      </div>
      <section className="guide-card" aria-labelledby="guide-title">
        <h2 id="guide-title">{text(guide.title)}</h2>
        <p className="guide-banner" data-status={guide.status}>{banner}</p>
        <p className="guide-progress">{done ? `Done: ${total} of ${total} steps` : `Step ${idx} of ${total}`}</p>
        {done ? (
          <p className="guide-caption">The guide is finished. Press Restart to do it again.</p>
        ) : (
          <>
            {gstep.warn === undefined ? null : <p className="guide-warn"><strong>Warning:</strong> {text(gstep.warn)}</p>}
            <p className="guide-caption">{text(gstep.caption)}</p>
            {step.phase === "result" && gstep.expect !== undefined ? <p className="guide-expect">{text(gstep.expect)}</p> : null}
          </>
        )}
        <p className="guide-hint" role="status" data-hint={step.hint ?? undefined}>{step.hint === undefined ? "" : HINT[step.hint]}</p>
        <div className="guide-buttons">
          <button type="button" onClick={() => engine.back()} disabled={step.index === 0 && step.phase === "cue"}>Back</button>
          {step.phase === "cue" && gstep.advance === "on-action" ? <button type="button" onClick={() => engine.next()}>Show me</button> : null}
          {!done && (step.phase === "result" || gstep.advance === "manual") ? <button type="button" onClick={() => engine.next()}>Next step</button> : null}
          <button type="button" onClick={() => engine.restart()}>Restart</button>
        </div>
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true" data-guide-live="true">{live}</div>
      </section>
      {dev ? (
        <details className="dev-panel guide-dev" open data-guide-dev="true">
          <summary>Guide (developer)</summary>
          <table>
            <caption className="sr-only">Steps of this guide</caption>
            <thead>
              <tr><th scope="col">Step</th><th scope="col">Action</th><th scope="col">Focus</th><th scope="col">Go to</th></tr>
            </thead>
            <tbody>
              {guide.steps.map((s, n) => (
                <tr key={s.id} data-row={s.id}>
                  <td>{n + 1} {s.id}</td>
                  <td>{s.action ?? "none"}</td>
                  <td>{s.focus.join(" ")}</td>
                  <td><button type="button" data-step-goto={n + 1} aria-label={`Go to step ${n + 1}`} onClick={() => goTo(engine, n)}>Go to</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>Engine against after patch ({gaps.length}):</p>
          <ul data-guide-log="true">
            {gaps.map((g, n) => (
              <li key={n}>{g.step}: {g.field}, engine {JSON.stringify(g.engine)}, patch {JSON.stringify(g.patch)}</li>
            ))}
          </ul>
        </details>
      ) : null}
      {dev ? <DevPanel geometry={data.geometry} engine={engine} /> : null}
    </div>
  );
}

// Dev only: go to the cue of step n (0-based) by a rebuild and a replay of the steps before it.
function goTo(engine: GuideEngine, n: number) {
  engine.restart();
  for (let guard = 0; guard < 200 && engine.getStep().index < n && engine.getStep().phase !== "done"; guard++) engine.next();
}
