// The three added label layers (callout, id, function) and the switches for all four layers.
import type { LayerLabel } from "./labels.ts";
import { FONT_PER_CAP } from "./layout.ts";
import { LAYER_NAME, LAYERS, type LayerId } from "./labels.ts";

export function LayerText({ labels, on }: { labels: readonly LayerLabel[]; on: ReadonlySet<LayerId> }) {
  return (
    <g id="labels">
      {labels
        .filter((l) => on.has(l.layer))
        .map((l) => (
          <text key={l.key} className={`layer-label layer-${l.layer}`} data-id={l.id} data-layer={l.layer} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="central" fontSize={l.cap * FONT_PER_CAP}>
            {l.text}
          </text>
        ))}
    </g>
  );
}

export function LayerToggles({ on, onChange }: { on: ReadonlySet<LayerId>; onChange: (next: Set<LayerId>) => void }) {
  return (
    <fieldset className="layers">
      <legend>Layers</legend>
      {LAYERS.map((id) => (
        <label key={id}>
          <input
            type="checkbox"
            checked={on.has(id)}
            onChange={(e) => {
              const next = new Set(on);
              if (e.target.checked) next.add(id);
              else next.delete(id);
              onChange(next);
            }}
          />{" "}
          {LAYER_NAME[id]}
        </label>
      ))}
    </fieldset>
  );
}
