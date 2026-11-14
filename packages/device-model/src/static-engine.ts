// StaticEngine: one fixed PanelView. A turn moves a known ring value, a press and
// a release set and clear `pressed`. No mode logic. Pure reducer plus a thin store.
import type { ControlEvent, Engine, PanelView } from "./view.ts";

export function reduceStatic(view: PanelView, e: ControlEvent): PanelView {
  if (e.type !== "turn") {
    const held = view.pressed.includes(e.id);
    if (e.type === "press") return held ? view : { ...view, pressed: [...view.pressed, e.id] };
    return held ? { ...view, pressed: view.pressed.filter((id) => id !== e.id) } : view;
  }
  const ring = view.rings[e.id];
  if (ring === undefined || !ring.known || ring.value === null) return view; // never invent a value
  const lo = Math.min(ring.min, ring.max);
  const hi = Math.max(ring.min, ring.max);
  const value = Math.min(Math.max(ring.value + e.steps, lo), hi);
  return value === ring.value ? view : { ...view, rings: { ...view.rings, [e.id]: { ...ring, value } } };
}

export function staticEngine(initial: PanelView): Engine {
  let view = initial;
  const listeners = new Set<() => void>();
  return {
    dispatch(e) {
      const next = reduceStatic(view, e);
      if (next === view) return;
      view = next;
      for (const fn of [...listeners]) fn();
    },
    getView: () => view,
    subscribe(fn) {
      listeners.add(fn);
      return () => void listeners.delete(fn);
    },
  };
}
