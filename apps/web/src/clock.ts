// The clock of the demo (D69). The model has no timer; this wrapper sends a tick while a control is held.
import type { Engine } from "@bcr32/device-model";

export const TICK_MS = 100;

// Starts a timer on the first press and stops it when nothing is held. No timer while idle.
export function startClock(engine: Engine): () => void {
  let timer: ReturnType<typeof setInterval> | undefined;
  const sync = () => {
    const held = engine.getView().pressed.length > 0;
    if (held && timer === undefined) timer = setInterval(() => engine.dispatch({ type: "tick", t: Math.round(performance.now()) }), TICK_MS);
    else if (!held && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
  const off = engine.subscribe(sync);
  sync();
  return () => {
    off();
    if (timer !== undefined) clearInterval(timer);
  };
}
