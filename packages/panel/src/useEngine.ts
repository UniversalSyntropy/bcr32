// Store hook (D20): the panel reads the engine through useSyncExternalStore. No other state library.
import type { Engine, PanelView } from "@bcr32/device-model";
import { useSyncExternalStore } from "react";

export function useEngine(engine: Engine): PanelView {
  return useSyncExternalStore(engine.subscribe, engine.getView);
}
